import { Router, Request, Response } from 'express';
import { query } from '../config/database';

const router = Router();

router.get('/data', async (req: Request, res: Response) => {
  try {
    // Buscar dados das tabelas principais
    const barbershopsResult = await query('SELECT id, name, address, phone FROM barbershops WHERE active = true LIMIT 5');
    const servicesResult = await query('SELECT id, name, price, duration, category FROM services WHERE active = true LIMIT 5');
    const usersResult = await query('SELECT id, name, email, role FROM users WHERE active = true LIMIT 5');

    const data = {
      message: 'Dados do Sistema de Barbearia',
      timestamp: new Date().toISOString(),
      data: [
        {
          type: 'barbershops',
          count: barbershopsResult.rows.length,
          items: barbershopsResult.rows
        },
        {
          type: 'services',
          count: servicesResult.rows.length,
          items: servicesResult.rows
        },
        {
          type: 'users',
          count: usersResult.rows.length,
          items: usersResult.rows.map(user => ({
            id: user.id,
            name: user.name,
            role: user.role
          }))
        }
      ]
    };

    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
      data: []
    });
  }
});

export default router;