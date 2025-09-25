import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.POSTGRES_HOST || 'postgres',
  user: process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'Mfcd62!!Mfcd62!!SaaS',
  database: process.env.POSTGRES_DATABASE || 'barbearia',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(dbConfig);

export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso');
    console.log('⏰ Horário do servidor:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com PostgreSQL:', error);
    return false;
  }
}

export async function closePool() {
  await pool.end();
}