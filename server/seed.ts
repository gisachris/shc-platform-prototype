import 'dotenv/config';
import { getDb } from './db';
import { hashPassword } from './auth';
import { assertRuntimeConfig, supabaseConfigured } from './config';
import {
  INITIAL_SESSIONS,
  INITIAL_SPEAKERS,
  INITIAL_ATTENDEES,
  INITIAL_QUESTIONS,
  INITIAL_POLLS,
  INITIAL_CFP_PROPOSALS,
  INITIAL_CONFERENCES,
  INITIAL_TOURISM,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DIRECT_MESSAGES,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_USERS,
} from '../src/data/initialData';

async function seed() {
  assertRuntimeConfig();
  if (!supabaseConfigured()) {
    throw new Error('Supabase env vars required for seeding');
  }
  const db = getDb();
  console.log('Seeding SHC platform data into Supabase...');

  const users = [];
  for (const u of INITIAL_USERS) {
    const passwordHash = await hashPassword((u as any).passwordHash || 'password123');
    users.push({
      id: u.id,
      email: u.email.toLowerCase(),
      full_name: u.fullName,
      role: u.role,
      company: u.company || '',
      job_title: u.jobTitle || '',
      bio: u.bio || '',
      avatar: u.avatar || '',
      ticket_tier: u.ticketTier || null,
      ticket_id: u.ticketId || null,
      assigned_session_ids: u.assignedSessionIds || [],
      password_hash: passwordHash,
      interests: [],
    });
  }
  await db.from('users').upsert(users, { onConflict: 'id' });

  await db.from('conferences').upsert(
    INITIAL_CONFERENCES.map((c) => ({
      id: c.id,
      title: c.title,
      short_code: c.shortCode,
      tagline: c.tagline,
      description: c.description,
      start_date: c.startDate,
      end_date: c.endDate,
      venue_name: c.venueName,
      city: c.city,
      country: c.country,
      host_org: c.hostOrg,
      status: c.status,
      banner_image: c.bannerImage,
      logo_image: c.logoImage,
      capacity: c.capacity,
      registered_count: c.registeredCount,
      is_virtual_allowed: c.isVirtualAllowed,
      is_hybrid_allowed: c.isHybridAllowed,
      has_tourism_guide: c.hasTourismGuide,
    })),
    { onConflict: 'id' }
  );

  await db.from('speakers').upsert(
    INITIAL_SPEAKERS.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      company: s.company,
      bio: s.bio,
      avatar: s.avatar,
      email: s.email,
      location: s.location,
      socials: s.socials,
      topics: s.topics,
      rating: s.rating,
      featured_session_id: s.featuredSessionId || null,
    })),
    { onConflict: 'id' }
  );

  const defaultConfId = INITIAL_CONFERENCES[0]?.id || null;
  await db.from('sessions').upsert(
    INITIAL_SESSIONS.map((s) => ({
      id: s.id,
      conference_id: defaultConfId,
      title: s.title,
      description: s.description,
      track: s.track,
      level: s.level,
      room: s.room,
      speaker_ids: s.speakerIds,
      start_time: s.startTime,
      end_time: s.endTime,
      start_minutes: s.startMinutes,
      end_minutes: s.endMinutes,
      day: s.day,
      capacity: s.capacity,
      registered_count: s.registeredCount,
      tags: s.tags,
      is_live: s.isLive || false,
      is_featured: s.isFeatured || false,
    })),
    { onConflict: 'id' }
  );

  await db.from('attendees').upsert(
    INITIAL_ATTENDEES.map((a) => ({
      id: a.id,
      conference_id: defaultConfId,
      ticket_id: a.ticketId,
      ticket_tier: a.ticketTier,
      full_name: a.fullName,
      email: a.email.toLowerCase(),
      company: a.company,
      job_title: a.jobTitle,
      interests: a.interests,
      dietary_preference: a.dietaryPreference,
      tshirt_size: a.tshirtSize,
      is_networking_opt_in: a.isNetworkingOptIn,
      is_checked_in: a.isCheckedIn,
      registered_at: a.registeredAt,
      qr_code_data: a.qrCodeData.includes('|') ? a.qrCodeData : `${a.ticketId}|${a.email.toLowerCase()}`,
      avatar: a.avatar,
      bio: a.bio || '',
      attendance_mode: 'hybrid',
    })),
    { onConflict: 'id' }
  );

  await db.from('cfp_proposals').upsert(
    INITIAL_CFP_PROPOSALS.map((p) => ({
      id: p.id,
      conference_id: defaultConfId,
      speaker_name: p.speakerName,
      speaker_email: p.speakerEmail,
      speaker_company: p.speakerCompany,
      speaker_bio: p.speakerBio,
      title: p.title,
      abstract: p.abstract,
      target_track: p.targetTrack,
      level: p.level,
      status: p.status,
      submitted_at: p.submittedAt,
      ai_analysis: p.aiAnalysis || null,
      ai_status: p.aiAnalysis ? 'ok' : 'none',
    })),
    { onConflict: 'id' }
  );

  await db.from('qa_questions').upsert(
    INITIAL_QUESTIONS.map((q) => ({
      id: q.id,
      session_id: q.sessionId,
      author_name: q.authorName,
      author_company: q.authorCompany || '',
      text: q.text,
      upvotes: q.upvotes,
      upvoted_by: [],
      is_answered: q.isAnswered,
    })),
    { onConflict: 'id' }
  );

  await db.from('polls').upsert(
    INITIAL_POLLS.map((p) => ({
      id: p.id,
      session_id: p.sessionId,
      question: p.question,
      options: p.options,
      is_active: p.isActive,
    })),
    { onConflict: 'id' }
  );

  await db.from('tourism_items').upsert(
    INITIAL_TOURISM.map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      description: t.description,
      location: t.location,
      distance_from_venue: t.distanceFromVenue,
      image: t.image,
      rating: t.rating ?? null,
      contact_number: t.contactNumber || null,
      website: t.website || null,
      price_range: t.priceRange || null,
      highlights: t.highlights,
    })),
    { onConflict: 'id' }
  );

  await db.from('notifications').upsert(
    INITIAL_NOTIFICATIONS.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      timestamp: n.timestamp,
      read: n.read,
      link_tab: n.linkTab || null,
    })),
    { onConflict: 'id' }
  );

  await db.from('audit_logs').upsert(
    INITIAL_AUDIT_LOGS.map((a) => ({
      id: a.id,
      action: a.action,
      actor: a.actor,
      target: a.target,
      timestamp: a.timestamp,
      category: a.category,
      details: a.details || null,
    })),
    { onConflict: 'id' }
  );

  await db.from('direct_messages').upsert(
    INITIAL_DIRECT_MESSAGES.map((m) => ({
      id: m.id,
      sender_id: m.senderId,
      sender_name: m.senderName,
      sender_avatar: m.senderAvatar,
      receiver_id: m.receiverId,
      text: m.text,
      timestamp: m.timestamp,
    })),
    { onConflict: 'id' }
  );

  await db.from('system_settings').upsert({
    id: 'default',
    auto_approve_registration: INITIAL_SYSTEM_SETTINGS.autoApproveRegistration,
    livekit_server_url: process.env.LIVEKIT_URL || INITIAL_SYSTEM_SETTINGS.livekitServerUrl,
    smtp_configured: INITIAL_SYSTEM_SETTINGS.smtpConfigured,
    emergency_hotline: INITIAL_SYSTEM_SETTINGS.emergencyHotline,
    allow_public_cfp: INITIAL_SYSTEM_SETTINGS.allowPublicCFP,
    default_timezone: INITIAL_SYSTEM_SETTINGS.defaultTimezone,
  });

  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
