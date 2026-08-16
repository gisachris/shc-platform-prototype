/**
 * Event and registration API routes.
 *
 * This router handles sessions, speakers, attendees, and check-in logic for the conference.
 * It is one of the main connectors between the front-end scheduling and admin screens and the
 * Supabase database.
 */

import { Router } from 'express';
import { getDb } from '../db';
import { authRequired, getAuthUser, isOrganizer, requireOrganizer, writeAudit } from '../auth';
import { mapSession, mapSpeaker, mapAttendee } from '../mappers';
import { newTicketId } from '../auth';
import { Session, Speaker } from '../../src/types';

const router = Router();

router.get('/sessions', async (req, res) => {
  const { day, track, speakerId, conferenceId } = req.query;
  let q = getDb().from('sessions').select('*');
  if (conferenceId) q = q.eq('conference_id', String(conferenceId));
  if (day) q = q.eq('day', Number(day));
  if (track) q = q.eq('track', String(track));
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  let result = (data || []).map(mapSession);
  if (speakerId) {
    result = result.filter((s) => s.speakerIds.includes(String(speakerId)));
  }
  res.json(result);
});

router.post('/sessions', authRequired, async (req, res) => {
  const authUser = getAuthUser(req)!;
  const sessionData: Partial<Session> & { conferenceId?: string } = req.body;
  const db = getDb();

  if (sessionData.id) {
    const { data: existing } = await db.from('sessions').select('*').eq('id', sessionData.id).maybeSingle();
    if (!existing) return res.status(404).json({ error: 'Session not found' });

    const isAssignedSpeaker =
      authUser.role === 'speaker' &&
      ((existing.speaker_ids || []).includes(authUser.id) ||
        authUser.assignedSessionIds?.includes(existing.id));

    if (!isOrganizer(authUser) && !isAssignedSpeaker) {
      return res.status(403).json({ error: 'Unauthorized to update this session' });
    }

    const patch: any = {};
    if (sessionData.title != null) patch.title = sessionData.title;
    if (sessionData.description != null) patch.description = sessionData.description;
    if (sessionData.day != null) patch.day = sessionData.day;
    if (sessionData.startTime != null) patch.start_time = sessionData.startTime;
    if (sessionData.endTime != null) patch.end_time = sessionData.endTime;
    if (sessionData.startMinutes != null) patch.start_minutes = sessionData.startMinutes;
    if (sessionData.endMinutes != null) patch.end_minutes = sessionData.endMinutes;
    if (sessionData.track != null) patch.track = sessionData.track;
    if (sessionData.room != null) patch.room = sessionData.room;
    if (sessionData.capacity != null) patch.capacity = sessionData.capacity;
    if (sessionData.speakerIds != null) patch.speaker_ids = sessionData.speakerIds;
    if (sessionData.level != null) patch.level = sessionData.level;
    if (sessionData.tags != null) patch.tags = sessionData.tags;

    const { data, error } = await db.from('sessions').update(patch).eq('id', sessionData.id).select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    await writeAudit({
      action: 'Session Updated',
      actor: `${authUser.fullName} (${authUser.role})`,
      target: data.title,
      category: 'session',
    });
    return res.json({ success: true, session: mapSession(data) });
  }

  if (!isOrganizer(authUser)) {
    return res.status(403).json({ error: 'Only organizers can create sessions' });
  }

  const row = {
    id: `ses-${Date.now()}`,
    conference_id: sessionData.conferenceId || null,
    title: sessionData.title || 'Untitled Session',
    description: sessionData.description || '',
    day: sessionData.day || 1,
    start_time: sessionData.startTime || '09:00 AM',
    end_time: sessionData.endTime || '10:00 AM',
    start_minutes: sessionData.startMinutes || 540,
    end_minutes: sessionData.endMinutes || 600,
    track: sessionData.track || 'Web Development',
    room: sessionData.room || 'Main Ballroom',
    capacity: sessionData.capacity || 100,
    registered_count: 0,
    speaker_ids: sessionData.speakerIds || [],
    level: sessionData.level || 'All Levels',
    tags: sessionData.tags || ['New'],
  };
  const { data, error } = await db.from('sessions').insert(row).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  await writeAudit({
    action: 'New Session Created',
    actor: `${authUser.fullName} (${authUser.role})`,
    target: row.title,
    category: 'session',
  });
  res.json({ success: true, session: mapSession(data) });
});

router.delete('/sessions/:id', authRequired, requireOrganizer, async (req, res) => {
  const authUser = getAuthUser(req)!;
  const { id } = req.params;
  await getDb().from('sessions').delete().eq('id', id);
  await writeAudit({
    action: 'Session Deleted',
    actor: `${authUser.fullName} (${authUser.role})`,
    target: `Session ${id}`,
    category: 'session',
  });
  res.json({ success: true });
});

router.get('/speakers', async (_req, res) => {
  const { data, error } = await getDb().from('speakers').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(mapSpeaker));
});

router.post('/speakers', authRequired, async (req, res) => {
  const authUser = getAuthUser(req)!;
  const speakerData: Partial<Speaker> = req.body;
  const db = getDb();

  if (speakerData.id) {
    const { data: existing } = await db.from('speakers').select('*').eq('id', speakerData.id).maybeSingle();
    if (!existing) return res.status(404).json({ error: 'Speaker not found' });
    const isSelf =
      authUser.id === speakerData.id ||
      authUser.email.toLowerCase() === (existing.email || '').toLowerCase();
    if (!isOrganizer(authUser) && !isSelf) {
      return res.status(403).json({ error: 'You can only edit your own speaker profile' });
    }
    const patch: any = {};
    if (speakerData.name != null) patch.name = speakerData.name;
    if (speakerData.role != null) patch.role = speakerData.role;
    if (speakerData.company != null) patch.company = speakerData.company;
    if (speakerData.bio != null) patch.bio = speakerData.bio;
    if (speakerData.avatar != null) patch.avatar = speakerData.avatar;
    if (speakerData.email != null) patch.email = speakerData.email;
    if (speakerData.location != null) patch.location = speakerData.location;
    if (speakerData.socials != null) patch.socials = speakerData.socials;
    if (speakerData.topics != null) patch.topics = speakerData.topics;
    const { data, error } = await db.from('speakers').update(patch).eq('id', speakerData.id).select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, speaker: mapSpeaker(data) });
  }

  if (!isOrganizer(authUser)) {
    return res.status(403).json({ error: 'Only organizers can add speakers' });
  }

  const row = {
    id: `spk-${Date.now()}`,
    name: speakerData.name || 'New Speaker',
    role: speakerData.role || 'Presenter',
    company: speakerData.company || '',
    bio: speakerData.bio || '',
    avatar: speakerData.avatar || '',
    email: speakerData.email || '',
    location: speakerData.location || 'Kigali, Rwanda',
    socials: speakerData.socials || {},
    topics: speakerData.topics || [],
    rating: 5.0,
  };
  const { data, error } = await db.from('speakers').insert(row).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, speaker: mapSpeaker(data) });
});

router.get('/attendees', authRequired, requireOrganizer, async (req, res) => {
  const conferenceId = String(req.query.conferenceId || '');
  let q = getDb().from('attendees').select('*').order('registered_at', { ascending: false });
  if (conferenceId) q = q.eq('conference_id', conferenceId);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(mapAttendee));
});

router.post('/register', async (req, res) => {
  const {
    fullName,
    email,
    company,
    jobTitle,
    ticketTier,
    interests,
    dietaryPreference,
    tshirtSize,
    isNetworkingOptIn,
    bio,
    conferenceId,
    attendanceMode,
  } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ error: 'Full name and email are required.' });
  }

  const ticketId = newTicketId();
  const row = {
    id: `att-${Date.now()}`,
    conference_id: conferenceId || null,
    ticket_id: ticketId,
    ticket_tier: ticketTier || 'general',
    full_name: fullName,
    email: email.toLowerCase(),
    company: company || 'Independent',
    job_title: jobTitle || 'Attendee',
    interests: Array.isArray(interests) ? interests : ['Hybrid Conferences'],
    dietary_preference: dietaryPreference || 'None',
    tshirt_size: tshirtSize || 'L',
    is_networking_opt_in: Boolean(isNetworkingOptIn),
    is_checked_in: false,
    qr_code_data: `${ticketId}|${email.toLowerCase()}`,
    avatar: '',
    bio: bio || 'Excited to attend SHC Rwanda.',
    attendance_mode: attendanceMode || 'hybrid',
  };

  const { data, error } = await getDb().from('attendees').insert(row).select('*').single();
  if (error) return res.status(500).json({ error: error.message });

  if (conferenceId) {
    const { data: conf } = await getDb().from('conferences').select('registered_count').eq('id', conferenceId).maybeSingle();
    if (conf) {
      await getDb()
        .from('conferences')
        .update({ registered_count: (conf.registered_count || 0) + 1 })
        .eq('id', conferenceId);
    }
  }

  await getDb().from('notifications').insert({
    id: `notif-${Date.now()}`,
    title: 'New Delegate Registered',
    message: `${fullName} registered. Ticket: ${ticketId}`,
    type: 'info',
    timestamp: 'Just now',
    read: false,
  });

  res.json({ success: true, attendee: mapAttendee(data) });
});

router.post('/attendees/:id/checkin', authRequired, requireOrganizer, async (req, res) => {
  const authUser = getAuthUser(req)!;
  const { id } = req.params;
  const { data: attendee, error } = await getDb().from('attendees').select('*').eq('id', id).maybeSingle();
  if (error || !attendee) return res.status(404).json({ error: 'Attendee not found' });

  const next = !attendee.is_checked_in;
  const { data, error: updErr } = await getDb()
    .from('attendees')
    .update({ is_checked_in: next })
    .eq('id', id)
    .select('*')
    .single();
  if (updErr) return res.status(500).json({ error: updErr.message });

  await writeAudit({
    action: 'Attendee Check-In Toggled',
    actor: `${authUser.fullName} (${authUser.role})`,
    target: attendee.full_name,
    category: 'checkin',
    details: `Status set to ${next ? 'Checked In' : 'Pending'}`,
  });

  res.json({ success: true, attendee: mapAttendee(data) });
});

router.post('/attendees/checkin-by-ticket', authRequired, requireOrganizer, async (req, res) => {
  const authUser = getAuthUser(req)!;
  const ticketOrQr = String(req.body.ticketId || '').trim();
  if (!ticketOrQr) return res.status(400).json({ error: 'ticketId is required' });
  const ticketId = ticketOrQr.includes('|') ? ticketOrQr.split('|')[0] : ticketOrQr;
  const { data: attendee } = await getDb().from('attendees').select('*').eq('ticket_id', ticketId).maybeSingle();
  if (!attendee) return res.status(404).json({ error: 'Ticket not found' });
  const { data, error } = await getDb()
    .from('attendees')
    .update({ is_checked_in: true })
    .eq('id', attendee.id)
    .select('*')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  await writeAudit({
    action: 'Attendee Check-In by Ticket',
    actor: `${authUser.fullName} (${authUser.role})`,
    target: attendee.full_name,
    category: 'checkin',
    details: `Ticket ${ticketId}`,
  });
  res.json({ success: true, attendee: mapAttendee(data) });
});

export default router;
