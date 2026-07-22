import React, { useState, useEffect, useMemo } from 'react';
import { CFPProposal, SessionTrack, SessionLevel, User } from '../types';
import { api } from '../services/api';
import { 
  FileText, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Check, 
  ListOrdered,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  Eye,
  X,
  User as UserIcon,
  MessageSquare,
  BarChart2,
  Clock,
  Filter
} from 'lucide-react';

interface CFPViewProps {
  currentUser?: User | null;
  conferenceId?: string;
}

export const CFPView: React.FC<CFPViewProps> = ({ currentUser, conferenceId }) => {
  const isOrganizer = Boolean(currentUser && ['organizer', 'administrator', 'super_admin'].includes(currentUser.role));
  const [proposals, setProposals] = useState<CFPProposal[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedProposal, setSubmittedProposal] = useState<CFPProposal | null>(null);

  // Proposal modal state
  const [selectedProposal, setSelectedProposal] = useState<CFPProposal | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  // Form State
  const [speakerName, setSpeakerName] = useState('');
  const [speakerEmail, setSpeakerEmail] = useState('');
  const [speakerCompany, setSpeakerCompany] = useState('');
  const [speakerBio, setSpeakerBio] = useState('');
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [targetTrack, setTargetTrack] = useState<SessionTrack>('Web Development');
  const [level, setLevel] = useState<SessionLevel>('Intermediate');

  useEffect(() => {
    api.getCFP().then(setProposals).catch(console.error);
  }, []);

  const filteredProposals = useMemo(() => {
    if (statusFilter === 'all') return proposals;
    return proposals.filter(p => p.status === statusFilter);
  }, [proposals, statusFilter]);

  const handleStatusChange = async (proposalId: string, newStatus: 'pending' | 'accepted' | 'rejected') => {
    setIsUpdatingStatus(true);
    try {
      const res = await api.updateCFPStatus(proposalId, newStatus);
      if (res.success) {
        setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: newStatus } : p));
        if (selectedProposal && selectedProposal.id === proposalId) {
          setSelectedProposal({ ...selectedProposal, status: newStatus });
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update proposal status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !abstract) return;

    setIsSubmitting(true);
    try {
      const res = await api.submitCFP({
        speakerName: speakerName.trim() || 'Anonymous Proposal',
        speakerEmail: speakerEmail.trim(),
        speakerCompany: speakerCompany.trim() || 'Independent',
        speakerBio: speakerBio.trim(),
        title: title.trim(),
        abstract: abstract.trim(),
        targetTrack,
        level,
        conferenceId,
      });

      if (res.success) {
        setSubmittedProposal(res.proposal);
        if (isOrganizer) {
          setProposals([res.proposal, ...proposals]);
        }
        if (res.aiStatus !== 'ok') {
          alert(
            res.aiStatus === 'unavailable'
              ? 'Proposal saved. Automated review is not configured; organizers will review manually.'
              : `Proposal saved. Automated review could not run (${res.aiError || 'error'}). Organizers will review manually.`
          );
        }
        setTitle('');
        setAbstract('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit proposal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-2 relative z-10">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-slate-700 border border-gray-200">
            Call For Papers (CFP) • Speaker & Program Committee Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Submit & Review Conference Speaker Proposals
          </h2>
          <p className="text-sm text-slate-500">
            Submit your research paper or workshop abstract. Organizers review submissions; optional Gemini scoring assists technical evaluation when configured.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
            <FileText className="w-5 h-5 text-slate-700" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Speaker Proposal Form</h3>
              <p className="text-xs text-slate-500">Provide details about your talk, technical depth, and presentation abstract.</p>
            </div>
          </div>

          <form onSubmit={handleSubmitProposal} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam O'Connor"
                  value={speakerName}
                  onChange={(e) => setSpeakerName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. liam@rustedge.dev"
                  value={speakerEmail}
                  onChange={(e) => setSpeakerEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Company / Affiliation & Title</label>
              <input
                type="text"
                placeholder="e.g. Principal Engineer @ RustEdge Systems"
                value={speakerCompany}
                onChange={(e) => setSpeakerCompany(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Speaker Biography</label>
              <textarea
                rows={2}
                placeholder="Brief bio highlighting your background, past speaking experience, or open-source projects..."
                value={speakerBio}
                onChange={(e) => setSpeakerBio(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Target Track</label>
                <select
                  value={targetTrack}
                  onChange={(e) => setTargetTrack(e.target.value as SessionTrack)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-slate-900"
                >
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Cloud & Architecture">Cloud & Architecture</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="UX & Product Design">UX & Product Design</option>
                  <option value="DevOps & SRE">DevOps & SRE</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Target Audience Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as SessionLevel)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-slate-900"
                >
                  <option value="All Levels">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Talk / Workshop Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sub-Millisecond Event Streaming with Rust and WebAssembly"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Full Session Abstract & Outline *</label>
              <textarea
                required
                rows={5}
                placeholder="Describe what delegates will learn, architecture diagrams, code examples covered, and practical key takeaways..."
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !title || !abstract}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting proposal...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>Submit Talk Proposal for Review</span>
                </>
              )}
            </button>
          </form>

          {submittedProposal && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Proposal submitted</span>
              </div>
              <p className="text-slate-600">
                {submittedProposal.aiReviewScore != null
                  ? <>Score: <strong>{submittedProposal.aiReviewScore}/100</strong>. {submittedProposal.aiFeedback}</>
                  : (submittedProposal.aiFeedback || 'Your proposal is queued for organizer review.')}
              </p>
            </div>
          )}
        </div>

        {/* Proposals Directory Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <span>CFP Proposals ({filteredProposals.length})</span>
            </h3>

            {isOrganizer && (
              <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-700" />
                <span>Program Review Mode</span>
              </span>
            )}
          </div>

          {/* Organizer Status Filters */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto scrollbar-none">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All ({proposals.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-lg transition ${statusFilter === 'pending' ? 'bg-white text-amber-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Pending ({proposals.filter(p => p.status === 'pending').length})
            </button>
            <button
              onClick={() => setStatusFilter('accepted')}
              className={`px-2.5 py-1 rounded-lg transition ${statusFilter === 'accepted' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Accepted ({proposals.filter(p => p.status === 'accepted').length})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-2.5 py-1 rounded-lg transition ${statusFilter === 'rejected' ? 'bg-white text-rose-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Rejected ({proposals.filter(p => p.status === 'rejected').length})
            </button>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredProposals.length === 0 ? (
              <p className="text-xs text-slate-500 p-6 text-center bg-gray-50 border border-gray-200 rounded-xl">
                No proposals found matching this filter.
              </p>
            ) : (
              filteredProposals.map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => setSelectedProposal(prop)}
                  className="bg-white border border-gray-200 rounded-xl p-4 space-y-2.5 hover:border-blue-400 hover:shadow-xs transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-blue-600">{prop.targetTrack}</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-black border ${
                      prop.status === 'accepted'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : prop.status === 'rejected'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {prop.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 hover:text-blue-600 transition">{prop.title}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{prop.abstract}</p>

                  <div className="text-[10px] text-slate-500 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span>By <strong>{prop.speakerName}</strong> ({prop.speakerCompany || 'Independent'})</span>
                    <span className="text-blue-600 font-bold flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>Read Full Concept</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* FULL PROPOSAL REVIEW MODAL */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-200 relative my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-200 pb-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedProposal.targetTrack}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Level: {selectedProposal.level}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-black border ${
                    selectedProposal.status === 'accepted'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : selectedProposal.status === 'rejected'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {selectedProposal.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {selectedProposal.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedProposal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Speaker Info Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-black flex items-center justify-center text-sm">
                  {selectedProposal.speakerName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{selectedProposal.speakerName}</h4>
                  <p className="text-[11px] text-slate-500">{selectedProposal.speakerCompany || 'Independent Speaker'} • {selectedProposal.speakerEmail}</p>
                </div>
              </div>
              {selectedProposal.speakerBio && (
                <p className="text-xs text-slate-600 italic pt-1 border-t border-gray-200">
                  "{selectedProposal.speakerBio}"
                </p>
              )}
            </div>

            {/* Full Concept Abstract */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Full Talk Concept & Abstract</span>
              </h4>
              <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-4 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedProposal.abstract}
              </div>
            </div>

            {/* AI technical evaluation */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-extrabold text-amber-900">AI program assessment</span>
                </div>
                {selectedProposal.aiReviewScore != null ? (
                  <span className="text-xs font-black text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                    Score: {selectedProposal.aiReviewScore}/100
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-950 leading-relaxed">
                {selectedProposal.aiFeedback || 'No AI feedback yet. Organizers can still review the abstract manually.'}
              </p>
            </div>

            {/* Organizer Action Station */}
            {isOrganizer ? (
              <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  <span>Program Committee Decision Controls</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    disabled={isUpdatingStatus || selectedProposal.status === 'accepted'}
                    onClick={() => handleStatusChange(selectedProposal.id, 'accepted')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Accept Proposal</span>
                  </button>

                  <button
                    disabled={isUpdatingStatus || selectedProposal.status === 'rejected'}
                    onClick={() => handleStatusChange(selectedProposal.id, 'rejected')}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>Reject Proposal</span>
                  </button>

                  <button
                    disabled={isUpdatingStatus || selectedProposal.status === 'pending'}
                    onClick={() => handleStatusChange(selectedProposal.id, 'pending')}
                    className="bg-gray-200 hover:bg-gray-300 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs transition"
                  >
                    Set Under Review
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center pt-2">
                <button
                  onClick={() => setSelectedProposal(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition"
                >
                  Close Proposal Details
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
