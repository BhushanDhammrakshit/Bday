/* ============================================
   Birthday Countdown — Main Script
   ============================================ */

(() => {
  'use strict';

  // -------- Floating hearts background --------
  const heartsBg = document.getElementById('heartsBg');
  const heartEmojis = ['💗', '💖', '💕', '💞', '🌸', '✨'];
  function spawnHeart() {
    const h = document.createElement('span');
    h.className = 'heart';
    h.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    h.style.left = Math.random() * 100 + 'vw';
    h.style.fontSize = (0.8 + Math.random() * 1.6) + 'rem';
    h.style.animationDuration = (8 + Math.random() * 10) + 's';
    h.style.opacity = (0.4 + Math.random() * 0.5).toFixed(2);
    heartsBg.appendChild(h);
    setTimeout(() => h.remove(), 20000);
  }
  for (let i = 0; i < 14; i++) setTimeout(spawnHeart, i * 600);
  setInterval(spawnHeart, 1200);

  // -------- Countdown --------
  const target = new Date(TARGET_BIRTHDAY).getTime();
  const elDays = document.getElementById('days');
  const elHours = document.getElementById('hours');
  const elMinutes = document.getElementById('minutes');
  const elSeconds = document.getElementById('seconds');
  const revealSection = document.getElementById('revealSection');
  let revealed = false;

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      elDays.textContent = '00';
      elHours.textContent = '00';
      elMinutes.textContent = '00';
      elSeconds.textContent = '00';
      if (!revealed) {
        revealed = true;
        revealSection.classList.remove('hidden');
        launchConfetti(8000);
      }
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMinutes.textContent = pad(minutes);
    elSeconds.textContent = pad(seconds);
  }
  tick();
  setInterval(tick, 1000);

  // -------- Build timeline --------
  const container = document.getElementById('timelineContainer');
  const todayStr = new Date().toISOString().slice(0, 10);

  MEMORIES.forEach((mem, idx) => {
    const card = document.createElement('article');
    card.className = 'memory-card ' + (idx % 2 === 0 ? 'left' : 'right');

    const isLocked = mem.date > todayStr;
    if (isLocked) {
      card.classList.add('locked');
      const d = new Date(mem.date + 'T00:00:00');
      card.dataset.unlock = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    const dateLabel = new Date(mem.date + 'T00:00:00')
      .toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' });

    card.innerHTML = `
      <span class="memory-date">${dateLabel}</span>
      <img class="memory-img" src="${mem.image}" alt="${mem.title}"
           onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22><defs><linearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%221%22 y2=%221%22><stop offset=%220%22 stop-color=%22%23ffc2d9%22/><stop offset=%221%22 stop-color=%22%23ff7aa6%22/></linearGradient></defs><rect width=%22400%22 height=%22300%22 fill=%22url(%23g)%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2280%22>💖</text></svg>'" />
      <h3 class="memory-title">${mem.title}</h3>
      <p class="memory-text">${mem.text}</p>
    `;
    container.appendChild(card);
  });

  // -------- Reveal-on-scroll --------
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.memory-card').forEach(c => observer.observe(c));

  // -------- Confetti --------
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  let confettiPieces = [];
  let confettiActive = false;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const colors = ['#ff4d8d', '#ff7aa6', '#ffd700', '#ffc2d9', '#e91e63', '#ffffff'];

  function launchConfetti(durationMs = 5000) {
    confettiPieces = [];
    for (let i = 0; i < 180; i++) {
      confettiPieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        r: 4 + Math.random() * 6,
        c: colors[Math.floor(Math.random() * colors.length)],
        vy: 2 + Math.random() * 4,
        vx: -2 + Math.random() * 4,
        rot: Math.random() * Math.PI,
        vr: -0.1 + Math.random() * 0.2
      });
    }
    if (!confettiActive) {
      confettiActive = true;
      requestAnimationFrame(drawConfetti);
    }
    setTimeout(() => { confettiActive = false; }, durationMs);
  }

  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiPieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
      ctx.restore();
    });
    if (confettiActive) {
      requestAnimationFrame(drawConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // -------- Make a wish button --------
  const wishBtn = document.getElementById('celebrateBtn');
  if (wishBtn) {
    wishBtn.addEventListener('click', () => launchConfetti(6000));
  }

  // -------- Dev helper: trigger reveal manually with ?reveal=1 --------
  if (new URLSearchParams(location.search).get('reveal') === '1') {
    revealSection.classList.remove('hidden');
    launchConfetti(6000);
  }
})();
