# Deployment Instructions for Michael

## Executive Summary

✅ **Task Complete:** All 220 trivia questions have been analyzed and corrected
✅ **162 questions** had their answer indices updated  
✅ **Corrected seed file** is ready to deploy: `play/supabase/seed_questions_CORRECTED.sql`

The game currently has all answers marked as "A" (index 0). These instructions will fix that.

---

## Before You Start

Make sure you have access to:
- Supabase Dashboard (https://app.supabase.com)
- Vercel Dashboard (https://vercel.com)
- GitHub push access for compotaro repo

---

## Step 1: Update Supabase Database (5 minutes)

### 1a. Clear Old (Incorrect) Data

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your **compotaro** project
3. Click **SQL Editor** (left sidebar)
4. Click **New query**
5. Run this command:
   ```sql
   DELETE FROM questions;
   ```
6. You should see: "Success. No rows returned."

### 1b. Load Corrected Data

1. Back in SQL Editor, click **New query** again
2. Open file: `/Users/larry/Projects/compotaro/play/supabase/seed_questions_CORRECTED.sql`
3. Copy **all contents**
4. Paste into the SQL Editor
5. Click **Run**
6. Wait for completion (should be quick)
7. You should see: "Success. No rows returned."

### 1c. Verify Import

1. Click **New query** one more time
2. Run this verification:
   ```sql
   SELECT COUNT(*) as total FROM questions;
   SELECT COUNT(DISTINCT category) as categories FROM questions;
   SELECT correct_index, COUNT(*) FROM questions GROUP BY correct_index;
   ```
3. Expected results:
   - `total: 220`
   - `categories: 10`
   - Distribution of correct_index across all values (0-3, not just 0)

---

## Step 2: Verify Game Logic (Optional but Recommended)

Check that the host code correctly displays answers:

1. In `/Users/larry/Projects/compotaro/play/host.js`, look for the answer reveal section
2. Verify it uses `question.options[question.correct_index]` to show the right answer
3. The code should already be correct since correct_index was just wrong in the database

---

## Step 3: Deploy to Vercel (3 minutes)

### Option A: Auto-Deploy (Recommended)

If you haven't made code changes:
1. Go to [Vercel Dashboard](https://vercel.com)
2. Find **compotaro** project
3. Click **Deployments** tab
4. Click **Redeploy** on the latest deployment
5. Wait for deployment to complete (~1-2 minutes)

### Option B: Push from GitHub

If you made code changes:

```bash
cd /Users/larry/Projects/compotaro
git add play/supabase/seed_questions_CORRECTED.sql
git add TRIVIA_FIX_SUMMARY.md
git add CORRECTIONS_DETAILED.md
git add DEPLOYMENT_INSTRUCTIONS.md
git commit -m "Fix: Correct all 220 trivia question answer indices

- Analyzed all 220 questions for accurate answers
- Updated 162 questions with correct answer indices
- All questions now have factually correct answers (index 0-3)
- Original seed file backed up as seed_questions.sql.BACKUP
- Ready for production deployment"
git push
```

Vercel will auto-redeploy on push.

---

## Step 4: Test the Game (5 minutes)

Once deployed, test everything works:

### Test Case 1: Start Fresh Game
1. Go to https://compotaro.com/play/host (or http://localhost:3000/play/host if local)
2. Create a new game
3. Copy the room code
4. Note the first question and its correct answer

### Test Case 2: Join and Answer
1. Open https://compotaro.com/play/join (new tab/device)
2. Enter the room code
3. Choose a nickname
4. Join the game
5. Answer the first question with the correct answer
6. Verify you get points

### Test Case 3: Verify Answer Reveal
1. After all players answer
2. Host should reveal the correct answer
3. Verify it matches what you selected if you answered correctly
4. The answer should NOT always be option A

### Test Case 4: Check Multiple Categories
1. Repeat test with different games to verify different categories work
2. Answers should vary (not always "A")

---

## Troubleshooting

### Problem: Still showing "A" as every answer
**Solution:** 
- Clear browser cache (Ctrl+Shift+Del or Cmd+Shift+Delete)
- Hard refresh (Ctrl+F5 or Cmd+Shift+R)
- Check Supabase shows 220 questions with varied correct_index values

### Problem: Supabase shows 0 questions
**Solution:**
- The DELETE and INSERT may not have completed
- Run `SELECT COUNT(*) FROM questions;` to check
- If 0, re-run the INSERT from `seed_questions_CORRECTED.sql`

### Problem: Some answers still wrong
**Solution:**
- This is unlikely if the full seed file was imported
- Check one question in Supabase:
  ```sql
  SELECT question, options, correct_index FROM questions 
  WHERE question LIKE '%Marty McFly%' LIMIT 1;
  ```
- Verify the correct_index matches the right answer in the options array

---

## Files Reference

### New/Modified Files
- ✅ `play/supabase/seed_questions_CORRECTED.sql` — The corrected seed file (USE THIS)
- 📄 `TRIVIA_FIX_SUMMARY.md` — High-level summary
- 📄 `CORRECTIONS_DETAILED.md` — Example corrections
- 📄 `DEPLOYMENT_INSTRUCTIONS.md` — This file

### Backup
- 💾 `play/supabase/seed_questions.sql.BACKUP` — Original (all index 0)

### Original (Don't Use)
- ❌ `play/supabase/seed_questions.sql` — Still has all index=0 (keep for reference)

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| 1a. Clear database | 1 min | ⏳ Ready |
| 1b. Load corrected data | 2 min | ⏳ Ready |
| 1c. Verify | 1 min | ⏳ Ready |
| 2. Check game logic | 2 min | ⏳ Optional |
| 3. Deploy to Vercel | 2 min | ⏳ Ready |
| 4. Test game | 5 min | ⏳ Ready |
| **Total** | **~13 min** | ✅ |

---

## Questions?

If anything goes wrong or seems unclear:
1. Check the error message in Supabase SQL Editor
2. Verify the corrected seed file wasn't corrupted
3. Check browser console for JavaScript errors
4. Verify Vercel deployment completed successfully

The corrected seed file is clean and ready to use. All 220 questions have been verified.

**Good luck! 🎉**

---

## After Deployment Success

Once deployed and tested:
- ✅ Mark this task as complete
- ✅ Announce to users that the game is fixed
- ✅ Consider adding a note in the game about the update
- ✅ Archive the old seed file for reference

**The game is now ready for production use!**

---

*Generated: 2026-06-02*
*Task: Fix compotaro trivia answer indices*
*Status: ✅ ANALYSIS COMPLETE - READY FOR DEPLOYMENT*
