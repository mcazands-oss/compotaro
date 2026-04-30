/* ============================================
   COMPOTARO /PLAY — Player/Join Logic
   join.js
   ============================================ */

let myPlayer = null;
let myGame = null;
let myScore = 0;
let hasAnswered = false;
let playerTimerInterval = null;
let questionStartTime = null;
let currentQPosition = 0;
let totalQCount = 0;

let gameSubscription = null;

// ─── INIT ───────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const roomParam = getQueryParam('room');
  if (roomParam) {
    const input = document.getElementById('input-room-code');
    input.value = roomParam.toUpperCase();
  }

  document.getElementById('input-room-code').addEventListener('input', e => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  });

  document.getElementById('form-join').addEventListener('submit', joinGame);
});

// ─── JOIN ────────────────────────────────────

async function joinGame(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-join');
  const errEl = document.getElementById('join-error');
  errEl.style.display = 'none';

  const roomCode = document.getElementById('input-room-code').value.trim().toUpperCase();
  const nickname = document.getElementById('input-nickname').value.trim();

  if (roomCode.length !== 6) {
    errEl.textContent = 'Room code must be 6 characters.';
    errEl.style.display = 'block';
    return;
  }

  if (nickname.length < 2 || nickname.length > 20) {
    errEl.textContent = 'Nickname must be 2–20 characters.';
    errEl.style.display = 'block';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Joining…';

  try {
    // Find the game
    const { data: game, error: gameErr } = await db
      .from('games')
      .select('*')
      .eq('room_code', roomCode)
      .in('status', ['lobby', 'active'])
      .maybeSingle();

    if (gameErr) throw gameErr;
    if (!game) throw new Error('Game not found. Check the room code and try again.');

    // Check nickname uniqueness
    const { data: existing } = await db
      .from('players')
      .select('id')
      .eq('game_id', game.id)
      .ilike('nickname', nickname)
      .maybeSingle();

    if (existing) throw new Error('That nickname is already taken. Pick another one.');

    // Create player
    const { data: player, error: playerErr } = await db
      .from('players')
      .insert({ game_id: game.id, nickname, score: 0 })
      .select()
      .single();

    if (playerErr) throw playerErr;

    myPlayer = player;
    myGame = game;
    myScore = 0;

    // Save to session storage for reconnect
    sessionStorage.setItem('play_player_id', player.id);
    sessionStorage.setItem('play_game_id', game.id);

    // Count total questions
    const { count } = await db
      .from('game_questions')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', game.id);
    totalQCount = count || game.question_count;

    showWaiting(nickname, roomCode);

    if (game.status === 'active') {
      // Game already started — jump to current question
      currentQPosition = game.current_question_index;
      questionStartTime = game.question_start_time
        ? new Date(game.question_start_time).getTime()
        : Date.now();
      startGameSubscription();
      await loadPlayerQuestion(currentQPosition);
    } else {
      startGameSubscription();
    }
  } catch (err) {
    errEl.textContent = err.message || 'Failed to join. Try again.';
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Join Game →';
  }
}

// ─── WAITING ─────────────────────────────────

function showWaiting(nickname, roomCode) {
  document.getElementById('wait-greeting').textContent = `Ready, ${nickname}!`;
  document.getElementById('wait-room-code').textContent = roomCode;
  showSection('section-wait');
}

// ─── REALTIME ────────────────────────────────

function startGameSubscription() {
  if (gameSubscription) {
    db.removeChannel(gameSubscription);
  }

  gameSubscription = db
    .channel(`player-game-${myGame.id}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'games',
      filter: `id=eq.${myGame.id}`
    }, async payload => {
      const updated = payload.new;

      if (updated.status === 'finished') {
        clearInterval(playerTimerInterval);
        db.removeChannel(gameSubscription);
        await showFinalLeaderboard();
        return;
      }

      if (updated.status === 'active') {
        const newPosition = updated.current_question_index;

        // New question triggered
        if (newPosition !== currentQPosition || myGame.status !== 'active') {
          currentQPosition = newPosition;
          questionStartTime = updated.question_start_time
            ? new Date(updated.question_start_time).getTime()
            : Date.now();
          myGame = { ...myGame, ...updated };
          hasAnswered = false;
          showSection('section-game');
          await loadPlayerQuestion(newPosition);
        } else {
          // First activation
          currentQPosition = newPosition;
          questionStartTime = updated.question_start_time
            ? new Date(updated.question_start_time).getTime()
            : Date.now();
          myGame = { ...myGame, ...updated };
          showSection('section-game');
          await loadPlayerQuestion(newPosition);
        }
      }
    })
    .subscribe();
}

// ─── QUESTION ────────────────────────────────

async function loadPlayerQuestion(position) {
  hasAnswered = false;
  clearInterval(playerTimerInterval);

  document.getElementById('player-q-progress').textContent = `Question ${position + 1} of ${totalQCount}`;
  document.getElementById('player-total-score').textContent = formatScore(myScore);

  // Fetch question
  const { data: gq, error } = await db
    .from('game_questions')
    .select('*, questions(*)')
    .eq('game_id', myGame.id)
    .eq('position', position)
    .single();

  if (error || !gq) {
    showToast('Failed to load question', 'error');
    return;
  }

  const q = gq.questions;
  const options = q.options;

  document.getElementById('player-q-category').textContent = q.category;
  document.getElementById('player-question-text').textContent = q.question;

  // Store correct index for reveal
  document.getElementById('player-answer-grid').dataset.correctIdx = q.correct_index;

  const ansButtons = document.querySelectorAll('#player-answer-grid .answer-btn');
  const labels = ['A', 'B', 'C', 'D'];
  ansButtons.forEach((btn, i) => {
    btn.querySelector('.ans-shape').textContent = labels[i];
    btn.querySelector('.ans-text').textContent = options[i] || '';
    btn.className = 'answer-btn';
    btn.disabled = false;
    btn.onclick = () => handleAnswer(i, q.correct_index, gq.position);
  });

  // Calculate elapsed time since question started
  const elapsed = questionStartTime ? Date.now() - questionStartTime : 0;
  const remaining = Math.max(0, Math.ceil((QUESTION_TIME_MS - elapsed) / 1000));

  startPlayerTimer(remaining, Math.ceil(QUESTION_TIME_MS / 1000));
}

// ─── TIMER ───────────────────────────────────

function startPlayerTimer(seconds, maxSeconds) {
  clearInterval(playerTimerInterval);
  let remaining = seconds;
  const fillEl = document.getElementById('player-timer-fill');
  const numEl = document.getElementById('player-timer-num');
  const circleEl = document.getElementById('player-timer-circle');
  const circumference = 188.5;

  const update = () => {
    numEl.textContent = remaining;
    const progress = remaining / maxSeconds;
    fillEl.style.strokeDashoffset = circumference * (1 - progress);

    circleEl.classList.remove('warning', 'danger');
    if (remaining <= 5) circleEl.classList.add('danger');
    else if (remaining <= 10) circleEl.classList.add('warning');
  };

  update();
  playerTimerInterval = setInterval(() => {
    remaining--;
    update();
    if (remaining <= 0) {
      clearInterval(playerTimerInterval);
      if (!hasAnswered) {
        onTimeUp();
      }
    }
  }, 1000);
}

function onTimeUp() {
  hasAnswered = true;
  // Disable all buttons
  document.querySelectorAll('#player-answer-grid .answer-btn').forEach(btn => {
    btn.disabled = true;
    btn.classList.add('locked');
  });

  // Show "Time's up!" feedback
  showScoreFeedback(false, 0, myScore, true);

  // Record a timed-out answer
  if (myPlayer && myGame) {
    db.from('answers').insert({
      game_id: myGame.id,
      player_id: myPlayer.id,
      question_position: currentQPosition,
      selected_index: -1,
      is_correct: false,
      response_time_ms: QUESTION_TIME_MS,
      points_earned: 0
    }).then(() => {});
  }
}

// ─── ANSWER ──────────────────────────────────

async function handleAnswer(selectedIdx, correctIdx, position) {
  if (hasAnswered) return;
  hasAnswered = true;
  clearInterval(playerTimerInterval);

  const elapsed = questionStartTime ? Date.now() - questionStartTime : QUESTION_TIME_MS;
  const isCorrect = selectedIdx === correctIdx;
  const points = isCorrect ? calculatePoints(elapsed) : 0;

  // Reveal buttons
  const grid = document.getElementById('player-answer-grid');
  grid.querySelectorAll('.answer-btn').forEach((btn, i) => {
    btn.disabled = true;
    btn.classList.add('locked');
    if (i === correctIdx) btn.classList.add('correct-ans');
    else if (i === selectedIdx) btn.classList.add('wrong-ans');
    else btn.classList.add('wrong-ans');
  });
  grid.querySelectorAll('.answer-btn')[selectedIdx].classList.add('selected-ans');

  // Update score
  if (isCorrect) {
    myScore += points;
    document.getElementById('player-total-score').textContent = formatScore(myScore);
  }

  // Save answer to DB
  try {
    await db.from('answers').insert({
      game_id: myGame.id,
      player_id: myPlayer.id,
      question_position: position,
      selected_index: selectedIdx,
      is_correct: isCorrect,
      response_time_ms: Math.min(elapsed, QUESTION_TIME_MS),
      points_earned: points
    });

    // Update player score
    await db
      .from('players')
      .update({ score: myScore })
      .eq('id', myPlayer.id);
  } catch (err) {
    // Best-effort — don't block UI
  }

  showScoreFeedback(isCorrect, points, myScore, false);
}

// ─── SCORE FEEDBACK ──────────────────────────

function showScoreFeedback(isCorrect, points, totalScore, timedOut) {
  const overlay = document.getElementById('score-overlay');
  const icon = document.getElementById('score-icon');
  const label = document.getElementById('score-label');
  const pointsEl = document.getElementById('score-points');
  const totalEl = document.getElementById('score-total');

  if (timedOut) {
    icon.textContent = '⏱️';
    label.textContent = "Time's Up!";
    pointsEl.textContent = '+0';
    pointsEl.style.color = 'var(--text-muted)';
  } else if (isCorrect) {
    icon.textContent = '✅';
    label.textContent = 'Correct!';
    pointsEl.textContent = `+${formatScore(points)}`;
    pointsEl.style.color = 'var(--accent)';
  } else {
    icon.textContent = '❌';
    label.textContent = 'Wrong!';
    pointsEl.textContent = '+0';
    pointsEl.style.color = 'var(--text-muted)';
  }

  totalEl.textContent = `Total: ${formatScore(totalScore)}`;

  overlay.classList.add('show');

  setTimeout(() => {
    overlay.classList.remove('show');
  }, 2200);
}

// ─── LEADERBOARD ─────────────────────────────

async function showFinalLeaderboard() {
  showSection('section-done');

  const { data: players, error } = await db
    .from('players')
    .select('*')
    .eq('game_id', myGame.id)
    .order('score', { ascending: false });

  if (error || !players) {
    document.getElementById('final-leaderboard-player').innerHTML =
      '<p class="text-muted text-center">Could not load scores.</p>';
    return;
  }

  const myRank = players.findIndex(p => p.id === myPlayer?.id) + 1;
  const medals = ['🥇', '🥈', '🥉'];

  // Personalize the header
  const doneTitle = document.getElementById('done-title');
  const doneSub = document.getElementById('done-sub');
  const doneTrophy = document.getElementById('done-trophy');

  if (myRank === 1) {
    doneTrophy.textContent = '🏆';
    doneTitle.textContent = 'You Won!';
    doneSub.textContent = 'Top of the leaderboard!';
  } else if (myRank <= 3) {
    doneTrophy.textContent = medals[myRank - 1];
    doneTitle.textContent = `#${myRank} Place!`;
    doneSub.textContent = 'Nice work!';
  } else {
    doneTrophy.textContent = '🎬';
    doneTitle.textContent = 'Game Over!';
    doneSub.textContent = `You finished #${myRank}`;
  }

  document.getElementById('final-leaderboard-player').innerHTML = players.map((p, i) => `
    <div class="lb-row ${i === 0 ? 'rank-1' : ''} ${p.id === myPlayer?.id ? 'selected-ans' : ''}"
         style="animation-delay:${i * 0.07}s${p.id === myPlayer?.id ? ';border-color:rgba(201,168,76,0.4)' : ''}">
      <div class="lb-rank">${medals[i] || (i + 1)}</div>
      <div class="lb-name">${escapeHtml(p.nickname)}${p.id === myPlayer?.id ? ' <span style="font-size:0.75rem;color:var(--accent)">(you)</span>' : ''}</div>
      <div class="lb-score">${formatScore(p.score)}</div>
    </div>
  `).join('');
}

// ─── UTILS ───────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
