// Genera public/cv.pdf imprimiendo la página /cv con Chrome headless.
// Requiere `npm run build` antes (imprime sobre dist/).
//
// Sirve dist/ por HTTP en vez de abrir el HTML con file://: el CSS se
// enlaza como ruta absoluta (/portfolio/_astro/...) y con file:// eso
// resuelve fuera del proyecto, así que el PDF saldría sin estilos.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { resolve, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const out = resolve(root, "public/cv.pdf");
const BASE = "/portfolio";

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

const chrome = process.env.CHROME_PATH ?? CHROME_CANDIDATES.find((p) => existsSync(p));

if (!chrome) {
  console.error("No se encontró Chrome. Define CHROME_PATH con la ruta al ejecutable.");
  process.exit(1);
}
if (!existsSync(join(dist, "cv/index.html"))) {
  console.error("No existe dist/cv/index.html. Ejecuta 'npm run build' primero.");
  process.exit(1);
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json",
};

const server = createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (path.startsWith(BASE)) path = path.slice(BASE.length);

  let file = join(dist, path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");

  if (!existsSync(file)) {
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});

mkdirSync(dirname(out), { recursive: true });

server.listen(0, "127.0.0.1", () => {
  const { port } = server.address();
  const url = `http://127.0.0.1:${port}${BASE}/cv/`;

  const proc = spawn(
    chrome,
    [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--no-pdf-header-footer",
      "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=4000", // deja cargar las fuentes self-hosted
      `--print-to-pdf=${out}`,
      url,
    ],
    { stdio: "inherit" }
  );

  proc.on("exit", (code) => {
    server.close();
    if (code === 0) console.log(`✓ CV generado en ${out}`);
    else console.error(`Chrome salió con código ${code}`);
    process.exit(code ?? 1);
  });
});
