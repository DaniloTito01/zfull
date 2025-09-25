const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST || '5.78.113.107',
  user: process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'Mfcd62!!Mfcd62!!SaaS',
  database: 'postgres', // Conecta ao banco default
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ssl: false
});

async function createDatabase() {
  try {
    const client = await pool.connect();

    // Verifica se o banco já existe
    const checkDb = await client.query("SELECT 1 FROM pg_database WHERE datname = 'barbearia'");

    if (checkDb.rows.length > 0) {
      console.log('✅ Banco "barbearia" já existe!');
    } else {
      await client.query('CREATE DATABASE barbearia');
      console.log('✅ Banco "barbearia" criado com sucesso!');
    }

    client.release();
  } catch (error) {
    console.log('❌ Erro ao criar banco:', error.message);
  } finally {
    pool.end();
  }
}

createDatabase();