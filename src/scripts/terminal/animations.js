import { reduced, sleep, body, BASE } from "./state.js";
import { print, line, scroll, printPrompt, cursor } from "./core.js";

export async function hackRun() {
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

export async function matrixRun() {
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

export async function nanoRun() {
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
    } catch { }
  }

  const COLORS = ["#ffffff", "#d4d4d4", "#8a8a8a"];
  const off = document.createElement("canvas");
  off.width = cw;
  off.height = ch;
  const octx = off.getContext("2d", { willReadFrequently: true });

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

  const F1_PATH =
    "M355.975 292.25a24.82 24.82 0 1 0 24.82-24.81 24.84 24.84 0 0 0-24.82 24.81zm-253-24.81a24.81 24.81 0 1 1-24.82 24.81 24.84 24.84 0 0 1 24.81-24.81zm-76.67-71.52h67.25l-13.61 49.28 92-50.28h57.36l1.26 34.68 32 14.76 11.74-14.44h15.62l3.16 16c137.56-13 192.61 29.17 192.61 29.17s-7.52 5-25.93 8.39c-3.88 3.31-3.66 14.44-3.66 14.44h24.2v16h-52v-27.48c-1.84.07-4.45.41-7.06.47a40.81 40.81 0 1 0-77.25 23h-204.24a40.81 40.81 0 1 0-77.61-17.67c0 1.24.06 2.46.17 3.67h-36z";

  function drawCar(g) {
    const p = new Path2D(F1_PATH);
    const s = Math.min((cw * 0.95) / 512, (ch * 0.92) / (0.34 * 512));
    g.save();
    g.translate(cw / 2 - 256 * s, ch / 2 - 256 * s);
    g.scale(s, s);
    g.fill(p);
    g.restore();
  }

  // Load alonso.png and sample its pixels
  async function sampleImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const pts = sampleDraw((g) => {
          // fit image inside canvas maintaining aspect ratio
          const scale = Math.min(cw / img.width, ch / img.height) * 0.92;
          const w = img.width * scale;
          const h = img.height * scale;
          g.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
        });
        resolve(pts);
      };
      img.onerror = () => resolve(sampleDraw(drawCar)); // fallback al coche
      img.src = src;
    });
  }

  const alonsoPts = await sampleImage(
    (typeof BASE !== "undefined" ? BASE : "/") + "alonso.png"
  );

  const scenes = [sampleText("33"), sampleText("EL NANO"), alonsoPts];
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
      if (si === scenes.length - 1 && sceneT > 1800) resolve();
      else requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  });
}

const INTRO = [
  { cmd: "whoami" },
  { out: "Josep Ferrer Bañuls — desarrollador web full-stack" },
  { cmd: "cat stack.txt" },
  { out: "TypeScript · Next.js · Astro · React · Supabase · PHP · WordPress" },
  { cmd: "./bienvenida.sh" },
  { out: "bienvenido a mi portfolio.", big: true },
];

export async function typeIntro(inputElement) {
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
  const el = printPrompt("");
  const typed = el.querySelector(".term-typed");
  el.appendChild(cursor);
  inputElement.value = "";
  scroll();
  inputElement.focus({ preventScroll: true });
  return typed;
}
