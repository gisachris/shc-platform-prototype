/**
 * Delegate registration form and generated pass experience.
 *
 * This page collects user details, pass type, interests, and conference selection before creating
 * an attendee record. It connects to the registration API and updates the app state after success.
 */

import React, { useState, useEffect } from 'react';
import { Attendee, Conference } from '../shared/types';
import { api } from '../services/api';
import { DigitalBadge } from '../components/DigitalBadge';
import { downloadBadgeAsPng } from '../lib/badgeDownload';
import { 
  Ticket, 
  Check, 
  QrCode, 
  User, 
  Mail, 
  Briefcase, 
  Building, 
  Download, 
  ShieldCheck, 
  Tag, 
  Utensils, 
  Shirt, 
  CheckCircle2,
  Building2,
  Globe,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';

interface RegistrationViewProps {
  onRegistrationSuccess: (newAttendee: Attendee) => void;
  conferenceId?: string;
}

export type PassType = 'in_person' | 'online';

interface PassOption {
  id: PassType;
  title: string;
  badgeLabel: string;
  badgeColor: string;
  description: string;
  benefits: string[];
}

const PASS_OPTIONS: PassOption[] = [
  {
    id: 'in_person',
    title: 'In-Person Delegate Pass',
    badgeLabel: 'Kigali Venue Access',
    badgeColor: 'bg-emerald-600',
    description: 'Physical access to all keynotes, breakout tracks, exhibition halls, and networking lounges at Kigali Convention Centre.',
    benefits: [
      'Access to Keynote Auditoriums & Technical Breakout Track Rooms',
      'Exhibition Floor & Innovation Showcase Access',
      'Networking Lunches, Coffee Breaks & Gala Reception',
      'Welcome kit and printed badge',
      'Access to HD Live Streams & On-Demand Session Recordings'
    ]
  },
  {
    id: 'online',
    title: 'Virtual / Online Pass',
    badgeLabel: 'Global Digital Access',
    badgeColor: 'bg-blue-600',
    description: 'Remote live-session access, interactive Q&A, and digital networking.',
    benefits: [
      'Interactive 1080p HD Live Stream with Multi-Track Switching',
      'Live session Q&A and audience polls',
      'Digital Attendee Networking Directory & 1-on-1 Chat Portal',
      'On-Demand Access to Video Archives & Speaker Presentation Decks',
      'Digital certificate of participation'
    ]
  }
];

export const RegistrationView: React.FC<RegistrationViewProps> = ({ onRegistrationSuccess, conferenceId }) => {
  const [selectedPassType, setSelectedPassType] = useState<PassType>('in_person');
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [selectedConferenceId, setSelectedConferenceId] = useState<string>('');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [dietary, setDietary] = useState('None');
  const [tshirtSize, setTshirtSize] = useState('L');
  const [isNetworkingOptIn, setIsNetworkingOptIn] = useState(true);
  const [bio, setBio] = useState('');
  
  // Multi-select interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'AI & Machine Learning',
    'Web Development',
    'Cloud Architecture'
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAttendee, setCreatedAttendee] = useState<Attendee | null>(null);
  const [isBadgeQrReady, setIsBadgeQrReady] = useState(false);
  const [isDownloadingBadge, setIsDownloadingBadge] = useState(false);
  const [badgeDownloadError, setBadgeDownloadError] = useState('');

  useEffect(() => {
    api.getConferences().then(data => {
      setConferences(data);
      const preferred =
        (conferenceId && data.some(c => c.id === conferenceId) && conferenceId) ||
        data[0]?.id ||
        '';
      setSelectedConferenceId(preferred);
    }).catch(console.error);
  }, [conferenceId]);

  const availableInterests = [
    'AI & Machine Learning',
    'Web Development',
    'Cloud Architecture',
    'Cybersecurity',
    'UX & Design Systems',
    'DevOps & SRE',
    'Product Strategy',
    'WebAssembly',
    'Database Optimization'
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const selectedPassOption = PASS_OPTIONS.find(p => p.id === selectedPassType) || PASS_OPTIONS[0];
  const selectedConf = conferences.find(c => c.id === selectedConferenceId);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    setIsSubmitting(true);
    try {
      const res = await api.registerAttendee({
        fullName: fullName.trim(),
        email: email.trim(),
        company: company.trim() || 'Independent',
        jobTitle: jobTitle.trim() || 'Conference Participant',
        ticketTier: selectedPassType === 'in_person' ? 'general' : 'virtual',
        interests: selectedInterests,
        dietaryPreference: dietary,
        tshirtSize,
        isNetworkingOptIn,
        bio: bio.trim(),
        conferenceId: selectedConferenceId || conferenceId,
        attendanceMode: selectedPassType === 'in_person' ? 'onsite' : 'virtual',
      });

      if (res.success) {
        setCreatedAttendee(res.attendee);
        onRegistrationSuccess(res.attendee);
      }
    } catch (err) {
      console.error(err);
      alert('Registration failed. Please check form details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadBadge = async () => {
    if (!createdAttendee) return;
    setIsDownloadingBadge(true);
    setBadgeDownloadError('');
    try {
      await downloadBadgeAsPng('registration-badge', createdAttendee.ticketId);
    } catch (err) {
      setBadgeDownloadError(err instanceof Error ? err.message : 'Badge download failed.');
    } finally {
      setIsDownloadingBadge(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-2 relative z-10">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            SHC Platform • Registration
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Conference registration & delegate pass
          </h2>
          <p className="text-sm text-slate-500">
            Select your preferred conference event, choose between In-Person or Virtual access passes, and generate your official delegate pass.
          </p>
        </div>
      </div>

      {/* Conference Selection Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>1. Choose Conference / Summit Event</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conferences.map((conf) => {
            const isSelected = selectedConferenceId === conf.id;
            return (
              <div
                key={conf.id}
                onClick={() => setSelectedConferenceId(conf.id)}
                className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all duration-200 space-y-2 ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-md bg-blue-50/20'
                    : 'border-gray-200 hover:border-gray-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {conf.venueName}
                  </span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {conf.startDate}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{conf.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{conf.description}</p>
                <div className="pt-2 border-t border-gray-100 text-[11px] font-bold text-slate-700 flex items-center justify-between">
                  <span>Capacity: {conf.capacity} Delegates</span>
                  <span className={isSelected ? 'text-blue-700 font-extrabold' : 'text-slate-400'}>
                    {isSelected ? '✓ Selected' : 'Select Event'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2 Pass Types Selection: In-Person vs Online (Value Neutral) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Ticket className="w-4 h-4 text-slate-700" />
          <span>2. Select Attendance Pass Type</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PASS_OPTIONS.map((pass) => {
            const isSelected = selectedPassType === pass.id;
            return (
              <div
                key={pass.id}
                onClick={() => setSelectedPassType(pass.id)}
                className={`bg-white border rounded-2xl p-6 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-md bg-slate-50/30'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 shadow-sm'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-white text-xs font-bold px-3 py-1 rounded-full ${pass.badgeColor}`}>
                      {pass.badgeLabel}
                    </span>
                    <div className="w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center">
                      {isSelected && <div className="w-3 h-3 bg-slate-900 rounded-full" />}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{pass.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{pass.description}</p>
                  </div>

                  <ul className="space-y-2 pt-3 border-t border-gray-100 text-xs text-slate-700">
                    {pass.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100">
                  <div className={`w-full py-2.5 rounded-xl text-xs font-bold text-center transition ${
                    isSelected ? 'bg-slate-900 text-white shadow-xs' : 'bg-gray-50 text-slate-700 border border-gray-200'
                  }`}>
                    {isSelected ? '✓ Pass Selected' : 'Select This Pass'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Registration Form & Live Badge Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
            <User className="w-5 h-5 text-slate-700" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">3. Delegate Details & Customization</h3>
              <p className="text-xs text-slate-500">
                Provide your registration details to generate your digital badge.
              </p>
            </div>
          </div>

          {createdAttendee ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <div>
                <h4 className="text-lg font-bold text-slate-900">Pass Registered Successfully!</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Your ticket ID is <strong className="text-emerald-700">{createdAttendee.ticketId}</strong> for{' '}
                  <strong>{selectedConf?.title || 'SHC Rwanda Conference'}</strong>.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadBadge}
                  disabled={!isBadgeQrReady || isDownloadingBadge}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloadingBadge ? 'Downloading...' : 'Download badge'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreatedAttendee(null)}
                  className="bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 font-semibold px-4 py-2 rounded-xl text-xs transition"
                >
                  Register Another Delegate
                </button>
              </div>
              {badgeDownloadError && (
                <p className="text-xs text-rose-700" role="alert">{badgeDownloadError}</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena Rostova"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. elena@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Company / Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. OpenAI, Rwanda ICT Association"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Job Title / Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Principal Systems Architect"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Interest Tag Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  Primary Networking Topics & Interests
                </label>

                <div className="flex flex-wrap gap-1.5">
                  {availableInterests.map((interest) => {
                    const isChecked = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                          isChecked
                            ? 'bg-slate-900 text-white font-semibold shadow-xs'
                            : 'bg-gray-50 text-slate-600 border border-gray-200 hover:text-slate-900'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '}{interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5 text-emerald-600" /> Dietary Preference
                  </label>
                  <select
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-slate-900"
                  >
                    <option value="None">Standard / No Restrictions</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Gluten-Free">Gluten-Free</option>
                    <option value="Halal">Halal</option>
                    <option value="Kosher">Kosher</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Shirt className="w-3.5 h-3.5 text-purple-600" /> T-Shirt Size
                  </label>
                  <select
                    value={tshirtSize}
                    onChange={(e) => setTshirtSize(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-slate-900"
                  >
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">Extra Large (XL)</option>
                    <option value="2XL">Double Extra Large (2XL)</option>
                  </select>
                </div>
              </div>

              {/* Networking Opt-in */}
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
                <input
                  type="checkbox"
                  id="networkingOptIn"
                  checked={isNetworkingOptIn}
                  onChange={(e) => setIsNetworkingOptIn(e.target.checked)}
                  className="rounded border-gray-300 text-slate-900 focus:ring-slate-900 w-4 h-4"
                />
                <label htmlFor="networkingOptIn" className="text-slate-700 cursor-pointer">
                  Opt-in to Delegate Directory & 1-on-1 Coffee Chat Networking
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !fullName || !email}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Generating Digital Badge...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Confirm & Generate Conference Pass</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Live Badge Preview Card */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>4. Digital Pass Preview</span>
            <span className="text-[10px] text-blue-600 font-semibold">Live Badge</span>
          </h3>

          <DigitalBadge
            badgeId="registration-badge"
            conference={selectedConf}
            fullName={fullName.trim()}
            jobTitle={jobTitle.trim()}
            company={company.trim()}
            ticketId={createdAttendee?.ticketId || ''}
            qrCodeData={createdAttendee?.qrCodeData || ''}
            passLabel={selectedPassOption.title}
            passColor={selectedPassOption.badgeColor}
            interests={selectedInterests}
            onQrReady={setIsBadgeQrReady}
          />
        </div>
      </div>
    </div>
  );
};
