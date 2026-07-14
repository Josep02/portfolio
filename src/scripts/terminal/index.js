import { body, term } from "./state.js";
import { print, printPrompt, scroll, cursor } from "./core.js";
import { typeIntro } from "./animations.js";
import { COMMANDS, ALIASES } from "./commands.js";

if (body && term) {
  // ---- Ejecutor --------------------------------------------------
  async function exec(raw, inputElement) {
    const input = raw.trim();
    if (!input) return;
    const key = input.toLowerCase();
    const resolved = ALIASES[key] || key;

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

    const isSecret = [
      "konami", "doom", "matrix", "hack", "42", "zelda", "hesoyam", "pokemon", "coffee", "vim"
    ].includes(resolved);

    if (isSecret) {
      const unlocked = JSON.parse(localStorage.getItem('term-secrets') || '[]');
      if (!unlocked.includes(resolved)) {
        unlocked.push(resolved);
        localStorage.setItem('term-secrets', JSON.stringify(unlocked));
      }
    }

    const out = await cmd.run(args, inputElement.value);
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
  let typed = null;

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
    exec(v, input).then(newLine);
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

  term.addEventListener("click", () => input.focus());

  // Iniciar la terminal
  typeIntro(input).then((t) => { typed = t; });
}
