(() => {
  'use strict';

  const cv = document.getElementById('sky');
  const ctx = cv.getContext('2d');
  const stage = document.getElementById('stage');
  const title = document.querySelector('.title');
  const replay = document.getElementById('replay');

  /* ---------- Titre lettre par lettre ---------- */
  let n = 0;
  'Instant|Météo'.split('|').forEach((word, wi) => {
    const w = document.createElement('span');
    w.className = 'w' + (wi ? ' accent' : '');
    [...word].forEach(ch => {
      const s = document.createElement('span');
      s.className = 'l'; s.textContent = ch; s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', n++);
      w.appendChild(s);
    });
    title.appendChild(w);
  });

  /* ---------- Outils ---------- */
  function rng(a) { return () => { let t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- Sprites de nuages (bleu nuit + bord éclairé) ---------- */
  function puff(g, x, y, r, rgb, a) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${rgb},${a})`);
    gr.addColorStop(.6, `rgba(${rgb},${a * .55})`);
    gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
  function sprite(seed, warm) {
    const c = document.createElement('canvas'); c.width = 560; c.height = 300;
    const g = c.getContext('2d'), r = rng(seed), ps = [];
    for (let i = 0; i < 26; i++) {
      const u = r(), b = Math.sin(u * Math.PI);
      ps.push({ x: 80 + u * 400, y: 220 - b * (40 + r() * 60) - r() * 18, r: 34 + r() * 34 + b * 42 });
    }
    ps.forEach(p => puff(g, p.x, p.y + 14, p.r, '4,10,28', .95));              // ombre
    ps.forEach(p => puff(g, p.x, p.y, p.r * .92, '22,42,86', .95));            // corps bleu nuit
    ps.forEach(p => puff(g, p.x - p.r * .25, p.y - p.r * .32, p.r * .5, warm ? '255,170,110' : '90,140,220', warm ? .65 : .4)); // lumière
    return c;
  }
  const cool = [0, 1, 2, 3].map(i => sprite(i * 331 + 7, false));
  const warm = [0, 1].map(i => sprite(i * 577 + 99, true));

  /* ---------- Nuages : x,y en fraction de l'écran ---------- */
  const clouds = [
    // arrière-plan (petits, sombres, lents)
    { s: cool[0], x: .20, y: .12, w: .55, v: .004, a: .55, l: .2 },
    { s: cool[1], x: .70, y: .08, w: .6,  v: .003, a: .5,  l: .2 },
    { s: cool[2], x: .50, y: .55, w: .5,  v: .004, a: .35, l: .3 },
    // milieu
    { s: cool[3], x: .02, y: .28, w: .42, v: .006, a: .85, l: .6 },
    { s: cool[1], x: .92, y: .30, w: .30, v: .005, a: .5,  l: .5 },
    { s: cool[2], x: .88, y: .72, w: .55, v: .007, a: .95, l: .9 },
    // premier plan (grands, bas, éclairés en orange à gauche)
    { s: warm[0], x: .02, y: .86, w: .7,  v: .005, a: 1,   l: 1.2 },
    { s: warm[1], x: .30, y: .98, w: .62, v: .004, a: .9,  l: 1.4 }
  ];
  const stars = [];
  { const r = rng(21); for (let i = 0; i < 90; i++) stars.push({ x: r(), y: r() * .7, r: .3 + r() * .9, f: .6 + r() * 2, p: r() * 6.28 }); }

  /* ---------- Taille ---------- */
  let W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  }
  addEventListener('resize', resize); resize();

  /* ---------- Parallaxe ---------- */
  let tx = 0, ty = 0, px = 0, py = 0, active = false;
  addEventListener('pointermove', e => { active = true; tx = (e.clientX / W - .5) * 2; ty = (e.clientY / H - .5) * 2; }, { passive: true });

  /* ---------- Boucle ---------- */
  let t0 = performance.now(), last = t0;
  function frame(now) {
    const t = (now - t0) / 1000, dt = Math.min((now - last) / 1000, .05); last = now;
    const gx = active ? tx : Math.sin(t * .25) * .6, gy = active ? ty : Math.cos(t * .2) * .2;
    px += (gx - px) * Math.min(1, dt * 2.5); py += (gy - py) * Math.min(1, dt * 2.5);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#02060f'); bg.addColorStop(.6, '#061226'); bg.addColorStop(1, '#0a1c3a');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // étoiles discrètes
    for (const s of stars) {
      ctx.fillStyle = `rgba(190,215,255,${.15 + .35 * Math.abs(Math.sin(t * s.f + s.p))})`;
      ctx.beginPath(); ctx.arc(s.x * W + px * 3, s.y * H, s.r, 0, 7); ctx.fill();
    }

    // lueur chaude en bas à gauche (comme sur la référence)
    const wg = ctx.createRadialGradient(0, H, 0, 0, H, Math.max(W, H) * .6);
    wg.addColorStop(0, 'rgba(255,150,90,.28)'); wg.addColorStop(1, 'rgba(255,150,90,0)');
    ctx.fillStyle = wg; ctx.fillRect(0, 0, W, H);

    // nuages en dérive lente avec parallaxe
    const base = Math.max(W, 420);
    for (const c of clouds) {
      const w = base * c.w, h = w * 300 / 560;
      const u = (((c.x + t * c.v) % 1.5) + 1.5) % 1.5;           // boucle sur 1.5 largeur
      const x = (u - .25) * W - w / 2 + px * 22 * c.l;
      const y = c.y * H - h / 2 + py * 10 * c.l + Math.sin(t * .3 + c.x * 9) * 4 * c.l;
      ctx.globalAlpha = c.a;
      ctx.drawImage(c.s, x, y, w, h);
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- Séquence CSS (classe .go) + relecture ---------- */
  function play() {
    stage.classList.remove('go'); document.body.classList.remove('go');
    void stage.offsetWidth;                       // relance les animations
    document.body.classList.add('go');
  }
  replay.addEventListener('click', play);
  play();
})();
