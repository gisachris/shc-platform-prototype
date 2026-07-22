import React, { useState } from 'react';
import { Conference, Speaker } from '../types';
import { 
  Sparkles, 
  Video, 
  QrCode, 
  Compass, 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  CheckCircle2, 
  LogIn, 
  UserPlus, 
  Globe2,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Send,
  Calendar
} from 'lucide-react';

interface LandingPageViewProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onNavigateTab: (tab: string) => void;
  onSelectConference?: (conferenceId: string) => void;
  stats: {
    totalAttendees: number;
    checkedInCount: number;
    totalSessions: number;
    totalSpeakers: number;
  } | null;
  conferences: Conference[];
  speakers: Speaker[];
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onOpenAuth,
  onNavigateTab,
  onSelectConference,
  stats,
  conferences,
  speakers,
}) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCategory, setContactCategory] = useState('Registration Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  const featuredSpeakers = speakers.slice(0, 4);
  const featuredConferences = conferences.slice(0, 3);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    const subject = encodeURIComponent(`[SHC] ${contactCategory}`);
    const body = encodeURIComponent(
      `Name: ${contactName}\nEmail: ${contactEmail}\nCategory: ${contactCategory}\n\n${contactMessage}`
    );
    window.location.href = `mailto:support@kigali2026.rw?subject=${subject}&body=${body}`;
    setContactSubmitted(true);
  };

  const openConference = (conf: Conference) => {
    onSelectConference?.(conf.id);
    onNavigateTab('conferences');
  };

  const faqItems = [
    {
      q: 'How do I access the schedule and networking tools?',
      a: 'Create an account or sign in. Attendees can save sessions, network with other delegates, join live rooms, and browse the tourism guide.'
    },
    {
      q: 'What can organizers do that attendees cannot?',
      a: 'Organizers can manage the schedule, check in attendees by ticket, review Call for Papers submissions, publish conferences, and export attendance reports.'
    },
    {
      q: 'How do remote (virtual) sessions work?',
      a: 'After signing in, open a session and choose Join Live Room. Sessions run in your browser with audio and video via LiveKit.'
    },
    {
      q: 'What are the visa requirements for attending in Kigali?',
      a: 'Rwanda offers visa-on-arrival for many nationalities. Check current requirements with your embassy or visitrwanda.com before travel.'
    },
    {
      q: 'How do I submit a Call for Papers (CFP) abstract?',
      a: 'Open the CFP tab, fill in your abstract, and submit. If AI review is configured, you may receive automated feedback; organizers make the final decision.'
    }
  ];

  return (
    <div className="space-y-16 animate-fadeIn pb-16">
      {/* Hero — brand-led, no app chrome / selected-conference controls */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/30 via-slate-900 to-slate-950 opacity-90" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80')` }}
        />

        <div className="relative z-10 px-6 sm:px-10 py-12 lg:py-20 max-w-6xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Smart Hybrid Conference Platform</span>
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
              SHC Platform
            </h1>
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg font-medium leading-relaxed">
              Plan, host, and join hybrid conferences from one place — registration, live sessions,
              engagement tools, networking, analytics, and local tourism guides.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onOpenAuth('register')}
              className="bg-white hover:bg-slate-100 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-xl transition transform hover:-translate-y-0.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create account</span>
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold px-6 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 border border-slate-600 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign in</span>
            </button>

            <button
              onClick={() => onNavigateTab('conferences')}
              className="text-slate-200 hover:text-white text-xs sm:text-sm font-bold px-3 py-3.5 flex items-center gap-1.5 transition"
            >
              <span>Browse conferences</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800">
            <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/50">
              <div className="text-xl sm:text-2xl font-black text-amber-400">{stats?.totalAttendees ?? 0}</div>
              <div className="text-[11px] text-slate-400 font-semibold">Registered delegates</div>
            </div>
            <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/50">
              <div className="text-xl sm:text-2xl font-black text-blue-400">{stats?.totalSessions ?? 0}</div>
              <div className="text-[11px] text-slate-400 font-semibold">Sessions</div>
            </div>
            <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/50">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">{stats?.totalSpeakers ?? 0}</div>
              <div className="text-[11px] text-slate-400 font-semibold">Speakers</div>
            </div>
            <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/50">
              <div className="text-xl sm:text-2xl font-black text-indigo-400">{conferences.length}</div>
              <div className="text-[11px] text-slate-400 font-semibold">Conferences</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live conferences from API — not a selected-workspace control */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">Upcoming events</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Conferences on SHC</h2>
            <p className="text-xs sm:text-sm text-slate-500">Live listings from the platform directory.</p>
          </div>
          <button
            onClick={() => onNavigateTab('conferences')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {featuredConferences.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center text-xs text-slate-500">
            No conferences published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredConferences.map((conf) => (
              <button
                key={conf.id}
                type="button"
                onClick={() => openConference(conf)}
                className="text-left bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-400 transition shadow-xs"
              >
                <div className="h-32 bg-slate-900 relative">
                  {conf.bannerImage && (
                    <img src={conf.bannerImage} alt="" className="w-full h-full object-cover opacity-80" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-[10px] font-bold uppercase text-amber-300">{conf.shortCode || conf.city}</div>
                    <div className="text-sm font-extrabold line-clamp-2">{conf.title}</div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-[11px] text-slate-500 line-clamp-2">{conf.tagline || conf.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-600 font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      {conf.startDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {conf.city}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            About SHC Platform
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Hybrid conference tools for events in Rwanda
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            SHC helps organizers run hybrid conferences in one place — registration, scheduling, live sessions,
            engagement tools, networking, and tourism information for delegates.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Join onsite or attend remotely through browser-based live rooms with Q&A, polls, and digital tickets.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <div className="text-blue-600 font-extrabold text-sm flex items-center gap-1.5">
                <Globe2 className="w-4 h-4" />
                <span>Hybrid by design</span>
              </div>
              <p className="text-[11px] text-slate-500">Support onsite and remote delegates in the same event.</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <div className="text-emerald-600 font-extrabold text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Role-based access</span>
              </div>
              <p className="text-[11px] text-slate-500">Attendees, speakers, and organizers see the tools they need.</p>
            </div>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-xl group">
          <img 
            src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80" 
            alt="Conference venue"
            className="w-full h-[380px] object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
            <div className="text-xs font-black uppercase text-amber-400">Hybrid venues</div>
            <div className="text-base font-extrabold">Onsite halls and remote LiveKit rooms in one workflow</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-center space-y-1 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">Platform Features</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">What you can do with SHC</h2>
          <p className="text-xs sm:text-sm text-slate-500">Built for organizers and delegates running hybrid events.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3 hover:border-blue-400 transition shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Hybrid live sessions</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Join keynotes and breakouts from the browser with LiveKit — audio, video, and screen sharing for remote delegates.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3 hover:border-blue-400 transition shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">CFP review assistance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Speakers submit abstracts through Call for Papers. Optional AI feedback helps organizers review clarity and fit.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3 hover:border-blue-400 transition shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Digital tickets & check-in</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Register online to receive a digital pass. Organizers check attendees in using the ticket ID or QR payload.
            </p>
          </div>
        </div>
      </div>

      {/* Speakers from API */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Speakers</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Featured speakers</h2>
          </div>
          <button
            onClick={() => onNavigateTab('speakers')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View speaker directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {featuredSpeakers.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">Speaker profiles will appear here once published.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredSpeakers.map((spk) => (
              <button
                key={spk.id}
                type="button"
                onClick={() => onNavigateTab('speakers')}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center space-y-3 hover:border-blue-400 transition"
              >
                <img 
                  src={spk.avatar}
                  alt={spk.name}
                  className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-blue-500"
                />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{spk.name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium line-clamp-2">
                    {spk.role}{spk.company ? `, ${spk.company}` : ''}
                  </p>
                  {spk.topics?.[0] && (
                    <div className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full mt-2 inline-block">
                      {spk.topics[0]}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Explore Rwanda</span>
            </div>
            <h3 className="text-2xl font-black text-white">Delegate excursions & culture</h3>
            <p className="text-xs text-slate-300">
              Extend your conference stay for wildlife, gorilla trekking, and Kigali culture.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('tourism')}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl transition shrink-0 flex items-center gap-2"
          >
            <span>Open tourism guide</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
            <div className="font-extrabold text-amber-300 text-sm">Volcanoes National Park</div>
            <p className="text-xs text-slate-300">Mountain gorilla trekking with licensed park rangers in Musanze.</p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
            <div className="font-extrabold text-blue-300 text-sm">Akagera Safari</div>
            <p className="text-xs text-slate-300">Big-five wildlife in eastern savannah wetlands and Lake Ihema.</p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
            <div className="font-extrabold text-emerald-300 text-sm">Kigali culture</div>
            <p className="text-xs text-slate-300">Memorial sites, artisan markets, and specialty coffee neighborhoods.</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">FAQ</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Frequently asked questions</h2>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, idx) => {
            const isExpanded = expandedFaqIndex === idx;
            return (
              <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                  className="w-full text-left p-4 bg-gray-50/50 hover:bg-gray-100/80 flex items-center justify-between text-xs sm:text-sm font-extrabold text-slate-900 transition"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{item.q}</span>
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isExpanded && (
                  <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-gray-100">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div id="contact-us" className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        <div className="space-y-1">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Contact</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Contact organizers</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            This form opens your email app with a draft to the secretariat. It is not a server-side inbox —
            nothing is stored in the SHC database.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
                <MapPin className="w-4 h-4" />
                <span>Secretariat</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Kigali Convention Centre (KCC)<br />
                KG 2 Ave, Kimihurura<br />
                Kigali, Rwanda
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-blue-800 font-extrabold text-xs">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Support hotline</span>
              </div>
              <p className="text-xs text-slate-700">+250 788 000 000</p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>Email</span>
              </div>
              <p className="text-xs text-slate-700">support@kigali2026.rw</p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-gray-50/70 border border-gray-200 rounded-2xl p-6">
            {contactSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-300 p-6 rounded-xl text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">Email client opened</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your message was prepared for <strong>support@kigali2026.rw</strong>. Send it from your mail app to complete the inquiry.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your name *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={contactCategory}
                    onChange={(e) => setContactCategory(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Registration Inquiry">Registration & tickets</option>
                    <option value="Speaker & CFP">Speaker / CFP</option>
                    <option value="Sponsorship & Exhibition">Sponsorship</option>
                    <option value="Media Accreditation">Media</option>
                    <option value="Hotel & Tourism">Hotel & tourism</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Open email draft to secretariat</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
