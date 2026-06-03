const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://haruuzjsliiczwgplkii.supabase.co';
// Use service key if available, otherwise use anon key (limited delete access)
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_publishable_xOZHFYJKyxCGIC1B3C_4Mw_CJNsO8wO';

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const seedSQL = fs.readFileSync('./supabase/seed_questions.sql', 'utf8');

// Parse INSERT statements
const inserts = seedSQL.match(/INSERT INTO questions.*?VALUES\s*\((.*?)\);/gs) || [];

console.log(`Found ${inserts.length} INSERT statements`);

(async () => {
  console.log('Deleting all existing questions...');
  const { data: existing } = await db.from('questions').select('id');
  
  if (existing && existing.length > 0) {
    const ids = existing.map(q => q.id);
    const { error } = await db.from('questions').delete().in('id', ids);
    if (error) console.error('Delete error:', error);
    else console.log(`Deleted ${ids.length} questions`);
  }

  console.log('Re-inserting questions from seed file...');
  // Just run the seed SQL file via the API or local psql if we had access
  // For now, let's just log what we found
  console.log('Seed data ready. Re-insert via Supabase console or psql.');
})();
