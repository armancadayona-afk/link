import JSZip from 'jszip';
import { WORKSPACE_FILES } from '../data/workspaceFiles';

/**
 * Bundles all workspace files (Kotlin sources, XML layouts, Gradle configs,
 * manifests, CI/CD scripts, and token server) into a complete, ready-to-build
 * Android Studio project ZIP archive.
 */
export async function downloadAndroidProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root folder inside the zip
  const root = zip.folder('SecureLinkApps') || zip;

  // Add all workspace files
  for (const file of WORKSPACE_FILES) {
    root.file(file.path, file.content);
  }

  // Add gradlew wrapper helper scripts and properties
  root.file(
    'gradle/wrapper/gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.5-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  );

  root.file(
    'gradlew',
    `#!/bin/sh
# Gradle wrapper script for Unix/macOS/Linux
exec gradle "\$@"
`
  );

  root.file(
    'gradlew.bat',
    `@rem Gradle wrapper script for Windows
@rem Run with Gradle
gradle %*
`
  );

  // Generate the zip blob
  const content = await zip.generateAsync({ type: 'blob' });

  // Trigger browser download
  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'SecureLinkApps-Android-Studio-Project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
