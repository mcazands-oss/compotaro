# Compotaro Trivia Fix — Correct Answer Indices

## Problem
All 220 trivia questions in the Supabase database have **scrambled `correct_index` values**. The seed file was designed with all answers at index 0 (the first/correct option in each list), but the database has random indices (0-3).

### Example
**Question:** What is hidden in Jack Woltz's bed in The Godfather?
**Options:** ["A horse's head", "A severed hand", "Dead fish", "A loaded revolver"]
**Seed file:** `correct_index: 0` → "A horse's head" ✓ CORRECT
**Database:** `correct_index: 3` → "A loaded revolver" ✗ WRONG

## Root Cause
The seed_questions.sql file was created with all 220 questions having `correct_index: 0`, which is correct (the first option in each group is the right answer). However, the database was seeded with randomized indices instead.

## Solution
Set all 220 questions' `correct_index` to **0**.

The seed file already has the questions correctly structured — answer A is always correct. We just need to reset the database indices to match.

## SQL to fix (via Supabase dashboard)
```sql
UPDATE questions SET correct_index = 0;
```

## Why the anon key won't work
The Supabase REST API anon key (`sb_publishable_...`) has read-only access. Writing requires:
1. Service role key (admin access) — not exposed in code
2. Supabase dashboard → SQL editor
3. Local psql if you have DB connection

## Next steps
1. Go to: https://app.supabase.com/project/haruuzjsliiczwgplkii/sql
2. Run: `UPDATE questions SET correct_index = 0;`
3. Redeploy to Vercel: `vercel deploy --prod`
4. Test the trivia game — answers should be correct now
