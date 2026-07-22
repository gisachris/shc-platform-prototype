import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { emailService } from '../services/emailService';
import { X, LogIn, UserPlus, Key, AlertCircle, Mail } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: User) => void;
  initialMode?: 'login' | 'register' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  initialMode = 'login',
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'reset'>(
    initialMode === 'reset' ? 'reset' : initialMode
  );
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regJobTitle, setRegJobTitle] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSentSuccess, setResetSentSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode === 'reset' ? 'reset' : initialMode);
      setErrorMsg(null);
      setInfoMsg(null);
    }
  }, [isOpen, initialMode]);

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
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const user = await api.register({
        fullName: regName,
        email: regEmail,
        password: regPassword,
        company: regCompany,
        jobTitle: regJobTitle,
      });
      try {
        await emailService.sendAccountConfirmation({
          to_name: regName,
          to_email: regEmail,
          role: 'attendee',
        });
      } catch {
        /* optional */
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
    setSubmitting(true);
    try {
      const result = await emailService.sendPasswordReset({
        to_name: resetEmail.split('@')[0],
        to_email: resetEmail,
      });
      setResetSentSuccess(result.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to send reset email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">SHC Platform Access</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to manage your hybrid conference experience with Rwanda Convention Bureau case study events.
            </p>
          </div>

          <div className="flex gap-2 mb-6 bg-gray-50 p-1 rounded-xl">
            {(['login', 'register'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize ${
                  activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                {tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="mb-4 flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {infoMsg && (
            <div className="mb-4 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
              {infoMsg}
            </div>
          )}

          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs"
                  placeholder="you@organization.rw"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('reset')}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900"
              >
                Forgot password?
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl py-3 text-xs font-bold hover:bg-slate-800 disabled:opacity-60"
              >
                <LogIn className="w-4 h-4" />
                {submitting ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <input
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Full name"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs"
              />
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs"
              />
              <input
                type="password"
                required
                minLength={6}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Password (min 6 characters)"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  placeholder="Organization"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs"
                />
                <input
                  value={regJobTitle}
                  onChange={(e) => setRegJobTitle(e.target.value)}
                  placeholder="Job title"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs"
                />
              </div>
              <p className="text-[10px] text-slate-500">
                New accounts are created as attendees. Organizer access is provisioned by administrators.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl py-3 text-xs font-bold hover:bg-slate-800 disabled:opacity-60"
              >
                <UserPlus className="w-4 h-4" />
                {submitting ? 'Creating…' : 'Create Attendee Account'}
              </button>
            </form>
          )}

          {activeTab === 'reset' && (
            <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
              {resetSentSuccess ? (
                <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  {resetSentSuccess}
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Account email"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl py-3 text-xs font-bold"
                  >
                    <Key className="w-4 h-4" />
                    Send Reset Link
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-[11px] font-semibold text-slate-500"
              >
                Back to sign in
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
