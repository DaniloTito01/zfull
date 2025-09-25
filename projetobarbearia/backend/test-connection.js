const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  user: process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'Mfcd62!!Mfcd62!!SaaS',
  database: process.env.POSTGRES_DATABASE || 'barbearia',
  port: parseInt(process.env.POSTGRES_PORT || '5433'),
  ssl: false
});

async function testConnection() {
  try {
    console.log('Configuração:');
    console.log('Host:', process.env.POSTGRES_HOST);
    console.log('User:', process.env.POSTGRES_USERNAME);
    console.log('Database:', process.env.POSTGRES_DATABASE);
    console.log('Port:', process.env.POSTGRES_PORT);

    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Conexão bem-sucedida!');
    console.log('Resultado:', result.rows[0]);
    client.release();
  } catch (error) {
    console.log('❌ Erro na conexão:', error.message);
  } finally {
    pool.end();
  }
}

testConnection();