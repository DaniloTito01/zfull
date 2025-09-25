import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { query } from './database.js';
import { logger, loggerMiddleware } from './utils/logger.js';

// Import routes
import authRouter from './routes/auth.js';
import authTestRouter from './routes/auth-test.js';
import barbershopsRouter from './routes/barbershops.js';
import clientsRouter from './routes/clients.js';
import barbersRouter from './routes/barbers.js';
import servicesRouter from './routes/services.js';
import appointmentsRouter from './routes/appointments.js';
import productsRouter from './routes/products.js';
import salesRouter from './routes/sales.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Logger middleware (substitui morgan)
app.use(loggerMiddleware);
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/auth-test', authTestRouter);
app.use('/api/barbershops', barbershopsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/barbers', barbersRouter);
app.use('/api/services', servicesRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);

// Health check
app.get('/health', (req, res) => {
  logger.info('health', 'health_check', 'Health check acessado');

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'barbe-backend',
    version: '1.0.0'
  });
});

// Endpoint para receber logs do frontend
app.post('/api/logs', (req, res) => {
  try {
    const logEntry = req.body;

    logger.info('frontend_logs', 'receive_log', 'Log recebido do frontend', {
      frontend_log: logEntry
    });

    res.json({ success: true, message: 'Log recebido com sucesso' });
  } catch (error: any) {
    logger.error('frontend_logs', 'receive_log_error', 'Erro ao receber log do frontend', error);
    res.status(500).json({ error: 'Erro ao processar log' });
  }
});

// ENDPOINT TEMPORÁRIO para criar barbearia real
app.post('/api/create-real-barbershop', async (req, res) => {
  try {
    logger.info('database', 'create_real_barbershop', 'Criando barbearia real no banco');

    // Criar barbearia com UUID real - estrutura simplificada
    const result = await query(`
      INSERT INTO barbershops (name, is_active)
      VALUES ($1, $2)
      RETURNING id, name, is_active, created_at
    `, [
      'Barbearia Clássica',
      true
    ]);

    logger.info('database', 'create_real_barbershop_success', 'Barbearia criada com sucesso', {
      barbershop_id: result.rows[0].id
    });

    res.json({
      success: true,
      message: 'Barbearia criada com sucesso',
      barbershop: result.rows[0]
    });

  } catch (error: any) {
    logger.error('database', 'create_real_barbershop_error', 'Erro ao criar barbearia', error);
    res.status(500).json({
      error: 'Erro ao criar barbearia',
      message: error.message
    });
  }
});

// ENDPOINT TEMPORÁRIO para verificar status da barbearia
app.get('/api/check-barbershop-status/:id', async (req, res) => {
  try {
    const { id } = req.params;

    logger.info('database', 'check_barbershop_status', 'Verificando status da barbearia', { barbershop_id: id });

    const result = await query('SELECT id, name, is_active, created_at FROM barbershops WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.json({
        success: false,
        message: 'Barbearia não encontrada',
        barbershop_id: id
      });
    }

    const barbershop = result.rows[0];

    res.json({
      success: true,
      message: 'Status da barbearia consultado',
      data: {
        id: barbershop.id,
        name: barbershop.name,
        is_active: barbershop.is_active,
        created_at: barbershop.created_at
      }
    });

  } catch (error: any) {
    logger.error('database', 'check_barbershop_status_error', 'Erro ao verificar status', error);
    res.status(500).json({
      error: 'Erro ao verificar status da barbearia',
      message: error.message
    });
  }
});

// ENDPOINT TEMPORÁRIO para debuggar login query
app.post('/api/debug-login-query', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    logger.info('database', 'debug_login_query', 'Debugando query de login', { email });

    const userQuery = `
      SELECT u.id, u.email, u.password_hash, u.name, u.role, u.barbershop_id, u.is_active,
             b.name as barbershop_name, b.is_active as barbershop_is_active
      FROM users u
      LEFT JOIN barbershops b ON u.barbershop_id = b.id
      WHERE u.email = $1 AND u.is_active = true
    `;

    const userResult = await query(userQuery, [email.toLowerCase().trim()]);

    res.json({
      success: true,
      message: 'Query executada com sucesso',
      data: {
        found_users: userResult.rows.length,
        users: userResult.rows
      }
    });

  } catch (error: any) {
    logger.error('database', 'debug_login_query_error', 'Erro ao debuggar query', error);
    res.status(500).json({
      error: 'Erro ao executar query',
      message: error.message
    });
  }
});

// ENDPOINT TEMPORÁRIO para ativar barbearia
app.post('/api/activate-barbershop/:id', async (req, res) => {
  try {
    const { id } = req.params;

    logger.info('database', 'activate_barbershop', 'Ativando barbearia', { barbershop_id: id });

    const result = await query(
      'UPDATE barbershops SET is_active = true WHERE id = $1 RETURNING id, name, is_active',
      [id]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: false,
        message: 'Barbearia não encontrada',
        barbershop_id: id
      });
    }

    res.json({
      success: true,
      message: 'Barbearia ativada com sucesso',
      data: result.rows[0]
    });

  } catch (error: any) {
    logger.error('database', 'activate_barbershop_error', 'Erro ao ativar barbearia', error);
    res.status(500).json({
      error: 'Erro ao ativar barbearia',
      message: error.message
    });
  }
});

// ENDPOINT TEMPORÁRIO para atualizar senha do usuário da barbearia
app.post('/api/update-barbershop-password', async (req, res) => {
  try {
    logger.info('database', 'update_barbershop_password', 'Atualizando senha do usuário da barbearia');

    // Hash correto para "admin123"
    const correctHash = '$2b$10$1naNCYBD5Tnlw54XL7AsrOLzGq2OHGAUQVQEtxL6fRZGe8vr/23aC';

    await query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [correctHash, 'admin@barbeariaclassica.com']
    );

    logger.info('database', 'update_barbershop_password_success', 'Senha do usuário da barbearia atualizada');

    res.json({
      success: true,
      message: 'Senha do usuário da barbearia atualizada para admin123'
    });

  } catch (error: any) {
    logger.error('database', 'update_barbershop_password_error', 'Erro ao atualizar senha', error);
    res.status(500).json({
      error: 'Erro ao atualizar senha',
      message: error.message
    });
  }
});

// ENDPOINT TEMPORÁRIO para corrigir senha do super admin
app.post('/api/fix-super-admin-password', async (req, res) => {
  try {
    logger.info('database', 'fix_super_admin_password', 'Corrigindo senha do super admin');

    // Hash correto para "admin123"
    const correctHash = '$2b$10$1naNCYBD5Tnlw54XL7AsrOLzGq2OHGAUQVQEtxL6fRZGe8vr/23aC';

    await query(
      'UPDATE super_admins SET password_hash = $1 WHERE email = $2',
      [correctHash, 'admin@zbarbe.com']
    );

    logger.info('database', 'fix_super_admin_password_success', 'Senha do super admin corrigida');

    res.json({
      success: true,
      message: 'Senha do super admin corrigida com sucesso'
    });

  } catch (error: any) {
    logger.error('database', 'fix_super_admin_password_error', 'Erro ao corrigir senha do super admin', error);
    res.status(500).json({
      error: 'Erro ao corrigir senha do super admin',
      message: error.message
    });
  }
});

// ENDPOINT TEMPORÁRIO para aplicar schema de autenticação
app.post('/api/apply-auth-schema', async (req, res) => {
  try {
    logger.info('database', 'apply_auth_schema', 'Aplicando schema de autenticação');

    const authSchema = `
      -- Schema para sistema de autenticação SaaS
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'atendente',
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS super_admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        super_admin_id UUID REFERENCES super_admins(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT sessions_user_check CHECK (
          (user_id IS NOT NULL AND super_admin_id IS NULL) OR
          (user_id IS NULL AND super_admin_id IS NOT NULL)
        )
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_barbershop_id ON users(barbershop_id);
      CREATE INDEX IF NOT EXISTS idx_super_admins_email ON super_admins(email);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token_hash);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_super_admin_id ON user_sessions(super_admin_id);

      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = now();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
          FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

      DROP TRIGGER IF EXISTS update_super_admins_updated_at ON super_admins;
      CREATE TRIGGER update_super_admins_updated_at BEFORE UPDATE ON super_admins
          FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

      INSERT INTO super_admins (email, password_hash, name) VALUES
      ('admin@zbarbe.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Admin')
      ON CONFLICT (email) DO NOTHING;

      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check
      CHECK (role IN ('admin', 'barbeiro', 'atendente'));
    `;

    await query(authSchema);

    logger.info('database', 'apply_auth_schema_success', 'Schema de autenticação aplicado com sucesso');

    res.json({
      success: true,
      message: 'Schema de autenticação aplicado com sucesso'
    });

  } catch (error: any) {
    logger.error('database', 'apply_auth_schema_error', 'Erro ao aplicar schema de autenticação', error);
    res.status(500).json({
      error: 'Erro ao aplicar schema de autenticação',
      message: error.message
    });
  }
});

// Rota principal conforme requisito
app.get('/api/data', async (req, res) => {
  const start = Date.now();
  const requestId = (req as any).requestId;

  try {
    logger.info('api', 'get_data_start', 'Iniciando busca de dados do PDV', { request_id: requestId });

    // Try to fetch from database first, fallback to mock data
    let barbershopData;

    try {
      // Simple query to check if database is available
      logger.debug('database', 'health_check', 'Verificando conexão com banco de dados');
      const dbTest = await query('SELECT NOW() as current_time');
      logger.info('database', 'health_check_success', 'Banco de dados conectado com sucesso');

      // If database is available, you can fetch real data here
      // For now, we'll return enhanced mock data with database timestamp
      barbershopData = {
        barbershops: [
          {
            id: "bb-001",
            name: "Barbearia Clássica",
            address: {
              street: "Rua das Flores, 123",
              city: "São Paulo",
              state: "SP",
              zipCode: "01234-567"
            },
            logo_url: "https://placeholder.co/150x150/png",
            plan_id: "premium",
            is_active: true,
            owner_id: "user-001",
            created_at: "2024-01-01T00:00:00Z"
          },
          {
            id: "bb-002",
            name: "Corte & Estilo",
            address: {
              street: "Av. Paulista, 456",
              city: "São Paulo",
              state: "SP",
              zipCode: "01310-100"
            },
            logo_url: "https://placeholder.co/150x150/png",
            plan_id: "basic",
            is_active: true,
            owner_id: "user-002",
            created_at: "2024-02-01T00:00:00Z"
          }
        ],
        services: [
          {
            id: "srv-001",
            barbershop_id: "bb-001",
            name: "Corte Masculino",
            description: "Corte tradicional masculino",
            duration: 30,
            price: 25.00,
            category: "corte"
          },
          {
            id: "srv-002",
            barbershop_id: "bb-001",
            name: "Barba Completa",
            description: "Aparar e modelar barba",
            duration: 20,
            price: 15.00,
            category: "barba"
          }
        ],
        appointments: [
          {
            id: "apt-001",
            barbershop_id: "bb-001",
            client_name: "João Silva",
            client_phone: "(11) 99999-9999",
            service_id: "srv-001",
            barber_id: "bar-001",
            date: "2024-12-21",
            time: "14:00",
            status: "confirmado",
            price: 25.00
          }
        ],
        metrics: {
          total_barbershops: 2,
          total_appointments_today: 15,
          total_revenue_month: 4500.00,
          avg_rating: 4.8,
          generated_at: new Date().toISOString(),
          database_connected: true,
          database_time: dbTest.rows[0].current_time
        }
      };
    } catch (dbError: any) {
      logger.warn('database', 'connection_failed', 'Banco de dados indisponível, usando dados mock', {
        error: dbError.message,
        request_id: requestId
      });

      // Fallback to mock data if database is not available
      barbershopData = {
        barbershops: [
          {
            id: "bb-001",
            name: "Barbearia Clássica",
            address: {
              street: "Rua das Flores, 123",
              city: "São Paulo",
              state: "SP",
              zipCode: "01234-567"
            },
            logo_url: "https://placeholder.co/150x150/png",
            plan_id: "premium",
            is_active: true,
            owner_id: "user-001",
            created_at: "2024-01-01T00:00:00Z"
          },
          {
            id: "bb-002",
            name: "Corte & Estilo",
            address: {
              street: "Av. Paulista, 456",
              city: "São Paulo",
              state: "SP",
              zipCode: "01310-100"
            },
            logo_url: "https://placeholder.co/150x150/png",
            plan_id: "basic",
            is_active: true,
            owner_id: "user-002",
            created_at: "2024-02-01T00:00:00Z"
          }
        ],
        services: [
          {
            id: "srv-001",
            barbershop_id: "bb-001",
            name: "Corte Masculino",
            description: "Corte tradicional masculino",
            duration: 30,
            price: 25.00,
            category: "corte"
          },
          {
            id: "srv-002",
            barbershop_id: "bb-001",
            name: "Barba Completa",
            description: "Aparar e modelar barba",
            duration: 20,
            price: 15.00,
            category: "barba"
          }
        ],
        appointments: [
          {
            id: "apt-001",
            barbershop_id: "bb-001",
            client_name: "João Silva",
            client_phone: "(11) 99999-9999",
            service_id: "srv-001",
            barber_id: "bar-001",
            date: "2024-12-21",
            time: "14:00",
            status: "confirmado",
            price: 25.00
          }
        ],
        metrics: {
          total_barbershops: 2,
          total_appointments_today: 15,
          total_revenue_month: 4500.00,
          avg_rating: 4.8,
          generated_at: new Date().toISOString(),
          database_connected: false,
          database_error: dbError.message
        }
      };
    }

    const duration = Date.now() - start;
    logger.performance('api', 'get_data', duration, {
      request_id: requestId,
      database_connected: barbershopData.metrics.database_connected
    });

    logger.info('api', 'get_data_success', 'Dados do PDV retornados com sucesso', {
      request_id: requestId,
      duration_ms: duration
    });

    res.json(barbershopData);
  } catch (error: any) {
    const duration = Date.now() - start;
    logger.error('api', 'get_data_error', 'Erro ao buscar dados do PDV', error, {
      request_id: requestId,
      duration_ms: duration
    });

    res.status(500).json({
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro ao buscar dados'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`⚠️ 404 NOT FOUND: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Endpoint não encontrado',
    available_endpoints: [
      '/health',
      '/api/data',
      '/api/auth',
      '/api/auth-test',
      '/api/barbershops',
      '/api/clients',
      '/api/barbers',
      '/api/services',
      '/api/appointments',
      '/api/products',
      '/api/sales'
    ]
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('💥 UNHANDLED ERROR:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

app.listen(PORT, () => {
  logger.info('server', 'startup', `Servidor iniciado na porta ${PORT}`, {
    port: PORT,
    env: process.env.NODE_ENV,
    cors_origin: process.env.CORS_ORIGIN
  });

  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API Data: http://localhost:${PORT}/api/data`);
  console.log(`📝 Logs: /app/logs/`);
});

export default app;