import express from 'express';
import { query } from '../database.js';

const router = express.Router();

// GET /api/barbers - Listar barbeiros
router.get('/', async (req, res) => {
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
        id, name, email, phone, specialty, commission_rate,
        working_hours, status, created_at, updated_at
      FROM barbers
      WHERE barbershop_id = $1
      ORDER BY name
    `, [barbershop_id]);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error: any) {
    console.error('Error fetching barbers:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar barbeiros',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/barbers - Criar novo barbeiro
router.post('/', async (req, res) => {
  try {
    const {
      barbershop_id,
      name,
      email,
      phone,
      specialty,
      commission_rate
    } = req.body;

    if (!barbershop_id || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'barbershop_id, name, email e phone são obrigatórios'
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

    // Verificar se já existe barbeiro com mesmo email
    const emailCheck = await query(
      'SELECT id FROM barbers WHERE barbershop_id = $1 AND email = $2',
      [barbershop_id, email]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Já existe um barbeiro com este email nesta barbearia'
      });
    }

    const result = await query(`
      INSERT INTO barbers (
        barbershop_id, name, email, phone, specialty,
        commission_rate, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, phone, specialty, commission_rate, status, created_at
    `, [
      barbershop_id,
      name,
      email,
      phone,
      Array.isArray(specialty) ? specialty : [specialty || ''],
      commission_rate || 50.00,
      'active'
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Barbeiro criado com sucesso'
    });
  } catch (error: any) {
    console.error('Error creating barber:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar barbeiro',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/barbers/:id - Atualizar barbeiro
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      specialty,
      commission_rate,
      status,
      working_hours
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do barbeiro é obrigatório'
      });
    }

    // Verificar se o barbeiro existe
    const barberCheck = await query('SELECT id FROM barbers WHERE id = $1', [id]);
    if (barberCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Barbeiro não encontrado'
      });
    }

    // Se email foi fornecido, verificar se não está sendo usado por outro barbeiro
    if (email) {
      const emailCheck = await query(
        'SELECT id FROM barbers WHERE email = $1 AND id != $2',
        [email, id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email já está sendo usado por outro barbeiro'
        });
      }
    }

    // Construir query de update dinamicamente
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (name) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(name);
    }
    if (email) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(email);
    }
    if (phone) {
      updateFields.push(`phone = $${paramIndex++}`);
      updateValues.push(phone);
    }
    if (specialty) {
      updateFields.push(`specialty = $${paramIndex++}`);
      updateValues.push(Array.isArray(specialty) ? specialty : [specialty]);
    }
    if (commission_rate !== undefined) {
      updateFields.push(`commission_rate = $${paramIndex++}`);
      updateValues.push(commission_rate);
    }
    if (status) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(status);
    }
    if (working_hours) {
      updateFields.push(`working_hours = $${paramIndex++}`);
      updateValues.push(working_hours);
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const updateQuery = `
      UPDATE barbers
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, email, phone, specialty, commission_rate, status, working_hours, created_at, updated_at
    `;

    const result = await query(updateQuery, updateValues);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Barbeiro atualizado com sucesso'
    });
  } catch (error: any) {
    console.error('Error updating barber:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar barbeiro',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/barbers/:id - Deletar barbeiro
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do barbeiro é obrigatório'
      });
    }

    // Verificar se o barbeiro existe
    const barberCheck = await query('SELECT id, name FROM barbers WHERE id = $1', [id]);
    if (barberCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Barbeiro não encontrado'
      });
    }

    // Verificar se o barbeiro tem agendamentos
    const appointmentsCheck = await query(
      'SELECT COUNT(*) as count FROM appointments WHERE barber_id = $1',
      [id]
    );

    if (parseInt(appointmentsCheck.rows[0].count) > 0) {
      // Se tem agendamentos, apenas desativar ao invés de deletar
      await query('UPDATE barbers SET status = $1 WHERE id = $2', ['inactive', id]);

      return res.json({
        success: true,
        message: 'Barbeiro desativado com sucesso (possui agendamentos)',
        data: { id, action: 'deactivated' }
      });
    }

    // Se não tem agendamentos, pode deletar
    await query('DELETE FROM barbers WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Barbeiro removido com sucesso',
      data: { id, action: 'deleted' }
    });
  } catch (error: any) {
    console.error('Error deleting barber:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover barbeiro',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/barbers/:id - Obter barbeiro específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID do barbeiro é obrigatório'
      });
    }

    const result = await query(`
      SELECT
        id, barbershop_id, name, email, phone, specialty, commission_rate,
        working_hours, status, created_at, updated_at
      FROM barbers
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Barbeiro não encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error fetching barber:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar barbeiro',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;