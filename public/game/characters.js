/* ============================================================
   BLOBBY — KARAKTER
   Data + render prosedural untuk semua karakter Blobby.
   Dimuat sebelum script utama (public/bloby.html).

   Kenapa dipisah:
   - Fase 2 (kostum tambahan, idle, trail) akan menambah banyak kode.
   - Bentuk karakter tidak perlu tercampur dengan logika room/race.
   - Semua tetap statis: tidak butuh API, database, atau aset eksternal.

   Kontrak publik:
   window.BlobbyCharacters = {
     list, get, has, draw, drawAvatar, resetCache
   }

   Catatan kompatibilitas:
   - id karakter lama (classic, ninja, astro, chef, detektif) TIDAK diubah.
   - field jaringan tetap bernama `skin` agar client lama tidak rusak.
   ============================================================ */
(function (global) {
  'use strict';

  const TAU = Math.PI * 2;

  /* ------------------------------------------------------------
     DATA KARAKTER
     Harga disusun naik supaya progresi koin terasa jelas.
     ------------------------------------------------------------ */
  const CHARACTERS = [
    {
      id: 'classic', name: 'Blobby', cost: 0,
      colors: ['#b3ecff', '#5b8cf7', '#3a4fd8'],
      shape: 'blob', accent: '#8ee3ff',
      tagline: 'Jelly klasik'
    },
    {
      id: 'ninja', name: 'Ninja', cost: 500,
      colors: ['#5a5a5a', '#2a2a2a', '#0a0a0a'],
      shape: 'blob', accent: '#ff6b6b',
      tagline: 'Langkah senyap'
    },
    {
      id: 'mochi', name: 'Mochi', cost: 800,
      colors: ['#ffe6ef', '#ffb7d0', '#d9799c'],
      shape: 'cat', accent: '#ff9ec4',
      tagline: 'Blob kucing'
    },
    {
      id: 'astro', name: 'Astronot', cost: 1000,
      colors: ['#FFF7E0', '#d0d8e0', '#8090a0'],
      shape: 'blob', accent: '#8ee3ff',
      tagline: 'Siap mengorbit'
    },
    {
      id: 'pudi', name: 'Pudi', cost: 1200,
      colors: ['#ffd9a0', '#d99a55', '#8a5a2b'],
      shape: 'potato', accent: '#ffcf7a',
      tagline: 'Kentang pemalu'
    },
    {
      id: 'chef', name: 'Chef', cost: 1500,
      colors: ['#FFF7E0', '#f0f0f0', '#d62828'],
      shape: 'blob', accent: '#ff6b6b',
      tagline: 'Jelly berbumbu'
    },
    {
      id: 'taro', name: 'Taro', cost: 1800,
      colors: ['#e6d8ff', '#b79cff', '#7a5bd6'],
      shape: 'bunny', accent: '#c9a7ff',
      tagline: 'Telinga lentur'
    },
    {
      id: 'detektif', name: 'Detektif', cost: 2000,
      colors: ['#d8b57a', '#8a5a2b', '#4a2e10'],
      shape: 'blob', accent: '#ffd02e',
      tagline: 'Jejak jelly'
    },
    {
      id: 'sprout', name: 'Sprout', cost: 2400,
      colors: ['#c9ffd8', '#5fe08a', '#1f9d55'],
      shape: 'sprout', accent: '#7df5a5',
      tagline: 'Tunas ceria'
    },
    {
      id: 'nori', name: 'Nori', cost: 2800,
      colors: ['#e8fff8', '#a8f0dd', '#4fb8a0'],
      shape: 'ghost', accent: '#a8ffd0',
      tagline: 'Hantu ramah'
    },
    {
      id: 'nova', name: 'Nova', cost: 3200,
      colors: ['#ffe6b0', '#ff9e3d', '#c2410c'],
      shape: 'star', accent: '#ffd02e',
      tagline: 'Bintang jatuh'
    }
  ];

  const byId = new Map(CHARACTERS.map(c => [c.id, c]));

  function get(id) {
    return byId.get(id) || CHARACTERS[0];
  }
  function has(id) {
    return byId.has(id);
  }

  /* ------------------------------------------------------------
     DETEKSI MOTION
     Idle/trail dimatikan kalau pengguna minta reduced motion.
     ------------------------------------------------------------ */
  let reduceMotion = false;
  try {
    reduceMotion = !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) {}

  /* ------------------------------------------------------------
     HELPER GEOMETRI
     ------------------------------------------------------------ */
  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function phaseOf(id) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
    return (h % 100) / 100 * TAU;
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  function bodyPath(ctx, shape, R) {
    ctx.beginPath();
    switch (shape) {
      case 'cat':
        ctx.ellipse(0, 0, R * 0.98, R * 1.03, 0, 0, TAU);
        break;
      case 'potato':
        ctx.moveTo(-R * 0.88, -R * 0.42);
        ctx.bezierCurveTo(-R * 1.04, -R * 1.02, -R * 0.48, -R * 1.12, -R * 0.08, -R * 1.00);
        ctx.bezierCurveTo(R * 0.34, -R * 1.12, R * 1.04, -R * 0.96, R * 0.96, -R * 0.36);
        ctx.bezierCurveTo(R * 0.98, R * 0.34, R * 0.62, R * 1.04, 0, R * 1.06);
        ctx.bezierCurveTo(-R * 0.62, R * 1.04, -R * 1.0, R * 0.34, -R * 0.88, -R * 0.42);
        ctx.closePath();
        break;
      case 'bunny':
        ctx.ellipse(0, R * 0.02, R * 0.94, R * 1.04, 0, 0, TAU);
        break;
      case 'ghost':
        ctx.moveTo(-R * 1.02, R * 0.42);
        ctx.bezierCurveTo(-R * 1.04, -R * 0.18, -R * 0.78, -R * 1.12, 0, -R * 1.12);
        ctx.bezierCurveTo(R * 0.78, -R * 1.12, R * 1.04, -R * 0.18, R * 1.02, R * 0.42);
        ctx.bezierCurveTo(R * 0.94, R * 0.78, R * 0.74, R * 1.16, R * 0.48, R * 1.02);
        ctx.bezierCurveTo(R * 0.24, R * 0.90, R * 0.16, R * 0.72, 0, R * 0.82);
        ctx.bezierCurveTo(-R * 0.16, R * 0.72, -R * 0.24, R * 0.90, -R * 0.48, R * 1.02);
        ctx.bezierCurveTo(-R * 0.74, R * 1.16, -R * 0.94, R * 0.78, -R * 1.02, R * 0.42);
        ctx.closePath();
        break;
      case 'star':
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + i * Math.PI / 5;
          const rad = (i % 2 === 0) ? R * 1.12 : R * 0.82;
          const px = Math.cos(a) * rad;
          const py = Math.sin(a) * rad;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        break;
      default:
        ctx.ellipse(0, 0, R, R * 1.06, 0, 0, TAU);
    }
  }

  function cap(ctx, x, y, w, h, angle, fill, innerFill) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle || 0);
    roundRectPath(ctx, -w / 2, -h / 2, w, h, w / 2);
    ctx.fillStyle = fill;
    ctx.fill();
    if (innerFill) {
      roundRectPath(ctx, -w * 0.24, -h * 0.34, w * 0.48, h * 0.58, w * 0.24);
      ctx.fillStyle = innerFill;
      ctx.fill();
    }
    ctx.restore();
  }

  /* ------------------------------------------------------------
     BAGIAN BELAKANG (telinga, ekor, pita)
     ------------------------------------------------------------ */
  function drawBack(ctx, sk, R, cols, time, phase, detail) {
    const t = time || 0;
    const sway = reduceMotion ? 0 : Math.sin(t * 2.2 + phase);

    if (sk.shape === 'cat') {
      // Ekor di belakang badan.
      ctx.save();
      ctx.strokeStyle = cols[2];
      ctx.lineWidth = R * 0.15;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(R * 0.78, R * 0.58);
      ctx.quadraticCurveTo(R * 1.18, R * 0.42, R * 1.08, R * 0.02);
      ctx.stroke();
      ctx.restore();

      // Dua telinga segitiga, sedikit miring.
      const ear = (sx, tilt) => {
        ctx.save();
        ctx.translate(sx, -R * 0.72);
        ctx.rotate(tilt + sway * 0.035);
        ctx.beginPath();
        ctx.moveTo(-R * 0.26, R * 0.22);
        ctx.quadraticCurveTo(-R * 0.16, -R * 0.38, 0, -R * 0.42);
        ctx.quadraticCurveTo(R * 0.18, -R * 0.36, R * 0.25, R * 0.20);
        ctx.closePath();
        ctx.fillStyle = cols[1];
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-R * 0.12, R * 0.12);
        ctx.quadraticCurveTo(-R * 0.06, -R * 0.20, 0, -R * 0.24);
        ctx.quadraticCurveTo(R * 0.08, -R * 0.18, R * 0.11, R * 0.12);
        ctx.closePath();
        ctx.fillStyle = sk.accent;
        ctx.globalAlpha = 0.55;
        ctx.fill();
        ctx.restore();
      };
      ear(-R * 0.48, -0.10);
      ear(R * 0.48, 0.10);
    }

    if (sk.shape === 'bunny') {
      // Telinga panjang; satu sedikit terlipat agar tidak simetris kaku.
      cap(ctx, -R * 0.42, -R * 0.80, R * 0.34, R * 0.78, -0.10 + sway * 0.025, cols[1], sk.accent);
      cap(ctx, R * 0.44, -R * 0.79, R * 0.34, R * 0.74, 0.16 + sway * 0.025, cols[1], sk.accent);
    }

    if (sk.id === 'ninja') {
      // Pita ikat kepala di belakang badan.
      ctx.save();
      ctx.translate(R * 0.78, -R * 0.42);
      ctx.rotate(-0.20 + sway * 0.04);
      ctx.fillStyle = sk.accent;
      roundRectPath(ctx, 0, 0, R * 0.52, R * 0.13, R * 0.065);
      ctx.fill();
      ctx.rotate(0.34);
      roundRectPath(ctx, 0, R * 0.12, R * 0.44, R * 0.11, R * 0.055);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ------------------------------------------------------------
     BADAN
     ------------------------------------------------------------ */
  function drawBody(ctx, sk, R, cols, detail, useShadow) {
    const shadow = detail
      ? { color: 'rgba(4,5,16,0.45)', blur: 14, oy: 4 }
      : { color: 'rgba(4,5,16,0.30)', blur: 6, oy: 2 };

    ctx.save();
    if (useShadow !== false) {
      ctx.shadowColor = shadow.color;
      ctx.shadowBlur = shadow.blur;
      ctx.shadowOffsetY = shadow.oy;
    }
    if (R >= 17) {
      const g = ctx.createRadialGradient(-R * 0.34, -R * 0.44, R * 0.12, 0, 0, R * 1.28);
      g.addColorStop(0, cols[0]);
      g.addColorStop(0.55, cols[1]);
      g.addColorStop(1, cols[2]);
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = cols[1];
    }
    bodyPath(ctx, sk.shape, R);
    ctx.fill();
    ctx.restore();

    // Garis tepi tipis untuk bentuk bintang agar poinnya tidak terlihat tajam.
    if (sk.shape === 'star') {
      ctx.save();
      bodyPath(ctx, sk.shape, R);
      ctx.strokeStyle = cols[2];
      ctx.lineWidth = Math.max(1, R * 0.055);
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    }

    if (detail) {
      // Kilau atas + bayangan bawah, dibatasi ke badan.
      ctx.save();
      bodyPath(ctx, sk.shape, R);
      ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.beginPath();
      ctx.ellipse(-R * 0.38, -R * 0.52, R * 0.54, R * 0.24, -0.42, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.10)';
      ctx.beginPath();
      ctx.ellipse(0, R * 0.82, R * 0.78, R * 0.22, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    if (sk.shape === 'potato') {
      // Bintik kentang.
      ctx.save();
      bodyPath(ctx, sk.shape, R);
      ctx.clip();
      ctx.fillStyle = 'rgba(90,50,20,0.22)';
      [[-0.42, 0.30, 0.055], [0.36, 0.42, 0.045], [0.10, 0.64, 0.035], [-0.52, -0.08, 0.03]]
        .forEach(([x, y, r]) => {
          ctx.beginPath();
          ctx.arc(x * R, y * R, r * R, 0, TAU);
          ctx.fill();
        });
      ctx.restore();
    }

    if (sk.shape === 'sprout') {
      // Bintik pipi hijau muda.
      ctx.save();
      bodyPath(ctx, sk.shape, R);
      ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      [[-0.56, 0.24, 0.045], [0.54, 0.30, 0.04]].forEach(([x, y, r]) => {
        ctx.beginPath();
        ctx.arc(x * R, y * R, r * R, 0, TAU);
        ctx.fill();
      });
      ctx.restore();
    }
  }

  function drawFeet(ctx, sk, R, cols, detail) {
    if (!detail) return;
    if (sk.shape === 'ghost') return;
    ctx.fillStyle = cols[2];
    const footY = R * 1.0;
    ctx.beginPath();
    ctx.ellipse(-R * 0.45, footY, R * 0.28, R * 0.16, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(R * 0.45, footY, R * 0.28, R * 0.16, 0, 0, TAU);
    ctx.fill();
  }

  /* ------------------------------------------------------------
     BAGIAN DEPAN (kostum & aksesori)
     ------------------------------------------------------------ */
  function drawFront(ctx, sk, R, cols, time, phase, detail) {
    const t = time || 0;
    const sway = reduceMotion ? 0 : Math.sin(t * 2.0 + phase);

    if (sk.id === 'ninja') {
      // Ikat kepala.
      ctx.save();
      roundRectPath(ctx, -R * 0.94, -R * 0.54, R * 1.88, R * 0.24, R * 0.12);
      ctx.fillStyle = sk.accent;
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.20)';
      roundRectPath(ctx, -R * 0.88, -R * 0.51, R * 1.50, R * 0.06, R * 0.03);
      ctx.fill();
      // Simpul kecil di kanan.
      ctx.fillStyle = sk.accent;
      ctx.beginPath();
      ctx.arc(R * 0.92, -R * 0.42, R * 0.13, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    if (sk.id === 'astro') {
      // Helm kaca + antena.
      ctx.save();
      ctx.fillStyle = 'rgba(180,230,255,0.10)';
      ctx.strokeStyle = 'rgba(210,245,255,0.75)';
      ctx.lineWidth = Math.max(1, R * 0.055);
      ctx.beginPath();
      ctx.ellipse(0, -R * 0.10, R * 1.02, R * 1.04, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = Math.max(1, R * 0.035);
      ctx.beginPath();
      ctx.arc(0, -R * 0.10, R * 0.86, Math.PI * 1.08, Math.PI * 1.34);
      ctx.stroke();
      // Antena.
      ctx.strokeStyle = 'rgba(210,245,255,0.8)';
      ctx.lineWidth = Math.max(1, R * 0.045);
      ctx.beginPath();
      ctx.moveTo(R * 0.34, -R * 0.98);
      ctx.lineTo(R * 0.40, -R * 1.20);
      ctx.stroke();
      ctx.fillStyle = '#8ee3ff';
      ctx.shadowColor = '#8ee3ff';
      ctx.shadowBlur = detail ? R * 0.22 : 0;
      ctx.beginPath();
      ctx.arc(R * 0.41, -R * 1.22, R * 0.075, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    if (sk.id === 'chef') {
      // Topi chef: tiga puff + band.
      ctx.save();
      ctx.fillStyle = '#FFF7E0';
      ctx.beginPath();
      ctx.arc(-R * 0.38, -R * 0.92, R * 0.30, 0, TAU);
      ctx.arc(0, -R * 1.02, R * 0.36, 0, TAU);
      ctx.arc(R * 0.40, -R * 0.92, R * 0.29, 0, TAU);
      ctx.fill();
      roundRectPath(ctx, -R * 0.68, -R * 0.88, R * 1.36, R * 0.28, R * 0.12);
      ctx.fill();
      ctx.fillStyle = sk.colors[2];
      roundRectPath(ctx, -R * 0.66, -R * 0.66, R * 1.32, R * 0.11, R * 0.055);
      ctx.fill();
      ctx.restore();
    }

    if (sk.id === 'detektif') {
      // Topi fedora.
      ctx.save();
      ctx.fillStyle = cols[2];
      ctx.beginPath();
      ctx.ellipse(0, -R * 0.60, R * 1.08, R * 0.20, 0, 0, TAU);
      ctx.fill();
      roundRectPath(ctx, -R * 0.56, -R * 1.02, R * 1.12, R * 0.44, R * 0.18);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      roundRectPath(ctx, -R * 0.50, -R * 0.96, R * 0.98, R * 0.09, R * 0.045);
      ctx.fill();
      ctx.fillStyle = sk.accent;
      roundRectPath(ctx, -R * 0.54, -R * 0.70, R * 1.08, R * 0.10, R * 0.05);
      ctx.fill();
      ctx.restore();
    }

    if (sk.shape === 'sprout') {
      // Batang + dua daun yang bergoyang.
      ctx.save();
      ctx.strokeStyle = '#1f9d55';
      ctx.lineWidth = Math.max(1, R * 0.085);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -R * 0.96);
      ctx.quadraticCurveTo(-R * 0.04, -R * 1.16, R * 0.02, -R * 1.28);
      ctx.stroke();
      const leaf = (sx, sy, angle, scale) => {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(angle + sway * 0.08);
        ctx.fillStyle = '#7df5a5';
        ctx.beginPath();
        ctx.ellipse(0, 0, R * 0.28 * scale, R * 0.15 * scale, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.beginPath();
        ctx.ellipse(-R * 0.06 * scale, -R * 0.04 * scale, R * 0.11 * scale, R * 0.05 * scale, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
      };
      leaf(-R * 0.22, -R * 1.18, -0.45, 1);
      leaf(R * 0.24, -R * 1.24, 0.45, 0.85);
      ctx.restore();
    }

    if (sk.shape === 'star') {
      // Antena bintang.
      ctx.save();
      ctx.strokeStyle = '#ffd02e';
      ctx.lineWidth = Math.max(1, R * 0.06);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -R * 0.88);
      ctx.lineTo(0, -R * 1.22);
      ctx.stroke();
      drawSparkle(ctx, 0, -R * 1.30, R * 0.16, '#FFF7E0', detail ? R * 0.3 : 0, t);
      ctx.restore();
    }

    if (sk.id === 'pudi') {
      // Jambul kecil.
      ctx.save();
      ctx.strokeStyle = cols[2];
      ctx.lineWidth = Math.max(1, R * 0.05);
      ctx.lineCap = 'round';
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * R * 0.12, -R * 0.94);
        ctx.quadraticCurveTo(i * R * 0.18 + sway * R * 0.03, -R * 1.10, i * R * 0.24, -R * 1.04);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (sk.shape === 'ghost') {
      // Tangan mungil.
      ctx.save();
      ctx.fillStyle = cols[1];
      ctx.beginPath();
      ctx.ellipse(-R * 0.98, R * 0.10, R * 0.20, R * 0.12, -0.25, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(R * 0.98, R * 0.10, R * 0.20, R * 0.12, 0.25, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ------------------------------------------------------------
     WAJAH
     ------------------------------------------------------------ */
  function drawFace(ctx, sk, R, cols, vx, moveSpeed, detail, time, gaze) {
    const eyeY = (sk.shape === 'ghost' || sk.shape === 'star') ? -R * 0.18 : -R * 0.16;
    const eyeDX = R * 0.37;
    const eyeR = R * 0.29;
    const pupilR = R * 0.15;
    // gaze = arah platform pendaratan (dinormalisasi). Tanpa gaze, mata
    // kembali mengikuti arah gerak horizontal seperti sebelumnya.
    const gazeX = gaze ? clamp(gaze.x, -1, 1) : clamp((vx || 0) / (moveSpeed || 440), -1, 1);
    const gazeY = gaze ? clamp(gaze.y, -1, 1) : 0;
    const lookX = gazeX * R * 0.09;
    const lookY = gazeY * R * 0.07;

    // Kedip sesekali. Fase per karakter supaya tidak kompak berkedip bersama.
    const blinkCycle = ((time || 0) + phaseOf(sk.id)) % 4.3;
    const blinking = detail && !reduceMotion && blinkCycle < 0.12;

    if (blinking) {
      ctx.strokeStyle = '#10142A';
      ctx.lineWidth = Math.max(1.2, R * 0.07);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(-eyeDX, eyeY, eyeR * 0.82, 0.14 * Math.PI, 0.86 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(eyeDX, eyeY, eyeR * 0.82, 0.14 * Math.PI, 0.86 * Math.PI);
      ctx.stroke();
    } else {
      // Putih mata.
      ctx.fillStyle = '#FFF7E0';
      ctx.beginPath();
      ctx.arc(-eyeDX, eyeY, eyeR, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeDX, eyeY, eyeR, 0, TAU);
      ctx.fill();

      // Pupil.
      ctx.fillStyle = '#10142A';
      ctx.beginPath();
      ctx.arc(-eyeDX + lookX, eyeY + R * 0.04 + lookY, pupilR, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeDX + lookX, eyeY + R * 0.04 + lookY, pupilR, 0, TAU);
      ctx.fill();

      // Kilau mata.
      ctx.fillStyle = 'rgba(255,247,224,0.95)';
      ctx.beginPath();
      ctx.arc(-eyeDX + lookX - R * 0.05, eyeY + lookY - R * 0.02, R * 0.052, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(eyeDX + lookX - R * 0.05, eyeY + lookY - R * 0.02, R * 0.052, 0, TAU);
      ctx.fill();

      // Sparkle khusus Nova.
      if (sk.shape === 'star' && detail) {
        drawSparkle(ctx, -eyeDX + lookX + R * 0.02, eyeY + lookY + R * 0.02, R * 0.055, '#FFD02E', 0, time || 0);
        drawSparkle(ctx, eyeDX + lookX + R * 0.02, eyeY + lookY + R * 0.02, R * 0.055, '#FFD02E', 0, time || 0);
      }
    }

    // Pipi.
    if (detail) {
      ctx.fillStyle = 'rgba(255,110,140,0.34)';
      ctx.beginPath();
      ctx.ellipse(-R * 0.64, R * 0.24, R * 0.19, R * 0.12, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(R * 0.64, R * 0.24, R * 0.19, R * 0.12, 0, 0, TAU);
      ctx.fill();
    }

    // Mulut.
    ctx.strokeStyle = '#10142A';
    ctx.lineWidth = Math.max(1.4, R * 0.07);
    ctx.lineCap = 'round';

    if (sk.shape === 'cat') {
      // Hidung + mulut kucing.
      ctx.fillStyle = sk.accent;
      ctx.beginPath();
      ctx.moveTo(0, R * 0.20);
      ctx.lineTo(-R * 0.08, R * 0.13);
      ctx.lineTo(R * 0.08, R * 0.13);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-R * 0.08, R * 0.28, R * 0.13, 0.05 * Math.PI, 0.95 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(R * 0.08, R * 0.28, R * 0.13, 0.05 * Math.PI, 0.95 * Math.PI);
      ctx.stroke();
      if (detail) {
        ctx.strokeStyle = 'rgba(16,20,42,0.50)';
        ctx.lineWidth = Math.max(1, R * 0.035);
        [-1, 1].forEach(s => {
          ctx.beginPath();
          ctx.moveTo(s * R * 0.46, R * 0.20);
          ctx.quadraticCurveTo(s * R * 0.72, R * 0.14, s * R * 0.86, R * 0.20);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(s * R * 0.48, R * 0.30);
          ctx.quadraticCurveTo(s * R * 0.72, R * 0.28, s * R * 0.84, R * 0.34);
          ctx.stroke();
        });
      }
    } else if (sk.shape === 'bunny') {
      ctx.beginPath();
      ctx.arc(0, R * 0.26, R * 0.26, 0.16 * Math.PI, 0.84 * Math.PI);
      ctx.stroke();
      if (detail) {
        ctx.fillStyle = '#FFF7E0';
        roundRectPath(ctx, -R * 0.12, R * 0.36, R * 0.11, R * 0.14, R * 0.03);
        ctx.fill();
        roundRectPath(ctx, R * 0.01, R * 0.36, R * 0.11, R * 0.14, R * 0.03);
        ctx.fill();
        ctx.strokeStyle = 'rgba(16,20,42,0.45)';
        ctx.lineWidth = Math.max(1, R * 0.025);
        ctx.beginPath();
        ctx.moveTo(0, R * 0.36);
        ctx.lineTo(0, R * 0.50);
        ctx.stroke();
      }
    } else if (sk.shape === 'ghost') {
      ctx.fillStyle = '#10142A';
      ctx.beginPath();
      ctx.ellipse(0, R * 0.32, R * 0.10, R * 0.14, 0, 0, TAU);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, R * 0.28, R * 0.30, 0.16 * Math.PI, 0.84 * Math.PI);
      ctx.stroke();
    }
  }

  function drawSparkle(ctx, x, y, r, color, glow, time) {
    const pulse = reduceMotion ? 1 : 0.78 + Math.sin((time || 0) * 3.2 + x * 0.05) * 0.22;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    if (glow) {
      ctx.shadowColor = color;
      ctx.shadowBlur = glow;
    }
    ctx.beginPath();
    ctx.moveTo(0, -r * pulse);
    ctx.quadraticCurveTo(r * 0.18, -r * 0.18, r * pulse, 0);
    ctx.quadraticCurveTo(r * 0.18, r * 0.18, 0, r * pulse);
    ctx.quadraticCurveTo(-r * 0.18, r * 0.18, -r * pulse, 0);
    ctx.quadraticCurveTo(-r * 0.18, -r * 0.18, 0, -r * pulse);
    ctx.fill();
    ctx.restore();
  }

  /* ------------------------------------------------------------
     MODE POWER-UP (Iron Man)
     Sengaja tetap memakai badan telur klasik: ini sinyal gameplay
     yang harus langsung dikenali, bukan saatnya menampilkan kostum.
     ------------------------------------------------------------ */
  function drawPowered(ctx, R, o) {
    const now = o.time || 0;
    const t = now * 0.006;

    // Aura magnet.
    ctx.save();
    ctx.rotate(t);
    ctx.strokeStyle = 'rgba(74,222,128,0.8)';
    ctx.lineWidth = 3;
    ctx.setLineDash([9, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, R * 1.6, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    ctx.save();
    const ag = ctx.createRadialGradient(0, 0, R * 0.7, 0, 0, R * 2.0);
    ag.addColorStop(0, 'rgba(255,208,46,0.45)');
    ag.addColorStop(1, 'rgba(255,208,46,0)');
    ctx.fillStyle = ag;
    ctx.beginPath();
    ctx.arc(0, 0, R * 2.0, 0, TAU);
    ctx.fill();
    ctx.restore();

    for (let i = 0; i < 6; i++) {
      const a = t * 2 + i * 1.047;
      const dist = R * 1.25 + Math.sin(t * 5 + i * 1.3) * 3;
      const alpha = 0.4 + Math.sin(t * 6 + i) * 0.4;
      ctx.fillStyle = 'rgba(255,226,122,' + alpha.toFixed(2) + ')';
      ctx.beginPath();
      ctx.arc(Math.cos(a) * dist, Math.sin(a) * dist, 1.6, 0, TAU);
      ctx.fill();
    }

    // Badan armor.
    ctx.save();
    ctx.shadowColor = '#FF4D4D';
    ctx.shadowBlur = 30;
    const g = ctx.createRadialGradient(-R * 0.34, -R * 0.44, R * 0.12, 0, 0, R * 1.28);
    g.addColorStop(0, '#ff8080');
    g.addColorStop(0.45, '#e01e1e');
    g.addColorStop(0.85, '#a01010');
    g.addColorStop(1, '#5a0808');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, R, R * 1.06, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Detail armor.
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, R, R * 1.06, 0, 0, TAU);
    ctx.clip();

    ctx.fillStyle = '#f5c518';
    ctx.beginPath();
    ctx.moveTo(-R * 0.9, -R * 0.75);
    ctx.lineTo(-R * 0.5, -R * 0.95);
    ctx.lineTo(R * 0.5, -R * 0.95);
    ctx.lineTo(R * 0.9, -R * 0.75);
    ctx.lineTo(R * 0.7, -R * 0.58);
    ctx.lineTo(-R * 0.7, -R * 0.58);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.moveTo(-R * 0.85, -R * 0.82);
    ctx.lineTo(-R * 0.55, -R * 0.90);
    ctx.lineTo(-R * 0.50, -R * 0.70);
    ctx.lineTo(-R * 0.75, -R * 0.66);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f5c518';
    ctx.beginPath();
    ctx.moveTo(-R * 0.98, -R * 0.15);
    ctx.lineTo(-R * 0.85, -R * 0.45);
    ctx.lineTo(-R * 0.65, -R * 0.30);
    ctx.lineTo(-R * 0.78, 0);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(R * 0.98, -R * 0.15);
    ctx.lineTo(R * 0.85, -R * 0.45);
    ctx.lineTo(R * 0.65, -R * 0.30);
    ctx.lineTo(R * 0.78, 0);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-R * 0.55, R * 0.55);
    ctx.lineTo(0, R * 0.80);
    ctx.lineTo(R * 0.55, R * 0.55);
    ctx.lineTo(R * 0.42, R * 0.45);
    ctx.lineTo(0, R * 0.66);
    ctx.lineTo(-R * 0.42, R * 0.45);
    ctx.closePath();
    ctx.fill();

    const reactorY = R * 0.20;
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(0, reactorY, R * 0.22, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, reactorY, R * 0.22, 0, TAU);
    ctx.stroke();

    const rg = ctx.createRadialGradient(0, reactorY, 0, 0, reactorY, R * 0.19);
    rg.addColorStop(0, '#FFF7E0');
    rg.addColorStop(0.35, '#c9f0ff');
    rg.addColorStop(0.7, '#8ee3ff');
    rg.addColorStop(1, '#00a8ff');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(0, reactorY, R * 0.19, 0, TAU);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.shadowColor = '#8ee3ff';
    ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(200,240,255,0.85)';
    ctx.beginPath();
    ctx.arc(0, R * 0.20, R * 0.09, 0, TAU);
    ctx.fill();
    ctx.restore();

    // Kaki.
    ctx.fillStyle = '#5a0808';
    ctx.beginPath();
    ctx.ellipse(-R * 0.45, R * 1.0, R * 0.28, R * 0.16, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(R * 0.45, R * 1.0, R * 0.28, R * 0.16, 0, 0, TAU);
    ctx.fill();

    // Thruster.
    const flicker = 0.85 + Math.sin(now * 0.02) * 0.15;
    for (let k = -1; k <= 1; k += 2) {
      const fx = k * R * 0.35;
      const fy = R * 1.05;
      const flameH = R * 0.85 * flicker * (0.9 + Math.random() * 0.2);

      const og = ctx.createLinearGradient(fx, fy, fx, fy + flameH);
      og.addColorStop(0, 'rgba(255,180,60,0.95)');
      og.addColorStop(0.4, 'rgba(255,110,20,0.75)');
      og.addColorStop(1, 'rgba(255,80,20,0)');
      ctx.fillStyle = og;
      ctx.beginPath();
      ctx.moveTo(fx - R * 0.16, fy);
      ctx.quadraticCurveTo(fx - R * 0.10, fy + flameH * 0.8, fx, fy + flameH);
      ctx.quadraticCurveTo(fx + R * 0.10, fy + flameH * 0.8, fx + R * 0.16, fy);
      ctx.closePath();
      ctx.fill();

      const ig = ctx.createLinearGradient(fx, fy, fx, fy + flameH * 0.7);
      ig.addColorStop(0, 'rgba(255,255,255,1)');
      ig.addColorStop(0.4, 'rgba(180,230,255,0.9)');
      ig.addColorStop(1, 'rgba(100,180,255,0)');
      ctx.fillStyle = ig;
      ctx.beginPath();
      ctx.moveTo(fx - R * 0.09, fy);
      ctx.quadraticCurveTo(fx - R * 0.05, fy + flameH * 0.5, fx, fy + flameH * 0.65);
      ctx.quadraticCurveTo(fx + R * 0.05, fy + flameH * 0.5, fx + R * 0.09, fy);
      ctx.closePath();
      ctx.fill();
    }

    // Mata.
    const eyeY = -R * 0.16, eyeDX = R * 0.37;
    // Armor juga mengikuti arah platform pendaratan (mode 17 koin).
    const gazeX = o.gaze ? clamp(o.gaze.x, -1, 1) : clamp((o.vx || 0) / (o.moveSpeed || 440), -1, 1);
    const gazeY = o.gaze ? clamp(o.gaze.y, -1, 1) : 0;
    const lookX = gazeX * R * 0.09;
    const lookY = gazeY * R * 0.07;
    ctx.save();
    ctx.shadowColor = '#8ee3ff';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#e8f8ff';
    ctx.beginPath();
    ctx.arc(-eyeDX, eyeY, R * 0.31, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeDX, eyeY, R * 0.31, 0, TAU);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#1a3a5a';
    ctx.beginPath();
    ctx.arc(-eyeDX + lookX, eyeY + R * 0.04 + lookY, R * 0.15, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeDX + lookX, eyeY + R * 0.04 + lookY, R * 0.15, 0, TAU);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.beginPath();
    ctx.arc(-eyeDX + lookX - R * 0.05, eyeY + lookY - R * 0.03, R * 0.06, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeDX + lookX - R * 0.05, eyeY + lookY - R * 0.03, R * 0.06, 0, TAU);
    ctx.fill();
  }

  /* ------------------------------------------------------------
     API RENDER
     ------------------------------------------------------------ */
  function draw(ctx, opts) {
    const o = opts || {};
    const sk = get(o.skinId);
    const R = Math.max(1, (o.size || 46) / 2);
    const detail = o.detail !== false && R >= 11;
    const time = (o.time || 0) / 1000;
    const phase = phaseOf(sk.id);
    const idle = o.idle ? 1 : 0;
    const bob = idle && !reduceMotion ? Math.sin(time * 2.2 + phase) * R * 0.035 : 0;

    ctx.save();
    if (o.opacity != null) ctx.globalAlpha = o.opacity;
    ctx.translate(o.x || 0, (o.y || 0) + bob);
    if (o.squash) ctx.scale(1 / (o.squash || 1), o.squash || 1);

    if (o.powered) {
      drawPowered(ctx, R, Object.assign({}, o, { time: (o.time || 0) }));
      ctx.restore();
      return;
    }

    drawBack(ctx, sk, R, sk.colors, time, phase, detail);
    drawBody(ctx, sk, R, sk.colors, detail, o.shadow);
    drawFeet(ctx, sk, R, sk.colors, detail);
    drawFront(ctx, sk, R, sk.colors, time, phase, detail);
    drawFace(ctx, sk, R, sk.colors, o.vx || 0, o.moveSpeed || 440, detail, time, o.gaze);

    if (sk.shape === 'star' && detail) {
      // Debu bintang di sekitar Nova.
      const tw = reduceMotion ? 0 : Math.sin(time * 2.4 + phase) * R * 0.05;
      drawSparkle(ctx, -R * 0.92, -R * 0.70 + tw, R * 0.075, 'rgba(255,226,122,0.9)', 0, time);
      drawSparkle(ctx, R * 0.92, -R * 0.34 - tw, R * 0.055, 'rgba(255,247,224,0.8)', 0, time);
    }

    ctx.restore();
  }

  function drawAvatar(ctx, opts) {
    const o = opts || {};
    draw(ctx, Object.assign({}, o, {
      powered: false,
      squash: 1,
      vx: 0,
      idle: o.idle !== false,
      detail: o.detail != null ? o.detail : ((o.size || 22) >= 26),
      shadow: false
    }));
  }

  function resetCache() {
    // Tempat cache avatar fase 2. Saat ini belum ada cache berat.
  }

  global.BlobbyCharacters = {
    list: CHARACTERS,
    get,
    has,
    draw,
    drawAvatar,
    resetCache,
    reduceMotion
  };
})(window);
