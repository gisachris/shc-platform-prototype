import React, { useState, useMemo, useEffect } from 'react';
import { User, Session, Conference, Speaker, Attendee, DirectMessage } from '../types';
import { api } from '../services/api';
import { 
  Building2, 
  Clock, 
  Mic, 
  Ticket, 
  Sparkles, 
  Bookmark, 
  MessageSquare, 
  Coffee, 
  Search, 
  Send, 
  Check, 
  ArrowRight, 
  UserCheck, 
  Radio, 
  Calendar,
  ShieldCheck,
  FileText,
  Users,
  QrCode
} from 'lucide-react';

interface UserDashboardViewProps {
  currentUser: User;
  sessions: Session[];
  conferences: Conference[];
  speakers: Speaker[];
  savedSessionIds: string[];
  attendees: Attendee[];
  onNavigateTab: (tab: any) => void;
  onOpenSessionModal: (session: Session) => void;
  onOpenLiveKitRoom: (session: Session) => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  currentUser,
  sessions,
  conferences,
  speakers,
  savedSessionIds,
  attendees,
  onNavigateTab,
  onOpenSessionModal,
  onOpenLiveKitRoom
}) => {
  // Saved sessions filter
  const bookmarkedSessions = useMemo(() => {
    return sessions.filter(s => savedSessionIds.includes(s.id));
  }, [sessions, savedSessionIds]);

  // Networking Directory state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('All');
  const [activeMessageAttendee, setActiveMessageAttendee] = useState<Attendee | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [msgSentSuccess, setMsgSentSuccess] = useState(false);
  const [suggestedMatches, setSuggestedMatches] = useState<
    Array<{ attendee: any; score: number; sharedInterests: string[] }>
  >([]);

  useEffect(() => {
    api.getNetworkingMatches()
      .then((res) => setSuggestedMatches(res.matches || []))
      .catch(() => setSuggestedMatches([]));
  }, [currentUser.id]);

  // Filter networking opt-in delegates
  const networkingDelegates = useMemo(() => {
    return attendees.filter(a => {
      if (!a.isNetworkingOptIn) return false;
      if (selectedInterest !== 'All' && !a.interests.includes(selectedInterest)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.fullName.toLowerCase().includes(q) ||
          a.company.toLowerCase().includes(q) ||
          a.jobTitle.toLowerCase().includes(q) ||
          a.interests.some(i => i.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [attendees, selectedInterest, searchQuery]);

  const allInterests = useMemo(() => {
    const set = new Set<string>();
    attendees.forEach(a => a.interests.forEach(i => set.add(i)));
    return ['All', ...Array.from(set)];
  }, [attendees]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMessageAttendee || !messageText.trim()) return;

    setIsSendingMsg(true);
    try {
      await api.sendMessage({
        receiverId: activeMessageAttendee.id,
        text: messageText.trim(),
      });
      setMsgSentSuccess(true);
      setMessageText('');
      setTimeout(() => {
        setMsgSentSuccess(false);
        setActiveMessageAttendee(null);
      }, 1800);
    } catch (err) {
      console.error(err);
      alert('Failed to send message');
    } finally {
      setIsSendingMsg(false);
    }
  };

  const rolePills: Record<string, string> = {
    attendee: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    speaker: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    organizer: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    administrator: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    super_admin: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Personalized Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`}
              alt={currentUser.fullName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-amber-400/30 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${rolePills[currentUser.role] || rolePills.attendee}`}>
                  {currentUser.role.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-300 font-medium">SHC Platform Member</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome back, {currentUser.fullName}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                {currentUser.company ? `${currentUser.jobTitle || 'Delegate'} @ ${currentUser.company}` : currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('schedule')}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-amber-400/20"
            >
              <Clock className="w-4 h-4" />
              <span>View Full Schedule</span>
            </button>

            <button
              onClick={() => onNavigateTab('registration')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition"
            >
              <Ticket className="w-4 h-4 text-amber-400" />
              <span>Get Conference Pass</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Bookmarked Sessions</span>
            <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{bookmarkedSessions.length}</div>
          <p className="text-[11px] text-slate-500">In your personal agenda</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Active Summits</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{conferences.length}</div>
          <p className="text-[11px] text-slate-500">SHC Platform</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Keynote Speakers</span>
            <Mic className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{speakers.length}</div>
          <p className="text-[11px] text-slate-500">Global thought leaders</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Peer Delegates</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{attendees.length}</div>
          <p className="text-[11px] text-slate-500">Networking ready</p>
        </div>
      </div>

      {/* Main Grid: Left Column (Schedule & Conferences), Right Column (Networking Directory & Speakers) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Agenda & Active Events (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Personalized Bookmarked Agenda */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="text-base font-extrabold text-slate-900">My Saved Agenda ({bookmarkedSessions.length})</h3>
              </div>
              <button
                onClick={() => onNavigateTab('schedule')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Browse Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {bookmarkedSessions.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No sessions bookmarked yet</p>
                <p className="text-[11px] text-slate-500">
                  Head over to the Schedule view to star keynotes and workshops you wish to attend!
                </p>
                <button
                  onClick={() => onNavigateTab('schedule')}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition mt-2 inline-flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Explore Agenda</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarkedSessions.slice(0, 4).map(session => (
                  <div
                    key={session.id}
                    onClick={() => onOpenSessionModal(session)}
                    className="p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-xs transition cursor-pointer bg-gray-50/50 hover:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="font-extrabold text-blue-600">Day {session.day} • {session.startTime}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 font-medium">{session.room}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{session.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="bg-gray-200 text-slate-700 px-2 py-0.5 rounded font-semibold">{session.track}</span>
                        <span>{session.level}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenLiveKitRoom(session);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition shrink-0"
                    >
                      <Radio className="w-3 h-3 animate-pulse text-emerald-300" />
                      <span>Join Live Room</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Conferences */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">Featured Conferences & Summits</h3>
              </div>
              <button
                onClick={() => onNavigateTab('conferences')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {conferences.map(conf => (
                <div key={conf.id} className="border border-gray-200 rounded-xl p-4 space-y-2 hover:border-slate-400 transition bg-white shadow-2xs">
                  <span className="text-[10px] uppercase font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                    {conf.venueName}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{conf.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{conf.description}</p>
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{conf.startDate}</span>
                    <button
                      onClick={() => onNavigateTab('schedule')}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      View Sessions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Peer Networking Hub & Speakers (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Peer Networking Hub */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Peer Networking Directory</h3>
                  <p className="text-[11px] text-slate-500">Interest-based matches and delegate directory</p>
                </div>
              </div>
            </div>

            {suggestedMatches.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Suggested matches</div>
                {suggestedMatches.slice(0, 5).map((m) => (
                  <div key={m.attendee.id} className="flex items-center justify-between gap-2 bg-purple-50 border border-purple-100 rounded-xl p-2.5">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{m.attendee.fullName}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {m.sharedInterests.join(', ')} · score {m.score}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setActiveMessageAttendee({
                          id: m.attendee.id,
                          ticketId: '',
                          ticketTier: 'general',
                          fullName: m.attendee.fullName,
                          email: m.attendee.email,
                          company: m.attendee.company,
                          jobTitle: m.attendee.jobTitle,
                          interests: m.attendee.interests,
                          dietaryPreference: 'None',
                          tshirtSize: 'L',
                          isNetworkingOptIn: true,
                          isCheckedIn: false,
                          registeredAt: '',
                          qrCodeData: '',
                          avatar: m.attendee.avatar || '',
                          bio: m.attendee.bio || '',
                        })
                      }
                      className="text-[10px] font-bold text-purple-700 hover:underline shrink-0"
                    >
                      Message
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Directory Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search delegates by name, company, or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none text-[11px]">
                {allInterests.slice(0, 5).map(interest => (
                  <button
                    key={interest}
                    onClick={() => setSelectedInterest(interest)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition shrink-0 ${
                      selectedInterest === interest
                        ? 'bg-purple-700 text-white'
                        : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Delegate Cards */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {networkingDelegates.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No matching delegates found.</p>
              ) : (
                networkingDelegates.map(delegate => (
                  <div
                    key={delegate.id}
                    className="p-3 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/20 transition flex items-center justify-between gap-3 bg-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={delegate.avatarUrl}
                        alt={delegate.fullName}
                        className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-purple-100"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{delegate.fullName}</h4>
                        <p className="text-[11px] text-slate-500 truncate">{delegate.jobTitle} @ {delegate.company}</p>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {delegate.interests.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] bg-gray-100 text-slate-600 px-1.5 py-0.2 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveMessageAttendee(delegate)}
                      className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shrink-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Keynote Speakers Spotlight */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">Keynote Speakers</h3>
              </div>
              <button
                onClick={() => onNavigateTab('speakers')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {speakers.slice(0, 3).map(speaker => (
                <div key={speaker.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <img
                      src={speaker.imageUrl}
                      alt={speaker.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-blue-100"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{speaker.name}</h4>
                      <p className="text-[11px] text-slate-500">{speaker.title} @ {speaker.company}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateTab('speakers')}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Profile
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Direct Messaging Modal */}
      {activeMessageAttendee && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={activeMessageAttendee.avatarUrl}
                  alt={activeMessageAttendee.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{activeMessageAttendee.fullName}</h3>
                  <p className="text-[11px] text-slate-500">{activeMessageAttendee.jobTitle} @ {activeMessageAttendee.company}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveMessageAttendee(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {msgSentSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-900">Direct message sent!</p>
                <p className="text-[11px] text-emerald-700">
                  {activeMessageAttendee.fullName} has been notified.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Your Message / Coffee Chat Request</label>
                  <textarea
                    rows={4}
                    required
                    placeholder={`Hi ${activeMessageAttendee.fullName.split(' ')[0]}, I noticed your work in ${activeMessageAttendee.interests[0] || 'tech'} and would love to connect during the conference.`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveMessageAttendee(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingMsg || !messageText.trim()}
                    className="bg-purple-700 hover:bg-purple-800 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingMsg ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
