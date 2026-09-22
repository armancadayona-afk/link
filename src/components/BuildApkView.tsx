import React, { useState } from 'react';
import {
  Download,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  FolderArchive,
  Layers,
  ArrowRight,
  ExternalLink,
  Cpu,
  AlertCircle
} from 'lucide-react';
import { downloadAndroidProjectZip } from '../utils/exportProject';

export const BuildApkView: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<'both' | 'client' | 'admin'>('both');

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      await downloadAndroidProjectZip();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2500);
  };

  const commands = {
    client: './gradlew :clientapp:assembleDebug',
    admin: './gradlew :adminapp:assembleDebug',
    both: './gradlew assembleDebug',
  };

  return (
    <div className="flex-1 p-5 md:p-8 overflow-y-auto space-y-8 max-w-5xl mx-auto text-slate-200">
      {/* Header section with download banner */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-sky-950/70 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Ready to Assemble
              </span>
              <span className="text-xs text-slate-400">• JDK 17 / Gradle 8.5 • LiveKit 2.28.2</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Build Android APKs (clientapp & adminapp)
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Export the production-ready Android Studio project with full Jetpack Compose UI,
              LiveKit 2.28.2 WebRTC video pipeline, Foreground Service screen projection, and Gradle build configurations.
            </p>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={downloading}
            className="shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-2.5 active:scale-95 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Bundling Workspace...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Project Downloaded!</span>
              </>
            ) : (
              <>
                <FolderArchive className="w-4 h-4" />
                <span>Export Android Project (.ZIP)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Environment Clarification Notice */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3.5">
        <AlertCircle className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <p className="font-semibold text-white">Why export to Android Studio or CI/CD?</p>
          <p className="text-slate-400 leading-relaxed">
            This cloud workspace operates in a lightweight Web runtime designed for real-time simulation and code editing.
            Android APK compilation requires the complete Android SDK (build-tools 34, aapt2, dex compiler) and Java JDK 17 runtime.
            All project files, Gradle scripts, manifests, and GitHub Actions CI/CD workflows are completely scaffolded and ready to build immediately.
          </p>
        </div>
      </div>

      {/* APK Output Targets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: clientapp APK */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/90 space-y-4 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">clientapp (AptConnect)</h3>
                <p className="text-xs text-slate-400">Package: <code className="text-emerald-400">com.aptconnect</code></p>
              </div>
            </div>
            <span className="text-[11px] bg-slate-900 border border-slate-700 px-2 py-0.5 rounded font-mono text-slate-300">
              Debug APK
            </span>
          </div>

          <div className="text-xs text-slate-300 space-y-2">
            <p className="leading-relaxed">
              Resident apartment portal with discrete <strong>Join Support Session</strong>, 6-character room handshake,
              and explicit user approval toggles for Camera and Screen Sharing.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-1">
              <span className="text-slate-500 block">Generated Output Location:</span>
              <span className="text-emerald-300 select-all block break-all">
                clientapp/build/outputs/apk/debug/clientapp-debug.apk
              </span>
            </div>
          </div>

          <button
            onClick={() => copyToClipboard(commands.client, 'cmd-client')}
            className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {copiedCommand === 'cmd-client' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Command Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy: <code className="text-sky-300 font-mono">./gradlew :clientapp:assembleDebug</code></span>
              </>
            )}
          </button>
        </div>

        {/* Card 2: adminapp APK */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/90 space-y-4 hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">adminapp (SecureLink Admin)</h3>
                <p className="text-xs text-slate-400">Package: <code className="text-sky-400">com.securelink.admin</code></p>
              </div>
            </div>
            <span className="text-[11px] bg-slate-900 border border-slate-700 px-2 py-0.5 rounded font-mono text-slate-300">
              Debug APK
            </span>
          </div>

          <div className="text-xs text-slate-300 space-y-2">
            <p className="leading-relaxed">
              Diagnostic & supervision app with 6-character room code entry, live WebRTC video subscriber track,
              snapshot capture, and laser pointer telemetry overlay.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-1">
              <span className="text-slate-500 block">Generated Output Location:</span>
              <span className="text-sky-300 select-all block break-all">
                adminapp/build/outputs/apk/debug/adminapp-debug.apk
              </span>
            </div>
          </div>

          <button
            onClick={() => copyToClipboard(commands.admin, 'cmd-admin')}
            className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {copiedCommand === 'cmd-admin' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Command Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy: <code className="text-sky-300 font-mono">./gradlew :adminapp:assembleDebug</code></span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Build Methods Guide */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span>Step-by-Step Compilation Methods</span>
        </h3>

        {/* Method 1: Android Studio */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h4 className="font-bold text-sm text-white">Method 1: Android Studio (GUI)</h4>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-medium ml-auto">
              Recommended
            </span>
          </div>

          <ol className="text-xs text-slate-300 ml-8 space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              Click <strong>Export Android Project (.ZIP)</strong> above and extract the downloaded <code className="text-sky-300">SecureLinkApps</code> folder.
            </li>
            <li>
              Open Android Studio (Ladybug / Koala / Hedgehog) &rarr; Select <strong>File &gt; Open</strong> &rarr; Select the extracted folder.
            </li>
            <li>
              Allow Gradle to sync dependencies automatically (ensure Java JDK 17 is selected in <em>Settings &gt; Build &gt; Gradle</em>).
            </li>
            <li>
              From the top menu bar, select:
              <div className="mt-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800 font-semibold text-emerald-400 flex items-center gap-2">
                <span>Build</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span>Build Bundle(s) / APK(s)</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span>Build APK(s)</span>
              </div>
            </li>
            <li>
              When the build notification appears in the lower-right corner, click <strong>locate</strong> to open the folder containing both debug APKs.
            </li>
          </ol>
        </div>

        {/* Method 2: Command Line CLI */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h4 className="font-bold text-sm text-white">Method 2: Command Line (Terminal / CMD)</h4>
          </div>

          <div className="text-xs text-slate-300 ml-8 space-y-3">
            <p>In your terminal, navigate to the extracted folder and run the Gradle wrapper:</p>
            <div className="relative">
              <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-sky-300 overflow-x-auto">
{`# Build both clientapp and adminapp APKs together:
./gradlew assembleDebug

# Or on Windows CMD:
gradlew.bat assembleDebug`}
              </pre>
              <button
                onClick={() => copyToClipboard('./gradlew assembleDebug', 'cmd-all')}
                className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy command"
              >
                {copiedCommand === 'cmd-all' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Method 3: GitHub Actions Cloud Build */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h4 className="font-bold text-sm text-white">Method 3: GitHub Actions (Free Cloud Build with No Local Setup)</h4>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-medium ml-auto">
              No Android Studio Needed
            </span>
          </div>

          <div className="text-xs text-slate-300 ml-0 md:ml-8 space-y-3 leading-relaxed">
            <p>
              The exported workspace includes <code className="text-sky-300 font-mono">.github/workflows/build-apk.yml</code>. Push it to any GitHub repo and GitHub's servers will build your APKs automatically!
            </p>

            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                Standard Terminal Commands:
              </span>
              <pre className="font-mono text-[11px] text-sky-300 overflow-x-auto leading-relaxed">
{`# 1. Ensure you are inside the unzipped folder containing 'settings.gradle.kts':
cd SecureLinkApps

# 2. Stage and commit all files
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main`}
              </pre>
            </div>

            {/* Troubleshooting pathspec error */}
            <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-600/30 text-amber-200 space-y-2">
              <div className="font-semibold text-xs flex items-center gap-1.5 text-amber-300">
                <AlertCircle className="w-4 h-4" />
                <span>Fixing "fatal: pathspec did not match any files"</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                If <code className="text-amber-300 font-mono">.github/workflows/build-apk.yml</code> is missing (e.g. from an earlier download or hidden folder exclusion), you can create it instantly in your terminal by running this single command:
              </p>
              <div className="relative">
                <pre className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
{`mkdir -p .github/workflows && cat << 'EOF' > .github/workflows/build-apk.yml
name: Build Android APKs

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle
      - run: chmod +x gradlew
      - name: Build AptConnect Client APK
        run: ./gradlew :clientapp:assembleDebug --stacktrace
      - name: Build SecureLink Admin APK
        run: ./gradlew :adminapp:assembleDebug --stacktrace
      - uses: actions/upload-artifact@v4
        with:
          name: aptconnect-debug-apk
          path: clientapp/build/outputs/apk/debug/*.apk
      - uses: actions/upload-artifact@v4
        with:
          name: securelink-admin-debug-apk
          path: adminapp/build/outputs/apk/debug/*.apk
EOF`}
                </pre>
                <button
                  onClick={() => copyToClipboard(`mkdir -p .github/workflows && cat << 'EOF' > .github/workflows/build-apk.yml
name: Build Android APKs

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle
      - run: chmod +x gradlew
      - name: Build AptConnect Client APK
        run: ./gradlew :clientapp:assembleDebug --stacktrace
      - name: Build SecureLink Admin APK
        run: ./gradlew :adminapp:assembleDebug --stacktrace
      - uses: actions/upload-artifact@v4
        with:
          name: aptconnect-debug-apk
          path: clientapp/build/outputs/apk/debug/*.apk
      - uses: actions/upload-artifact@v4
        with:
          name: securelink-admin-debug-apk
          path: adminapp/build/outputs/apk/debug/*.apk
EOF`, 'cmd-create-workflow')}
                  className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Copy command to create workflow file"
                >
                  {copiedCommand === 'cmd-create-workflow' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
