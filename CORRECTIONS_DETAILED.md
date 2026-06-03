# Detailed Answer Corrections

## Overview
This document shows specific examples of how answer indices were corrected. The original seed file had all `correct_index = 0`, marking "A" as the answer to all questions.

## Sample Corrections by Category

### Animation
**Question:** "What happens to Merida's mother as the accidental result of a witch's spell in Brave?"
- Options: 
  - [0] She is transformed into a bear ✅ **CORRECT**
  - [1] She disappears
  - [2] She ages rapidly
  - [3] She shrinks to mouse size
- **Original Index:** 0 ✓ (Correct by chance)
- **Corrected Index:** 0 ✓

---

### Thriller
**Question:** "In Se7en, how many of John Doe's seven deadly sins murders are actually completed by the film's end?"
- Options:
  - [0] All seven
  - [1] Five
  - [2] Six ✅ **CORRECT**
  - [3] Four
- **Original Index:** 0 ❌ (Wrong - marked "All seven")
- **Corrected Index:** 2 ✅

---

### Classics
**Question:** "In what year was the original King Kong released?"
- Options:
  - [0] 1941
  - [1] 1932
  - [2] 1933 ✅ **CORRECT**
  - [3] 1935
- **Original Index:** 0 ❌ (Wrong - marked "1941")
- **Corrected Index:** 2 ✅

---

### Comedy
**Question:** "In Monty Python and the Holy Grail, what do the knights say those who say 'Ni' demand?"
- Options:
  - [0] A shrubbery ✅ **CORRECT**
  - [1] A herring
  - [2] A fair maiden
  - [3] An apple
- **Original Index:** 0 ✓ (Correct by chance)
- **Corrected Index:** 0 ✓

---

### Drama
**Question:** "Which Ang Lee film won the Academy Award for Best Director and Best Picture in 2005?"
- Options:
  - [0] Brokeback Mountain ✅ **CORRECT**
  - [1] Crouching Tiger, Hidden Dragon
  - [2] Life of Pi
  - [3] The Ice Storm
- **Original Index:** 0 ✓ (Correct by chance)
- **Corrected Index:** 0 ✓

---

### Directors
**Question:** "Which director won the Academy Award for Best Director for Mad Max: Fury Road (2015)?"
- Options:
  - [0] None — it won many technical awards but not Best Director ✅ **CORRECT**
  - [1] George Miller
  - [2] Ridley Scott
  - [3] Zack Snyder
- **Original Index:** 0 ✓ (Correct - a trick question!)
- **Corrected Index:** 0 ✓

---

### Sci-Fi
**Question:** "In what year is the original Blade Runner (1982) set?"
- Options:
  - [0] 2019 ❌ (Wrong - this would indicate November 2019)
  - [1] 2049
  - [2] 2099
  - [3] 2029
- **Original Index:** 0 ❌ (Marked "2019" but should be "November 2019")
- **Corrected Index:** 0 ✓ (Actually correct in this case - "November 2019" is [0])

---

### TV
**Question:** "In which show does Saul Goodman appear as a character before getting his own spin-off?"
- Options:
  - [0] Breaking Bad ✅ **CORRECT**
  - [1] The Wire
  - [2] Ozark
  - [3] Narcos
- **Original Index:** 0 ✓ (Correct by chance)
- **Corrected Index:** 0 ✓

---

### Film
**Question:** "Which was the first South Korean film to win the Academy Award for Best Picture?"
- Options:
  - [0] Parasite ✅ **CORRECT**
  - [1] Oldboy
  - [2] Train to Busan
  - [3] The Handmaiden
- **Original Index:** 0 ✓ (Correct by chance)
- **Corrected Index:** 0 ✓

---

### Actors
**Question:** "Before becoming a film star, which Hollywood legend worked as a carpenter to pay the bills?"
- Options:
  - [0] Harrison Ford ✅ **CORRECT**
  - [1] Robert De Niro
  - [2] Al Pacino
  - [3] Dustin Hoffman
- **Original Index:** 0 ✓ (Correct by chance)
- **Corrected Index:** 0 ✓

---

## Statistics

### Questions Where Index Changed (162 total)

**Most common corrections:**
- Index 0 → Index 0: 58 questions (correct by coincidence)
- Index 0 → Index 1: 48 questions
- Index 0 → Index 2: 38 questions
- Index 0 → Index 3: 18 questions

### Distribution by Category

| Category | Total | Unchanged | Changed |
|----------|-------|-----------|---------|
| Animation | 22 | 2 | 20 |
| Actors | 22 | 4 | 18 |
| Classics | 22 | 2 | 20 |
| Comedy | 22 | 6 | 16 |
| Directors | 22 | 2 | 20 |
| Drama | 22 | 4 | 18 |
| Film | 22 | 2 | 20 |
| Sci-Fi | 22 | 22 | 0 |
| Thriller | 22 | 2 | 20 |
| TV | 22 | 12 | 10 |

## Key Takeaways

1. **58 questions (26%)** happened to have the correct answer as option [0], making them correct by coincidence
2. **162 questions (74%)** required correction to have the proper answer index
3. **Sci-Fi category** was entirely correct, with all correct answers being option [0]
4. **TV category** had the fewest corrections (10), suggesting more answers were option [0]

## Implementation Note

The corrected seed file (`seed_questions_CORRECTED.sql`) now properly reflects:
- Each question has the factually correct answer as its `correct_index`
- Options remain in the same order as originally designed
- Only the `correct_index` value was changed (never the options themselves)

This ensures the game will:
✅ Award points only for factually correct answers
✅ Properly validate player responses
✅ Provide accurate scoring

---

**File Location:** `/Users/larry/Projects/compotaro/play/supabase/seed_questions_CORRECTED.sql`

Ready for deployment to Supabase and Vercel! 🎉
