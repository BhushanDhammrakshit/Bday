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

  // Use LOCAL date (not UTC) so memories unlock at local midnight
  // Dev override: ?today=YYYY-MM-DD or ?unlock=all
  const _params = new URLSearchParams(location.search);
  const _override = _params.get('today');
  const _unlockAll = _params.get('unlock') === 'all';
  function getTodayStr() {
    if (_unlockAll) return '9999-12-31';
    if (_override) return _override;
    const n = new Date();
    return n.getFullYear() + '-' +
      String(n.getMonth() + 1).padStart(2, '0') + '-' +
      String(n.getDate()).padStart(2, '0');
  }

  const cardRefs = []; // { card, date }

  MEMORIES.forEach((mem, idx) => {
    const card = document.createElement('article');
    card.className = 'memory-card ' + (idx % 2 === 0 ? 'left' : 'right');
    card.dataset.date = mem.date;

    const d = new Date(mem.date + 'T00:00:00');
    card.dataset.unlock = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    const dateLabel = d.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' });

    card.innerHTML = `
      <span class="memory-date">${dateLabel}</span>
      <img class="memory-img" src="${mem.image}" alt="${mem.title}"
           onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22><defs><linearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%221%22 y2=%221%22><stop offset=%220%22 stop-color=%22%23ffc2d9%22/><stop offset=%221%22 stop-color=%22%23ff7aa6%22/></linearGradient></defs><rect width=%22400%22 height=%22300%22 fill=%22url(%23g)%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2280%22>💖</text></svg>'" />
      <h3 class="memory-title">${mem.title}</h3>
      <p class="memory-text">${mem.text}</p>
      ${idx === 1 ? '<button type="button" class="play-c4-btn" data-c4-open>Play Connect 4 🎮</button>' : ''}
      ${idx === 2 ? '<button type="button" class="play-bf-btn" data-bf-open>Catch Butterflies 🦋</button>' : ''}
    `;
    container.appendChild(card);
    cardRefs.push({ card, date: mem.date });
  });

  // Re-evaluate locks every minute so memories unlock live at local midnight
  function refreshLocks() {
    const todayStr = getTodayStr();
    cardRefs.forEach(({ card, date }) => {
      const locked = date > todayStr;
      card.classList.toggle('locked', locked);
    });
  }
  refreshLocks();
  setInterval(refreshLocks, 60 * 1000);

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

  // ============================================
  // Connect 4 Game (You = pink ♥, Bot = gold ⭐)
  // ============================================
  const ROWS = 6, COLS = 7;
  const PLAYER = 1, BOT = 2;
  let board, gameOver, busy;

  const c4Modal   = document.getElementById('c4Modal');
  const c4BoardEl = document.getElementById('c4Board');
  const c4Status  = document.getElementById('c4Status');
  const c4Close   = document.getElementById('c4Close');
  const c4Restart = document.getElementById('c4Restart');
  const c4DiffBtns = document.querySelectorAll('.c4-diff-btn');

  // Bot difficulty: 'easy' | 'medium' | 'hard'
  let c4Difficulty = 'medium';

  function newBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }

  function renderBoard(winningCells = []) {
    c4BoardEl.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('button');
        cell.className = 'c4-cell';
        cell.type = 'button';
        cell.dataset.col = c;
        const v = board[r][c];
        if (v === PLAYER) cell.classList.add('you');
        else if (v === BOT) cell.classList.add('bot');
        if (winningCells.some(([wr, wc]) => wr === r && wc === c)) {
          cell.classList.add('win');
        }
        if (gameOver || v !== 0 || busy) cell.disabled = true;
        cell.addEventListener('click', () => handleClick(c));
        c4BoardEl.appendChild(cell);
      }
    }
  }

  function lowestEmptyRow(b, col) {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (b[r][col] === 0) return r;
    }
    return -1;
  }

  function checkWin(b, player) {
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (b[r][c] !== player) continue;
        for (const [dr, dc] of dirs) {
          const cells = [[r,c]];
          for (let k = 1; k < 4; k++) {
            const nr = r + dr*k, nc = c + dc*k;
            if (nr<0||nr>=ROWS||nc<0||nc>=COLS||b[nr][nc]!==player) break;
            cells.push([nr,nc]);
          }
          if (cells.length === 4) return cells;
        }
      }
    }
    return null;
  }

  function isFull(b) {
    return b[0].every(v => v !== 0);
  }

  // Score a 4-window for bot evaluation
  function scoreWindow(window, player) {
    const opp = player === BOT ? PLAYER : BOT;
    const pc = window.filter(v => v === player).length;
    const oc = window.filter(v => v === opp).length;
    const ec = window.filter(v => v === 0).length;
    if (pc === 4) return 10000;
    if (pc === 3 && ec === 1) return 50;
    if (pc === 2 && ec === 2) return 5;
    if (oc === 3 && ec === 1) return -80; // block priority
    if (oc === 2 && ec === 2) return -3;
    return 0;
  }

  function evaluate(b, player) {
    let score = 0;
    // center column preference
    for (let r = 0; r < ROWS; r++) if (b[r][3] === player) score += 4;
    // horizontal, vertical, diagonals
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (c + 3 < COLS) score += scoreWindow([b[r][c],b[r][c+1],b[r][c+2],b[r][c+3]], player);
        if (r + 3 < ROWS) score += scoreWindow([b[r][c],b[r+1][c],b[r+2][c],b[r+3][c]], player);
        if (r + 3 < ROWS && c + 3 < COLS) score += scoreWindow([b[r][c],b[r+1][c+1],b[r+2][c+2],b[r+3][c+3]], player);
        if (r + 3 < ROWS && c - 3 >= 0)   score += scoreWindow([b[r][c],b[r+1][c-1],b[r+2][c-2],b[r+3][c-3]], player);
      }
    }
    return score;
  }

  function validCols(b) {
    const out = [];
    for (let c = 0; c < COLS; c++) if (b[0][c] === 0) out.push(c);
    return out;
  }

  function cloneAndDrop(b, col, player) {
    const nb = b.map(r => r.slice());
    const r = lowestEmptyRow(nb, col);
    if (r >= 0) nb[r][col] = player;
    return { board: nb, row: r };
  }

  // Minimax with alpha-beta
  function minimax(b, depth, alpha, beta, maximizing) {
    const win = checkWin(b, BOT);
    const lose = checkWin(b, PLAYER);
    if (win) return { score: 1000000 - (5 - depth) };
    if (lose) return { score: -1000000 + (5 - depth) };
    if (depth === 0 || isFull(b)) return { score: evaluate(b, BOT) };

    const cols = validCols(b);
    // Order: center first
    cols.sort((a, c) => Math.abs(3 - a) - Math.abs(3 - c));

    let best = { score: maximizing ? -Infinity : Infinity, col: cols[0] };
    for (const col of cols) {
      const { board: nb, row } = cloneAndDrop(b, col, maximizing ? BOT : PLAYER);
      if (row < 0) continue;
      const { score } = minimax(nb, depth - 1, alpha, beta, !maximizing);
      if (maximizing) {
        if (score > best.score) best = { score, col };
        alpha = Math.max(alpha, score);
      } else {
        if (score < best.score) best = { score, col };
        beta = Math.min(beta, score);
      }
      if (alpha >= beta) break;
    }
    return best;
  }

  function chooseBotCol() {
    const cols = validCols(board);

    // Detect immediate win/block opportunities
    const winNow = cols.find(c => {
      const { board: nb, row } = cloneAndDrop(board, c, BOT);
      return row >= 0 && checkWin(nb, BOT);
    });
    const mustBlock = cols.find(c => {
      const { board: nb, row } = cloneAndDrop(board, c, PLAYER);
      return row >= 0 && checkWin(nb, PLAYER);
    });

    if (c4Difficulty === 'easy') {
      // Mostly random. Occasionally takes an obvious win. Rarely blocks.
      if (winNow !== undefined && Math.random() < 0.5) return winNow;
      if (mustBlock !== undefined && Math.random() < 0.2) return mustBlock;
      return cols[Math.floor(Math.random() * cols.length)];
    }

    if (c4Difficulty === 'medium') {
      // Always wins when it can. Blocks often. Sometimes plays strategically.
      if (winNow !== undefined) return winNow;
      if (mustBlock !== undefined && Math.random() < 0.7) return mustBlock;
      if (Math.random() < 0.6) {
        const { col } = minimax(board, 2, -Infinity, Infinity, true);
        if (col !== undefined && cols.includes(col)) return col;
      }
      return cols[Math.floor(Math.random() * cols.length)];
    }

    // hard: deep minimax search, always wins/blocks
    if (winNow !== undefined) return winNow;
    if (mustBlock !== undefined) return mustBlock;
    const { col } = minimax(board, 5, -Infinity, Infinity, true);
    if (col !== undefined && cols.includes(col)) return col;
    return cols[Math.floor(Math.random() * cols.length)];
  }

  function botMove() {
    busy = true;
    renderBoard();
    const thinking = {
      easy:   "Bot is guessing… 🌸",
      medium: "Bot is thinking… 🤔",
      hard:   "Bot is calculating… 🔥"
    };
    c4Status.textContent = thinking[c4Difficulty] || thinking.medium;
    const delay = c4Difficulty === 'hard' ? 650 : 450;
    setTimeout(() => {
      const chosenCol = chooseBotCol();
      drop(chosenCol, BOT);
      busy = false;
      afterMove(BOT);
    }, delay);
  }

  function drop(col, player) {
    const r = lowestEmptyRow(board, col);
    if (r < 0) return false;
    board[r][col] = player;
    return true;
  }

  function afterMove(player) {
    const win = checkWin(board, player);
    if (win) {
      gameOver = true;
      renderBoard(win);
      c4Status.textContent = player === PLAYER ? "You won! 💖 You're amazing!" : "Bot wins this one! 🤖 Try again ♥";
      if (player === PLAYER) launchConfetti(4000);
      return;
    }
    if (isFull(board)) {
      gameOver = true;
      renderBoard();
      c4Status.textContent = "It's a draw! 🌸";
      return;
    }
    if (player === PLAYER) {
      botMove();
    } else {
      c4Status.textContent = "Your turn, cutie ♥";
      renderBoard();
    }
  }

  function handleClick(col) {
    if (gameOver || busy) return;
    if (lowestEmptyRow(board, col) < 0) return;
    drop(col, PLAYER);
    afterMove(PLAYER);
  }

  function startGame() {
    board = newBoard();
    gameOver = false;
    busy = false;
    c4Status.textContent = "Your turn, cutie ♥";
    renderBoard();
  }

  function openC4() {
    c4Modal.classList.remove('hidden');
    startGame();
  }
  function closeC4() {
    c4Modal.classList.add('hidden');
  }

  // Event delegation: any "Play Connect 4" button on memory cards
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-c4-open]');
    if (btn) {
      // Prevent opening from a locked card
      const card = btn.closest('.memory-card');
      if (card && card.classList.contains('locked')) return;
      openC4();
    }
  });
  c4Close.addEventListener('click', closeC4);
  c4Restart.addEventListener('click', startGame);

  c4DiffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      c4Difficulty = btn.dataset.diff;
      c4DiffBtns.forEach(b => b.classList.toggle('active', b === btn));
      startGame();
    });
  });
  c4Modal.addEventListener('click', (e) => {
    if (e.target === c4Modal) closeC4();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !c4Modal.classList.contains('hidden')) closeC4();
  });

  // ============================================
  // Butterfly Catcher (3rd memory)
  // ============================================
  const BUTTERFLY_NOTES = [
    "Remember the breeze under those tall trees? 🌳",
    "Your laugh echoed louder than the birds. 😄",
    "That stamina though… I was struggling to keep up! 💨",
    "Yoga pants. Sexy ekdum. That's all I'm saying. 😏",
    "Holding your hand on that trail = my favorite hike ever. 💚",
    "I'd get lost in any forest as long as you're with me. 🌲💕"
  ];

  const bfModal   = document.getElementById('bfModal');
  const bfStage   = document.getElementById('bfStage');
  const bfNotes   = document.getElementById('bfNotes');
  const bfStatus  = document.getElementById('bfStatus');
  const bfClose   = document.getElementById('bfClose');
  const bfRestart = document.getElementById('bfRestart');

  let bfCaught = 0;
  const bfTimers = [];

  function bfClearTimers() {
    bfTimers.forEach(id => clearTimeout(id));
    bfTimers.length = 0;
  }

  function spawnButterfly(idx) {
    const stageW = bfStage.clientWidth;
    const stageH = bfStage.clientHeight;
    const b = document.createElement('span');
    b.className = 'bf-butterfly';
    b.textContent = '🦋';
    b.dataset.idx = idx;
    let x = Math.random() * (stageW - 40);
    let y = Math.random() * (stageH - 40);
    b.style.left = x + 'px';
    b.style.top  = y + 'px';
    bfStage.appendChild(b);

    let vx = (Math.random() - 0.5) * 1.4;
    let vy = (Math.random() - 0.5) * 1.4;
    function wander() {
      if (!b.isConnected) return;
      vx += (Math.random() - 0.5) * 0.4;
      vy += (Math.random() - 0.5) * 0.4;
      vx = Math.max(-1.6, Math.min(1.6, vx));
      vy = Math.max(-1.6, Math.min(1.6, vy));
      x += vx; y += vy;
      if (x < 0 || x > stageW - 30) vx = -vx;
      if (y < 0 || y > stageH - 30) vy = -vy;
      x = Math.max(0, Math.min(stageW - 30, x));
      y = Math.max(0, Math.min(stageH - 30, y));
      b.style.left = x + 'px';
      b.style.top  = y + 'px';
      b.style.transform = `rotate(${vx * 12}deg)`;
      bfTimers.push(setTimeout(wander, 50));
    }
    wander();

    b.addEventListener('click', () => {
      if (b.classList.contains('caught')) return;
      b.classList.add('caught');
      const p = document.createElement('p');
      p.textContent = BUTTERFLY_NOTES[idx];
      bfNotes.appendChild(p);
      bfCaught++;
      if (bfCaught === BUTTERFLY_NOTES.length) {
        bfStatus.textContent = "All caught! Every one of these is true. 💚";
      } else {
        bfStatus.textContent = `Caught ${bfCaught}/${BUTTERFLY_NOTES.length} 🦋`;
      }
      setTimeout(() => b.remove(), 500);
    });
  }

  function startButterflies() {
    bfClearTimers();
    bfStage.innerHTML = '';
    bfNotes.innerHTML = '';
    bfCaught = 0;
    bfStatus.textContent = "Tap each butterfly to unlock a tiny memory ✨";
    for (let i = 0; i < BUTTERFLY_NOTES.length; i++) {
      setTimeout(() => spawnButterfly(i), i * 200);
    }
  }

  function openBf() {
    bfModal.classList.remove('hidden');
    setTimeout(startButterflies, 50);
  }
  function closeBf() {
    bfModal.classList.add('hidden');
    bfClearTimers();
    bfStage.innerHTML = '';
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-bf-open]');
    if (btn) {
      const card = btn.closest('.memory-card');
      if (card && card.classList.contains('locked')) return;
      openBf();
    }
  });
  bfClose.addEventListener('click', closeBf);
  bfRestart.addEventListener('click', startButterflies);
  bfModal.addEventListener('click', (e) => {
    if (e.target === bfModal) closeBf();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !bfModal.classList.contains('hidden')) closeBf();
  });
})();
