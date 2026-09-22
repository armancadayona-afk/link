import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../context/SessionContext';
import {
  ShieldAlert,
  ShieldCheck,
  Video,
  ScreenShare,
  Camera,
  Activity,
  Maximize2,
  Volume2,
  VolumeX,
  Crosshair,
  CameraIcon,
  Radio,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Download,
  Trash2,
  Lock,
  Wifi
} from 'lucide-react';

export const AdminApp: React.FC = () => {
  const {
    session,
    activeMediaStream,
    cameraStream,
    screenStream,
    connectAdmin,
    disconnectAdmin,
    setActiveStreamMode,
    sendPointer,
    captureSnapshot,
    toggleAudioMute,
    timeRemainingSeconds,
  } = useSession();

  const [enteredCode, setEnteredCode] = useState('SL-8492');
  const [connectError, setConnectError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stream' | 'snapshots' | 'audit'>('stream');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [laserActive, setLaserActive] = useState(true);
  const [snapshotPreview, setSnapshotPreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const streamContainerRef = useRef<HTMLDivElement>(null);

  // Sync main video track
  useEffect(() => {
    if (videoRef.current && activeMediaStream) {
      videoRef.current.srcObject = activeMediaStream;
    }
  }, [activeMediaStream, session.activeStreamMode]);

  // Sync PiP video track
  useEffect(() => {
    if (pipVideoRef.current) {
      const secondaryStream = session.activeStreamMode === 'camera' ? screenStream : cameraStream;
      if (secondaryStream) {
        pipVideoRef.current.srcObject = secondaryStream;
      }
    }
  }, [cameraStream, screenStream, session.activeStreamMode]);

  const handleConnect = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setConnectError(null);
    const success = connectAdmin(enteredCode);
    if (!success) {
      setConnectError(`Session code "${enteredCode}" not found or expired`);
    }
  };

  const handleStreamClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!laserActive || !streamContainerRef.current) return;
    const rect = streamContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    sendPointer(Math.round(x), Math.round(y), true);
    setTimeout(() => {
      sendPointer(0, 0, false);
    }, 2500);
  };

  const handleTakeSnapshot = () => {
    const snap = captureSnapshot();
    if (snap) {
      setSnapshotPreview(snap);
      setTimeout(() => setSnapshotPreview(null), 3000);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------------------------------
  // 1. DISCONNECTED DASHBOARD STATE (Specified in Prompt)
  // -------------------------------------------------------------------------------------
  if (session.status !== 'connected') {
    return (
      <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 p-4 space-y-4 overflow-y-auto">
        {/* Header with LiveKit Token Server status */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-950/50">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">SecureLink Admin</span>
                <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                  v2.28.2
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Remote Support Specialist Console</p>
            </div>
          </div>

          {/* Token Server Authority badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">Token Server Online</span>
          </div>
        </div>

        {/* Quick Connect Card with 6-char Code Input */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-sky-400" />
                <span>Connect to Resident Session</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter the six-character session code provided by the AptConnect resident.
              </p>
            </div>
          </div>

          <form onSubmit={handleConnect} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                6-Character Session Code
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                    placeholder="SL-XXXX"
                    maxLength={7}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-xl px-3.5 py-2 text-base font-mono font-bold tracking-widest text-emerald-400 placeholder:text-slate-600 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setEnteredCode('SL-8492')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                  >
                    Use AptConnect
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Connect</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {connectError && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{connectError}</span>
                </p>
              )}
            </div>

            {/* Token Policy Reassurance */}
            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>
                Admin role is <strong className="text-slate-200">Subscribe-Only</strong>. Cannot transmit video back to tenant device.
              </span>
            </div>
          </form>
        </div>

        {/* Live Support Requests Queue */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Pending Resident Queue
            </span>
            <span className="text-[11px] text-slate-400 font-mono">1 Active</span>
          </div>

          <div
            onClick={() => {
              setEnteredCode(session.code);
              connectAdmin(session.code);
            }}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-mono font-bold text-xs">
                14B
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-sky-300 transition-colors flex items-center gap-2">
                  <span>The Continental • Jordan Vance</span>
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded font-mono text-emerald-400">
                    {session.code}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Lease time: 30m • Awaiting specialist handshake</span>
                </div>
              </div>
            </div>

            <button className="px-2.5 py-1 text-xs font-medium bg-sky-600/20 text-sky-300 border border-sky-500/30 rounded-lg group-hover:bg-sky-600 group-hover:text-white transition-all">
              Join
            </button>
          </div>
        </div>

        {/* Support Specs & Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-slate-400 text-[10px]">Media Engine</div>
            <div className="text-slate-200 font-semibold mt-0.5">LiveKit 2.28.2 WebRTC</div>
            <div className="text-emerald-400 text-[10px] mt-1">E2EE TLS 1.3</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-slate-400 text-[10px]">Max Resolution</div>
            <div className="text-slate-200 font-semibold mt-0.5">1080p FHD @ 30 FPS</div>
            <div className="text-sky-400 text-[10px] mt-1">VP8 / H.264 Hardware</div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------------------
  // 2. CONNECTED DASHBOARD STATE (Specified in Prompt)
  // -------------------------------------------------------------------------------------
  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Connected Top Bar */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">LiveKit Room: {session.code}</span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-1.5 rounded font-medium">
                Subscribe-Only
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Tenant: Jordan Vance (Apt 14B)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Expiry Countdown badge */}
          <div className="flex items-center gap-1 text-[11px] bg-slate-800 px-2 py-1 rounded-md border border-slate-700 font-mono text-amber-300">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{formatTimer(timeRemainingSeconds)}</span>
          </div>

          {/* Disconnect button */}
          <button
            onClick={disconnectAdmin}
            className="px-2.5 py-1 text-xs font-medium bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-lg transition-colors"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Stream Mode Switcher Tabs */}
      <div className="px-4 py-1.5 bg-slate-900/50 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveStreamMode('camera')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all ${
              session.activeStreamMode === 'camera'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Camera className="w-3 h-3" />
            <span>Client Camera</span>
            {session.cameraApproved && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>

          <button
            onClick={() => setActiveStreamMode('screen')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all ${
              session.activeStreamMode === 'screen'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ScreenShare className="w-3 h-3" />
            <span>Screen Mirror</span>
            {session.screenApproved && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>

          {(session.cameraApproved && session.screenApproved) && (
            <button
              onClick={() => setActiveStreamMode('pip')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all ${
                session.activeStreamMode === 'pip'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>PiP Dual View</span>
            </button>
          )}
        </div>

        {/* View mode actions (Snapshots, Audit) */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab(activeTab === 'stream' ? 'snapshots' : 'stream')}
            className={`px-2 py-0.5 rounded text-[10px] border ${
              activeTab === 'snapshots'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            Snapshots ({session.snapshots.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-3 overflow-hidden relative">
        {activeTab === 'snapshots' ? (
          /* Snapshot Gallery */
          <div className="flex-1 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Captured Evidence Snapshots
              </h3>
              <button
                onClick={() => setActiveTab('stream')}
                className="text-xs text-sky-400 hover:underline"
              >
                Back to Stream
              </button>
            </div>

            {session.snapshots.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No snapshots captured yet. Click the camera icon on the live stream to capture high-res frames.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {session.snapshots.map((snap) => (
                  <div key={snap.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="rounded-lg overflow-hidden bg-black aspect-video relative border border-slate-700">
                      <img src={snap.imageDataUrl} alt="Snapshot" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 text-[9px] bg-slate-900/80 px-1 rounded text-slate-300 font-mono">
                        {snap.source}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{snap.timestamp}</span>
                      <a
                        href={snap.imageDataUrl}
                        download={`securelink-${snap.id}.jpg`}
                        className="text-sky-400 hover:text-sky-300 flex items-center gap-0.5"
                      >
                        <Download className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Live Stream Monitor */
          <div className="flex-1 flex flex-col space-y-2">
            {/* Video Display Container */}
            <div
              ref={streamContainerRef}
              onClick={handleStreamClick}
              className={`relative flex-1 rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center select-none group cursor-crosshair ${
                isFullscreen ? 'fixed inset-4 z-50' : ''
              }`}
            >
              {/* If no stream is approved yet */}
              {(!session.cameraApproved && !session.screenApproved) ? (
                <div className="text-center p-6 space-y-3 max-w-xs">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-amber-400">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Awaiting Client Media Approval</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      The client has connected but has not yet approved camera or screen sharing.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] text-slate-400">
                    Prompt tenant on AptConnect to tap <strong className="text-slate-200">"Approve Camera Sharing"</strong> or <strong className="text-slate-200">"Approve Screen Sharing"</strong>.
                  </div>
                </div>
              ) : (
                <>
                  {/* Primary Video Element */}
                  <video
                    id="admin-live-video"
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={session.audioMuted}
                    className="w-full h-full object-contain"
                  />

                  {/* Picture-in-Picture secondary stream if approved */}
                  {session.activeStreamMode === 'pip' && (
                    <div className="absolute bottom-3 right-3 w-36 h-24 rounded-xl overflow-hidden border-2 border-slate-700 bg-black shadow-2xl z-20">
                      <video
                        ref={pipVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 text-[8px] bg-slate-900/80 px-1 rounded text-slate-300 font-mono">
                        Secondary
                      </span>
                    </div>
                  )}

                  {/* Remote Laser Pointer Indicator if active */}
                  {session.pointer && session.pointer.active && (
                    <div
                      className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
                      style={{
                        left: `${session.pointer.x}%`,
                        top: `${session.pointer.y}%`,
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-rose-500/40 animate-ping absolute -inset-0" />
                      <div className="w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-lg shadow-rose-500" />
                    </div>
                  )}

                  {/* Floating Telemetry HUD in corner */}
                  <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-300 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{session.telemetry.fps} FPS</span>
                    <span className="text-slate-600">•</span>
                    <span>{session.telemetry.latencyMs}ms</span>
                    <span className="text-slate-600">•</span>
                    <span>{session.telemetry.bitrateMbps} Mbps</span>
                  </div>

                  {/* Flashlight indicator if tenant has torch ON */}
                  {session.torchActive && (
                    <div className="absolute top-2 right-2 z-20 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                      <span>Torch Active</span>
                    </div>
                  )}

                  {/* Snapshot alert toast */}
                  {snapshotPreview && (
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 z-40 bg-emerald-950/90 text-emerald-200 border border-emerald-500 px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 shadow-xl animate-bounce">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Snapshot Captured & Saved!</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Specialist Interactive Action Bar */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {/* Snapshot Button */}
                <button
                  onClick={handleTakeSnapshot}
                  disabled={!session.cameraApproved && !session.screenApproved}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                  title="Capture evidence frame"
                >
                  <CameraIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[11px]">Snapshot</span>
                </button>

                {/* Laser Pointer Toggle */}
                <button
                  onClick={() => setLaserActive(!laserActive)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
                    laserActive
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Click on stream to highlight problem for client"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Laser Pointer</span>
                </button>

                {/* Audio Mute Toggle */}
                <button
                  onClick={toggleAudioMute}
                  className={`p-1.5 rounded-lg border ${
                    session.audioMuted
                      ? 'bg-rose-950 text-rose-400 border-rose-800'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title={session.audioMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {session.audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Resolution & Code info */}
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-mono">
                  {session.cameraApproved || session.screenApproved ? session.telemetry.resolution : 'Idle'}
                </div>
                <div className="text-[9px] text-emerald-400 font-medium">
                  {session.telemetry.protocol}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Audit Log Bar at Bottom */}
        <div className="mt-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
            <span className="truncate">
              <strong>Latest Event:</strong> {session.logs[0]?.event || 'Session synchronized'}
            </span>
          </div>
          <span className="text-[10px] font-mono shrink-0 ml-2 text-slate-500">
            {session.logs[0]?.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
};
