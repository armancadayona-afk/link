export interface SessionState {
  code: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'ended';
  connectedAt: number | null;
  expiresAt: number | null;
  clientIdentity: string;
  adminIdentity: string;
  roomName: string;
  
  // Permissions & Approvals
  cameraApproved: boolean;
  screenApproved: boolean;
  torchActive: boolean;
  audioMuted: boolean;
  
  // Active primary stream
  activeStreamMode: 'camera' | 'screen' | 'pip';
  
  // Real media track references or mock
  hasRealCamera: boolean;
  hasRealScreen: boolean;
  
  // Telemetry metrics
  telemetry: {
    resolution: string;
    fps: number;
    latencyMs: number;
    bitrateMbps: number;
    packetLossPct: number;
    protocol: string;
  };
  
  // Pointer annotation
  pointer: {
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    active: boolean;
    sender: 'admin' | 'client';
  } | null;

  // Captured snapshots
  snapshots: SessionSnapshot[];
  
  // Session audit logs
  logs: SessionLog[];
}

export interface SessionSnapshot {
  id: string;
  timestamp: string;
  imageDataUrl: string;
  source: 'camera' | 'screen';
  note?: string;
}

export interface SessionLog {
  id: string;
  timestamp: string;
  event: string;
  actor: 'system' | 'client' | 'admin';
  severity: 'info' | 'warning' | 'success';
}

export interface WorkspaceFile {
  path: string;
  language: 'kotlin' | 'groovy' | 'xml' | 'javascript' | 'json' | 'markdown' | 'properties' | 'yaml';
  content: string;
  description: string;
  badge?: string;
}
