/* ============================================
   COMPOTARO /PLAY — Shared Config & Utilities
   play.js  (loaded before host.js / join.js)
   ============================================ */

const SUPABASE_URL = 'https://haruuzjsliiczwgplkii.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xOZHFYJKyxCGIC1B3C_4Mw_CJNsO8wO';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: { params: { eventsPerSecond: 10 } }
});

const QUESTION_TIME_MS = 20000;
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O, 0, I, 1

async function generateRoomCode() {
  for (let i = 0; i < 12; i++) {
    const code = Array.from({ length: 6 }, () =>
      CHARS[Math.floor(Math.random() * CHARS.length)]
    ).join('');
    const { data } = await db
      .from('games')
      .select('id')
      .eq('room_code', code)
      .maybeSingle();
    if (!data) return code;
  }
  throw new Error('Could not generate unique room code');
}

function calculatePoints(responseTimeMs) {
  if (responseTimeMs >= QUESTION_TIME_MS) return 0;
  const ratio = responseTimeMs / QUESTION_TIME_MS;
  return Math.max(500, Math.round(1000 - ratio * 500));
}

function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  window.scrollTo(0, 0);
}

function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function avatarLetter(nickname) {
  return (nickname || '?').charAt(0).toUpperCase();
}

function formatScore(n) {
  return Number(n || 0).toLocaleString();
}

function buildJoinUrl(roomCode) {
  return `https://compotaro.com/play/join?room=${roomCode}`;
}
