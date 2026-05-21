/* ============================================================
   player.js — Player View Controller
   ============================================================ */

(function () {
  'use strict';

  // ── State ─────────────────────────────────────────────────
  let G = null;        // GameEngine ref
  let game = null;     // HoldemGame instance
  let gameState = {};
  let players = [];
  let myPlayerId = null;
  let mySeat = -1;
  let myHoleCards = [];
  let timerInterval = null;
  let actionTimerInterval = null;
  let actionSecondsLeft = 0;
  let blindTimerInterval = null;
  let isLeader = false; // true if this client drives AI + game logic
  let supabaseChannel = null;
  let pendingSplitOffer = false;
  let isLocalMode = false; // true when no Supabase configured

  // ── DOM Refs ───────────────────────────────────────────────
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  const el = {
    loadingOverlay:  () => $('loading-overlay'),
    introOverlay:    () => $('intro-overlay'),
    dealBtn:         () => $('deal-btn'),
    table:           () => $('poker-table'),
    communityCards:  () => $('community-cards'),
    potAmount:       () => $('pot-amount'),
    sidePots:        () => $('side-pots'),
    actionPanel:     () => $('action-panel'),
    btnFold:         () => $('btn-fold'),
    btnCheck:        () => $('btn-check'),
    btnCall:         () => $('btn-call'),
    btnRaise:        () => $('btn-raise'),
    btnAllIn:        () => $('btn-allin'),
    raiseControls:   () => $('raise-controls'),
    raiseSlider:     () => $('raise-slider'),
    raiseAmount:     () => $('raise-amount'),
    actionInfo:      () => $('action-info'),
    hudLevel:        () => $('hud-level'),
    hudBlinds:       () => $('hud-blinds'),
    hudTimer:        () => $('hud-timer'),
    hudBlindBar:     () => $('hud-blind-bar'),
    hudPlayers:      () => $('hud-players'),
    hudHand:         () => $('hud-hand'),
    winnerOverlay:   () => $('winner-overlay'),
    winnerTitle:     () => $('winner-title'),
    winnerName:      () => $('winner-name'),
    winnerAmount:    () => $('winner-amount'),
    winnerHand:      () => $('winner-hand'),
    winnerCards:     () => $('winner-cards'),
    splitOverlay:    () => $('split-overlay'),
    toastContainer:  () => $('toast-container'),
    handStrength:    () => $('hand-strength'),
    dealerBtn:       () => $('dealer-button'),
    logPanel:        () => $('game-log'),
  };

  // ── Initialization ─────────────────────────────────────────
  async function init() {
    G = window.GameEngine;
    game = new G.HoldemGame();

    const params = new URLSearchParams(window.location.search);
    const gameCode = params.get('code');
    const playerId = params.get('pid') || G.LS.get('playerId');
    const seatParam = params.get('seat');

    if (!gameCode) {
      window.location.href = '/holdem';
      return;
    }

    // Check if Supabase is configured
    const sbInstance = G.initSupabase();
    isLocalMode = !sbInstance || window.GameEngine.SUPABASE_URL === 'YOUR_SUPABASE_URL';

    if (isLocalMode) {
      initLocalMode(gameCode, playerId, seatParam ? parseInt(seatParam) : 0);
    } else {
      initOnlineMode(gameCode, playerId);
    }
  }

  // ── Local (Demo) Mode ─────────────────────────────────────
  function initLocalMode(gameCode, playerId, seat) {
    mySeat = seat;
    myPlayerId = playerId || 'local_player_' + seat;
    isLeader = true;

    // Build local game
    const eng = new G.HoldemGame();
    gameState = eng.createGameState(gameCode);
    gameState.blind_timer_start = new Date().toISOString();

    // Create human player at seat 0
    const humanPlayer = eng.createPlayerState(myPlayerId, G.LS.get('username') || 'You', 0, '');
    players = [humanPlayer];

    // Fill with AI
    for (let i = 1; i < G.NUM_SEATS; i++) {
      players.push(eng.createPlayerState(
        'ai_' + i,
        G.AI_NAMES[(i - 1) % G.AI_NAMES.length],
        i,
        '',
        true
      ));
    }

    hideLoading();
    showIntro();
    setupActionHandlers();
    startBlindTimer();
  }

  // ── Online Mode ────────────────────────────────────────────
  async function initOnlineMode(gameCode, playerId) {
    const eng = new G.HoldemGame();
    const session = await G.supabaseGetSession();
    if (!session) {
      G.LS.set('pendingGame', gameCode);
      window.location.href = '/holdem';
      return;
    }

    myPlayerId = session.user.id;
    G.LS.set('playerId', myPlayerId);

    gameState = await G.supabaseGetGame(gameCode);
    if (!gameState) {
      showToast('Game not found', 'red');
      setTimeout(() => { window.location.href = '/holdem'; }, 2000);
      return;
    }

    players = await G.supabaseGetPlayers(gameCode);
    const myPlayerData = players.find(p => p.user_id === myPlayerId);
    if (myPlayerData) {
      mySeat = myPlayerData.seat_position;
      myHoleCards = myPlayerData.hole_cards || [];
      console.log('mySeat set to:', mySeat, 'myPlayerId:', myPlayerId);
    } else {
      console.warn('Could not find my player data. myPlayerId:', myPlayerId, 'players:', players.map(p => p.user_id));
      mySeat = 0; // fallback to seat 0
    }

    // Determine if this client is the leader (lowest seat human)
    const humans = players.filter(p => !p.is_ai).sort((a, b) => a.seat_position - b.seat_position);
    isLeader = humans.length > 0 && humans[0].user_id === myPlayerId;

    // If leader and not enough players, fill with AI
    if (isLeader && players.length < G.NUM_SEATS) {
      const takenSeats = new Set(players.map(p => p.seat_position));
      for (let i = 0; i < G.NUM_SEATS; i++) {
        if (!takenSeats.has(i)) {
          const aiName = G.AI_NAMES[(i - 1) % G.AI_NAMES.length];
          const aiData = {
            game_id: gameState.game_id,
            game_code: gameCode,
            user_id: null,
            username: aiName,
            seat_position: i,
            stack: 3500,
            hole_cards: [],
            status: 'active',
            current_bet: 0,
            is_ai: true,
            has_acted: false,
            avatar_url: ''
            // player_id intentionally omitted — let Supabase auto-generate UUID
          };
          const inserted = await G.supabaseInsertPlayer(aiData);
          if (inserted) players.push(inserted);
        }
      }
    }

    hideLoading();
    showIntro();
    subscribeRealtime(gameCode);
    setupActionHandlers();
    startBlindTimer();
    renderAll();
  }

  // ── Supabase Realtime ─────────────────────────────────────
  function subscribeRealtime(gameCode) {
    const { initSupabase } = G;
    const sb = initSupabase();
    if (!sb) return;

    supabaseChannel = sb
      .channel('game_' + gameCode)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `game_id=eq.${gameCode}` },
        payload => {
          gameState = { ...gameState, ...payload.new };
          renderAll();
          if (gameState.stage === 'hand_complete') handleHandComplete();
          else if (isLeader) maybeRunAI();
        }
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `game_id=eq.${gameCode}` },
        async payload => {
          const updated = payload.new;
          const idx = players.findIndex(p => p.player_id === updated.player_id);
          if (idx >= 0) players[idx] = { ...players[idx], ...updated };
          else players.push(updated);
          if (updated.user_id === myPlayerId) {
            myHoleCards = updated.hole_cards || [];
          }
          renderAll();
        }
      )
      .subscribe();
  }

  // ── Intro ─────────────────────────────────────────────────
  function showIntro() {
    const overlay = el.introOverlay();
    if (!overlay) return;
    overlay.classList.remove('hidden');

    const video = overlay.querySelector('video');
    if (video && video.querySelector('source')) {
      video.muted = false;
      video.play().catch(() => {
        // Autoplay with sound blocked — try muted
        video.muted = true;
        video.play().catch(() => {});
      });
      video.addEventListener('ended', onIntroEnd, { once: true });
      setTimeout(onIntroEnd, 30000); // max wait 30s
    } else {
      // No real video — show animated placeholder, then show deal button after 3s
      setTimeout(() => {
        const btn = el.dealBtn();
        if (btn) btn.classList.add('visible');
      }, 3000);
    }
  }

  function onIntroEnd() {
    const btn = el.dealBtn();
    if (btn) btn.classList.add('visible');
  }

  function onDealClick() {
    const overlay = el.introOverlay();
    if (overlay) overlay.classList.add('hidden');

    // Start blind timer on first deal
    if (!gameState.blind_timer_start) {
      gameState.blind_timer_start = new Date().toISOString();
      if (!isLocalMode) {
        G.supabaseUpdateGame(gameState.game_id, { blind_timer_start: gameState.blind_timer_start });
      }
      startBlindTimer();
    }

    if (gameState.status === 'waiting' || !gameState.stage || gameState.stage === 'waiting') {
      if (isLeader || isLocalMode) {
        startNewHand();
      } else {
        showToast('Waiting for game to start...', null);
      }
    } else {
      renderAll();
    }
  }

  // ── Game Flow ─────────────────────────────────────────────
  function startNewHand() {
    const eng = new G.HoldemGame();
    const result = eng.dealHand(gameState, players);
    if (result.error) {
      showToast(result.error, 'red');
      return;
    }

    gameState = result.gameState;
    players = result.players;

    // Update my hole cards
    const me = players.find(p => p.seat_position === mySeat);
    if (me) myHoleCards = me.hole_cards || [];

    addLog(`Hand #${gameState.hand_number} started`);

    if (!isLocalMode) {
      syncGameToSupabase();
    }

    renderAll();
    startActionTimer();

    setTimeout(() => {
      maybeRunAI();
    }, 500);
  }

  async function syncGameToSupabase() {
    if (isLocalMode) return;
    await G.supabaseUpdateGame(gameState.game_id, {
      status: gameState.status,
      pot: gameState.pot || 0,
      community_cards: gameState.community_cards,
      current_bet: gameState.current_bet,
      current_player_index: gameState.current_player_index,
      blind_level: gameState.blind_level || 1,
      stage: gameState.stage,
      dealer_seat: gameState.dealer_seat || 0,
      sb_seat: gameState.sb_seat || 0,
      bb_seat: gameState.bb_seat || 0,
      hand_results: gameState.hand_results || null,
    });
    for (const p of players) {
      if (!p.is_ai) {
        await G.supabaseUpdatePlayer(p.player_id, gameState.game_id, {
          stack: p.stack,
          hole_cards: p.hole_cards || [],
          status: p.status,
          current_bet: p.current_bet,
        });
      }
    }
  }

  // ── Action Handlers ────────────────────────────────────────
  function setupActionHandlers() {
    const btn = el.dealBtn();
    if (btn) btn.addEventListener('click', onDealClick);

    const fold = el.btnFold();
    if (fold) fold.addEventListener('click', () => doAction('fold'));

    const check = el.btnCheck();
    if (check) check.addEventListener('click', () => doAction('check'));

    const call = el.btnCall();
    if (call) call.addEventListener('click', () => doAction('call'));

    const raise = el.btnRaise();
    if (raise) raise.addEventListener('click', () => {
      const rc = el.raiseControls();
      if (rc) rc.classList.toggle('visible');
    });

    const allin = el.btnAllIn();
    if (allin) allin.addEventListener('click', () => doAction('all_in'));

    const slider = el.raiseSlider();
    if (slider) {
      slider.addEventListener('input', () => {
        const ra = el.raiseAmount();
        if (ra) ra.textContent = G.formatMoney(parseInt(slider.value));
      });
    }

    // Raise confirm when user clicks "Raise" button while controls are open
    if (raise) {
      raise.addEventListener('click', (e) => {
        const rc = el.raiseControls();
        if (rc && rc.classList.contains('visible')) {
          const slider = el.raiseSlider();
          if (slider) {
            doAction('raise', parseInt(slider.value));
            rc.classList.remove('visible');
          }
        }
      });
    }

    // Raise presets
    document.querySelectorAll('.raise-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        const pot = gameState.hand_pot || gameState.pot || 0;
        const me = getMyPlayer();
        const currentBet = gameState.current_bet || 0;
        const myBet = me?.current_bet || 0;
        const callAmt = currentBet - myBet;
        const bb = gameState.big_blind || 200;
        let amount = bb;
        if (preset === 'min') amount = currentBet + (currentBet || bb);
        else if (preset === 'half') amount = Math.floor(callAmt + pot / 2);
        else if (preset === 'pot') amount = callAmt + pot;
        else if (preset === '2x') amount = currentBet * 2 || bb * 2;
        else if (preset === '3x') amount = currentBet * 3 || bb * 3;
        amount = Math.max(amount, currentBet + bb);
        if (me) amount = Math.min(amount, me.stack + myBet);
        doAction('raise', amount);
        const rc = el.raiseControls();
        if (rc) rc.classList.remove('visible');
      });
    });

    // Split offer
    const splitAccept = $('split-accept');
    const splitDecline = $('split-decline');
    if (splitAccept) splitAccept.addEventListener('click', onSplitAccept);
    if (splitDecline) splitDecline.addEventListener('click', onSplitDecline);

    const nextHand = $('next-hand-btn');
    if (nextHand) nextHand.addEventListener('click', () => {
      const wo = el.winnerOverlay();
      if (wo) wo.classList.remove('visible');
      checkForNewHand();
    });
  }

  function getMyPlayer() {
    return players.find(p => p.seat_position === mySeat) || null;
  }

  function isMyTurn() {
    if (gameState.current_player_index < 0) return false;
    const currentPlayer = players[gameState.current_player_index];
    return currentPlayer && currentPlayer.seat_position === mySeat;
  }

  function doAction(action, amount) {
    if (!isMyTurn() && !isLocalMode) {
      showToast("It's not your turn", null);
      return;
    }

    clearActionTimer();
    const eng = new G.HoldemGame();
    const result = eng.processAction(gameState, players, mySeat, action, amount || 0);

    if (result.error) {
      showToast(result.error, 'red');
      return;
    }

    gameState = result.gameState;
    players = result.players;

    const me = getMyPlayer();
    if (me) myHoleCards = me.hole_cards || [];

    logAction(mySeat, action, amount);

    if (!isLocalMode) {
      syncGameToSupabase();
    }

    if (result.isHandComplete) {
      handleHandComplete();
    } else {
      renderAll();
      startActionTimer();
      setTimeout(() => maybeRunAI(), 300);
    }
  }

  function maybeRunAI() {
    if (!isLeader && !isLocalMode) return;
    if (gameState.stage === 'hand_complete' || gameState.stage === 'waiting') return;
    if (gameState.current_player_index < 0) return;

    const currentPlayer = players[gameState.current_player_index];
    if (!currentPlayer || !currentPlayer.is_ai) return;

    // Simulate thinking delay
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => runAITurn(currentPlayer), delay);
  }

  function runAITurn(aiPlayer) {
    if (!aiPlayer.is_ai) return;
    if (gameState.stage === 'hand_complete' || gameState.stage === 'waiting') return;

    const aiAction = G.getAIAction(aiPlayer, {
      communityCards: gameState.community_cards || [],
      pot: gameState.hand_pot || gameState.pot || 0,
      currentBet: gameState.current_bet || 0,
      stage: gameState.stage,
      small_blind: gameState.small_blind,
      big_blind: gameState.big_blind,
    });

    clearActionTimer();
    const eng = new G.HoldemGame();
    const result = eng.processAction(gameState, players, aiPlayer.seat_position, aiAction.action, aiAction.amount || 0);

    if (result.error) {
      console.warn('AI action error:', result.error);
      const fallback = eng.processAction(gameState, players, aiPlayer.seat_position, 'fold');
      if (!fallback.error) {
        gameState = fallback.gameState;
        players = fallback.players;
      }
    } else {
      gameState = result.gameState;
      players = result.players;
    }

    logAction(aiPlayer.seat_position, aiAction.action, aiAction.amount);

    if (!isLocalMode) {
      syncGameToSupabase();
    }

    if (result.isHandComplete) {
      handleHandComplete();
    } else {
      renderAll();
      startActionTimer();
      setTimeout(() => maybeRunAI(), 200);
    }
  }

  function handleHandComplete() {
    clearActionTimer();
    renderAll();

    const winners = gameState.winners || [];
    const handResults = gameState.hand_results || [];

    // Reveal all cards
    setTimeout(() => revealAllCards(handResults), 500);

    // Show winner after cards revealed
    setTimeout(() => {
      showWinner(winners, handResults);
    }, winners[0]?.handName ? 2000 : 800);
  }

  function checkForNewHand() {
    const eng = new G.HoldemGame();
    const gameOver = eng.checkGameOver(players);

    if (gameOver) {
      showGameWinner(gameOver);
      return;
    }

    if (!isLocalMode) {
      const humans = players.filter(p => !p.is_ai && p.stack > 0);
      if (humans.length === 2) {
        offerSplit(humans);
        return;
      }
    } else {
      const actives = players.filter(p => p.stack > 0);
      if (actives.length === 2 && actives.some(p => !p.is_ai) && actives.every(p => !p.is_ai || actives.filter(pp => !pp.is_ai).length >= 1)) {
        // skip split in local mode for simplicity
      }
    }

    // Advance dealer and start next hand
    const eng2 = new G.HoldemGame();
    gameState.dealer_seat = eng2.nextDealerSeat(gameState.dealer_seat, players);
    startNewHand();
  }

  // ── Timer ──────────────────────────────────────────────────
  function startActionTimer() {
    clearActionTimer();
    if (!isMyTurn()) return;

    actionSecondsLeft = G.ACTION_TIMEOUT_SECS;
    updateActionTimerUI();

    actionTimerInterval = setInterval(() => {
      actionSecondsLeft--;
      updateActionTimerUI();
      if (actionSecondsLeft <= 0) {
        clearActionTimer();
        doAction('fold');
        showToast('Auto-folded (time expired)', 'red');
      }
    }, 1000);
  }

  function clearActionTimer() {
    if (actionTimerInterval) {
      clearInterval(actionTimerInterval);
      actionTimerInterval = null;
    }
    const timerBar = document.querySelector('.action-timer-bar');
    if (timerBar) {
      timerBar.style.width = '100%';
      timerBar.classList.remove('warning', 'danger');
    }
  }

  function updateActionTimerUI() {
    const pct = (actionSecondsLeft / G.ACTION_TIMEOUT_SECS) * 100;
    const timerBar = document.querySelector(`.seat[data-seat="${mySeat}"] .action-timer-bar`);
    if (timerBar) {
      timerBar.style.width = pct + '%';
      timerBar.classList.remove('warning', 'danger');
      if (pct <= 30) timerBar.classList.add('warning');
      if (pct <= 15) { timerBar.classList.remove('warning'); timerBar.classList.add('danger'); }
    }
  }

  function startBlindTimer() {
    if (blindTimerInterval) clearInterval(blindTimerInterval);
    if (!gameState.blind_timer_start) return;

    blindTimerInterval = setInterval(() => {
      const { remaining, progress } = G.getBlindProgress(gameState.blind_timer_start);
      const hudTimer = el.hudTimer();
      if (hudTimer) hudTimer.textContent = G.formatTime(remaining);
      const bar = el.hudBlindBar();
      if (bar) bar.style.width = (progress * 100) + '%';

      // Check if blind level changed
      const blind = G.getBlindLevel(gameState.blind_timer_start);
      if (blind.level !== (gameState.blind_level || 1)) {
        gameState.blind_level = blind.level;
        gameState.small_blind = blind.sb;
        gameState.big_blind = blind.bb;
        showToast(`Blinds up! ${G.formatMoney(blind.sb)}/${G.formatMoney(blind.bb)}`, 'gold');
        renderHUD();
      }
    }, 1000);
  }

  // ── Render ─────────────────────────────────────────────────
  function renderAll() {
    renderHUD();
    renderSeats();
    renderCommunityCards();
    renderPot();
    renderDealerButton();
    renderActionPanel();
    renderHandStrength();
  }

  function renderHUD() {
    const blind = G.getBlindLevel(gameState.blind_timer_start || new Date().toISOString());
    const hl = el.hudLevel();
    if (hl) hl.textContent = `Level ${blind.level}`;
    const hb = el.hudBlinds();
    if (hb) hb.textContent = `${G.formatMoney(blind.sb)} / ${G.formatMoney(blind.bb)}`;

    const activePlayers = players.filter(p => p.status !== 'eliminated' && p.stack > 0).length;
    const hp = el.hudPlayers();
    if (hp) hp.textContent = `${activePlayers} players`;
    const hh = el.hudHand();
    if (hh) hh.textContent = gameState.hand_number ? `Hand #${gameState.hand_number}` : '';
  }

  function renderSeats() {
    for (let seat = 0; seat < G.NUM_SEATS; seat++) {
      const seatEl = document.querySelector(`.seat[data-seat="${seat}"]`);
      if (!seatEl) continue;
      const player = players.find(p => p.seat_position === seat);

      if (!player) {
        renderEmptySeat(seatEl, seat);
        continue;
      }

      // CSS classes
      seatEl.classList.remove('active', 'folded', 'eliminated', 'all-in', 'hero', 'ai');
      if (player.seat_position === mySeat) seatEl.classList.add('hero');
      if (player.is_ai) seatEl.classList.add('ai');
      if (player.status === 'folded') seatEl.classList.add('folded');
      if (player.status === 'eliminated') seatEl.classList.add('eliminated');
      if (player.status === 'all_in') seatEl.classList.add('all-in');
      if (players[gameState.current_player_index]?.seat_position === seat) seatEl.classList.add('active');

      // Avatar
      const avatarEl = seatEl.querySelector('.seat-avatar');
      if (avatarEl) {
        const initials = (player.username || 'P').slice(0, 2).toUpperCase();
        if (player.avatar_url && !player.avatar_url.includes('YOUR')) {
          avatarEl.innerHTML = `<img src="${player.avatar_url}" alt="${initials}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
        } else if (player.is_ai) {
          const emojiIdx = parseInt(player.player_id?.replace(/\D/g, '') || seat) % G.AI_AVATARS.length;
          avatarEl.textContent = G.AI_AVATARS[emojiIdx];
        } else {
          avatarEl.textContent = initials;
        }
      }

      // Name
      const nameEl = seatEl.querySelector('.seat-name');
      if (nameEl) {
        let label = player.username || 'Player';
        if (gameState.sb_seat === seat) label += ' 🔵SB';
        else if (gameState.bb_seat === seat) label += ' 🔴BB';
        nameEl.textContent = label;
      }

      // Stack
      const stackEl = seatEl.querySelector('.seat-stack');
      if (stackEl) stackEl.textContent = G.formatMoney(player.stack);

      // Status badge
      const statusEl = seatEl.querySelector('.seat-status');
      if (statusEl) {
        statusEl.textContent =
          player.status === 'folded' ? 'Folded' :
          player.status === 'all_in' ? 'All-In' :
          player.status === 'eliminated' ? 'Out' : '';
      }

      // Hole cards
      const cardsEl = seatEl.querySelector('.seat-hole-cards');
      if (cardsEl) {
        cardsEl.innerHTML = '';
        const isMyseat = mySeat >= 0 && seat === mySeat;
        const cards = isMyseat ? myHoleCards : (player.hole_cards || []);
        const faceDown = gameState.stage !== 'showdown' && !isMyseat && !gameState.hand_results;

        if (cards.length > 0 && player.status !== 'eliminated') {
          for (let i = 0; i < 2; i++) {
            const code = cards[i];
            if (code && !faceDown) {
              cardsEl.appendChild(buildCardElement(code, false));
            } else if (player.status !== 'folded' && player.status !== 'eliminated' && gameState.stage && gameState.stage !== 'waiting' && gameState.stage !== 'hand_complete') {
              cardsEl.appendChild(buildCardElement(null, true));
            }
          }
        } else if (gameState.stage && gameState.stage !== 'waiting' && gameState.stage !== 'hand_complete' && player.status === 'active') {
          for (let i = 0; i < 2; i++) {
            cardsEl.appendChild(buildCardElement(null, true));
          }
        }
      }

      // Current bet
      const betEl = seatEl.querySelector('.seat-bet');
      if (betEl) {
        if (player.current_bet > 0) {
          betEl.textContent = G.formatMoney(player.current_bet);
          betEl.style.display = 'block';
        } else {
          betEl.style.display = 'none';
        }
      }

      // Action indicator
      const actionEl = seatEl.querySelector('.action-indicator');
      if (actionEl) {
        const isActive = players[gameState.current_player_index]?.seat_position === seat;
        actionEl.textContent = isActive ? (seat === mySeat ? 'YOUR TURN' : 'THINKING...') : '';
      }
    }
  }

  function renderEmptySeat(seatEl, seat) {
    seatEl.classList.remove('active', 'folded', 'eliminated', 'all-in', 'hero', 'ai');
    const nameEl = seatEl.querySelector('.seat-name');
    if (nameEl) nameEl.textContent = 'Empty';
    const stackEl = seatEl.querySelector('.seat-stack');
    if (stackEl) stackEl.textContent = '';
    const cardsEl = seatEl.querySelector('.seat-hole-cards');
    if (cardsEl) cardsEl.innerHTML = '';
    const betEl = seatEl.querySelector('.seat-bet');
    if (betEl) betEl.style.display = 'none';
  }

  function renderCommunityCards() {
    const cc = el.communityCards();
    if (!cc) return;
    const cards = gameState.community_cards || [];
    const slots = cc.querySelectorAll('.community-card-slot');
    slots.forEach((slot, i) => {
      slot.innerHTML = '';
      if (cards[i]) {
        const cardEl = buildCardElement(cards[i], false);
        slot.appendChild(cardEl);
      }
    });
  }

  function renderPot() {
    const pot = el.potAmount();
    if (pot) {
      const total = gameState.hand_pot || gameState.pot || 0;
      pot.textContent = G.formatMoney(total);
    }
  }

  function renderDealerButton() {
    const dBtn = el.dealerBtn();
    if (!dBtn) return;
    const dealer = gameState.dealer_seat;
    if (dealer !== undefined && dealer >= 0) {
      dBtn.setAttribute('data-near', dealer);
    }
  }

  function renderActionPanel() {
    const panel = el.actionPanel();
    if (!panel) return;

    const myTurn = isMyTurn();
    panel.classList.toggle('hidden', !myTurn);

    if (!myTurn) return;

    const me = getMyPlayer();
    if (!me) return;

    const currentBet = gameState.current_bet || 0;
    const myBet = me.current_bet || 0;
    const callAmount = Math.max(0, currentBet - myBet);
    const canCheck = callAmount === 0;
    const minRaise = currentBet + Math.max(gameState.big_blind || 200, currentBet);
    const canRaise = me.stack > callAmount;

    // Check/Call button
    const checkBtn = el.btnCheck();
    const callBtn = el.btnCall();
    if (checkBtn) { checkBtn.style.display = canCheck ? '' : 'none'; }
    if (callBtn) {
      callBtn.style.display = canCheck ? 'none' : '';
      callBtn.textContent = `Call ${G.formatMoney(callAmount)}`;
    }

    // Raise button
    const raiseBtn = el.btnRaise();
    if (raiseBtn) {
      raiseBtn.disabled = !canRaise;
      raiseBtn.textContent = canCheck ? 'Bet' : 'Raise';
    }

    // Raise slider
    const slider = el.raiseSlider();
    if (slider && canRaise) {
      const maxRaise = me.stack + myBet;
      slider.min = minRaise;
      slider.max = maxRaise;
      slider.step = gameState.big_blind || 100;
      if (parseInt(slider.value) < minRaise) slider.value = minRaise;
      const ra = el.raiseAmount();
      if (ra) ra.textContent = G.formatMoney(parseInt(slider.value));
    }

    // All-in button
    const allinBtn = el.btnAllIn();
    if (allinBtn) allinBtn.textContent = `All-In ${G.formatMoney(me.stack + myBet)}`;

    // Info line
    const info = el.actionInfo();
    if (info) {
      if (currentBet > 0 && !canCheck) {
        info.innerHTML = `To call: <strong>${G.formatMoney(callAmount)}</strong> &nbsp;|&nbsp; Pot: <strong>${G.formatMoney(gameState.hand_pot || gameState.pot || 0)}</strong>`;
      } else {
        info.innerHTML = `Pot: <strong>${G.formatMoney(gameState.hand_pot || gameState.pot || 0)}</strong>`;
      }
    }
  }

  function renderHandStrength() {
    const hs = el.handStrength();
    if (!hs || mySeat < 0) return;

    if (!myHoleCards || myHoleCards.length < 2) {
      hs.style.opacity = '0';
      return;
    }

    const allCards = [...myHoleCards, ...(gameState.community_cards || [])];
    const result = G.evaluateBestHand(allCards);

    if (result) {
      hs.style.opacity = '1';
      hs.querySelector('.name').textContent = result.name || '';
    } else {
      hs.style.opacity = '0';
    }
  }

  // ── Card Builder ───────────────────────────────────────────
  function buildCardElement(code, faceDown = false, animate = false) {
    const div = document.createElement('div');
    div.className = 'card' + (faceDown ? ' face-down' : '') + (animate ? ' dealing' : '');

    if (!faceDown && code) {
      const d = G.cardDisplay(code);
      if (d) {
        div.classList.add(d.color);
        div.innerHTML = `
          <div class="card-face">
            <div class="card-rank">${d.rank}</div>
            <div class="card-suit-corner">${d.suit}</div>
            <div class="card-center-suit">${d.suit}</div>
            <div class="card-corner-bl">
              <div class="card-rank">${d.rank}</div>
              <div class="card-suit-corner">${d.suit}</div>
            </div>
          </div>
          <div class="card-back"></div>`;
      }
    } else {
      div.innerHTML = `<div class="card-face"></div><div class="card-back"></div>`;
    }

    return div;
  }

  function revealAllCards(handResults) {
    if (!handResults) return;
    handResults.forEach(result => {
      const seat = result.seat;
      const seatEl = document.querySelector(`.seat[data-seat="${seat}"]`);
      if (!seatEl) return;
      const cardsEl = seatEl.querySelector('.seat-hole-cards');
      if (!cardsEl) return;
      cardsEl.innerHTML = '';
      (result.hole_cards || []).forEach(code => {
        const cardEl = buildCardElement(code, false);
        cardEl.classList.add('reveal');
        cardsEl.appendChild(cardEl);
      });
    });
  }

  // ── Winner Display ─────────────────────────────────────────
  function showWinner(winners, handResults) {
    if (!winners || winners.length === 0) return;

    const overlay = el.winnerOverlay();
    if (!overlay) return;

    const topWinner = winners[0];
    const winnerPlayer = players.find(p => p.seat_position === topWinner.seat);
    const winnerName = winnerPlayer?.username || 'Winner';
    const winnerResult = handResults?.find(r => r.seat === topWinner.seat);

    const titleEl = el.winnerTitle();
    if (titleEl) titleEl.textContent = winners.length === 1 && !topWinner.handName ? 'Winner!' : '🏆 Winner!';

    const nameEl = el.winnerName();
    if (nameEl) nameEl.textContent = winnerName;

    const amountEl = el.winnerAmount();
    if (amountEl) amountEl.textContent = `Wins ${G.formatMoney(topWinner.amount)}`;

    const handEl = el.winnerHand();
    if (handEl) handEl.textContent = topWinner.handName || (winnerResult?.hand?.name || '');

    const cardsContainer = el.winnerCards();
    if (cardsContainer) {
      cardsContainer.innerHTML = '';
      const cards = winnerResult?.hand?.bestCards || winnerResult?.hole_cards || [];
      cards.slice(0, 5).forEach(code => {
        cardsContainer.appendChild(buildCardElement(code, false));
      });
    }

    overlay.classList.add('visible');
    launchConfetti();

    addLog(`${winnerName} wins ${G.formatMoney(topWinner.amount)}${topWinner.handName ? ' with ' + topWinner.handName : ''}`);
  }

  function showGameWinner(player) {
    const overlay = el.winnerOverlay();
    if (!overlay) return;

    const titleEl = el.winnerTitle();
    if (titleEl) titleEl.textContent = '🏆 CHAMPION!';

    const nameEl = el.winnerName();
    if (nameEl) nameEl.textContent = player.username || 'Player';

    const amountEl = el.winnerAmount();
    if (amountEl) amountEl.textContent = `Wins the tournament!`;

    const handEl = el.winnerHand();
    if (handEl) handEl.textContent = `Final Stack: ${G.formatMoney(player.stack)}`;

    overlay.classList.add('visible');
    launchConfetti();

    // Hide next hand button
    const nextBtn = $('next-hand-btn');
    if (nextBtn) nextBtn.style.display = 'none';
  }

  function launchConfetti() {
    const container = document.querySelector('.winner-confetti');
    if (!container) return;
    container.innerHTML = '';
    const colors = ['#d4af37', '#c0392b', '#2471a3', '#27ae60', '#8e44ad', '#f39c12'];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * -10}%;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        width: ${4 + Math.random() * 8}px;
        height: ${4 + Math.random() * 8}px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        animation-duration: ${2 + Math.random() * 3}s;
        animation-delay: ${Math.random() * 1.5}s;
      `;
      container.appendChild(piece);
    }
  }

  // ── Split Offer ────────────────────────────────────────────
  function offerSplit(twoPlayers) {
    const overlay = el.splitOverlay();
    if (!overlay) return;

    const totalChips = twoPlayers.reduce((s, p) => s + p.stack, 0);
    const half = Math.floor(totalChips / 2);

    const amounts = overlay.querySelectorAll('.split-amount');
    twoPlayers.forEach((p, i) => {
      if (amounts[i]) {
        amounts[i].querySelector('.name').textContent = p.username || 'Player';
        amounts[i].querySelector('.chips').textContent = G.formatMoney(half);
      }
    });

    overlay.classList.add('visible');
  }

  function onSplitAccept() {
    const overlay = el.splitOverlay();
    if (overlay) overlay.classList.remove('visible');
    showToast('Split agreed! Game over.', 'gold');
    const twoLeft = players.filter(p => p.stack > 0);
    const total = twoLeft.reduce((s, p) => s + p.stack, 0);
    const half = Math.floor(total / 2);
    twoLeft.forEach(p => {
      const idx = players.findIndex(pp => pp.seat_position === p.seat_position);
      if (idx >= 0) players[idx] = { ...players[idx], stack: half };
    });
    showGameWinner({ username: 'Both Players', stack: half });
  }

  function onSplitDecline() {
    const overlay = el.splitOverlay();
    if (overlay) overlay.classList.remove('visible');
    checkForNewHand();
  }

  // ── Toast ──────────────────────────────────────────────────
  function showToast(msg, type) {
    const container = el.toastContainer();
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast' + (type ? ' ' + type : '');
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ── Game Log ───────────────────────────────────────────────
  function addLog(msg) {
    const log = el.logPanel();
    if (!log) return;
    const entry = document.createElement('div');
    entry.className = 'game-log-entry';
    entry.textContent = msg;
    log.prepend(entry);
    // Keep last 50 entries
    while (log.children.length > 50) log.lastChild.remove();
  }

  function logAction(seat, action, amount) {
    const player = players.find(p => p.seat_position === seat);
    const name = player?.username || `Seat ${seat}`;
    const actionLabels = {
      fold: 'folds',
      check: 'checks',
      call: 'calls',
      raise: `raises to ${G.formatMoney(amount)}`,
      bet: `bets ${G.formatMoney(amount)}`,
      all_in: `goes all-in for ${G.formatMoney(amount || (player?.stack || 0))}`,
    };
    addLog(`${name} ${actionLabels[action] || action}`);
  }

  // ── Loading ────────────────────────────────────────────────
  function hideLoading() {
    const lo = el.loadingOverlay();
    if (lo) lo.classList.add('hidden');
  }

  // ── Start ──────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

})();
