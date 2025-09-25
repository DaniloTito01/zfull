import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  const password = process.argv[2];
  if (!password) {
    console.error('❌ Senha é obrigatória: node setup-db.js "senha"');
    process.exit(1);
  }

  // Primeiro conectar no postgres para criar o banco
  const adminPool = new Pool({
    host: '5.78.113.107',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: password,
    ssl: false,
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log('🔄 Conectando no PostgreSQL...');
    const adminClient = await adminPool.connect();

    // Verificar se o banco berbearia já existe
    const dbCheck = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = 'berbearia'"
    );

    if (dbCheck.rows.length === 0) {
      console.log('🏗️  Criando banco berbearia...');
      await adminClient.query('CREATE DATABASE berbearia');
      console.log('✅ Banco berbearia criado!');
    } else {
      console.log('✅ Banco berbearia já existe!');
    }

    adminClient.release();
    await adminPool.end();

    // Agora conectar no banco berbearia para executar o schema
    const barberPool = new Pool({
      host: '5.78.113.107',
      port: 5432,
      database: 'berbearia',
      user: 'postgres',
      password: password,
      ssl: false,
      connectionTimeoutMillis: 5000,
    });

    console.log('🔄 Conectando no banco berbearia...');
    const barberClient = await barberPool.connect();

    // Ler e executar o schema
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Executando schema SQL...');
    await barberClient.query(schemaSQL);

    // Verificar tabelas criadas
    const tablesResult = await barberClient.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('📋 Tabelas criadas:');
    tablesResult.rows.forEach((row) => {
      console.log(`  ✅ ${row.table_name}`);
    });

    // Verificar dados inseridos
    const barbershopsResult = await barberClient.query('SELECT COUNT(*) as count FROM barbershops');
    const clientsResult = await barberClient.query('SELECT COUNT(*) as count FROM clients');
    const barbersResult = await barberClient.query('SELECT COUNT(*) as count FROM barbers');
    const servicesResult = await barberClient.query('SELECT COUNT(*) as count FROM services');

    console.log('📊 Dados inseridos:');
    console.log(`  - Barbearias: ${barbershopsResult.rows[0].count}`);
    console.log(`  - Clientes: ${clientsResult.rows[0].count}`);
    console.log(`  - Barbeiros: ${barbersResult.rows[0].count}`);
    console.log(`  - Serviços: ${servicesResult.rows[0].count}`);

    barberClient.release();
    await barberPool.end();

    console.log('🎉 Setup completo do banco berbearia!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro no setup:', error.message);
    process.exit(1);
  }
}

setupDatabase();