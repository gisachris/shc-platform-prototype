/**
 * Detailed modal for an individual session.
 *
 * This component shows abstract, speakers, live Q&A, and polls for one session. It connects to
 * the session API, speaker profiles, and the LiveKit room flow when a user joins a live stream.
 */

import React, { useState, useEffect } from 'react';
import { Session, Speaker, QAQuestion, SessionPoll, User } from '../shared/types';
import { api } from '../services/api';
import { 
  X, 
  Clock, 
  MapPin, 
  Users, 
  Bookmark, 
  BookmarkCheck, 
  ThumbsUp, 
  MessageSquare, 
  BarChart3, 
  FileText, 
  Video, 
  Sparkles, 
  Send, 
  ExternalLink,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';

interface SessionDetailModalProps {
  currentUser?: User | null;
  session: Session | null;
  onClose: () => void;
  speakers: Speaker[];
  savedSessionIds: string[];
  toggleSaveSession: (sessionId: string) => void;
  onSelectSpeaker: (speakerId: string) => void;
  onOpenLiveKitRoom?: (session: Session) => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  currentUser,
  session,
  onClose,
  speakers,
  savedSessionIds,
  toggleSaveSession,
  onSelectSpeaker,
  onOpenLiveKitRoom
}) => {
  if (!session) return null;

  const [activeTab, setActiveTab] = useState<'info' | 'qa' | 'poll'>('info');
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [poll, setPoll] = useState<SessionPoll | null>(null);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [isSubmittingQ, setIsSubmittingQ] = useState(false);

  const isSaved = savedSessionIds.includes(session.id);
  const sessionSpeakers = speakers.filter(spk => session.speakerIds.includes(spk.id));

  // Fetch Q&A and Poll when session changes or Q&A tab selected
  useEffect(() => {
    if (session) {
      api.getQA(session.id).then(setQuestions).catch(console.error);
      api.getPoll(session.id).then(setPoll).catch(console.error);
    }
  }, [session]);

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    if (!currentUser) {
      alert('Please sign in to ask a question.');
      return;
    }

    setIsSubmittingQ(true);
    try {
      const res = await api.submitQA({
        sessionId: session.id,
        text: newQuestionText.trim(),
        authorCompany: currentUser.company,
      });
      if (res.success) {
        setQuestions([res.question, ...questions]);
        setNewQuestionText('');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Could not post question. Please sign in and try again.');
    } finally {
      setIsSubmittingQ(false);
    }
  };

  const handleUpvote = async (questionId: string) => {
    try {
      const res = await api.upvoteQA(questionId);
      if (res.success) {
        setQuestions(questions.map(q => q.id === questionId ? res.question : q));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVotePoll = async (optionId: string) => {
    if (!poll) return;
    try {
      const res = await api.votePoll(poll.id, optionId);
      if (res.success) {
        setPoll(res.poll);
        setVotedOptionId(optionId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Poll percentage calculation
  const totalPollVotes = poll ? poll.options.reduce((acc, curr) => acc + curr.votes, 0) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[85vh] sm:max-h-[88vh]">
        {/* Modal Header */}
        <div className="bg-white p-4 sm:p-5 border-b border-gray-200 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-2 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-slate-800 border border-gray-200">
                {session.track}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-slate-600 border border-gray-200">
                Day {session.day} • {session.level}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
              {session.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-100 text-slate-400 hover:text-slate-900 hover:bg-gray-200 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center border-b border-gray-200 bg-gray-50 px-4 sm:px-6 gap-2 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'info'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Overview & Speakers</span>
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'qa'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Live Q&A ({questions.length})</span>
          </button>

          {poll && (
            <button
              onClick={() => setActiveTab('poll')}
              className={`px-4 py-2.5 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
                activeTab === 'poll'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Session Poll</span>
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Timing & Location Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-slate-700" />
                  <div>
                    <div className="text-slate-500 font-medium">Time Slot</div>
                    <div className="font-semibold text-slate-900">{session.startTime} - {session.endTime}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="text-slate-500 font-medium">Location</div>
                    <div className="font-semibold text-slate-900">{session.room}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="text-slate-500 font-medium">Registered Capacity</div>
                    <div className="font-semibold text-slate-900">{session.registeredCount} / {session.capacity} seats</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Abstract & Overview</h3>
                <p className="text-sm text-slate-800 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  {session.description}
                </p>
              </div>

              {/* Prerequisites */}
              {session.prerequisites && (
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-500">Prerequisites / Target Audience:</span>
                  <div className="text-slate-700 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                    {session.prerequisites}
                  </div>
                </div>
              )}

              {/* Hosted Speakers */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Session Speakers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sessionSpeakers.map((spk) => (
                    <div
                      key={spk.id}
                      onClick={() => {
                        onClose();
                        onSelectSpeaker(spk.id);
                      }}
                      className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 p-3 rounded-2xl cursor-pointer transition group"
                    >
                      <img
                        src={spk.avatar}
                        alt={spk.name}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                          {spk.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{spk.role}</div>
                        <div className="text-[11px] text-blue-600 font-medium truncate">{spk.company}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources & live session */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-2">
                  {onOpenLiveKitRoom && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenLiveKitRoom(session);
                      }}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-md shadow-blue-600/20"
                    >
                      <Video className="w-4 h-4 text-white" />
                      <span>Join Live Session</span>
                    </button>
                  )}

                  {session.slidesUrl && (
                    <a
                      href={session.slidesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-2 rounded-xl transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Presentation Slides</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => toggleSaveSession(session.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    isSaved
                      ? 'bg-amber-400 text-slate-900 shadow-xs'
                      : 'bg-white hover:bg-gray-50 text-slate-700 border border-gray-200'
                  }`}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4 fill-slate-900" /> : <Bookmark className="w-4 h-4" />}
                  <span>{isSaved ? 'In My Agenda' : 'Add to My Agenda'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'qa' && (
            <div className="space-y-6">
              {/* Ask Question Form */}
              <form onSubmit={handlePostQuestion} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-700" />
                  Ask the Speaker a Question
                </h4>

                {!currentUser && (
                  <p className="text-[11px] text-slate-500">Sign in to post questions under your name.</p>
                )}

                <div className="flex items-center gap-2">
                  <textarea
                    rows={2}
                    placeholder="Type your question for the session Q&A..."
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-900 resize-none"
                  ></textarea>

                  <button
                    type="submit"
                    disabled={isSubmittingQ || !newQuestionText.trim()}
                    className="bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl transition disabled:opacity-50 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Questions Feed */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Attendee Questions ({questions.length})
                </h4>

                {questions.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 italic">
                    No questions asked yet. Be the first to ask!
                  </div>
                ) : (
                  questions.map((q) => (
                    <div
                      key={q.id}
                      className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-start gap-4 transition hover:border-gray-300"
                    >
                      <button
                        onClick={() => handleUpvote(q.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition shrink-0 ${
                          q.upvotedByUser
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-gray-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-xs font-bold mt-1">{q.upvotes}</span>
                      </button>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{q.authorName}</span>
                          <span className="text-[10px] text-slate-500">{q.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{q.text}</p>
                        {q.isAnswered && (
                          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded mt-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Answered live
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'poll' && poll && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Live Speaker Poll</span>
                  <h3 className="text-base font-bold text-slate-900">{poll.question}</h3>
                </div>

                <div className="space-y-3 pt-2">
                  {poll.options.map((opt) => {
                    const percentage = totalPollVotes > 0 ? Math.round((opt.votes / totalPollVotes) * 100) : 0;
                    const isSelected = votedOptionId === opt.id;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleVotePoll(opt.id)}
                        className={`w-full text-left p-4 rounded-xl border transition relative overflow-hidden group ${
                          isSelected
                            ? 'border-slate-900 bg-slate-100'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        {/* Progress fill bar */}
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-slate-200/80 transition-all duration-500 pointer-events-none"
                          style={{ width: `${percentage}%` }}
                        ></div>

                        <div className="relative z-10 flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-800">{opt.text}</span>
                          <span className="text-xs font-bold text-slate-900">{percentage}% ({opt.votes})</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="text-[10px] text-slate-500 text-right">
                  Total Votes: {totalPollVotes}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
