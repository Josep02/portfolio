import { body, PROMPT } from "./state.js";

export function line(cls) {
  const el = document.createElement("div");
  if (cls) el.className = cls;
  body.appendChild(el);
  return el;
}

export function scroll() {
  body.scrollTop = body.scrollHeight;
}

export function print(text = "", cls = "term-out") {
  String(text)
    .split("\n")
    .forEach((t) => {
      const el = line(cls);
      el.textContent = t;
    });
  scroll();
}

export function printPrompt(cmd) {
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

export const cursor = document.createElement("span");
cursor.className = "term-cursor";
