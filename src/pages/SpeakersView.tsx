/**
 * Speaker directory and public speaker profile browser.
 *
 * This component searches and filters speaker profiles and shows each speaker’s sessions. It
 * connects to the speaker API and the session detail views used in the main app.
 */

import React, { useState, useMemo } from 'react';
import { Speaker, Session } from '../shared/types';
import { 
  Search, 
  Mic, 
  Star, 
  MapPin, 
  Linkedin, 
  Twitter, 
  Github, 
  Globe, 
  Calendar, 
  Bookmark, 
  BookmarkCheck, 
  X, 
  MessageSquare
} from 'lucide-react';

interface SpeakersViewProps {
  speakers: Speaker[];
  sessions: Session[];
  savedSessionIds: string[];
  toggleSaveSession: (sessionId: string) => void;
  onSelectSession: (session: Session) => void;
  selectedSpeakerId: string | null;
  setSelectedSpeakerId: (id: string | null) => void;
}

export const SpeakersView: React.FC<SpeakersViewProps> = ({
  speakers,
  sessions,
  savedSessionIds,
  toggleSaveSession,
  onSelectSession,
  selectedSpeakerId,
  setSelectedSpeakerId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');

  // Extract all topics
  const allTopics = useMemo(() => {
    const tSet = new Set<string>();
    speakers.forEach(s => s.topics.forEach(t => tSet.add(t)));
    return ['All', ...Array.from(tSet)];
  }, [speakers]);

  // Filtered speakers
  const filteredSpeakers = useMemo(() => {
    return speakers.filter(speaker => {
      if (selectedTopic !== 'All' && !speaker.topics.includes(selectedTopic)) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const nameMatch = speaker.name.toLowerCase().includes(q);
        const compMatch = speaker.company.toLowerCase().includes(q);
        const roleMatch = speaker.role.toLowerCase().includes(q);
        const bioMatch = speaker.bio.toLowerCase().includes(q);
        const topicMatch = speaker.topics.some(t => t.toLowerCase().includes(q));

        return nameMatch || compMatch || roleMatch || bioMatch || topicMatch;
      }

      return true;
    });
  }, [speakers, selectedTopic, searchQuery]);

  // Selected speaker details
  const activeSpeaker = useMemo(() => {
    return speakers.find(s => s.id === selectedSpeakerId) || null;
  }, [speakers, selectedSpeakerId]);

  // Sessions hosted by active speaker
  const activeSpeakerSessions = useMemo(() => {
    if (!activeSpeaker) return [];
    return sessions.filter(s => s.speakerIds.includes(activeSpeaker.id));
  }, [sessions, activeSpeaker]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-2 relative z-10">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-slate-700 border border-gray-200">
            Speakers
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Speaker directory
          </h2>
          <p className="text-sm text-slate-500">
            Browse profiles and open sessions to ask questions during live Q&A.
          </p>
        </div>
      </div>

      {/* Search & Topic Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search speaker name, company, job title, or expertise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
          />
        </div>

        {/* Topic Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-gray-100 pt-3">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-1 text-[10px]">
            Expertise:
          </span>
          {allTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedTopic === topic
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-gray-50 text-slate-600 border border-gray-200 hover:bg-gray-100 hover:text-slate-900'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Speaker Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSpeakers.map((speaker) => {
          const speakerSessionsCount = sessions.filter(s => s.speakerIds.includes(speaker.id)).length;

          return (
            <div
              key={speaker.id}
              onClick={() => setSelectedSpeakerId(speaker.id)}
              className="bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Speaker Avatar & Header Info */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={speaker.avatar}
                      alt={speaker.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100 group-hover:border-slate-300 transition shadow-xs"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white border border-gray-200 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-amber-600 flex items-center gap-0.5 shadow-xs">
                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                      {speaker.rating}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                      {speaker.name}
                    </h3>
                    <div className="text-xs font-medium text-slate-700 truncate">{speaker.role}</div>
                    <div className="text-xs text-blue-600 font-semibold truncate">{speaker.company}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{speaker.location}</span>
                    </div>
                  </div>
                </div>

                {/* Bio snippet */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {speaker.bio}
                </p>

                {/* Topic tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {speaker.topics.map((t) => (
                    <span key={t} className="text-[10px] font-semibold text-slate-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {speakerSessionsCount} Session{speakerSessionsCount !== 1 ? 's' : ''} Hosted
                </span>
                <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition flex items-center gap-1">
                  View profile →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Speaker Detail Modal */}
      {activeSpeaker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 relative flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-white p-6 border-b border-gray-200 flex items-start justify-between gap-4 sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <img
                  src={activeSpeaker.avatar}
                  alt={activeSpeaker.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100 shadow-sm"
                />
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {activeSpeaker.name}
                  </h2>
                  <div className="text-xs text-slate-600 font-medium">{activeSpeaker.role} @ <span className="text-blue-600 font-semibold">{activeSpeaker.company}</span></div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {activeSpeaker.rating} Score
                    </span>
                    <span>•</span>
                    <span>{activeSpeaker.location}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedSpeakerId(null)}
                className="p-2 rounded-xl bg-gray-100 text-slate-500 hover:text-slate-900 hover:bg-gray-200 transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
              {/* Bio */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Biography</h3>
                <p className="text-sm text-slate-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  {activeSpeaker.bio}
                </p>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-semibold">Social Connect:</span>
                <div className="flex items-center gap-2">
                  {activeSpeaker.socials.linkedin && (
                    <a
                      href={activeSpeaker.socials.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-slate-600 hover:text-blue-600 hover:border-gray-300 transition"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {activeSpeaker.socials.twitter && (
                    <a
                      href={activeSpeaker.socials.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-slate-600 hover:text-blue-600 hover:border-gray-300 transition"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {activeSpeaker.socials.github && (
                    <a
                      href={activeSpeaker.socials.github}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-slate-600 hover:text-slate-900 hover:border-gray-300 transition"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Sessions Hosted */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Hosted Sessions ({activeSpeakerSessions.length})
                </h3>

                <div className="space-y-3">
                  {activeSpeakerSessions.map((session) => {
                    const isSaved = savedSessionIds.includes(session.id);
                    return (
                      <div
                        key={session.id}
                        className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Day {session.day} • {session.startTime} ({session.room})</span>
                          </div>
                          <h4 
                            onClick={() => {
                              setSelectedSpeakerId(null);
                              onSelectSession(session);
                            }}
                            className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition"
                          >
                            {session.title}
                          </h4>
                          <span className="text-[10px] text-slate-600 bg-white border border-gray-200 px-2 py-0.5 rounded">
                            {session.track}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleSaveSession(session.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
                            isSaved
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-white hover:bg-gray-100 text-slate-700 border border-gray-200'
                          }`}
                        >
                          {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 fill-amber-600 text-amber-700" /> : <Bookmark className="w-3.5 h-3.5" />}
                          <span>{isSaved ? 'Saved' : 'Add to Schedule'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-2">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  Questions for {activeSpeaker.name}
                </h3>
                <p className="text-xs text-slate-600">
                  Open one of their sessions and use the live Q&A tab during the conference.
                  For networking with other delegates, use your Dashboard after signing in.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
