import { BASE, term } from "./state.js";
import { hackRun, matrixRun, nanoRun } from "./animations.js";

const P = [
  ["rogue", "PWA de entreno y nutrición: rutinas, cardio GPS, escáner de alimentos y rangos (Next.js 16)"],
  ["cromoverse", "SaaS multi-tenant de cromos digitales (Next.js 16 + Supabase)"],
];

// Modal de vídeo (YouTube embebido). Cierra con botón, Esc o clic fuera.
function openVideoModal(videoId, title) {
  document.getElementById("video-modal")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "video-modal";
  overlay.className = "modal";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", title);

  const box = document.createElement("div");
  box.className = "modal-box modal-box-wide";

  const bar = document.createElement("div");
  bar.className = "modal-bar";
  bar.innerHTML = `<span>${title}</span>`;

  const close = document.createElement("button");
  close.type = "button";
  close.className = "modal-close";
  close.setAttribute("aria-label", "Cerrar vídeo");
  close.textContent = "✕";
  bar.appendChild(close);

  const frame = document.createElement("iframe");
  frame.className = "modal-frame";
  frame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  frame.allow = "autoplay; encrypted-media";
  frame.allowFullscreen = true;
  frame.referrerPolicy = "strict-origin-when-cross-origin";

  box.append(bar, frame);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  function destroy() {
    overlay.remove();
    document.removeEventListener("keydown", onKey);
  }
  function onKey(e) {
    if (e.key === "Escape") destroy();
  }
  close.addEventListener("click", destroy);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) destroy();
  });
  document.addEventListener("keydown", onKey);
  close.focus();
}

export const COMMANDS = {
  help: {
    desc: "muestra esta ayuda",
    run: () => {
      const visible = Object.entries(COMMANDS).filter(([, c]) => c.desc);
      const w = Math.max(...visible.map(([k]) => k.length));
      return [
        "Comandos disponibles:",
        "",
        ...visible.map(([k, c]) => `  ${k.padEnd(w + 2)}${c.desc}`),
        ""
      ];
    },
  },
  secrets: {
    desc: "muestra el estado de los easter eggs ocultos",
    run: () => {
      const unlocked = JSON.parse(localStorage.getItem('term-secrets') || '[]');
      const SECRETS = {
        doom: "Modo Dios de los años 90",
        matrix: "¿Pastilla azul o pastilla roja?",
        hack: "Acceso no autorizado al mainframe",
        "42": "La respuesta definitiva",
        zelda: "Es peligroso ir solo...",
        hesoyam: "Salud, armadura y dinero en Los Santos",
        pokemon: "Hazte con todos",
        coffee: "Combustible para transformar café en código",
        lumos: "Para iluminar la oscuridad",
        fightclub: "Regla número uno",
        pacman: "El comecocos original",
        rickroll: "Nunca te abandonaré",
        "33": "El piloto más grande de la historia",
      };
      const out = ["Easter Eggs Ocultos:", ""];
      for (const [key, hint] of Object.entries(SECRETS)) {
        if (unlocked.includes(key)) {
          out.push(`  [x] ${key.padEnd(14)} - ${hint}`);
        } else {
          let hiddenKey = key[0];
          for (let i = 1; i < key.length; i++) {
            if (i === key.length - 1 && key.length >= 5) {
              hiddenKey += " " + key[i];
            } else if (i === 1 && key.length >= 7) {
              hiddenKey += " " + key[i];
            } else {
              hiddenKey += " _";
            }
          }
          out.push(`  [ ] ${hiddenKey.padEnd(14)} - ${hint}`);
        }
      }
      return out;
    }
  },
  whoami: {
    desc: "quién soy",
    run: () => [
      "Josep Ferrer Bañuls — Automation & AI Systems Developer.",
      "Web & Mobile Development · Valencia, España 📍",
    ],
  },
  stack: {
    desc: "tecnologías que uso",
    run: () => [
      "Automatización/IA:  n8n · agentes inteligentes · integraciones API",
      "Web:                Next.js · React · Astro · TypeScript · JavaScript",
      "Backend/Datos:      PHP · Supabase · PostgreSQL · SQL",
      "CMS:                WordPress",
      "Móvil:              Kotlin",
      "Otros:              Tailwind CSS · UI/UX",
    ],
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
      "Desarrollador especializado en automatización, integraciones e IA",
      "aplicada a negocio. Construyo sistemas digitales completos: webs,",
      "plataformas, apps móviles y automatizaciones que conectan",
      "herramientas, centralizan datos y eliminan tareas manuales.",
      "",
      "Frontend y backend: Next.js, JavaScript, PHP, WordPress y Kotlin",
      "para móvil. APIs, bases de datos e integraciones entre servicios.",
      "Automatizaciones con n8n. Base sólida en UI/UX.",
      "",
      "Ahora enfocado en automatización inteligente, agentes de IA e",
      "integración de modelos dentro de flujos reales, no experimentales.",
    ],
  },
  contact: {
    desc: "cómo contactarme",
    run: () => "✉️  josepferrer99@gmail.com",
  },
  social: {
    desc: "mis perfiles",
    run: () => [
      "GitHub:    github.com/Josep02",
      "LinkedIn:  linkedin.com/in/ferrerjosep",
      "Instagram: instagram.com/josepferreer_",
    ],
  },
  cv: {
    desc: "descarga mi currículum en PDF",
    run: () => {
      const link = document.createElement("a");
      link.href = `${BASE}cv.pdf`;
      link.download = "Josep_Ferrer_CV.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return "Descargando CV... 📄  (sí, puedo incorporarme de inmediato)";
    }
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
  clear: { desc: "limpia la pantalla", run: () => "\0CLEAR" },

  // ---- Easter eggs (sin desc: no salen en 'help') -------------
  sudo: {
    run: (args) =>
      args.join(" ").includes("rm -rf")
        ? ["", "Error 404: Sistema destruido. Por favor recargue la página. 💥", ""]
        : "El incidente será reportado. (Es broma, buen intento 😉)",
  },
  exit: { run: () => "Proceso finalizado. Es broma, ¡aún queda mucho por ver! 😎" },
  emacs: { run: () => "Emacs es un gran sistema operativo… solo le falta un buen editor 🙃" },
  ping: { run: () => "pong 🏓" },
  "42": { run: () => "La respuesta a la vida, el universo y todo lo demás. 🌌" },
  mario: { run: () => "It's-a me, Mario! 🍄 (Tu código limpio está en otro castillo)" },
  zelda: { run: () => "It's dangerous to go alone! Take this. 🗡️" },
  doom: { run: () => "Modo Dios activado. Ahora tu código compilará a la primera. 👹" },
  hesoyam: { run: () => "Cheat activado: $250,000 añadidos para invertir en mi próxima startup. 💸" },
  pokemon: { run: () => "¡Un Bug salvaje ha aparecido! Josep usó 'Console.log'... ¡Es muy efectivo! 👾" },
  fightclub: { run: () => "La primera regla del portfolio es: no se habla del portfolio. 🥊" },
  pacman: { run: () => "Waka waka waka... 🟡👻" },
  lumos: {
    run: () => {
      term.classList.add("lumos");
      setTimeout(() => term.classList.remove("lumos"), 3000);
      return "Lumos Máxima. 🪄";
    }
  },
  rickroll: {
    run: () => {
      openVideoModal("dQw4w9WgXcQ", "never-gonna-give-you-up.mp4");
      return "Never gonna give you up... 🎶";
    }
  },
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

export const ALIASES = {
  "cat stack.txt": "stack",
  "ls": "projects",
  "ls proyectos/": "projects",
  "ls -la": "projects",
  "cat about.txt": "about",
  "curriculum": "cv",
  "resume": "cv",
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
  "iddqd": "doom",
  "gta": "hesoyam",
  "pikachu": "pokemon",
};
