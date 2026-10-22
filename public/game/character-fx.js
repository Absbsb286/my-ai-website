/* ============================================================
   BLOBBY — CHARACTER FX (FASE 2)
   Trail khas per karakter + burst saat mendarat / lompat ganda.

   File ini terpisah dari characters.js supaya:
   - characters.js tetap fokus ke data + bentuk + idle;
   - efek partikel bisa tumbuh tanpa menyentuh logika race;
   - file utama public/bloby.html tidak makin gemuk.

   Kontrak publik:
   window.BlobbyCharacterFX = {
     update(dt, entries), draw(ctx, camY),
     burst(x, y, skinId, count), reset(), setEnabled(bool)
   }

   Catatan performa:
   - Partikel dibatasi 180.
   - Emisi berbasis jarak (bukan tiap frame), jadi kecepatan frame tidak
     mengubah kepadatan trail.
   - Reduced motion mematikan trail otomatis.
   ============================================================ */
(function (global) {
  'use strict';

  const TAU = Math.PI * 2;

  let reduceMotion = false;
  try {
    reduceMotion = !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) {}

  const CONFIGS = {
    classic: {
      shape: 'bubble', colors: ['#b3ecff', '#5b8cf7', '#8ee3ff'],
      spacing: 16, size: [2.2, 4.8], life: [0.35, 0.65],
      gravity: -28, drag: 1.3, alpha: 0.82
    },
    ninja: {
      shape: 'puff', colors: ['#2a2a2a', '#5a5a5a'],
      spacing: 18, size: [2.5, 5.5], life: [0.30, 0.55],
      gravity: -18, drag: 2.2, alpha: 0.55
    },
    mochi: {
      shape: 'heart', colors: ['#ffb7d0', '#ffe6ef', '#ff9ec4'],
      spacing: 18, size: [2.0, 4.0], life: [0.40, 0.70],
      gravity: -14, drag: 1.2, alpha: 0.9
    },
    astro: {
      shape: 'spark', colors: ['#8ee3ff', '#FFF7E0'],
      spacing: 16, size: [1.8, 4.0], life: [0.30, 0.60],
      gravity: 18, drag: 1.6, alpha: 0.88
    },
    pudi: {
      shape: 'dust', colors: ['#ffd9a0', '#d99a55', '#ffcf7a'],
      spacing: 15, size: [2.0, 4.5], life: [0.35, 0.60],
      gravity: 170, drag: 2.3, alpha: 0.72
    },
    chef: {
      shape: 'puff', colors: ['#FFF7E0', '#f0f0f0'],
      spacing: 18, size: [2.5, 5.0], life: [0.35, 0.60],
      gravity: -32, drag: 2.0, alpha: 0.55
    },
    taro: {
      shape: 'star', colors: ['#b79cff', '#e6d8ff'],
      spacing: 17, size: [2.0, 4.0], life: [0.35, 0.65],
      gravity: 18, drag: 1.4, alpha: 0.84
    },
    detektif: {
      shape: 'dust', colors: ['#d8b57a', '#ffd02e'],
      spacing: 16, size: [1.8, 4.0], life: [0.30, 0.55],
      gravity: 150, drag: 2.2, alpha: 0.76
    },
    sprout: {
      shape: 'leaf', colors: ['#5fe08a', '#7df5a5'],
      spacing: 15, size: [2.5, 5.0], life: [0.45, 0.80],
      gravity: 80, drag: 1.5, alpha: 0.9
    },
    nori: {
      shape: 'wisp', colors: ['#a8f0dd', '#e8fff8'],
      spacing: 16, size: [2.5, 5.0], life: [0.45, 0.75],
      gravity: -42, drag: 1.4, alpha: 0.62
    },
    nova: {
      shape: 'star', colors: ['#ff9e3d', '#ffd02e', '#FFF7E0'],
      spacing: 14, size: [2.0, 4.5], life: [0.35, 0.70],
      gravity: 12, drag: 1.2, alpha: 0.9
    }
  };

  const POWERED = {
    shape: 'spark', colors: ['#FFE27A', '#FFD02E', '#FFF7E0'],
    spacing: 12, size: [2.0, 4.5], life: [0.35, 0.65],
    gravity: -8, drag: 1.2, alpha: 0.95
  };

  const particles = [];
  const tracks = new Map();
  let enabled = true;

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function cfgFor(id) {
    return CONFIGS[id] || CONFIGS.classic;
  }

  function pushParticle(p) {
    particles.push(p);
    if (particles.length > 180) particles.splice(0, particles.length - 180);
  }

  function emitTrail(entry, cfg, dx, dy) {
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    const base = Math.atan2(dy, dx) + Math.PI + rand(-0.7, 0.7);
    const speed = rand(8, 58);
    const size = rand(cfg.size[0], cfg.size[1]);
    const life = rand(cfg.life[0], cfg.life[1]);
    const color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
    const foot = (entry.size || 46) * 0.26;

    pushParticle({
      x: entry.x - nx * 8 + rand(-4, 4),
      y: entry.y - ny * 8 + foot + rand(-3, 3),
      vx: Math.cos(base) * speed,
      vy: Math.sin(base) * speed + rand(-12, 12),
      gravity: cfg.gravity,
      drag: cfg.drag,
      life,
      max: life,
      size,
      color,
      shape: cfg.shape,
      alpha: cfg.alpha,
      rot: rand(0, TAU),
      spin: rand(-3.2, 3.2)
    });
  }

  function update(dt, entries) {
    if (!enabled || reduceMotion) {
      if (particles.length) particles.length = 0;
      if (tracks.size) tracks.clear();
      return;
    }
    if (!dt || dt <= 0) return;
    if (dt > 0.05) dt = 0.05;

    const seen = new Set();
    const list = Array.isArray(entries) ? entries : [];

    for (const e of list) {
      if (!e || !e.id) continue;
      seen.add(e.id);
      const cfg = e.powered ? POWERED : cfgFor(e.skin);

      let tr = tracks.get(e.id);
      if (!tr) {
        tracks.set(e.id, { x: e.x, y: e.y, acc: 0 });
        continue;
      }

      const dx = e.x - tr.x;
      const dy = e.y - tr.y;
      const dist = Math.hypot(dx, dy);

      // Teleport / respawn / ganti scene: jangan menyemprotkan trail panjang.
      if (dist > 180) {
        tr.x = e.x; tr.y = e.y; tr.acc = 0;
        continue;
      }

      if (e.enabled && dist > 0.45) {
        tr.acc += dist;
        let budget = 4;
        while (tr.acc >= cfg.spacing && budget-- > 0) {
          tr.acc -= cfg.spacing;
          emitTrail(e, cfg, dx, dy);
        }
        // Kalau frame sempat tersendat, jangan menumpuk utang partikel.
        if (tr.acc > cfg.spacing * 4) tr.acc = 0;
      } else if (!e.enabled) {
        tr.acc = 0;
      }

      tr.x = e.x;
      tr.y = e.y;
    }

    for (const id of Array.from(tracks.keys())) {
      if (!seen.has(id)) tracks.delete(id);
    }

    for (const p of particles) {
      p.life -= dt;
      p.vx *= Math.max(0, 1 - p.drag * dt);
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.spin * dt;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].life <= 0) particles.splice(i, 1);
    }
  }

  function burst(x, y, skinId, count) {
    if (!enabled || reduceMotion) return;
    const cfg = cfgFor(skinId);
    const n = Math.max(1, count || 8);
    for (let i = 0; i < n; i++) {
      const a = rand(-Math.PI, 0);
      const speed = rand(45, 205);
      const life = rand(0.35, 0.72);
      const size = rand(cfg.size[0], cfg.size[1] + 1.2);
      pushParticle({
        x: x + rand(-8, 8),
        y: y - 3,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - rand(10, 55),
        gravity: 470,
        drag: 1.0,
        life,
        max: life,
        size,
        color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
        shape: cfg.shape,
        alpha: cfg.alpha,
        rot: rand(0, TAU),
        spin: rand(-4.5, 4.5)
      });
    }
  }

  function drawShape(ctx, p) {
    const s = p.size;
    switch (p.shape) {
      case 'bubble':
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(0, 0, s, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = Math.max(0.6, s * 0.22);
        ctx.beginPath(); ctx.arc(-s * 0.24, -s * 0.24, s * 0.38, 0, TAU); ctx.stroke();
        break;

      case 'puff':
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(0, 0, s, 0, TAU); ctx.fill();
        ctx.globalAlpha *= 0.55;
        ctx.beginPath(); ctx.arc(s * 0.55, -s * 0.25, s * 0.72, 0, TAU); ctx.fill();
        break;

      case 'heart':
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.85);
        ctx.bezierCurveTo(-s * 1.25, s * 0.10, -s * 0.68, -s * 0.95, 0, -s * 0.28);
        ctx.bezierCurveTo(s * 0.68, -s * 0.95, s * 1.25, s * 0.10, 0, s * 0.85);
        ctx.fill();
        break;

      case 'spark':
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.25);
        ctx.quadraticCurveTo(s * 0.18, -s * 0.18, s * 1.25, 0);
        ctx.quadraticCurveTo(s * 0.18, s * 0.18, 0, s * 1.25);
        ctx.quadraticCurveTo(-s * 0.18, s * 0.18, -s * 1.25, 0);
        ctx.quadraticCurveTo(-s * 0.18, -s * 0.18, 0, -s * 1.25);
        ctx.fill();
        break;

      case 'star':
        ctx.fillStyle = p.color;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + i * Math.PI / 5;
          const r = i % 2 === 0 ? s * 1.18 : s * 0.50;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill();
        break;

      case 'leaf':
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(-s, 0);
        ctx.quadraticCurveTo(0, -s * 0.95, s, 0);
        ctx.quadraticCurveTo(0, s * 0.95, -s, 0);
        ctx.fill();
        ctx.strokeStyle = 'rgba(12,50,30,0.35)';
        ctx.lineWidth = Math.max(0.5, s * 0.12);
        ctx.beginPath(); ctx.moveTo(-s * 0.65, 0); ctx.lineTo(s * 0.65, 0); ctx.stroke();
        break;

      case 'wisp':
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.35);
        ctx.bezierCurveTo(s * 0.95, -s * 0.20, s * 0.70, s * 0.95, 0, s);
        ctx.bezierCurveTo(-s * 0.70, s * 0.95, -s * 0.95, -s * 0.20, 0, -s * 1.35);
        ctx.fill();
        break;

      default:
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(0, 0, s, 0, TAU); ctx.fill();
    }
  }

  function draw(ctx, camY) {
    if (!particles.length) return;
    const cam = camY || 0;
    for (const p of particles) {
      const y = p.y - cam;
      if (y < -70 || y > 780) continue;
      const a = Math.max(0, Math.min(1, p.life / p.max)) * p.alpha;
      if (a <= 0.01) continue;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(p.x, y);
      ctx.rotate(p.rot);
      drawShape(ctx, p);
      ctx.restore();
    }
  }

  function reset() {
    particles.length = 0;
    tracks.clear();
  }

  function setEnabled(v) {
    enabled = !!v;
    if (!enabled) reset();
  }

  global.BlobbyCharacterFX = {
    update,
    draw,
    burst,
    reset,
    setEnabled,
    get count() { return particles.length; },
    reduceMotion
  };
})(window);
