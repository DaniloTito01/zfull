import { readFileSync } from 'fs';
import { join } from 'path';
import { query, testConnection } from '../config/database';

async function initDatabase() {
  try {
    console.log('🔗 Testando conexão com o banco de dados...');
    const connected = await testConnection();

    if (!connected) {
      console.error('❌ Falha na conexão com o banco de dados');
      process.exit(1);
    }

    console.log('📋 Executando script de criação do banco...');
    const sqlScript = readFileSync(join(__dirname, '../utils/database.sql'), 'utf-8');

    await query(sqlScript);

    console.log('✅ Banco de dados inicializado com sucesso!');
    console.log('📊 Tabelas criadas:');
    console.log('  - barbershops');
    console.log('  - users');
    console.log('  - barbers');
    console.log('  - clients');
    console.log('  - services');
    console.log('  - appointments');
    console.log('🚀 O sistema está pronto para uso!');

  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  initDatabase();
}

export { initDatabase };