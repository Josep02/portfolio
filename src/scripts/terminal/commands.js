import { BASE, term } from "./state.js";
import { hackRun, matrixRun, nanoRun } from "./animations.js";

const P = [
  ["cromoverse", "SaaS multi-tenant de cromos digitales (Next.js 16 + Supabase)"],
  ["mkgenia", "Web de agencia de automatización con IA (Next.js 14)"],
  ["crm-inmobiliario", "CRM a medida con roles y permisos (Next.js 15 + Supabase)"],
];

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
        konami: "Código famoso de Konami para vidas infinitas",
        doom: "Invocar a un Dios con IDDQD",
        matrix: "Entrar en el mundo de Neo",
        hack: "Hackear el servidor de la NASA",
        "42": "La respuesta a la vida, el universo y todo",
        zelda: "It's dangerous to go alone!",
        hesoyam: "Truco para $250,000 en GTA San Andreas",
        pokemon: "Un monstruo de bolsillo salvaje ha aparecido",
        coffee: "Bebida indispensable para programar",
        vim: "El editor del que nadie sabe cómo salir",
      };
      const out = ["Easter Eggs Ocultos:", ""];
      for (const [key, hint] of Object.entries(SECRETS)) {
        if (unlocked.includes(key)) {
          out.push(`  [x] ${key.padEnd(14)} - ${hint}`);
        } else {
          const hiddenKey = key[0] + " " + "_ ".repeat(key.length - 1).trim();
          out.push(`  [ ] ${hiddenKey.padEnd(14)} - ${hint}`);
        }
      }
      return out;
    }
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
  konami: { run: () => "↑ ↑ ↓ ↓ ← → ← → B A. Has desbloqueado vidas infinitas. 🎮" },
  mario: { run: () => "It's-a me, Mario! 🍄 (Tu princesa está en otro castillo)" },
  zelda: { run: () => "It's dangerous to go alone! Take this. 🗡️" },
  doom: { run: () => "IDDQD. Modo Dios activado. 👹" },
  hesoyam: { run: () => "HESOYAM activado. Salud, armadura y $250,000 añadidos. 💰🚗" },
  pokemon: { run: () => "¡Un Pokémon salvaje ha aparecido! 👾 (Ojalá tuviera una Pokéball)" },
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
  "konami code": "konami",
  "iddqd": "doom",
  "gta": "hesoyam",
  "pikachu": "pokemon",
};
