# Texas Hold'em Fold Hang Fix

## Problem Description

After an opponent folds and the hand should complete (e.g., uncontested win), the game could enter a hung state where:
- The opponent appears with status "Folded"
- But also shows "THINKING..." action indicator
- With the action timer running
- Game appears stuck, no further actions possible

## Root Cause Analysis

### The Bug

When `resolveHand()` was called after a fold that ended the hand:
1. Game stage was correctly set to `'hand_complete'`
2. Game status was set to `'hand_complete'`
3. **BUT** - `current_player_index` was NOT updated
4. It retained its old value pointing to a player (possibly the one who just folded)

### Why This Caused Issues

**Frontend Rendering:**
```javascript
// In renderSeats()
const isActive = players[gameState.current_player_index]?.seat_position === seat;
if (isActive) seatEl.classList.add('active');  // Shows timer, "THINKING..."
```

Even though `stage === 'hand_complete'`, if `current_player_index` still pointed to a folded player, that player would:
- Get the 'active' CSS class
- Show "THINKING..." action indicator
- Display the action timer

**Race Conditions in Async Flow:**
```javascript
// In maybeRunAI()
if (gameState.stage === 'hand_complete' || gameState.stage === 'waiting') return;

const currentPlayer = players[gameState.current_player_index];
// Could capture a folded player in closure
setTimeout(() => runAITurn(currentPlayer), delay);  // Might act on folded player
```

With Supabase listeners receiving updates asynchronously:
1. Player record updates could arrive before game state updates
2. Frontend could briefly render inconsistent state
3. AI logic could schedule actions for players who are already folded

### State Corruption Scenario

```
Sequence of events:
1. Player A folds
2. resolveHand() called
3. gameState.stage = 'hand_complete' ✓
4. gameState.current_player_index = [old value pointing to Player A] ✗
5. Supabase listener updates player records
6. renderSeats() sees:
   - players[current_player_index] = Player A (folded)
   - stage = 'hand_complete'
   - But still renders "THINKING" because check wasn't defensive
```

## Solution

### Backend Fix (game.js)

**In `resolveHand()` method - Uncontested win case:**
```javascript
const newGameState = {
  ...gameState,
  pot: 0,
  status: 'hand_complete',
  stage: 'hand_complete',
  current_player_index: -1,  // ← FIX: Clear player index
  winners: [{ seat: winner.seat_position, amount: pot, handName: '' }],
};
```

**In `resolveHand()` method - Showdown case:**
```javascript
const newGameState = {
  ...gameState,
  pot: 0,
  status: 'hand_complete',
  stage: 'hand_complete',
  current_player_index: -1,  // ← FIX: Clear player index
  winners,
  hand_results: handResults.map(r => ({...})),
};
```

### Frontend Defensive Checks (player.js)

**In `renderSeats()` - Active class:**
```javascript
// OLD CODE (vulnerable to race conditions)
if (players[gameState.current_player_index]?.seat_position === seat) 
  seatEl.classList.add('active');

// NEW CODE (defensive)
if (gameState.stage !== 'hand_complete' && 
    players[gameState.current_player_index]?.seat_position === seat) 
  seatEl.classList.add('active');
```

**In `renderSeats()` - Action indicator:**
```javascript
// OLD CODE
const isActive = players[gameState.current_player_index]?.seat_position === seat;
actionEl.textContent = isActive ? (seat === mySeat ? 'YOUR TURN' : 'THINKING...') : '';

// NEW CODE (defensive)
const isActive = gameState.stage !== 'hand_complete' && 
                 players[gameState.current_player_index]?.seat_position === seat;
actionEl.textContent = isActive ? (seat === mySeat ? 'YOUR TURN' : 'THINKING...') : '';
```

## Why This Fix Works

1. **Consistent Game State:** `current_player_index = -1` clearly indicates no one is acting

2. **Prevents State Corruption:** Even if race conditions occur with Supabase updates, `stage === 'hand_complete'` takes precedence in defensive checks

3. **Matches advanceStage() Pattern:** The `advanceStage()` method already properly set `current_player_index`:
   ```javascript
   current_player_index: activeOnly.length === 0 ? -1 : firstToActIdx
   ```
   Now `resolveHand()` follows the same pattern

4. **Defensive Frontend:** Frontend checks explicitly guard against showing action indicators when hand is complete, catching any remaining edge cases

## Testing

### Scenario 1: Uncontested Win (2 Players)
1. Deal hand with 2 players
2. Player 1 folds
3. Expected: `stage = 'hand_complete'`, `current_player_index = -1`
4. Result: ✓ No "THINKING" indicator on Player 2

### Scenario 2: Uncontested Win (3+ Players)
1. Deal hand with 3+ players
2. All but one player folds
3. Expected: `stage = 'hand_complete'`, `current_player_index = -1`
4. Result: ✓ No hung state

### Scenario 3: Showdown (Multiple Players with Cards)
1. Deal hand with 2+ players
2. All players reach showdown (no folds)
3. Cards are evaluated
4. Expected: `stage = 'hand_complete'`, `current_player_index = -1`
5. Result: ✓ Proper showdown display, no action timer

## Files Changed
- `holdem/game.js` - Lines 770, 827: Added `current_player_index: -1` in both `resolveHand()` return statements
- `holdem/player.js` - Lines 829, 907: Added defensive `stage !== 'hand_complete'` check before showing active/thinking state

## Commits
- `eb0e9f4` - Fix: Clear current_player_index when hand completes to prevent hung state
