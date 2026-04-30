/* ============================================
   COMPOTARO /PLAY — Host Game Logic
   host.js
   ============================================ */

let currentUser = null;
let currentGame = null;
let currentPlayers = [];
let currentQuestions = [];
let questionIndex = 0;
let totalQuestions = 0;
let hostTimerInterval = null;
let answeredThisQuestion = 0;
let revealed = false;

let playersSubscription = null;
let answersSubscription = null;

// ─── INIT ───────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  setupAuthTabs();
  setupAuthForms();
  setupSetupForm();
  setupLobbyActions();
  setupGameActions();
  setupSignOut();
  checkSession();
  handleLobbyGridResponsive();
  window.addEventListener('resize', handleLobbyGridResponsive);
});

function handleLobbyGridResponsive() {
  const grid = document.getElementById('lobby-grid');
  if (!grid) return;
  if (window.innerWidth < 700) {
    grid.style.gridTemplateColumns = '1fr';
  } else {
    grid.style.gridTemplateColumns = '1fr 1fr';
  }
}

async function checkSession() {
  const { data: { session } } = await db.auth.getSession();
  if (session) {
    currentUser = session.user;
    onAuthenticated();
  } else {
    showSection('section-auth');
  }
}

// ─── AUTH ────────────────────────────────────

function setupAuthTabs() {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`form-${tab.dataset.tab}`).classList.add('active');
    });
  });
}

function setupAuthForms() {
  document.getElementById('form-signin').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('btn-signin');
    const errEl = document.getElementById('signin-error');
    errEl.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Signing in…';

    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;

    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) {
      errEl.textContent = error.message;
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Sign In';
      return;
    }
    currentUser = data.user;
    onAuthenticated();
  });

  document.getElementById('form-signup').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('btn-signup');
    const errEl = document.getElementById('signup-error');
    errEl.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Creating account…';

    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    const { data, error } = await db.auth.signUp({ email, password });
    if (error) {
      errEl.textContent = error.message;
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Create Account';
      return;
    }
    currentUser = data.user;
    onAuthenticated();
  });
}

function onAuthenticated() {
  document.getElementById('btn-sign-out').style.display = '';
  showSection('section-setup');
}

function setupSignOut() {
  document.getElementById('btn-sign-out').addEventListener('click', async () => {
    await db.auth.signOut();
    currentUser = null;
    showSection('section-auth');
    document.getElementById('btn-sign-out').style.display = 'none';
  });
}

// ─── SETUP ───────────────────────────────────

function setupSetupForm() {
  // Category chips toggle
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('selected'));
  });

  // Question count
  document.querySelectorAll('.count-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.count-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  document.getElementById('form-setup').addEventListener('submit', launchGame);
}

async function launchGame(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-launch');
  const errEl = document.getElementById('setup-error');
  errEl.style.display = 'none';

  const selectedCategories = Array.from(document.querySelectorAll('.chip.selected'))
    .map(c => c.dataset.cat);

  if (selectedCategories.length === 0) {
    errEl.textContent = 'Pick at least one category.';
    errEl.style.display = 'block';
    return;
  }

  const questionCount = parseInt(
    document.querySelector('.count-option.selected')?.dataset.count || '10'
  );
  const gameName = document.getElementById('game-name').value.trim() || null;

  btn.disabled = true;
  btn.textContent = 'Launching…';

  try {
    const roomCode = await generateRoomCode();

    // Insert game
    const { data: game, error: gameErr } = await db
      .from('games')
      .insert({
        room_code: roomCode,
        host_id: currentUser.id,
        name: gameName,
        categories: selectedCategories,
        question_count: questionCount,
        status: 'lobby'
      })
      .select()
      .single();

    if (gameErr) throw gameErr;
    currentGame = game;

    // Select random questions
    const { data: pool, error: poolErr } = await db
      .from('questions')
      .select('id')
      .in('category', selectedCategories);

    if (poolErr) throw poolErr;
    if (!pool || pool.length === 0) throw new Error('No questions found for selected categories. Run seed_questions.sql first.');

    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, questionCount);

    const gameQuestions = shuffled.map((q, i) => ({
      game_id: game.id,
      question_id: q.id,
      position: i
    }));

    const { error: gqErr } = await db.from('game_questions').insert(gameQuestions);
    if (gqErr) throw gqErr;

    totalQuestions = shuffled.length;

    showLobby(roomCode, game.id);
  } catch (err) {
    errEl.textContent = err.message || 'Failed to launch game.';
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Launch Game →';
  }
}

// ─── LOBBY ───────────────────────────────────

function showLobby(roomCode, gameId) {
  document.getElementById('display-room-code').textContent = roomCode;
  const joinUrl = buildJoinUrl(roomCode);
  document.getElementById('display-join-link').textContent = joinUrl;

  // Generate QR code
  document.getElementById('qr-code').innerHTML = '';
  new QRCode(document.getElementById('qr-code'), {
    text: joinUrl,
    width: 180,
    height: 180,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M
  });

  showSection('section-lobby');
  subscribeToPlayers(gameId);
}

function setupLobbyActions() {
  document.getElementById('btn-start-game').addEventListener('click', startGame);
}

function subscribeToPlayers(gameId) {
  if (playersSubscription) {
    db.removeChannel(playersSubscription);
  }
  currentPlayers = [];
  renderPlayerList();

  playersSubscription = db
    .channel(`lobby-players-${gameId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'players',
      filter: `game_id=eq.${gameId}`
    }, payload => {
      const player = payload.new;
      if (!currentPlayers.find(p => p.id === player.id)) {
        currentPlayers.push(player);
        renderPlayerList();
        updateStartButton();
      }
    })
    .subscribe();

  // Load existing players (in case of reconnect)
  db.from('players').select('*').eq('game_id', gameId).then(({ data }) => {
    if (data && data.length) {
      currentPlayers = data;
      renderPlayerList();
      updateStartButton();
    }
  });
}

function renderPlayerList() {
  const list = document.getElementById('lobby-player-list');
  const noMsg = document.getElementById('no-players-msg');
  const badge = document.getElementById('player-count-badge');

  badge.textContent = `${currentPlayers.length} joined`;

  if (currentPlayers.length === 0) {
    list.innerHTML = '';
    list.appendChild(noMsg || createNoPlayersMsg());
    return;
  }

  noMsg && (noMsg.style.display = 'none');

  list.innerHTML = currentPlayers.map(p => `
    <div class="player-item">
      <div class="player-avatar">${avatarLetter(p.nickname)}</div>
      <div class="player-name">${escapeHtml(p.nickname)}</div>
    </div>
  `).join('');
}

function createNoPlayersMsg() {
  const el = document.createElement('div');
  el.id = 'no-players-msg';
  el.className = 'text-muted text-sm text-center';
  el.style.padding = '1.5rem 0';
  el.textContent = 'Nobody yet — share the QR code!';
  return el;
}

function updateStartButton() {
  const btn = document.getElementById('btn-start-game');
  const hint = document.getElementById('start-hint');
  if (currentPlayers.length >= 1) {
    btn.disabled = false;
    hint.textContent = `${currentPlayers.length} player${currentPlayers.length > 1 ? 's' : ''} ready — go!`;
  }
}

// ─── GAME ────────────────────────────────────

async function startGame() {
  document.getElementById('btn-start-game').disabled = true;

  const now = new Date().toISOString();
  const { error } = await db
    .from('games')
    .update({ status: 'active', current_question_index: 0, question_start_time: now })
    .eq('id', currentGame.id);

  if (error) {
    showToast('Failed to start game: ' + error.message, 'error');
    document.getElementById('btn-start-game').disabled = false;
    return;
  }

  questionIndex = 0;
  if (playersSubscription) {
    db.removeChannel(playersSubscription);
    playersSubscription = null;
  }
  showSection('section-game');
  await loadHostQuestion(0);
  subscribeToAnswers(currentGame.id);
}

async function loadHostQuestion(position) {
  revealed = false;
  answeredThisQuestion = 0;
  document.getElementById('host-answered-count').textContent = '0';
  document.getElementById('host-total-players').textContent = currentPlayers.length;

  const revealBtn = document.getElementById('btn-reveal');
  const nextBtn = document.getElementById('btn-next-q');
  revealBtn.disabled = false;
  revealBtn.style.display = '';
  nextBtn.disabled = true;

  // Fetch game question + full question data
  const { data: gq, error: gqErr } = await db
    .from('game_questions')
    .select('*, questions(*)')
    .eq('game_id', currentGame.id)
    .eq('position', position)
    .single();

  if (gqErr || !gq) {
    showToast('Failed to load question', 'error');
    return;
  }

  const q = gq.questions;
  const options = q.options;

  document.getElementById('host-q-progress').textContent =
    `Question ${position + 1} of ${totalQuestions}`;
  document.getElementById('host-q-category').textContent = q.category;
  document.getElementById('host-question-text').textContent = q.question;

  const ansButtons = document.querySelectorAll('#host-answer-grid .answer-btn');
  const labels = ['A', 'B', 'C', 'D'];
  ansButtons.forEach((btn, i) => {
    btn.querySelector('.ans-shape').textContent = labels[i];
    btn.querySelector('.ans-text').textContent = options[i] || '';
    btn.className = 'answer-btn locked';
    btn.dataset.correct = (i === q.correct_index) ? 'true' : 'false';
  });

  // Store correct index for reveal
  document.getElementById('host-answer-grid').dataset.correctIdx = q.correct_index;

  startHostTimer(20);
}

function startHostTimer(seconds) {
  clearInterval(hostTimerInterval);
  let remaining = seconds;
  const fillEl = document.getElementById('host-timer-fill');
  const numEl = document.getElementById('host-timer-num');
  const circleEl = document.getElementById('host-timer-circle');
  const circumference = 188.5;

  const update = () => {
    numEl.textContent = remaining;
    const progress = remaining / seconds;
    fillEl.style.strokeDashoffset = circumference * (1 - progress);

    circleEl.classList.remove('warning', 'danger');
    if (remaining <= 5) circleEl.classList.add('danger');
    else if (remaining <= 10) circleEl.classList.add('warning');
  };

  update();
  hostTimerInterval = setInterval(() => {
    remaining--;
    update();
    if (remaining <= 0) {
      clearInterval(hostTimerInterval);
    }
  }, 1000);
}

function subscribeToAnswers(gameId) {
  if (answersSubscription) {
    db.removeChannel(answersSubscription);
  }

  answersSubscription = db
    .channel(`host-answers-${gameId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'answers',
      filter: `game_id=eq.${gameId}`
    }, payload => {
      if (payload.new.question_position === questionIndex) {
        answeredThisQuestion++;
        document.getElementById('host-answered-count').textContent = answeredThisQuestion;
      }
    })
    .subscribe();
}

function setupGameActions() {
  document.getElementById('btn-reveal').addEventListener('click', revealAnswer);
  document.getElementById('btn-next-q').addEventListener('click', advanceQuestion);
}

function revealAnswer() {
  if (revealed) return;
  revealed = true;
  clearInterval(hostTimerInterval);

  const grid = document.getElementById('host-answer-grid');
  const correctIdx = parseInt(grid.dataset.correctIdx);

  grid.querySelectorAll('.answer-btn').forEach((btn, i) => {
    if (i === correctIdx) {
      btn.classList.add('correct-ans');
    } else {
      btn.classList.add('wrong-ans');
    }
  });

  document.getElementById('btn-reveal').disabled = true;
  document.getElementById('btn-next-q').disabled = false;

  const isLast = questionIndex >= totalQuestions - 1;
  document.getElementById('btn-next-q').textContent = isLast ? 'Finish Game' : 'Next Question →';
}

async function advanceQuestion() {
  const nextBtn = document.getElementById('btn-next-q');
  nextBtn.disabled = true;

  const isLast = questionIndex >= totalQuestions - 1;

  if (isLast) {
    await finishGame();
    return;
  }

  questionIndex++;
  const now = new Date().toISOString();
  const { error } = await db
    .from('games')
    .update({ current_question_index: questionIndex, question_start_time: now })
    .eq('id', currentGame.id);

  if (error) {
    showToast('Failed to advance question: ' + error.message, 'error');
    nextBtn.disabled = false;
    return;
  }

  answeredThisQuestion = 0;
  await loadHostQuestion(questionIndex);
}

async function finishGame() {
  const { error } = await db
    .from('games')
    .update({ status: 'finished' })
    .eq('id', currentGame.id);

  if (error) {
    showToast('Failed to finish game: ' + error.message, 'error');
    return;
  }

  clearInterval(hostTimerInterval);
  if (answersSubscription) {
    db.removeChannel(answersSubscription);
    answersSubscription = null;
  }

  await showFinalLeaderboard();
}

async function showFinalLeaderboard() {
  showSection('section-done');

  const { data: players, error } = await db
    .from('players')
    .select('*')
    .eq('game_id', currentGame.id)
    .order('score', { ascending: false });

  if (error || !players) {
    document.getElementById('final-leaderboard').innerHTML =
      '<p class="text-muted text-center">Could not load scores.</p>';
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];

  document.getElementById('final-leaderboard').innerHTML = players.map((p, i) => `
    <div class="lb-row ${i === 0 ? 'rank-1' : ''}" style="animation-delay:${i * 0.07}s">
      <div class="lb-rank">${medals[i] || (i + 1)}</div>
      <div class="lb-name">${escapeHtml(p.nickname)}</div>
      <div class="lb-score">${formatScore(p.score)}</div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-new-game').addEventListener('click', () => {
    currentGame = null;
    currentPlayers = [];
    currentQuestions = [];
    questionIndex = 0;
    showSection('section-setup');
  });
});

// ─── UTILS ───────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
