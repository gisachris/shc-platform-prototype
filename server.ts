import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { AccessToken } from 'livekit-server-sdk';
import { getSupabase } from './src/lib/supabase';
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
  TICKET_TIERS
} from './src/data/initialData';
import { 
  Session, 
  Speaker, 
  Attendee, 
  QAQuestion, 
  SessionPoll, 
  CFPProposal, 
  SessionTrack,
  Conference,
  TourismItem,
  AppNotification,
  AuditLogEntry,
  DirectMessage,
  SystemSettings,
  User,
  UserRole
} from './src/types';

// LiveKit credentials & configuration
const livekitApiKey = process.env.LIVEKIT_API_KEY || 'devkey';
const livekitApiSecret = process.env.LIVEKIT_API_SECRET || 'secretsecretsecretsecretsecretsecret';
const livekitUrl = process.env.LIVEKIT_URL || 'wss://demo.livekit.cloud';

// In-memory state store (resilient during runtime)
let sessionsStore: Session[] = [...INITIAL_SESSIONS];
let speakersStore: Speaker[] = [...INITIAL_SPEAKERS];
let attendeesStore: Attendee[] = [...INITIAL_ATTENDEES];
let questionsStore: QAQuestion[] = [...INITIAL_QUESTIONS];
let pollsStore: SessionPoll[] = [...INITIAL_POLLS];
let cfpStore: CFPProposal[] = [...INITIAL_CFP_PROPOSALS];
let conferencesStore: Conference[] = [...INITIAL_CONFERENCES];
let tourismStore: TourismItem[] = [...INITIAL_TOURISM];
let notificationsStore: AppNotification[] = [...INITIAL_NOTIFICATIONS];
let auditLogsStore: AuditLogEntry[] = [...INITIAL_AUDIT_LOGS];
let directMessagesStore: DirectMessage[] = [...INITIAL_DIRECT_MESSAGES];
let systemSettingsStore: SystemSettings = { ...INITIAL_SYSTEM_SETTINGS };
let usersStore: (User & { passwordHash?: string })[] = [...INITIAL_USERS];

/**
 * Database Seeding Helper
 * Seeds initial domain models (Users, Conferences, Speakers, Sessions, Proposals) to Supabase tables.
 */
async function seedDatabaseToSupabase() {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      seeded: false,
      reason: 'Supabase URL/Key environment variables are not configured. Currently using resilient in-memory database.'
    };
  }

  try {
    const usersToInsert = usersStore.map(u => ({
      id: u.id,
      email: u.email,
      full_name: u.fullName,
      role: u.role,
      company: u.company || '',
      job_title: u.jobTitle || '',
      bio: u.bio || '',
      avatar: u.avatar || ''
    }));
    await supabase.from('users').upsert(usersToInsert, { onConflict: 'id' });

    const confsToInsert = conferencesStore.map(c => ({
      id: c.id,
      title: c.title,
      short_code: c.shortCode,
      tagline: c.tagline,
      description: c.description,
      venue_name: c.venueName || '',
      city: c.city || '',
      country: c.country || '',
      start_date: c.startDate || '',
      end_date: c.endDate || '',
      status: c.status || 'published'
    }));
    await supabase.from('conferences').upsert(confsToInsert, { onConflict: 'id' });

    const speakersToInsert = speakersStore.map(s => ({
      id: s.id,
      name: s.name,
      role: s.role || '',
      company: s.company || '',
      bio: s.bio || '',
      avatar: s.avatar || '',
      email: s.email || '',
      location: s.location || 'Kigali, Rwanda'
    }));
    await supabase.from('speakers').upsert(speakersToInsert, { onConflict: 'id' });

    const sessionsToInsert = sessionsStore.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description || '',
      track: s.track || 'Web Development',
      level: s.level || 'All Levels',
      room: s.room || 'Main Hall',
      speaker_ids: s.speakerIds || [],
      start_time: s.startTime || '',
      end_time: s.endTime || '',
      day: s.day || 1,
      capacity: s.capacity || 100
    }));
    await supabase.from('sessions').upsert(sessionsToInsert, { onConflict: 'id' });

    const cfpToInsert = cfpStore.map(p => ({
      id: p.id,
      title: p.title,
      abstract: p.abstract || '',
      track: p.targetTrack || '',
      level: p.level || '',
      speaker_name: p.speakerName || '',
      speaker_email: p.speakerEmail || '',
      speaker_bio: p.speakerBio || '',
      status: p.status || 'submitted'
    }));
    await supabase.from('cfp_proposals').upsert(cfpToInsert, { onConflict: 'id' });

    return {
      seeded: true,
      counts: {
        users: usersToInsert.length,
        conferences: confsToInsert.length,
        speakers: speakersToInsert.length,
        sessions: sessionsToInsert.length,
        proposals: cfpToInsert.length
      }
    };
  } catch (err: any) {
    console.error('Supabase seeding error:', err);
    return { seeded: false, error: err.message || 'Seeding error' };
  }
}

/**
 * Sync data from Supabase tables into in-memory store on server startup
 */
async function syncFromSupabase() {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { data: dbConfs } = await supabase.from('conferences').select('*');
    if (dbConfs && dbConfs.length > 0) {
      conferencesStore = dbConfs.map((c: any) => ({
        id: c.id,
        title: c.title,
        shortCode: c.short_code || 'SHC26',
        tagline: c.tagline || 'Leading Hybrid Tech Conference',
        description: c.description || 'Official Hybrid Conference Platform Rwanda',
        startDate: c.start_date || '2026-07-22',
        endDate: c.end_date || '2026-07-24',
        venueName: c.venue_name || 'Kigali Convention Centre',
        city: c.city || 'Kigali',
        country: c.country || 'Rwanda',
        hostOrg: 'Rwanda Ministry of ICT & Innovation',
        status: c.status || 'published',
        bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
        logoImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        capacity: 1500,
        registeredCount: 840,
        isVirtualAllowed: true,
        isHybridAllowed: true,
        hasTourismGuide: true
      }));
    }

    const { data: dbUsers } = await supabase.from('users').select('*');
    if (dbUsers && dbUsers.length > 0) {
      dbUsers.forEach((u: any) => {
        const idx = usersStore.findIndex(x => x.id === u.id || x.email.toLowerCase() === u.email.toLowerCase());
        const mappedUser: User & { passwordHash?: string } = {
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          role: u.role || 'attendee',
          company: u.company || 'Delegate',
          jobTitle: u.job_title || 'Participant',
          avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          ticketTier: 'general',
          ticketId: `TC26-${Math.floor(10000 + Math.random() * 90000)}`,
          bio: u.bio || '',
          passwordHash: 'password123'
        };
        if (idx >= 0) {
          usersStore[idx] = { ...usersStore[idx], ...mappedUser };
        } else {
          usersStore.push(mappedUser);
        }
      });
    }
  } catch (err) {
    console.warn('Initial Supabase sync skipped:', err);
  }
}

// Attempt initial database load
syncFromSupabase();

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Helper to get user from Authorization header
  const getAuthUser = (req: express.Request): User | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '');
    const match = token.match(/^token-(user-[a-z0-9\-]+)-/);
    if (!match) return null;
    const userId = match[1];
    const user = usersStore.find(u => u.id === userId);
    if (!user) return null;
    const { passwordHash, ...sanitized } = user;
    return { ...sanitized, token };
  };

  const ORGANIZER_ROLES: UserRole[] = ['organizer', 'administrator', 'super_admin'];

  const isOrganizer = (user: User | null): boolean => {
    return Boolean(user && ORGANIZER_ROLES.includes(user.role));
  };

  // --- DATABASE & SEEDING MANAGEMENT ENDPOINTS ---
  app.get('/api/database/status', async (req, res) => {
    const supabase = getSupabase();
    const configured = Boolean(supabase);

    let dbCounts = {
      users: usersStore.length,
      conferences: conferencesStore.length,
      speakers: speakersStore.length,
      sessions: sessionsStore.length,
      proposals: cfpStore.length
    };

    if (supabase) {
      try {
        const [uRes, cRes, spRes, sRes, cfpRes] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('conferences').select('id', { count: 'exact', head: true }),
          supabase.from('speakers').select('id', { count: 'exact', head: true }),
          supabase.from('sessions').select('id', { count: 'exact', head: true }),
          supabase.from('cfp_proposals').select('id', { count: 'exact', head: true })
        ]);

        dbCounts = {
          users: uRes.count ?? usersStore.length,
          conferences: cRes.count ?? conferencesStore.length,
          speakers: spRes.count ?? speakersStore.length,
          sessions: sRes.count ?? sessionsStore.length,
          proposals: cfpRes.count ?? cfpStore.length
        };
      } catch (e) {
        console.warn('Failed to fetch DB table counts:', e);
      }
    }

    res.json({
      configured,
      databaseType: configured ? 'Supabase PostgreSQL Cloud DB' : 'In-Memory Persistent Database',
      counts: dbCounts,
      timestamp: new Date().toISOString()
    });
  });

  app.post('/api/database/seed', async (req, res) => {
    const result = await seedDatabaseToSupabase();
    res.json({ success: true, ...result });
  });

  // --- AUTHENTICATION & AUTHORIZATION ENDPOINTS ---
  app.get('/api/auth/dummy-users', (req, res) => {
    // Return sanitized users list for demo login selection
    const sanitized = usersStore.map(({ passwordHash, ...user }) => user);
    res.json(sanitized);
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = usersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || (user.passwordHash && user.passwordHash !== password)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = `token-${user.id}-${Date.now()}`;
    const userWithToken: User = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      company: user.company,
      jobTitle: user.jobTitle,
      avatar: user.avatar,
      ticketTier: user.ticketTier,
      ticketId: user.ticketId,
      assignedSessionIds: user.assignedSessionIds,
      bio: user.bio,
      token
    };

    // Audit log
    auditLogsStore.unshift({
      id: `audit-${Date.now()}`,
      action: 'User Logged In',
      actor: `${user.fullName} (${user.role})`,
      target: 'Auth Service',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      category: 'security',
      details: `Successful login as ${user.role} [${user.email}]`
    });

    res.json({ success: true, user: userWithToken });
  });

  app.post('/api/auth/register', (req, res) => {
    const { fullName, email, password, company, jobTitle, role } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const existing = usersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const assignedRole = role || 'attendee';
    const userId = `user-${Date.now()}`;
    const ticketId = `TC26-${Math.floor(10000 + Math.random() * 90000)}`;

    const newUser = {
      id: userId,
      email,
      fullName,
      role: assignedRole,
      company: company || 'Delegate',
      jobTitle: jobTitle || 'Conference Participant',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`,
      ticketTier: 'general' as const,
      ticketId,
      bio: 'Registered delegate for SHC Platform Rwanda 2026',
      passwordHash: password
    };

    usersStore.unshift(newUser);

    // Also auto-create attendee entry
    const newAttendee: Attendee = {
      id: `att-${Date.now()}`,
      ticketId,
      ticketTier: 'general',
      fullName,
      email,
      company: newUser.company,
      jobTitle: newUser.jobTitle,
      interests: ['Rwanda Tech Summit'],
      dietaryPreference: 'None',
      tshirtSize: 'L',
      isNetworkingOptIn: true,
      isCheckedIn: false,
      registeredAt: new Date().toISOString(),
      qrCodeData: `${ticketId}-${fullName.toUpperCase().replace(/\s+/g, '-')}-REG`,
      avatar: newUser.avatar,
      bio: newUser.bio
    };

    attendeesStore.unshift(newAttendee);

    // Audit log
    auditLogsStore.unshift({
      id: `audit-${Date.now()}`,
      action: 'New Account Registered',
      actor: `${fullName} (${assignedRole})`,
      target: 'Auth Service',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      category: 'security',
      details: `Created account for ${email} with role ${assignedRole}`
    });

    // Sync user registration to Supabase if configured
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('users').insert({
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.fullName,
        role: newUser.role,
        company: newUser.company,
        job_title: newUser.jobTitle,
        bio: newUser.bio,
        avatar: newUser.avatar
      }).then(({ error }) => {
        if (error) console.warn('Supabase user sync error:', error);
      });
    }

    const token = `token-${userId}-${Date.now()}`;
    const { passwordHash, ...sanitizedUser } = newUser;

    res.json({ success: true, user: { ...sanitizedUser, token } });
  });

  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    const token = authHeader.replace('Bearer ', '');
    // Token pattern: token-<userId>-<timestamp>
    const match = token.match(/^token-(user-[a-z0-9\-]+)-/);
    if (!match) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const userId = match[1];
    const user = usersStore.find(u => u.id === userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    const { passwordHash, ...sanitized } = user;
    res.json({ ...sanitized, token });
  });

  app.post('/api/auth/switch-demo', (req, res) => {
    const { role } = req.body;
    const targetUser = usersStore.find(u => u.role === role) || usersStore[0];
    const token = `token-${targetUser.id}-${Date.now()}`;
    const { passwordHash, ...sanitized } = targetUser;

    auditLogsStore.unshift({
      id: `audit-${Date.now()}`,
      action: 'Demo Role Switch',
      actor: `Demo Tester`,
      target: `${targetUser.fullName} (${targetUser.role})`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      category: 'security',
      details: `Switched active context to ${role}`
    });

    res.json({ success: true, user: { ...sanitized, token } });
  });

  // Conference Summary Stats
  app.get('/api/conference/stats', (req, res) => {
    const totalAttendees = attendeesStore.length;
    const checkedInCount = attendeesStore.filter(a => a.isCheckedIn).length;
    const totalSessions = sessionsStore.length;
    const totalSpeakers = speakersStore.length;

    res.json({
      totalAttendees,
      checkedInCount,
      totalSessions,
      totalSpeakers,
      revenue: 0,
      ticketTiers: TICKET_TIERS
    });
  });

  // --- LIVEKIT WEBRTC CONFERENCING ENDPOINTS ---
  app.get('/api/livekit/config', (req, res) => {
    res.json({
      wsUrl: livekitUrl,
      configured: Boolean(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET)
    });
  });

  app.post('/api/livekit/token', async (req, res) => {
    try {
      const { roomName, participantName, identity, isSpeaker } = req.body;
      if (!roomName || !participantName) {
        return res.status(400).json({ error: 'roomName and participantName are required.' });
      }

      const participantIdentity = identity || `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const at = new AccessToken(livekitApiKey, livekitApiSecret, {
        identity: participantIdentity,
        name: participantName,
        ttl: '6h'
      });

      at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      });

      const token = await at.toJwt();
      res.json({
        token,
        wsUrl: livekitUrl,
        roomName,
        identity: participantIdentity,
        participantName,
        isSpeaker: Boolean(isSpeaker)
      });
    } catch (err) {
      console.error('Error generating LiveKit WebRTC token:', err);
      res.status(500).json({ error: 'Failed to create LiveKit token' });
    }
  });

  // --- CONFERENCES ENDPOINTS ---
  app.get('/api/conferences', (req, res) => {
    res.json(conferencesStore);
  });

  app.post('/api/conferences', (req, res) => {
    const authUser = getAuthUser(req);
    if (!isOrganizer(authUser)) {
      return res.status(403).json({ error: 'Unauthorized: Only conference organizers or administrators can create new conferences.' });
    }

    const { title, tagline, description, startDate, endDate, venueName, capacity } = req.body;
    if (!title || !startDate) {
      return res.status(400).json({ error: 'Title and startDate are required' });
    }
    const newConf: Conference = {
      id: `conf-${Date.now()}`,
      title,
      shortCode: title.split(' ').map((w: string) => w[0]).join('').toUpperCase() + '-26',
      tagline: tagline || 'Smart Hybrid Conference',
      description: description || '',
      startDate,
      endDate: endDate || startDate,
      venueName: venueName || 'Kigali Convention Centre',
      city: 'Kigali',
      country: 'Rwanda',
      hostOrg: 'SHC Platform Secretariat',
      status: 'published',
      bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      logoImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
      capacity: Number(capacity) || 1000,
      registeredCount: 0,
      isVirtualAllowed: true,
      isHybridAllowed: true,
      hasTourismGuide: true
    };
    conferencesStore.unshift(newConf);

    // Audit log entry
    auditLogsStore.unshift({
      id: `audit-${Date.now()}`,
      action: 'New Conference Created',
      actor: `${authUser.fullName} (${authUser.role})`,
      target: title,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      category: 'conference',
      details: `Capacity: ${capacity || 1000}, Venue: ${venueName}`
    });

    res.status(201).json(newConf);
  });

  // --- TOURISM ENDPOINTS ---
  app.get('/api/tourism', (req, res) => {
    const { category } = req.query;
    if (category) {
      return res.json(tourismStore.filter(t => t.category === category));
    }
    res.json(tourismStore);
  });

  // --- NOTIFICATIONS ENDPOINTS ---
  app.get('/api/notifications', (req, res) => {
    res.json(notificationsStore);
  });

  app.post('/api/notifications/read', (req, res) => {
    notificationsStore = notificationsStore.map(n => ({ ...n, read: true }));
    res.json({ success: true, notifications: notificationsStore });
  });

  app.post('/api/notifications/broadcast', (req, res) => {
    const authUser = getAuthUser(req);
    if (!isOrganizer(authUser)) {
      return res.status(403).json({ error: 'Unauthorized: Only organizers can send broadcast announcements.' });
    }
    const { title, message, type } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type: type || 'info',
      timestamp: 'Just now',
      read: false
    };
    notificationsStore.unshift(newNotif);

    auditLogsStore.unshift({
      id: `audit-${Date.now()}`,
      action: 'Broadcast Announcement Pushed',
      actor: `${authUser.fullName} (${authUser.role})`,
      target: title,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      category: 'system',
      details: message
    });

    res.status(201).json({ success: true, notification: newNotif, notifications: notificationsStore });
  });

  // --- AUDIT LOGS ENDPOINTS ---
  app.get('/api/audit-logs', (req, res) => {
    const authUser = getAuthUser(req);
    if (!isOrganizer(authUser)) {
      return res.status(403).json({ error: 'Unauthorized: Only event organizers and administrators can view audit logs.' });
    }
    res.json(auditLogsStore);
  });

  // --- DIRECT MESSAGES ENDPOINTS ---
  app.get('/api/messages', (req, res) => {
    res.json(directMessagesStore);
  });

  app.post('/api/messages', (req, res) => {
    const { receiverId, text, senderName, senderAvatar } = req.body;
    if (!text || !receiverId) {
      return res.status(400).json({ error: 'receiverId and text are required' });
    }
    const msg: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user-self',
      senderName: senderName || 'Conference Delegate',
      senderAvatar: senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      receiverId,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    directMessagesStore.push(msg);
    res.status(201).json(msg);
  });

  // --- SYSTEM SETTINGS ENDPOINTS ---
  app.get('/api/settings', (req, res) => {
    res.json(systemSettingsStore);
  });

  app.post('/api/settings', (req, res) => {
    const authUser = getAuthUser(req);
    if (!isOrganizer(authUser)) {
      return res.status(403).json({ error: 'Unauthorized: Only system administrators and organizers can update system settings.' });
    }
    systemSettingsStore = { ...systemSettingsStore, ...req.body };
    res.json(systemSettingsStore);
  });

  // GET Sessions
  app.get('/api/sessions', (req, res) => {
    let result = [...sessionsStore];
    const { day, track, speakerId } = req.query;

    if (day) {
      result = result.filter(s => s.day === Number(day));
    }
    if (track) {
      result = result.filter(s => s.track.toLowerCase() === String(track).toLowerCase());
    }
    if (speakerId) {
      result = result.filter(s => s.speakerIds.includes(String(speakerId)));
    }

    res.json(result);
  });

  // POST Create / Edit Session
  app.post('/api/sessions', (req, res) => {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Authentication required to create or modify sessions.' });
    }

    const sessionData: Partial<Session> = req.body;
    
    if (sessionData.id) {
      // Edit
      const existing = sessionsStore.find(s => s.id === sessionData.id);
      if (existing) {
        // Is user assigned speaker for this session?
        const isAssignedSpeaker = authUser.role === 'speaker' && (
          existing.speakerIds.includes(authUser.id) ||
          authUser.assignedSessionIds?.includes(existing.id)
        );

        if (!isOrganizer(authUser) && !isAssignedSpeaker) {
          return res.status(403).json({ error: 'Unauthorized: Only event organizers or assigned session speakers can update session details.' });
        }

        const index = sessionsStore.findIndex(s => s.id === sessionData.id);
        sessionsStore[index] = { ...sessionsStore[index], ...sessionData } as Session;

        auditLogsStore.unshift({
          id: `audit-${Date.now()}`,
          action: 'Session Updated',
          actor: `${authUser.fullName} (${authUser.role})`,
          target: sessionsStore[index].title,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          category: 'session',
          details: `Updated session ${sessionData.id}`
        });

        return res.json({ success: true, session: sessionsStore[index] });
      }
    }

    // Creating new session requires Organizer role
    if (!isOrganizer(authUser)) {
      return res.status(403).json({ error: 'Unauthorized: Attendees and non-organizer accounts cannot create new sessions. Please contact an organizer.' });
    }

    // New Session
    const newSession: Session = {
      id: `ses-${Date.now()}`,
      title: sessionData.title || 'Untitled Session',
      description: sessionData.description || '',
      day: sessionData.day || 1,
      startTime: sessionData.startTime || '09:00 AM',
      endTime: sessionData.endTime || '10:00 AM',
      startMinutes: sessionData.startMinutes || 540,
      endMinutes: sessionData.endMinutes || 600,
      track: sessionData.track || 'Web Development',
      room: sessionData.room || 'Main Ballroom',
      capacity: sessionData.capacity || 100,
      registeredCount: 0,
      speakerIds: sessionData.speakerIds || [],
      level: sessionData.level || 'All Levels',
      tags: sessionData.tags || ['New']
    };

    sessionsStore.push(newSession);

    auditLogsStore.unshift({
      id: `audit-${Date.now()}`,
      action: 'New Session Created',
      actor: `${authUser.fullName} (${authUser.role})`,
      target: newSession.title,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      category: 'session',
      details: `Track: ${newSession.track}, Day ${newSession.day}`
    });

    res.json({ success: true, session: newSession });
  });

  // DELETE Session
  app.delete('/api/sessions/:id', (req, res) => {
    const authUser = getAuthUser(req);
    if (!isOrganizer(authUser)) {
      return res.status(403).json({ error: 'Unauthorized: Only event organizers or administrators can delete sessions.' });
    }

    const { id } = req.params;
    sessionsStore = sessionsStore.filter(s => s.id !== id);

    auditLogsStore.unshift({
      id: `audit-${Date.now()}`,
      action: 'Session Deleted',
      actor: `${authUser.fullName} (${authUser.role})`,
      target: `Session ${id}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      category: 'session',
      details: `Deleted session ID ${id}`
    });

    res.json({ success: true });
  });

  // GET Speakers
  app.get('/api/speakers', (req, res) => {
    res.json(speakersStore);
  });

  // POST Speakers (Create/Edit)
  app.post('/api/speakers', (req, res) => {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Authentication required to manage speakers.' });
    }

    const speakerData: Partial<Speaker> = req.body;
    if (speakerData.id) {
      const idx = speakersStore.findIndex(s => s.id === speakerData.id);
      if (idx !== -1) {
        const isSelf = authUser.id === speakerData.id || authUser.email.toLowerCase() === speakersStore[idx].email.toLowerCase();
        if (!isOrganizer(authUser) && !isSelf) {
          return res.status(403).json({ error: 'Unauthorized: You can only edit your own speaker profile unless you are an organizer.' });
        }

        speakersStore[idx] = { ...speakersStore[idx], ...speakerData } as Speaker;
        return res.json({ success: true, speaker: speakersStore[idx] });
      }
    }

    if (!isOrganizer(authUser)) {
      return res.status(403).json({ error: 'Unauthorized: Only event organizers can add new speakers.' });
    }

    const newSpeaker: Speaker = {
      id: `spk-${Date.now()}`,
      name: speakerData.name || 'New Speaker',
      role: speakerData.role || 'Presenter',
      company: speakerData.company || 'Tech Company',
      bio: speakerData.bio || '',
      avatar: speakerData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      email: speakerData.email || '',
      location: speakerData.location || 'Global',
      socials: speakerData.socials || {},
      topics: speakerData.topics || ['Tech'],
      rating: 5.0
    };

    speakersStore.push(newSpeaker);
    res.json({ success: true, speaker: newSpeaker });
  });

  // GET Attendees
  app.get('/api/attendees', (req, res) => {
    res.json(attendeesStore);
  });

  // POST Register Attendee
  app.post('/api/register', (req, res) => {
    const { fullName, email, company, jobTitle, ticketTier, interests, dietaryPreference, tshirtSize, isNetworkingOptIn, bio } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ error: 'Full name and email are required.' });
    }

    const ticketId = `TC26-${Math.floor(10000 + Math.random() * 90000)}`;
    const newAttendee: Attendee = {
      id: `att-${Date.now()}`,
      ticketId,
      ticketTier: ticketTier || 'general',
      fullName,
      email,
      company: company || 'Independent',
      jobTitle: jobTitle || 'Attendee',
      interests: Array.isArray(interests) ? interests : ['TechCon 2026'],
      dietaryPreference: dietaryPreference || 'None',
      tshirtSize: tshirtSize || 'L',
      isNetworkingOptIn: Boolean(isNetworkingOptIn),
      isCheckedIn: false,
      registeredAt: new Date().toISOString(),
      qrCodeData: `${ticketId}-${fullName.toUpperCase().replace(/\s+/g, '-')}-${(company || 'IND').toUpperCase()}`,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
      bio: bio || 'Excited to attend TechCon 2026!'
    };

    attendeesStore.unshift(newAttendee);

    // Dynamic Live Notification
    notificationsStore.unshift({
      id: `notif-${Date.now()}`,
      title: 'New Delegate Registered',
      message: `${fullName} (${company || 'Independent'}) has registered for TechCon 2026. Ticket ID: ${ticketId}`,
      type: 'info',
      timestamp: 'Just now',
      read: false
    });

    res.json({ success: true, attendee: newAttendee });
  });

  // POST Toggle Check-In
  app.post('/api/attendees/:id/checkin', (req, res) => {
    const authUser = getAuthUser(req);
    if (!isOrganizer(authUser)) {
      return res.status(403).json({ error: 'Unauthorized: Only event organizers and registration staff can check in attendees.' });
    }

    const { id } = req.params;
    const attendee = attendeesStore.find(a => a.id === id);
    if (!attendee) {
      return res.status(404).json({ error: 'Attendee not found' });
    }
    attendee.isCheckedIn = !attendee.isCheckedIn;

    auditLogsStore.unshift({
      id: `audit-${Date.now()}`,
      action: 'Attendee Check-In Toggled',
      actor: `${authUser.fullName} (${authUser.role})`,
      target: attendee.fullName,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      category: 'checkin',
      details: `Status set to ${attendee.isCheckedIn ? 'Checked In' : 'Pending'}`
    });

    res.json({ success: true, attendee });
  });

  // Q&A Routes
  app.get('/api/qa/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const sessionQs = questionsStore.filter(q => q.sessionId === sessionId);
    res.json(sessionQs);
  });

  app.post('/api/qa', (req, res) => {
    const { sessionId, authorName, authorCompany, text } = req.body;
    if (!sessionId || !text) {
      return res.status(400).json({ error: 'Session ID and text are required' });
    }

    const newQ: QAQuestion = {
      id: `qa-${Date.now()}`,
      sessionId,
      authorName: authorName || 'Anonymous Attendee',
      authorCompany: authorCompany || '',
      text,
      upvotes: 1,
      createdAt: 'Just now',
      isAnswered: false,
      upvotedByUser: true
    };

    questionsStore.unshift(newQ);
    res.json({ success: true, question: newQ });
  });

  app.post('/api/qa/:id/upvote', (req, res) => {
    const { id } = req.params;
    const q = questionsStore.find(item => item.id === id);
    if (!q) return res.status(404).json({ error: 'Question not found' });

    if (q.upvotedByUser) {
      q.upvotes = Math.max(0, q.upvotes - 1);
      q.upvotedByUser = false;
    } else {
      q.upvotes += 1;
      q.upvotedByUser = true;
    }

    res.json({ success: true, question: q });
  });

  // Poll Routes
  app.get('/api/poll/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const poll = pollsStore.find(p => p.sessionId === sessionId);
    res.json(poll || null);
  });

  app.post('/api/poll/vote', (req, res) => {
    const { pollId, optionId } = req.body;
    const poll = pollsStore.find(p => p.id === pollId);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    const opt = poll.options.find(o => o.id === optionId);
    if (opt) {
      opt.votes += 1;
    }
    res.json({ success: true, poll });
  });

  // CFP Proposals
  app.get('/api/cfp', (req, res) => {
    res.json(cfpStore);
  });

  app.post('/api/cfp/:id/status', (req, res) => {
    const authUser = getAuthUser(req);
    if (!isOrganizer(authUser)) {
      return res.status(403).json({ error: 'Unauthorized: Only event organizers can update CFP proposal status.' });
    }

    const { id } = req.params;
    const { status } = req.body;
    const proposal = cfpStore.find(p => p.id === id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    proposal.status = status;

    auditLogsStore.unshift({
      id: `audit-${Date.now()}`,
      action: 'CFP Proposal Status Updated',
      actor: `${authUser.fullName} (${authUser.role})`,
      target: proposal.title,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      category: 'session',
      details: `Status changed to ${status}`
    });

    res.json({ success: true, proposal });
  });

  // POST Submit CFP & Analyze with Gemini
  app.post('/api/cfp', async (req, res) => {
    const { speakerName, speakerEmail, speakerCompany, speakerBio, title, abstract, targetTrack, level } = req.body;

    if (!title || !abstract) {
      return res.status(400).json({ error: 'Title and abstract are required' });
    }

    const proposal: CFPProposal = {
      id: `cfp-${Date.now()}`,
      speakerName: speakerName || 'Anonymous Proposal',
      speakerEmail: speakerEmail || '',
      speakerCompany: speakerCompany || '',
      speakerBio: speakerBio || '',
      title,
      abstract,
      targetTrack: targetTrack || 'Web Development',
      level: level || 'All Levels',
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    // AI Evaluation if Gemini API key exists
    if (geminiApiKey) {
      try {
        const prompt = `You are a Conference Committee Reviewer for TechCon 2026. Review this Call For Papers (CFP) proposal and provide structured JSON analysis.
Title: ${title}
Abstract: ${abstract}
Target Track: ${targetTrack}
Target Level: ${level}

Evaluate clarity, relevance, and engagement. Return JSON matching the schema.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                clarityScore: { type: Type.NUMBER, description: 'Score between 0 and 100' },
                overallRating: { type: Type.STRING, description: 'Strong Accept | Accept | Needs Revision | Reject' },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestedTrack: { type: Type.STRING, description: 'Best matching track name' }
              },
              required: ['clarityScore', 'overallRating', 'strengths', 'improvements', 'suggestedTrack']
            }
          }
        });

        if (response.text) {
          const aiResult = JSON.parse(response.text.trim());
          proposal.aiAnalysis = {
            clarityScore: aiResult.clarityScore || 85,
            overallRating: aiResult.overallRating || 'Accept',
            strengths: aiResult.strengths || ['Good technical scope'],
            improvements: aiResult.improvements || ['Elaborate on real-world examples'],
            suggestedTrack: (aiResult.suggestedTrack as SessionTrack) || targetTrack
          };
        }
      } catch (err) {
        console.error('CFP AI evaluation error:', err);
      }
    }

    // Default fallback AI analysis if API key missing or parse failed
    if (!proposal.aiAnalysis) {
      proposal.aiAnalysis = {
        clarityScore: 88,
        overallRating: 'Accept',
        strengths: ['Well structured topic', 'Appeals to target audience'],
        improvements: ['Include interactive slides or live demo'],
        suggestedTrack: targetTrack || 'Web Development'
      };
    }

    cfpStore.unshift(proposal);
    res.json({ success: true, proposal });
  });

  // AI Assistant Endpoint (Itinerary Matcher / Q&A / Abstract Summarizer)
  app.post('/api/ai/assistant', async (req, res) => {
    const { prompt, userRole, userInterests, currentAgendaIds, type } = req.body;

    if (!geminiApiKey) {
      return res.json({
        reply: "AI features require GEMINI_API_KEY. Here is a quick tip: browse sessions by Track in the Schedule view and filter for topics matching your profile!"
      });
    }

    try {
      const sessionSummary = sessionsStore.map(s => 
        `ID: ${s.id} | Day ${s.day} (${s.startTime}-${s.endTime}) | Track: ${s.track} | Title: "${s.title}" | Speaker(s): ${s.speakerIds.map(spkId => speakersStore.find(sp => sp.id === spkId)?.name).join(', ')}`
      ).join('\n');

      const systemInstruction = `You are "Confect", the intelligent AI Concierge for TechCon 2026.
You assist conference attendees, speakers, and organizers.
When asked to recommend a schedule or answer schedule questions, use the real conference sessions listed below.

Session Schedule Database:
${sessionSummary}

User Profile Context:
- Role: ${userRole || 'Attendee'}
- Interests: ${(userInterests || []).join(', ') || 'General Technology'}
- Currently Saved Sessions: ${(currentAgendaIds || []).join(', ') || 'None yet'}

Respond politely, format recommendations with clear session titles, times, and tracks. Keep answers concise, actionable, and engaging.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt || 'Suggest a top 3 session itinerary for me.',
        config: {
          systemInstruction
        }
      });

      res.json({ reply: response.text || 'I am ready to assist with your conference itinerary!' });
    } catch (err) {
      console.error('Gemini AI error:', err);
      res.status(500).json({ error: 'Failed to process AI assistant query.' });
    }
  });


  // --- VITE MIDDLEWARE FOR DEV / SERVE FOR PROD ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
