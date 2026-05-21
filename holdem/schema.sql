-- Texas Hold'em Poker Game — Supabase Schema
-- Run this in Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  game_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'waiting',
  small_blind INTEGER DEFAULT 100,
  big_blind INTEGER DEFAULT 200,
  pot INTEGER DEFAULT 0,
  community_cards TEXT[] DEFAULT '{}',
  current_bet INTEGER DEFAULT 0,
  current_player_index INTEGER DEFAULT 0,
  blind_level INTEGER DEFAULT 1,
  blind_timer_start TIMESTAMPTZ DEFAULT NOW(),
  dealer_position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  player_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(game_id) ON DELETE CASCADE,
  user_id UUID,
  username TEXT NOT NULL,
  seat_position INTEGER NOT NULL,
  stack INTEGER DEFAULT 3500,
  hole_cards TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  current_bet INTEGER DEFAULT 0,
  is_ai BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: anyone can read, users can insert/update their own
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (true);

-- Games: anyone can read and create
CREATE POLICY "Games are viewable by everyone" ON games FOR SELECT USING (true);
CREATE POLICY "Anyone can create a game" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update a game" ON games FOR UPDATE USING (true);

-- Players: anyone can read and join
CREATE POLICY "Players are viewable by everyone" ON players FOR SELECT USING (true);
CREATE POLICY "Anyone can join a game" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Players can update their own data" ON players FOR UPDATE USING (true);

-- Enable Realtime on games and players tables
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
