import express from 'express';
import { query } from '../database.js';

const router = express.Router();

// GET /api/clients - Listar clientes com filtros
router.get('/', async (req, res) => {
  try {
    const {
      barbershop_id,
      search,
      status = 'active',
      page = 1,
      limit = 50,
      sort_by = 'name',
      sort_order = 'ASC'
    } = req.query;

    if (!barbershop_id) {
      return res.status(400).json({
        success: false,
        error: 'barbershop_id é obrigatório'
      });
    }

    const offset = (Number(page) - 1) * Number(limit);
    const validSortBy = ['name', 'client_since', 'total_visits', 'total_spent'];
    const validSortOrder = ['ASC', 'DESC'];

    const sortBy = validSortBy.includes(sort_by as string) ? sort_by : 'name';
    const sortOrder = validSortOrder.includes(sort_order as string) ? sort_order : 'ASC';

    let whereClause = 'WHERE c.barbershop_id = $1';
    const params = [barbershop_id];

    if (status && status !== 'all') {
      whereClause += ` AND c.status = $${params.length + 1}`;
      params.push(status);
    }

    if (search) {
      whereClause += ` AND (c.name ILIKE $${params.length + 1} OR c.phone ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    // Query principal
    const result = await query(`
      SELECT
        c.id, c.name, c.phone, c.email, c.birth_date,
        c.client_since, c.total_visits, c.total_spent, c.status,
        c.notes, c.created_at, c.updated_at,
        b.name as preferred_barber_name
      FROM clients c
      LEFT JOIN barbers b ON c.preferred_barber_id = b.id
      ${whereClause}
      ORDER BY c.${sortBy} ${sortOrder}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset]);

    // Contar total de registros
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM clients c
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
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar clientes',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/clients - Criar novo cliente
router.post('/', async (req, res) => {
  try {
    const {
      barbershop_id,
      name,
      phone,
      email,
      birth_date,
      address,
      preferred_barber_id,
      notes
    } = req.body;

    // Validações básicas
    if (!barbershop_id || !name) {
      return res.status(400).json({
        success: false,
        error: 'barbershop_id e name são obrigatórios'
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

    // Verificar se já existe cliente com mesmo telefone na barbearia
    if (phone) {
      const phoneCheck = await query(
        'SELECT id FROM clients WHERE barbershop_id = $1 AND phone = $2',
        [barbershop_id, phone]
      );
      if (phoneCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Já existe um cliente com este telefone nesta barbearia'
        });
      }
    }

    // Tratar valores vazios para UUIDs e campos opcionais
    const safeEmail = email && email.trim() !== '' ? email : null;
    const safeBirthDate = birth_date && birth_date.trim() !== '' ? birth_date : null;
    const safeAddress = address && address.trim() !== '' ? address : null;
    const safePreferredBarberId = preferred_barber_id && preferred_barber_id.trim() !== '' ? preferred_barber_id : null;
    const safeNotes = notes && notes.trim() !== '' ? notes : null;

    const result = await query(`
      INSERT INTO clients (
        barbershop_id, name, phone, email, birth_date,
        address, preferred_barber_id, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, phone, email, birth_date, client_since, status, created_at
    `, [barbershop_id, name, phone, safeEmail, safeBirthDate, safeAddress, safePreferredBarberId, safeNotes]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Cliente criado com sucesso'
    });
  } catch (error: any) {
    console.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar cliente',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/clients/:id - Buscar cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT
        c.id, c.name, c.phone, c.email, c.birth_date,
        c.client_since, c.total_visits, c.total_spent, c.status,
        c.notes, c.address, c.preferred_barber_id, c.created_at, c.updated_at,
        b.name as preferred_barber_name
      FROM clients c
      LEFT JOIN barbers b ON c.preferred_barber_id = b.id
      WHERE c.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar cliente',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/clients/:id - Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      email,
      birth_date,
      address,
      preferred_barber_id,
      notes,
      status
    } = req.body;

    // Verificar se o cliente existe
    const clientCheck = await query('SELECT id, barbershop_id FROM clients WHERE id = $1', [id]);
    if (clientCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      });
    }

    const barbershop_id = clientCheck.rows[0].barbershop_id;

    // Verificar se já existe outro cliente com mesmo telefone na barbearia
    if (phone) {
      const phoneCheck = await query(
        'SELECT id FROM clients WHERE barbershop_id = $1 AND phone = $2 AND id != $3',
        [barbershop_id, phone, id]
      );
      if (phoneCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Já existe outro cliente com este telefone nesta barbearia'
        });
      }
    }

    // Construir query dinâmica apenas para campos fornecidos
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      values.push(name);
    }

    if (phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }

    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      values.push(email === '' ? null : email);
    }

    if (birth_date !== undefined) {
      updateFields.push(`birth_date = $${paramIndex++}`);
      values.push(birth_date === '' ? null : birth_date);
    }

    if (address !== undefined) {
      updateFields.push(`address = $${paramIndex++}`);
      values.push(address === '' ? null : address);
    }

    if (preferred_barber_id !== undefined) {
      updateFields.push(`preferred_barber_id = $${paramIndex++}`);
      values.push(preferred_barber_id === '' ? null : preferred_barber_id);
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`);
      values.push(notes === '' ? null : notes);
    }

    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    // Sempre atualizar o timestamp
    updateFields.push(`updated_at = NOW()`);

    // Adicionar o ID como último parâmetro
    values.push(id);

    if (updateFields.length === 1) { // Apenas updated_at
      return res.status(400).json({
        success: false,
        error: 'Nenhum campo fornecido para atualização'
      });
    }

    const result = await query(`
      UPDATE clients SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, phone, email, birth_date, client_since, status, updated_at
    `, values);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Cliente atualizado com sucesso'
    });
  } catch (error: any) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar cliente',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/clients/:id - Excluir cliente (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o cliente existe
    const clientCheck = await query('SELECT id FROM clients WHERE id = $1', [id]);
    if (clientCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      });
    }

    // Soft delete - marcar como inativo
    await query(`
      UPDATE clients SET
        status = 'inactive',
        updated_at = NOW()
      WHERE id = $1
    `, [id]);

    res.json({
      success: true,
      message: 'Cliente excluído com sucesso'
    });
  } catch (error: any) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao excluir cliente',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;