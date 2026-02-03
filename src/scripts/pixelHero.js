// ------------------------
// Canvas y variables
// ------------------------
const canvas = document.getElementById("pixel-canvas");
const ctx = canvas.getContext("2d");
const section = document.getElementById("pixel-section");

let w, h;
let particles = [];
let mouse = { x: 0, y: 0 };

// ------------------------
// Altura configurable
// ------------------------
const CANVAS_HEIGHT = 700;
let CENTER_X = null;
let CENTER_Y = 350;
let CENTER_RADIUS = 200;

// ------------------------
// Configuración personalizable
// ------------------------
const TEXT_LINES = [
    { text: "bienvenido a mi", yOffset: -50 },
    { text: "portfolio.", yOffset: 50 },
];

const FONT_SIZE = 120;
const GAP = 4;
const TEXT_SPEED = 0.05;
const COLORS = ["#ffffff", "#929292ff", "#575757ff"];
const BACKGROUND_COLOR = "#0c0c0c";
const STAR_CHANCE = 0.2;
const MAX_STAR_BLUR = 5;

// ------------------------
// Control de dispersión central
// ------------------------
let CENTER_DENSITY = 0.2;

// ------------------------
// Efecto parpadeo tipo luciérnaga
// ------------------------
const BLINK_CHANCE = 0.2; // 15% de partículas tendrán este efecto

// ------------------------
// Función Gaussiana
// ------------------------
function randomGaussian(mean, stdDev) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + num * stdDev;
}

// ------------------------
// Redimensionar canvas
// ------------------------
function resize() {
    const style = getComputedStyle(section);
    const paddingLeft = parseFloat(style.paddingLeft);
    const paddingRight = parseFloat(style.paddingRight);

    w = canvas.width = window.innerWidth - paddingLeft - paddingRight;
    h = canvas.height = CANVAS_HEIGHT;

    canvas.style.left = `${paddingLeft}px`;
    canvas.style.top = `0px`;

    if (CENTER_X === null) CENTER_X = w / 2;
    if (CENTER_Y === null) CENTER_Y = h / 2;

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
    ctx.font = `bold ${FONT_SIZE}px 'Bitcount Single', monospace`;

    TEXT_LINES.forEach((line) => {
        const y = CENTER_Y + (line.yOffset || 0);
        const x = CENTER_X + (line.xOffset || 0);
        ctx.fillText(line.text, x, y);
    });

    const imageData = ctx.getImageData(0, 0, w, h).data;
    ctx.clearRect(0, 0, w, h);

    const stdDevX = (w / 2) * CENTER_DENSITY;
    const stdDevY = (h / 2) * CENTER_DENSITY;

    for (let y = 0; y < h; y += GAP) {
        for (let x = 0; x < w; x += GAP) {
            const alpha = imageData[(y * w + x) * 4 + 3];
            if (alpha > 128) {
                let px = Math.min(Math.max(randomGaussian(CENTER_X, stdDevX), 0), w);
                let py = Math.min(Math.max(randomGaussian(CENTER_Y, stdDevY), 0), h);

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
                    starBlur: Math.random() * MAX_STAR_BLUR + 2,
                    blink: Math.random() < BLINK_CHANCE, // particula con luciérnaga
                    blinkOffset: Math.random() * Math.PI * 2 // fase inicial
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

    if (p.x < 0) p.x = 0;
    if (p.x > w) p.x = w;
    if (p.y < 0) p.y = 0;
    if (p.y > h) p.y = h;
}

function attractParticle(p) {
    p.x += (p.tx - p.x) * TEXT_SPEED;
    p.y += (p.ty - p.y) * TEXT_SPEED;
}

// ------------------------
// Detectar cursor
// ------------------------
window.addEventListener("mousemove", e => {
    mouse.x = e.clientX - parseFloat(getComputedStyle(section).paddingLeft);
    mouse.y = e.clientY - parseFloat(getComputedStyle(section).paddingTop);
});

// ------------------------
// Loop de animación
// ------------------------
let frame = 0;
function animate() {
    frame += 0.05; // para el efecto luciérnaga

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, w, h);

    const dx = mouse.x - CENTER_X;
    const dy = mouse.y - CENTER_Y;
    const dist = Math.hypot(dx, dy);

    const formingText = dist < CENTER_RADIUS;

    particles.forEach(p => {
        if (formingText) {
            attractParticle(p);
        } else {
            floatParticle(p);
        }

        let alpha = 1;
        if (p.blink) {
            // parpadeo suave tipo luciérnaga
            alpha = 0.5 + 0.5 * Math.sin(frame + p.blinkOffset);
        }

        if (p.star) {
            ctx.shadowBlur = p.starBlur;
            ctx.shadowColor = p.color;
        } else {
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha; // aplicar parpadeo
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1; // reset
    });

    requestAnimationFrame(animate);
}

// ------------------------
// Iniciar
// ------------------------
resize();
animate();
