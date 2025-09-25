import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'barbearia',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Mfcd62!!Mfcd62!!SaaS',
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection and auto-setup
pool.on('connect', async () => {
  console.log('✅ PostgreSQL connected successfully');

  // Auto-check database health on first connection
  try {
    const { checkDatabaseHealth } = await import('./database/setup.js');
    await checkDatabaseHealth();
  } catch (error) {
    console.warn('⚠️  Could not check database health:', error);
  }
});

pool.on('error', (err: Error) => {
  console.error('❌ PostgreSQL connection error:', err);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('🔍 Query executed', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
};

export const getClient = () => {
  return pool.connect();
};

export default pool;