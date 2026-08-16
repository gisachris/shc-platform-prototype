/**
 * Root application controller for the SHC frontend.
 *
 * This is the central React component that manages current user state, navigation tabs,
 * conference selection, modal windows, and data refresh. It connects the entire app together,
 * rendering the public landing screen and the role-specific dashboard views.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header, NavTab } from './components/Header';
import { LandingPageView } from './pages/LandingPageView';
import { UserDashboardView } from './pages/UserDashboardView';
import { ScheduleView } from './pages/ScheduleView';
import { SessionDetailModal } from './pages/SessionDetailModal';
import { SpeakersView } from './pages/SpeakersView';
import { RegistrationView } from './pages/RegistrationView';
import { CFPView } from './pages/CFPView';
import { AdminView } from './pages/AdminView';
import { AddSessionModal } from './components/AddSessionModal';
import { LiveKitRoomModal } from './components/LiveKitRoomModal';
import { TourismView } from './pages/TourismView';
import { ConferencesView } from './pages/ConferencesView';
import { AuthModal } from './components/AuthModal';

import { Session, Speaker, Attendee, User, Conference } from './shared/types';
import { api } from './services/api';

const ORGANIZER_ROLES = ['organizer', 'administrator', 'super_admin'];

const APP_TABS_WITH_CONFERENCE_CONTEXT: NavTab[] = [
  'schedule',
  'speakers',
  'registration',
  'cfp',
  'admin',
];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('landing');
  const [currentConferenceId, setCurrentConferenceId] = useState<string>('');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'reset'>('login');
  const [resetTokenFromUrl, setResetTokenFromUrl] = useState<string | null>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [platformStats, setPlatformStats] = useState<{
    totalAttendees: number;
    checkedInCount: number;
    totalSessions: number;
    totalSpeakers: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [savedSessionIds, setSavedSessionIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('shc_saved_agenda');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [selectedSessionModal, setSelectedSessionModal] = useState<Session | null>(null);
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string | null>(null);
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [liveKitSessionModal, setLiveKitSessionModal] = useState<Session | null>(null);

  const getRealCurrentMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  const [isLiveSimulated, setIsLiveSimulated] = useState(true);
  const [simulatedTimeMinutes, setSimulatedTimeMinutes] = useState(getRealCurrentMinutes);

  const activeConference = useMemo(
    () => conferences.find((c) => c.id === currentConferenceId) || null,
    [conferences, currentConferenceId]
  );

  const showConferenceContext =
    Boolean(activeConference) && APP_TABS_WITH_CONFERENCE_CONTEXT.includes(activeTab);

  useEffect(() => {
    api.getCurrentUser().then((user) => {
      if (user) setCurrentUser(user);
    }).catch(console.error);

    const params = new URLSearchParams(window.location.search);
    const token = params.get('resetToken');
    if (token) {
      setResetTokenFromUrl(token);
      setAuthModalMode('reset');
      setIsAuthModalOpen(true);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('shc_saved_agenda', JSON.stringify(savedSessionIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedSessionIds]);

  const refreshAllData = async () => {
    try {
      const [spkData, confData, platformStatsData] = await Promise.all([
        api.getSpeakers(),
        api.getConferences(),
        api.getStats(),
      ]);

      setSpeakers(spkData);
      setConferences(confData);
      setPlatformStats(platformStatsData);

      const resolvedId =
        (currentConferenceId && confData.some((c: Conference) => c.id === currentConferenceId)
          ? currentConferenceId
          : confData[0]?.id) || '';

      // Resolve default conference from API once — avoids hardcoded IDs on first paint
      if (resolvedId !== currentConferenceId) {
        setCurrentConferenceId(resolvedId);
        return;
      }

      if (resolvedId) {
        const [sData] = await Promise.all([
          api.getSessions({ conferenceId: resolvedId }),
        ]);
        setSessions(sData);

        if (currentUser && ORGANIZER_ROLES.includes(currentUser.role)) {
          try {
            const attData = await api.getAttendees(resolvedId);
            setAttendees(attData);
          } catch {
            setAttendees([]);
          }
        } else {
          setAttendees([]);
        }
      } else {
        setSessions([]);
        setAttendees([]);
      }
    } catch (err) {
      console.error('Failed to load conference data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConferenceId, currentUser?.id]);

  useEffect(() => {
    if (!isLiveSimulated) return;
    const updateClock = () => setSimulatedTimeMinutes(getRealCurrentMinutes());
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, [isLiveSimulated]);

  const handleTabChange = (targetTab: NavTab) => {
    if (targetTab === 'admin') {
      const role = currentUser?.role;
      if (!role || !ORGANIZER_ROLES.includes(role)) {
        setAuthModalMode('login');
        setIsAuthModalOpen(true);
        return;
      }
    }
    setActiveTab(targetTab);
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setAttendees([]);
    setActiveTab('landing');
  };

  const toggleSaveSession = (sessionId: string) => {
    setSavedSessionIds((prev) =>
      prev.includes(sessionId) ? prev.filter((id) => id !== sessionId) : [...prev, sessionId]
    );
  };

  const handleRegistrationSuccess = (newAttendee: Attendee) => {
    setAttendees((prev) => [newAttendee, ...prev]);
    refreshAllData();
  };

  const isPublicLanding = activeTab === 'landing' && !currentUser;

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans selection:bg-slate-900 selection:text-white flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        savedAgendaCount={savedSessionIds.length}
        isLiveSimulated={isLiveSimulated}
        setIsLiveSimulated={setIsLiveSimulated}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        activeConferenceLabel={showConferenceContext ? activeConference?.title : null}
      />

      <main
        className={
          isPublicLanding
            ? 'flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 max-w-7xl'
            : 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6'
        }
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
            <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Loading SHC Platform...</p>
          </div>
        ) : (
          <>
            {activeTab === 'landing' &&
              (currentUser ? (
                <UserDashboardView
                  currentUser={currentUser}
                  sessions={sessions}
                  conferences={conferences}
                  speakers={speakers}
                  savedSessionIds={savedSessionIds}
                  attendees={attendees}
                  onNavigateTab={handleTabChange}
                  onOpenSessionModal={(s) => setSelectedSessionModal(s)}
                  onOpenLiveKitRoom={(s) => setLiveKitSessionModal(s)}
                />
              ) : (
                <LandingPageView
                  onOpenAuth={handleOpenAuth}
                  onNavigateTab={handleTabChange}
                  onSelectConference={setCurrentConferenceId}
                  stats={platformStats}
                  conferences={conferences}
                  speakers={speakers}
                />
              ))}

            {activeTab === 'schedule' && (
              <ScheduleView
                currentUser={currentUser}
                sessions={sessions}
                speakers={speakers}
                savedSessionIds={savedSessionIds}
                toggleSaveSession={toggleSaveSession}
                onSelectSession={(s) => setSelectedSessionModal(s)}
                onSelectSpeaker={(id) => {
                  setSelectedSpeakerId(id);
                  handleTabChange('speakers');
                }}
                isLiveSimulated={isLiveSimulated}
                simulatedTimeMinutes={simulatedTimeMinutes}
                onOpenAddSessionModal={() => setIsAddSessionOpen(true)}
                onOpenLiveKitRoom={(s) => setLiveKitSessionModal(s)}
              />
            )}

            {activeTab === 'conferences' && (
              <ConferencesView
                currentUser={currentUser}
                currentConferenceId={currentConferenceId}
                onSelectConference={(conf) => {
                  setCurrentConferenceId(conf.id);
                  if (currentUser) handleTabChange('schedule');
                }}
              />
            )}

            {activeTab === 'speakers' && (
              <SpeakersView
                speakers={speakers}
                sessions={sessions}
                savedSessionIds={savedSessionIds}
                toggleSaveSession={toggleSaveSession}
                onSelectSession={(s) => setSelectedSessionModal(s)}
                selectedSpeakerId={selectedSpeakerId}
                setSelectedSpeakerId={setSelectedSpeakerId}
              />
            )}

            {activeTab === 'registration' && (
              <RegistrationView
                onRegistrationSuccess={handleRegistrationSuccess}
                conferenceId={currentConferenceId}
              />
            )}

            {activeTab === 'tourism' && <TourismView />}

            {activeTab === 'cfp' && (
              <CFPView currentUser={currentUser} conferenceId={currentConferenceId} />
            )}

            {activeTab === 'admin' && (
              <AdminView
                currentUser={currentUser}
                sessions={sessions}
                speakers={speakers}
                attendees={attendees}
                onRefreshData={refreshAllData}
                onOpenAddSessionModal={() => setIsAddSessionOpen(true)}
                conferenceId={currentConferenceId}
              />
            )}
          </>
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setResetTokenFromUrl(null);
          if (window.location.search.includes('resetToken=')) {
            window.history.replaceState({}, '', window.location.pathname);
          }
        }}
        initialMode={authModalMode}
        initialResetToken={resetTokenFromUrl}
        onSuccessLogin={(user) => {
          setCurrentUser(user);
          if (ORGANIZER_ROLES.includes(user.role)) {
            setActiveTab('admin');
          } else {
            setActiveTab('schedule');
          }
        }}
      />

      <SessionDetailModal
        currentUser={currentUser}
        session={selectedSessionModal}
        onClose={() => setSelectedSessionModal(null)}
        speakers={speakers}
        savedSessionIds={savedSessionIds}
        toggleSaveSession={toggleSaveSession}
        onSelectSpeaker={(id) => {
          setSelectedSpeakerId(id);
          handleTabChange('speakers');
        }}
        onOpenLiveKitRoom={(s) => setLiveKitSessionModal(s)}
      />

      {liveKitSessionModal && (
        <LiveKitRoomModal
          session={liveKitSessionModal}
          speakers={speakers}
          onClose={() => setLiveKitSessionModal(null)}
          defaultUserName={currentUser?.fullName}
        />
      )}

      <AddSessionModal
        isOpen={isAddSessionOpen}
        onClose={() => setIsAddSessionOpen(false)}
        speakers={speakers}
        onSessionCreated={refreshAllData}
        conferenceId={currentConferenceId}
      />

      {!isPublicLanding && (
        <footer className="bg-white border-t border-gray-200 py-8 text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-bold text-slate-900">SHC Platform</span>
              {' '}• Smart Hybrid Conference Management
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <span>Hybrid sessions powered by LiveKit</span>
            </div>
          </div>
        </footer>
      )}

      {isPublicLanding && (
        <footer className="bg-white border-t border-gray-200 py-6 text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="font-bold text-slate-900">SHC Platform</span>
            {' '}• Smart Hybrid Conference Management
          </div>
        </footer>
      )}
    </div>
  );
}
