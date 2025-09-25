import { Pool } from 'pg';

async function testConnection() {
  const pool = new Pool({
    host: '5.78.113.107',
    port: 5432,
    database: 'berbearia',
    user: 'postgres',
    password: process.argv[2] || 'test123',
    ssl: false,
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log('🔄 Testando conexão PostgreSQL...');
    const client = await pool.connect();
    console.log('✅ Conectado com sucesso!');

    const result = await client.query('SELECT NOW() as current_time, version()');
    console.log('📅 Hora do servidor:', result.rows[0].current_time);
    console.log('🗄️ Versão PostgreSQL:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);

    // Testar se o banco barber_system existe
    const dbResult = await client.query('SELECT current_database()');
    console.log('🏠 Database atual:', dbResult.rows[0].current_database);

    client.release();
    await pool.end();

    console.log('🎉 Teste de conexão bem-sucedido!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    process.exit(1);
  }
}

testConnection();