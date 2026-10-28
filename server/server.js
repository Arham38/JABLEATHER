const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { supabase } = require('./supabaseClient');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jableather';

app.use(cors());
app.use(express.json());
app.locals.supabase = supabase;
app.locals.db = pool;

if (supabase) {
  console.log('Supabase client initialized successfully');
} else {
  console.warn('Supabase is not configured yet. Add SUPABASE_URL and SUPABASE_ANON_KEY to server/.env');
}

if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
  pool.query('SELECT 1')
    .then(() => console.log('Connected to Supabase Postgres successfully'))
    .catch((err) => {
      console.warn('Supabase Postgres connection warning:', err.message);
    });
} else {
  console.warn('Supabase Postgres not connected yet. Replace [YOUR-PASSWORD] in DATABASE_URL with your actual database password.');
}

// MongoDB connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => {
    console.warn('MongoDB connection warning:', err.message);
    console.log('Server is running with fallback mock data mode enabled.');
  });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'JAB LEATHER Backend API is running',
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
