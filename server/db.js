const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: connectionString && connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : false,
});

module.exports = { pool };
