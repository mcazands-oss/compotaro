# Compotaro /Play — Supabase Setup

## Prerequisites
- A [Supabase](https://supabase.com) account (free tier works)
- Node.js installed (optional, for Supabase CLI)

---

## Step 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it `compotaro-play` (or anything)
3. Pick a region closest to your users
4. Set a strong database password and save it
5. Wait ~2 minutes for the project to provision

---

## Step 2 — Run the Migration

1. In Supabase Dashboard → **SQL Editor**
2. Click **New query**
3. Open `migrations/001_schema.sql` and paste the entire contents
4. Click **Run**
5. You should see: "Success. No rows returned."

---

## Step 3 — Seed the Question Bank

1. In SQL Editor → **New query**
2. Open `seed_questions.sql` and paste the contents
3. Click **Run**
4. Verify: `select count(*) from questions;` — should return 200+

---

## Step 4 — Configure Authentication

1. Supabase Dashboard → **Authentication** → **Settings**
2. Under **Site URL**, enter: `https://compotaro.com`
3. Under **Redirect URLs**, add:
   - `https://compotaro.com/play/host`
   - `http://localhost:3000/play/host` (for local dev)
4. Email confirmations: For a quick setup, disable **Confirm email** under **Auth** → **Settings** → **Email** (re-enable for production)

---

## Step 5 — Get Your API Keys

1. Supabase Dashboard → **Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
   - **anon / public key** (safe to expose in frontend code)

---

## Step 6 — Update play.js

Open `play/play.js` and replace the placeholders at the top:

```js
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

---

## Step 7 — Enable Realtime

1. Supabase Dashboard → **Database** → **Replication**
2. Under **Supabase Realtime**, ensure these tables are enabled:
   - `games`
   - `players`
   - `answers`
3. (The migration already runs `alter publication supabase_realtime add table ...` but double-check here)

---

## Step 8 — Deploy to Vercel

1. Push your code to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. No build step needed — it's static HTML/JS
4. Your `/play` routes are configured in `vercel.json`

---

## Local Development

Serve the project root with any static server:

```bash
# Python
python3 -m http.server 3000

# Node (npx)
npx serve . -p 3000
```

Then visit: `http://localhost:3000/play/`

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| "No questions found" on game launch | Make sure `seed_questions.sql` ran successfully |
| Players can't join | Check RLS policies — run the migration again if needed |
| Realtime not working | Enable Realtime for `games`/`players`/`answers` in the Supabase dashboard |
| Auth redirect loops | Check Site URL and Redirect URLs in Auth settings |
| QR code doesn't scan | The join URL uses `compotaro.com/play/join?room=XXXX` — update `buildJoinUrl()` in `play.js` for local dev |

---

## Architecture Notes

- All game state lives in the `games` row — `status` and `current_question_index` drive every client
- Players subscribe to their game's `games` row via Supabase Realtime
- Hosts subscribe to `players` (new joins) and `answers` (response tracking)
- Questions are selected randomly on game launch and stored in `game_questions`
- Scoring: 1000 pts max, decreasing to 500 pts based on response speed; 0 pts for timeout
