/* ============================================================
   test-showdown-fix.js — Test suite for fold status fix
   ============================================================ */

const GameEngine = require('./game.js');
const { HoldemGame } = GameEngine;

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passCount++;
  } catch (e) {
    console.log(`✗ ${name}: ${e.message}`);
    failCount++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

console.log('\n🎰 Texas Holdem Showdown Fix Test Suite\n');
console.log('==========================================\n');

// Test 1: Folded players don't appear in hand_results
test('Folded players NOT in hand_results', () => {
  const game = new HoldemGame();
  const players = [
    { ...game.createPlayerState('p1', 'Alice', 0), hole_cards: ['As', 'Ks'], status: 'folded', current_bet: 100 },
    { ...game.createPlayerState('p2', 'Bob', 1), hole_cards: ['Qh', 'Qd'], status: 'active', current_bet: 100 },
    { ...game.createPlayerState('p3', 'Charlie', 2), hole_cards: ['Jh', 'Jd'], status: 'active', current_bet: 100 },
  ];

  const gameState = {
    ...game.createGameState('TEST001'),
    stage: 'showdown',
    pot: 300,
    community_cards: ['2h', '3d', '4c', '5s', '6h'],
    player_hand_bets: [
      { seat_position: 0, player_id: 'p1', hand_bet: 100, status: 'folded' },
      { seat_position: 1, player_id: 'p2', hand_bet: 100, status: 'active' },
      { seat_position: 2, player_id: 'p3', hand_bet: 100, status: 'active' },
    ],
  };

  const result = game.resolveHand(gameState, players);
  const aliceInResults = result.gameState.hand_results?.find(hr => hr.seat === 0);
  assert(!aliceInResults, 'Folded player should not be in hand_results');
});

// Test 2: Folded players can't win
test('Folded players NOT in winners', () => {
  const game = new HoldemGame();
  const players = [
    { ...game.createPlayerState('p1', 'Alice', 0), hole_cards: ['As', 'Ks'], status: 'folded', current_bet: 100 },
    { ...game.createPlayerState('p2', 'Bob', 1), hole_cards: ['2h', '2d'], status: 'active', current_bet: 100 },
    { ...game.createPlayerState('p3', 'Charlie', 2), hole_cards: ['Jh', 'Jd'], status: 'active', current_bet: 100 },
  ];

  const gameState = {
    ...game.createGameState('TEST002'),
    stage: 'showdown',
    pot: 300,
    community_cards: ['2h', '3d', '4c', '5s', '6h'],
    player_hand_bets: [
      { seat_position: 0, player_id: 'p1', hand_bet: 100, status: 'folded' },
      { seat_position: 1, player_id: 'p2', hand_bet: 100, status: 'active' },
      { seat_position: 2, player_id: 'p3', hand_bet: 100, status: 'active' },
    ],
  };

  const result = game.resolveHand(gameState, players);
  const aliceWins = result.gameState.winners?.find(w => w.seat === 0);
  assert(!aliceWins, 'Folded player should not be in winners');
});

// Test 3: Fold status preserved after showdown
test('Fold status preserved after resolveHand()', () => {
  const game = new HoldemGame();
  const players = [
    { ...game.createPlayerState('p1', 'Alice', 0), hole_cards: ['As', 'Ks'], status: 'folded', current_bet: 100 },
    { ...game.createPlayerState('p2', 'Bob', 1), hole_cards: ['Qh', 'Qd'], status: 'active', current_bet: 100 },
  ];

  const gameState = {
    ...game.createGameState('TEST003'),
    stage: 'showdown',
    pot: 200,
    community_cards: ['2h', '3d', '4c', '5s', '6h'],
    player_hand_bets: [
      { seat_position: 0, player_id: 'p1', hand_bet: 100, status: 'folded' },
      { seat_position: 1, player_id: 'p2', hand_bet: 100, status: 'active' },
    ],
  };

  const result = game.resolveHand(gameState, players);
  const aliceAfter = result.players.find(p => p.seat_position === 0);
  assert(aliceAfter.status === 'folded', 'Folded player should stay folded');
});

// Test 4: Uncontested win (all others folded) - no hand evaluation needed
test('Uncontested win works correctly', () => {
  const game = new HoldemGame();
  const players = [
    { ...game.createPlayerState('p1', 'Alice', 0), hole_cards: ['As', 'Ks'], status: 'folded', current_bet: 100 },
    { ...game.createPlayerState('p2', 'Bob', 1), hole_cards: ['2h', '2d'], status: 'folded', current_bet: 100 },
    { ...game.createPlayerState('p3', 'Charlie', 2), hole_cards: ['Jh', 'Jd'], status: 'active', current_bet: 100 },
  ];

  const gameState = {
    ...game.createGameState('TEST004'),
    stage: 'showdown',
    pot: 300,
    community_cards: ['2h', '3d', '4c', '5s', '6h'],
    player_hand_bets: [
      { seat_position: 0, player_id: 'p1', hand_bet: 100, status: 'folded' },
      { seat_position: 1, player_id: 'p2', hand_bet: 100, status: 'folded' },
      { seat_position: 2, player_id: 'p3', hand_bet: 100, status: 'active' },
    ],
  };

  const result = game.resolveHand(gameState, players);
  
  // Uncontested wins don't populate hand_results (optimization)
  // Charlie should win entire pot
  assert(result.gameState.winners?.length === 1, 'One winner');
  assert(result.gameState.winners[0].seat === 2, 'Charlie wins');
  assert(result.gameState.winners[0].amount === 300, 'Charlie wins full pot');
  
  // Folded players should not be winners
  assert(!result.gameState.winners.find(w => w.seat === 0), 'Alice not in winners');
  assert(!result.gameState.winners.find(w => w.seat === 1), 'Bob not in winners');
});

// Test 5: Next hand deals correctly after fold
test('dealHand() resets folded players to active', () => {
  const game = new HoldemGame();
  let gameState = game.createGameState('TEST005');
  gameState.blind_timer_start = new Date().toISOString();
  
  let players = [
    game.createPlayerState('p1', 'Alice', 0),
    game.createPlayerState('p2', 'Bob', 1),
  ];

  // Simulate a hand where Alice folded
  let result = game.dealHand(gameState, players);
  gameState = result.gameState;
  players = result.players;

  // Alice folds
  result = game.processAction(gameState, players, 0, 'fold');
  players = result.players;
  
  assert(players[0].status === 'folded', 'Alice is folded');

  // Now deal next hand
  gameState.dealer_seat = 1;
  result = game.dealHand(gameState, players);
  const aliceNextHand = result.players.find(p => p.seat_position === 0);
  
  assert(aliceNextHand.status === 'active', 'Alice reset to active for next hand');
});

// Test 6: Hand resolves immediately when all but one fold (the "hung game" bug)
test('Hand resolves when all others fold', () => {
  const game = new HoldemGame();
  let gameState = game.createGameState('TEST006');
  gameState.blind_timer_start = new Date().toISOString();
  
  let players = [
    game.createPlayerState('p1', 'Alice', 0),
    game.createPlayerState('p2', 'Bob', 1),
    game.createPlayerState('p3', 'Charlie', 2),
  ];

  // Deal hand
  let result = game.dealHand(gameState, players);
  gameState = result.gameState;
  players = result.players;
  
  const startIdx = gameState.current_player_index;
  const startPlayer = players[startIdx];
  
  // First player folds
  result = game.processAction(gameState, players, startPlayer.seat_position, 'fold');
  gameState = result.gameState;
  players = result.players;
  
  assert(gameState.stage === 'preflop', 'Still in preflop after first fold');
  
  // Second player folds
  const secondIdx = gameState.current_player_index;
  const secondPlayer = players[secondIdx];
  result = game.processAction(gameState, players, secondPlayer.seat_position, 'fold');
  gameState = result.gameState;
  players = result.players;
  
  // NOW the hand should be resolved
  assert(gameState.stage === 'hand_complete', 'Hand should be complete after two folds');
  assert(gameState.status === 'hand_complete', 'Status should be hand_complete');
  assert(gameState.winners && gameState.winners.length === 1, 'Should have one winner');
  assert(gameState.winners[0].seat === players[2].seat_position, 'Remaining player should win');
});

console.log('\n==========================================');
console.log(`Results: ${passCount} passed, ${failCount} failed`);
console.log('==========================================\n');

if (failCount > 0) {
  process.exit(1);
}
