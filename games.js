/* ============================================
   Cute Little Games
   - Memory Match
   - Tic-Tac-Toe (vs simple bot)
   - Catch the Hearts
   ============================================ */

(() => {
  'use strict';

  const modal    = document.getElementById('gameModal');
  if (!modal) return;
  const titleEl  = document.getElementById('gameTitle');
  const statusEl = document.getElementById('gameStatus');
  const bodyEl   = document.getElementById('gameBody');
  const closeBtn = document.getElementById('gameClose');
  const restartBtn = document.getElementById('gameRestart');

  let currentGame = null; // { restart, cleanup }

  function openModal(name) {
    cleanup();
    if (name === 'memory') currentGame = startMemoryMatch();
    else if (name === 'ttt') currentGame = startTicTacToe();
    else if (name === 'catch') currentGame = startCatchHearts();
    modal.classList.remove('hidden');
  }
  function closeModal() {
    cleanup();
    modal.classList.add('hidden');
  }
  function cleanup() {
    if (currentGame && typeof currentGame.cleanup === 'function') {
      try { currentGame.cleanup(); } catch (_) {}
    }
    currentGame = null;
    bodyEl.innerHTML = '';
    statusEl.textContent = '';
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-game-open]');
    if (!btn) return;
    openModal(btn.dataset.gameOpen);
  });
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });
  restartBtn.addEventListener('click', () => {
    if (currentGame && typeof currentGame.restart === 'function') currentGame.restart();
  });

  // Try to use the host page's confetti if available
  function fireConfetti() {
    try {
      const btn = document.getElementById('celebrateBtn');
      if (btn) btn.click();
    } catch (_) {}
  }

  // ============================================
  // 1) Memory Match (8 pairs in 4x4)
  // ============================================
  function startMemoryMatch() {
    titleEl.textContent = 'Memory Match 🃏';
    const PAIRS = ['💖','🌸','🦋','🐻','🍰','🌷','⭐','🎀'];
    let deck, first, second, locking, matched, moves, startTime, timerId;

    function build() {
      deck = [...PAIRS, ...PAIRS]
        .map(v => ({ v, k: Math.random() }))
        .sort((a, b) => a.k - b.k)
        .map(o => o.v);
      first = null; second = null; locking = false;
      matched = 0; moves = 0; startTime = Date.now();
      render();
      updateStatus();
      if (timerId) clearInterval(timerId);
      timerId = setInterval(updateStatus, 500);
    }

    function updateStatus() {
      const sec = Math.floor((Date.now() - startTime) / 1000);
      statusEl.textContent = `Moves: ${moves}  ·  Time: ${sec}s  ·  Pairs: ${matched}/${PAIRS.length}`;
    }

    function render() {
      bodyEl.innerHTML = '';
      const grid = document.createElement('div');
      grid.className = 'mm-grid';
      deck.forEach((emoji, idx) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'mm-card';
        card.dataset.idx = idx;
        card.dataset.val = emoji;
        card.innerHTML = `
          <div class="mm-inner">
            <div class="mm-face mm-front">💕</div>
            <div class="mm-face mm-back">${emoji}</div>
          </div>`;
        card.addEventListener('click', () => onPick(card));
        grid.appendChild(card);
      });
      bodyEl.appendChild(grid);
    }

    function onPick(card) {
      if (locking) return;
      if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
      card.classList.add('flipped');
      if (!first) { first = card; return; }
      second = card;
      moves++;
      updateStatus();
      if (first.dataset.val === second.dataset.val) {
        first.classList.add('matched');
        second.classList.add('matched');
        first = second = null;
        matched++;
        if (matched === PAIRS.length) {
          clearInterval(timerId);
          const sec = Math.floor((Date.now() - startTime) / 1000);
          statusEl.textContent = `🎉 You won in ${moves} moves & ${sec}s! 💖`;
          fireConfetti();
        }
      } else {
        locking = true;
        setTimeout(() => {
          first.classList.remove('flipped');
          second.classList.remove('flipped');
          first = second = null;
          locking = false;
        }, 750);
      }
    }

    build();
    return {
      restart: build,
      cleanup() { if (timerId) clearInterval(timerId); }
    };
  }

  // ============================================
  // 2) Tic-Tac-Toe (you = 💖, bot = ⭐)
  // ============================================
  function startTicTacToe() {
    titleEl.textContent = 'Tic-Tac-Toe ⭕';
    const HUMAN = '💖', BOT = '⭐';
    const WIN_LINES = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    let cells, gameOver;

    function build() {
      cells = Array(9).fill('');
      gameOver = false;
      statusEl.textContent = "Your turn, cutie 💖";
      render();
    }

    function render(winLine) {
      bodyEl.innerHTML = '';
      const grid = document.createElement('div');
      grid.className = 'ttt-grid';
      cells.forEach((v, i) => {
        const c = document.createElement('button');
        c.type = 'button';
        c.className = 'ttt-cell';
        c.textContent = v;
        if (v || gameOver) c.disabled = true;
        if (winLine && winLine.includes(i)) c.classList.add('win');
        c.addEventListener('click', () => playerMove(i));
        grid.appendChild(c);
      });
      bodyEl.appendChild(grid);
    }

    function findWin(player) {
      for (const line of WIN_LINES) {
        const [a,b,c] = line;
        if (cells[a] === player && cells[b] === player && cells[c] === player) return line;
      }
      return null;
    }

    function findThreat(player) {
      // return index that completes a line for player, else -1
      for (const line of WIN_LINES) {
        const vals = line.map(i => cells[i]);
        const empties = line.filter(i => cells[i] === '');
        const playerCount = vals.filter(v => v === player).length;
        if (playerCount === 2 && empties.length === 1) return empties[0];
      }
      return -1;
    }

    function botPick() {
      // 1) win  2) block  3) center  4) corner  5) random
      let i = findThreat(BOT);
      if (i >= 0) return i;
      i = findThreat(HUMAN);
      if (i >= 0) return i;
      if (cells[4] === '') return 4;
      const corners = [0,2,6,8].filter(j => cells[j] === '');
      if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
      const empt = cells.map((v,j) => v === '' ? j : -1).filter(j => j>=0);
      return empt[Math.floor(Math.random()*empt.length)];
    }

    function playerMove(i) {
      if (gameOver || cells[i] !== '') return;
      cells[i] = HUMAN;
      const win = findWin(HUMAN);
      if (win) { gameOver = true; statusEl.textContent = "You won! 💖🎉"; render(win); fireConfetti(); return; }
      if (cells.every(v => v !== '')) { gameOver = true; statusEl.textContent = "It's a draw 🌸"; render(); return; }
      statusEl.textContent = "Bot is thinking... ⭐";
      render();
      setTimeout(() => {
        const j = botPick();
        cells[j] = BOT;
        const w = findWin(BOT);
        if (w) { gameOver = true; statusEl.textContent = "Bot wins this round 🤖 — try again!"; render(w); return; }
        if (cells.every(v => v !== '')) { gameOver = true; statusEl.textContent = "It's a draw 🌸"; render(); return; }
        statusEl.textContent = "Your turn, cutie 💖";
        render();
      }, 350);
    }

    build();
    return { restart: build, cleanup() {} };
  }

  // ============================================
  // 3) Catch the Hearts (30s)
  // ============================================
  function startCatchHearts() {
    titleEl.textContent = 'Catch the Hearts 💝';
    const DURATION = 30; // seconds
    let area, score, timeLeft, spawnId, tickId, items, running;

    function build() {
      bodyEl.innerHTML = `
        <div class="catch-info">
          <span>Score: <b id="catchScore">0</b></span>
          <span>Time: <b id="catchTime">${DURATION}</b>s</span>
        </div>
        <div class="catch-area" id="catchArea"></div>
      `;
      area = document.getElementById('catchArea');
      score = 0;
      timeLeft = DURATION;
      items = [];
      running = true;
      statusEl.textContent = "Tap 💖 hearts. Avoid 💣 bombs!";
      if (spawnId) clearInterval(spawnId);
      if (tickId) clearInterval(tickId);
      spawnId = setInterval(spawn, 600);
      tickId  = setInterval(loop, 30);
      const timerId = setInterval(() => {
        if (!running) return;
        timeLeft--;
        const t = document.getElementById('catchTime');
        if (t) t.textContent = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(timerId);
          endGame();
        }
      }, 1000);
      area._timerId = timerId;
    }

    const KINDS = [
      { e: '💖', s: 1,  bomb: false, w: 5 },
      { e: '💕', s: 1,  bomb: false, w: 4 },
      { e: '💗', s: 2,  bomb: false, w: 3 },
      { e: '🌸', s: 1,  bomb: false, w: 3 },
      { e: '⭐', s: 3,  bomb: false, w: 1 },
      { e: '💣', s: -3, bomb: true,  w: 2 }
    ];
    const TOTAL_W = KINDS.reduce((a, k) => a + k.w, 0);

    function pickKind() {
      let r = Math.random() * TOTAL_W;
      for (const k of KINDS) { r -= k.w; if (r <= 0) return k; }
      return KINDS[0];
    }

    function spawn() {
      if (!running || !area) return;
      const kind = pickKind();
      const el = document.createElement('span');
      el.className = 'catch-fall' + (kind.bomb ? ' bomb' : '');
      el.textContent = kind.e;
      const w = area.clientWidth;
      const x = Math.random() * (w - 32);
      const y = -32;
      el.style.left = '0';
      el.style.top  = '0';
      el.style.transform = `translate(${x}px, ${y}px)`;
      el.dataset.score = kind.s;
      el.dataset.bomb = kind.bomb ? '1' : '0';

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!running) return;
        const s = +el.dataset.score;
        score += s;
        const sc = document.getElementById('catchScore');
        if (sc) sc.textContent = score;
        showPopup(item.x, item.y, s);
        const idx = items.indexOf(item);
        if (idx >= 0) items.splice(idx, 1);
        el.remove();
      });

      const item = { el, x, y, vy: 1.6 + Math.random() * 1.8, vx: (Math.random()-0.5)*0.6 };
      items.push(item);
      area.appendChild(el);
    }

    function showPopup(x, y, s) {
      const p = document.createElement('span');
      p.className = 'catch-popup ' + (s >= 0 ? 'plus' : 'minus');
      p.textContent = (s >= 0 ? '+' : '') + s;
      p.style.left = '0';
      p.style.top  = '0';
      p.style.transform = `translate(${x}px, ${y}px)`;
      area.appendChild(p);
      setTimeout(() => p.remove(), 700);
    }

    function loop() {
      if (!running || !area) return;
      const h = area.clientHeight;
      const w = area.clientWidth;
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.y += it.vy;
        it.x += it.vx;
        if (it.x < 0) it.x = 0;
        if (it.x > w - 32) it.x = w - 32;
        it.el.style.transform = `translate(${it.x}px, ${it.y}px)`;
        if (it.y > h + 40) {
          it.el.remove();
          items.splice(i, 1);
        }
      }
    }

    function endGame() {
      running = false;
      if (spawnId) { clearInterval(spawnId); spawnId = null; }
      if (tickId)  { clearInterval(tickId);  tickId  = null; }
      // clear remaining
      items.forEach(it => it.el.remove());
      items = [];
      const overlay = document.createElement('div');
      overlay.className = 'catch-overlay';
      const msg = score >= 25 ? '💖 Heart-catcher champion! 💖' :
                  score >= 10 ? '🌸 Sweet score! 🌸' :
                  '💕 Aww — try again! 💕';
      overlay.innerHTML = `
        <div>
          <h3>${msg}</h3>
          <p>Final score: <b>${score}</b></p>
          <p>Tap "Play Again" to try once more 💝</p>
        </div>`;
      if (area) area.appendChild(overlay);
      statusEl.textContent = `Time's up! Final score: ${score}`;
      if (score >= 15) fireConfetti();
    }

    function cleanup() {
      running = false;
      if (spawnId) clearInterval(spawnId);
      if (tickId)  clearInterval(tickId);
      if (area && area._timerId) clearInterval(area._timerId);
      items = [];
    }

    build();
    return { restart: () => { cleanup(); build(); }, cleanup };
  }
})();
