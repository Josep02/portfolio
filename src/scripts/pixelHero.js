// ------------------------
// Canvas y variables
// ------------------------
const canvas = document.getElementById("pixel-canvas");
const ctx = canvas.getContext("2d");

let w, h;
let particles = [];
let mouse = { x: 0, y: 0 };
let CENTER_RADIUS = 200;

// ------------------------
// Configuración personalizable
// ------------------------
const TEXT_LINES = ["bienvenido a mi", "portfolio."];
const FONT_SIZE = 100;
const GAP = 4;
const TEXT_SPEED = 0.05;
const COLORS = ["#ffffff", "#c5c5c5ff", "#575757ff"];
const BACKGROUND_COLOR = "#0c0c0c";
const STAR_CHANCE = 0.2;
const MAX_STAR_BLUR = 5;

// ------------------------
// Control de dispersión central
// ------------------------
let CENTER_DENSITY = 0.2; // cuanto menor, más concentradas en el centro
let EDGE_MARGIN = 50;     // margen mínimo alrededor de la pantalla

// Función para generar números con distribución normal (Gauss) centrada
function randomGaussian(mean, stdDev) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + num * stdDev;
}

// ------------------------
// Redimensionar
// ------------------------
function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    initParticles();
}

window.addEventListener("resize", resize);

// ------------------------
// Inicializar partículas
// ------------------------
function initParticles() {
    particles = [];

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    //ctx.font = `bold ${FONT_SIZE}px sans-serif`;
    //ctx.font = `bold ${FONT_SIZE}px 'Inter', sans-serif`;
    ctx.font = `bold ${FONT_SIZE}px 'Bitcount Single', monospace`;


    const lineHeight = FONT_SIZE * 1.2;
    TEXT_LINES.forEach((line, i) => {
        const y = h / 2 + (i - TEXT_LINES.length / 2 + 0.5) * lineHeight;
        ctx.fillText(line, w / 2, y);
    });

    const imageData = ctx.getImageData(0, 0, w, h).data;
    ctx.clearRect(0, 0, w, h);

    // desviación estándar basada en el tamaño del canvas
    const stdDevX = (w / 2) * CENTER_DENSITY;
    const stdDevY = (h / 2) * CENTER_DENSITY;

    for (let y = EDGE_MARGIN; y < h - EDGE_MARGIN; y += GAP) {
        for (let x = EDGE_MARGIN; x < w - EDGE_MARGIN; x += GAP) {
            const alpha = imageData[(y * w + x) * 4 + 3];
            if (alpha > 128) {
                // Genera posición inicial más centrada
                let px = Math.min(Math.max(randomGaussian(w / 2, stdDevX), EDGE_MARGIN), w - EDGE_MARGIN);
                let py = Math.min(Math.max(randomGaussian(h / 2, stdDevY), EDGE_MARGIN), h - EDGE_MARGIN);

                particles.push({
                    x: px,
                    y: py,
                    tx: x,
                    ty: y,
                    size: Math.random() * 1.5 + 0.5,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    star: Math.random() < STAR_CHANCE,
                    starBlur: Math.random() * MAX_STAR_BLUR + 2
                });
            }
        }
    }
}

// ------------------------
// Movimiento partículas
// ------------------------
function floatParticle(p) {
    p.vx += (Math.random() - 0.5) * 0.02;
    p.vy += (Math.random() - 0.5) * 0.02;

    p.vx *= 0.98;
    p.vy *= 0.98;

    p.x += p.vx;
    p.y += p.vy;

    // Mantener dentro del margen
    if (p.x < EDGE_MARGIN) p.x = EDGE_MARGIN;
    if (p.x > w - EDGE_MARGIN) p.x = w - EDGE_MARGIN;
    if (p.y < EDGE_MARGIN) p.y = EDGE_MARGIN;
    if (p.y > h - EDGE_MARGIN) p.y = h - EDGE_MARGIN;
}

function attractParticle(p) {
    p.x += (p.tx - p.x) * TEXT_SPEED;
    p.y += (p.ty - p.y) * TEXT_SPEED;
}

// ------------------------
// Detectar cursor
// ------------------------
window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// ------------------------
// Loop de animación
// ------------------------
function animate() {
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, w, h);

    const dx = mouse.x - w / 2;
    const dy = mouse.y - h / 2;
    const dist = Math.hypot(dx, dy);

    const formingText = dist < CENTER_RADIUS;

    particles.forEach(p => {
        if (formingText) {
            attractParticle(p);
        } else {
            floatParticle(p);
        }

        if (p.star) {
            ctx.shadowBlur = p.starBlur;
            ctx.shadowColor = p.color;
        } else {
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    requestAnimationFrame(animate);
}

// ------------------------
// Iniciar
// ------------------------
resize();
animate();
