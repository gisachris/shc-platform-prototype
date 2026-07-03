import React, { useState } from 'react';
import { User, UserRole, Conference } from '../types';
import { 
  Sparkles, 
  Video, 
  QrCode, 
  MessageSquare, 
  Compass, 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  Calendar, 
  Users, 
  Mic, 
  CheckCircle2, 
  Lock, 
  LogIn, 
  UserPlus, 
  Award,
  Globe2,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Send,
  AlertCircle,
  ExternalLink,
  Info,
  Layers,
  Cpu
} from 'lucide-react';

interface LandingPageViewProps {
  onOpenAuth: (mode?: 'login' | 'register' | 'demo') => void;
  onNavigateTab: (tab: string) => void;
  onQuickDemoLogin: (role: UserRole) => void;
  stats: {
    totalAttendees: number;
    checkedInCount: number;
    totalSessions: number;
    totalSpeakers: number;
  } | null;
  conferences: Conference[];
  currentUser: User | null;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onOpenAuth,
  onNavigateTab,
  onQuickDemoLogin,
  stats,
  conferences,
  currentUser
}) => {
  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCategory, setContactCategory] = useState('Registration Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // FAQ Accordion State
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  const featuredConf = conferences[0] || {
    title: 'Rwanda Global Tech & Innovation Summit 2026',
    tagline: 'Bridging Continental AI, Cloud & Hybrid Infrastructure',
    venueName: 'Kigali Convention Centre',
    city: 'Kigali',
    country: 'Rwanda',
    startDate: '2026-09-15',
    endDate: '2026-09-17'
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 4000);
  };

  const faqItems = [
    {
      q: 'How do I access internal conference tools like Schedule or Networking?',
      a: 'Internal workspace features require authenticating as a delegate, speaker, moderator, or organizer. You can Sign In or click "1-Click Demo Personas" at the top of the page to test role-specific views.'
    },
    {
      q: 'What is the role boundary between an Attendee and an Organizer?',
      a: 'Attendees can bookmark sessions, network with other delegates, and view tourism guides. Organizers have access to the Organizer Workspace to manage schedules, scan ticket QR codes, review speaker Call for Papers (CFP), and publish conferences.'
    },
    {
      q: 'How does remote WebRTC hybrid streaming work?',
      a: 'The platform integrates LiveKit Cloud WebRTC servers. Remote delegates can join high-definition, sub-second latency video streams, participate in live Q&A, and vote in audience polls directly from their browser.'
    },
    {
      q: 'What are the visa requirements for attending in Kigali, Rwanda?',
      a: 'Rwanda offers Visa-on-Arrival to citizens of ALL countries worldwide. Delegates holding African Union, Commonwealth, and OIF passports receive free 30-day tourist visas upon arrival at Kigali International Airport (KGL).'
    },
    {
      q: 'How do I submit a presentation abstract for Call for Papers (CFP)?',
      a: 'Once signed in, click on the "CFP" tab. You can submit abstracts for tracks such as AI & Machine Learning, Cloud Architecture, or FinTech. Submissions are auto-scored by Gemini AI for instant technical feedback.'
    }
  ];

  return (
    <div className="space-y-16 animate-fadeIn pb-16">
      {/* 1. HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl">
        {/* Decorative Gradients & Backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/30 via-slate-900 to-slate-950 opacity-90" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80')` }}
        />

        <div className="relative z-10 px-6 sm:px-10 py-12 lg:py-20 max-w-6xl mx-auto space-y-8">
          {/* Host Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>SHC Platform • Smart Hybrid Summit Portal</span>
            <span className="bg-amber-400/20 text-amber-300 text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase">
              Official Portal
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
              Smart Hybrid Summit & <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-200 to-amber-300">
                Conference Platform
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg font-medium leading-relaxed">
              Powering premier summits at <strong className="text-white">Kigali Convention Centre</strong> with sub-second WebRTC streams, paperless QR badging, AI itinerary matching, and strict multi-role authorization.
            </p>
          </div>

          {/* Hero Call-To-Action Controls */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!currentUser ? (
              <>
                <button
                  onClick={() => onOpenAuth('demo')}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-400/20 transition transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Try 1-Click Demo Personas</span>
                </button>

                <button
                  onClick={() => onOpenAuth('login')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-6 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => onOpenAuth('register')}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm border border-slate-700 flex items-center gap-2 transition"
                >
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>Register Pass</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 bg-slate-800/90 border border-slate-700/80 p-3.5 rounded-2xl">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.fullName}
                  className="w-11 h-11 rounded-full object-cover border border-blue-400"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Authenticated as {currentUser.fullName}</span>
                    <span className="bg-blue-500/20 text-blue-300 text-[10px] uppercase font-black px-2 py-0.5 rounded-md border border-blue-400/30">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">{currentUser.jobTitle} • {currentUser.company}</p>
                </div>
                <button
                  onClick={() => onNavigateTab('schedule')}
                  className="ml-auto bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800">
            <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/50">
              <div className="text-xl sm:text-2xl font-black text-amber-400">{stats?.totalAttendees || 1240}+</div>
              <div className="text-[11px] text-slate-400 font-semibold">Registered Delegates</div>
            </div>
            <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/50">
              <div className="text-xl sm:text-2xl font-black text-blue-400">{stats?.totalSessions || 48}</div>
              <div className="text-[11px] text-slate-400 font-semibold">Keynotes & Breakouts</div>
            </div>
            <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/50">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">{stats?.totalSpeakers || 32}</div>
              <div className="text-[11px] text-slate-400 font-semibold">Global Keynote Speakers</div>
            </div>
            <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/50">
              <div className="text-xl sm:text-2xl font-black text-indigo-400">WebRTC Hybrid</div>
              <div className="text-[11px] text-slate-400 font-semibold">LiveKit Cloud Video</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DEMO PERSONA & ROLE SECURITY TEST BOX */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-300 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Full Role-Based Security Testing (RBAC)</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white mt-1">
              Instantly Switch Test Personas to Verify Authorization Boundaries
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
              Notice how unauthenticated visitors only see the Landing Page, while registered Attendees receive schedule bookmarking, and Organizers unlock the full Organizer Control Panel!
            </p>
          </div>

          <button
            onClick={() => onOpenAuth('demo')}
            className="bg-white hover:bg-slate-100 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shrink-0 transition"
          >
            Open Persona Selector
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
          <button
            onClick={() => onQuickDemoLogin('attendee')}
            className="bg-slate-800/80 hover:bg-emerald-600/30 border border-emerald-500/40 p-3 rounded-2xl text-left transition group"
          >
            <div className="text-[10px] font-black uppercase text-emerald-400">Attendee</div>
            <div className="text-xs font-bold text-white group-hover:text-emerald-200">Amina Mugisha</div>
            <div className="text-[10px] text-slate-400 mt-0.5">🔒 No Organizer Tab</div>
          </button>

          <button
            onClick={() => onQuickDemoLogin('speaker')}
            className="bg-slate-800/80 hover:bg-blue-600/30 border border-blue-500/40 p-3 rounded-2xl text-left transition group"
          >
            <div className="text-[10px] font-black uppercase text-blue-400">Speaker</div>
            <div className="text-xs font-bold text-white group-hover:text-blue-200">Dr. Jean-Paul</div>
            <div className="text-[10px] text-slate-400 mt-0.5">🎤 Speaker Studio</div>
          </button>

          <button
            onClick={() => onQuickDemoLogin('moderator')}
            className="bg-slate-800/80 hover:bg-amber-600/30 border border-amber-500/40 p-3 rounded-2xl text-left transition group"
          >
            <div className="text-[10px] font-black uppercase text-amber-400">Moderator</div>
            <div className="text-xs font-bold text-white group-hover:text-amber-200">Claudine Uwase</div>
            <div className="text-[10px] text-slate-400 mt-0.5">🎛️ Q&A / Poll Controls</div>
          </button>

          <button
            onClick={() => onQuickDemoLogin('organizer')}
            className="bg-slate-800/80 hover:bg-purple-600/30 border border-purple-500/40 p-3 rounded-2xl text-left transition group"
          >
            <div className="text-[10px] font-black uppercase text-purple-400">Organizer (RCB)</div>
            <div className="text-xs font-bold text-white group-hover:text-purple-200">Emmanuel N.</div>
            <div className="text-[10px] text-slate-400 mt-0.5">⚡ Full Organizer Tab</div>
          </button>

          <button
            onClick={() => onQuickDemoLogin('administrator')}
            className="bg-slate-800/80 hover:bg-rose-600/30 border border-rose-500/40 p-3 rounded-2xl text-left transition group"
          >
            <div className="text-[10px] font-black uppercase text-rose-400">Administrator</div>
            <div className="text-xs font-bold text-white group-hover:text-rose-200">Grace Ingabire</div>
            <div className="text-[10px] text-slate-400 mt-0.5">⚙️ Platform Controls</div>
          </button>
        </div>
      </div>

      {/* 3. ABOUT US & MISSION SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            About SHC Platform
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Pioneering Africa's Digital Summit Capital in Kigali
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The Smart Hybrid Conference (SHC) Platform was engineered in partnership with the <strong>Rwanda Tech Council</strong> and the <strong>Ministry of ICT & Innovation</strong> to establish a world-class, digital-first infrastructure for international summits hosted in Rwanda.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Whether delegates gather in person under the iconic dome of the <strong>Kigali Convention Centre</strong> or connect remotely from Tokyo, London, or San Francisco, SHC delivers unified HD WebRTC video, real-time interactive Q&A, AI itinerary matching, and instant QR badge verification.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <div className="text-blue-600 font-extrabold text-sm flex items-center gap-1.5">
                <Globe2 className="w-4 h-4" />
                <span>Pan-African Summit Hub</span>
              </div>
              <p className="text-[11px] text-slate-500">Hosting delegates from over 75 countries annually in Kigali.</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
              <div className="text-emerald-600 font-extrabold text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Enterprise Security</span>
              </div>
              <p className="text-[11px] text-slate-500">Encrypted token auth and strict multi-tenant role control.</p>
            </div>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-xl group">
          <img 
            src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80" 
            alt="Kigali Summit Hall"
            className="w-full h-[380px] object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
            <div className="text-xs font-black uppercase text-amber-400">Kigali Convention Centre</div>
            <div className="text-base font-extrabold">State-of-the-art hybrid technology hall with 2,600+ seat auditorium</div>
            <p className="text-[11px] text-slate-300">Equipped with gigabit fiber backbone, LiveKit gateways, and translation booths.</p>
          </div>
        </div>
      </div>

      {/* 4. CORE PLATFORM PILLARS (3 CARDS) */}
      <div className="space-y-6">
        <div className="text-center space-y-1 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">Architectural Superiority</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Core Capabilities of the Platform</h2>
          <p className="text-xs sm:text-sm text-slate-500">Designed to give organizers full operational control and delegates an effortless summit experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3 hover:border-blue-400 transition shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">WebRTC HD Hybrid Streaming</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Powered by LiveKit Cloud. Remote delegates stream keynotes with sub-second latency, screen sharing, and multi-track audio.
              </p>
            </div>
            <div className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg w-fit">
              LiveKit Cloud Integration
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3 hover:border-blue-400 transition shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">AI Itinerary & CFP Scoring</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Integrated Gemini 3.6 Flash engine auto-scores Call for Papers proposals and constructs personalized itineraries for delegates.
              </p>
            </div>
            <div className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg w-fit">
              Gemini 3.6 Flash
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3 hover:border-blue-400 transition shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Paperless QR Badging & Check-In</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant digital ticket generation with encrypted QR badges. Desk stations scan and verify attendee passes in under 1 second.
              </p>
            </div>
            <div className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
              Zero-Wait Desk Check-in
            </div>
          </div>
        </div>
      </div>

      {/* 5. KEYNOTE SPEAKERS SPOTLIGHT */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">World-Class Thought Leaders</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Keynote Speakers Spotlight</h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            Distinguished experts shaping artificial intelligence, distributed cloud infrastructure, and African digital economy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center space-y-3">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
              alt="Dr. Jean-Paul Habimana"
              className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-blue-500"
            />
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Dr. Jean-Paul Habimana</h4>
              <p className="text-[11px] text-slate-500 font-medium">Associate Professor, CMU Africa</p>
              <div className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full mt-2 inline-block">
                Keynote: AI Scaling in Africa
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center space-y-3">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
              alt="Amina Mugisha"
              className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-emerald-500"
            />
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Amina Mugisha</h4>
              <p className="text-[11px] text-slate-500 font-medium">Senior Software Engineer, Kigali Hub</p>
              <div className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full mt-2 inline-block">
                Track: Cloud Native Systems
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center space-y-3">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
              alt="Claudine Uwase"
              className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-amber-500"
            />
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Claudine Uwase</h4>
              <p className="text-[11px] text-slate-500 font-medium">Session Director, Rwanda ICT Chamber</p>
              <div className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full mt-2 inline-block">
                Moderator: Tech Policy Panel
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center space-y-3">
            <img 
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
              alt="Emmanuel Nkurunziza"
              className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-purple-500"
            />
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Emmanuel Nkurunziza</h4>
              <p className="text-[11px] text-slate-500 font-medium">Head of Summits, Rwanda Tech Council</p>
              <div className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full mt-2 inline-block">
                Host: Global MICE Opening
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. RWANDA TOURISM & DELEGATE EXPERIENCE */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Explore Remarkable Rwanda</span>
            </div>
            <h3 className="text-2xl font-black text-white">Unforgettable Delegate Excursions & Culture</h3>
            <p className="text-xs text-slate-300">
              Extend your conference stay to experience Rwanda’s breathtaking wildlife, gorilla trekking in Volcanoes National Park, and vibrant Kigali gastronomy.
            </p>
          </div>

          {!currentUser ? (
            <button
              onClick={() => onOpenAuth('login')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl transition shrink-0 flex items-center gap-2"
            >
              <span>Sign In to Access Travel Guide</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onNavigateTab('tourism')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl transition shrink-0 flex items-center gap-2"
            >
              <span>Open Rwanda Tourism Guide</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
            <div className="font-extrabold text-amber-300 text-sm">Volcanoes National Park</div>
            <p className="text-xs text-slate-300">Home to endangered mountain gorillas in Musanze. Guided trekking packages with licensed park rangers.</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
            <div className="font-extrabold text-blue-300 text-sm">Akagera Big-5 Safari</div>
            <p className="text-xs text-slate-300">Lions, rhinos, elephants, and leopards in eastern savannah wetlands. Boat safaris on Lake Ihema.</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
            <div className="font-extrabold text-emerald-300 text-sm">Kigali Cultural Walking Tour</div>
            <p className="text-xs text-slate-300">Kigali Genocide Memorial, Kimironko Artisan Market, Nyamirambo Women’s Center, and specialty Rwandan coffee shops.</p>
          </div>
        </div>
      </div>

      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Got Questions?</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500">Everything you need to know about attending or streaming summit keynotes.</p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, idx) => {
            const isExpanded = expandedFaqIndex === idx;
            return (
              <div 
                key={idx} 
                className="border border-gray-200 rounded-2xl overflow-hidden transition"
              >
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
                  <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-gray-100 animate-fadeIn">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. CONTACT US SECTION */}
      <div id="contact-us" className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        <div className="space-y-1">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Get in Touch</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Contact Summit Organizers</h2>
          <p className="text-xs sm:text-sm text-slate-500">Have questions about registration, speaker passes, media accreditation, or venue logistics?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Side Cards */}
          <div className="space-y-4">
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
                <MapPin className="w-4 h-4" />
                <span>Venue & Secretariat Address</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Kigali Convention Centre (KCC)</strong><br />
                KG 2 Ave, Kimihurura<br />
                P.O. Box 7521, Kigali, Rwanda
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-blue-800 font-extrabold text-xs">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Summit Support Hotline</span>
              </div>
              <p className="text-xs text-slate-700">
                +250 788 000 000 (Toll-Free in Rwanda)<br />
                +250 788 123 456 (International Delegate Desk)
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>Official Email Inquiries</span>
              </div>
              <p className="text-xs text-slate-700">
                info@rcb.rw • support@kigali2026.rw<br />
                media@kigali2026.rw
              </p>
            </div>
          </div>

          {/* Interactive Contact Form */}
          <div className="lg:col-span-2 bg-gray-50/70 border border-gray-200 rounded-2xl p-6">
            {contactSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-300 p-6 rounded-xl text-center space-y-3 animate-fadeIn">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">Message Sent Successfully!</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Thank you for contacting the Summit Secretariat. Our team will review your message and respond to <strong>{contactEmail}</strong> within 12 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Marie Chantal"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. marie@tech.rw"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Category</label>
                  <select
                    value={contactCategory}
                    onChange={(e) => setContactCategory(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Registration Inquiry">Registration & Ticket Pass</option>
                    <option value="Speaker & CFP">Speaker Presentation / CFP Submission</option>
                    <option value="Sponsorship & Exhibition">Sponsorship & Exhibition Booth</option>
                    <option value="Media Accreditation">Media Accreditation</option>
                    <option value="Hotel & Tourism">Hotel Booking & Tourism Excursions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Provide details about your query..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-blue-600/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message to Secretariat</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 9. STRATEGIC PARTNERS & SPONSORS */}
      <div className="space-y-4 pt-4">
        <div className="text-center text-xs font-extrabold text-slate-400 uppercase tracking-widest">
          Supported & Hosted By Premier Institutions
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-70 hover:opacity-100 transition">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 text-xs font-extrabold text-slate-800">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Rwanda Tech Council</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 text-xs font-extrabold text-slate-800">
            <Globe2 className="w-4 h-4 text-indigo-600" />
            <span>Smart Africa Secretariat</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 text-xs font-extrabold text-slate-800">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>Ministry of ICT & Innovation</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 text-xs font-extrabold text-slate-800">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Carnegie Mellon University Africa</span>
          </div>
        </div>
      </div>
    </div>
  );
};
