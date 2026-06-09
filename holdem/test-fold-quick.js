/* ============================================================
   test-fold-quick.js — Quick fold test
   ============================================================ */

const GameEngine = require('./game.js');
const { HoldemGame } = GameEngine;

console.log('\n🎰 Quick Fold Test\n');

// Test scenario: manually set up showdown
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

console.log('SCENARIO: Alice (folded), Bob and Charlie go to showdown\n');
console.log('Players:');
players.forEach(p => {
  console.log(`  ${p.username} (seat ${p.seat_position}): status=${p.status}`);
});

// Resolve
const result = game.resolveHand(gameState, players);

console.log('\n--- RESULTS ---\n');

// Test 1: Check hand_results
console.log('Test 1: hand_results should NOT include Alice');
const aliceInResults = result.gameState.hand_results?.find(hr => hr.seat === 0);
if (aliceInResults) {
  console.log('❌ FAIL: Alice in hand_results');
} else {
  console.log('✓ PASS: Alice NOT in hand_results');
}

// Test 2: Check winners
console.log('\nTest 2: Winners should NOT include Alice');
const aliceWins = result.gameState.winners?.find(w => w.seat === 0);
if (aliceWins) {
  console.log('❌ FAIL: Alice in winners');
} else {
  console.log('✓ PASS: Alice NOT in winners');
}

// Test 3: Check folded player status is preserved
console.log('\nTest 3: Alice status should still be "folded"');
const alicePlayer = result.players.find(p => p.seat_position === 0);
if (alicePlayer.status === 'folded') {
  console.log('✓ PASS: Alice status is "folded"');
} else {
  console.log('❌ FAIL: Alice status is', alicePlayer.status);
}

// Test 4: Only non-folded players get paid
console.log('\nTest 4: Only non-folded players have stack increases');
const stackChanges = result.players.map(p => ({
  name: p.username,
  originalStack: 3500,
  newStack: p.stack,
  change: p.stack - 3500
}));
stackChanges.forEach(sc => {
  if (sc.change > 0) {
    console.log(`  ${sc.name}: ${GameEngine.formatMoney(sc.originalStack)} → ${GameEngine.formatMoney(sc.newStack)} (+${GameEngine.formatMoney(sc.change)})`);
  }
});
const aliceStackIncreased = stackChanges[0].change > 0;
if (aliceStackIncreased) {
  console.log('❌ FAIL: Alice received winnings despite folding');
} else {
  console.log('✓ PASS: Alice did not increase stack');
}

console.log('\n==========================================\n');
