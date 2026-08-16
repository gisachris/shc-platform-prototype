/**
 * Platform-level API routes for conferences, tourism, notifications, and settings.
 *
 * This router exposes the public and organizer-facing data used by the app's conference directory,
 * tourism guide, notifications center, and system settings screens. It connects to the Supabase
 * database and the core frontend views in the src/components folder.
 */

import { Router } from 'express';
import { getDb } from '../db';
import { authRequired, getAuthUser, isOrganizer, requireOrganizer, writeAudit } from '../auth';
import { mapConference, mapTourism, mapNotification, mapAudit, mapMessage, mapSettings } from '../mappers';

const router = Router();

router.get('/conferences', async (_req, res) => {
  const { data, error } = await getDb().from('conferences').select('*').order('start_date', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(mapConference));
});

router.post('/conferences', authRequired, requireOrganizer, async (req, res) => {
  const authUser = getAuthUser(req)!;
  const { title, tagline, description, startDate, endDate, venueName, capacity } = req.body;
  if (!title || !startDate) {
    return res.status(400).json({ error: 'Title and startDate are required' });
  }
  const id = `conf-${Date.now()}`;
  const row = {
    id,
    title,
    short_code: title.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 6) + '-26',
    tagline: tagline || 'Smart Hybrid Conference',
    description: description || '',
    start_date: startDate,
    end_date: endDate || startDate,
    venue_name: venueName || 'Kigali Convention Centre',
    city: 'Kigali',
    country: 'Rwanda',
    host_org: 'Rwanda Convention Bureau',
    status: 'published',
    banner_image: '',
    logo_image: '',
    capacity: Number(capacity) || 1000,
    registered_count: 0,
    is_virtual_allowed: true,
    is_hybrid_allowed: true,
    has_tourism_guide: true,
  };
  const { error } = await getDb().from('conferences').insert(row);
  if (error) return res.status(500).json({ error: error.message });
  await writeAudit({
    action: 'New Conference Created',
    actor: `${authUser.fullName} (${authUser.role})`,
    target: title,
    category: 'conference',
    details: `Capacity: ${row.capacity}, Venue: ${row.venue_name}`,
  });
  res.status(201).json(mapConference(row));
});

router.get('/tourism', async (req, res) => {
  const { category } = req.query;
  let q = getDb().from('tourism_items').select('*');
  if (category) q = q.eq('category', String(category));
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(mapTourism));
});

router.post('/tourism', authRequired, requireOrganizer, async (req, res) => {
  const item = req.body;
  const row = {
    id: item.id || `tour-${Date.now()}`,
    title: item.title,
    category: item.category,
    description: item.description || '',
    location: item.location || '',
    distance_from_venue: item.distanceFromVenue || '',
    image: item.image || '',
    rating: item.rating ?? null,
    contact_number: item.contactNumber || null,
    website: item.website || null,
    price_range: item.priceRange || null,
    highlights: item.highlights || [],
  };
  const { error } = await getDb().from('tourism_items').upsert(row);
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(mapTourism(row));
});

router.get('/notifications', async (_req, res) => {
  const { data, error } = await getDb().from('notifications').select('*').order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(mapNotification));
});

router.post('/notifications/read', authRequired, async (_req, res) => {
  await getDb().from('notifications').update({ read: true }).eq('read', false);
  const { data } = await getDb().from('notifications').select('*').order('id', { ascending: false });
  res.json({ success: true, notifications: (data || []).map(mapNotification) });
});

router.post('/notifications/broadcast', authRequired, requireOrganizer, async (req, res) => {
  const authUser = getAuthUser(req)!;
  const { title, message, type } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'Title and message are required' });
  const row = {
    id: `notif-${Date.now()}`,
    title,
    message,
    type: type || 'info',
    timestamp: 'Just now',
    read: false,
  };
  await getDb().from('notifications').insert(row);
  await writeAudit({
    action: 'Broadcast Announcement Pushed',
    actor: `${authUser.fullName} (${authUser.role})`,
    target: title,
    category: 'system',
    details: message,
  });
  const { data } = await getDb().from('notifications').select('*').order('id', { ascending: false });
  res.status(201).json({ success: true, notification: mapNotification(row), notifications: (data || []).map(mapNotification) });
});

router.get('/audit-logs', authRequired, requireOrganizer, async (_req, res) => {
  const { data, error } = await getDb().from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(200);
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(mapAudit));
});

router.get('/messages', authRequired, async (req, res) => {
  const user = getAuthUser(req)!;
  const { data, error } = await getDb()
    .from('direct_messages')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(mapMessage));
});

router.post('/messages', authRequired, async (req, res) => {
  const user = getAuthUser(req)!;
  const { receiverId, text } = req.body;
  if (!text || !receiverId) return res.status(400).json({ error: 'receiverId and text are required' });
  const row = {
    id: `msg-${Date.now()}`,
    sender_id: user.id,
    sender_name: user.fullName,
    sender_avatar: user.avatar || '',
    receiver_id: receiverId,
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  const { error } = await getDb().from('direct_messages').insert(row);
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(mapMessage(row));
});

router.get('/settings', async (_req, res) => {
  const { data, error } = await getDb().from('system_settings').select('*').eq('id', 'default').maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json(mapSettings(data || { id: 'default' }));
});

router.post('/settings', authRequired, requireOrganizer, async (req, res) => {
  const body = req.body;
  const row = {
    id: 'default',
    auto_approve_registration: body.autoApproveRegistration,
    livekit_server_url: body.livekitServerUrl,
    smtp_configured: body.smtpConfigured,
    emergency_hotline: body.emergencyHotline,
    allow_public_cfp: body.allowPublicCFP,
    default_timezone: body.defaultTimezone,
  };
  const { data, error } = await getDb().from('system_settings').upsert(row).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(mapSettings(data));
});

router.get('/networking/matches', authRequired, async (req, res) => {
  const user = getAuthUser(req)!;
  const db = getDb();
  const { data: me } = await db.from('attendees').select('*').eq('email', user.email.toLowerCase()).maybeSingle();
  const myInterests: string[] = me?.interests || [];
  const { data: others } = await db.from('attendees').select('*').eq('is_networking_opt_in', true).neq('email', user.email.toLowerCase());
  const scored = (others || [])
    .map((a) => {
      const theirs: string[] = a.interests || [];
      const overlap = theirs.filter((i) =>
        myInterests.some((m) => m.toLowerCase() === i.toLowerCase())
      );
      return {
        attendee: {
          id: a.id,
          fullName: a.full_name,
          email: a.email,
          company: a.company,
          jobTitle: a.job_title,
          interests: theirs,
          avatar: a.avatar,
          bio: a.bio,
        },
        score: overlap.length,
        sharedInterests: overlap,
      };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
  res.json({ matches: scored, myInterests });
});

export default router;
