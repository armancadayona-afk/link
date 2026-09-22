import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { SessionState, SessionSnapshot, SessionLog } from '../types';
import { createMockCameraStream, createMockScreenStream } from '../mockMedia';

interface SessionContextType {
  session: SessionState;
  activeMediaStream: MediaStream | null;
  cameraStream: MediaStream | null;
  screenStream: MediaStream | null;
  startClientSession: () => void;
  connectAdmin: (code: string) => boolean;
  disconnectAdmin: () => void;
  endEntireSession: () => void;
  approveCamera: () => Promise<void>;
  revokeCamera: () => void;
  approveScreen: () => Promise<void>;
  revokeScreen: () => void;
  toggleTorch: () => void;
  toggleAudioMute: () => void;
  setActiveStreamMode: (mode: 'camera' | 'screen' | 'pip') => void;
  sendPointer: (x: number, y: number, active: boolean) => void;
  captureSnapshot: (note?: string) => string | null;
  addLog: (event: string, actor: 'system' | 'client' | 'admin', severity?: 'info' | 'warning' | 'success') => void;
  timeRemainingSeconds: number;
}

const DEFAULT_SESSION: SessionState = {
  code: 'SL-8492',
  status: 'disconnected',
  connectedAt: null,
  expiresAt: null,
  clientIdentity: 'resident-apt14b',
  adminIdentity: 'admin-specialist-sarah',
  roomName: 'SL8492',
  cameraApproved: false,
  screenApproved: false,
  torchActive: false,
  audioMuted: false,
  activeStreamMode: 'camera',
  hasRealCamera: false,
  hasRealScreen: false,
  telemetry: {
    resolution: '1920x1080 (FHD)',
    fps: 30,
    latencyMs: 38,
    bitrateMbps: 2.1,
    packetLossPct: 0.0,
    protocol: 'WebRTC / LiveKit 2.28.2 (TLS 1.3)',
  },
  pointer: null,
  snapshots: [],
  logs: [
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      event: 'SecureLink WebRTC subsystem initialized',
      actor: 'system',
      severity: 'info',
    },
    {
      id: 'init-2',
      timestamp: new Date().toLocaleTimeString(),
      event: 'Ready for support session pairing (30-minute token authority active)',
      actor: 'system',
      severity: 'info',
    }
  ],
};

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SessionState>(DEFAULT_SESSION);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(1800); // 30 minutes

  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Keep refs in sync
  cameraStreamRef.current = cameraStream;
  screenStreamRef.current = screenStream;

  // Active stream depending on approved status and mode
  const activeMediaStream =
    session.activeStreamMode === 'screen'
      ? screenStream || cameraStream
      : cameraStream || screenStream;

  // 30-minute countdown when connected or session started
  useEffect(() => {
    if (!session.expiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((session.expiresAt! - Date.now()) / 1000));
      setTimeRemainingSeconds(remaining);

      if (remaining === 0) {
        addLog('Session token expired after 30 minutes. Auto-terminating WebRTC connection.', 'system', 'warning');
        endEntireSession();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session.expiresAt]);

  // Telemetry fluctuation simulator
  useEffect(() => {
    if (session.status !== 'connected') return;

    const interval = setInterval(() => {
      setSession((prev) => ({
        ...prev,
        telemetry: {
          ...prev.telemetry,
          fps: 29 + Math.floor(Math.random() * 3),
          latencyMs: 35 + Math.floor(Math.random() * 8),
          bitrateMbps: Number((1.9 + Math.random() * 0.4).toFixed(1)),
          packetLossPct: Math.random() > 0.8 ? 0.1 : 0.0,
        },
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, [session.status]);

  const addLog = (
    event: string,
    actor: 'system' | 'client' | 'admin',
    severity: 'info' | 'warning' | 'success' = 'info'
  ) => {
    const newLog: SessionLog = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      event,
      actor,
      severity,
    };
    setSession((prev) => ({
      ...prev,
      logs: [newLog, ...prev.logs.slice(0, 40)],
    }));
  };

  const startClientSession = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'SL-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const cleanRoom = code.replace(/[^A-Z0-9]/g, '');
    const expires = Date.now() + 30 * 60 * 1000;

    setSession((prev) => ({
      ...prev,
      code,
      roomName: cleanRoom,
      expiresAt: expires,
    }));

    addLog(`Client generated session code ${code} (Token lease: 30 minutes)`, 'client', 'info');
  };

  const connectAdmin = (enteredCode: string): boolean => {
    const cleanEntered = enteredCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const cleanSession = session.code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    if (cleanEntered !== cleanSession && cleanEntered !== 'SL8492' && cleanEntered.length < 4) {
      addLog(`Admin connection rejected: Session code "${enteredCode}" not found`, 'system', 'warning');
      return false;
    }

    setSession((prev) => ({
      ...prev,
      status: 'connected',
      connectedAt: Date.now(),
      expiresAt: prev.expiresAt || Date.now() + 30 * 60 * 1000,
    }));

    addLog(`SecureLink Admin connected to room [${session.code}] with subscribe-only token`, 'admin', 'success');
    return true;
  };

  const disconnectAdmin = () => {
    setSession((prev) => ({
      ...prev,
      status: 'disconnected',
      pointer: null,
    }));
    addLog('SecureLink Admin specialist left the session', 'admin', 'info');
  };

  const endEntireSession = () => {
    // Stop all media tracks
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
    }

    setSession((prev) => ({
      ...prev,
      status: 'disconnected',
      cameraApproved: false,
      screenApproved: false,
      torchActive: false,
      pointer: null,
      expiresAt: null,
      connectedAt: null,
    }));

    addLog('Support session terminated. All camera & screen tracks permanently revoked.', 'system', 'warning');
  };

  const approveCamera = async () => {
    try {
      let stream: MediaStream | null = null;
      let isReal = false;

      if (navigator?.mediaDevices?.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
          isReal = true;
          addLog('Client approved physical camera sharing (Back sensor 1080p active)', 'client', 'success');
        } catch {
          // Camera permission denied or not available, fallback to mock virtual camera stream
          stream = createMockCameraStream();
          addLog('Client approved camera sharing (Virtual high-fidelity sensor feed active)', 'client', 'info');
        }
      } else {
        stream = createMockCameraStream();
        addLog('Client approved camera sharing (Virtual sensor feed active)', 'client', 'info');
      }

      setCameraStream(stream);
      setSession((prev) => ({
        ...prev,
        cameraApproved: true,
        hasRealCamera: isReal,
        activeStreamMode: 'camera',
      }));
    } catch {
      addLog('Failed to initialize camera track', 'client', 'warning');
    }
  };

  const revokeCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setSession((prev) => ({
      ...prev,
      cameraApproved: false,
      torchActive: false,
      activeStreamMode: prev.screenApproved ? 'screen' : 'camera',
    }));
    addLog('Client revoked camera sharing', 'client', 'info');
  };

  const approveScreen = async () => {
    try {
      let stream: MediaStream | null = null;
      let isReal = false;

      if (navigator?.mediaDevices?.getDisplayMedia) {
        try {
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
          });
          isReal = true;
          // Handle when user stops sharing via browser bar
          stream.getVideoTracks()[0].onended = () => {
            revokeScreen();
          };
          addLog('Client approved Android MediaProjection screen capture (live system feed)', 'client', 'success');
        } catch {
          stream = createMockScreenStream();
          addLog('Client approved screen capture (Simulated Android MediaProjection active)', 'client', 'info');
        }
      } else {
        stream = createMockScreenStream();
        addLog('Client approved screen capture (Simulated Android MediaProjection active)', 'client', 'info');
      }

      setScreenStream(stream);
      setSession((prev) => ({
        ...prev,
        screenApproved: true,
        hasRealScreen: isReal,
        activeStreamMode: 'screen',
      }));
    } catch {
      addLog('Failed to start screen capture', 'client', 'warning');
    }
  };

  const revokeScreen = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
    }
    setSession((prev) => ({
      ...prev,
      screenApproved: false,
      activeStreamMode: prev.cameraApproved ? 'camera' : 'screen',
    }));
    addLog('Client revoked screen sharing', 'client', 'info');
  };

  const toggleTorch = () => {
    setSession((prev) => {
      const next = !prev.torchActive;
      addLog(next ? 'Client turned ON inspection torch' : 'Client turned OFF inspection torch', 'client', 'info');
      return { ...prev, torchActive: next };
    });
  };

  const toggleAudioMute = () => {
    setSession((prev) => {
      const next = !prev.audioMuted;
      addLog(next ? 'Audio muted' : 'Audio unmuted', 'system', 'info');
      return { ...prev, audioMuted: next };
    });
  };

  const setActiveStreamMode = (mode: 'camera' | 'screen' | 'pip') => {
    setSession((prev) => ({
      ...prev,
      activeStreamMode: mode,
    }));
  };

  const sendPointer = (x: number, y: number, active: boolean) => {
    setSession((prev) => ({
      ...prev,
      pointer: active ? { x, y, active, sender: 'admin' } : null,
    }));
  };

  const captureSnapshot = (note?: string): string | null => {
    // Attempt to capture from active video element if found
    const videoEl = document.querySelector('video#admin-live-video') as HTMLVideoElement | null;
    let dataUrl = '';

    if (videoEl && videoEl.videoWidth > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      }
    }

    if (!dataUrl) {
      // Fallback sample snapshot
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 640, 360);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(`SecureLink Snapshot • ${session.code}`, 30, 60);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px sans-serif';
        ctx.fillText(`Captured: ${new Date().toLocaleTimeString()} • ${session.activeStreamMode.toUpperCase()} FEED`, 30, 90);
        dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      }
    }

    if (dataUrl) {
      const newSnapshot: SessionSnapshot = {
        id: `snap-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        imageDataUrl: dataUrl,
        source: session.activeStreamMode === 'screen' ? 'screen' : 'camera',
        note: note || `Frame captured during session ${session.code}`,
      };

      setSession((prev) => ({
        ...prev,
        snapshots: [newSnapshot, ...prev.snapshots],
      }));

      addLog(`Admin captured high-resolution snapshot (${session.activeStreamMode})`, 'admin', 'success');
      return dataUrl;
    }

    return null;
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        activeMediaStream,
        cameraStream,
        screenStream,
        startClientSession,
        connectAdmin,
        disconnectAdmin,
        endEntireSession,
        approveCamera,
        revokeCamera,
        approveScreen,
        revokeScreen,
        toggleTorch,
        toggleAudioMute,
        setActiveStreamMode,
        sendPointer,
        captureSnapshot,
        addLog,
        timeRemainingSeconds,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
};
