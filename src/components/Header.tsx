import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Users, 
  UserCheck, 
  Mic, 
  FileText, 
  Sparkles, 
  ShieldAlert, 
  Ticket,
  Clock,
  Radio,
  Bookmark,
  Building2,
  Compass,
  Bell,
  Check,
  Home,
  LogIn,
  LogOut,
  ChevronDown,
  User as UserIcon,
  ShieldCheck,
  Sliders
} from 'lucide-react';
import { AppNotification, User, UserRole } from '../types';
import { api } from '../services/api';

export type NavTab = 
  | 'landing' 
  | 'schedule' 
  | 'conferences' 
  | 'speakers' 
  | 'registration' 
  | 'tourism' 
  | 'cfp' 
  | 'admin';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  savedAgendaCount: number;
  isLiveSimulated: boolean;
  setIsLiveSimulated: (live: boolean) => void;
  currentUser: User | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  /** When set (app views only), shows live conference context — never a hardcoded venue. */
  activeConferenceLabel?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedAgendaCount,
  isLiveSimulated,
  setIsLiveSimulated,
  currentUser,
  onOpenAuth,
  onLogout,
  activeConferenceLabel,
}) => {
  const isPublicLanding = activeTab === 'landing' && !currentUser;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    api.getNotifications().then(setNotifications).catch(console.error);
  };

  // Notifications only for signed-in users; click-outside for menus
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    if (!currentUser) {
      setNotifications([]);
      setIsNotifOpen(false);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      const res = await api.markNotificationsRead();
      setNotifications(res.notifications);
    } catch (err) {
      console.error(err);
    }
  };

  // Determine role permissions for tabs
  const userRole = currentUser?.role || 'guest';
  const canAccessOrganizer = ['organizer', 'administrator', 'super_admin'].includes(userRole);

  const rolePillColors: Record<UserRole, string> = {
    guest: 'bg-slate-100 text-slate-700 border-slate-300',
    attendee: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    speaker: 'bg-blue-100 text-blue-800 border-blue-300',
    moderator: 'bg-amber-100 text-amber-800 border-amber-300',
    organizer: 'bg-purple-100 text-purple-800 border-purple-300',
    administrator: 'bg-rose-100 text-rose-800 border-rose-300',
    super_admin: 'bg-indigo-100 text-indigo-900 border-indigo-300'
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 text-slate-800 shadow-xs">
      {/* App status strip — hidden on public marketing landing to avoid duplicate chrome */}
      {!isPublicLanding && (
        <div className="bg-slate-950 text-white text-xs py-1.5 px-4 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2 font-medium min-w-0">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="truncate">
                {activeConferenceLabel
                  ? `Viewing · ${activeConferenceLabel}`
                  : 'SHC Platform'}
              </span>
            </div>

            {currentUser && activeTab === 'schedule' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsLiveSimulated(!isLiveSimulated)}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold transition ${
                    isLiveSimulated
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Radio className={`w-3 h-3 ${isLiveSimulated ? 'animate-pulse text-emerald-400' : ''}`} />
                  <span>{isLiveSimulated ? 'Schedule clock on' : 'Schedule clock paused'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white shadow-sm flex items-center justify-center">
            <Building2 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                SHC <span className="text-blue-600">Platform</span>
              </h1>
            </div>
            <p className="text-xs text-slate-500">Smart Hybrid Conference Management</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {/* Guest public links — not on marketing landing (CTAs live in the page) */}
            {!currentUser && !isPublicLanding && (
              <>
                <button
                  onClick={() => setActiveTab('conferences')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === 'conferences'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Conferences</span>
                </button>
                <button
                  onClick={() => setActiveTab('speakers')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === 'speakers'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>Speakers</span>
                </button>
                <button
                  onClick={() => setActiveTab('registration')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === 'registration'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>Register</span>
                </button>
                <button
                  onClick={() => setActiveTab('tourism')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === 'tourism'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                  }`}
                >
                  <Compass className={`w-4 h-4 ${activeTab === 'tourism' ? 'text-white' : 'text-emerald-600'}`} />
                  <span>Tourism</span>
                </button>
              </>
            )}

            {/* Signed-in application tabs */}
            {currentUser && (
              <>
                <button
                  onClick={() => setActiveTab('landing')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === 'landing'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === 'schedule'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Schedule</span>
                  {savedAgendaCount > 0 && (
                    <span className="ml-0.5 bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                      <Bookmark className="w-2.5 h-2.5 fill-slate-950" />
                      {savedAgendaCount}
                    </span>
                  )}
                </button>

                {/* Conferences */}
                <button
                  onClick={() => setActiveTab('conferences')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === 'conferences'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Conferences</span>
                </button>

                {/* Speakers */}
                <button
                  onClick={() => setActiveTab('speakers')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === 'speakers'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>Speakers</span>
                </button>

                {/* Register Pass */}
                <button
                  onClick={() => setActiveTab('registration')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === 'registration'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>Register Pass</span>
                </button>

                {/* Rwanda Tourism */}
                <button
                  onClick={() => setActiveTab('tourism')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === 'tourism'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                  }`}
                >
                  <Compass className={`w-4 h-4 ${activeTab === 'tourism' ? 'text-white' : 'text-emerald-600'}`} />
                  <span>Rwanda Tourism</span>
                </button>

                {/* Call For Papers */}
                <button
                  onClick={() => setActiveTab('cfp')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === 'cfp'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>CFP</span>
                </button>

                {/* Organizer tools */}
                {canAccessOrganizer && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                      activeTab === 'admin'
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    <ShieldAlert className={`w-4 h-4 ${activeTab === 'admin' ? 'text-white' : 'text-purple-600'}`} />
                    <span>Admin</span>
                  </button>
                )}
              </>
            )}
          </nav>

          {/* User Profile / Auth State Controls */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            {currentUser && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2 rounded-xl border border-gray-200 text-slate-700 hover:bg-gray-100 transition relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs animate-fadeIn">
                    <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
                      <span className="font-extrabold">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-blue-300 hover:text-white font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-slate-400">No notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className={`p-3 space-y-1 ${n.read ? 'bg-white' : 'bg-blue-50/50'}`}>
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span>{n.title}</span>
                              <span className="text-[10px] text-slate-400 font-normal">{n.timestamp}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-snug">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AUTH / PROFILE TRIGGER */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 p-1.5 rounded-2xl transition"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-gray-300"
                  />
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-extrabold text-slate-900 leading-none">{currentUser.fullName}</div>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${rolePillColors[currentUser.role]}`}>
                      {currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Logged in User Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-2 text-xs space-y-2 animate-fadeIn">
                    <div className="p-2 bg-gray-50 rounded-xl space-y-0.5">
                      <div className="font-extrabold text-slate-900">{currentUser.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{currentUser.email}</div>
                      <div className="text-[10px] text-slate-600">{currentUser.jobTitle} • {currentUser.company}</div>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => { setIsUserMenuOpen(false); onLogout(); }}
                        className="w-full text-left px-2.5 py-2 rounded-xl text-rose-700 hover:bg-rose-50 font-bold flex items-center gap-2 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-slate-800 text-xs font-extrabold px-3 py-2 rounded-xl transition shadow-sm"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
