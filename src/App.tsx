import React, { useState, useEffect } from 'react';
import { Header, NavTab } from './components/Header';
import { LandingPageView } from './components/LandingPageView';
import { UserDashboardView } from './components/UserDashboardView';
import { ScheduleView } from './components/ScheduleView';
import { SessionDetailModal } from './components/SessionDetailModal';
import { SpeakersView } from './components/SpeakersView';
import { RegistrationView } from './components/RegistrationView';
import { CFPView } from './components/CFPView';
import { AdminView } from './components/AdminView';
import { AddSessionModal } from './components/AddSessionModal';
import { LiveKitRoomModal } from './components/LiveKitRoomModal';
import { TourismView } from './components/TourismView';
import { ConferencesView } from './components/ConferencesView';
import { AuthModal } from './components/AuthModal';

import { Session, Speaker, Attendee, User, UserRole, Conference } from './types';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('landing');
  const [currentConferenceId, setCurrentConferenceId] = useState<string>('conf-rwanda-2026');
  
  // Authentication & Current User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'demo'>('login');

  // App Data State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [stats, setStats] = useState<{ totalAttendees: number; checkedInCount: number; totalSessions: number; totalSpeakers: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Saved Agenda Local Storage
  const [savedSessionIds, setSavedSessionIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('techcon_saved_agenda');
      return stored ? JSON.parse(stored) : ['ses-1', 'ses-6'];
    } catch {
      return ['ses-1', 'ses-6'];
    }
  });

  // Modal States
  const [selectedSessionModal, setSelectedSessionModal] = useState<Session | null>(null);
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string | null>(null);
  const [isAddSessionOpen, setIsAddSessionOpen] = useState<boolean>(false);
  const [liveKitSessionModal, setLiveKitSessionModal] = useState<Session | null>(null);

  // Helper for real current time in minutes
  const getRealCurrentMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  // Live Conference Simulation Clock
  const [isLiveSimulated, setIsLiveSimulated] = useState<boolean>(true);
  const [simulatedTimeMinutes, setSimulatedTimeMinutes] = useState<number>(getRealCurrentMinutes());

  // Load Auth state on initial mount
  useEffect(() => {
    api.getCurrentUser().then((user) => {
      if (user) {
        setCurrentUser(user);
      }
    }).catch(console.error);
  }, []);

  // Persist Saved Agenda
  useEffect(() => {
    try {
      localStorage.setItem('techcon_saved_agenda', JSON.stringify(savedSessionIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedSessionIds]);

  // Initial Data Refresh
  const refreshAllData = async () => {
    try {
      const [sData, spkData, attData, confData, statsData] = await Promise.all([
        api.getSessions(),
        api.getSpeakers(),
        api.getAttendees(),
        api.getConferences(),
        api.getStats()
      ]);
      setSessions(sData);
      setSpeakers(spkData);
      setAttendees(attData);
      setConferences(confData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load conference data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Live Clock Real-time Sync
  useEffect(() => {
    if (!isLiveSimulated) return;
    const updateClock = () => {
      setSimulatedTimeMinutes(getRealCurrentMinutes());
    };
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, [isLiveSimulated]);

  // Enforce tab authorization boundaries
  const handleTabChange = (targetTab: NavTab) => {
    if (targetTab === 'admin') {
      const role = currentUser?.role;
      if (!role || !['organizer', 'administrator', 'super_admin'].includes(role)) {
        alert(`Access Restricted: The Organizer Control Panel is restricted to Organizers & Admins. Current role: ${role || 'Guest'}.`);
        setAuthModalMode('demo');
        setIsAuthModalOpen(true);
        return;
      }
    }
    setActiveTab(targetTab);
  };

  const handleOpenAuth = (mode: 'login' | 'register' | 'demo' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setActiveTab('landing');
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    try {
      const user = await api.switchDemoUser(role);
      setCurrentUser(user);
      if (['organizer', 'administrator', 'super_admin'].includes(role)) {
        setActiveTab('admin');
      } else {
        setActiveTab('schedule');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Bookmark / Unbookmark Session
  const toggleSaveSession = (sessionId: string) => {
    if (savedSessionIds.includes(sessionId)) {
      setSavedSessionIds(savedSessionIds.filter(id => id !== sessionId));
    } else {
      setSavedSessionIds([...savedSessionIds, sessionId]);
    }
  };

  const handleToggleCheckIn = async (attendeeId: string) => {
    try {
      const res = await api.toggleCheckIn(attendeeId);
      if (res.success) {
        setAttendees(attendees.map(a => a.id === attendeeId ? res.attendee : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegistrationSuccess = (newAttendee: Attendee) => {
    setAttendees([newAttendee, ...attendees]);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans selection:bg-slate-900 selection:text-white flex flex-col">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        savedAgendaCount={savedSessionIds.length}
        isLiveSimulated={isLiveSimulated}
        setIsLiveSimulated={setIsLiveSimulated}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onQuickDemoLogin={handleQuickDemoLogin}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
            <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-500">Loading SHC Platform Hub...</p>
          </div>
        ) : (
          <>
            {activeTab === 'landing' && (
              currentUser ? (
                <UserDashboardView
                  currentUser={currentUser}
                  sessions={sessions}
                  conferences={conferences}
                  speakers={speakers}
                  savedSessionIds={savedSessionIds}
                  attendees={attendees}
                  onNavigateTab={handleTabChange}
                  onOpenSessionModal={(s) => setSelectedSessionModal(s)}
                  onOpenLiveKitRoom={(title, name) => {
                    setLiveKitSessionModal({
                      id: 'live-room-' + Date.now(),
                      title,
                      startTime: '10:00',
                      endTime: '11:00',
                      day: 1,
                      room: 'Live WebRTC Auditorium',
                      track: 'AI & Machine Learning',
                      level: 'Intermediate',
                      speakerIds: [],
                      description: 'Interactive Live Session',
                      isKeynote: true,
                      tags: ['live']
                    });
                  }}
                />
              ) : (
                <LandingPageView
                  onOpenAuth={handleOpenAuth}
                  onNavigateTab={handleTabChange}
                  onQuickDemoLogin={handleQuickDemoLogin}
                  stats={stats}
                  conferences={conferences}
                  currentUser={currentUser}
                />
              )
            )}

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
                onSelectConference={(conf) => setCurrentConferenceId(conf.id)}
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
              />
            )}

            {activeTab === 'tourism' && (
              <TourismView />
            )}

            {activeTab === 'cfp' && (
              <CFPView currentUser={currentUser} />
            )}

            {activeTab === 'admin' && (
              <AdminView
                currentUser={currentUser}
                sessions={sessions}
                speakers={speakers}
                attendees={attendees}
                onRefreshData={refreshAllData}
                onOpenAddSessionModal={() => setIsAddSessionOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Authentication & Persona Gate Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccessLogin={(user) => {
          setCurrentUser(user);
          if (['organizer', 'administrator', 'super_admin'].includes(user.role)) {
            setActiveTab('admin');
          } else {
            setActiveTab('schedule');
          }
        }}
      />

      {/* Session Detail & Q&A Modal */}
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

      {/* LiveKit WebRTC Conferencing Modal */}
      {liveKitSessionModal && (
        <LiveKitRoomModal
          session={liveKitSessionModal}
          speakers={speakers}
          onClose={() => setLiveKitSessionModal(null)}
        />
      )}

      {/* Add New Session Modal */}
      <AddSessionModal
        isOpen={isAddSessionOpen}
        onClose={() => setIsAddSessionOpen(false)}
        speakers={speakers}
        onSessionCreated={refreshAllData}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-900">SHC Platform</span> • Smart Hybrid Conference Management System
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Role-Based Access Control (RBAC) Active</span>
            <span>•</span>
            <span>LiveKit WebRTC Real-Time Streams</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
