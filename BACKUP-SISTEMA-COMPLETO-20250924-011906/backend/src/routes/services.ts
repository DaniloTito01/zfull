import express from 'express';
import { query } from '../database.js';

const router = express.Router();

// GET /api/services - Listar serviços
router.get('/', async (req, res) => {
  try {
    const { barbershop_id, category, is_active = 'true' } = req.query;

    if (!barbershop_id) {
      return res.status(400).json({
        success: false,
        error: 'barbershop_id é obrigatório'
      });
    }

    let whereClause = 'WHERE s.barbershop_id = $1';
    const params: any[] = [barbershop_id];

    if (is_active !== 'all') {
      whereClause += ` AND s.is_active = $${params.length + 1}`;
      params.push(is_active === 'true');
    }

    if (category) {
      whereClause += ` AND s.category = $${params.length + 1}`;
      params.push(category);
    }

    const result = await query(`
      SELECT
        s.id, s.name, s.description, s.category, s.duration,
        s.price, s.commission_rate, s.is_active, s.image_url,
        s.created_at, s.updated_at,
        COUNT(a.id) as total_bookings,
        COALESCE(SUM(a.price), 0) as total_revenue
      FROM services s
      LEFT JOIN appointments a ON s.id = a.service_id
        AND a.status IN ('completed', 'confirmed')
      ${whereClause}
      GROUP BY s.id
      ORDER BY s.name
    `, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar serviços',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/services/categories - Listar categorias de serviços
router.get('/categories', async (req, res) => {
  try {
    const { barbershop_id } = req.query;

    if (!barbershop_id) {
      return res.status(400).json({
        success: false,
        error: 'barbershop_id é obrigatório'
      });
    }

    const result = await query(`
      SELECT
        category,
        COUNT(*) as services_count,
        COALESCE(AVG(price), 0) as avg_price
      FROM services
      WHERE barbershop_id = $1 AND is_active = true
      GROUP BY category
      ORDER BY category
    `, [barbershop_id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    console.error('Error fetching service categories:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar categorias',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/services/:id - Buscar serviço por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT
        s.id, s.name, s.description, s.category, s.duration,
        s.price, s.commission_rate, s.is_active, s.image_url,
        s.created_at, s.updated_at,
        bb.name as barbershop_name
      FROM services s
      JOIN barbershops bb ON s.barbershop_id = bb.id
      WHERE s.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Serviço não encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar serviço',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/services - Criar novo serviço
router.post('/', async (req, res) => {
  try {
    const {
      barbershop_id,
      name,
      description,
      category,
      duration,
      price,
      commission_rate,
      image_url
    } = req.body;

    // Validações básicas
    if (!barbershop_id || !name || !duration || !price) {
      return res.status(400).json({
        success: false,
        error: 'barbershop_id, name, duration e price são obrigatórios'
      });
    }

    if (duration <= 0 || price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Duration e price devem ser maiores que zero'
      });
    }

    // Verificar se a barbearia existe
    const barbershopCheck = await query('SELECT id FROM barbershops WHERE id = $1', [barbershop_id]);
    if (barbershopCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Barbearia não encontrada'
      });
    }

    const result = await query(`
      INSERT INTO services (
        barbershop_id, name, description, category, duration,
        price, commission_rate, image_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, description, category, duration, price, commission_rate, is_active, created_at
    `, [
      barbershop_id,
      name,
      description,
      category || 'outros',
      duration,
      price,
      commission_rate || 50.00,
      image_url
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Serviço criado com sucesso'
    });
  } catch (error: any) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar serviço',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/services/:id - Atualizar serviço
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      duration,
      price,
      commission_rate,
      is_active,
      image_url
    } = req.body;

    // Verificar se o serviço existe
    const checkResult = await query('SELECT id FROM services WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Serviço não encontrado'
      });
    }

    // Validações
    if (duration !== undefined && duration <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Duration deve ser maior que zero'
      });
    }

    if (price !== undefined && price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price deve ser maior que zero'
      });
    }

    const result = await query(`
      UPDATE services
      SET name = COALESCE($2, name),
          description = COALESCE($3, description),
          category = COALESCE($4, category),
          duration = COALESCE($5, duration),
          price = COALESCE($6, price),
          commission_rate = COALESCE($7, commission_rate),
          is_active = COALESCE($8, is_active),
          image_url = COALESCE($9, image_url),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, description, category, duration, price, commission_rate, is_active, updated_at
    `, [id, name, description, category, duration, price, commission_rate, is_active, image_url]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Serviço atualizado com sucesso'
    });
  } catch (error: any) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar serviço',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/services/:id - Desativar serviço
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o serviço existe
    const checkResult = await query('SELECT id, name FROM services WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Serviço não encontrado'
      });
    }

    // Verificar se o serviço tem agendamentos futuros
    const futureAppointments = await query(`
      SELECT COUNT(*) as count
      FROM appointments
      WHERE service_id = $1 AND appointment_date >= CURRENT_DATE
    `, [id]);

    if (parseInt(futureAppointments.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível remover serviço com agendamentos futuros. Desative-o primeiro.'
      });
    }

    // Soft delete - apenas marcar como inativo
    await query(`
      UPDATE services
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
    `, [id]);

    res.json({
      success: true,
      message: 'Serviço desativado com sucesso'
    });
  } catch (error: any) {
    console.error('Error deactivating service:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao desativar serviço',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/services/:id/stats - Estatísticas do serviço
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const { period = 'month' } = req.query; // week, month, year

    // Verificar se o serviço existe
    const checkResult = await query('SELECT id, name FROM services WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Serviço não encontrado'
      });
    }

    let dateFilter = '';
    switch (period) {
      case 'week':
        dateFilter = 'AND a.appointment_date >= CURRENT_DATE - INTERVAL \'7 days\'';
        break;
      case 'month':
        dateFilter = 'AND a.appointment_date >= CURRENT_DATE - INTERVAL \'1 month\'';
        break;
      case 'year':
        dateFilter = 'AND a.appointment_date >= CURRENT_DATE - INTERVAL \'1 year\'';
        break;
      default:
        dateFilter = 'AND a.appointment_date >= CURRENT_DATE - INTERVAL \'1 month\'';
    }

    // Estatísticas gerais
    const statsResult = await query(`
      SELECT
        COUNT(*) as total_appointments,
        COUNT(*) FILTER (WHERE a.status = 'completed') as completed_appointments,
        COUNT(*) FILTER (WHERE a.status = 'cancelled') as cancelled_appointments,
        COALESCE(SUM(a.price), 0) as total_revenue,
        COUNT(DISTINCT a.client_id) as unique_clients,
        COUNT(DISTINCT a.barber_id) as barbers_performed
      FROM appointments a
      WHERE a.service_id = $1 ${dateFilter}
    `, [id]);

    // Barbeiros que mais realizam este serviço
    const barbersResult = await query(`
      SELECT
        b.name,
        COUNT(a.id) as appointments_count,
        COALESCE(SUM(a.price), 0) as revenue
      FROM appointments a
      JOIN barbers b ON a.barber_id = b.id
      WHERE a.service_id = $1 ${dateFilter}
      GROUP BY b.id, b.name
      ORDER BY appointments_count DESC
      LIMIT 5
    `, [id]);

    // Agendamentos por dia (últimos 30 dias)
    const dailyBookingsResult = await query(`
      SELECT
        a.appointment_date as date,
        COUNT(*) as appointments_count,
        COALESCE(SUM(a.price), 0) as revenue
      FROM appointments a
      WHERE a.service_id = $1
        AND a.appointment_date >= CURRENT_DATE - INTERVAL '30 days'
        AND a.status IN ('completed', 'confirmed')
      GROUP BY a.appointment_date
      ORDER BY a.appointment_date DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        service: checkResult.rows[0],
        period,
        stats: statsResult.rows[0],
        top_barbers: barbersResult.rows,
        daily_bookings: dailyBookingsResult.rows
      }
    });
  } catch (error: any) {
    console.error('Error fetching service stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas do serviço',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/services/:id/duplicate - Duplicar serviço
router.post('/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    const { name_suffix = ' (Cópia)' } = req.body;

    // Buscar serviço original
    const originalResult = await query(`
      SELECT barbershop_id, name, description, category, duration, price, commission_rate, image_url
      FROM services
      WHERE id = $1
    `, [id]);

    if (originalResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Serviço não encontrado'
      });
    }

    const original = originalResult.rows[0];

    // Criar cópia
    const result = await query(`
      INSERT INTO services (
        barbershop_id, name, description, category, duration,
        price, commission_rate, image_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, description, category, duration, price, commission_rate, is_active, created_at
    `, [
      original.barbershop_id,
      original.name + name_suffix,
      original.description,
      original.category,
      original.duration,
      original.price,
      original.commission_rate,
      original.image_url
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Serviço duplicado com sucesso'
    });
  } catch (error: any) {
    console.error('Error duplicating service:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao duplicar serviço',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;