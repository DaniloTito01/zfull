import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { query } from './database.js';
import { logger, loggerMiddleware } from './utils/logger.js';

// Import routes
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
  res.status(404).json({
    error: 'Endpoint não encontrado',
    available_endpoints: [
      '/health',
      '/api/data',
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
  const requestId = (req as any).requestId;

  logger.error('server', 'unhandled_error', 'Erro não tratado no servidor', err, {
    request_id: requestId,
    url: req.url,
    method: req.method
  });

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