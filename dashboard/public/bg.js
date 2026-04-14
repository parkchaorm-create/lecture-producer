/* ================================================================
   bg.js · 파자마보스 FLOW 배경 (축소판)
   대시보드 전용 · 파티클 수·속도 조절로 가독성 우선
   prefers-reduced-motion 시 정적 도트만
   ================================================================ */
(function () {
  const canvas = document.getElementById('bgcanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h;
  function resize() {
    w = canvas.width = innerWidth * devicePixelRatio;
    h = canvas.height = innerHeight * devicePixelRatio;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  }
  resize();
  addEventListener('resize', resize);

  let seed = 2026;
  function rand() { seed = (seed * 1664525 + 1013904223) | 0; return ((seed >>> 0) / 4294967296); }
  const nt = new Array(512);
  for (let i = 0; i < 512; i++) nt[i] = rand();
  function noise2(x, y) {
    const xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const aa = nt[(xi + yi * 57) & 511], ba = nt[((xi + 1) + yi * 57) & 511];
    const ab = nt[(xi + (yi + 1) * 57) & 511], bb = nt[((xi + 1) + (yi + 1) * 57) & 511];
    return (aa * (1 - u) + ba * u) * (1 - v) + (ab * (1 - u) + bb * u) * v;
  }

  const GOLD = '#e2c793';
  const PARTICLES = reduce ? 0 : 140;
  const parts = [];
  for (let i = 0; i < PARTICLES; i++) parts.push({ x: rand() * w, y: rand() * h, vx: 0, vy: 0, life: rand() * 200 });

  let mx = w / 2, my = h / 2, t = 0;
  addEventListener('mousemove', e => { mx = e.clientX * devicePixelRatio; my = e.clientY * devicePixelRatio; });

  function draw() {
    ctx.fillStyle = 'rgba(13,13,13,0.08)';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 0.5 * devicePixelRatio;
    for (const p of parts) {
      const mDx = (p.x - mx) / 400, mDy = (p.y - my) / 400;
      const n = noise2(p.x * 0.0014, p.y * 0.0014 + t * 0.015) * Math.PI * 4;
      p.vx = Math.cos(n) * 1.0 * devicePixelRatio + mDx * 0.3;
      p.vy = Math.sin(n) * 1.0 * devicePixelRatio + mDy * 0.3;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      p.x += p.vx; p.y += p.vy;
      ctx.lineTo(p.x, p.y);
      ctx.globalAlpha = 0.22;
      ctx.stroke();
      p.life--;
      if (p.life < 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
        p.x = rand() * w; p.y = rand() * h; p.life = 120 + rand() * 160;
      }
    }
    ctx.globalAlpha = 1;
    t++;
    if (!reduce) requestAnimationFrame(draw);
  }
  if (PARTICLES > 0) draw();
})();
