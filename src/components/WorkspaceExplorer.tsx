import React, { useState } from 'react';
import { WORKSPACE_FILES } from '../data/workspaceFiles';
import { WorkspaceFile } from '../types';
import { BuildApkView } from './BuildApkView';
import { downloadAndroidProjectZip } from '../utils/exportProject';
import {
  FolderTree,
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  Server,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Play,
  Cpu,
  Package,
  FolderArchive
} from 'lucide-react';

interface WorkspaceExplorerProps {
  initialTab?: 'files' | 'setup' | 'tokentest' | 'buildapk';
}

export const WorkspaceExplorer: React.FC<WorkspaceExplorerProps> = ({ initialTab = 'files' }) => {
  const [selectedFile, setSelectedFile] = useState<WorkspaceFile>(WORKSPACE_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'setup' | 'tokentest' | 'buildapk'>(initialTab);
  const [exportingZip, setExportingZip] = useState(false);

  const handleExportZip = async () => {
    try {
      setExportingZip(true);
      await downloadAndroidProjectZip();
    } catch (e) {
      console.error(e);
    } finally {
      setExportingZip(false);
    }
  };

  // Token simulator test state
  const [testRoom, setTestRoom] = useState('SL-8492');
  const [testRole, setTestRole] = useState<'client' | 'admin'>('client');
  const [simulatedToken, setSimulatedToken] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateTestToken = () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: testRole === 'admin' ? 'admin-specialist-sarah' : 'resident-apt14b',
        room: testRoom.replace(/[^A-Z0-9]/g, ''),
        role: testRole,
        video: {
          room: testRoom.replace(/[^A-Z0-9]/g, ''),
          roomJoin: true,
          canPublish: testRole === 'client',
          canSubscribe: true,
        },
        exp: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
        iss: 'API_SECURELINK_DEV_KEY',
      })
    );
    const sig = 'simulated_livekit_signature_verified_2_28_2';
    setSimulatedToken(`${header}.${payload}.${sig}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Bar Navigation */}
      <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span>SecureLink Android Studio Workspace</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                LiveKit 2.28.2
              </span>
            </h3>
            <p className="text-xs text-slate-400">Two independent apps + production token-server</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('buildapk')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'buildapk' ? 'bg-emerald-600 text-white shadow' : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Build APK</span>
            </button>

            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'files' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Source Explorer</span>
            </button>

            <button
              onClick={() => setActiveTab('setup')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'setup' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Setup & Build Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('tokentest')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'tokentest' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Token API Sandbox</span>
            </button>
          </div>

          <button
            onClick={handleExportZip}
            disabled={exportingZip}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Download full project ZIP"
          >
            <FolderArchive className="w-3.5 h-3.5 text-emerald-400" />
            <span>{exportingZip ? 'Exporting...' : 'Export ZIP'}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Panels */}
      {activeTab === 'files' && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[550px]">
          {/* Left Sidebar: File Tree */}
          <div className="w-full md:w-72 bg-slate-950/80 border-r border-slate-800/80 p-3 space-y-2 overflow-y-auto">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 block">
              Project Structure
            </span>

            <div className="space-y-1">
              {WORKSPACE_FILES.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                    selectedFile.path === file.path
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate font-mono">{file.path}</span>
                  </div>
                  {file.badge && (
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded shrink-0">
                      {file.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1.5">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Security Architecture</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                LiveKit API keys remain exclusively on <code className="text-sky-300">token-server</code>. Android APKs only receive short-lived JWTs (30m expiry).
              </p>
            </div>
          </div>

          {/* Right Editor: File Content Viewer */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-slate-200">{selectedFile.path}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{selectedFile.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            {/* Code Content display */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-300 bg-slate-950 leading-relaxed selection:bg-indigo-500/30">
              <pre>
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'setup' && (
        <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-4xl mx-auto text-slate-200">
          <div>
            <h2 className="text-xl font-bold text-white">Live Camera & Screen Sharing Setup Guide</h2>
            <p className="text-sm text-slate-400 mt-1">
              Follow these instructions to run the Android apps on physical devices or emulators using LiveKit WebRTC.
            </p>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h4 className="font-bold text-sm text-white">Open in Android Studio</h4>
              </div>
              <p className="text-xs text-slate-300 ml-8 leading-relaxed">
                Open the <code className="text-sky-300">SecureLinkApps</code> workspace folder in Android Studio. Ensure Gradle uses JDK 17. The project contains two modules: <code className="text-emerald-300">adminapp</code> and <code className="text-emerald-300">clientapp</code>.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h4 className="font-bold text-sm text-white">Configure & Deploy Token Server</h4>
              </div>
              <div className="text-xs text-slate-300 ml-8 space-y-2 leading-relaxed">
                <p>
                  Copy <code className="text-sky-300">token-server/.env.example</code> to <code className="text-sky-300">.env</code> and fill in your LiveKit Cloud credentials:
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300">
                  LIVEKIT_URL=wss://your-subdomain.livekit.cloud<br />
                  LIVEKIT_API_KEY=APIxxxxxxxxxxxxxx<br />
                  LIVEKIT_API_SECRET=SECxxxxxxxxxxxxxxxxxxxxxxxxxx
                </div>
                <p className="text-slate-400">
                  Run <code className="text-indigo-400">npm install && npm start</code> in <code className="text-indigo-400">token-server</code>, and host behind public HTTPS.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h4 className="font-bold text-sm text-white">Update ConnectionConfig.kt</h4>
              </div>
              <p className="text-xs text-slate-300 ml-8 leading-relaxed">
                Paste your deployed token endpoint URL (e.g. <code className="text-sky-300">https://your-server.com/api/token</code>) into <code className="text-sky-300">ConnectionConfig.kt</code> so both apps know where to request JWT tokens.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <h4 className="font-bold text-sm text-white">Run & Exchange 6-Character Session Code</h4>
              </div>
              <ul className="text-xs text-slate-300 ml-8 space-y-1.5 list-disc list-inside">
                <li>On AptConnect (<code className="text-emerald-300">clientapp</code>), tap <strong>Join Support Session</strong> and read the 6-character code (e.g., <code className="text-emerald-400 font-mono">SL-8492</code>).</li>
                <li>On SecureLink Admin (<code className="text-sky-300">adminapp</code>), enter that code in the Quick Connect card.</li>
                <li>The client taps <strong>Approve Camera Sharing</strong> or <strong>Approve Screen Sharing</strong> to begin publishing high-definition WebRTC video.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tokentest' && (
        <div className="flex-1 p-6 overflow-y-auto space-y-5 max-w-2xl mx-auto text-slate-200">
          <div>
            <h2 className="text-lg font-bold text-white">LiveKit Token Generation Sandbox</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulates the token generation logic executed by <code className="text-indigo-400">token-server/server.js</code> with 30-minute expiration.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Session Code / Room</label>
                <input
                  type="text"
                  value={testRoom}
                  onChange={(e) => setTestRoom(e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Target App Role</label>
                <select
                  value={testRole}
                  onChange={(e) => setTestRole(e.target.value as 'client' | 'admin')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="client">client (AptConnect - May Publish)</option>
                  <option value="admin">admin (SecureLink Admin - Subscribe Only)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateTestToken}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Generate LiveKit Token</span>
            </button>

            {simulatedToken && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400">Generated JWT (Expires in 1800s / 30m):</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(simulatedToken)}
                    className="text-[11px] text-sky-400 hover:underline"
                  >
                    Copy Token
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 break-all select-all">
                  {simulatedToken}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Grant: <strong className="text-slate-200">canPublish: {testRole === 'client' ? 'true' : 'false'}</strong>, canSubscribe: true, ttl: 30m
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Build APK & Export Tab */}
      {activeTab === 'buildapk' && (
        <BuildApkView />
      )}
    </div>
  );
};
