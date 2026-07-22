import { 
  Session, 
  Speaker, 
  Attendee, 
  QAQuestion, 
  SessionPoll, 
  CFPProposal, 
  Conference, 
  TourismItem, 
  AppNotification, 
  AuditLogEntry, 
  DirectMessage, 
  SystemSettings,
  User,
  UserRole
} from '../types';

const AUTH_TOKEN_KEY = 'shc_auth_token';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const api = {
  // Authentication & Authorization
  async getDummyUsers() {
    const res = await fetch('/api/auth/dummy-users');
    if (!res.ok) throw new Error('Failed to fetch demo users');
    return res.json() as Promise<User[]>;
  },

  async login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json() as { success: boolean; user: User };
    if (data.user.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.user.token);
    }
    return data.user;
  },

  async register(data: {
    fullName: string;
    email: string;
    password: string;
    company?: string;
    jobTitle?: string;
    role?: UserRole;
  }) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    const result = await res.json() as { success: boolean; user: User };
    if (result.user.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, result.user.token);
    }
    return result.user;
  },

  async getCurrentUser() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        return null;
      }
      return res.json() as Promise<User>;
    } catch {
      return null;
    }
  },

  async switchDemoUser(role: UserRole) {
    const res = await fetch('/api/auth/switch-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    if (!res.ok) throw new Error('Failed to switch demo user');
    const data = await res.json() as { success: boolean; user: User };
    if (data.user.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.user.token);
    }
    return data.user;
  },

  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  // Stats
  async getStats() {
    const res = await fetch('/api/conference/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  // Sessions
  async getSessions(filters?: { day?: number; track?: string; speakerId?: string }) {
    const params = new URLSearchParams();
    if (filters?.day) params.set('day', String(filters.day));
    if (filters?.track) params.set('track', filters.track);
    if (filters?.speakerId) params.set('speakerId', filters.speakerId);

    const res = await fetch(`/api/sessions?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json() as Promise<Session[]>;
  },

  async saveSession(sessionData: Partial<Session>) {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(sessionData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save session');
    }
    return res.json();
  },

  async deleteSession(id: string) {
    const res = await fetch(`/api/sessions/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete session');
    }
    return res.json();
  },

  // Speakers
  async getSpeakers() {
    const res = await fetch('/api/speakers');
    if (!res.ok) throw new Error('Failed to fetch speakers');
    return res.json() as Promise<Speaker[]>;
  },

  async saveSpeaker(speakerData: Partial<Speaker>) {
    const res = await fetch('/api/speakers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(speakerData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save speaker');
    }
    return res.json();
  },

  // Attendees
  async getAttendees() {
    const res = await fetch('/api/attendees', {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch attendees');
    return res.json() as Promise<Attendee[]>;
  },

  async registerAttendee(data: {
    fullName: string;
    email: string;
    company: string;
    jobTitle: string;
    ticketTier: string;
    interests: string[];
    dietaryPreference: string;
    tshirtSize: string;
    isNetworkingOptIn: boolean;
    bio?: string;
  }) {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to register');
    }
    return res.json() as Promise<{ success: boolean; attendee: Attendee }>;
  },

  async toggleCheckIn(attendeeId: string) {
    const res = await fetch(`/api/attendees/${attendeeId}/checkin`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders()
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to toggle check-in');
    }
    return res.json() as Promise<{ success: boolean; attendee: Attendee }>;
  },

  // Q&A
  async getQA(sessionId: string) {
    const res = await fetch(`/api/qa/${sessionId}`);
    if (!res.ok) throw new Error('Failed to fetch questions');
    return res.json() as Promise<QAQuestion[]>;
  },

  async submitQA(data: { sessionId: string; authorName: string; authorCompany?: string; text: string }) {
    const res = await fetch('/api/qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit question');
    return res.json() as Promise<{ success: boolean; question: QAQuestion }>;
  },

  async upvoteQA(questionId: string) {
    const res = await fetch(`/api/qa/${questionId}/upvote`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to upvote');
    return res.json() as Promise<{ success: boolean; question: QAQuestion }>;
  },

  // Poll
  async getPoll(sessionId: string) {
    const res = await fetch(`/api/poll/${sessionId}`);
    if (!res.ok) throw new Error('Failed to fetch poll');
    return res.json() as Promise<SessionPoll | null>;
  },

  async votePoll(pollId: string, optionId: string) {
    const res = await fetch('/api/poll/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId, optionId })
    });
    if (!res.ok) throw new Error('Failed to submit vote');
    return res.json() as Promise<{ success: boolean; poll: SessionPoll }>;
  },

  // CFP
  async getCFP() {
    const res = await fetch('/api/cfp');
    if (!res.ok) throw new Error('Failed to fetch proposals');
    return res.json() as Promise<CFPProposal[]>;
  },

  async submitCFP(proposalData: {
    speakerName: string;
    speakerEmail: string;
    speakerCompany: string;
    speakerBio: string;
    title: string;
    abstract: string;
    targetTrack: string;
    level: string;
  }) {
    const res = await fetch('/api/cfp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(proposalData)
    });
    if (!res.ok) throw new Error('Failed to submit CFP');
    return res.json() as Promise<{ success: boolean; proposal: CFPProposal }>;
  },

  async updateCFPStatus(id: string, status: 'approved' | 'rejected' | 'under_review') {
    const res = await fetch(`/api/cfp/${id}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update CFP status');
    }
    return res.json() as Promise<{ success: boolean; proposal: CFPProposal }>;
  },

  // LiveKit WebRTC Conferencing
  async getLiveKitConfig() {
    const res = await fetch('/api/livekit/config');
    if (!res.ok) throw new Error('Failed to fetch LiveKit config');
    return res.json() as Promise<{ wsUrl: string; configured: boolean }>;
  },

  async getLiveKitToken(data: { roomName: string; participantName: string; identity?: string; isSpeaker?: boolean }) {
    const res = await fetch('/api/livekit/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to generate LiveKit token');
    return res.json() as Promise<{
      token: string;
      wsUrl: string;
      roomName: string;
      identity: string;
      participantName: string;
      isSpeaker: boolean;
    }>;
  },

  // Multi-Conference Management
  async getConferences() {
    const res = await fetch('/api/conferences');
    if (!res.ok) throw new Error('Failed to fetch conferences');
    return res.json() as Promise<Conference[]>;
  },

  async createConference(data: Partial<Conference>) {
    const res = await fetch('/api/conferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create conference');
    }
    return res.json() as Promise<Conference>;
  },

  // Rwanda Tourism Module
  async getTourism(category?: string) {
    const url = category ? `/api/tourism?category=${encodeURIComponent(category)}` : '/api/tourism';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch tourism information');
    return res.json() as Promise<TourismItem[]>;
  },

  // App Notifications
  async getNotifications() {
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json() as Promise<AppNotification[]>;
  },

  async markNotificationsRead() {
    const res = await fetch('/api/notifications/read', {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to mark notifications read');
    return res.json() as Promise<{ success: boolean; notifications: AppNotification[] }>;
  },

  // Audit Logs
  async getAuditLogs() {
    const res = await fetch('/api/audit-logs', {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json() as Promise<AuditLogEntry[]>;
  },

  // Direct Networking Messages
  async getMessages() {
    const res = await fetch('/api/messages', {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch direct messages');
    return res.json() as Promise<DirectMessage[]>;
  },

  async sendMessage(data: { receiverId: string; text: string; senderName?: string; senderAvatar?: string }) {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json() as Promise<DirectMessage>;
  },

  // System Settings
  async getSettings() {
    const res = await fetch('/api/settings', {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json() as Promise<SystemSettings>;
  },

  async updateSettings(data: Partial<SystemSettings>) {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update settings');
    }
    return res.json() as Promise<SystemSettings>;
  },

  // AI Assistant
  async askAIAssistant(data: {
    prompt: string;
    userRole?: string;
    userInterests?: string[];
    currentAgendaIds?: string[];
  }) {
    const res = await fetch('/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('AI Assistant request failed');
    return res.json() as Promise<{ reply: string }>;
  },

  async sendBroadcastNotification(title: string, message: string, type: 'info' | 'alert' | 'success' = 'info') {
    const res = await fetch('/api/notifications/broadcast', {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, type })
    });
    if (!res.ok) throw new Error('Failed to send broadcast notification');
    return res.json() as Promise<{ success: boolean; notification: AppNotification; notifications: AppNotification[] }>;
  },

  // Database & Seeding Management
  async getDatabaseStatus() {
    const res = await fetch('/api/database/status', {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch database status');
    return res.json() as Promise<{
      configured: boolean;
      databaseType: string;
      counts: {
        users: number;
        conferences: number;
        speakers: number;
        sessions: number;
        proposals: number;
      };
      timestamp: string;
    }>;
  },

  async seedDatabase() {
    const res = await fetch('/api/database/seed', {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to execute database seeding');
    return res.json() as Promise<{
      success: boolean;
      seeded: boolean;
      reason?: string;
      counts?: Record<string, number>;
      error?: string;
    }>;
  }
};
