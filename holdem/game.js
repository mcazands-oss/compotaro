/* ============================================================
   game.js — Shared Texas Hold'em Game Logic
   ============================================================ */

// ── Supabase Configuration ─────────────────────────────────
const SUPABASE_URL = 'https://vjdlcfoqskttumwnfpao.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqZGxjZm9xc2t0dHVtd25mcGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzY1NDEsImV4cCI6MjA5NDk1MjU0MX0.eDWm_6ndwbzzfpofj-FxbVMjkuqWsP63Bu9TeqIyfjw';

let sbClient = null;
function initSupabase() {
  if (typeof window !== 'undefined' && window.supabase) {
    sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return sbClient;
}

// ── Constants ──────────────────────────────────────────────
const RANKS = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
const SUITS = ['h','d','c','s'];
const RANK_VALUES = { '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'T':10,'J':11,'Q':12,'K':13,'A':14 };
const SUIT_SYMBOLS = { h:'♥', d:'♦', c:'♣', s:'♠' };
const SUIT_NAMES   = { h:'Hearts', d:'Diamonds', c:'Clubs', s:'Spades' };
const HAND_NAMES   = ['High Card','One Pair','Two Pair','Three of a Kind','Straight','Flush','Full House','Four of a Kind','Straight Flush'];

const STARTING_STACK = 3500;
const NUM_SEATS = 8;
const ACTION_TIMEOUT_SECS = 30;

const BLIND_SCHEDULE = [
  { level: 1, sb: 100,   bb: 200   },
  { level: 2, sb: 200,   bb: 400   },
  { level: 3, sb: 400,   bb: 800   },
  { level: 4, sb: 800,   bb: 1600  },
  { level: 5, sb: 1600,  bb: 3200  },
  { level: 6, sb: 3200,  bb: 6400  },
  { level: 7, sb: 6400,  bb: 12800 },
  { level: 8, sb: 12800, bb: 25600 },
];
const BLIND_LEVEL_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// AI avatar options
const AI_NAMES = ['Viktor','Magnus','Sofia','Chen','Dmitri','Isabella','Marcus','Yuki'];
const AI_AVATARS = ['🎩','🃏','♠️','🎲','💰','🌹','🦅','🐉'];

// ── Deck Utilities ─────────────────────────────────────────
function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(rank + suit);
    }
  }
  return deck;
}

function shuffle(deck) {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function parseCard(code) {
  if (!code || code.length < 2) return null;
  const rank = code.slice(0, -1);
  const suit = code.slice(-1);
  return { rank, suit, value: RANK_VALUES[rank], code };
}

function cardDisplay(code) {
  const c = parseCard(code);
  if (!c) return null;
  return {
    rank: c.rank === 'T' ? '10' : c.rank,
    suit: SUIT_SYMBOLS[c.suit],
    suitKey: c.suit,
    color: (c.suit === 'h' || c.suit === 'd') ? 'red' : 'black',
    value: c.value,
    code,
  };
}

// ── Hand Evaluation ────────────────────────────────────────
function getCombinations(arr, k) {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  const withFirst = getCombinations(rest, k - 1).map(c => [first, ...c]);
  const withoutFirst = getCombinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

function checkStraight(sortedVals) {
  // sortedVals: descending, already unique or not
  const unique = [...new Set(sortedVals)];
  // Check for regular straights first (from highest to lowest)
  for (let i = 0; i <= unique.length - 5; i++) {
    const slice = unique.slice(i, i + 5);
    if (slice[0] - slice[4] === 4 && new Set(slice).size === 5) {
      return slice[0]; // return high card
    }
  }
  // Check for ace-low straight (A-2-3-4-5) only if no regular straight found
  if (unique.includes(14) && unique.includes(5) && unique.includes(4) && unique.includes(3) && unique.includes(2)) {
    return 5; // wheel is 5-high
  }
  return 0;
}

function evaluate5(cards) {
  // cards: array of parsed card objects {rank, suit, value}
  const vals = cards.map(c => c.value).sort((a, b) => b - a);
  const suits = cards.map(c => c.suit);
  const isFlush = new Set(suits).size === 1;
  const straightHigh = checkStraight(vals);
  const isStraight = straightHigh > 0;

  // Count ranks
  const counts = {};
  for (const v of vals) counts[v] = (counts[v] || 0) + 1;
  const groups = Object.entries(counts)
    .map(([v, c]) => ({ v: Number(v), c }))
    .sort((a, b) => b.c - a.c || b.v - a.v);

  const [g0, g1] = groups;

  if (isFlush && isStraight) {
    const score = straightHigh === 14 && vals[1] === 13 ? [8, 14] : [8, straightHigh];
    return { handRank: score[0], tiebreak: score, name: score[1] === 14 && vals[1] === 13 ? 'Royal Flush' : 'Straight Flush' };
  }
  if (g0.c === 4) return { handRank: 7, tiebreak: [7, g0.v, g1.v], name: 'Four of a Kind' };
  if (g0.c === 3 && g1?.c === 2) return { handRank: 6, tiebreak: [6, g0.v, g1.v], name: 'Full House' };
  if (isFlush) return { handRank: 5, tiebreak: [5, ...vals], name: 'Flush' };
  if (isStraight) return { handRank: 4, tiebreak: [4, straightHigh], name: 'Straight' };
  if (g0.c === 3) {
    const kickers = groups.filter(g => g.c === 1).map(g => g.v);
    return { handRank: 3, tiebreak: [3, g0.v, ...kickers], name: 'Three of a Kind' };
  }
  if (g0.c === 2 && g1?.c === 2) {
    const kicker = groups.find(g => g.c === 1)?.v || 0;
    return { handRank: 2, tiebreak: [2, Math.max(g0.v, g1.v), Math.min(g0.v, g1.v), kicker], name: 'Two Pair' };
  }
  if (g0.c === 2) {
    const kickers = groups.filter(g => g.c === 1).map(g => g.v);
    return { handRank: 1, tiebreak: [1, g0.v, ...kickers], name: 'One Pair' };
  }
  return { handRank: 0, tiebreak: [0, ...vals], name: 'High Card' };
}

function compareHands(a, b) {
  // Returns positive if a > b, negative if a < b, 0 if tie
  for (let i = 0; i < Math.max(a.tiebreak.length, b.tiebreak.length); i++) {
    const av = a.tiebreak[i] || 0;
    const bv = b.tiebreak[i] || 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}

function evaluateBestHand(allCards) {
  // allCards: array of card code strings, 2-7 cards
  const parsed = allCards.map(parseCard).filter(Boolean);
  if (parsed.length < 2) return null;
  if (parsed.length <= 5) return evaluate5(parsed);
  const combos = getCombinations(parsed, 5);
  let best = null;
  for (const combo of combos) {
    const result = evaluate5(combo);
    if (!best || compareHands(result, best) > 0) {
      best = result;
      best.bestCards = combo.map(c => c.code);
    }
  }
  return best;
}

// ── Preflop Hand Strength ──────────────────────────────────
function preflopStrength(holeCards) {
  if (!holeCards || holeCards.length < 2) return 0;
  const [a, b] = holeCards.map(parseCard);
  if (!a || !b) return 0;
  const hi = Math.max(a.value, b.value);
  const lo = Math.min(a.value, b.value);
  const suited = a.suit === b.suit;
  const paired = a.value === b.value;
  const gap = hi - lo;

  if (paired) {
    if (hi >= 14) return 1.0;   // AA
    if (hi >= 13) return 0.95;  // KK
    if (hi >= 12) return 0.90;  // QQ
    if (hi >= 11) return 0.85;  // JJ
    if (hi >= 10) return 0.78;  // TT
    if (hi >= 8)  return 0.65;  // 88-99
    if (hi >= 6)  return 0.52;  // 66-77
    return 0.40;                // lower pairs
  }
  if (hi === 14) { // Ace high
    if (lo >= 13) return suited ? 0.88 : 0.82; // AK
    if (lo >= 12) return suited ? 0.78 : 0.72; // AQ
    if (lo >= 11) return suited ? 0.72 : 0.66; // AJ
    if (lo >= 10) return suited ? 0.65 : 0.58; // AT
    if (lo >= 8)  return suited ? 0.52 : 0.42;
    return suited ? 0.40 : 0.30;
  }
  if (hi === 13) { // King high
    if (lo >= 12) return suited ? 0.68 : 0.62; // KQ
    if (lo >= 11) return suited ? 0.62 : 0.55; // KJ
    if (lo >= 10) return suited ? 0.57 : 0.50; // KT
    return suited ? 0.42 : 0.32;
  }
  if (hi === 12) { // Queen high
    if (lo >= 11) return suited ? 0.60 : 0.53; // QJ
    if (lo >= 10) return suited ? 0.55 : 0.47;
    return suited ? 0.38 : 0.28;
  }
  // Connected / suited connectors
  if (gap <= 1 && suited && hi >= 7) return 0.45;
  if (gap <= 1 && hi >= 8) return 0.35;
  if (suited && gap <= 2 && hi >= 7) return 0.32;
  return Math.max(0.05, 0.25 - gap * 0.03 - (suited ? 0 : 0.05));
}

// ── Pot Odds & Equity Helpers ──────────────────────────────
function estimateEquity(holeCards, communityCards) {
  if (!holeCards || holeCards.length < 2) return 0.5;
  const all = [...holeCards, ...communityCards];
  if (communityCards.length === 0) return preflopStrength(holeCards);
  const result = evaluateBestHand(all);
  if (!result) return 0.3;
  // Normalize hand rank 0-8 to 0-1 with some variance
  const base = result.handRank / 8;
  const tiebreakBonus = (result.tiebreak[1] || 0) / (14 * 8);
  return Math.min(0.98, Math.max(0.02, base * 0.7 + tiebreakBonus + 0.15));
}

// ── AI Logic ──────────────────────────────────────────────
function getAIAction(player, gameState) {
  const { hole_cards = [], stack = 0, current_bet: playerBet = 0 } = player;
  const { communityCards = [], pot = 0, current_bet = 0, stage, small_blind, big_blind } = gameState;

  const callAmount = current_bet - playerBet;
  const canCheck = callAmount <= 0;
  // Minimum raise: if no bet yet, BB; otherwise double the current bet or current + BB, whichever is higher
  const minRaise = current_bet === 0 ? (big_blind || 200) : Math.max(current_bet * 2, current_bet + (big_blind || 200));

  // Random delay to simulate thinking (handled by caller)
  const equity = stage === 'preflop'
    ? preflopStrength(hole_cards)
    : estimateEquity(hole_cards, communityCards);

  const totalPot = pot || 0;
  const potOdds = (totalPot + callAmount) > 0 ? callAmount / (totalPot + callAmount) : 0;
  const rand = Math.random();

  // Aggression factor (0 = passive, 1 = aggressive)
  const aggression = 0.3 + rand * 0.4;

  // Bluff factor
  const bluffChance = 0.08 + rand * 0.06;

  if (equity > 0.85) {
    // Premium hand — always raise/bet
    const raiseSize = Math.min(playerBet + stack, Math.floor(totalPot * (1 + rand * 0.5) + minRaise));
    if (raiseSize >= minRaise && stack >= minRaise) return { action: 'raise', amount: raiseSize };
    if (!canCheck) return { action: 'call' };
    return { action: 'check' };
  }

  if (equity > 0.65) {
    // Strong hand — mostly bet/call
    if (rand < aggression) {
      const raiseSize = Math.min(playerBet + stack, Math.floor(totalPot * 0.6 + minRaise));
      if (raiseSize >= minRaise && stack >= minRaise && !canCheck) return { action: 'raise', amount: raiseSize };
    }
    if (!canCheck) {
      if (equity > potOdds || potOdds < 0.25) return { action: 'call' };
      return { action: 'fold' };
    }
    return { action: 'check' };
  }

  if (equity > 0.45) {
    // Marginal hand — check/fold or small bet
    if (canCheck) {
      if (rand < 0.2) {
        const betSize = Math.min(stack, Math.floor(totalPot * 0.4));
        if (betSize >= (big_blind || 200)) return { action: 'bet', amount: betSize };
      }
      return { action: 'check' };
    }
    if (equity > potOdds + 0.05) return { action: 'call' };
    return { action: 'fold' };
  }

  // Weak hand — mostly fold
  if (canCheck) {
    if (rand < bluffChance) {
      const bluffBet = Math.min(stack, Math.floor(totalPot * 0.7));
      if (bluffBet > 0) return { action: 'bet', amount: bluffBet };
    }
    return { action: 'check' };
  }

  if (rand < bluffChance && !canCheck) return { action: 'raise', amount: Math.min(playerBet + stack, Math.floor(totalPot * 0.8)) };
  return { action: 'fold' };
}

// ── Side Pot Calculation ───────────────────────────────────
function calculateSidePots(players) {
  const active = players.filter(p => p.status !== 'eliminated' && p.current_bet > 0);
  if (!active.length) return [];

  const bets = active.map(p => ({ id: p.player_id || p.seat_position, bet: p.current_bet, status: p.status }));
  const sortedBets = [...bets].sort((a, b) => a.bet - b.bet);

  const pots = [];
  let prev = 0;

  for (let i = 0; i < sortedBets.length; i++) {
    const level = sortedBets[i].bet;
    if (level <= prev) continue;
    const eligible = bets.filter(b => b.bet >= level).map(b => b.id);
    const amount = (level - prev) * bets.filter(b => b.bet >= level).length;
    // Add remainder from those who bet less
    const partial = bets.filter(b => b.bet > prev && b.bet < level).reduce((s, b) => s + (b.bet - prev), 0);
    pots.push({ amount: amount + partial, eligible });
    prev = level;
  }

  return pots;
}

// ── Blind Level ────────────────────────────────────────────
function getBlindLevel(startTime) {
  const elapsed = Date.now() - new Date(startTime).getTime();
  const levelIndex = Math.min(
    Math.floor(elapsed / BLIND_LEVEL_DURATION_MS),
    BLIND_SCHEDULE.length - 1
  );
  return BLIND_SCHEDULE[levelIndex];
}

function getBlindProgress(startTime) {
  const elapsed = Date.now() - new Date(startTime).getTime();
  const levelIndex = Math.min(
    Math.floor(elapsed / BLIND_LEVEL_DURATION_MS),
    BLIND_SCHEDULE.length - 1
  );
  const levelStart = levelIndex * BLIND_LEVEL_DURATION_MS;
  const progress = (elapsed - levelStart) / BLIND_LEVEL_DURATION_MS;
  const remaining = BLIND_LEVEL_DURATION_MS - (elapsed - levelStart);
  return { progress: Math.min(1, progress), remaining, levelIndex };
}

function formatTime(ms) {
  const totalSecs = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Game State Management ──────────────────────────────────
class HoldemGame {
  constructor() {
    this.state = null;
    this.listeners = {};
  }

  on(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  emit(event, data) {
    (this.listeners[event] || []).forEach(fn => fn(data));
  }

  // Create a new game (called when host creates)
  createGameState(gameCode) {
    const deck = shuffle(createDeck());
    return {
      game_id: gameCode,
      status: 'waiting',
      created_at: new Date().toISOString(),
      small_blind: BLIND_SCHEDULE[0].sb,
      big_blind: BLIND_SCHEDULE[0].bb,
      pot: 0,
      community_cards: [],
      current_bet: 0,
      current_player_index: -1,
      blind_level: 1,
      blind_timer_start: null,
      dealer_seat: 0,
      deck: deck,
      stage: 'waiting',
      hand_number: 0,
      side_pots: [],
      last_action: null,
      last_aggressor: -1,
      round_bets: [],
    };
  }

  createPlayerState(userId, username, seatPos, avatarUrl, isAI = false) {
    return {
      player_id: userId || 'ai_' + seatPos,
      game_id: null,
      user_id: userId,
      seat_position: seatPos,
      stack: STARTING_STACK,
      hole_cards: [],
      status: 'active',
      current_bet: 0,
      is_ai: isAI,
      avatar_url: avatarUrl || '',
      username: username || (isAI ? AI_NAMES[seatPos % AI_NAMES.length] : 'Player'),
      has_acted: false,
    };
  }

  // Start a hand
  dealHand(gameState, players) {
    const deck = shuffle(createDeck());
    const activePlayers = players.filter(p => p.status !== 'eliminated' && p.stack > 0);

    if (activePlayers.length < 2) {
      return { error: 'Not enough players' };
    }

    // Reset player states
    const updatedPlayers = players.map(p => ({
      ...p,
      hole_cards: p.status !== 'eliminated' && p.stack > 0 ? [] : p.hole_cards,
      current_bet: 0,
      status: p.status === 'eliminated' ? 'eliminated' : (p.stack > 0 ? 'active' : 'eliminated'),
      has_acted: false,
    }));

    // Deal 2 cards to each active player
    let deckIdx = 0;
    const dealtPlayers = [...updatedPlayers];
    for (let round = 0; round < 2; round++) {
      for (const p of activePlayers) {
        const idx = dealtPlayers.findIndex(dp => dp.seat_position === p.seat_position);
        if (idx >= 0 && dealtPlayers[idx].stack > 0) {
          dealtPlayers[idx] = {
            ...dealtPlayers[idx],
            hole_cards: [...(dealtPlayers[idx].hole_cards || []), deck[deckIdx++]],
          };
        }
      }
    }

    // Determine dealer, SB, BB positions
    const activeSeats = activePlayers.map(p => p.seat_position).sort((a, b) => a - b);
    const dealerPos = gameState.dealer_seat;
    let dealerIdx = activeSeats.findIndex(s => s >= dealerPos);
    if (dealerIdx < 0) dealerIdx = 0;

    const sbIdx = (dealerIdx + 1) % activePlayers.length;
    const bbIdx = (dealerIdx + 2) % activePlayers.length;
    const firstActIdx = activePlayers.length > 2
      ? (dealerIdx + 3) % activePlayers.length
      : sbIdx;

    const sbSeat = activeSeats[sbIdx];
    const bbSeat = activeSeats[bbIdx];
    const firstActSeat = activeSeats[firstActIdx];

    const blindLevel = getBlindLevel(gameState.blind_timer_start || new Date().toISOString());
    const sb = blindLevel.sb;
    const bb = blindLevel.bb;

    // Post blinds
    const finalPlayers = dealtPlayers.map(p => {
      if (p.seat_position === sbSeat) {
        const bet = Math.min(sb, p.stack);
        return { ...p, current_bet: bet, stack: p.stack - bet };
      }
      if (p.seat_position === bbSeat) {
        const bet = Math.min(bb, p.stack);
        return { ...p, current_bet: bet, stack: p.stack - bet };
      }
      return p;
    });

    const newGameState = {
      ...gameState,
      status: 'preflop',
      stage: 'preflop',
      pot: 0, // will be filled as bets come in — track separately
      community_cards: [],
      current_bet: bb,
      current_player_index: finalPlayers.findIndex(p => p.seat_position === firstActSeat),
      deck: deck.slice(deckIdx),
      dealer_seat: activeSeats[dealerIdx],
      sb_seat: sbSeat,
      bb_seat: bbSeat,
      small_blind: sb,
      big_blind: bb,
      hand_number: (gameState.hand_number || 0) + 1,
      side_pots: [],
      last_aggressor: finalPlayers.findIndex(p => p.seat_position === bbSeat),
      round_start_player: firstActSeat,
      hands_acted: 0,
      hand_pot: sb + bb,
    };

    return { gameState: newGameState, players: finalPlayers };
  }

  // Process a player action
  processAction(gameState, players, seatPosition, action, amount = 0) {
    const playerIdx = players.findIndex(p => p.seat_position === seatPosition);
    if (playerIdx < 0) return { error: 'Player not found' };

    const player = players[playerIdx];
    if (player.status === 'folded' || player.status === 'eliminated') return { error: 'Player cannot act' };

    const updatedPlayers = [...players];
    const updatedGame = { ...gameState };
    const callAmount = gameState.current_bet - player.current_bet;

    switch (action) {
      case 'fold':
        updatedPlayers[playerIdx] = { ...player, status: 'folded', has_acted: true };
        break;

      case 'check':
        if (callAmount > 0) return { error: 'Cannot check, must call or fold' };
        updatedPlayers[playerIdx] = { ...player, has_acted: true };
        break;

      case 'call': {
        const toCall = Math.min(callAmount, player.stack);
        const newStatus = toCall >= player.stack ? 'all_in' : player.status;
        updatedPlayers[playerIdx] = {
          ...player,
          stack: player.stack - toCall,
          current_bet: player.current_bet + toCall,
          status: newStatus,
          has_acted: true,
        };
        updatedGame.hand_pot = (gameState.hand_pot || 0) + toCall;
        break;
      }

      case 'bet':
      case 'raise': {
        // amount is the total bet size the player wants to reach
        const bb = gameState.big_blind || 200;
        const minBet = gameState.current_bet === 0 ? bb : gameState.current_bet;
        const raiseAmount = Math.max(amount, minBet);
        
        // Validate that raise amount is at least minimum raise
        const minRaiseAmount = gameState.current_bet === 0 ? bb : gameState.current_bet * 2;
        if (raiseAmount < minRaiseAmount && player.current_bet + player.stack > raiseAmount) {
          // Not a valid raise unless it's all-in
          return { error: `Minimum raise is ${raiseAmount}` };
        }
        
        const toAdd = Math.min(raiseAmount - player.current_bet, player.stack);
        const newBet = player.current_bet + toAdd;
        const newStatus = toAdd >= player.stack ? 'all_in' : player.status;
        updatedPlayers[playerIdx] = {
          ...player,
          stack: player.stack - toAdd,
          current_bet: newBet,
          status: newStatus,
          has_acted: true,
        };
        updatedGame.current_bet = newBet;
        updatedGame.last_aggressor = playerIdx;
        updatedGame.hand_pot = (gameState.hand_pot || 0) + toAdd;
        break;
      }

      case 'all_in': {
        const allInBet = player.current_bet + player.stack;
        updatedPlayers[playerIdx] = {
          ...player,
          current_bet: allInBet,
          stack: 0,
          status: 'all_in',
          has_acted: true,
        };
        if (allInBet > gameState.current_bet) {
          updatedGame.current_bet = allInBet;
          updatedGame.last_aggressor = playerIdx;
        }
        updatedGame.hand_pot = (gameState.hand_pot || 0) + player.stack;
        break;
      }

      default:
        return { error: 'Unknown action' };
    }

    updatedGame.last_action = { seat: seatPosition, action, amount };

    // Check if only one player remains (all others folded)
    const nonFolded = updatedPlayers.filter(p => p.status !== 'folded' && p.status !== 'eliminated');
    if (nonFolded.length <= 1) {
      // Hand is over — resolve immediately
      return this.resolveHand(updatedGame, updatedPlayers);
    }

    // Advance to next player
    const next = this.getNextPlayer(updatedGame, updatedPlayers, playerIdx);
    if (next === null) {
      // Round over — advance stage
      return this.advanceStage(updatedGame, updatedPlayers);
    }

    updatedGame.current_player_index = next;
    return { gameState: updatedGame, players: updatedPlayers };
  }

  getNextPlayer(gameState, players, currentIdx) {
    const total = players.length;
    for (let i = 1; i < total; i++) {
      const idx = (currentIdx + i) % total;
      const p = players[idx];
      // Only active players can be asked to act
      // all_in players cannot act, folded players cannot act
      if (p.status === 'active') {
        // Check if this player needs to act
        if (!p.has_acted || p.current_bet < gameState.current_bet) return idx;
      }
    }
    return null; // No more players to act
  }

  advanceStage(gameState, players) {
    // Collect bets into pot
    const betTotal = players.reduce((s, p) => s + p.current_bet, 0);
    const newPot = (gameState.pot || 0) + betTotal;
    
    // Save original bet amounts before resetting for side pot calculation
    const playerHandBets = players.map(p => ({
      seat_position: p.seat_position,
      player_id: p.player_id,
      hand_bet: p.current_bet,
      status: p.status,
    }));
    
    const resetPlayers = players.map(p => ({
      ...p,
      current_bet: 0,
      has_acted: false,
    }));

    const activePlayers = resetPlayers.filter(
      p => p.status === 'active' || p.status === 'all_in'
    );

    // Check if only one player remains
    const nonFolded = activePlayers.length;
    if (nonFolded <= 1) {
      return this.resolveHand(
        { ...gameState, pot: newPot, stage: 'showdown', player_hand_bets: playerHandBets },
        resetPlayers
      );
    }

    // All remaining are all-in — run it out
    const activeOnly = activePlayers.filter(p => p.status === 'active');

    const stageOrder = ['preflop', 'flop', 'turn', 'river', 'showdown'];
    const currentStageIdx = stageOrder.indexOf(gameState.stage);
    const nextStage = stageOrder[currentStageIdx + 1] || 'showdown';

    let deck = [...(gameState.deck || [])];
    let communityCards = [...(gameState.community_cards || [])];

    if (nextStage === 'flop') {
      communityCards = [deck.shift(), deck.shift(), deck.shift()];
    } else if (nextStage === 'turn' || nextStage === 'river') {
      communityCards = [...communityCards, deck.shift()];
    } else if (nextStage === 'showdown') {
      return this.resolveHand(
        { ...gameState, pot: newPot, community_cards: communityCards, stage: 'showdown', player_hand_bets: playerHandBets },
        resetPlayers
      );
    }

    // Find first active player after dealer
    const dealerSeat = gameState.dealer_seat;
    const activeSortedByPosition = activePlayers
      .filter(p => p.status === 'active')
      .sort((a, b) => {
        const aAfter = a.seat_position > dealerSeat ? a.seat_position : a.seat_position + 100;
        const bAfter = b.seat_position > dealerSeat ? b.seat_position : b.seat_position + 100;
        return aAfter - bAfter;
      });

    let firstToActIdx = 0;
    if (activeSortedByPosition.length > 0) {
      firstToActIdx = resetPlayers.findIndex(
        p => p.seat_position === activeSortedByPosition[0].seat_position
      );
    }

    const newGameState = {
      ...gameState,
      stage: nextStage,
      status: nextStage,
      pot: newPot,
      community_cards: communityCards,
      player_hand_bets: playerHandBets,
      current_bet: 0,
      deck,
      current_player_index: activeOnly.length === 0 ? -1 : firstToActIdx,
      last_aggressor: -1,
    };

    // If all remaining are all-in, skip to showdown
    if (activeOnly.length === 0) {
      return this.runItOut(newGameState, resetPlayers);
    }

    return { gameState: newGameState, players: resetPlayers };
  }

  runItOut(gameState, players) {
    let { community_cards, deck, stage } = gameState;
    let d = [...(deck || [])];
    let cc = [...(community_cards || [])];

    while (cc.length < 5) {
      cc.push(d.shift());
    }

    return this.resolveHand(
      { ...gameState, community_cards: cc, deck: d, stage: 'showdown', status: 'showdown' },
      players
    );
  }

  resolveHand(gameState, players) {
    const nonFolded = players.filter(p => p.status !== 'folded' && p.status !== 'eliminated');
    const pot = gameState.pot || 0;
    
    // Restore original bet amounts for side pot calculation
    let playersForSidePots = nonFolded;
    if (gameState.player_hand_bets && gameState.player_hand_bets.length > 0) {
      playersForSidePots = nonFolded.map(p => {
        const handBet = gameState.player_hand_bets.find(pb => pb.seat_position === p.seat_position);
        if (handBet) {
          return { ...p, current_bet: handBet.hand_bet };
        }
        return p;
      });
    }

    if (nonFolded.length === 1) {
      // Uncontested win
      const winner = nonFolded[0];
      const winnerIdx = players.findIndex(p => p.seat_position === winner.seat_position);
      const updatedPlayers = players.map((p, i) =>
        i === winnerIdx ? { ...p, stack: p.stack + pot, current_bet: 0 } : { ...p, current_bet: 0 }
      );
      const newGameState = {
        ...gameState,
        pot: 0,
        status: 'hand_complete',
        stage: 'hand_complete',
        winners: [{ seat: winner.seat_position, amount: pot, handName: '' }],
      };
      return { gameState: newGameState, players: updatedPlayers, isHandComplete: true };
    }

    // Evaluate hands and award pots
    const community = gameState.community_cards || [];
    const handResults = nonFolded.map(p => {
      const allCards = [...(p.hole_cards || []), ...community];
      const hand = evaluateBestHand(allCards);
      return { player: p, hand, seat: p.seat_position };
    });

    // Sort by hand strength desc
    handResults.sort((a, b) => compareHands(b.hand, a.hand));

    // Calculate side pots using the ORIGINAL player bets (before they're cleared)
    // Only use non-folded players for side pot calculation since they're the only ones who can win
    const sidePots = calculateSidePots(playersForSidePots);
    let updatedPlayers = players.map(p => ({ ...p, current_bet: 0 }));
    const winners = [];

    if (sidePots.length === 0) {
      // All-equal bets or simple case
      const winner = handResults[0];
      const idx = updatedPlayers.findIndex(p => p.seat_position === winner.seat);
      updatedPlayers[idx] = { ...updatedPlayers[idx], stack: updatedPlayers[idx].stack + pot };
      winners.push({ seat: winner.seat, amount: pot, handName: winner.hand?.name || '' });
    } else {
      for (const sidePot of sidePots) {
        // Find best hand among eligible players
        const eligible = handResults.filter(r => sidePot.eligible.includes(r.player.player_id || r.player.seat_position));
        if (!eligible.length) continue;
        eligible.sort((a, b) => compareHands(b.hand, a.hand));
        const winner = eligible[0];
        const idx = updatedPlayers.findIndex(p => p.seat_position === winner.seat);
        if (idx >= 0) {
          updatedPlayers[idx] = { ...updatedPlayers[idx], stack: updatedPlayers[idx].stack + sidePot.amount };
          winners.push({ seat: winner.seat, amount: sidePot.amount, handName: winner.hand?.name || '' });
        }
      }
    }

    // Check if any player is eliminated
    // Note: Don't reset folded/all_in players here — let dealHand() reset them for the next hand
    // This preserves fold status for showdown display
    updatedPlayers = updatedPlayers.map(p => ({
      ...p,
      status: p.stack <= 0 ? 'eliminated' : p.status,
    }));

    const newGameState = {
      ...gameState,
      pot: 0,
      status: 'hand_complete',
      stage: 'hand_complete',
      winners,
      hand_results: handResults.map(r => ({
        seat: r.seat,
        hand: r.hand,
        hole_cards: r.player.hole_cards,
      })),
    };

    return { gameState: newGameState, players: updatedPlayers, isHandComplete: true };
  }

  // Check if game is over (only 1 player with chips)
  checkGameOver(players) {
    const withChips = players.filter(p => p.stack > 0 && p.status !== 'eliminated');
    if (withChips.length === 1) return withChips[0];
    if (withChips.length === 0) return players.reduce((best, p) => (!best || p.stack > best.stack) ? p : best, null);
    return null;
  }

  // Advance dealer seat for next hand
  nextDealerSeat(currentDealer, players) {
    const active = players
      .filter(p => p.status !== 'eliminated' && p.stack > 0)
      .map(p => p.seat_position)
      .sort((a, b) => a - b);
    if (active.length === 0) return currentDealer;
    const idx = active.findIndex(s => s > currentDealer);
    return idx >= 0 ? active[idx] : active[0];
  }
}

// ── Supabase Helpers ───────────────────────────────────────
async function supabaseGetGame(gameCode) {
  if (!sbClient) return null;
  const { data, error } = await sbClient
    .from('games')
    .select('*')
    .eq('game_code', gameCode)
    .single();
  if (error) { console.error('getGame error:', error); return null; }
  return data;
}

async function supabaseGetPlayers(gameCode) {
  if (!sbClient) return [];
  const { data, error } = await sbClient
    .from('players')
    .select('*')
    .eq('game_code', gameCode)
    .order('seat_position');
  if (error) { console.error('getPlayers error:', error); return []; }
  return data || [];
}

async function supabaseUpdateGame(gameId, updates) {
  if (!sbClient) return;
  // Only send known safe columns to avoid schema cache errors
  const safeKeys = ['status','pot','community_cards','current_bet','current_player_index',
    'blind_level','blind_timer_start','stage','dealer_seat','sb_seat','bb_seat','hand_results',
    'small_blind','big_blind','dealer_position'];
  const safeUpdates = Object.fromEntries(Object.entries(updates).filter(([k]) => safeKeys.includes(k)));
  if (Object.keys(safeUpdates).length === 0) return;
  const { error } = await sbClient
    .from('games')
    .update(safeUpdates)
    .eq('game_id', gameId);
  if (error) console.error('updateGame error:', error);
}

async function supabaseUpdatePlayer(playerId, gameId, updates) {
  if (!sbClient) return;
  const { error } = await sbClient
    .from('players')
    .update(updates)
    .eq('player_id', playerId)
    .eq('game_id', gameId);
  if (error) console.error('updatePlayer error:', error);
}

async function supabaseInsertGame(gameData) {
  if (!sbClient) return null;
  const { data, error } = await sbClient
    .from('games')
    .insert(gameData)
    .select()
    .single();
  if (error) { console.error('insertGame error:', error); return null; }
  return data;
}

async function supabaseInsertPlayer(playerData) {
  if (!sbClient) return null;
  // Remove player_id so Supabase auto-generates a UUID
  const { player_id, ...cleanData } = playerData;
  const { data, error } = await sbClient
    .from('players')
    .insert(cleanData)
    .select()
    .single();
  if (error) { console.error('insertPlayer error:', error); return null; }
  return data;
}

async function supabaseSignUp(email, password, username) {
  if (!sbClient) return { error: 'Supabase not initialized' };
  const { data, error } = await sbClient.auth.signUp({ email, password });
  if (error) return { error: error.message };
  if (data.user) {
    await sbClient.from('users').insert({
      user_id: data.user.id,
      email,
      username,
      created_at: new Date().toISOString(),
    });
  }
  return { user: data.user };
}

async function supabaseSignIn(email, password) {
  if (!sbClient) return { error: 'Supabase not initialized' };
  const { data, error } = await sbClient.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { user: data.user, session: data.session };
}

async function supabaseGetSession() {
  if (!sbClient) return null;
  const { data } = await sbClient.auth.getSession();
  return data?.session;
}

async function supabaseGetUser(userId) {
  if (!sbClient) return null;
  const { data, error } = await sbClient
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return data;
}

function generateGameCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ── Local Storage Helpers ──────────────────────────────────
const LS = {
  set(key, val) { try { localStorage.setItem('holdem_' + key, JSON.stringify(val)); } catch(e) {} },
  get(key) { try { return JSON.parse(localStorage.getItem('holdem_' + key)); } catch(e) { return null; } },
  remove(key) { try { localStorage.removeItem('holdem_' + key); } catch(e) {} },
};

// ── Chip Utilities ─────────────────────────────────────────
function chipsFromAmount(amount) {
  const chips = [];
  let rem = amount;
  if (rem >= 5000) { chips.push({ denom: 5000, count: Math.floor(rem / 5000), color: 'purple' }); rem %= 5000; }
  if (rem >= 1000) { chips.push({ denom: 1000, count: Math.floor(rem / 1000), color: 'red' }); rem %= 1000; }
  if (rem >= 500)  { chips.push({ denom: 500,  count: Math.floor(rem / 500),  color: 'blue' }); rem %= 500; }
  if (rem >= 100)  { chips.push({ denom: 100,  count: Math.floor(rem / 100),  color: 'green' }); rem %= 100; }
  if (rem > 0)     { chips.push({ denom: rem,   count: 1,                      color: 'white' }); }
  return chips;
}

function formatMoney(amount) {
  if (!amount && amount !== 0) return '$0';
  return '$' + amount.toLocaleString();
}

// ── Export ─────────────────────────────────────────────────
const GameEngine = {
  // Core
  HoldemGame,
  createDeck,
  shuffle,
  parseCard,
  cardDisplay,
  evaluate5,
  evaluateBestHand,
  compareHands,
  getCombinations,
  preflopStrength,
  estimateEquity,
  getAIAction,
  calculateSidePots,
  // Blind schedule
  BLIND_SCHEDULE,
  getBlindLevel,
  getBlindProgress,
  formatTime,
  // Supabase
  initSupabase,
  supabaseGetGame,
  supabaseGetPlayers,
  supabaseUpdateGame,
  supabaseUpdatePlayer,
  supabaseInsertGame,
  supabaseInsertPlayer,
  supabaseSignUp,
  supabaseSignIn,
  supabaseGetSession,
  supabaseGetUser,
  generateGameCode,
  // Utilities
  formatMoney,
  chipsFromAmount,
  LS,
  // Constants
  STARTING_STACK,
  NUM_SEATS,
  ACTION_TIMEOUT_SECS,
  RANK_VALUES,
  SUIT_SYMBOLS,
  HAND_NAMES,
  AI_NAMES,
  AI_AVATARS,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameEngine;
} else if (typeof window !== 'undefined') {
  window.GameEngine = GameEngine;
}
