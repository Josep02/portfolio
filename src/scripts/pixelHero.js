// ------------------------------------------------------------------
//  Hero de partículas con MORPHING de escenas.
//  Un pool fijo de partículas se reorganiza en bucle:
//    1) desfilan los logos uno a uno (Next.js, GitHub, React, TS, Astro, Supabase)
//    2) escena final: el texto "bienvenido a mi portfolio." con todos
//       los logos rodeándolo de forma medio aleatoria.
//  En cada cambio de escena las partículas reciben un pequeño impulso
//  (efecto "explosión") y vuelven a recomponerse de forma magnética.
// ------------------------------------------------------------------
const canvas = document.getElementById("pixel-canvas");

if (canvas) {
  const ctx = canvas.getContext("2d");
  const section = document.getElementById("pixel-section");

  // ---- Ajustes ----------------------------------------------------
  const CANVAS_HEIGHT = 700;
  const GAP = 5; // resolución de muestreo (menor = más partículas)
  const N = 4500; // tamaño del pool de partículas
  const SPRING = 0.014; // fuerza de atracción al objetivo
  const DAMP = 0.86; // rozamiento
  const COLORS = ["#ffffff", "#d4d4d4", "#8a8a8a", "#5c5c5c"];

  // Texto inicial
  const TEXT_LINES = [
    { text: "bienvenido a mi", dy: -70 },
    { text: "portfolio.", dy: 70 },
  ];

  // Logos oficiales (paths SVG 24x24 de Simple Icons)
  const LOGOS = [
    { name: "Next.js", path: "M18.665 21.978C16.758 23.255 14.465 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.583-1.574 6.801-4.067 9.001L9.219 7.2H7.2v9.596h1.615V9.251l9.85 12.727Zm-3.332-8.533 1.6 2.061V7.2h-1.6v6.245Z" },
    { name: "GitHub", path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" },
    { name: "React", path: "M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z" },
    { name: "TypeScript", path: "M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" },
    { name: "Astro", path: "M8.358 20.162c-1.186-1.07-1.532-3.316-1.038-4.944.856 1.026 2.043 1.352 3.272 1.535 1.897.283 3.76.177 5.522-.678.202-.098.388-.229.608-.36.166.473.209.95.151 1.437-.14 1.185-.738 2.1-1.688 2.794-.38.277-.782.525-1.175.787-1.205.804-1.531 1.747-1.078 3.119l.044.148a3.158 3.158 0 0 1-1.407-1.188 3.31 3.31 0 0 1-.544-1.815c-.004-.32-.004-.642-.048-.958-.106-.769-.472-1.113-1.161-1.133-.707-.02-1.267.411-1.415 1.09-.012.053-.028.104-.045.165h.002zm-5.961-4.445s3.24-1.575 6.49-1.575l2.451-7.565c.092-.366.36-.614.662-.614.302 0 .57.248.662.614l2.45 7.565c3.85 0 6.491 1.575 6.491 1.575L16.088.727C15.93.285 15.663 0 15.303 0H8.697c-.36 0-.615.285-.784.727l-5.516 14.99z" },
    { name: "Supabase", path: "M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.33 13.427.65 15.455 2.409 15.455h9.579l.113 7.51c.014.985 1.259 1.408 1.873.636l9.262-11.653c1.093-1.375.113-3.403-1.645-3.403h-9.642z" },
  ];

  // ---- Estado -----------------------------------------------------
  let w, h, CX, CY;
  let particles = [];
  let scenes = [];
  let sceneIndex = 0;

  const off = document.createElement("canvas");
  const octx = off.getContext("2d", { willReadFrequently: true });

  const mouse = { x: -9999, y: -9999 };

  // ---- Muestreo de una forma a puntos objetivo --------------------
  function samplePoints(drawFn) {
    octx.clearRect(0, 0, w, h);
    octx.fillStyle = "#fff";
    drawFn(octx);
    const data = octx.getImageData(0, 0, w, h).data;
    const pts = [];
    for (let y = 0; y < h; y += GAP) {
      for (let x = 0; x < w; x += GAP) {
        if (data[(y * w + x) * 4 + 3] > 128) pts.push({ x, y });
      }
    }
    return pts;
  }

  // Un logo grande y centrado (para el desfile inicial)
  function buildLogoScene(path) {
    const size = Math.min(w * 0.8, CANVAS_HEIGHT) * 0.55;
    const p = new Path2D(path);
    return samplePoints((c) => {
      c.save();
      c.translate(CX - size / 2, CY - size / 2);
      c.scale(size / 24, size / 24);
      c.fill(p);
      c.restore();
    });
  }

  // Muestrea un logo pequeño colocado en (lx, ly)
  function sampleSmallLogo(path, lx, ly, s) {
    const p = new Path2D(path);
    return samplePoints((c) => {
      c.save();
      c.translate(lx - s / 2, ly - s / 2);
      c.scale(s / 24, s / 24);
      c.fill(p);
      c.restore();
    });
  }

  // Escena FINAL: texto central + todos los logos rodeándolo
  // de forma medio aleatoria.
  function buildFinaleScene() {
    const pts = [];

    // Texto central (algo más pequeño para dejar sitio a los logos)
    const textPts = samplePoints((c) => {
      c.textAlign = "center";
      c.textBaseline = "middle";
      const fs = Math.min(w * 0.105, 112);
      c.font = `bold ${fs}px 'Bitcount Single', monospace`;
      TEXT_LINES.forEach((l) => c.fillText(l.text, CX, CY + l.dy * 0.9));
    });
    pts.push(...textPts);

    // Logos pequeños en anillo con dispersión aleatoria
    const n = LOGOS.length;
    const small = Math.min(w, CANVAS_HEIGHT) * 0.11;
    const rx = Math.min(w * 0.38, CX - small * 0.7 - 8);
    const ry = CANVAS_HEIGHT * 0.36;
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 - Math.PI / 2 + (Math.random() - 0.5) * 0.6;
      const jr = 0.82 + Math.random() * 0.32;
      let lx = CX + Math.cos(ang) * rx * jr;
      let ly = CY + Math.sin(ang) * ry * jr;
      lx = Math.max(small, Math.min(w - small, lx));
      ly = Math.max(small, Math.min(CANVAS_HEIGHT - small, ly));
      pts.push(...sampleSmallLogo(LOGOS[i].path, lx, ly, small));
    }
    return pts;
  }

  function buildScenes() {
    // 1) Desfile de logos, uno a uno.  2) Escena final combinada.
    scenes = LOGOS.map((l) => ({ points: buildLogoScene(l.path), hold: 2200 }));
    scenes.push({ points: buildFinaleScene(), hold: 6000 });
  }

  // ---- Partículas -------------------------------------------------
  function initParticles() {
    particles = [];
    for (let i = 0; i < N; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        tx: CX,
        ty: CY,
        vx: 0,
        vy: 0,
        size: Math.random() < 0.14 ? 2.8 : 1.8,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        twinkle: Math.random() < 0.25,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function assignTargets(kick) {
    const pts = scenes[sceneIndex].points;
    const len = pts.length;
    for (let i = 0; i < N; i++) {
      const p = particles[i];
      const t = pts[Math.floor((i / N) * len)] || pts[i % len];
      p.tx = t.x;
      p.ty = t.y;
      if (kick) {
        p.vx += (Math.random() - 0.5) * 16;
        p.vy += (Math.random() - 0.5) * 16;
      }
    }
  }

  function resize() {
    w = off.width = canvas.width = document.documentElement.clientWidth;
    h = off.height = canvas.height = CANVAS_HEIGHT;
    CX = w / 2;
    CY = h / 2;
    if (particles.length !== N) initParticles();
    buildScenes();
    assignTargets(false);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  window.addEventListener("mouseout", () => {
    mouse.x = mouse.y = -9999;
  });

  // ---- Bucle ------------------------------------------------------
  let frame = 0;
  let sceneTimer = 0;
  let lastTs = 0;

  function step(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(50, ts - lastTs);
    lastTs = ts;
    frame += dt * 0.004;
    sceneTimer += dt;

    // Avanza de escena; al llegar a la última (texto + logos) se queda ahí.
    if (sceneIndex < scenes.length - 1 && sceneTimer > scenes[sceneIndex].hold) {
      sceneTimer = 0;
      sceneIndex++;
      assignTargets(true);
    }

    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < N; i++) {
      const p = particles[i];

      // Atracción magnética al objetivo
      p.vx += (p.tx - p.x) * SPRING;
      p.vy += (p.ty - p.y) * SPRING;

      // Repulsión suave del cursor
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 9000) {
        const d = Math.sqrt(d2) + 0.01;
        const f = (1 - d / 95) * 5;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }

      p.vx *= DAMP;
      p.vy *= DAMP;
      p.x += p.vx;
      p.y += p.vy;

      let alpha = 1;
      if (p.twinkle) alpha = 0.5 + 0.5 * Math.sin(frame + p.phase);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    if (running) rafId = requestAnimationFrame(step);
  }

  // ---- Pausa cuando el hero no está a la vista --------------------
  let running = false;
  let rafId = null;

  function start() {
    if (running) return;
    running = true;
    lastTs = 0;
    step(performance.now()); // primer frame síncrono; step programa el siguiente
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  // IO solo para PAUSAR/reanudar al hacer scroll (optimización).
  // La animación se arranca directamente en activate() para no depender
  // de que el observer dispare el callback inicial.
  const io = new IntersectionObserver(
    (entries) => (entries[0].isIntersecting ? start() : stop()),
    { threshold: 0 }
  );

  function activate() {
    resize();
    start();
    io.observe(section);
  }

  // La fuente Bitcount debe estar cargada antes de muestrear el texto;
  // si por lo que sea falla, arrancamos igualmente con la fuente de reserva.
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve())
    .then(activate)
    .catch(activate);
}
