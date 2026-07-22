import React, { useState, useEffect } from 'react';
import { Session, Speaker, Attendee, AuditLogEntry, SystemSettings, User } from '../types';
import { api } from '../services/api';
import { 
  ShieldAlert, 
  Plus, 
  Calendar, 
  Users, 
  Ticket, 
  CheckCircle2, 
  Edit, 
  Trash2, 
  QrCode, 
  Layers, 
  Clock, 
  MapPin, 
  UserPlus,
  RefreshCw,
  FileText,
  Settings,
  ShieldCheck,
  Download,
  Check
} from 'lucide-react';

interface AdminViewProps {
  currentUser?: User | null;
  sessions: Session[];
  speakers: Speaker[];
  attendees: Attendee[];
  onRefreshData: () => void;
  onOpenAddSessionModal: () => void;
  conferenceId?: string;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  sessions,
  speakers,
  attendees,
  onRefreshData,
  onOpenAddSessionModal,
  conferenceId,
}) => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'overview' | 'audit' | 'settings'>('overview');
  const [scanTicketId, setScanTicketId] = useState('');
  const [scanMessage, setScanMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    autoApproveRegistration: true,
    livekitServerUrl: '',
    smtpConfigured: false,
    emergencyHotline: '+250 788 000 000',
    allowPublicCFP: true,
    defaultTimezone: 'CAT (Central Africa Time / Kigali GMT+2)',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dbStatus, setDbStatus] = useState<{
    configured: boolean;
    databaseType: string;
    counts: { users: number; conferences: number; speakers: number; sessions: number; proposals: number };
    timestamp: string;
  } | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [engagement, setEngagement] = useState<any>(null);

  const refreshDbStatus = async () => {
    try {
      const status = await api.getDatabaseStatus();
      setDbStatus(status);
    } catch (err) {
      console.warn('Failed to load DB status:', err);
    }
  };

  useEffect(() => {
    api.getAuditLogs().then(setAuditLogs).catch(console.error);
    api.getSettings().then(setSettings).catch(console.error);
    api.getStats(conferenceId).then(setStats).catch(console.error);
    api.getEngagementAnalytics().then(setEngagement).catch(console.error);
    refreshDbStatus();
  }, [conferenceId]);

  const totalRegistrations = attendees.length;
  const checkedInCount = attendees.filter((a) => a.isCheckedIn).length;

  const handleTicketCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanTicketId.trim()) return;
    try {
      const res = await api.checkInByTicket(scanTicketId.trim());
      if (res.success) {
        setScanMessage({
          text: `Checked in ${res.attendee.fullName} (${res.attendee.ticketId})`,
          success: true,
        });
        setScanTicketId('');
        onRefreshData();
        api.getAuditLogs().then(setAuditLogs).catch(console.error);
      }
    } catch (err: any) {
      setScanMessage({ text: err.message || 'Check-in failed.', success: false });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        await api.deleteSession(sessionId);
        onRefreshData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const exportCSVReport = () => {
    const headers = [
      'Ticket ID',
      'Full Name',
      'Email',
      'Company',
      'Ticket Tier',
      'Checked In',
      'Registered At',
    ];
    const rows = attendees.map((a) => [
      a.ticketId,
      a.fullName,
      a.email,
      a.company,
      a.ticketTier,
      a.isCheckedIn ? 'Yes' : 'No',
      a.registeredAt,
    ]);
    const sessionHeaders = ['Session ID', 'Title', 'Track', 'Day', 'Room', 'Registered'];
    const sessionRows = sessions.map((s) => [
      s.id,
      s.title,
      s.track,
      String(s.day),
      s.room,
      String(s.registeredCount),
    ]);
    const csv = [
      '# Attendees',
      headers.join(','),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
      '',
      '# Sessions',
      sessionHeaders.join(','),
      ...sessionRows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
      '',
      '# Summary',
      `"Revenue estimate","${stats?.revenue ?? 0}"`,
      `"Check-in rate","${stats?.checkInRate ?? 0}%"`,
      `"CFP pending","${stats?.cfpPipeline?.pending ?? 0}"`,
      `"Q&A questions","${engagement?.totalQuestions ?? 0}"`,
      `"Poll votes","${engagement?.totalPollVotes ?? 0}"`,
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `shc_conference_report_${conferenceId || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12 animate-fadeIn">
      {/* Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
              SHC Platform • Admin Suite
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Organizer console
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Manage sessions, check-ins, settings, and attendance reports.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={exportCSVReport}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-md shadow-emerald-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Report</span>
            </button>

            <button
              onClick={onRefreshData}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 p-2.5 rounded-xl text-xs transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4 text-purple-400" />
            </button>
          </div>
        </div>

        {/* Sub-tabs navigation */}
        <div className="flex items-center gap-2 pt-6 border-t border-slate-800 mt-6">
          <button
            onClick={() => setActiveAdminSubTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeAdminSubTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Overview & Scanner</span>
          </button>

          <button
            onClick={() => setActiveAdminSubTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeAdminSubTab === 'audit'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit & System Logs</span>
          </button>

          <button
            onClick={() => setActiveAdminSubTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeAdminSubTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Platform Settings</span>
          </button>
        </div>
      </div>

      {activeAdminSubTab === 'overview' && (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total Registered</span>
                <Users className="w-4 h-4 text-slate-700" />
              </div>
              <div className="text-3xl font-black text-slate-900">{totalRegistrations}</div>
              <div className="text-[10px] text-emerald-700 font-semibold">Registered Delegates</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Checked-In Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {checkedInCount} / {totalRegistrations}
              </div>
              <div className="text-[10px] text-slate-500">
                {totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0}% check-in conversion
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Pass Type Distribution</span>
                <Ticket className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">{totalRegistrations}</div>
              <div className="text-[10px] text-emerald-700 font-semibold">Free All-Access Passes</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total Sessions</span>
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">{sessions.length}</div>
              <div className="text-[10px] text-purple-800 font-semibold">Multi-Track Schedule</div>
            </div>
          </div>

          {/* Ticket check-in */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <QrCode className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Rapid Check-In Ticket Scanner</h3>
                <p className="text-xs text-slate-500">Enter a ticket ID or QR payload (e.g. SHC-12345678) to check in a delegate.</p>
              </div>
            </div>

            <form onSubmit={handleTicketCheckIn} className="flex gap-3">
              <input
                type="text"
                placeholder="Type ticket ID or scan QR string..."
                value={scanTicketId}
                onChange={(e) => setScanTicketId(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 font-mono"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-2xl text-xs transition shadow-xs"
              >
                Check In
              </button>
            </form>

            {scanMessage && (
              <div className={`p-3 rounded-2xl text-xs font-semibold ${
                scanMessage.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {scanMessage.text}
              </div>
            )}
          </div>

          {/* Sessions Management Table */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                Schedule Management ({sessions.length} Sessions)
              </h3>

              <button
                onClick={onOpenAddSessionModal}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Session</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-gray-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3">Day & Time</th>
                    <th className="p-3">Session Title</th>
                    <th className="p-3">Track & Room</th>
                    <th className="p-3">Capacity</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/60 transition">
                      <td className="p-3 font-semibold text-slate-900">
                        Day {s.day} • {s.startTime}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 max-w-xs truncate">{s.title}</div>
                        <div className="text-[10px] text-slate-500">{s.level}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-blue-600 font-semibold">{s.track}</div>
                        <div className="text-[10px] text-slate-500">{s.room}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-700">
                        {s.registeredCount} / {s.capacity} seats
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleDeleteSession(s.id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition"
                          title="Delete Session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeAdminSubTab === 'audit' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">System Audit Trail & Security Log</h3>
              <p className="text-xs text-slate-500">Recent account, check-in, and session management events.</p>
            </div>
            <button
              onClick={() => api.getAuditLogs().then(setAuditLogs)}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Log</span>
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{log.action}</span>
                    <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {log.category}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Target: <span className="font-semibold text-slate-800">{log.target}</span> • Actor: <span className="font-semibold text-slate-800">{log.actor}</span>
                  </div>
                  {log.details && <div className="text-slate-500 font-mono text-[11px]">{log.details}</div>}
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeAdminSubTab === 'settings' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-6 shadow-xs max-w-2xl">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Platform System Settings</h3>
            <p className="text-xs text-slate-500">Conference defaults and live-session server URL.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Live session server URL</label>
              <input
                type="text"
                value={settings.livekitServerUrl}
                onChange={(e) => setSettings({ ...settings, livekitServerUrl: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 font-mono text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emergency Convention Hotline</label>
              <input
                type="text"
                value={settings.emergencyHotline}
                onChange={(e) => setSettings({ ...settings, emergencyHotline: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Event Timezone</label>
              <input
                type="text"
                value={settings.defaultTimezone}
                onChange={(e) => setSettings({ ...settings, defaultTimezone: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="autoApprove"
                checked={settings.autoApproveRegistration}
                onChange={(e) => setSettings({ ...settings, autoApproveRegistration: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <label htmlFor="autoApprove" className="font-semibold text-slate-800">
                Auto-Approve Attendee Ticket Registrations
              </label>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2 font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>System settings updated successfully!</span>
              </div>
            )}

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs transition shadow-md shadow-blue-600/20"
            >
              Save Changes
            </button>
          </form>

          <div className="pt-6 border-t border-gray-100 space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900">Database Status</h4>
            <p className="text-xs text-slate-500">
              {dbStatus
                ? `${dbStatus.databaseType} — users ${dbStatus.counts.users}, conferences ${dbStatus.counts.conferences}, sessions ${dbStatus.counts.sessions}`
                : 'Loading database status…'}
            </p>
            <p className="text-[11px] text-slate-400">
              Apply supabase/schema.sql then run npm run seed from the project root.
            </p>
            <button
              type="button"
              onClick={refreshDbStatus}
              className="bg-gray-100 hover:bg-gray-200 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh DB Status
            </button>
            {dbStatus && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Users</div>
                  <div className="text-sm font-black text-slate-900">{dbStatus.counts.users}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Conferences</div>
                  <div className="text-sm font-black text-slate-900">{dbStatus.counts.conferences}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Speakers</div>
                  <div className="text-sm font-black text-slate-900">{dbStatus.counts.speakers}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Sessions</div>
                  <div className="text-sm font-black text-slate-900">{dbStatus.counts.sessions}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Proposals</div>
                  <div className="text-sm font-black text-slate-900">{dbStatus.counts.proposals}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
