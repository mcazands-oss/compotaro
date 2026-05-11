-- ============================================
-- COMPOTARO /PLAY — Supabase Schema
-- migrations/001_schema.sql
-- ============================================

-- games table
create table games (
  id uuid primary key default gen_random_uuid(),
  room_code text unique not null,
  host_id uuid references auth.users(id),
  name text,
  categories text[] not null,
  question_count int not null default 10,
  status text not null default 'lobby' check (status in ('lobby', 'active', 'finished')),
  current_question_index int default 0,
  question_start_time timestamptz,
  created_at timestamptz default now()
);

-- players table
create table players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  nickname text not null,
  score int default 0,
  joined_at timestamptz default now()
);

-- questions bank
create table questions (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  question text not null,
  options jsonb not null,       -- ["A text","B text","C text","D text"]
  correct_index int not null,   -- 0-3
  difficulty text default 'medium'
);

-- questions selected for a specific game
create table game_questions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  question_id uuid references questions(id),
  position int not null,
  unique(game_id, position)
);

-- player answers
create table answers (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  question_position int not null,
  selected_index int not null,    -- -1 = timed out
  is_correct boolean not null,
  response_time_ms int,
  points_earned int default 0,
  answered_at timestamptz default now()
);

-- ─── ROW LEVEL SECURITY ───

alter table games enable row level security;
alter table players enable row level security;
alter table questions enable row level security;
alter table game_questions enable row level security;
alter table answers enable row level security;

-- Games: hosts manage their own; anyone can read non-finished games
create policy "hosts manage games"
  on games for all
  using (host_id = auth.uid());

create policy "anyone read active games"
  on games for select
  using (status != 'finished');

-- Players: open insert/read for game participants
create policy "anyone join games"
  on players for insert
  with check (true);

create policy "anyone read players"
  on players for select
  using (true);

create policy "update player score"
  on players for update
  using (true);

-- Questions: readable by anyone
create policy "read questions"
  on questions for select
  using (true);

-- Game questions: readable by anyone; only hosts can insert
create policy "read game questions"
  on game_questions for select
  using (true);

create policy "hosts insert game questions"
  on game_questions for insert
  with check (
    exists (
      select 1 from games
      where games.id = game_id
        and games.host_id = auth.uid()
    )
  );

-- Answers: open insert/read
create policy "insert answers"
  on answers for insert
  with check (true);

create policy "read answers"
  on answers for select
  using (true);

-- ─── REALTIME ───

alter publication supabase_realtime add table games;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table answers;

-- ─── INDEXES ───

create index on games (room_code);
create index on players (game_id);
create index on game_questions (game_id, position);
create index on answers (game_id, question_position);
create index on questions (category);
