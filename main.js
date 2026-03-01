/* ====== HUBTECH MAIN JS ====== */

// ── Cursor ──────────────────────────────────────────────
const cursor = document.querySelector('.cursor');
const ring = document.querySelector('.cursor-ring');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px';
});

function animRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px'; ring.style.top = ringY + 'px';
    requestAnimationFrame(animRing);
}
animRing();

document.querySelectorAll('a, button, .service-card, .pricing-card, .case-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
});

// ── WebGL Canvas ─────────────────────────────────────────
const canvas = document.getElementById('bg-canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

if (gl) {
    let W, H;
    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        gl.viewport(0, 0, W, H);
    }
    window.addEventListener('resize', resize); resize();

    const vs = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;
    const fs = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_res;
    uniform vec2 u_mouse;
    void main(){
      vec2 uv = gl_FragCoord.xy / u_res;
      vec2 mouse = u_mouse / u_res;
      float d1 = length(uv - vec2(0.75 + sin(u_time*0.25)*0.12, 0.2 + cos(u_time*0.2)*0.08));
      float d2 = length(uv - vec2(0.2 + cos(u_time*0.18)*0.1, 0.75 + sin(u_time*0.3)*0.1));
      float d3 = length(uv - mouse);
      float g1 = 0.08 / d1;
      float g2 = 0.06 / d2;
      float g3 = 0.03 / max(d3, 0.01);
      vec3 lime = vec3(0.78, 1.0, 0.0);
      vec3 c1 = lime * g1;
      vec3 c2 = lime * g2 * 0.6;
      vec3 c3 = lime * g3 * 0.4;
      vec3 col = (c1 + c2 + c3) * 0.12;
      gl_FragColor = vec4(col, 1.0);
    }
  `;

    function makeShader(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src); gl.compileShader(s); return s;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, makeShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, makeShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog); gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    let mx = W / 2, my = H / 2;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = H - e.clientY; });

    let t = 0;
    (function loop() {
        t += 0.016;
        gl.uniform1f(uTime, t);
        gl.uniform2f(uRes, W, H);
        gl.uniform2f(uMouse, mx / W, my / H);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(loop);
    })();
}

// ── Floating Particles ───────────────────────────────────
function spawnParticle() {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 1;
    const duration = Math.random() * 12 + 8;
    const isBlue = Math.random() > 0.5;
    p.style.cssText = `
    width:${size}px; height:${size}px; left:${Math.random() * 100}vw;
    bottom:-10px; opacity:${Math.random() * 0.25 + 0.05};
    background:#c8ff00;
    animation-duration:${duration}s; animation-delay:0s;
    box-shadow: 0 0 ${size * 2}px #c8ff00;
  `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), duration * 1000);
}
setInterval(spawnParticle, 800);

// ── Scroll Reveal ─────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); }
    });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── Navbar Scroll ─────────────────────────────────────────
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ── Kinetic Counter Animation ─────────────────────────────
function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current) + suffix;
        if (current >= target) clearInterval(timer);
    }, 20);
}
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.querySelectorAll('.stat-num').forEach(el => animateCounter(el));
            statObserver.unobserve(e.target);
        }
    });
}, { threshold: 0.5 });
const statsEl = document.querySelector('.hero-stats');
if (statsEl) statObserver.observe(statsEl);

// ── Magnetic Buttons ──────────────────────────────────────
document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - rect.left - rect.width / 2;
        const dy = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px) translateY(-3px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
});

// ── Pricing Tabs ──────────────────────────────────────────
const tabBtns = document.querySelectorAll('.tab-btn');
const pricingGrids = document.querySelectorAll('.pricing-panel');
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        pricingGrids.forEach(g => {
            g.style.display = g.dataset.panel === btn.dataset.tab ? 'grid' : 'none';
        });
    });
});

// ── Cases Filter ──────────────────────────────────────────
const catBtns = document.querySelectorAll('.cat-btn');
const caseCards = document.querySelectorAll('.case-card');
catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        caseCards.forEach(card => {
            const show = cat === 'all' || card.dataset.cat === cat;
            card.style.display = show ? 'block' : 'none';
            if (show) {
                card.style.opacity = '0'; card.style.transform = 'translateY(20px)';
                setTimeout(() => { card.style.transition = 'all 0.4s ease'; card.style.opacity = '1'; card.style.transform = ''; }, 50);
            }
        });
    });
});

// ── Mobile Nav ────────────────────────────────────────────
const burger = document.querySelector('.burger');
const mobileNav = document.querySelector('.mobile-nav');
const closeNav = document.querySelector('.close-nav');
burger?.addEventListener('click', () => mobileNav.classList.add('open'));
closeNav?.addEventListener('click', () => mobileNav.classList.remove('open'));
mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

// ── Form Submit ───────────────────────────────────────────
const form = document.querySelector('.order-form form');
form?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.textContent = '✓ Отправлено!';
    btn.style.background = 'linear-gradient(135deg, #10b981, #06b6d4)';
    setTimeout(() => {
        btn.textContent = 'Отправить заявку';
        btn.style.background = '';
        form.reset();
    }, 3000);
});

// ── Scroll Progress Bar ───────────────────────────────────
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position:fixed; top:0; left:0; height:2px; z-index:2000;
  background:#c8ff00;
  transition:width 0.1s; width:0%;
`;
document.body.appendChild(progressBar);
window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    progressBar.style.width = pct + '%';
});

// ── Parallax Hero ─────────────────────────────────────────
window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const heroGlow1 = document.querySelector('.hero-glow-1');
    const heroGlow2 = document.querySelector('.hero-glow-2');
    if (heroGlow1) heroGlow1.style.transform = `translateY(${y * 0.3}px)`;
    if (heroGlow2) heroGlow2.style.transform = `translateY(${y * 0.2}px)`;
});

// ── Kinetic Title Letters ─────────────────────────────────
document.querySelectorAll('.kinetic-letters').forEach(el => {
    const text = el.textContent;
    el.innerHTML = text.split('').map((ch, i) =>
        `<span style="display:inline-block;animation:letterFloat ${1.5 + i * 0.05}s ease-in-out ${i * 0.03}s infinite alternate">${ch === ' ' ? '&nbsp;' : ch}</span>`
    ).join('');
});
const style = document.createElement('style');
style.textContent = `@keyframes letterFloat { from { transform: translateY(0); } to { transform: translateY(-6px); } }`;
document.head.appendChild(style);
