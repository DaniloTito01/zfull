const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  port: parseInt(process.env.POSTGRES_PORT),
  ssl: false
});

async function executeSQLScript() {
  try {
    const sqlScript = fs.readFileSync(path.join(__dirname, 'src/utils/database.sql'), 'utf-8');

    const client = await pool.connect();
    await client.query(sqlScript);

    console.log('✅ Script SQL executado com sucesso!');
    console.log('📊 Tabelas criadas:');
    console.log('  - barbershops');
    console.log('  - users');
    console.log('  - barbers');
    console.log('  - clients');
    console.log('  - services');
    console.log('  - appointments');

    client.release();
  } catch (error) {
    console.log('❌ Erro ao executar script SQL:', error.message);
  } finally {
    pool.end();
  }
}

executeSQLScript();