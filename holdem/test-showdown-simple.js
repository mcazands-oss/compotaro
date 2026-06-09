/* ============================================================
   test-showdown-simple.js — Simple test of showdown logic
   ============================================================ */

const GameEngine = require('./game.js');
const { HoldemGame } = GameEngine;

console.log('\n🎰 Testing Texas Holdem Showdown Bug\n');
console.log('========================================\n');

// Create a simple scenario: 3 players, 1 folds preflop, 2 go to showdown
const game = new HoldemGame();
const gameState = game.createGameState('TEST001');
gameState.blind_timer_start = new Date().toISOString();

const players = [
  { ...game.createPlayerState('player1', 'Alice', 0), hole_cards: ['As', 'Ks'], status: 'folded', current_bet: 100 },
  { ...game.createPlayerState('player2', 'Bob', 1), hole_cards: ['Qh', 'Qd'], status: 'active', current_bet: 100 },
  { ...game.createPlayerState('player3', 'Charlie', 2), hole_cards: ['Jh', 'Jd'], status: 'active', current_bet: 100 },
];

const testGameState = {
  ...gameState,
  stage: 'showdown',
  pot: 300,
  community_cards: ['2h', '3d', '4c', '5s', '6h'],
  player_hand_bets: [
    { seat_position: 0, player_id: 'player1', hand_bet: 100, status: 'folded' },
    { seat_position: 1, player_id: 'player2', hand_bet: 100, status: 'active' },
    { seat_position: 2, player_id: 'player3', hand_bet: 100, status: 'active' },
  ],
};

console.log('SCENARIO: 3 players, Alice folds, Bob and Charlie go to showdown\n');
console.log('Players:');
players.forEach(p => {
  console.log(`  ${p.username} (seat ${p.seat_position}): ${p.hole_cards.join(',')} - status: ${p.status}`);
});

console.log('\nCommunity cards:', testGameState.community_cards.join(','));
console.log('Pot:', testGameState.pot);

// Resolve the hand
const result = game.resolveHand(testGameState, players);

console.log('\n--- RESULTS ---\n');

console.log('hand_results:');
if (result.gameState.hand_results) {
  result.gameState.hand_results.forEach(hr => {
    const player = result.players.find(p => p.seat_position === hr.seat);
    console.log(`  Seat ${hr.seat}: ${player?.username} - ${hr.hand?.name} - ${hr.hole_cards?.join(',')}`);
  });

  // BUG CHECK
  const aliceInResults = result.gameState.hand_results.find(hr => hr.seat === 0);
  if (aliceInResults) {
    console.log('\n❌ BUG: Alice (folded) appears in hand_results!');
    console.log('   Folded players should NOT show their cards at showdown');
  } else {
    console.log('\n✓ PASS: Alice (folded) NOT in hand_results');
  }
} else {
  console.log('  (none)');
}

console.log('\nWinners:');
if (result.gameState.winners) {
  result.gameState.winners.forEach(w => {
    const player = result.players.find(p => p.seat_position === w.seat);
    console.log(`  Seat ${w.seat}: ${player?.username} wins ${GameEngine.formatMoney(w.amount)} with ${w.handName}`);
    
    // Check if this is a folded player
    if (result.players[w.seat]?.status === 'folded') {
      console.log('❌ BUG: A folded player won the pot!');
    }
  });
} else {
  console.log('  (none)');
}

console.log('\nFinal player stacks:');
result.players.forEach(p => {
  console.log(`  ${p.username}: ${GameEngine.formatMoney(p.stack)}`);
});

console.log('\n========================================\n');
