import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { emailService } from '../services/emailService';
import { 
  X, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Users, 
  Mic, 
  Sliders, 
  Building2, 
  ShieldAlert, 
  Sparkles, 
  Check, 
  Key,
  ArrowRight,
  AlertCircle,
  Mail,
  RefreshCw
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: User) => void;
  initialMode?: 'login' | 'register' | 'demo' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  initialMode = 'login'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'demo' | 'reset'>(initialMode);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regJobTitle, setRegJobTitle] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('attendee');

  // Password reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSentSuccess, setResetSentSuccess] = useState<string | null>(null);

  // General state
  const [dummyUsers, setDummyUsers] = useState<User[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getDummyUsers().then(setDummyUsers).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const user = await api.login(loginEmail, loginPassword);
      onSuccessLogin(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    try {
      const user = await api.register({
        fullName: regName,
        email: regEmail,
        password: regPassword,
        company: regCompany,
        jobTitle: regJobTitle,
        role: regRole
      });

      // Dispatch Account Email Creation Confirmation via EmailJS
      try {
        const emailRes = await emailService.sendAccountConfirmation({
          to_name: regName,
          to_email: regEmail,
          role: regRole
        });
        setInfoMsg(emailRes.message);
      } catch (emailErr: any) {
        console.warn('EmailJS confirmation warning:', emailErr);
      }

      onSuccessLogin(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResetSentSuccess(null);
    setSubmitting(true);

    try {
      const res = await emailService.sendPasswordReset({
        to_name: resetEmail.split('@')[0] || 'User',
        to_email: resetEmail
      });

      setResetSentSuccess(res.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch password reset email via EmailJS.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSwitch = async (role: UserRole) => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const user = await api.switchDemoUser(role);
      onSuccessLogin(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to switch demo persona.');
    } finally {
      setSubmitting(false);
    }
  };

  const roleMeta: Record<UserRole, { label: string; icon: any; color: string; desc: string; restricted: string }> = {
    guest: {
      label: 'Guest Visitor',
      icon: Users,
      color: 'bg-slate-100 text-slate-800 border-slate-200',
      desc: 'Public view mode, explore directory and sessions',
      restricted: 'Cannot bookmark or network'
    },
    attendee: {
      label: 'Conference Attendee',
      icon: Users,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      desc: 'Registered delegate pass, agenda bookmarking, networking, tourism',
      restricted: 'Cannot access Organizer Control Panel'
    },
    speaker: {
      label: 'Keynote & Track Speaker',
      icon: Mic,
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      desc: 'Speaker studio, assigned session slides & video URLs, CFP management',
      restricted: 'Cannot access Organizer Control Panel'
    },
    moderator: {
      label: 'Session Moderator',
      icon: Sliders,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      desc: 'Live session Q&A moderation, audience polling controls, stream monitoring',
      restricted: 'Cannot access Organizer Control Panel'
    },
    organizer: {
      label: 'Conference Organizer',
      icon: Building2,
      color: 'bg-purple-50 text-purple-800 border-purple-200',
      desc: 'Full schedule editor, ticket QR scanner, conference publishing, CFP AI review',
      restricted: 'Full access to Organizer Workspace'
    },
    administrator: {
      label: 'Platform Administrator',
      icon: ShieldAlert,
      color: 'bg-rose-50 text-rose-800 border-rose-200',
      desc: 'System settings, LiveKit WebRTC credentials, audit logs, system parameters',
      restricted: 'Full Administrative Control'
    },
    super_admin: {
      label: 'Super Administrator',
      icon: ShieldCheck,
      color: 'bg-indigo-50 text-indigo-900 border-indigo-200',
      desc: 'Multi-tenant master control, tenant isolation, security override',
      restricted: 'Unrestricted System Access'
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] sm:max-h-[88vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border border-blue-500/30">
              SHC Platform • Access Control
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Authentication & Role Gate
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Sign in, register, or test instant role-based access with pre-configured personas.
          </p>

          {/* Mode Tabs */}
          <div className="flex items-center gap-2 mt-5 bg-slate-800/80 p-1 rounded-2xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'demo'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>1-Click Demo</span>
            </button>

            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>

            <button
              onClick={() => setActiveTab('reset')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'reset'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Reset Pass</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* DEMO PERSONA SELECTOR TAB */}
          {activeTab === 'demo' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500 font-medium">
                Select any user type below to immediately authenticate and test strict role-based view restrictions:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dummyUsers.map((usr) => {
                  const meta = roleMeta[usr.role] || roleMeta.attendee;
                  const Icon = meta.icon;
                  return (
                    <div
                      key={usr.id}
                      className="bg-gray-50 hover:bg-gray-100/80 border border-gray-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${meta.color}`}>
                            {meta.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{usr.email}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <img
                            src={usr.avatar}
                            alt={usr.fullName}
                            className="w-10 h-10 rounded-full object-cover border border-gray-300 shrink-0"
                          />
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-xs">{usr.fullName}</h4>
                            <p className="text-[11px] text-slate-500 font-medium">{usr.jobTitle} • {usr.company}</p>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 leading-tight">
                          {meta.desc}
                        </p>
                        <div className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-1 rounded-lg">
                          🔒 {meta.restricted}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDemoSwitch(usr.role)}
                        disabled={submitting}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs group-hover:bg-blue-600"
                      >
                        <span>Log in as {usr.fullName.split(' ')[0]} ({usr.role})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SIGN IN TAB */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto pt-2">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl text-xs text-blue-900 space-y-1">
                <p className="font-extrabold">Demo Credentials Hint:</p>
                <p>Attendee: <span className="font-mono">attendee@kigali2026.rw</span> / <span className="font-mono">password123</span></p>
                <p>Organizer: <span className="font-mono">organizer@kigali2026.rw</span> / <span className="font-mono">password123</span></p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. attendee@kigali2026.rw"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reset')}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-blue-600/20"
              >
                <LogIn className="w-4 h-4" />
                <span>{submitting ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              </button>
            </form>
          )}

          {/* REGISTER TAB */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 max-w-lg mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Marie Chantal"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. marie@tech.rw"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Account Role</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="attendee">Attendee (Delegate)</option>
                    <option value="speaker">Speaker</option>
                    <option value="moderator">Session Moderator</option>
                    <option value="organizer">Organizer (RCB)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Company</label>
                  <input
                    type="text"
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    placeholder="e.g. Bank of Kigali"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={regJobTitle}
                    onChange={(e) => setRegJobTitle(e.target.value)}
                    placeholder="e.g. Solution Architect"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Account registration sends an automated EmailJS confirmation receipt to your inbox.</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/20 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{submitting ? 'Creating Account...' : 'Register Account & Issue Pass'}</span>
              </button>
            </form>
          )}

          {/* PASSWORD RESET TAB */}
          {activeTab === 'reset' && (
            <form onSubmit={handlePasswordResetSubmit} className="space-y-4 max-w-md mx-auto pt-2">
              <div className="bg-slate-900 text-white p-4 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-2 font-extrabold text-blue-400">
                  <Mail className="w-4 h-4" />
                  <span>EmailJS Password Reset Service</span>
                </div>
                <p className="text-slate-300">
                  Enter your registered account email address. We will generate a secure reset link and dispatch it via EmailJS directly to your inbox.
                </p>
              </div>

              {resetSentSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resetSentSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="e.g. attendee@kigali2026.rw"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-blue-600/20"
              >
                <Mail className="w-4 h-4" />
                <span>{submitting ? 'Dispatching EmailJS Reset Link...' : 'Send Password Reset Email'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
