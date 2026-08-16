/**
 * Frontend API client for the Express backend.
 *
 * This file centralizes all fetch calls used by the client to authenticate users, manage
 * sessions, handle conferences, check in attendees, and access engagement features. It connects
 * the React UI to the server routes in the Express app.
 */

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
} from '../shared/types';

const AUTH_TOKEN_KEY = 'shc_auth_token';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(res: Response, fallback: string) {
  const err = await res.json().catch(() => ({}));
  throw new Error(err.error || fallback);
}

export const api = {
  async login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) await parseError(res, 'Login failed');
    const data = (await res.json()) as { success: boolean; user: User };
    if (data.user.token) localStorage.setItem(AUTH_TOKEN_KEY, data.user.token);
    return data.user;
  },

  async register(data: {
    fullName: string;
    email: string;
    password: string;
    company?: string;
    jobTitle?: string;
  }) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) await parseError(res, 'Registration failed');
    const result = (await res.json()) as {
      success: boolean;
      user: User;
      welcomeEmailSent?: boolean;
      welcomeEmailMessage?: string;
    };
    if (result.user.token) localStorage.setItem(AUTH_TOKEN_KEY, result.user.token);
    return result;
  },

  async forgotPassword(email: string) {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) await parseError(res, 'Password reset request failed');
    return res.json() as Promise<{
      success: boolean;
      message: string;
      emailConfigured?: boolean;
      emailSent?: boolean;
      resetLink?: string;
    }>;
  },

  async resetPassword(token: string, newPassword: string) {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    if (!res.ok) await parseError(res, 'Password reset failed');
    return res.json() as Promise<{ success: boolean; message: string }>;
  },

  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  async getCurrentUser() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return null;
    try {
      const res = await fetch('/api/auth/me', { headers: getAuthHeaders() });
      if (!res.ok) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        return null;
      }
      return res.json() as Promise<User>;
    } catch {
      return null;
    }
  },

  async getStats(conferenceId?: string) {
    const q = conferenceId ? `?conferenceId=${encodeURIComponent(conferenceId)}` : '';
    const res = await fetch(`/api/conference/stats${q}`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async getEngagementAnalytics() {
    const res = await fetch('/api/analytics/engagement', { headers: getAuthHeaders() });
    if (!res.ok) await parseError(res, 'Failed to fetch engagement analytics');
    return res.json();
  },

  async getSessions(filters?: { day?: number; track?: string; speakerId?: string; conferenceId?: string }) {
    const params = new URLSearchParams();
    if (filters?.day) params.set('day', String(filters.day));
    if (filters?.track) params.set('track', filters.track);
    if (filters?.speakerId) params.set('speakerId', filters.speakerId);
    if (filters?.conferenceId) params.set('conferenceId', filters.conferenceId);
    const res = await fetch(`/api/sessions?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json() as Promise<Session[]>;
  },

  async saveSession(sessionData: Partial<Session> & { conferenceId?: string }) {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(sessionData),
    });
    if (!res.ok) await parseError(res, 'Failed to save session');
    return res.json();
  },

  async deleteSession(id: string) {
    const res = await fetch(`/api/sessions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) await parseError(res, 'Failed to delete session');
    return res.json();
  },

  async getSpeakers() {
    const res = await fetch('/api/speakers');
    if (!res.ok) throw new Error('Failed to fetch speakers');
    return res.json() as Promise<Speaker[]>;
  },

  async saveSpeaker(speakerData: Partial<Speaker>) {
    const res = await fetch('/api/speakers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(speakerData),
    });
    if (!res.ok) await parseError(res, 'Failed to save speaker');
    return res.json();
  },

  async getAttendees(conferenceId?: string) {
    const q = conferenceId ? `?conferenceId=${encodeURIComponent(conferenceId)}` : '';
    const res = await fetch(`/api/attendees${q}`, { headers: getAuthHeaders() });
    if (!res.ok) await parseError(res, 'Failed to fetch attendees');
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
    conferenceId?: string;
    attendanceMode?: string;
  }) {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) await parseError(res, 'Failed to register');
    return res.json() as Promise<{ success: boolean; attendee: Attendee }>;
  },

  async toggleCheckIn(attendeeId: string) {
    const res = await fetch(`/api/attendees/${attendeeId}/checkin`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) await parseError(res, 'Failed to toggle check-in');
    return res.json() as Promise<{ success: boolean; attendee: Attendee }>;
  },

  async checkInByTicket(ticketId: string) {
    const res = await fetch('/api/attendees/checkin-by-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ ticketId }),
    });
    if (!res.ok) await parseError(res, 'Check-in failed');
    return res.json() as Promise<{ success: boolean; attendee: Attendee }>;
  },

  async getQA(sessionId: string) {
    const res = await fetch(`/api/qa/${sessionId}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch questions');
    return res.json() as Promise<QAQuestion[]>;
  },

  async submitQA(data: { sessionId: string; text: string; authorCompany?: string }) {
    const res = await fetch('/api/qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) await parseError(res, 'Failed to submit question');
    return res.json() as Promise<{ success: boolean; question: QAQuestion }>;
  },

  async upvoteQA(questionId: string) {
    const res = await fetch(`/api/qa/${questionId}/upvote`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) await parseError(res, 'Failed to upvote');
    return res.json() as Promise<{ success: boolean; question: QAQuestion }>;
  },

  async getPoll(sessionId: string) {
    const res = await fetch(`/api/poll/${sessionId}`);
    if (!res.ok) throw new Error('Failed to fetch poll');
    return res.json() as Promise<SessionPoll | null>;
  },

  async votePoll(pollId: string, optionId: string) {
    const res = await fetch('/api/poll/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ pollId, optionId }),
    });
    if (!res.ok) await parseError(res, 'Failed to submit vote');
    return res.json() as Promise<{ success: boolean; poll: SessionPoll }>;
  },

  async getCFP() {
    const res = await fetch('/api/cfp', { headers: getAuthHeaders() });
    if (!res.ok) await parseError(res, 'Failed to fetch proposals');
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
    conferenceId?: string;
  }) {
    const res = await fetch('/api/cfp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(proposalData),
    });
    if (!res.ok) await parseError(res, 'Failed to submit CFP');
    return res.json() as Promise<{
      success: boolean;
      proposal: CFPProposal;
      aiStatus: string;
      aiError?: string;
    }>;
  },

  async updateCFPStatus(id: string, status: 'pending' | 'accepted' | 'rejected') {
    const res = await fetch(`/api/cfp/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) await parseError(res, 'Failed to update CFP status');
    return res.json() as Promise<{ success: boolean; proposal: CFPProposal }>;
  },

  async getLiveKitConfig() {
    const res = await fetch('/api/livekit/config');
    if (!res.ok) throw new Error('Failed to fetch LiveKit config');
    return res.json() as Promise<{ wsUrl: string | null; configured: boolean }>;
  },

  async getLiveKitToken(data: {
    sessionId?: string;
    roomName?: string;
    participantName: string;
  }) {
    const res = await fetch('/api/livekit/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) await parseError(res, 'Failed to generate LiveKit token');
    return res.json() as Promise<{
      token: string;
      wsUrl: string;
      roomName: string;
      identity: string;
      participantName: string;
      canPublish: boolean;
    }>;
  },

  async getConferences() {
    const res = await fetch('/api/conferences');
    if (!res.ok) throw new Error('Failed to fetch conferences');
    return res.json() as Promise<Conference[]>;
  },

  async createConference(data: Partial<Conference>) {
    const res = await fetch('/api/conferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) await parseError(res, 'Failed to create conference');
    return res.json() as Promise<Conference>;
  },

  async getTourism(category?: string) {
    const url = category ? `/api/tourism?category=${encodeURIComponent(category)}` : '/api/tourism';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch tourism information');
    return res.json() as Promise<TourismItem[]>;
  },

  async getNotifications() {
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json() as Promise<AppNotification[]>;
  },

  async markNotificationsRead() {
    const res = await fetch('/api/notifications/read', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to mark notifications read');
    return res.json() as Promise<{ success: boolean; notifications: AppNotification[] }>;
  },

  async getAuditLogs() {
    const res = await fetch('/api/audit-logs', { headers: getAuthHeaders() });
    if (!res.ok) await parseError(res, 'Failed to fetch audit logs');
    return res.json() as Promise<AuditLogEntry[]>;
  },

  async getMessages() {
    const res = await fetch('/api/messages', { headers: getAuthHeaders() });
    if (!res.ok) await parseError(res, 'Failed to fetch direct messages');
    return res.json() as Promise<DirectMessage[]>;
  },

  async sendMessage(data: { receiverId: string; text: string }) {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) await parseError(res, 'Failed to send message');
    return res.json() as Promise<DirectMessage>;
  },

  async getNetworkingMatches() {
    const res = await fetch('/api/networking/matches', { headers: getAuthHeaders() });
    if (!res.ok) await parseError(res, 'Failed to fetch networking matches');
    return res.json() as Promise<{
      matches: Array<{
        attendee: {
          id: string;
          fullName: string;
          email: string;
          company: string;
          jobTitle: string;
          interests: string[];
          avatar: string;
          bio: string;
        };
        score: number;
        sharedInterests: string[];
      }>;
      myInterests: string[];
    }>;
  },

  async getSettings() {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json() as Promise<SystemSettings>;
  },

  async updateSettings(data: Partial<SystemSettings>) {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) await parseError(res, 'Failed to update settings');
    return res.json() as Promise<SystemSettings>;
  },

  async sendBroadcastNotification(title: string, message: string, type: 'info' | 'alert' | 'reminder' | 'message' = 'info') {
    const res = await fetch('/api/notifications/broadcast', {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, type }),
    });
    if (!res.ok) throw new Error('Failed to send broadcast notification');
    return res.json() as Promise<{ success: boolean; notification: AppNotification; notifications: AppNotification[] }>;
  },

  async getDatabaseStatus() {
    const res = await fetch('/api/database/status');
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
};
