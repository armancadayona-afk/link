import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../context/SessionContext';
import {
  Building2,
  KeyRound,
  Package,
  Sparkles,
  Headphones,
  Camera,
  ScreenShare,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Flashlight,
  Clock,
  ChevronDown,
  ArrowRight,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const ClientApp: React.FC = () => {
  const {
    session,
    cameraStream,
    screenStream,
    startClientSession,
    approveCamera,
    revokeCamera,
    approveScreen,
    revokeScreen,
    toggleTorch,
    endEntireSession,
    timeRemainingSeconds,
  } = useSession();

  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCapturingRealScreen, setIsCapturingRealScreen] = useState(false);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  // Attach streams to local client preview videos
  useEffect(() => {
    if (cameraVideoRef.current && cameraStream) {
      cameraVideoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  const copyCode = () => {
    navigator.clipboard.writeText(session.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenSupport = () => {
    if (!session.expiresAt) {
      startClientSession();
    }
    setSupportModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 relative overflow-x-hidden">
      {/* Top AptConnect Bar */}
      <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">AptConnect</span>
              <span className="text-[9px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-medium">
                Coming Soon
              </span>
            </div>
            <p className="text-[11px] text-slate-400">The Continental • Unit 14B</p>
          </div>
        </div>

        {/* Discreet Resident Support Button in top bar */}
        <button
          onClick={handleOpenSupport}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
            session.status === 'connected'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 animate-pulse'
              : 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700'
          }`}
          title="Connect with building support specialist"
        >
          <Headphones className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">
            {session.status === 'connected' ? 'Support Active' : 'Support'}
          </span>
        </button>
      </div>

      {/* Screen Sharing Active Indicator Banner */}
      {session.screenApproved && (
        <div className="bg-rose-950/90 border-b border-rose-600/40 px-3 py-1.5 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="font-medium text-[11px]">Android MediaProjection: Screen Sharing Live</span>
          </div>
          <button
            onClick={revokeScreen}
            className="text-[10px] bg-rose-900 hover:bg-rose-800 text-rose-100 px-2 py-0.5 rounded border border-rose-700"
          >
            Stop
          </button>
        </div>
      )}

      {/* Main Apartment Portal View (Minimalist Coming-Soon with no external link buttons) */}
      <div className="flex-1 p-4 space-y-3.5 overflow-y-auto">
        {/* Resident Greeting Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">
              Resident Dashboard
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">Welcome home, Jordan</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Your modern resident portal is currently being finalized. Smart lock integration and concierge services are ready.
            </p>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] w-28 h-28 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Digital Residence Key (NFC/Bluetooth) */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-xs text-slate-200">Digital Keypass #14B</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active • NFC & Bluetooth Ready
              </div>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded-md border border-slate-700 font-mono">
            TAP TO UNLOCK
          </span>
        </div>

        {/* Upcoming Maintenance & Inspection Notice */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-xs text-slate-200">South Lobby Parcel Locker</div>
              <div className="text-[11px] text-slate-400">1 Package awaiting collection • Code #8831</div>
            </div>
          </div>
          <span className="text-[10px] text-slate-300 font-mono bg-slate-800 px-2 py-1 rounded">
            BOX #04
          </span>
        </div>

        {/* Smart Thermostat Status */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-medium text-slate-200">Apt 14B Climate Control</span>
            </div>
            <span className="text-xs font-bold text-cyan-300">72°F • Cooling</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full w-[65%]" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
            <span>Eco Mode Active</span>
            <span>Thermostat SN: LK-992-SECURELINK</span>
          </div>
        </div>

        {/* Subtle Resident Support Access (No external link button, directly opens SecureLink session) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Live Technical Support</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Connect your camera or screen directly with property technicians to diagnose thermostat or smart lock issues.
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              {session.status === 'connected' ? (
                <span className="text-emerald-400 font-medium">Session in progress</span>
              ) : (
                <span>Private WebRTC Session</span>
              )}
            </div>

            {/* Action button: Join Support Session */}
            <button
              onClick={handleOpenSupport}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Join Support Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Pointer laser overlay if Admin is pointing on client screen */}
      {session.pointer && session.pointer.active && (
        <div
          className="pointer-events-none absolute z-50 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
          style={{
            left: `${session.pointer.x}%`,
            top: `${session.pointer.y}%`,
          }}
        >
          <div className="w-8 h-8 rounded-full bg-rose-500/30 animate-ping absolute -inset-0" />
          <div className="w-5 h-5 rounded-full bg-rose-500 border-2 border-white shadow-lg shadow-rose-500/80 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
          <div className="text-[9px] bg-slate-900 text-rose-300 font-semibold px-1.5 py-0.5 rounded shadow absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap border border-rose-500/40">
            Admin Pointer
          </div>
        </div>
      )}

      {/* SUPPORT SESSION DIALOG / SHEET (Requested Feature) */}
      {supportModalOpen && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end">
          <div className="w-full bg-slate-900 rounded-t-[28px] border-t border-slate-700/80 p-4 max-h-[92%] overflow-y-auto shadow-2xl flex flex-col">
            {/* Sheet Handle */}
            <div className="flex justify-center mb-2">
              <div className="w-10 h-1 rounded-full bg-slate-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">SecureLink Support Session</h3>
                  <p className="text-[10px] text-slate-400">LiveKit WebRTC • 30-min Token Lease</p>
                </div>
              </div>
              <button
                onClick={() => setSupportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* 6-Character Session Code Block */}
            <div className="my-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center relative">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                Give this 6-Character Code to Admin Specialist
              </span>

              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-2xl font-mono font-black tracking-widest text-emerald-400">
                  {session.code}
                </span>
                <button
                  onClick={copyCode}
                  className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-md hover:bg-slate-800 transition-colors"
                  title="Copy session code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={startClientSession}
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
                  title="Generate new code"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status & Expiry timer */}
              <div className="flex items-center justify-center gap-3 mt-2 text-[11px]">
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Expires: <strong className="text-slate-200 font-mono">{formatTimer(timeRemainingSeconds)}</strong></span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1">
                  {session.status === 'connected' ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Admin Connected
                    </span>
                  ) : (
                    <span className="text-amber-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Awaiting Specialist
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Granular Explicit Permissions / Approvals (Specified in Prompt) */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Resident Media Approvals
              </span>

              {/* 1. Camera Approval Tile */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${session.cameraApproved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Camera Sharing</div>
                      <div className="text-[10px] text-slate-400">
                        {session.cameraApproved
                          ? session.hasRealCamera ? 'Broadcasting live camera stream' : 'Virtual inspection sensor active'
                          : 'Point at hardware or maintenance issues'}
                      </div>
                    </div>
                  </div>

                  {session.cameraApproved ? (
                    <button
                      onClick={revokeCamera}
                      className="px-2.5 py-1 text-[11px] font-medium bg-rose-950 text-rose-300 border border-rose-800 rounded-lg hover:bg-rose-900"
                    >
                      Revoke
                    </button>
                  ) : (
                    <button
                      onClick={approveCamera}
                      className="px-2.5 py-1 text-[11px] font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow"
                    >
                      Approve Camera
                    </button>
                  )}
                </div>

                {/* Camera Live Preview & Torch Toggle when approved */}
                {session.cameraApproved && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-8 rounded bg-black overflow-hidden border border-slate-700 relative">
                        <video
                          ref={cameraVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">1080p WebRTC Live</span>
                    </div>

                    <button
                      onClick={toggleTorch}
                      className={`px-2 py-1 text-[10px] rounded-md border flex items-center gap-1 ${
                        session.torchActive
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <Flashlight className="w-3 h-3" />
                      <span>{session.torchActive ? 'Torch ON' : 'Torch OFF'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Screen Approval Tile */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${session.screenApproved ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-800 text-slate-400'}`}>
                      <ScreenShare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Screen Sharing</div>
                      <div className="text-[10px] text-slate-400">
                        {session.screenApproved
                          ? 'Android MediaProjection active'
                          : 'Share phone display for settings help'}
                      </div>
                    </div>
                  </div>

                  {session.screenApproved ? (
                    <button
                      onClick={revokeScreen}
                      className="px-2.5 py-1 text-[11px] font-medium bg-rose-950 text-rose-300 border border-rose-800 rounded-lg hover:bg-rose-900"
                    >
                      Revoke
                    </button>
                  ) : (
                    <button
                      onClick={approveScreen}
                      className="px-2.5 py-1 text-[11px] font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow"
                    >
                      Approve Screen
                    </button>
                  )}
                </div>

                {/* Screen mini preview */}
                {session.screenApproved && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-12 rounded bg-black overflow-hidden border border-slate-700">
                        <video
                          ref={screenVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] text-sky-400 font-mono">Screen Mirroring Active</span>
                    </div>

                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      System Capture Dialog Accepted
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy Reassurance & Revoke All */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin token is subscribe-only</span>
              </div>

              <button
                onClick={() => {
                  endEntireSession();
                  setSupportModalOpen(false);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 hover:underline font-medium"
              >
                End Session & Revoke All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
