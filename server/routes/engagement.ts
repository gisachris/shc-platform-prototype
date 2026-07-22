import { Router } from 'express';
import { getDb } from '../db';
import { authOptional, authRequired, getAuthUser, requireOrganizer, writeAudit } from '../auth';
import { mapQa, mapPoll, mapCfp } from '../mappers';
import { analyzeCfpProposal } from '../gemini';

const router = Router();

router.get('/qa/:sessionId', authOptional, async (req, res) => {
  const user = getAuthUser(req);
  const { data, error } = await getDb()
    .from('qa_questions')
    .select('*')
    .eq('session_id', req.params.sessionId)
    .order('upvotes', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map((row) => mapQa(row, user?.id)));
});

router.post('/qa', authRequired, async (req, res) => {
  const user = getAuthUser(req)!;
  const { sessionId, text, authorCompany } = req.body;
  if (!sessionId || !text) return res.status(400).json({ error: 'Session ID and text are required' });
  const row = {
    id: `qa-${Date.now()}`,
    session_id: sessionId,
    author_name: user.fullName,
    author_company: authorCompany || user.company || '',
    author_user_id: user.id,
    text,
    upvotes: 1,
    upvoted_by: [user.id],
    is_answered: false,
  };
  const { data, error } = await getDb().from('qa_questions').insert(row).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, question: mapQa(data, user.id) });
});

router.post('/qa/:id/upvote', authRequired, async (req, res) => {
  const user = getAuthUser(req)!;
  const { data: q } = await getDb().from('qa_questions').select('*').eq('id', req.params.id).maybeSingle();
  if (!q) return res.status(404).json({ error: 'Question not found' });
  const upvotedBy: string[] = q.upvoted_by || [];
  let next: string[];
  let upvotes: number;
  if (upvotedBy.includes(user.id)) {
    next = upvotedBy.filter((id) => id !== user.id);
    upvotes = Math.max(0, (q.upvotes || 0) - 1);
  } else {
    next = [...upvotedBy, user.id];
    upvotes = (q.upvotes || 0) + 1;
  }
  const { data, error } = await getDb()
    .from('qa_questions')
    .update({ upvoted_by: next, upvotes })
    .eq('id', q.id)
    .select('*')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, question: mapQa(data, user.id) });
});

router.get('/poll/:sessionId', async (req, res) => {
  const { data, error } = await getDb().from('polls').select('*').eq('session_id', req.params.sessionId).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data ? mapPoll(data) : null);
});

router.post('/poll/vote', authRequired, async (req, res) => {
  const { pollId, optionId } = req.body;
  const { data: poll } = await getDb().from('polls').select('*').eq('id', pollId).maybeSingle();
  if (!poll) return res.status(404).json({ error: 'Poll not found' });
  const options = (poll.options || []).map((o: any) =>
    o.id === optionId ? { ...o, votes: (o.votes || 0) + 1 } : o
  );
  const { data, error } = await getDb().from('polls').update({ options }).eq('id', pollId).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, poll: mapPoll(data) });
});

router.get('/cfp', authRequired, requireOrganizer, async (_req, res) => {
  const { data, error } = await getDb().from('cfp_proposals').select('*').order('submitted_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(mapCfp));
});

router.post('/cfp/:id/status', authRequired, requireOrganizer, async (req, res) => {
  const authUser = getAuthUser(req)!;
  const { status } = req.body;
  const { data, error } = await getDb()
    .from('cfp_proposals')
    .update({ status })
    .eq('id', req.params.id)
    .select('*')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  await writeAudit({
    action: 'CFP Proposal Status Updated',
    actor: `${authUser.fullName} (${authUser.role})`,
    target: data.title,
    category: 'session',
    details: `Status changed to ${status}`,
  });
  res.json({ success: true, proposal: mapCfp(data) });
});

router.post('/cfp', async (req, res) => {
  const {
    speakerName,
    speakerEmail,
    speakerCompany,
    speakerBio,
    title,
    abstract,
    targetTrack,
    level,
    conferenceId,
  } = req.body;

  if (!title || !abstract) {
    return res.status(400).json({ error: 'Title and abstract are required' });
  }

  let conferenceName = 'Smart Hybrid Conference — Rwanda Convention Bureau';
  if (conferenceId) {
    const { data: conf } = await getDb().from('conferences').select('title').eq('id', conferenceId).maybeSingle();
    if (conf?.title) conferenceName = conf.title;
  }

  const ai = await analyzeCfpProposal({
    title,
    abstract,
    targetTrack,
    level,
    conferenceName,
  });

  const row = {
    id: `cfp-${Date.now()}`,
    conference_id: conferenceId || null,
    speaker_name: speakerName || 'Anonymous Proposal',
    speaker_email: speakerEmail || '',
    speaker_company: speakerCompany || '',
    speaker_bio: speakerBio || '',
    title,
    abstract,
    target_track: targetTrack || 'Web Development',
    level: level || 'All Levels',
    status: 'pending',
    ai_analysis: ai.status === 'ok' ? ai.analysis : null,
    ai_status: ai.status,
  };

  const { data, error } = await getDb().from('cfp_proposals').insert(row).select('*').single();
  if (error) return res.status(500).json({ error: error.message });

  res.json({
    success: true,
    proposal: mapCfp(data),
    aiStatus: ai.status,
    aiError: ai.status === 'error' ? ai.message : undefined,
  });
});

export default router;
