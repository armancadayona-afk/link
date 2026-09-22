/**
 * Mock video stream generators for realistic fallback in sandboxed iframe environments
 * or when physical hardware cameras are absent.
 */

export function createMockCameraStream(): MediaStream | null {
  if (typeof window === 'undefined' || !document.createElement) return null;

  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  let frame = 0;
  let animId: number;

  const render = () => {
    frame++;
    const t = frame * 0.03;

    // Background gradient (apartment inspection setting)
    const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGrad.addColorStop(0, '#1e293b');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines for camera sensor simulation
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Thermostat / HVAC Panel simulation
    const panelX = canvas.width / 2 - 220;
    const panelY = canvas.height / 2 - 160;
    const panelW = 440;
    const panelH = 320;

    // Device shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(panelX + 10, panelY + 12, panelW, panelH);

    // Device body (Smart Thermostat)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 24);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();

    // Circular Display screen
    const cx = panelX + panelW / 2;
    const cy = panelY + panelH / 2 - 20;
    const radius = 100;

    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Temperature arc
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 15, Math.PI * 0.75, Math.PI * 2.25);
    ctx.stroke();

    // Current Temp
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('72°F', cx, cy + 10);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('COOLING • APT 14B', cx, cy + 34);

    // Barcode / Serial on side
    ctx.fillStyle = '#1e293b';
    ctx.font = '12px monospace';
    ctx.fillText('SN: LK-992-SECURELINK', cx, panelY + panelH - 30);

    // Live Camera reticle / crosshairs
    const reticleSize = 60 + Math.sin(t * 2) * 5;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.lineWidth = 2;

    // Top-left bracket
    ctx.beginPath();
    ctx.moveTo(cx - reticleSize, cy - reticleSize + 20);
    ctx.lineTo(cx - reticleSize, cy - reticleSize);
    ctx.lineTo(cx - reticleSize + 20, cy - reticleSize);
    ctx.stroke();

    // Top-right bracket
    ctx.beginPath();
    ctx.moveTo(cx + reticleSize - 20, cy - reticleSize);
    ctx.lineTo(cx + reticleSize, cy - reticleSize);
    ctx.lineTo(cx + reticleSize, cy - reticleSize + 20);
    ctx.stroke();

    // Bottom-left bracket
    ctx.beginPath();
    ctx.moveTo(cx - reticleSize, cy + reticleSize - 20);
    ctx.lineTo(cx - reticleSize, cy + reticleSize);
    ctx.lineTo(cx - reticleSize + 20, cy + reticleSize);
    ctx.stroke();

    // Bottom-right bracket
    ctx.beginPath();
    ctx.moveTo(cx + reticleSize - 20, cy + reticleSize);
    ctx.lineTo(cx + reticleSize, cy + reticleSize);
    ctx.lineTo(cx + reticleSize, cy + reticleSize - 20);
    ctx.stroke();

    // Optical focus dot
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Camera HUD Overlays
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(40, 40, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LIVE CLIENT CAMERA [BACK SENSOR]', 56, 45);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.fillText(`ISO 160 • 4K UHD 60FPS • LUX: 450 • ${new Date().toLocaleTimeString()}`, 40, 75);

    // Watermark
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('LiveKit WebRTC 2.28.2 (Virtual Stream)', canvas.width - 40, canvas.height - 30);

    animId = requestAnimationFrame(render);
  };

  render();

  try {
    const stream = canvas.captureStream(30);
    return stream;
  } catch {
    return null;
  }
}

export function createMockScreenStream(): MediaStream | null {
  if (typeof window === 'undefined' || !document.createElement) return null;

  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  let frame = 0;
  let animId: number;

  const render = () => {
    frame++;
    const t = frame * 0.02;

    // Mobile background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Status bar
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, 50);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('9:41', 30, 32);

    ctx.textAlign = 'right';
    ctx.fillText('5G  100%', canvas.width - 30, 32);

    // Android Screen Sharing Alert banner
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(0, 50, canvas.width, 44);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔴 Android MediaProjection: Sharing Screen with SecureLink Admin', canvas.width / 2, 78);

    // AptConnect App Header
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 94, canvas.width, 100);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('AptConnect Penthouse 14B', 30, 150);

    // Cards simulating app usage
    const cards = [
      { title: 'Digital Key Card', desc: 'Secure NFC Access • Tap against door handle', color: '#3b82f6', y: 220 },
      { title: 'HVAC Air Filter Alert', desc: 'Unit #14B filter replacement due in 3 days', color: '#f59e0b', y: 380 },
      { title: 'Package Locker Delivery', desc: 'Parcel #LK-8091 arrived at South Concierge', color: '#10b981', y: 540 },
      { title: 'Resident Support Session', desc: 'SecureLink Session #SL-8492 Active', color: '#8b5cf6', y: 700 }
    ];

    cards.forEach((c) => {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(30, c.y, canvas.width - 60, 130, 16);
      ctx.fill();

      // Left color pill
      ctx.fillStyle = c.color;
      ctx.fillRect(30, c.y, 8, 130);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(c.title, 55, c.y + 45);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.fillText(c.desc, 55, c.y + 80);
    });

    // Simulated touch finger ripple
    const touchX = canvas.width / 2 + Math.sin(t * 1.5) * 150;
    const touchY = 450 + Math.cos(t * 1.5) * 120;
    const rippleRadius = 20 + (frame % 30);

    ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
    ctx.beginPath();
    ctx.arc(touchX, touchY, rippleRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(touchX, touchY, 12, 0, Math.PI * 2);
    ctx.fill();

    animId = requestAnimationFrame(render);
  };

  render();

  try {
    const stream = canvas.captureStream(30);
    return stream;
  } catch {
    return null;
  }
}
