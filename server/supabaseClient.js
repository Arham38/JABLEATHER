const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

// Ensure WebSocket is available for Supabase Realtime in Node environments < 22
if (typeof WebSocket === 'undefined') {
  try {
    global.WebSocket = require('ws');
  } catch (err) {
    // ws not installed, Supabase realtime won't connect
  }
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

module.exports = { supabase };
