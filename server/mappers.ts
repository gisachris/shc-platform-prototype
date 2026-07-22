import {
  Session,
  Speaker,
  Attendee,
  Conference,
  TourismItem,
  CFPProposal,
  QAQuestion,
  SessionPoll,
  AppNotification,
  AuditLogEntry,
  DirectMessage,
  SystemSettings,
} from '../src/types';

export function mapConference(row: any): Conference {
  return {
    id: row.id,
    title: row.title,
    shortCode: row.short_code || '',
    tagline: row.tagline || '',
    description: row.description || '',
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    venueName: row.venue_name || '',
    city: row.city || 'Kigali',
    country: row.country || 'Rwanda',
    hostOrg: row.host_org || 'Rwanda Convention Bureau',
    status: row.status || 'published',
    bannerImage: row.banner_image || '',
    logoImage: row.logo_image || '',
    capacity: row.capacity ?? 1000,
    registeredCount: row.registered_count ?? 0,
    isVirtualAllowed: row.is_virtual_allowed ?? true,
    isHybridAllowed: row.is_hybrid_allowed ?? true,
    hasTourismGuide: row.has_tourism_guide ?? true,
  };
}

export function mapSpeaker(row: any): Speaker {
  return {
    id: row.id,
    name: row.name,
    role: row.role || '',
    company: row.company || '',
    bio: row.bio || '',
    avatar: row.avatar || '',
    email: row.email || '',
    location: row.location || 'Kigali, Rwanda',
    socials: row.socials || {},
    topics: row.topics || [],
    rating: Number(row.rating ?? 5),
    featuredSessionId: row.featured_session_id || undefined,
  };
}

export function mapSession(row: any): Session {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    day: row.day ?? 1,
    startTime: row.start_time || '',
    endTime: row.end_time || '',
    startMinutes: row.start_minutes ?? 0,
    endMinutes: row.end_minutes ?? 0,
    track: row.track,
    room: row.room || '',
    capacity: row.capacity ?? 100,
    registeredCount: row.registered_count ?? 0,
    speakerIds: row.speaker_ids || [],
    level: row.level || 'All Levels',
    tags: row.tags || [],
    isLive: row.is_live ?? false,
    isFeatured: row.is_featured ?? false,
    slidesUrl: row.slides_url || undefined,
    videoUrl: row.video_url || undefined,
    prerequisites: row.prerequisites || undefined,
  };
}

export function mapAttendee(row: any): Attendee & { conferenceId?: string; attendanceMode?: string } {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    ticketTier: row.ticket_tier || 'general',
    fullName: row.full_name,
    email: row.email,
    company: row.company || '',
    jobTitle: row.job_title || '',
    interests: row.interests || [],
    dietaryPreference: row.dietary_preference || 'None',
    tshirtSize: row.tshirt_size || 'L',
    isNetworkingOptIn: row.is_networking_opt_in ?? true,
    isCheckedIn: row.is_checked_in ?? false,
    registeredAt: row.registered_at || new Date().toISOString(),
    qrCodeData: row.qr_code_data,
    avatar: row.avatar || '',
    bio: row.bio || '',
    conferenceId: row.conference_id || undefined,
    attendanceMode: row.attendance_mode || 'hybrid',
  };
}

export function mapCfp(row: any): CFPProposal & { aiStatus?: string; conferenceId?: string } {
  return {
    id: row.id,
    speakerName: row.speaker_name,
    speakerEmail: row.speaker_email || '',
    speakerCompany: row.speaker_company || '',
    speakerBio: row.speaker_bio || '',
    title: row.title,
    abstract: row.abstract,
    targetTrack: row.target_track,
    level: row.level,
    status: row.status || 'pending',
    submittedAt: row.submitted_at || new Date().toISOString(),
    aiAnalysis: row.ai_analysis || undefined,
    aiStatus: row.ai_status || 'none',
    conferenceId: row.conference_id || undefined,
  };
}

export function mapQa(row: any, userId?: string): QAQuestion {
  const upvotedBy: string[] = row.upvoted_by || [];
  return {
    id: row.id,
    sessionId: row.session_id,
    authorName: row.author_name,
    authorCompany: row.author_company || '',
    text: row.text,
    upvotes: row.upvotes ?? 0,
    createdAt: row.created_at || 'Just now',
    isAnswered: row.is_answered ?? false,
    upvotedByUser: userId ? upvotedBy.includes(userId) : false,
  };
}

export function mapPoll(row: any): SessionPoll {
  return {
    id: row.id,
    sessionId: row.session_id,
    question: row.question,
    options: row.options || [],
    isActive: row.is_active ?? true,
  };
}

export function mapTourism(row: any): TourismItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description || '',
    location: row.location || '',
    distanceFromVenue: row.distance_from_venue || '',
    image: row.image || '',
    rating: row.rating != null ? Number(row.rating) : undefined,
    contactNumber: row.contact_number || undefined,
    website: row.website || undefined,
    priceRange: row.price_range || undefined,
    highlights: row.highlights || [],
  };
}

export function mapNotification(row: any): AppNotification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    timestamp: row.timestamp || '',
    type: row.type || 'info',
    read: row.read ?? false,
    linkTab: row.link_tab || undefined,
  };
}

export function mapAudit(row: any): AuditLogEntry {
  return {
    id: row.id,
    action: row.action,
    actor: row.actor,
    target: row.target,
    timestamp: row.timestamp,
    category: row.category,
    details: row.details || undefined,
  };
}

export function mapMessage(row: any): DirectMessage {
  return {
    id: row.id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderAvatar: row.sender_avatar || '',
    receiverId: row.receiver_id,
    text: row.text,
    timestamp: row.timestamp,
  };
}

export function mapSettings(row: any): SystemSettings {
  return {
    autoApproveRegistration: row.auto_approve_registration ?? true,
    livekitServerUrl: row.livekit_server_url || '',
    smtpConfigured: row.smtp_configured ?? false,
    emergencyHotline: row.emergency_hotline || '',
    allowPublicCFP: row.allow_public_cfp ?? true,
    defaultTimezone: row.default_timezone || 'CAT (Central Africa Time / Kigali GMT+2)',
  };
}
