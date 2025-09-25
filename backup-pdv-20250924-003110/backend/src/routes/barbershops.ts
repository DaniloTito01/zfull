import express from 'express';
import { query } from '../database.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// GET /api/barbershops - Listar todas as barbearias
router.get('/', async (req, res) => {
  const start = Date.now();
  const requestId = (req as any).requestId;

  try {
    logger.info('barbershops', 'list_start', 'Iniciando listagem de barbearias', { request_id: requestId });

    const result = await query(`
      SELECT
        id, name, slug, logo_url, address, phone, email,
        plan_id, is_active, created_at, updated_at
      FROM barbershops
      WHERE is_active = true
      ORDER BY created_at DESC
    `);

    const duration = Date.now() - start;
    logger.performance('barbershops', 'list_query', duration, {
      request_id: requestId,
      count: result.rows.length
    });

    logger.info('barbershops', 'list_success', 'Barbearias listadas com sucesso', {
      request_id: requestId,
      count: result.rows.length,
      duration_ms: duration
    });

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error: any) {
    const duration = Date.now() - start;
    logger.error('barbershops', 'list_error', 'Erro ao buscar barbearias', error, {
      request_id: requestId,
      duration_ms: duration
    });

    res.status(500).json({
      success: false,
      error: 'Erro ao buscar barbearias',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/barbershops/:id - Buscar barbearia por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT
        id, name, slug, logo_url, address, phone, email,
        plan_id, is_active, settings, created_at, updated_at
      FROM barbershops
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Barbearia não encontrada'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error fetching barbershop:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar barbearia',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/barbershops - Criar nova barbearia
router.post('/', async (req, res) => {
  try {
    const { name, slug, logo_url, address, phone, email, plan_id, settings } = req.body;

    // Validações básicas
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Nome é obrigatório'
      });
    }

    // Gerar slug automaticamente se não fornecido
    const finalSlug = slug || name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    const result = await query(`
      INSERT INTO barbershops (name, slug, logo_url, address, phone, email, plan_id, settings)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, slug, logo_url, address, phone, email, plan_id, is_active, created_at
    `, [name, finalSlug, logo_url, address, phone, email, plan_id || 'basic', settings || {}]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Barbearia criada com sucesso'
    });
  } catch (error: any) {
    console.error('Error creating barbershop:', error);

    // Verificar se é erro de slug duplicado
    if (error.code === '23505' && error.constraint === 'barbershops_slug_key') {
      return res.status(400).json({
        success: false,
        error: 'Slug já existe. Tente outro nome ou forneça um slug único.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro ao criar barbearia',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/barbershops/:id - Atualizar barbearia
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, logo_url, address, phone, email, plan_id, is_active, settings } = req.body;

    // Verificar se a barbearia existe
    const checkResult = await query('SELECT id FROM barbershops WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Barbearia não encontrada'
      });
    }

    const result = await query(`
      UPDATE barbershops
      SET name = COALESCE($2, name),
          slug = COALESCE($3, slug),
          logo_url = COALESCE($4, logo_url),
          address = COALESCE($5, address),
          phone = COALESCE($6, phone),
          email = COALESCE($7, email),
          plan_id = COALESCE($8, plan_id),
          is_active = COALESCE($9, is_active),
          settings = COALESCE($10, settings),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, slug, logo_url, address, phone, email, plan_id, is_active, settings, updated_at
    `, [id, name, slug, logo_url, address, phone, email, plan_id, is_active, settings]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Barbearia atualizada com sucesso'
    });
  } catch (error: any) {
    console.error('Error updating barbershop:', error);

    // Verificar se é erro de slug duplicado
    if (error.code === '23505' && error.constraint === 'barbershops_slug_key') {
      return res.status(400).json({
        success: false,
        error: 'Slug já existe. Tente outro slug único.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar barbearia',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/barbershops/:id - Desativar barbearia (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a barbearia existe
    const checkResult = await query('SELECT id, name FROM barbershops WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Barbearia não encontrada'
      });
    }

    // Soft delete - apenas marcar como inativa
    await query(`
      UPDATE barbershops
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
    `, [id]);

    res.json({
      success: true,
      message: 'Barbearia desativada com sucesso'
    });
  } catch (error: any) {
    console.error('Error deactivating barbershop:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao desativar barbearia',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/barbershops/:id/dashboard - Métricas do dashboard
router.get('/:id/dashboard', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a barbearia existe
    const checkResult = await query('SELECT id, name FROM barbershops WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Barbearia não encontrada'
      });
    }

    // Buscar métricas da view criada
    const metricsResult = await query(`
      SELECT * FROM dashboard_metrics WHERE barbershop_id = $1
    `, [id]);

    // Buscar agendamentos recentes
    const appointmentsResult = await query(`
      SELECT * FROM appointments_detailed
      WHERE barbershop_id = $1
      ORDER BY appointment_date DESC, appointment_time DESC
      LIMIT 5
    `, [id]);

    // Buscar serviços mais populares
    const popularServicesResult = await query(`
      SELECT
        s.name,
        s.price,
        COUNT(a.id) as bookings_count
      FROM services s
      LEFT JOIN appointments a ON s.id = a.service_id
      WHERE s.barbershop_id = $1
        AND s.is_active = true
      GROUP BY s.id, s.name, s.price
      ORDER BY bookings_count DESC
      LIMIT 5
    `, [id]);

    const data = {
      metrics: metricsResult.rows[0] || {
        appointments_today: 0,
        total_clients: 0,
        total_barbers: 0,
        revenue_month: 0,
        revenue_today: 0
      },
      recent_appointments: appointmentsResult.rows,
      popular_services: popularServicesResult.rows
    };

    res.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar métricas do dashboard',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;