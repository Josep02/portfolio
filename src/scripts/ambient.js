// ------------------------------------------------------------------
// Campo de partículas ambiental (fondo fijo de toda la página).
// Monocromo, lento y barato: pocas partículas, sin sombras, y se
// pausa cuando la pestaña no está visible para no gastar CPU/batería.
// ------------------------------------------------------------------
const canvas = document.getElementById("ambient-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");

  const COLORS = ["#ffffff", "#bdbdbd", "#7a7a7a"];
  const DENSITY = 0.00006; // partículas por píxel de pantalla
  const MAX = 120;

  let w, h, particles = [];

  function make() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() < 0.15 ? 3 : Math.random() * 1.5 + 1,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      blink: Math.random() < 0.25,
      phase: Math.random() * Math.PI * 2,
    };
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(MAX, Math.floor(w * h * DENSITY));
    particles = Array.from({ length: count }, make);
  }

  let frame = 0;
  function draw() {
    frame += 0.03;
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      else if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      else if (p.y > h) p.y = 0;

      ctx.globalAlpha = p.blink ? 0.35 + 0.35 * Math.sin(frame + p.phase) : 0.6;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  // Bucle con pausa por visibilidad de pestaña
  let running = false;
  let rafId = null;
  function loop() {
    draw();
    if (running) rafId = requestAnimationFrame(loop);
  }
  function start() {
    if (running) return;
    running = true;
    loop();
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () =>
    document.hidden ? stop() : start()
  );

  resize();
  start();
}
