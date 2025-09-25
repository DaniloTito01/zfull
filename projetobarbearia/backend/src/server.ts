import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection } from './config/database';

import { usersRouter } from './routes/users';
import { servicesRouter } from './routes/services';
import { appointmentsRouter } from './routes/appointments';
import { barbersRouter } from './routes/barbers';
import { clientsRouter } from './routes/clients';
import { barbershopsRouter } from './routes/barbershops';
import dataRouter from './routes/data';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'API Sistema de Barbearia',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      services: '/api/services',
      appointments: '/api/appointments',
      barbers: '/api/barbers',
      clients: '/api/clients',
      barbershops: '/api/barbershops',
      data: '/api/data'
    }
  });
});

app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Erro na conexão com o banco de dados'
    });
  }
});

app.use('/api/users', usersRouter);
app.use('/api/services', servicesRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/barbers', barbersRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/barbershops', barbershopsRouter);
app.use('/api', dataRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const startServer = async () => {
  try {
    console.log('🔗 Testando conexão com o banco de dados...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('❌ Falha na conexão com o banco de dados. Verifique as configurações.');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 Documentação: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => {
  console.log('\n👋 Encerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Encerrando servidor...');
  process.exit(0);
});

startServer();