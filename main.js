/* ====== HUBTECH INDUSTRIAL JS ====== */

// ── Lenis Smooth Scroll ───────────────────────────────────
const lenis = new Lenis({ lerp: 0.08, smooth: true });
function rafLoop(time) { lenis.raf(time); requestAnimationFrame(rafLoop); }
requestAnimationFrame(rafLoop);

// Scroll progress bar
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    if (progressBar) progressBar.style.width = pct + '%';
});

// ── Navbar scroll state ───────────────────────────────────
const navbar = document.querySelector('nav');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── Custom Cursor ─────────────────────────────────────────
const cursor = document.getElementById('custom-cursor');
let cx = 0, cy = 0;
document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.12, ease: 'power2.out' });
});
document.querySelectorAll('a, button, .service-item, .pricing-card, .case-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('big'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
});

// ── WebGL Hero Visual ─────────────────────────────────────
const canvas = document.getElementById('hero-canvas');
const gl = canvas && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
if (gl) {
    let W, H;
    function resizeCanvas() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
        gl.viewport(0, 0, W, H);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const vs = `attribute vec2 a_pos; void main(){ gl_Position=vec4(a_pos,0.,1.); }`;
    const fs = `
    precision mediump float;
    uniform float u_time; uniform vec2 u_res; uniform vec2 u_mouse;
    void main(){
      vec2 uv = gl_FragCoord.xy/u_res;
      vec2 m = u_mouse;
      float d1 = length(uv - vec2(0.5+sin(u_time*.4)*.2, 0.5+cos(u_time*.3)*.2));
      float d2 = length(uv - m);
      float g1 = 0.12/d1;
      float g2 = 0.06/max(d2,.01);
      vec3 orange = vec3(1.,.36,.13);
      vec3 col = (orange*g1 + orange*g2*.5)*0.25;
      gl_FragColor = vec4(col,1.);
    }`;
    function shader(type, src) {
        const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    let mx = 0.5, my = 0.5, t = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX / window.innerWidth; my = 1 - e.clientY / window.innerHeight; });
    (function loop() {
        t += 0.015;
        gl.uniform1f(uTime, t);
        gl.uniform2f(uRes, W, H);
        gl.uniform2f(uMouse, mx, my);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(loop);
    })();
}

// ── GSAP Scroll Animations ────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// Hero entrance
gsap.from('.hero-content > *', {
    y: 60, opacity: 0, duration: 1.2, stagger: 0.15,
    ease: 'expo.out', delay: 0.3
});

// Service cards
gsap.fromTo('.service-item',
    { opacity: 0, y: 40 },
    {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.services-grid', start: 'top 80%' }
    }
);

// Team cards
gsap.fromTo('.team-card',
    { opacity: 0, y: 40 },
    {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.team-grid', start: 'top 80%' }
    }
);

// Pricing cards — use '.pricing-panel:not([style*="none"]) .pricing-card' to only hit visible panel
document.querySelectorAll('.pricing-card').forEach(card => {
    card.style.opacity = '1'; // ensure visible immediately as fallback
});
gsap.fromTo('.pricing-panel:not([style*="none"]) .pricing-card',
    { opacity: 0, y: 40 },
    {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.pricing', start: 'top 60%' }
    }
);

// Case cards
gsap.fromTo('.case-card',
    { opacity: 0, y: 30 },
    {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: '.cases-grid', start: 'top 80%' }
    }
);

// Section titles
gsap.utils.toArray('.section-title').forEach(el => {
    gsap.fromTo(el,
        { opacity: 0, y: 50 },
        {
            opacity: 1, y: 0, duration: 1, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 85%' }
        }
    );
});

// Hero parallax
document.addEventListener('mousemove', e => {
    const xVal = (e.clientX / window.innerWidth - 0.5) * 20;
    const yVal = (e.clientY / window.innerHeight - 0.5) * 20;
    gsap.to('.hero-visual', { x: xVal, y: yVal, duration: 2, ease: 'power2.out' });
});

// ── Scroll Reveal fallback ────────────────────────────────
const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

// ── Pricing Tabs ──────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.pricing-panel').forEach(p => {
            p.style.display = p.dataset.panel === btn.dataset.tab ? 'grid' : 'none';
        });
    });
});

// ── Cases Filter ──────────────────────────────────────────
document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        document.querySelectorAll('.case-card').forEach(card => {
            const show = cat === 'all' || card.dataset.cat === cat;
            card.style.display = show ? 'block' : 'none';
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

// ── Counter Animation ─────────────────────────────────────
function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    let current = 0; const step = target / 60;
    const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current) + suffix;
        if (current >= target) clearInterval(timer);
    }, 20);
}
const statObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.querySelectorAll('[data-target]').forEach(el => animateCounter(el));
            statObs.unobserve(e.target);
        }
    });
}, { threshold: 0.5 });
const statsEl = document.querySelector('.hero-stats');
if (statsEl) statObs.observe(statsEl);

// ── Form Submit ───────────────────────────────────────────
const form = document.querySelector('#contact-form');
form?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.querySelector('span').textContent = '✓ Отправлено!';
    btn.style.background = 'var(--accent)';
    btn.style.color = '#080808';
    setTimeout(() => {
        btn.querySelector('span').textContent = 'Отправить заявку';
        btn.style.background = ''; btn.style.color = '';
        form.reset();
    }, 3000);
});

// ── Team Slider (Swiper) ───────────────────────────────────
new Swiper('.team-slider', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.team-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.team-nav-next',
        prevEl: '.team-nav-prev',
    },
    breakpoints: {
        768: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        }
    }
});
