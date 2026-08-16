/**
 * Authentication modal for sign-in, registration, and password reset.
 *
 * This component manages the auth flow used by the public app and supports reset-token links.
 * It connects to the backend auth routes through the shared API client.
 */

import React, { useState, useEffect } from 'react';
import { User } from '../shared/types';
import { api } from '../services/api';
import { X, LogIn, UserPlus, Key, AlertCircle, Mail } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: User) => void;
  initialMode?: 'login' | 'register' | 'reset';
  /** When opened from an email reset link (?resetToken=…) */
  initialResetToken?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  initialMode = 'login',
  initialResetToken = null,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'reset'>(
    initialMode === 'reset' || initialResetToken ? 'reset' : initialMode
  );
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regJobTitle, setRegJobTitle] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState(initialResetToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [resetPhase, setResetPhase] = useState<'request' | 'set-password'>(
    initialResetToken ? 'set-password' : 'request'
  );
  const [resetInfo, setResetInfo] = useState<string | null>(null);
  const [resetLinkFallback, setResetLinkFallback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(initialResetToken || initialMode === 'reset' ? 'reset' : initialMode);
    setErrorMsg(null);
    setInfoMsg(null);
    setResetInfo(null);
    setResetLinkFallback(null);
    if (initialResetToken) {
      setResetToken(initialResetToken);
      setResetPhase('set-password');
    } else {
      setResetPhase('request');
    }
  }, [isOpen, initialMode, initialResetToken]);

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
      const result = await api.register({
        fullName: regName,
        email: regEmail,
        password: regPassword,
        company: regCompany,
        jobTitle: regJobTitle,
      });
      if (result.welcomeEmailMessage) {
        setInfoMsg(result.welcomeEmailMessage);
      }
      onSuccessLogin(result.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResetInfo(null);
    setResetLinkFallback(null);
    setSubmitting(true);
    try {
      const result = await api.forgotPassword(resetEmail);
      setResetInfo(result.message);
      if (result.resetLink) {
        setResetLinkFallback(result.resetLink);
        const token = new URL(result.resetLink, window.location.origin).searchParams.get('resetToken');
        if (token) setResetToken(token);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to start password reset.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const result = await api.resetPassword(resetToken.trim(), newPassword);
      setInfoMsg(result.message);
      setActiveTab('login');
      setResetPhase('request');
      setNewPassword('');
      // Clear token from address bar if present
      if (window.location.search.includes('resetToken=')) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to reset password.');
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
              Sign in to access your schedule, live sessions, networking, and organizer tools.
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
                onClick={() => {
                  setActiveTab('reset');
                  setResetPhase('request');
                }}
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
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                    Organization <span className="font-medium normal-case text-slate-400">(optional)</span>
                  </label>
                  <input
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    placeholder="e.g. Kigali Innovation Hub"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                    Job title <span className="font-medium normal-case text-slate-400">(optional)</span>
                  </label>
                  <input
                    value={regJobTitle}
                    onChange={(e) => setRegJobTitle(e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Organization and job title are profile fields for networking — not platform access roles.
                Every self-signup account is created as an <strong>attendee</strong>. Organizer or speaker
                access is assigned by an administrator.
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
            <div className="space-y-4">
              {resetPhase === 'request' ? (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  {resetInfo && (
                    <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex gap-2">
                      <Mail className="w-4 h-4 shrink-0" />
                      <div className="space-y-2">
                        <p>{resetInfo}</p>
                        {resetLinkFallback && (
                          <p className="text-[11px] text-slate-600">
                            Temporary reset link (email not delivered):{' '}
                            <button
                              type="button"
                              className="text-blue-700 font-semibold underline"
                              onClick={() => {
                                setResetPhase('set-password');
                              }}
                            >
                              Continue to set a new password
                            </button>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
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
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl py-3 text-xs font-bold disabled:opacity-60"
                  >
                    <Key className="w-4 h-4" />
                    {submitting ? 'Sending…' : 'Send reset instructions'}
                  </button>
                  {resetLinkFallback && (
                    <button
                      type="button"
                      onClick={() => setResetPhase('set-password')}
                      className="w-full text-[11px] font-semibold text-blue-700"
                    >
                      I have a reset token — set new password
                    </button>
                  )}
                </form>
              ) : (
                <form onSubmit={handleSetNewPassword} className="space-y-4">
                  <p className="text-[11px] text-slate-500">
                    Enter a new password for your account. The reset link expires after one hour.
                  </p>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 characters)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !resetToken}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl py-3 text-xs font-bold disabled:opacity-60"
                  >
                    <Key className="w-4 h-4" />
                    {submitting ? 'Updating…' : 'Update password'}
                  </button>
                </form>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-[11px] font-semibold text-slate-500"
              >
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
