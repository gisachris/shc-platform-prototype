/**
 * Conference schedule and session browser.
 *
 * This view filters sessions by day, track, and level, supports saved-agenda tracking, and lets
 * users open session details. It connects to the session API and the SessionDetailModal for deep
 * session views.
 */

import React, { useState, useMemo } from 'react';
import { 
  Session, 
  Speaker, 
  SessionTrack, 
  SessionLevel,
  User 
} from '../shared/types';
import { 
  Calendar, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  Users, 
  Bookmark, 
  BookmarkCheck, 
  Check, 
  AlertTriangle, 
  Radio, 
  Layers, 
  UserCheck, 
  Sparkles, 
  Plus, 
  ChevronRight, 
  Info,
  SlidersHorizontal,
  ExternalLink,
  Video
} from 'lucide-react';

interface ScheduleViewProps {
  currentUser?: User | null;
  sessions: Session[];
  speakers: Speaker[];
  savedSessionIds: string[];
  toggleSaveSession: (sessionId: string) => void;
  onSelectSession: (session: Session) => void;
  onSelectSpeaker: (speakerId: string) => void;
  isLiveSimulated: boolean;
  simulatedTimeMinutes: number; // e.g. 600 (10:00 AM)
  onOpenAddSessionModal: () => void;
  onOpenLiveKitRoom?: (session: Session) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  currentUser,
  sessions,
  speakers,
  savedSessionIds,
  toggleSaveSession,
  onSelectSession,
  onSelectSpeaker,
  isLiveSimulated,
  simulatedTimeMinutes,
  onOpenAddSessionModal,
  onOpenLiveKitRoom
}) => {
  const isOrganizer = Boolean(currentUser && ['organizer', 'administrator', 'super_admin'].includes(currentUser.role));
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedTrack, setSelectedTrack] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'timeline' | 'grid' | 'saved'>('timeline');

  // Speaker Lookup Map
  const speakerMap = useMemo(() => {
    const map = new Map<string, Speaker>();
    speakers.forEach(s => map.set(s.id, s));
    return map;
  }, [speakers]);

  // Track list
  const tracks: (string | SessionTrack)[] = [
    'All',
    'Keynote',
    'AI & Machine Learning',
    'Web Development',
    'Cloud & Architecture',
    'Cybersecurity',
    'UX & Product Design',
    'DevOps & SRE'
  ];

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Day filter (unless viewing saved agenda across all days)
      if (viewMode !== 'saved' && session.day !== selectedDay) {
        return false;
      }

      // Track filter
      if (selectedTrack !== 'All' && session.track !== selectedTrack) {
        return false;
      }

      // Level filter
      if (selectedLevel !== 'All' && session.level !== selectedLevel) {
        return false;
      }

      // Saved agenda filter
      if (viewMode === 'saved' && !savedSessionIds.includes(session.id)) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const titleMatch = session.title.toLowerCase().includes(query);
        const descMatch = session.description.toLowerCase().includes(query);
        const roomMatch = session.room.toLowerCase().includes(query);
        const tagMatch = session.tags.some(t => t.toLowerCase().includes(query));
        const speakerMatch = session.speakerIds.some(spkId => {
          const spk = speakerMap.get(spkId);
          return spk ? spk.name.toLowerCase().includes(query) || spk.company.toLowerCase().includes(query) : false;
        });

        return titleMatch || descMatch || roomMatch || tagMatch || speakerMatch;
      }

      return true;
    }).sort((a, b) => a.startMinutes - b.startMinutes);
  }, [sessions, selectedDay, selectedTrack, selectedLevel, searchQuery, viewMode, savedSessionIds, speakerMap]);

  // Overlap Collision Check for Saved Agenda
  const collisions = useMemo(() => {
    const saved = sessions.filter(s => savedSessionIds.includes(s.id));
    const overlapPairs: { s1: Session; s2: Session }[] = [];

    for (let i = 0; i < saved.length; i++) {
      for (let j = i + 1; j < saved.length; j++) {
        const s1 = saved[i];
        const s2 = saved[j];
        if (s1.day === s2.day) {
          // Check minute overlap
          if (s1.startMinutes < s2.endMinutes && s2.startMinutes < s1.endMinutes) {
            overlapPairs.push({ s1, s2 });
          }
        }
      }
    }
    return overlapPairs;
  }, [sessions, savedSessionIds]);

  // Rooms list for Grid View
  const rooms = useMemo(() => {
    const rSet = new Set<string>();
    sessions.forEach(s => rSet.add(s.room));
    return Array.from(rSet);
  }, [sessions]);

  // Helper to get live status
  const getSessionLiveStatus = (session: Session) => {
    if (session.isLive) return 'live';
    if (!isLiveSimulated) return 'scheduled';
    if (session.day === selectedDay) {
      if (simulatedTimeMinutes >= session.startMinutes && simulatedTimeMinutes <= session.endMinutes) {
        return 'live';
      } else if (simulatedTimeMinutes < session.startMinutes && session.startMinutes - simulatedTimeMinutes <= 30) {
        return 'starting-soon';
      } else if (simulatedTimeMinutes > session.endMinutes) {
        return 'ended';
      }
    }
    return 'upcoming';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Controls & Live Ticker */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-slate-700 border border-gray-200">
                Oct 14 - 16, 2026
              </span>
              {isLiveSimulated && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 animate-pulse">
                  <Radio className="w-3 h-3 text-emerald-600" /> LIVE SIMULATION
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Conference Schedule & Tracks
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Filter by track, day, or search speakers. Save sessions to build your custom schedule.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isOrganizer && (
              <button
                onClick={onOpenAddSessionModal}
                className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition shadow-xs"
                title="Create a new conference session (Organizers Only)"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Add Session</span>
              </button>
            )}

            <button
              onClick={() => setViewMode(viewMode === 'saved' ? 'timeline' : 'saved')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                viewMode === 'saved'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${viewMode === 'saved' ? 'fill-slate-950' : ''}`} />
              <span>My Agenda ({savedSessionIds.length})</span>
            </button>
          </div>
        </div>

        {/* Day Selector Tabs */}
        {viewMode !== 'saved' && (
          <div className="mt-6 pt-5 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl border border-gray-200/80">
              {[
                { day: 1, date: 'Oct 14, Wed', theme: 'AI & Cloud Architecture' },
                { day: 2, date: 'Oct 15, Thu', theme: 'WebDev, Security & Design' },
                { day: 3, date: 'Oct 16, Fri', theme: 'DevOps & Keynote Finale' }
              ].map((d) => (
                <button
                  key={d.day}
                  onClick={() => setSelectedDay(d.day)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                    selectedDay === d.day
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-gray-200/60'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Day {d.day}</span>
                  <span className="text-[10px] opacity-75 font-normal hidden sm:inline">• {d.date}</span>
                </button>
              ))}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200/80">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'timeline' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Room Matrix
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Conflict Warning */}
      {collisions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 text-amber-900 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-amber-950">Schedule Collision Detected in Your Agenda:</span>
            <ul className="list-disc list-inside space-y-0.5 text-amber-900/90">
              {collisions.map((pair, idx) => (
                <li key={idx}>
                  <strong>Day {pair.s1.day}</strong>: "{pair.s1.title}" ({pair.s1.startTime}) overlaps with "{pair.s2.title}" ({pair.s2.startTime})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search session title, speaker, room, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-800"
              >
                Clear
              </button>
            )}
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500 font-medium">Level:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-slate-900"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Track Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-gray-100 pt-3">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-1 text-[10px]">
            Track:
          </span>
          {tracks.map((track) => (
            <button
              key={track}
              onClick={() => setSelectedTrack(track)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedTrack === track
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-gray-50 text-slate-600 border border-gray-200 hover:bg-gray-100 hover:text-slate-900'
              }`}
            >
              {track}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content View (Timeline or Grid Matrix) */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-slate-500 space-y-3 shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No sessions matched your criteria</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search keywords, track filters, or select a different day.
          </p>
          <button
            onClick={() => {
              setSelectedTrack('All');
              setSelectedLevel('All');
              setSearchQuery('');
            }}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'timeline' || viewMode === 'saved' ? (
        /* TIMELINE VIEW */
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const isSaved = savedSessionIds.includes(session.id);
            const status = getSessionLiveStatus(session);
            const capacityRatio = session.registeredCount / session.capacity;
            const isFull = capacityRatio >= 1.0;

            return (
              <div
                key={session.id}
                className={`bg-white border transition-all duration-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-gray-300 relative overflow-hidden group ${
                  status === 'live'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : isSaved
                    ? 'border-amber-400'
                    : 'border-gray-200'
                }`}
              >
                {/* Status Bar Indicator */}
                {status === 'live' && (
                  <div className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-widest py-0.5 px-3 rounded-b-md absolute top-0 left-6 flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    HAPPENING NOW
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: Time & Room */}
                  <div className="md:w-48 shrink-0 space-y-2">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{session.startTime} - {session.endTime}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{session.room}</span>
                    </div>

                    <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
                        Day {session.day}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
                        {session.level}
                      </span>
                    </div>
                  </div>

                  {/* Middle Column: Title, Track, Abstract, Speakers */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        session.track === 'Keynote'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : session.track === 'AI & Machine Learning'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : session.track === 'Web Development'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-slate-700 border border-gray-200'
                      }`}>
                        {session.track}
                      </span>

                      {session.isFeatured && (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                          <Sparkles className="w-3 h-3 fill-amber-700" /> Featured
                        </span>
                      )}
                    </div>

                    <h3 
                      onClick={() => onSelectSession(session)}
                      className="text-lg font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition leading-snug"
                    >
                      {session.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {session.description}
                    </p>

                    {/* Speakers row */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {session.speakerIds.map((spkId) => {
                        const speaker = speakerMap.get(spkId);
                        if (!speaker) return null;
                        return (
                          <div
                            key={spkId}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSpeaker(spkId);
                            }}
                            className="flex items-center gap-2 bg-gray-50 border border-gray-200 hover:border-blue-400 px-2.5 py-1 rounded-xl cursor-pointer group/spk transition"
                          >
                            <img
                              src={speaker.avatar}
                              alt={speaker.name}
                              className="w-6 h-6 rounded-full object-cover border border-gray-200"
                            />
                            <div>
                              <div className="text-xs font-semibold text-slate-800 group-hover/spk:text-blue-600 transition">
                                {speaker.name}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {speaker.company}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {session.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-medium text-slate-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Capacity Meter & Save Action */}
                  <div className="md:w-44 shrink-0 flex flex-col justify-between items-end gap-3 border-t md:border-t-0 md:border-l border-gray-200 pt-3 md:pt-0 md:pl-4">
                    {/* Capacity Indicator */}
                    <div className="w-full text-right space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          Seats
                        </span>
                        <span className="font-semibold text-slate-800">
                          {session.registeredCount} / {session.capacity}
                        </span>
                      </div>

                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden border border-gray-200">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isFull
                              ? 'bg-rose-500'
                              : capacityRatio > 0.8
                              ? 'bg-amber-500'
                              : 'bg-slate-900'
                          }`}
                          style={{ width: `${Math.min(100, capacityRatio * 100)}%` }}
                        ></div>
                      </div>

                      <div className="text-[10px] text-slate-500">
                        {isFull ? (
                          <span className="text-rose-600 font-semibold">Session Full (Waitlist)</span>
                        ) : (
                          <span>{(session.capacity - session.registeredCount)} seats remaining</span>
                        )}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-2 w-full pt-2">
                      {onOpenLiveKitRoom && (
                        <button
                          onClick={() => onOpenLiveKitRoom(session)}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Live Room</span>
                        </button>
                      )}

                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => toggleSaveSession(session.id)}
                          className={`p-2 rounded-xl border text-xs font-semibold transition ${
                            isSaved
                              ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                              : 'bg-gray-50 text-slate-600 border-gray-200 hover:text-slate-900 hover:bg-gray-100'
                          }`}
                          title={isSaved ? 'Remove from My Agenda' : 'Save to My Agenda'}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 fill-amber-600 text-amber-700" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => onSelectSession(session)}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition"
                        >
                          <span>Details & Q&A</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* GRID ROOM MATRIX VIEW */
        <div className="bg-white border border-gray-200 rounded-2xl p-6 overflow-x-auto shadow-sm">
          <div className="min-w-[800px] space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-700" />
              Day {selectedDay} Room Matrix Overview
            </h3>

            <div className="grid grid-cols-4 gap-4">
              {rooms.map((room) => {
                const roomSessions = filteredSessions.filter(s => s.room === room);
                return (
                  <div key={room} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="border-b border-gray-200 pb-2">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        {room}
                      </h4>
                      <span className="text-[10px] text-slate-500">{roomSessions.length} sessions scheduled</span>
                    </div>

                    <div className="space-y-2.5">
                      {roomSessions.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => onSelectSession(s)}
                          className="bg-white hover:bg-gray-100/80 border border-gray-200 rounded-lg p-3 cursor-pointer transition space-y-1.5 shadow-xs"
                        >
                          <div className="text-[10px] text-slate-500 font-semibold">
                            {s.startTime} - {s.endTime}
                          </div>
                          <div className="text-xs font-bold text-slate-900 line-clamp-2">
                            {s.title}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                            <span>{s.track}</span>
                            <span className="text-blue-600 font-semibold">{s.registeredCount}/{s.capacity}</span>
                          </div>
                        </div>
                      ))}
                      {roomSessions.length === 0 && (
                        <div className="text-[11px] text-slate-400 italic py-4 text-center">
                          No sessions scheduled in this room for Day {selectedDay}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
