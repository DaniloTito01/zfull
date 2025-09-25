import express from 'express';
import { query } from '../database.js';

const router = express.Router();

// GET /api/appointments - Listar agendamentos com filtros
router.get('/', async (req, res) => {
  try {
    const {
      barbershop_id,
      barber_id,
      client_id,
      date,
      status,
      page = 1,
      limit = 50
    } = req.query;

    if (!barbershop_id) {
      return res.status(400).json({
        success: false,
        error: 'barbershop_id é obrigatório'
      });
    }

    const offset = (Number(page) - 1) * Number(limit);
    let whereClause = 'WHERE a.barbershop_id = $1';
    const params = [barbershop_id];

    if (barber_id) {
      whereClause += ` AND a.barber_id = $${params.length + 1}`;
      params.push(barber_id);
    }

    if (client_id) {
      whereClause += ` AND a.client_id = $${params.length + 1}`;
      params.push(client_id);
    }

    if (date) {
      whereClause += ` AND a.appointment_date = $${params.length + 1}`;
      params.push(date);
    }

    if (status) {
      whereClause += ` AND a.status = $${params.length + 1}`;
      params.push(status);
    }

    const result = await query(`
      SELECT
        a.id, a.appointment_date, a.appointment_time, a.duration,
        a.status, a.price, a.notes, a.created_at,
        c.name as client_name, c.phone as client_phone,
        b.name as barber_name,
        s.name as service_name, s.category as service_category
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN barbers b ON a.barber_id = b.id
      JOIN services s ON a.service_id = s.id
      ${whereClause}
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset]);

    // Contar total
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM appointments a
      ${whereClause}
    `, params);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar agendamentos',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/appointments/calendar - Agenda do dia/semana
router.get('/calendar', async (req, res) => {
  try {
    const { barbershop_id, date, view = 'day' } = req.query;

    if (!barbershop_id) {
      return res.status(400).json({
        success: false,
        error: 'barbershop_id é obrigatório'
      });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    let dateFilter = '';

    if (view === 'week') {
      // Buscar semana toda
      dateFilter = `
        AND a.appointment_date >= DATE_TRUNC('week', DATE '$1')
        AND a.appointment_date < DATE_TRUNC('week', DATE '$1') + INTERVAL '7 days'
      `;
    } else {
      // Buscar apenas o dia
      dateFilter = 'AND a.appointment_date = $2';
    }

    const result = await query(`
      SELECT
        a.id, a.appointment_date, a.appointment_time, a.duration,
        a.status, a.price, a.notes,
        c.id as client_id, c.name as client_name, c.phone as client_phone,
        b.id as barber_id, b.name as barber_name,
        s.id as service_id, s.name as service_name, s.category as service_category
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN barbers b ON a.barber_id = b.id
      JOIN services s ON a.service_id = s.id
      WHERE a.barbershop_id = $1 ${dateFilter}
      ORDER BY a.appointment_date, a.appointment_time
    `, [barbershop_id, targetDate]);

    // Buscar barbeiros ativos para mostrar slots vazios
    const barbersResult = await query(`
      SELECT id, name, working_hours
      FROM barbers
      WHERE barbershop_id = $1 AND status = 'active'
      ORDER BY name
    `, [barbershop_id]);

    res.json({
      success: true,
      data: {
        view,
        date: targetDate,
        appointments: result.rows,
        barbers: barbersResult.rows
      }
    });
  } catch (error: any) {
    console.error('Error fetching calendar:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar agenda',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/appointments/:id - Buscar agendamento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT
        a.id, a.appointment_date, a.appointment_time, a.duration,
        a.status, a.price, a.notes, a.created_at, a.updated_at,
        c.id as client_id, c.name as client_name, c.phone as client_phone,
        c.email as client_email,
        b.id as barber_id, b.name as barber_name,
        s.id as service_id, s.name as service_name, s.duration as service_duration,
        s.price as service_price, s.category as service_category
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN barbers b ON a.barber_id = b.id
      JOIN services s ON a.service_id = s.id
      WHERE a.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar agendamento',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/appointments - Criar novo agendamento
router.post('/', async (req, res) => {
  try {
    const {
      barbershop_id,
      client_id,
      barber_id,
      service_id,
      appointment_date,
      appointment_time,
      notes
    } = req.body;

    // Validações básicas
    if (!barbershop_id || !client_id || !barber_id || !service_id || !appointment_date || !appointment_time) {
      return res.status(400).json({
        success: false,
        error: 'Todos os campos são obrigatórios: barbershop_id, client_id, barber_id, service_id, appointment_date, appointment_time'
      });
    }

    // Verificar se todos os IDs existem
    const checks = await Promise.all([
      query('SELECT id FROM barbershops WHERE id = $1', [barbershop_id]),
      query('SELECT id FROM clients WHERE id = $1 AND barbershop_id = $2', [client_id, barbershop_id]),
      query('SELECT id FROM barbers WHERE id = $1 AND barbershop_id = $2 AND status = \'active\'', [barber_id, barbershop_id]),
      query('SELECT id, duration, price FROM services WHERE id = $1 AND barbershop_id = $2 AND is_active = true', [service_id, barbershop_id])
    ]);

    if (checks[0].rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Barbearia não encontrada' });
    }
    if (checks[1].rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Cliente não encontrado' });
    }
    if (checks[2].rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Barbeiro não encontrado ou inativo' });
    }
    if (checks[3].rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Serviço não encontrado ou inativo' });
    }

    const service = checks[3].rows[0];

    // Verificar conflitos de horário
    const conflictCheck = await query(`
      SELECT id FROM appointments
      WHERE barber_id = $1
        AND appointment_date = $2
        AND appointment_time < ($3::time + INTERVAL '${service.duration} minutes')
        AND (appointment_time + INTERVAL '1 minute' * duration) > $3::time
        AND status IN ('scheduled', 'confirmed', 'in_progress')
    `, [barber_id, appointment_date, appointment_time]);

    if (conflictCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Conflito de horário: já existe um agendamento neste horário'
      });
    }

    // Criar agendamento
    const result = await query(`
      INSERT INTO appointments (
        barbershop_id, client_id, barber_id, service_id,
        appointment_date, appointment_time, duration, price, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, appointment_date, appointment_time, duration, status, price, created_at
    `, [
      barbershop_id, client_id, barber_id, service_id,
      appointment_date, appointment_time, service.duration, service.price, notes
    ]);

    // Atualizar estatísticas do cliente
    await query(`
      UPDATE clients
      SET total_visits = total_visits + 1,
          total_spent = total_spent + $2
      WHERE id = $1
    `, [client_id, service.price]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Agendamento criado com sucesso'
    });
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar agendamento',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/appointments/:id - Atualizar agendamento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      client_id,
      barber_id,
      service_id,
      appointment_date,
      appointment_time,
      status,
      notes
    } = req.body;

    // Verificar se o agendamento existe
    const checkResult = await query('SELECT id, barbershop_id, price FROM appointments WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado'
      });
    }

    const barbershop_id = checkResult.rows[0].barbershop_id;

    // Se mudando serviço, buscar nova duração e preço
    let duration, price;
    if (service_id) {
      const serviceResult = await query('SELECT duration, price FROM services WHERE id = $1', [service_id]);
      if (serviceResult.rows.length === 0) {
        return res.status(400).json({ success: false, error: 'Serviço não encontrado' });
      }
      duration = serviceResult.rows[0].duration;
      price = serviceResult.rows[0].price;
    }

    // Verificação básica de conflitos (apenas para agendamentos completos)
    if (appointment_date && appointment_time && barber_id) {
      try {
        const conflictCheck = await query(`
          SELECT id FROM appointments
          WHERE barber_id = $1
            AND appointment_date = $2
            AND appointment_time = $3
            AND status IN ('scheduled', 'confirmed', 'in_progress')
            AND id != $4
        `, [barber_id, appointment_date, appointment_time, id]);

        if (conflictCheck.rows.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Conflito de horário: já existe um agendamento neste horário'
          });
        }
      } catch (conflictError) {
        console.error('Erro na verificação de conflitos:', conflictError);
        // Continua sem bloquear a atualização
      }
    }

    const result = await query(`
      UPDATE appointments
      SET client_id = COALESCE($2, client_id),
          barber_id = COALESCE($3, barber_id),
          service_id = COALESCE($4, service_id),
          appointment_date = COALESCE($5, appointment_date),
          appointment_time = COALESCE($6, appointment_time),
          duration = COALESCE($7, duration),
          price = COALESCE($8, price),
          status = COALESCE($9, status),
          notes = COALESCE($10, notes),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, appointment_date, appointment_time, duration, status, price, updated_at
    `, [id, client_id, barber_id, service_id, appointment_date, appointment_time, duration, price, status, notes]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Agendamento atualizado com sucesso'
    });
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar agendamento',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/appointments/:id/status - Atualizar apenas status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status é obrigatório'
      });
    }

    const validStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status inválido. Use: ' + validStatuses.join(', ')
      });
    }

    const checkResult = await query('SELECT id FROM appointments WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado'
      });
    }

    const result = await query(`
      UPDATE appointments
      SET status = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id, status, updated_at
    `, [id, status]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Status atualizado com sucesso'
    });
  } catch (error: any) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar status',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/appointments/:id - Cancelar agendamento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const checkResult = await query('SELECT id, status FROM appointments WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado'
      });
    }

    if (checkResult.rows[0].status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Não é possível cancelar agendamento já completado'
      });
    }

    await query(`
      UPDATE appointments
      SET status = 'cancelled',
          notes = COALESCE(notes || ' | ', '') || 'Cancelado: ' || COALESCE($2, 'Sem motivo informado'),
          updated_at = NOW()
      WHERE id = $1
    `, [id, reason]);

    res.json({
      success: true,
      message: 'Agendamento cancelado com sucesso'
    });
  } catch (error: any) {
    console.error('Error canceling appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao cancelar agendamento',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/appointments/available-slots - Verificar horários disponíveis
router.get('/available-slots', async (req, res) => {
  try {
    const { barbershop_id, barber_id, service_id, date } = req.query;

    if (!barbershop_id || !barber_id || !service_id || !date) {
      return res.status(400).json({
        success: false,
        error: 'barbershop_id, barber_id, service_id e date são obrigatórios'
      });
    }

    // Buscar duração do serviço
    const serviceResult = await query('SELECT duration FROM services WHERE id = $1', [service_id]);
    if (serviceResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Serviço não encontrado' });
    }

    const serviceDuration = serviceResult.rows[0].duration;

    // Buscar horário de trabalho do barbeiro
    const barberResult = await query('SELECT working_hours FROM barbers WHERE id = $1', [barber_id]);
    if (barberResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Barbeiro não encontrado' });
    }

    // Buscar agendamentos existentes
    const appointmentsResult = await query(`
      SELECT appointment_time, duration
      FROM appointments
      WHERE barber_id = $1
        AND appointment_date = $2
        AND status IN ('scheduled', 'confirmed', 'in_progress')
      ORDER BY appointment_time
    `, [barber_id, date]);

    // Gerar slots disponíveis (lógica simplificada)
    const workingHours = barberResult.rows[0].working_hours;
    const dayOfWeek = new Date(date + 'T00:00:00').toLocaleDateString('en', { weekday: 'long' }).toLowerCase();
    const daySchedule = workingHours[dayOfWeek] || { start: '09:00', end: '18:00', active: true };

    const availableSlots = [];
    if (daySchedule.active) {
      // Lógica simplificada - seria preciso implementar algoritmo mais sofisticado
      const startHour = parseInt(daySchedule.start.split(':')[0]);
      const endHour = parseInt(daySchedule.end.split(':')[0]);

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

          // Verificar se slot não conflita com agendamentos existentes
          const hasConflict = appointmentsResult.rows.some(apt => {
            // Lógica simplificada de verificação de conflito
            return apt.appointment_time === timeSlot;
          });

          if (!hasConflict) {
            availableSlots.push(timeSlot);
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        date,
        service_duration: serviceDuration,
        available_slots: availableSlots
      }
    });
  } catch (error: any) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar horários disponíveis',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;