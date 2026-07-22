import React, { useState, useEffect, useRef } from 'react';
import '@livekit/components-styles';
import { 
  LiveKitRoom, 
  VideoConference, 
  RoomAudioRenderer, 
  useLocalParticipant,
  useMediaDeviceSelect,
  useTrackToggle,
  useRoomContext,
  useTracks,
  useConnectionState
} from '@livekit/components-react';
import { Track, RoomEvent } from 'livekit-client';
import { Session, Speaker } from '../types';
import { api } from '../services/api';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  X, 
  Users, 
  Radio, 
  ShieldCheck, 
  Sparkles, 
  Monitor, 
  Volume2, 
  Activity,
  AlertCircle,
  Settings,
  ChevronDown,
  Check,
  RefreshCw,
  Share2,
  Maximize2,
  Tv,
  ExternalLink
} from 'lucide-react';

interface LiveKitRoomModalProps {
  session: Session;
  speakers: Speaker[];
  onClose: () => void;
  defaultUserName?: string;
}

interface MediaDeviceInfoCustom {
  deviceId: string;
  label: string;
}

/**
 * In-Room Controls & Quick Device Selector Component
 * Mounted INSIDE <LiveKitRoom> to access LiveKit hooks
 */
const CustomInRoomToolbar: React.FC<{
  session: Session;
  onDisconnect: () => void;
}> = ({ session, onDisconnect }) => {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } = useLocalParticipant();

  // Media device pickers from LiveKit React SDK
  const micDeviceSelect = useMediaDeviceSelect({ kind: 'audioinput' });
  const camDeviceSelect = useMediaDeviceSelect({ kind: 'videoinput' });
  const speakerDeviceSelect = useMediaDeviceSelect({ kind: 'audiooutput' });

  // Track toggles
  const micToggle = useTrackToggle({ source: Track.Source.Microphone });
  const camToggle = useTrackToggle({ source: Track.Source.Camera });
  const screenToggle = useTrackToggle({ source: Track.Source.ScreenShare });

  // Popover menus state
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [showMicMenu, setShowMicMenu] = useState(false);
  const [showCamMenu, setShowCamMenu] = useState(false);
  const [screenShareError, setScreenShareError] = useState<string | null>(null);
  const [isIframePolicyError, setIsIframePolicyError] = useState<boolean>(false);

  const handleScreenShareToggle = async () => {
    setScreenShareError(null);
    setIsIframePolicyError(false);
    try {
      await screenToggle.toggle();
    } catch (err: any) {
      console.error('Screen share error:', err);
      const msg = err?.message || String(err);
      if (
        msg.includes('display-capture') || 
        msg.includes('permissions policy') || 
        msg.includes('NotAllowedError') ||
        msg.includes('disallowed')
      ) {
        setScreenShareError('Screen capture inside an embedded preview iframe is disallowed by browser security policy ("display-capture"). Open the app in a new tab to share your screen.');
        setIsIframePolicyError(true);
      } else {
        setScreenShareError(msg || 'Could not start screen capture. Make sure display permissions are granted.');
      }
    }
  };

  return (
    <div className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0 relative z-20">
      {/* Session Title & Connection Status */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
          <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              {connectionState || 'CONNECTED'}
            </span>
            <span className="text-xs text-slate-400 font-medium truncate max-w-xs sm:max-w-md">
              {session.title}
            </span>
          </div>
        </div>
      </div>

      {/* Primary In-Room Quick Controls */}
      <div className="flex items-center gap-2">
        {/* Microphone Toggle + Dropdown */}
        <div className="relative">
          <div className="inline-flex rounded-xl shadow-xs overflow-hidden border border-slate-700">
            <button
              onClick={() => micToggle.toggle()}
              className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition ${
                micToggle.enabled
                  ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400'
                  : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-400'
              }`}
              title={micToggle.enabled ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {micToggle.enabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{micToggle.enabled ? 'Mic On' : 'Muted'}</span>
            </button>
            <button
              onClick={() => {
                setShowMicMenu(!showMicMenu);
                setShowCamMenu(false);
              }}
              className="px-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border-l border-slate-700"
              title="Select Microphone Device"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mic Selection Menu */}
          {showMicMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs">
              <div className="font-bold text-slate-400 px-2 py-1 text-[10px] uppercase border-b border-slate-800">
                Select Microphone
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 mt-1">
                {micDeviceSelect.devices.map(device => (
                  <button
                    key={device.deviceId}
                    onClick={() => {
                      micDeviceSelect.setActiveMediaDevice(device.deviceId);
                      setShowMicMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-[11px] hover:bg-slate-800 transition ${
                      micDeviceSelect.activeDeviceId === device.deviceId ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-slate-300'
                    }`}
                  >
                    <span className="truncate">{device.label || `Microphone (${device.deviceId.slice(0, 6)}...)`}</span>
                    {micDeviceSelect.activeDeviceId === device.deviceId && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Camera Toggle + Dropdown */}
        <div className="relative">
          <div className="inline-flex rounded-xl shadow-xs overflow-hidden border border-slate-700">
            <button
              onClick={() => camToggle.toggle()}
              className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition ${
                camToggle.enabled
                  ? 'bg-slate-800 hover:bg-slate-700 text-blue-400'
                  : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-400'
              }`}
              title={camToggle.enabled ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {camToggle.enabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{camToggle.enabled ? 'Cam On' : 'Cam Off'}</span>
            </button>
            <button
              onClick={() => {
                setShowCamMenu(!showCamMenu);
                setShowMicMenu(false);
              }}
              className="px-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border-l border-slate-700"
              title="Select Camera Device"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cam Selection Menu */}
          {showCamMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs">
              <div className="font-bold text-slate-400 px-2 py-1 text-[10px] uppercase border-b border-slate-800">
                Select Camera
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 mt-1">
                {camDeviceSelect.devices.map(device => (
                  <button
                    key={device.deviceId}
                    onClick={() => {
                      camDeviceSelect.setActiveMediaDevice(device.deviceId);
                      setShowCamMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-[11px] hover:bg-slate-800 transition ${
                      camDeviceSelect.activeDeviceId === device.deviceId ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-slate-300'
                    }`}
                  >
                    <span className="truncate">{device.label || `Camera (${device.deviceId.slice(0, 6)}...)`}</span>
                    {camDeviceSelect.activeDeviceId === device.deviceId && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Screen Share Button */}
        <button
          onClick={handleScreenShareToggle}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
            screenToggle.enabled
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          title="Share Screen or Application Window"
        >
          <Monitor className="w-4 h-4" />
          <span className="hidden md:inline">{screenToggle.enabled ? 'Sharing Screen' : 'Share Screen'}</span>
        </button>

        {/* Device Settings Dialog Button */}
        <button
          onClick={() => setShowDeviceSettings(true)}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition"
          title="A/V Settings & Device Picker"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Leave Room Button */}
        <button
          onClick={onDisconnect}
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition ml-2 shadow-xs"
        >
          Leave
        </button>
      </div>

      {/* Screen Share Error Alert */}
      {screenShareError && (
        <div className="absolute top-14 left-4 right-4 bg-slate-900 border border-rose-500/80 text-rose-100 p-3.5 rounded-xl text-xs flex items-center justify-between z-50 shadow-2xl gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0" />
            <div className="space-y-1.5">
              <span className="font-medium leading-relaxed">{screenShareError}</span>
              {isIframePolicyError && (
                <div>
                  <button
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5 transition shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
                    <span>Open App in New Tab for Screen Sharing</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setScreenShareError(null)} className="p-1 text-slate-400 hover:text-white shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Device Settings Modal */}
      {showDeviceSettings && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" />
                <span>Audio & Video Device Settings</span>
              </h3>
              <button onClick={() => setShowDeviceSettings(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Microphone Picker */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Microphone Input</span>
                </label>
                <select
                  value={micDeviceSelect.activeDeviceId || ''}
                  onChange={(e) => micDeviceSelect.setActiveMediaDevice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {micDeviceSelect.devices.map(d => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Microphone ${d.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Camera Picker */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-blue-400" />
                  <span>Camera Input</span>
                </label>
                <select
                  value={camDeviceSelect.activeDeviceId || ''}
                  onChange={(e) => camDeviceSelect.setActiveMediaDevice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {camDeviceSelect.devices.map(d => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Camera ${d.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Speaker / Audio Output Picker */}
              {speakerDeviceSelect.devices.length > 0 && (
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Speaker Output</span>
                  </label>
                  <select
                    value={speakerDeviceSelect.activeDeviceId || ''}
                    onChange={(e) => speakerDeviceSelect.setActiveMediaDevice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {speakerDeviceSelect.devices.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Speaker ${d.deviceId.slice(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDeviceSettings(false)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                Apply & Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const LiveKitRoomModal: React.FC<LiveKitRoomModalProps> = ({
  session,
  speakers,
  onClose,
  defaultUserName = 'Attendee'
}) => {
  const [userName, setUserName] = useState<string>(defaultUserName || 'Conference Participant');
  const [isSpeaker, setIsSpeaker] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Hardware Media Device State for Pre-Join
  const [micActive, setMicActive] = useState<boolean>(true);
  const [camActive, setCamActive] = useState<boolean>(true);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Devices listing
  const [mics, setMics] = useState<MediaDeviceInfoCustom[]>([]);
  const [cams, setCams] = useState<MediaDeviceInfoCustom[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>('');
  const [selectedCamId, setSelectedCamId] = useState<string>('');
  const [screenShareTested, setScreenShareTested] = useState<boolean>(false);

  // Pre-join Video Ref
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const roomName = `session-${session.id}`;

  // 1. Refresh available hardware devices
  const refreshDevices = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const audioInputs = devices
        .filter(d => d.kind === 'audioinput')
        .map(d => ({ deviceId: d.deviceId, label: d.label || `Microphone (${d.deviceId.slice(0, 5)})` }));

      const videoInputs = devices
        .filter(d => d.kind === 'videoinput')
        .map(d => ({ deviceId: d.deviceId, label: d.label || `Camera (${d.deviceId.slice(0, 5)})` }));

      setMics(audioInputs);
      setCams(videoInputs);

      if (audioInputs.length > 0 && !selectedMicId) setSelectedMicId(audioInputs[0].deviceId);
      if (videoInputs.length > 0 && !selectedCamId) setSelectedCamId(videoInputs[0].deviceId);
    } catch (err) {
      console.warn('Could not enumerate media devices:', err);
    }
  };

  useEffect(() => {
    refreshDevices();
  }, []);

  // 2. Manage Pre-Join Real Hardware Media Preview (Camera + Mic Meter)
  useEffect(() => {
    if (isConnected) {
      // Stop pre-join preview when connected to LiveKit room
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
      return;
    }

    let isCancelled = false;

    const startPreview = async () => {
      // Clean up existing stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }

      if (!camActive && !micActive) {
        if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
        setAudioLevel(0);
        return;
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: camActive ? (selectedCamId ? { deviceId: { exact: selectedCamId } } : true) : false,
          audio: micActive ? (selectedMicId ? { deviceId: { exact: selectedMicId } } : true) : false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (isCancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        mediaStreamRef.current = stream;

        // Re-enumerate devices after getUserMedia to get real device labels!
        refreshDevices();

        // Attach video stream
        if (camActive && videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }

        // Attach Audio Analyser if mic active
        if (micActive && stream.getAudioTracks().length > 0) {
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              const audioCtx = new AudioContextClass();
              audioContextRef.current = audioCtx;
              const analyser = audioCtx.createAnalyser();
              analyser.fftSize = 64;
              const source = audioCtx.createMediaStreamSource(stream);
              source.connect(analyser);

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const updateMeter = () => {
                if (isCancelled) return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i];
                }
                const avg = sum / dataArray.length;
                setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
                animFrameRef.current = requestAnimationFrame(updateMeter);
              };
              updateMeter();
            }
          } catch (e) {
            console.warn('Audio context meter initialization issue:', e);
          }
        }
      } catch (err: any) {
        console.warn('Pre-join getUserMedia error:', err);
        // If specific device failed, fallback to general true
        setError('Camera or Microphone access failed. Please ensure browser permissions are allowed.');
      }
    };

    startPreview();

    return () => {
      isCancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [camActive, micActive, selectedCamId, selectedMicId, isConnected]);

  // Test screen share in pre-join
  const handleTestScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenShareTested(true);
      setError(null);
      // Clean up test stream after 3 seconds
      setTimeout(() => {
        stream.getTracks().forEach(t => t.stop());
      }, 3000);
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (
        msg.includes('display-capture') || 
        msg.includes('permissions policy') || 
        msg.includes('disallowed')
      ) {
        setError('Screen capture inside embedded preview iframe is disallowed by browser security policy. Click "Open App in New Tab" to use Screen Share in a standalone window.');
      } else {
        setError('Screen share capture permission denied or cancelled: ' + msg);
      }
    }
  };

  const handleConnect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.getLiveKitToken({
        sessionId: session.id,
        roomName,
        participantName: userName.trim(),
      });

      setToken(res.token);
      if (res.wsUrl) setWsUrl(res.wsUrl);
      setIsConnected(true);
    } catch (err: any) {
      console.error('Failed to connect to LiveKit:', err);
      setError(err.message || 'Could not start the live session. Sign in and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setToken(null);
  };

  const sessionSpeakers = speakers.filter(s => session.speakerIds.includes(s.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-5xl max-h-[85vh] sm:max-h-[88vh] h-[88vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header (Lobby mode) */}
        {!isConnected && (
          <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Radio className="w-5 h-5 animate-pulse text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Live session
                  </span>
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">Room: {roomName}</span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate max-w-lg">
                  {session.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.open(window.location.href, '_blank')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                title="Open app in a new tab for full screen sharing"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
                <span className="hidden sm:inline">Open in New Tab</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-hidden relative bg-slate-950 flex flex-col">
          {!isConnected ? (
            /* LOBBY / PRE-JOIN MEDIA SETUP SCREEN */
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-center">
              <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                
                {/* Lobby Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Tv className="w-5 h-5 text-blue-400" />
                      <span>Camera & microphone setup</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Configure your hardware, select devices, and test screen share before entering the session.
                    </p>
                  </div>

                  <button
                    onClick={refreshDevices}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Detect Devices</span>
                  </button>
                </div>

                {/* Grid layout: Video Preview Left, Controls Right */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* Left: Camera Preview Box */}
                  <div className="space-y-3">
                    <div className="relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden aspect-video flex items-center justify-center shadow-inner group">
                      {camActive ? (
                        <video
                          ref={videoPreviewRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover transform -scale-x-100"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                          <VideoOff className="w-10 h-10" />
                          <span className="text-xs font-semibold">Camera is Turned Off</span>
                        </div>
                      )}

                      {/* Video status tag */}
                      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-700/60 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${camActive ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                        <span>{camActive ? 'Camera Live' : 'Disabled'}</span>
                      </div>

                      {/* Audio Meter overlay */}
                      <div className="absolute bottom-3 left-3 right-3 bg-slate-900/80 backdrop-blur-xs p-2 rounded-xl border border-slate-700/60 space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-300 font-semibold">
                          <span className="flex items-center gap-1">
                            {micActive ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-rose-400" />}
                            Microphone Input
                          </span>
                          <span className="font-mono text-emerald-400">{micActive ? `${audioLevel}%` : 'Muted'}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full transition-all duration-75"
                            style={{ width: micActive ? `${audioLevel}%` : '0%' }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Camera & Mic Toggles */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setMicActive(!micActive)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                          micActive
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                        }`}
                      >
                        {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        <span>{micActive ? 'Mic Enabled' : 'Mic Muted'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCamActive(!camActive)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                          camActive
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                        }`}
                      >
                        {camActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                        <span>{camActive ? 'Camera On' : 'Camera Off'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right: Device Pickers & User Details */}
                  <div className="space-y-4">
                    {/* Microphone Select */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>Microphone Source:</span>
                        <span className="text-[10px] text-slate-400">{mics.length} detected</span>
                      </label>
                      <select
                        value={selectedMicId}
                        onChange={(e) => setSelectedMicId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                      >
                        {mics.length === 0 ? (
                          <option value="">Default System Microphone</option>
                        ) : (
                          mics.map(m => (
                            <option key={m.deviceId} value={m.deviceId}>{m.label}</option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Camera Select */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>Camera Source:</span>
                        <span className="text-[10px] text-slate-400">{cams.length} detected</span>
                      </label>
                      <select
                        value={selectedCamId}
                        onChange={(e) => setSelectedCamId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                      >
                        {cams.length === 0 ? (
                          <option value="">Default System Camera</option>
                        ) : (
                          cams.map(c => (
                            <option key={c.deviceId} value={c.deviceId}>{c.label}</option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Screen Share Pre-check Button */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Monitor className="w-4 h-4 text-amber-400" />
                          <span>Screen Share Pre-Check</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleTestScreenShare}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Test Capture</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {screenShareTested
                          ? '✓ Screen Capture permission confirmed and ready for presentation.'
                          : 'Click to verify window and full screen sharing permissions before entering.'}
                      </p>
                    </div>

                    {/* Display Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Display Name in Room:</label>
                      <input
                        type="text"
                        required
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="e.g. Dr. Aline Rugamba"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-bold"
                      />
                    </div>

                    {/* Role Select */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsSpeaker(false)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition ${
                          !isSpeaker
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="font-bold">Attendee</div>
                        <div className="text-[10px] opacity-75 font-normal">View & Q&A</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsSpeaker(true)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition ${
                          isSpeaker
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" /> Presenter
                        </div>
                        <div className="text-[10px] opacity-75 font-normal">Stage & Screen Share</div>
                      </button>
                    </div>

                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-slate-950 border border-rose-500/60 rounded-xl text-rose-200 text-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span className="leading-relaxed">{error}</span>
                    </div>
                    {error.includes('disallowed by browser security policy') && (
                      <div>
                        <button
                          type="button"
                          onClick={() => window.open(window.location.href, '_blank')}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5 transition shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open App in New Tab for Screen Share</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Join Button */}
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 px-6 rounded-2xl text-xs shadow-xl shadow-blue-600/25 transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="animate-spin">↻ Connecting…</span>
                  ) : (
                    <>
                      <Video className="w-4.5 h-4.5" />
                      <span>Join session</span>
                    </>
                  )}
                </button>

                <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Audio, video, and screen share available</span>
                </div>
              </div>
            </div>
          ) : (
            /* ACTIVE LIVEKIT WEBRTC ROOM VIEW */
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              {token ? (
                <LiveKitRoom
                  video={camActive}
                  audio={micActive}
                  token={token}
                  serverUrl={wsUrl}
                  data-lk-theme="default"
                  className="flex-1 flex flex-col h-full bg-slate-950"
                  onDisconnected={handleDisconnect}
                  options={{
                    publishDefaults: {
                      videoSimulcastLayers: [],
                      screenShareEncoding: {
                        maxBitrate: 3_000_000,
                        maxFramerate: 30
                      }
                    }
                  }}
                >
                  {/* Custom Toolbar with Quick Mic/Cam/ScreenShare & Device Picker */}
                  <CustomInRoomToolbar session={session} onDisconnect={handleDisconnect} />

                  {/* Standard Full-featured LiveKit Video Conference Component */}
                  <div className="flex-1 overflow-hidden relative">
                    <VideoConference />
                  </div>

                  <RoomAudioRenderer />
                </LiveKitRoom>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-slate-400">
                  <span>Connecting to live room…</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-950 px-6 py-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-300">Track: {session.track}</span>
            <span>•</span>
            <span>Room: {session.room}</span>
            <span>•</span>
            <span>Time: {session.startTime} - {session.endTime}</span>
          </div>

          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Live session active</span>
          </div>
        </div>

      </div>
    </div>
  );
};
