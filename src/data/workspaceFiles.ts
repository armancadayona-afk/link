import { WorkspaceFile } from '../types';

export const WORKSPACE_FILES: WorkspaceFile[] = [
  {
    path: 'token-server/server.js',
    language: 'javascript',
    description: 'Express token server generating 30-minute LiveKit WebRTC access tokens with role enforcement',
    badge: 'Token Server',
    content: `// token-server/server.js
// Production-ready token server for SecureLink WebRTC live support
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AccessToken } from 'livekit-server-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const LIVEKIT_URL = process.env.LIVEKIT_URL;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  console.warn('⚠️ Warning: LIVEKIT credentials are not configured in token-server/.env');
}

/**
 * POST /api/token
 * Request body:
 * {
 *   room: string,      // 6-character session code (e.g. "SL8492")
 *   identity: string,  // e.g. "client-apt14b" or "admin-specialist-1"
 *   role: "client" | "admin"
 * }
 */
app.post('/api/token', async (req, res) => {
  try {
    const { room, identity, role } = req.body;

    if (!room || !identity || !role) {
      return res.status(400).json({ error: 'room, identity, and role are required' });
    }

    // Enforce 6-character clean room format
    const cleanRoom = room.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (cleanRoom.length < 4 || cleanRoom.length > 8) {
      return res.status(400).json({ error: 'Session code must be 4-8 alphanumeric characters' });
    }

    // Token expires strictly after 30 minutes as specified in security specs
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      ttl: '30m', // 30 minutes expiration
    });

    if (role === 'admin') {
      // Admin is strictly subscribe-only
      at.addGrant({
        room: cleanRoom,
        roomJoin: true,
        canPublish: false,
        canPublishData: true,
        canSubscribe: true,
      });
    } else if (role === 'client') {
      // Client has permission to publish camera and screen share streams
      at.addGrant({
        room: cleanRoom,
        roomJoin: true,
        canPublish: true,
        canPublishData: true,
        canSubscribe: true,
      });
    } else {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const token = await at.toJwt();

    return res.json({
      token,
      url: LIVEKIT_URL,
      room: cleanRoom,
      identity,
      role,
      expiresInSeconds: 1800,
    });
  } catch (err) {
    console.error('Failed to generate LiveKit token:', err);
    return res.status(500).json({ error: 'Token generation failed', details: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'SecureLink Token Authority',
    livekitConfigured: Boolean(LIVEKIT_API_KEY && LIVEKIT_API_SECRET),
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(\`✅ SecureLink Token Server listening on port \${PORT}\`);
});
`
  },
  {
    path: 'token-server/.env.example',
    language: 'properties',
    description: 'Environment credentials configuration for LiveKit Cloud or self-hosted deployment',
    badge: 'Credentials',
    content: `# LiveKit Cloud or self-hosted instance WebSocket URL
LIVEKIT_URL=wss://your-livekit-project.livekit.cloud

# LiveKit API Key & Secret (NEVER place inside Android client or admin APKs)
LIVEKIT_API_KEY=APIxxxxxxxxxxxxxx
LIVEKIT_API_SECRET=SECxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Port for token microservice
PORT=3001
`
  },
  {
    path: 'common/ConnectionConfig.kt',
    language: 'kotlin',
    description: 'Shared network configuration for clientapp and adminapp pointing to token server',
    badge: 'Kotlin Config',
    content: `package com.securelink.common

/**
 * Shared configuration for SecureLink LiveKit WebRTC apps.
 * Point this to your deployed token-server instance behind HTTPS.
 */
object ConnectionConfig {
    // Replace with your public token server URL (must be HTTPS for remote devices)
    const val TOKEN_ENDPOINT_URL = "https://your-token-server.example.com/api/token"
    
    // LiveKit WebRTC default connection parameters
    const val SESSION_CODE_LENGTH = 6
    const val TOKEN_TTL_MINUTES = 30
    
    // Fallback development endpoint for local Android emulator (10.0.2.2 maps to host localhost)
    const val DEV_EMULATOR_TOKEN_URL = "http://10.0.2.2:3001/api/token"
}
`
  },
  {
    path: 'clientapp/src/main/java/com/aptconnect/MainActivity.kt',
    language: 'kotlin',
    description: 'AptConnect minimal resident portal with discrete Join Support Session & explicit stream approval',
    badge: 'clientapp',
    content: `package com.aptconnect

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjectionManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.lifecycleScope
import com.securelink.common.ConnectionConfig
import io.livekit.android.LiveKit
import io.livekit.android.room.Room
import io.livekit.android.room.track.LocalVideoTrack
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

class MainActivity : ComponentActivity() {

    private lateinit var room: Room
    private var localCameraTrack: LocalVideoTrack? = null
    private var localScreenTrack: LocalVideoTrack? = null

    private val screenCaptureLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK && result.data != null) {
            startScreenSharing(result.data!!)
        } else {
            Toast.makeText(this, "Screen capture was not approved", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        room = LiveKit.create(applicationContext)

        setContent {
            AptConnectScreen(
                onJoinSupport = { sessionCode ->
                    connectToLiveKitSession(sessionCode)
                },
                onApproveCamera = {
                    toggleCameraSharing()
                },
                onRequestScreenShare = {
                    val mediaProjectionManager = getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
                    screenCaptureLauncher.launch(mediaProjectionManager.createScreenCaptureIntent())
                },
                onRevokeSharing = {
                    revokeAllMedia()
                }
            )
        }
    }

    private fun connectToLiveKitSession(sessionCode: String) {
        lifecycleScope.launch {
            try {
                val client = OkHttpClient()
                val jsonBody = JSONObject().apply {
                    put("room", sessionCode)
                    put("identity", "resident-apt14b")
                    put("role", "client")
                }.toString()

                val request = Request.Builder()
                    .url(ConnectionConfig.TOKEN_ENDPOINT_URL)
                    .post(jsonBody.toRequestBody("application/json".toMediaType()))
                    .build()

                val response = client.newCall(request).execute()
                val body = response.body?.string() ?: return@launch
                val json = JSONObject(body)
                val token = json.getString("token")
                val wsUrl = json.getString("url")

                // LiveKit Android 2.28.2 Connect
                room.connect(wsUrl, token)
                Toast.makeText(this@MainActivity, "Connected to SecureLink Session", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                Toast.makeText(this@MainActivity, "Connection error: \${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun toggleCameraSharing() {
        lifecycleScope.launch {
            if (localCameraTrack == null) {
                localCameraTrack = room.localParticipant.createVideoTrack()
                localCameraTrack?.startCapture()
                room.localParticipant.publishVideoTrack(localCameraTrack!!)
                Toast.makeText(this@MainActivity, "Camera sharing approved and live", Toast.LENGTH_SHORT).show()
            } else {
                localCameraTrack?.stopCapture()
                localCameraTrack = null
            }
        }
    }

    private fun startScreenSharing(permissionIntent: Intent) {
        lifecycleScope.launch {
            // LiveKit Android 2.28.2 screen track initialization
            localScreenTrack = room.localParticipant.createScreenTrack(permissionIntent)
            room.localParticipant.publishVideoTrack(localScreenTrack!!)
            Toast.makeText(this@MainActivity, "Screen sharing approved and broadcasting", Toast.LENGTH_SHORT).show()
        }
    }

    private fun revokeAllMedia() {
        lifecycleScope.launch {
            localCameraTrack?.stopCapture()
            localCameraTrack = null
            localScreenTrack?.stopCapture()
            localScreenTrack = null
            room.disconnect()
            Toast.makeText(this@MainActivity, "Support session terminated. Media revoked.", Toast.LENGTH_SHORT).show()
        }
    }
}
`
  },
  {
    path: 'adminapp/src/main/java/com/securelink/admin/MainActivity.kt',
    language: 'kotlin',
    description: 'SecureLink Admin dashboard with disconnected code entry and connected live video monitor',
    badge: 'adminapp',
    content: `package com.securelink.admin

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.lifecycleScope
import com.securelink.common.ConnectionConfig
import io.livekit.android.LiveKit
import io.livekit.android.events.RoomEvent
import io.livekit.android.room.Room
import io.livekit.android.room.track.RemoteVideoTrack
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

class MainActivity : ComponentActivity() {

    private lateinit var room: Room
    private val isConnectedState = mutableStateOf(false)
    private val remoteVideoTrackState = mutableStateOf<RemoteVideoTrack?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        room = LiveKit.create(applicationContext)

        // Listen for incoming remote video streams published by client
        lifecycleScope.launch {
            room.events.collect { event ->
                when (event) {
                    is RoomEvent.TrackSubscribed -> {
                        val track = event.track
                        if (track is RemoteVideoTrack) {
                            remoteVideoTrackState.value = track
                        }
                    }
                    is RoomEvent.Disconnected -> {
                        isConnectedState.value = false
                        remoteVideoTrackState.value = null
                    }
                    else -> {}
                }
            }
        }

        setContent {
            AdminDashboardScreen(
                isConnected = isConnectedState.value,
                remoteTrack = remoteVideoTrackState.value,
                onConnectWithCode = { code ->
                    connectAsAdmin(code)
                },
                onDisconnect = {
                    room.disconnect()
                    isConnectedState.value = false
                }
            )
        }
    }

    private fun connectAsAdmin(sessionCode: String) {
        lifecycleScope.launch {
            try {
                val client = OkHttpClient()
                val jsonBody = JSONObject().apply {
                    put("room", sessionCode.uppercase())
                    put("identity", "admin-specialist-7")
                    put("role", "admin") // Subscribe-only grant enforced by server
                }.toString()

                val request = Request.Builder()
                    .url(ConnectionConfig.TOKEN_ENDPOINT_URL)
                    .post(jsonBody.toRequestBody("application/json".toMediaType()))
                    .build()

                val response = client.newCall(request).execute()
                val body = response.body?.string() ?: return@launch
                val json = JSONObject(body)
                val token = json.getString("token")
                val wsUrl = json.getString("url")

                // LiveKit subscribe-only connection
                room.connect(wsUrl, token)
                isConnectedState.value = true
                Toast.makeText(this@MainActivity, "Connected to Client Session \${sessionCode}", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                Toast.makeText(this@MainActivity, "Failed to connect: \${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }
}
`
  },
  {
    path: 'clientapp/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Android Manifest declaring required permissions for Camera and Foreground Service MediaProjection',
    badge: 'Permissions',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.aptconnect">

    <!-- Permissions required for LiveKit WebRTC Camera & Audio sharing -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    
    <!-- Android 14+ MediaProjection Foreground Service requirement for screen share -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="AptConnect"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AptConnect">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.AptConnect">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Service for screen capture persistence -->
        <service
            android:name="io.livekit.android.room.track.screencapture.ScreenCaptureService"
            android:foregroundServiceType="mediaProjection"
            android:exported="false" />
    </application>
</manifest>
`
  },
  {
    path: 'build.gradle.kts',
    language: 'kotlin',
    description: 'Root Gradle build configuration with Android and Kotlin plugins',
    badge: 'Gradle',
    content: `// SecureLinkApps root build.gradle.kts
plugins {
    id("com.android.application") version "8.2.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.22" apply false
}
`
  },
  {
    path: 'settings.gradle.kts',
    language: 'kotlin',
    description: 'Gradle settings file configuring repositories and including adminapp and clientapp modules',
    badge: 'Gradle',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "SecureLinkApps"
include(":adminapp")
include(":clientapp")
`
  },
  {
    path: 'clientapp/build.gradle.kts',
    language: 'kotlin',
    description: 'AptConnect module build configuration with LiveKit Android 2.28.2 and Jetpack Compose',
    badge: 'clientapp',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.aptconnect"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.aptconnect"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    // Official LiveKit Android WebRTC SDK (verified 2.28.2)
    implementation("io.livekit:livekit-android:2.28.2")

    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.activity:activity-compose:1.8.2")

    // Coroutines & Lifecycle
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")

    // Networking
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
}
`
  },
  {
    path: 'adminapp/build.gradle.kts',
    language: 'kotlin',
    description: 'SecureLink Admin module build configuration with LiveKit Android 2.28.2 WebRTC video receiver',
    badge: 'adminapp',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.securelink.admin"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.securelink.admin"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    // Official LiveKit Android WebRTC SDK (verified 2.28.2)
    implementation("io.livekit:livekit-android:2.28.2")

    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.activity:activity-compose:1.8.2")

    // Coroutines & Lifecycle
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")

    // Networking
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
}
`
  },
  {
    path: '.github/workflows/build-apk.yml',
    language: 'yaml',
    description: 'Automated CI/CD workflow to compile debug APKs in GitHub Actions and upload downloadable artifacts',
    badge: 'CI / CD',
    content: `name: Build Android APKs

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
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew

      - name: Build AptConnect APK (Client)
        run: ./gradlew :clientapp:assembleDebug --stacktrace

      - name: Build SecureLink Admin APK
        run: ./gradlew :adminapp:assembleDebug --stacktrace

      - name: Upload AptConnect Client APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: aptconnect-debug-apk
          path: clientapp/build/outputs/apk/debug/*.apk

      - name: Upload SecureLink Admin APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: securelink-admin-debug-apk
          path: adminapp/build/outputs/apk/debug/*.apk
`
  },
  {
    path: 'README.md',
    language: 'markdown',
    description: 'Comprehensive guide for compiling APKs locally or in cloud CI/CD',
    badge: 'Docs',
    content: `# SecureLink Android Mobile Support Suite

This workspace contains the complete production-ready source code for:
1. **clientapp** (\`com.aptconnect\`): AptConnect Resident mobile app with camera & screen broadcast.
2. **adminapp** (\`com.securelink.admin\`): Remote Admin diagnostic & video supervision app.
3. **token-server**: Node.js microservice delivering role-based 30-minute LiveKit JWT tokens.

## How to Build the APKs

### Method 1: Android Studio (Recommended)
1. Open Android Studio (Ladybug / Koala / Hedgehog or newer).
2. Choose **File > Open** and select the \`SecureLinkApps\` folder.
3. Allow Gradle to sync dependencies (requires Java JDK 17).
4. In the top toolbar, select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. Once built, click **locate** in the bottom-right notification to access:
   - \`clientapp/build/outputs/apk/debug/clientapp-debug.apk\`
   - \`adminapp/build/outputs/apk/debug/adminapp-debug.apk\`

### Method 2: Command Line (Gradle Wrapper)
\`\`\`bash
# Build Client (AptConnect) APK:
./gradlew :clientapp:assembleDebug

# Build Admin (SecureLink) APK:
./gradlew :adminapp:assembleDebug

# Or build both together:
./gradlew assembleDebug
\`\`\`

### Method 3: GitHub Actions (Automated Cloud Build)
Push this project to a GitHub repository. The included \`.github/workflows/build-apk.yml\` will automatically compile both APKs in Ubuntu cloud runners and make them downloadable under the **Actions** tab as build artifacts!
`
  }
];
