import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { query } from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupDatabase() {
  try {
    console.log('🔧 Iniciando setup do banco de dados...');

    // Ler o arquivo schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Executar o schema
    console.log('📋 Executando schema SQL...');
    await query(schemaSQL);

    console.log('✅ Setup do banco de dados concluído com sucesso!');
    console.log('📊 Verificando dados inseridos...');

    // Verificar se as tabelas foram criadas
    const tablesResult = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('📋 Tabelas criadas:');
    tablesResult.rows.forEach((row: any) => {
      console.log(`  - ${row.table_name}`);
    });

    // Verificar dados iniciais
    const barbershopsResult = await query('SELECT COUNT(*) as count FROM barbershops');
    const clientsResult = await query('SELECT COUNT(*) as count FROM clients');
    const barbersResult = await query('SELECT COUNT(*) as count FROM barbers');
    const servicesResult = await query('SELECT COUNT(*) as count FROM services');
    const productsResult = await query('SELECT COUNT(*) as count FROM products');

    console.log('📊 Dados inseridos:');
    console.log(`  - Barbearias: ${barbershopsResult.rows[0].count}`);
    console.log(`  - Clientes: ${clientsResult.rows[0].count}`);
    console.log(`  - Barbeiros: ${barbersResult.rows[0].count}`);
    console.log(`  - Serviços: ${servicesResult.rows[0].count}`);
    console.log(`  - Produtos: ${productsResult.rows[0].count}`);

    return true;
  } catch (error: any) {
    console.error('❌ Erro no setup do banco de dados:', error);
    throw error;
  }
}

export async function resetDatabase() {
  try {
    console.log('🗑️  Resetando banco de dados...');

    // Lista de tabelas na ordem correta para deletar (respeitando foreign keys)
    const tables = [
      'barber_services',
      'stock_movements',
      'sale_items',
      'sales',
      'appointments',
      'products',
      'services',
      'barbers',
      'clients',
      'barbershops'
    ];

    // Deletar dados de todas as tabelas
    for (const table of tables) {
      await query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
    }

    console.log('✅ Banco de dados resetado com sucesso!');

    // Re-executar o setup
    await setupDatabase();

    return true;
  } catch (error: any) {
    console.error('❌ Erro ao resetar banco de dados:', error);
    throw error;
  }
}

export async function checkDatabaseHealth() {
  try {
    console.log('🔍 Verificando saúde do banco de dados...');

    // Verificar conexão
    const timeResult = await query('SELECT NOW() as current_time');
    console.log(`✅ Conexão OK - ${timeResult.rows[0].current_time}`);

    // Verificar se todas as tabelas existem
    const requiredTables = [
      'barbershops', 'clients', 'barbers', 'services',
      'products', 'appointments', 'sales', 'sale_items',
      'stock_movements', 'barber_services'
    ];

    const tablesResult = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `);

    const existingTables = tablesResult.rows.map((row: any) => row.table_name);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));

    if (missingTables.length > 0) {
      console.log('⚠️  Tabelas faltando:', missingTables);
      return false;
    }

    // Verificar se há dados básicos
    const barbershopsCount = await query('SELECT COUNT(*) as count FROM barbershops');
    if (barbershopsCount.rows[0].count === '0') {
      console.log('⚠️  Nenhuma barbearia encontrada - executando setup...');
      await setupDatabase();
    }

    console.log('✅ Banco de dados saudável!');
    return true;
  } catch (error: any) {
    console.error('❌ Problema na saúde do banco de dados:', error);
    return false;
  }
}

// Se executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  switch (command) {
    case 'setup':
      setupDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    case 'reset':
      resetDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    case 'health':
      checkDatabaseHealth()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    default:
      console.log('Uso: node setup.js [setup|reset|health]');
      process.exit(1);
  }
}