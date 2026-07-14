// ------------------------------------------------------------------
//  Hero terminal INTERACTIVA.
//  1) Una intro que se teclea sola.
//  2) Un prompt vivo: el visitante escribe comandos reales.
//  Comandos útiles (whoami, stack, projects, contact...) + easter eggs.
//  Respeta prefers-reduced-motion en la intro.
// ------------------------------------------------------------------
const body = document.getElementById("term-body");
const term = document.querySelector(".term");

if (body && term) {
  const PROMPT = "josep@portfolio:~$ ";
  const BASE = document.documentElement.dataset.base || "/portfolio/";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---- Utilidades de pintado ------------------------------------
  function line(cls) {
    const el = document.createElement("div");
    if (cls) el.className = cls;
    body.appendChild(el);
    return el;
  }
  function scroll() {
    body.scrollTop = body.scrollHeight;
  }
  function print(text = "", cls = "term-out") {
    String(text)
      .split("\n")
      .forEach((t) => {
        const el = line(cls);
        el.textContent = t;
      });
    scroll();
  }
  function printPrompt(cmd) {
    const el = line("term-line");
    const p = document.createElement("span");
    p.className = "term-prompt";
    p.textContent = PROMPT;
    el.appendChild(p);
    const t = document.createElement("span");
    t.className = "term-typed";
    t.textContent = cmd;
    el.appendChild(t);
    return el;
  }

  const cursor = document.createElement("span");
  cursor.className = "term-cursor";

  // ---- Comandos --------------------------------------------------
  const P = [
    ["cromoverse", "SaaS multi-tenant de cromos digitales (Next.js 16 + Supabase)"],
    ["mkgenia", "Web de agencia de automatización con IA (Next.js 14)"],
    ["crm-inmobiliario", "CRM a medida con roles y permisos (Next.js 15 + Supabase)"],
  ];

  const COMMANDS = {
    help: {
      desc: "muestra esta ayuda",
      run: () => {
        const visible = Object.entries(COMMANDS).filter(([, c]) => c.desc);
        const w = Math.max(...visible.map(([k]) => k.length));
        return [
          "Comandos disponibles:",
          "",
          ...visible.map(([k, c]) => `  ${k.padEnd(w + 2)}${c.desc}`),
          "",
          "…y algún que otro secreto por descubrir 👀",
        ];
      },
    },
    whoami: {
      desc: "quién soy",
      run: () => "Josep Ferrer Bañuls — desarrollador web full-stack.",
    },
    stack: {
      desc: "tecnologías que uso",
      run: () => "TypeScript · Next.js · Astro · React · Supabase · PostgreSQL · PHP · WordPress",
    },
    projects: {
      desc: "lista mis proyectos",
      run: () => {
        const w = Math.max(...P.map(([n]) => n.length));
        return P.map(([n, d]) => `  ${n.padEnd(w + 3)}${d}`);
      },
    },
    about: {
      desc: "sobre mí",
      run: () => [
        "Diseño y programo aplicaciones web de principio a fin: de la",
        "interfaz a la base de datos. Ecosistema React (Next/Astro) +",
        "Supabase, y amplia experiencia en PHP y WordPress.",
      ],
    },
    contact: {
      desc: "cómo contactarme",
      run: () => "✉  orriols002@gmail.com",
    },
    social: {
      desc: "mis perfiles",
      run: () => ["GitHub:   github.com/  (pendiente)", "LinkedIn: linkedin.com/  (pendiente)"],
    },
    goto: {
      desc: "navega a una sección: goto proyectos|stack|contacto",
      run: (args) => {
        const sec = (args[0] || "").replace(/^#/, "");
        const valid = ["sobre-mi", "proyectos", "stack", "contacto"];
        const map = { "sobre-mi": "sobre-mi", sobremi: "sobre-mi", proyectos: "proyectos", stack: "stack", contacto: "contacto", contact: "contacto" };
        const target = map[sec];
        if (!target) return `uso: goto ${valid.join("|")}`;
        location.href = `${BASE}#${target}`;
        return `→ navegando a #${target}`;
      },
    },
    date: { desc: "fecha y hora", run: () => new Date().toString() },
    clear: { desc: "limpia la pantalla", run: () => "\0CLEAR" },

    // ---- Easter eggs (sin desc: no salen en 'help') -------------
    sudo: {
      run: (args) =>
        args.join(" ").includes("rm -rf")
          ? ["", "😱  ...", "Es broma. No he borrado nada — esto es solo un portfolio 😄", ""]
          : "Nice try 😏 — no tienes permisos de superusuario aquí.",
    },
    "rm -rf /": {
      run: () => ["", "rm: no se puede borrar '/': operación no autorizada 🛡️", "(uf, por poco)"],
    },
    exit: { run: () => "No puedes salir. Estás atrapado en mi portfolio para siempre 👻" },
    vim: { run: () => "Has entrado en Vim. Que la suerte te acompañe para salir. (:q! → )" },
    emacs: { run: () => "Emacs es un gran sistema operativo… solo le falta un buen editor 🙃" },
    ping: { run: () => "pong 🏓" },
    "42": { run: () => "La respuesta a la vida, el universo y todo lo demás. 🌌" },
    coffee: {
      run: () => [
        "      ( (",
        "       ) )",
        "    .________.",
        "    |        |]",
        "    \\        /",
        "     `------'   ☕  recargando cafeína...",
      ],
    },
    neofetch: {
      run: () => [
        "   ______     user:   josep",
        "  /|_||_\\`.__  os:     web · full-stack",
        " (   _    _ _\\ shell:  portfolio.sh",
        " =`-(_)--(_)-' stack:  TS · Next · Astro · Supabase",
        "               uptime: siempre aprendiendo",
      ],
    },
    theme: {
      run: () => {
        term.classList.toggle("green");
        return term.classList.contains("green")
          ? "Modo fósforo verde activado. 🟢  (theme para volver)"
          : "De vuelta al monocromo. ⚪";
      },
    },
    hack: { async: true, run: hackRun },
    matrix: { async: true, run: matrixRun },
    "33": { async: true, run: nanoRun },
    echo: { run: (args) => args.join(" ") },
  };

  // Alias de línea completa
  const ALIASES = {
    "cat stack.txt": "stack",
    "ls": "projects",
    "ls proyectos/": "projects",
    "ls -la": "projects",
    "cat about.txt": "about",
    "email": "contact",
    "links": "social",
    "cls": "clear",
    "sudo su": "sudo",
    "sudo rm -rf /": "sudo rm -rf /",
    "man": "help",
    "?": "help",
    "nano": "33",
    "alonso": "33",
    "el nano": "33",
    "fernando alonso": "33",
  };

  async function hackRun() {
    const steps = [
      "Iniciando secuencia de intrusión...",
      "Escaneando puertos [■■■■■■■■■■] 100%",
      "Bypassing firewall...",
      "Descifrando clave: ******** OK",
      "Acceso concedido 🔓",
    ];
    for (const s of steps) {
      print(s, "term-out");
      if (!reduced) await sleep(420);
    }
    print("...que es broma. No hackeo nada, solo hago webs bonitas 😅", "term-hint");
  }

  async function matrixRun() {
    const chars = "01アカサタナ日ラ0110ムメモ01";
    const rows = reduced ? 3 : 10;
    for (let i = 0; i < rows; i++) {
      let s = "";
      for (let j = 0; j < 42; j++) s += chars[(Math.random() * chars.length) | 0];
      print(s, "term-matrix");
      if (!reduced) await sleep(90);
    }
    print("Toc, toc. Sígueme, Neo. 🐇", "term-out");
  }

  // Easter egg: El Nano (#33). Partículas que se integran en el sistema
  // formando "33" → "EL NANO" → "33", en el estilo monocromo del hero.
  async function nanoRun() {
    const wrap = line("term-canvas");
    const cw = Math.max(240, Math.min((body.clientWidth || 480) - 40, 560));
    const ch = 190;
    const c = document.createElement("canvas");
    c.width = cw;
    c.height = ch;
    c.style.display = "block";
    c.style.margin = "8px auto";
    wrap.appendChild(c);
    scroll();
    const ctx = c.getContext("2d");

    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {}
    }

    const COLORS = ["#ffffff", "#d4d4d4", "#8a8a8a"];
    const off = document.createElement("canvas");
    off.width = cw;
    off.height = ch;
    const octx = off.getContext("2d", { willReadFrequently: true });

    // Muestrea cualquier dibujo (texto o formas) a una nube de puntos
    function sampleDraw(drawFn) {
      octx.clearRect(0, 0, cw, ch);
      octx.fillStyle = "#fff";
      drawFn(octx);
      const d = octx.getImageData(0, 0, cw, ch).data;
      const pts = [];
      for (let y = 0; y < ch; y += 3)
        for (let x = 0; x < cw; x += 3) if (d[(y * cw + x) * 4 + 3] > 128) pts.push({ x, y });
      return pts;
    }

    function sampleText(text) {
      return sampleDraw((g) => {
        g.textAlign = "center";
        g.textBaseline = "middle";
        let fs = ch * 0.62;
        g.font = `bold ${fs}px 'Bitcount Single', monospace`;
        while (g.measureText(text).width > cw * 0.9 && fs > 12) {
          fs -= 4;
          g.font = `bold ${fs}px 'Bitcount Single', monospace`;
        }
        g.fillText(text, cw / 2, ch / 2);
      });
    }

    // Silueta de monoplaza de F1 (vista lateral, morro a la derecha),
    // dibujada a mano con primitivas — sin assets externos.
    function drawCar(g) {
      const W = cw;
      const H = ch;
      const gy = H * 0.66; // eje de las ruedas
      const wr = H * 0.16; // radio de rueda
      // Cuerpo (cola izquierda → morro derecho)
      g.beginPath();
      g.moveTo(W * 0.12, gy);
      g.lineTo(W * 0.12, gy - H * 0.1);
      g.quadraticCurveTo(W * 0.3, gy - H * 0.2, W * 0.42, gy - H * 0.15);
      g.quadraticCurveTo(W * 0.49, gy - H * 0.34, W * 0.56, gy - H * 0.15); // cockpit
      g.quadraticCurveTo(W * 0.72, gy - H * 0.13, W * 0.9, gy - H * 0.01); // morro
      g.lineTo(W * 0.9, gy + H * 0.05);
      g.lineTo(W * 0.12, gy + H * 0.05);
      g.closePath();
      g.fill();
      // Alerón trasero
      g.fillRect(W * 0.08, gy - H * 0.34, W * 0.045, H * 0.3);
      g.fillRect(W * 0.055, gy - H * 0.34, W * 0.12, H * 0.045);
      // Alerón delantero
      g.fillRect(W * 0.85, gy + H * 0.03, W * 0.11, H * 0.045);
      // Casco del piloto
      g.beginPath();
      g.arc(W * 0.5, gy - H * 0.22, H * 0.085, 0, Math.PI * 2);
      g.fill();
      // Ruedas
      g.beginPath();
      g.arc(W * 0.26, gy, wr, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.arc(W * 0.73, gy, wr, 0, Math.PI * 2);
      g.fill();
    }

    const scenes = [sampleText("33"), sampleText("EL NANO"), sampleDraw(drawCar)];
    const N = 1500;
    const parts = Array.from({ length: N }, () => ({
      x: Math.random() * cw,
      y: Math.random() * ch,
      vx: 0,
      vy: 0,
      tx: cw / 2,
      ty: ch / 2,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      twk: Math.random() < 0.25,
      ph: Math.random() * Math.PI * 2,
    }));
    let si = 0;

    function assign(kick) {
      const pts = scenes[si];
      const len = pts.length;
      for (let i = 0; i < N; i++) {
        const t = pts[Math.floor((i / N) * len)] || pts[i % len];
        parts[i].tx = t.x;
        parts[i].ty = t.y;
        if (kick) {
          parts[i].vx += (Math.random() - 0.5) * 11;
          parts[i].vy += (Math.random() - 0.5) * 11;
        }
      }
    }
    assign(false);

    print("🏎  El Nano · #33 · Fernando Alonso — ¡Vamos! 🇪🇸", "term-out");

    if (reduced) {
      si = scenes.length - 1;
      assign(false);
      ctx.clearRect(0, 0, cw, ch);
      for (const p of parts) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.tx, p.ty, 1.8, 1.8);
      }
      return;
    }

    return new Promise((resolve) => {
      let frame = 0;
      let last = performance.now();
      let sceneT = 0;
      function loop(ts) {
        const dt = Math.min(50, ts - last);
        last = ts;
        frame += dt * 0.004;
        sceneT += dt;
        if (sceneT > 1700 && si < scenes.length - 1) {
          sceneT = 0;
          si++;
          assign(true);
        }
        ctx.clearRect(0, 0, cw, ch);
        for (const p of parts) {
          p.vx += (p.tx - p.x) * 0.02;
          p.vy += (p.ty - p.y) * 0.02;
          p.vx *= 0.85;
          p.vy *= 0.85;
          p.x += p.vx;
          p.y += p.vy;
          let a = 1;
          if (p.twk) a = 0.5 + 0.5 * Math.sin(frame + p.ph);
          ctx.globalAlpha = a;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, 1.8, 1.8);
        }
        ctx.globalAlpha = 1;
        // Al asentar la última escena ("33") paramos: queda estático.
        if (si === scenes.length - 1 && sceneT > 1800) resolve();
        else requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
    });
  }

  // ---- Ejecutor --------------------------------------------------
  async function exec(raw) {
    const input = raw.trim();
    if (!input) return;
    const key = input.toLowerCase();
    const resolved = ALIASES[key] || key;

    // Buscar por línea completa primero, luego por primer token
    let cmd = COMMANDS[resolved];
    let args = [];
    if (!cmd) {
      const parts = resolved.split(/\s+/);
      cmd = COMMANDS[parts[0]];
      args = parts.slice(1);
    }

    if (!cmd) {
      print(`comando no encontrado: ${input.split(/\s+/)[0]}. Escribe 'help'.`, "term-hint");
      return;
    }

    const out = await cmd.run(args, input);
    if (out === "\0CLEAR") {
      body.innerHTML = "";
      return;
    }
    if (out != null) print(Array.isArray(out) ? out.join("\n") : out);
  }

  // ---- Prompt interactivo (input oculto que capturamos) ----------
  const input = document.createElement("input");
  input.className = "term-input";
  input.setAttribute("aria-label", "Terminal: escribe un comando");
  input.autocapitalize = "off";
  input.autocomplete = "off";
  input.spellcheck = false;
  term.appendChild(input);

  const history = [];
  let histIdx = -1;
  let typed = null; // span de texto de la línea actual

  function newLine() {
    const el = printPrompt("");
    typed = el.querySelector(".term-typed");
    el.appendChild(cursor);
    input.value = "";
    scroll();
  }

  function submit() {
    const v = input.value;
    if (typed) typed.textContent = v;
    cursor.remove();
    input.value = "";
    if (v.trim()) {
      history.push(v);
      histIdx = history.length;
    }
    exec(v).then(newLine);
  }

  input.addEventListener("input", () => {
    if (typed) typed.textContent = input.value;
    scroll();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (histIdx > 0) {
        histIdx--;
        input.value = history[histIdx];
        if (typed) typed.textContent = input.value;
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        histIdx++;
        input.value = history[histIdx];
      } else {
        histIdx = history.length;
        input.value = "";
      }
      if (typed) typed.textContent = input.value;
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      body.innerHTML = "";
      newLine();
    }
  });

  // Clic en la terminal → foco al input (abre teclado en móvil)
  term.addEventListener("click", () => input.focus());

  // ---- Intro que se teclea sola ---------------------------------
  const INTRO = [
    { cmd: "whoami" },
    { out: "Josep Ferrer Bañuls — desarrollador web full-stack" },
    { cmd: "cat stack.txt" },
    { out: "TypeScript · Next.js · Astro · React · Supabase · PHP · WordPress" },
    { cmd: "./bienvenida.sh" },
    { out: "bienvenido a mi portfolio.", big: true },
  ];

  async function typeIntro() {
    for (const step of INTRO) {
      if (step.cmd) {
        const el = printPrompt("");
        const t = el.querySelector(".term-typed");
        el.appendChild(cursor);
        if (reduced) {
          t.textContent = step.cmd;
        } else {
          for (const ch of step.cmd) {
            t.textContent += ch;
            scroll();
            await sleep(46 + Math.random() * 42);
          }
          await sleep(320);
        }
        cursor.remove();
      } else {
        print(step.out, step.big ? "term-big" : "term-out");
        if (!reduced) await sleep(480);
      }
    }
    print("Escribe 'help' para ver los comandos. Esto es una terminal de verdad ✨", "term-hint");
    newLine();
    input.focus({ preventScroll: true });
  }

  typeIntro();
}
