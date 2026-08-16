/**
 * Shared TypeScript contracts for the SHC platform.
 *
 * This file defines the domain models used across the frontend and backend: user roles,
 * sessions, speakers, attendees, conferences, proposals, and related UI data. It is the core
 * type contract that ties the app together across APIs, components, and validators.
 */

export type UserRole = 
  | 'guest'
  | 'attendee'
  | 'speaker'
  | 'moderator'
  | 'organizer'
  | 'administrator'
  | 'super_admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  company: string;
  jobTitle: string;
  avatar: string;
  ticketTier?: TicketTierId;
  ticketId?: string;
  assignedSessionIds?: string[]; // For speakers/moderators
  bio?: string;
  token?: string;
}

export type SessionTrack = 
  | 'AI & Machine Learning'
  | 'Cloud & Architecture'
  | 'Web Development'
  | 'Cybersecurity'
  | 'UX & Product Design'
  | 'DevOps & SRE'
  | 'Keynote';

export type SessionLevel = 'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced';

export interface Session {
  id: string;
  title: string;
  description: string;
  day: number; // 1, 2, or 3
  startTime: string; // e.g. "09:00 AM"
  endTime: string; // e.g. "10:15 AM"
  startMinutes: number; // minutes from 00:00 for sorting/collision check
  endMinutes: number;
  track: SessionTrack;
  room: string;
  capacity: number;
  registeredCount: number;
  speakerIds: string[];
  level: SessionLevel;
  tags: string[];
  isLive?: boolean;
  isFeatured?: boolean;
  slidesUrl?: string;
  videoUrl?: string;
  prerequisites?: string;
}

export interface Speaker {
  id: string;
  name: string;
  role: string;
  company: string;
  bio: string;
  avatar: string;
  email: string;
  location: string;
  socials: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  topics: string[];
  rating: number; // 1.0 - 5.0
  featuredSessionId?: string;
}

export type TicketTierId = 'general' | 'vip' | 'workshop' | 'virtual';

export interface TicketTier {
  id: TicketTierId;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  badgeColor: string;
}

export interface Attendee {
  id: string;
  ticketId: string;
  ticketTier: TicketTierId;
  fullName: string;
  email: string;
  company: string;
  jobTitle: string;
  interests: string[];
  dietaryPreference: string;
  tshirtSize: string;
  isNetworkingOptIn: boolean;
  isCheckedIn: boolean;
  registeredAt: string;
  qrCodeData: string;
  avatar: string;
  bio?: string;
}

export interface QAQuestion {
  id: string;
  sessionId: string;
  authorName: string;
  authorCompany?: string;
  text: string;
  upvotes: number;
  createdAt: string;
  isAnswered: boolean;
  upvotedByUser?: boolean;
}

export interface SessionPollOption {
  id: string;
  text: string;
  votes: number;
}

export interface SessionPoll {
  id: string;
  sessionId: string;
  question: string;
  options: SessionPollOption[];
  isActive: boolean;
}

export interface CFPProposal {
  id: string;
  speakerName: string;
  speakerEmail: string;
  speakerCompany: string;
  speakerBio: string;
  title: string;
  abstract: string;
  targetTrack: SessionTrack;
  level: SessionLevel;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
  aiAnalysis?: {
    clarityScore: number; // 0 - 100
    overallRating: 'Strong Accept' | 'Accept' | 'Needs Revision' | 'Reject';
    strengths: string[];
    improvements: string[];
    suggestedTrack: SessionTrack;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedSessions?: Session[];
}

export type ConferenceStatus = 'draft' | 'published' | 'ongoing' | 'archived';

export interface Conference {
  id: string;
  title: string;
  shortCode: string;
  tagline: string;
  description: string;
  startDate: string;
  endDate: string;
  venueName: string;
  city: string;
  country: string;
  hostOrg: string; // e.g. "SHC Platform Secretariat"
  status: ConferenceStatus;
  bannerImage: string;
  logoImage: string;
  capacity: number;
  registeredCount: number;
  isVirtualAllowed: boolean;
  isHybridAllowed: boolean;
  hasTourismGuide: boolean;
}

export type TourismCategory = 'attraction' | 'hotel' | 'restaurant' | 'transport' | 'emergency';

export interface TourismItem {
  id: string;
  title: string;
  category: TourismCategory;
  description: string;
  location: string;
  distanceFromVenue: string; // e.g. "2.5 km from Kigali Convention Centre"
  image: string;
  rating?: number;
  contactNumber?: string;
  website?: string;
  priceRange?: string; // e.g. "$$", "Free"
  highlights: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'alert' | 'info' | 'reminder' | 'message';
  read: boolean;
  linkTab?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
  category: 'checkin' | 'session' | 'conference' | 'security' | 'system';
  details?: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  text: string;
  timestamp: string;
}

export interface ConnectionRequest {
  id: string;
  fromAttendeeId: string;
  fromAttendeeName: string;
  toAttendeeId: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

export interface SystemSettings {
  autoApproveRegistration: boolean;
  livekitServerUrl: string;
  smtpConfigured: boolean;
  emergencyHotline: string;
  allowPublicCFP: boolean;
  defaultTimezone: string;
}
