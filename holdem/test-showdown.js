/* ============================================================
   test-showdown.js — Test showdown logic with folded players
   ============================================================ */

// Load the GameEngine
const GameEngine = require('./game.js');
const { HoldemGame } = GameEngine;

console.log('\n🎰 Testing Texas Holdem Showdown Logic\n');
console.log('========================================\n');

// Test 1: Verify folded players don't appear in hand_results
console.log('TEST 1: Folded players should NOT appear in hand_results\n');

function createTestGame() {
  const game = new HoldemGame();
  const gameState = game.createGameState('TEST001');
  gameState.blind_timer_start = new Date().toISOString();

  const players = [
    game.createPlayerState('player1', 'Alice', 0),
    game.createPlayerState('player2', 'Bob', 1),
    game.createPlayerState('player3', 'Charlie', 2),
    game.createPlayerState('player4', 'Diana', 3),
  ];

  return { game, gameState, players };
}

// Deal a hand
let { game, gameState, players } = createTestGame();
let result = game.dealHand(gameState, players);
gameState = result.gameState;
players = result.players;

console.log('After deal:');
players.forEach(p => {
  console.log(`  ${p.username} (seat ${p.seat_position}): ${p.hole_cards.join(',')}`);
});

// Simulate preflop betting with one player folding
console.log('\nPreflop actions:');

// Player 0 (UTG) folds
result = game.processAction(gameState, players, 0, 'fold');
gameState = result.gameState;
players = result.players;
console.log('✓ Alice folds');

// Player 1 (UTG+1) raises to 400
result = game.processAction(gameState, players, 1, 'raise', 400);
gameState = result.gameState;
players = result.players;
console.log('✓ Bob raises to 400');

// Player 2 calls
result = game.processAction(gameState, players, 2, 'call');
gameState = result.gameState;
players = result.players;
console.log('✓ Charlie calls');

// Player 3 calls
result = game.processAction(gameState, players, 3, 'call');
gameState = result.gameState;
players = result.players;
console.log('✓ Diana calls');

// Player 1 checks (SB)
result = game.processAction(gameState, players, 1, 'check');
gameState = result.gameState;
players = result.players;
console.log('✓ Bob checks (SB)');

console.log(`\nBefore flop: gameState.stage = ${gameState.stage}`);

// Process to flop
if (gameState.stage === 'flop') {
  console.log(`✓ Advanced to flop`);
  console.log(`  Community cards: ${gameState.community_cards.join(',')}`);
} else {
  console.log(`✗ Should be at flop but at: ${gameState.stage}`);
}

// Continue to showdown (fast-forward - have remaining players all-in)
console.log('\nFast-forwarding to showdown...');
while (gameState.stage !== 'showdown' && gameState.stage !== 'hand_complete') {
  const activeIdx = players.findIndex(p => p.status === 'active' && p.current_bet === 0);
  if (activeIdx >= 0) {
    result = game.processAction(gameState, players, players[activeIdx].seat_position, 'check');
    gameState = result.gameState;
    players = result.players;
  } else {
    break;
  }
}

console.log(`\nAt showdown:`);
console.log(`  gameState.stage = ${gameState.stage}`);
console.log(`  gameState.hand_results exists: ${!!gameState.hand_results}`);

if (gameState.hand_results) {
  console.log(`  hand_results count: ${gameState.hand_results.length}`);
  gameState.hand_results.forEach(hr => {
    const player = players.find(p => p.seat_position === hr.seat);
    console.log(`    - Seat ${hr.seat}: ${player?.username} - ${hr.hand?.name}`);
  });

  // BUG CHECK: Alice folded, she should NOT be in hand_results
  const aliceInResults = gameState.hand_results.find(hr => hr.seat === 0);
  if (aliceInResults) {
    console.log('\n❌ BUG FOUND: Alice (folded) appears in hand_results!');
  } else {
    console.log('\n✓ CORRECT: Alice (folded) does NOT appear in hand_results');
  }

  // Check winners
  console.log('\nWinners:');
  gameState.winners.forEach(w => {
    console.log(`  - Seat ${w.seat}: ${w.handName || 'uncontested'} - ${GameEngine.formatMoney(w.amount)}`);
  });

  // BUG CHECK: Folded player shouldn't be in winners
  const foldedWinner = gameState.winners.find(w => {
    const player = players.find(p => p.seat_position === w.seat);
    return player?.status === 'folded';
  });
  if (foldedWinner) {
    console.log('\n❌ BUG FOUND: A folded player won the pot!');
  } else {
    console.log('✓ CORRECT: Only non-folded players in winners');
  }
} else {
  console.log('No hand_results found');
}

console.log('\n========================================\n');
console.log('TEST 2: Verify player status tracking\n');

players.forEach(p => {
  console.log(`  ${p.username} (seat ${p.seat_position}): status=${p.status}, stack=${p.stack}`);
});

console.log('\n========================================\n');
