import React, { useState } from 'react';
import { SessionProvider, useSession } from './context/SessionContext';
import { DeviceSimulator } from './components/DeviceSimulator';
import { ClientApp } from './components/ClientApp';
import { AdminApp } from './components/AdminApp';
import { WorkspaceExplorer } from './components/WorkspaceExplorer';
import { downloadAndroidProjectZip } from './utils/exportProject';
import {
  Smartphone,
  ShieldCheck,
  Code2,
  Columns2,
  RefreshCw,
  Zap,
  Info,
  Radio,
  ExternalLink,
  BookOpen,
  Terminal,
  Activity,
  Layers,
  Package,
  FolderArchive
} from 'lucide-react';

function MainAppContent() {
  const { session, startClientSession, connectAdmin, endEntireSession } = useSession();
  const [viewMode, setViewMode] = useState<'dual' | 'client' | 'admin' | 'workspace' | 'buildapk'>('dual');
  const [showQuickInstructions, setShowQuickInstructions] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportZip = async () => {
    try {
      setIsExporting(true);
      await downloadAndroidProjectZip();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickDemoConnect = () => {
    // If session not started or code not generated, initialize
    if (!session.expiresAt) {
      startClientSession();
    }
    // Connect Admin directly to client session
    connectAdmin(session.code);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500/30">
      {/* Top Application Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Workspace Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-950">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm tracking-tight text-white">SecureLink Support Suite</h1>
                <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-medium">
                  LiveKit WebRTC 2.28.2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Android Studio Workspace • <code className="text-slate-300">adminapp</code> & <code className="text-slate-300">clientapp</code>
              </p>
            </div>
          </div>

          {/* View Mode Navigation Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('dual')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'dual'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Dual Interactive Simulator</span>
            </button>

            <button
              onClick={() => setViewMode('client')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'client'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>clientapp (AptConnect)</span>
            </button>

            <button
              onClick={() => setViewMode('admin')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'admin'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-sky-400" />
              <span>adminapp (SecureLink Admin)</span>
            </button>

            <button
              onClick={() => setViewMode('workspace')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'workspace'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Android Studio Files</span>
            </button>

            <button
              onClick={() => setViewMode('buildapk')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'buildapk'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Build APK</span>
            </button>
          </div>

          {/* Quick Actions & Live session handshake controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportZip}
              disabled={isExporting}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              title="Download Android Studio Project ZIP"
            >
              <FolderArchive className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export ZIP'}</span>
            </button>
            {session.status !== 'connected' ? (
              <button
                onClick={handleQuickDemoConnect}
                className="px-3 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-sky-600/30 transition-all flex items-center gap-1.5"
                title="Automatically pair client session code with admin"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Pair & Connect ({session.code})</span>
              </button>
            ) : (
              <button
                onClick={endEntireSession}
                className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>End Session</span>
              </button>
            )}
          </div>
        </div>

        {/* Informative Walkthrough Banner */}
        {showQuickInstructions && (
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border-t border-slate-800/80 px-4 py-2">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  <strong>Interactive Test Flow:</strong> 1. Tap <strong>Join Support Session</strong> in AptConnect &rarr; 2. Note code <strong className="text-emerald-400 font-mono">{session.code}</strong> &rarr; 3. Enter in Admin or tap <strong>Pair & Connect</strong> &rarr; 4. Client separately approves <strong>Camera</strong> or <strong>Screen Sharing</strong>.
                </span>
              </div>
              <button
                onClick={() => setShowQuickInstructions(false)}
                className="text-slate-400 hover:text-slate-200 text-xs ml-4"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Body Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col">
        {/* VIEW 1: DUAL SIMULATOR (Side-by-side Testing) */}
        {viewMode === 'dual' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start my-auto">
            {/* Left Phone: ClientApp (AptConnect) */}
            <div className="flex flex-col items-center">
              <DeviceSimulator
                title="AptConnect"
                subtitle="Resident apartment portal (minimal coming-soon portal with no link button)"
                badge="clientapp"
                badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                headerAction={
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Publisher Role</span>
                  </div>
                }
              >
                <ClientApp />
              </DeviceSimulator>
            </div>

            {/* Right Phone: AdminApp (SecureLink Admin) */}
            <div className="flex flex-col items-center">
              <DeviceSimulator
                title="SecureLink Admin"
                subtitle="Remote support dashboard (Disconnected code entry / Connected live monitor)"
                badge="adminapp"
                badgeColor="bg-sky-500/10 text-sky-400 border-sky-500/20"
                headerAction={
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span>Subscribe-Only</span>
                  </div>
                }
              >
                <AdminApp />
              </DeviceSimulator>
            </div>
          </div>
        )}

        {/* VIEW 2: CLIENT ONLY */}
        {viewMode === 'client' && (
          <div className="my-auto py-4 flex flex-col items-center">
            <DeviceSimulator
              title="AptConnect"
              subtitle="Minimal resident portal with Join Support Session trigger"
              badge="clientapp"
              badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            >
              <ClientApp />
            </DeviceSimulator>
          </div>
        )}

        {/* VIEW 3: ADMIN ONLY */}
        {viewMode === 'admin' && (
          <div className="my-auto py-4 flex flex-col items-center">
            <DeviceSimulator
              title="SecureLink Admin"
              subtitle="Subscribe-only LiveKit WebRTC video monitoring console"
              badge="adminapp"
              badgeColor="bg-sky-500/10 text-sky-400 border-sky-500/20"
            >
              <AdminApp />
            </DeviceSimulator>
          </div>
        )}

        {/* VIEW 4: WORKSPACE & CODE EXPLORER */}
        {viewMode === 'workspace' && (
          <div className="flex-1 flex flex-col">
            <WorkspaceExplorer initialTab="files" />
          </div>
        )}

        {/* VIEW 5: BUILD APK & EXPORT */}
        {viewMode === 'buildapk' && (
          <div className="flex-1 flex flex-col">
            <WorkspaceExplorer initialTab="buildapk" />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-3 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto w-full">
        <div>
          <span>SecureLink Android Apps Workspace • Verified against LiveKit Android 2.28.2 API</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Token Expiry: 30 minutes</span>
          </span>
          <span>Admin: Subscribe-Only</span>
          <span>Client: Publish Grant</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <MainAppContent />
    </SessionProvider>
  );
}
