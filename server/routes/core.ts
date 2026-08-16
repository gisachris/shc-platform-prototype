/**
 * Core API routes for auth, user management, and platform health.
 *
 * This router handles login, registration, password reset, database status checks, and user
 * account flows. It connects to the auth utilities, email service, DB layer, and the frontend
 * through the shared API client.
 */

import crypto from 'crypto';
import { Router } from 'express';
import { getDb } from '../db';
import {
  authRequired,
  findUserByEmail,
  getAuthUser,
  hashPassword,
  newTicketId,
  requireOrganizer,
  sanitizeUser,
  signToken,
  verifyPassword,
  writeAudit,
} from '../auth';
import { mapUserRow } from '../auth';
import { config, supabaseConfigured } from '../config';
import { emailjsConfigured, sendResetEmail, sendWelcomeEmail } from '../email';
import { TICKET_TIERS } from '../../src/data/initialData';

const router = Router();

router.get('/database/status', async (_req, res) => {
  if (!supabaseConfigured()) {
    return res.json({
      configured: false,
      databaseType: 'Not configured',
      counts: { users: 0, conferences: 0, speakers: 0, sessions: 0, proposals: 0 },
      timestamp: new Date().toISOString(),
    });
  }
  const db = getDb();
  const [u, c, sp, s, p] = await Promise.all([
    db.from('users').select('id', { count: 'exact', head: true }),
    db.from('conferences').select('id', { count: 'exact', head: true }),
    db.from('speakers').select('id', { count: 'exact', head: true }),
    db.from('sessions').select('id', { count: 'exact', head: true }),
    db.from('cfp_proposals').select('id', { count: 'exact', head: true }),
  ]);
  res.json({
    configured: true,
    databaseType: 'Supabase PostgreSQL',
    counts: {
      users: u.count ?? 0,
      conferences: c.count ?? 0,
      speakers: sp.count ?? 0,
      sessions: s.count ?? 0,
      proposals: p.count ?? 0,
    },
    timestamp: new Date().toISOString(),
  });
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash || ''))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = signToken(user);
    await writeAudit({
      action: 'User Logged In',
      actor: `${user.fullName} (${user.role})`,
      target: 'Auth Service',
      category: 'security',
      details: `Successful login [${user.email}]`,
    });
    res.json({ success: true, user: sanitizeUser(user, token) });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

router.post('/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, company, jobTitle } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const userId = `user-${Date.now()}`;
    const ticketId = newTicketId();
    const passwordHash = await hashPassword(password);
    const db = getDb();

    const userRow = {
      id: userId,
      email: email.toLowerCase(),
      full_name: fullName,
      role: 'attendee',
      company: company || 'Delegate',
      job_title: jobTitle || 'Conference Participant',
      avatar: '',
      ticket_tier: 'general',
      ticket_id: ticketId,
      bio: 'Registered delegate for SHC Platform Rwanda',
      password_hash: passwordHash,
      interests: [],
    };

    const { error: userErr } = await db.from('users').insert(userRow);
    if (userErr) throw userErr;

    const attendeeRow = {
      id: `att-${Date.now()}`,
      ticket_id: ticketId,
      ticket_tier: 'general',
      full_name: fullName,
      email: email.toLowerCase(),
      company: userRow.company,
      job_title: userRow.job_title,
      interests: ['Hybrid Conferences', 'Rwanda MICE'],
      dietary_preference: 'None',
      tshirt_size: 'L',
      is_networking_opt_in: true,
      is_checked_in: false,
      qr_code_data: `${ticketId}|${email.toLowerCase()}`,
      avatar: '',
      bio: userRow.bio,
      user_id: userId,
      attendance_mode: 'hybrid',
    };
    await db.from('attendees').insert(attendeeRow);

    await writeAudit({
      action: 'New Account Registered',
      actor: `${fullName} (attendee)`,
      target: 'Auth Service',
      category: 'security',
      details: `Created account for ${email}`,
    });

    let welcomeEmailSent = false;
    let welcomeEmailMessage =
      'Account created. Welcome email is not configured on this deployment.';
    if (emailjsConfigured('welcome')) {
      const mail = await sendWelcomeEmail({
        to_name: fullName,
        to_email: email.toLowerCase(),
        role: 'attendee',
      });
      welcomeEmailSent = mail.ok;
      welcomeEmailMessage = mail.ok
        ? `Welcome email sent to ${email}.`
        : `Account created, but welcome email failed: ${mail.error}`;
    }

    const user = mapUserRow(userRow);
    const token = signToken(user);
    res.json({
      success: true,
      user: sanitizeUser(user, token),
      welcomeEmailSent,
      welcomeEmailMessage,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

router.post('/auth/forgot-password', async (req, res) => {
  try {
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const genericMessage =
      'If an account exists for that email, password reset instructions have been prepared.';

    const user = await findUserByEmail(email);
    if (!user) {
      return res.json({
        success: true,
        emailConfigured: emailjsConfigured('reset'),
        message: genericMessage,
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const { error } = await getDb()
      .from('users')
      .update({ reset_token_hash: resetTokenHash, reset_token_expires: expires })
      .eq('id', user.id);
    if (error) throw error;

    const resetLink = `${config.appUrl.replace(/\/$/, '')}/?resetToken=${rawToken}`;
    let emailSent = false;
    let emailError: string | undefined;

    if (emailjsConfigured('reset')) {
      const mail = await sendResetEmail({
        to_name: user.fullName,
        to_email: user.email,
        reset_link: resetLink,
        reset_token: rawToken,
      });
      emailSent = mail.ok;
      if (!mail.ok) emailError = mail.error;
    }

    await writeAudit({
      action: 'Password Reset Requested',
      actor: user.email,
      target: 'Auth Service',
      category: 'security',
      details: emailSent ? 'Reset email dispatched via EmailJS' : 'Reset token created (email not sent)',
    });

    const payload: Record<string, unknown> = {
      success: true,
      emailConfigured: emailjsConfigured('reset'),
      emailSent,
      message: emailSent
        ? `Password reset email sent to ${user.email}. The link expires in 1 hour.`
        : emailjsConfigured('reset')
          ? `Reset token created, but EmailJS failed to send (${emailError}). Use the link below if shown, or contact an organizer.`
          : 'EmailJS reset template is not configured. Use the temporary reset link below (development) or ask an organizer.',
    };

    // Only expose the raw link when email did not send — needed for local/pilot demos
    if (!emailSent) {
      payload.resetLink = resetLink;
    }

    res.json(payload);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Password reset request failed' });
  }
});

router.post('/auth/reset-password', async (req, res) => {
  try {
    const token = String(req.body?.token || '').trim();
    const newPassword = String(req.body?.newPassword || '');
    if (!token || newPassword.length < 6) {
      return res.status(400).json({ error: 'Valid reset token and a password of at least 6 characters are required.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const { data, error } = await getDb()
      .from('users')
      .select('*')
      .eq('reset_token_hash', tokenHash)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return res.status(400).json({ error: 'Invalid or expired reset link.' });
    }
    if (data.reset_token_expires && new Date(data.reset_token_expires).getTime() < Date.now()) {
      return res.status(400).json({ error: 'This reset link has expired. Request a new one.' });
    }

    const passwordHash = await hashPassword(newPassword);
    const { error: updErr } = await getDb()
      .from('users')
      .update({
        password_hash: passwordHash,
        reset_token_hash: null,
        reset_token_expires: null,
      })
      .eq('id', data.id);
    if (updErr) throw updErr;

    await writeAudit({
      action: 'Password Reset Completed',
      actor: data.email,
      target: 'Auth Service',
      category: 'security',
      details: 'Password updated via reset token',
    });

    res.json({ success: true, message: 'Password updated. You can sign in with your new password.' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Password reset failed' });
  }
});

router.get('/auth/me', authRequired, async (req, res) => {
  res.json(getAuthUser(req));
});

router.get('/conference/stats', async (req, res) => {
  try {
    const db = getDb();
    const conferenceId = String(req.query.conferenceId || '');
    let attendeesQuery = db.from('attendees').select('*');
    let sessionsQuery = db.from('sessions').select('id', { count: 'exact', head: true });
    let cfpsQuery = db.from('cfp_proposals').select('status');
    if (conferenceId) {
      attendeesQuery = attendeesQuery.eq('conference_id', conferenceId);
      sessionsQuery = sessionsQuery.eq('conference_id', conferenceId);
      cfpsQuery = cfpsQuery.eq('conference_id', conferenceId);
    }
    const [{ data: attendees }, { count: sessions }, { count: speakers }, { data: cfps }] =
      await Promise.all([
        attendeesQuery,
        sessionsQuery,
        db.from('speakers').select('id', { count: 'exact', head: true }),
        cfpsQuery,
      ]);

    const list = attendees || [];
    const checkedInCount = list.filter((a) => a.is_checked_in).length;
    const byTier: Record<string, number> = {};
    let revenue = 0;
    for (const a of list) {
      const tier = a.ticket_tier || 'general';
      byTier[tier] = (byTier[tier] || 0) + 1;
      const tierDef = TICKET_TIERS.find((t) => t.id === tier);
      revenue += tierDef?.price || 0;
    }
    const cfpCounts = { pending: 0, accepted: 0, rejected: 0 };
    for (const p of cfps || []) {
      const s = (p.status || 'pending') as keyof typeof cfpCounts;
      if (s in cfpCounts) cfpCounts[s] += 1;
    }

    res.json({
      totalAttendees: list.length,
      checkedInCount,
      checkInRate: list.length ? Math.round((checkedInCount / list.length) * 100) : 0,
      totalSessions: sessions ?? 0,
      totalSpeakers: speakers ?? 0,
      revenue,
      registrationsByTier: byTier,
      cfpPipeline: cfpCounts,
      ticketTiers: TICKET_TIERS,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load stats' });
  }
});

router.get('/analytics/engagement', authRequired, requireOrganizer, async (req, res) => {
  try {
    const db = getDb();
    const [{ data: questions }, { data: polls }] = await Promise.all([
      db.from('qa_questions').select('session_id, upvotes'),
      db.from('polls').select('session_id, options'),
    ]);
    const qaBySession: Record<string, number> = {};
    for (const q of questions || []) {
      qaBySession[q.session_id] = (qaBySession[q.session_id] || 0) + 1;
    }
    const pollVotesBySession: Record<string, number> = {};
    for (const p of polls || []) {
      const votes = (p.options || []).reduce((sum: number, o: any) => sum + (o.votes || 0), 0);
      pollVotesBySession[p.session_id] = (pollVotesBySession[p.session_id] || 0) + votes;
    }
    res.json({
      totalQuestions: questions?.length || 0,
      totalPollVotes: Object.values(pollVotesBySession).reduce((a, b) => a + b, 0),
      qaBySession,
      pollVotesBySession,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load engagement analytics' });
  }
});

export default router;
