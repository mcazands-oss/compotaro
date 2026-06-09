/* ============================================================
   test-fold-fix.js — Comprehensive test of fold status tracking
   ============================================================ */

const GameEngine = require('./game.js');
const { HoldemGame } = GameEngine;

console.log('\n🎰 Comprehensive Fold Status & Showdown Test\n');
console.log('==========================================\n');

// Create a game
const game = new HoldemGame();
let gameState = game.createGameState('FOLD-TEST-001');
gameState.blind_timer_start = new Date().toISOString();

let players = [
  game.createPlayerState('p1', 'Alice', 0),
  game.createPlayerState('p2', 'Bob', 1),
  game.createPlayerState('p3', 'Charlie', 2),
  game.createPlayerState('p4', 'Diana', 3),
];

// Deal hand
let result = game.dealHand(gameState, players);
gameState = result.gameState;
players = result.players;

console.log('✓ Hand dealt');
console.log(`  Stage: ${gameState.stage}`);
console.log(`  Current bet: ${gameState.current_bet}`);

// Verify initial fold status
console.log('\nInitial player status:');
players.forEach(p => {
  console.log(`  ${p.username} (seat ${p.seat_position}): status=${p.status}`);
});

// Preflop: Player 0 (Alice) folds
console.log('\n--- PREFLOP ---');
console.log('Alice folds...');
result = game.processAction(gameState, players, 0, 'fold');
gameState = result.gameState;
players = result.players;

if (players[0].status === 'folded') {
  console.log('✓ Alice status is now "folded"');
} else {
  console.log('✗ BUG: Alice status is', players[0].status);
}

// Bob raises
console.log('Bob raises to 400...');
result = game.processAction(gameState, players, 1, 'raise', 400);
gameState = result.gameState;
players = result.players;

// Charlie calls
console.log('Charlie calls...');
result = game.processAction(gameState, players, 2, 'call');
gameState = result.gameState;
players = result.players;

// Diana calls
console.log('Diana calls...');
result = game.processAction(gameState, players, 3, 'call');
gameState = result.gameState;
players = result.players;

// Bob checks (SB)
console.log('Bob checks...');
result = game.processAction(gameState, players, 1, 'check');
gameState = result.gameState;
players = result.players;

console.log(`\n✓ Moved to stage: ${gameState.stage}`);

// Check that Alice is still folded after stage advance
if (players[0].status === 'folded') {
  console.log('✓ Alice STILL folded after stage advance (good!)');
} else {
  console.log('✗ BUG: Alice status changed to', players[0].status);
}

// Fast-forward to showdown by having remaining players check
while (gameState.stage !== 'showdown' && gameState.stage !== 'hand_complete') {
  const activeIdx = players.findIndex(p => p.status === 'active');
  if (activeIdx >= 0 && players[activeIdx].current_bet === gameState.current_bet) {
    result = game.processAction(gameState, players, players[activeIdx].seat_position, 'check');
    gameState = result.gameState;
    players = result.players;
  } else if (activeIdx >= 0) {
    result = game.processAction(gameState, players, players[activeIdx].seat_position, 'call');
    gameState = result.gameState;
    players = result.players;
  } else {
    break;
  }
}

console.log(`\n--- SHOWDOWN ---`);
console.log(`Stage: ${gameState.stage}`);

// Verify fold status preserved
console.log('\nPlayer status at showdown:');
players.forEach(p => {
  console.log(`  ${p.username} (seat ${p.seat_position}): status=${p.status}`);
  if (p.seat_position === 0 && p.status !== 'folded') {
    console.log('  ✗ BUG: Alice is not folded!');
  }
});

// Verify hand_results
console.log('\nHand Results (who gets to showdown):');
if (gameState.hand_results && gameState.hand_results.length > 0) {
  gameState.hand_results.forEach(hr => {
    const p = players.find(pl => pl.seat_position === hr.seat);
    console.log(`  Seat ${hr.seat}: ${p?.username} - ${hr.hand?.name}`);
  });

  const aliceInResults = gameState.hand_results.find(hr => hr.seat === 0);
  if (aliceInResults) {
    console.log('\n✗ CRITICAL BUG: Alice (folded) appears in hand_results!');
  } else {
    console.log('\n✓ CORRECT: Alice (folded) NOT in hand_results');
  }
} else {
  console.log('  (none)');
}

// Verify winners
console.log('\nWinners:');
if (gameState.winners && gameState.winners.length > 0) {
  gameState.winners.forEach(w => {
    const p = players.find(pl => pl.seat_position === w.seat);
    console.log(`  Seat ${w.seat}: ${p?.username} wins ${GameEngine.formatMoney(w.amount)} with ${w.handName}`);
    
    if (p?.status === 'folded') {
      console.log('  ✗ CRITICAL BUG: Folded player won!');
    }
  });
} else {
  console.log('  (none)');
}

// Final verification
console.log('\n==========================================');
console.log('SUMMARY:');
console.log('==========================================\n');

let allGood = true;

// Check 1: Alice should be folded throughout
if (players[0].status !== 'folded') {
  console.log('✗ Alice is not marked as folded');
  allGood = false;
} else {
  console.log('✓ Alice correctly marked as folded');
}

// Check 2: Alice should not be in hand_results
if (gameState.hand_results?.find(hr => hr.seat === 0)) {
  console.log('✗ Alice appears in hand_results');
  allGood = false;
} else {
  console.log('✓ Alice NOT in hand_results');
}

// Check 3: Alice should not be in winners
if (gameState.winners?.find(w => w.seat === 0)) {
  console.log('✗ Alice is in winners');
  allGood = false;
} else {
  console.log('✓ Alice NOT in winners');
}

// Check 4: Winners should only be non-folded players
const foldedWinner = gameState.winners?.find(w => {
  const p = players.find(pl => pl.seat_position === w.seat);
  return p?.status === 'folded';
});
if (foldedWinner) {
  console.log('✗ A folded player is in winners');
  allGood = false;
} else {
  console.log('✓ Only non-folded players in winners');
}

console.log('\n==========================================');
if (allGood) {
  console.log('✅ ALL TESTS PASSED!');
} else {
  console.log('❌ SOME TESTS FAILED!');
  process.exit(1);
}
console.log('==========================================\n');
