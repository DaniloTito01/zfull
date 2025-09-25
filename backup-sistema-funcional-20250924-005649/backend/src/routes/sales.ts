import express from 'express';
import { query } from '../database.js';

const router = express.Router();

// GET /api/sales - Listar vendas
router.get('/', async (req, res) => {
  try {
    const { barbershop_id, barber_id, client_id, date, page = 1, limit = 50 } = req.query;

    if (!barbershop_id) {
      return res.status(400).json({
        success: false,
        error: 'barbershop_id é obrigatório'
      });
    }

    const offset = (Number(page) - 1) * Number(limit);
    let whereClause = 'WHERE s.barbershop_id = $1';
    const params = [barbershop_id];

    if (barber_id) {
      whereClause += ` AND s.barber_id = $${params.length + 1}`;
      params.push(barber_id);
    }

    if (client_id) {
      whereClause += ` AND s.client_id = $${params.length + 1}`;
      params.push(client_id);
    }

    if (date) {
      whereClause += ` AND DATE(s.sale_date) = $${params.length + 1}`;
      params.push(date);
    }

    const result = await query(`
      SELECT
        s.id, s.sale_date, s.subtotal, s.discount, s.total,
        s.payment_method, s.status, s.notes, s.created_at,
        c.name as client_name, c.phone as client_phone,
        b.name as barber_name,
        a.appointment_date, a.appointment_time
      FROM sales s
      LEFT JOIN clients c ON s.client_id = c.id
      LEFT JOIN barbers b ON s.barber_id = b.id
      LEFT JOIN appointments a ON s.appointment_id = a.id
      ${whereClause}
      ORDER BY s.sale_date DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset]);

    // Contar total
    const countResult = await query(`
      SELECT COUNT(*) as total FROM sales s ${whereClause}
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
    console.error('Error fetching sales:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar vendas',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/sales/daily - Vendas do dia
router.get('/daily', async (req, res) => {
  try {
    const { barbershop_id, date } = req.query;

    if (!barbershop_id) {
      return res.status(400).json({
        success: false,
        error: 'barbershop_id é obrigatório'
      });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    const result = await query(`
      SELECT
        COUNT(*) as total_sales,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(AVG(total), 0) as avg_ticket,
        COUNT(DISTINCT client_id) as unique_clients,
        COUNT(*) FILTER (WHERE payment_method = 'cash') as cash_sales,
        COUNT(*) FILTER (WHERE payment_method = 'card') as card_sales,
        COUNT(*) FILTER (WHERE payment_method = 'pix') as pix_sales
      FROM sales
      WHERE barbershop_id = $1
        AND DATE(sale_date) = $2
        AND status = 'completed'
    `, [barbershop_id, targetDate]);

    // Top produtos vendidos hoje
    const topProductsResult = await query(`
      SELECT
        p.name,
        SUM(si.quantity) as quantity_sold,
        SUM(si.total_price) as revenue
      FROM sale_items si
      JOIN products p ON si.item_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.barbershop_id = $1
        AND DATE(s.sale_date) = $2
        AND si.item_type = 'product'
        AND s.status = 'completed'
      GROUP BY p.id, p.name
      ORDER BY quantity_sold DESC
      LIMIT 5
    `, [barbershop_id, targetDate]);

    // Top serviços vendidos hoje
    const topServicesResult = await query(`
      SELECT
        srv.name,
        COUNT(si.id) as times_sold,
        SUM(si.total_price) as revenue
      FROM sale_items si
      JOIN services srv ON si.item_id = srv.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.barbershop_id = $1
        AND DATE(s.sale_date) = $2
        AND si.item_type = 'service'
        AND s.status = 'completed'
      GROUP BY srv.id, srv.name
      ORDER BY times_sold DESC
      LIMIT 5
    `, [barbershop_id, targetDate]);

    res.json({
      success: true,
      data: {
        date: targetDate,
        summary: result.rows[0],
        top_products: topProductsResult.rows,
        top_services: topServicesResult.rows
      }
    });
  } catch (error: any) {
    console.error('Error fetching daily sales:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar vendas do dia',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/sales/:id - Buscar venda por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT
        s.id, s.sale_date, s.subtotal, s.discount, s.total,
        s.payment_method, s.status, s.notes, s.created_at,
        c.name as client_name, c.phone as client_phone,
        b.name as barber_name
      FROM sales s
      LEFT JOIN clients c ON s.client_id = c.id
      LEFT JOIN barbers b ON s.barber_id = b.id
      WHERE s.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Venda não encontrada'
      });
    }

    // Buscar itens da venda
    const itemsResult = await query(`
      SELECT
        si.id, si.item_type, si.quantity, si.unit_price, si.total_price,
        CASE
          WHEN si.item_type = 'service' THEN srv.name
          WHEN si.item_type = 'product' THEN prd.name
        END as item_name
      FROM sale_items si
      LEFT JOIN services srv ON si.item_type = 'service' AND si.item_id = srv.id
      LEFT JOIN products prd ON si.item_type = 'product' AND si.item_id = prd.id
      WHERE si.sale_id = $1
      ORDER BY si.created_at
    `, [id]);

    res.json({
      success: true,
      data: {
        sale: result.rows[0],
        items: itemsResult.rows
      }
    });
  } catch (error: any) {
    console.error('Error fetching sale:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar venda',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/sales - Criar nova venda (PDV)
router.post('/', async (req, res) => {
  try {
    const {
      barbershop_id,
      client_id,
      barber_id,
      appointment_id,
      items,
      discount = 0,
      payment_method = 'cash',
      notes
    } = req.body;

    // Validações básicas
    if (!barbershop_id || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'barbershop_id e items são obrigatórios'
      });
    }

    // Calcular subtotal
    let subtotal = 0;
    for (const item of items) {
      if (!item.item_type || !item.item_id || !item.quantity || !item.unit_price) {
        return res.status(400).json({
          success: false,
          error: 'Cada item deve ter: item_type, item_id, quantity, unit_price'
        });
      }
      subtotal += item.quantity * item.unit_price;
    }

    const total = subtotal - (discount || 0);

    if (total < 0) {
      return res.status(400).json({
        success: false,
        error: 'Total não pode ser negativo'
      });
    }

    // Criar venda
    const saleResult = await query(`
      INSERT INTO sales (
        barbershop_id, client_id, barber_id, appointment_id,
        subtotal, discount, total, payment_method, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, sale_date, subtotal, discount, total, payment_method, status, created_at
    `, [barbershop_id, client_id, barber_id, appointment_id, subtotal, discount, total, payment_method, notes]);

    const saleId = saleResult.rows[0].id;

    // Criar itens da venda
    for (const item of items) {
      const totalPrice = item.quantity * item.unit_price;

      await query(`
        INSERT INTO sale_items (sale_id, item_type, item_id, quantity, unit_price, total_price)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [saleId, item.item_type, item.item_id, item.quantity, item.unit_price, totalPrice]);

      // Se for produto, atualizar estoque
      if (item.item_type === 'product') {
        await query(`
          UPDATE products
          SET current_stock = current_stock - $2
          WHERE id = $1
        `, [item.item_id, item.quantity]);

        // Registrar movimentação de estoque
        await query(`
          INSERT INTO stock_movements (product_id, movement_type, quantity, reason, reference_id)
          VALUES ($1, 'out', $2, 'Venda', $3)
        `, [item.item_id, item.quantity, saleId]);
      }
    }

    // Atualizar estatísticas do cliente se fornecido
    if (client_id) {
      await query(`
        UPDATE clients
        SET total_spent = total_spent + $2
        WHERE id = $1
      `, [client_id, total]);
    }

    res.status(201).json({
      success: true,
      data: saleResult.rows[0],
      message: 'Venda criada com sucesso'
    });
  } catch (error: any) {
    console.error('Error creating sale:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar venda',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/sales/reports - Relatórios de vendas
router.get('/reports', async (req, res) => {
  try {
    const { barbershop_id, period = 'month' } = req.query;

    if (!barbershop_id) {
      return res.status(400).json({
        success: false,
        error: 'barbershop_id é obrigatório'
      });
    }

    let dateFilter = '';
    switch (period) {
      case 'week':
        dateFilter = "AND s.sale_date >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "AND s.sale_date >= CURRENT_DATE - INTERVAL '1 month'";
        break;
      case 'year':
        dateFilter = "AND s.sale_date >= CURRENT_DATE - INTERVAL '1 year'";
        break;
      default:
        dateFilter = "AND s.sale_date >= CURRENT_DATE - INTERVAL '1 month'";
    }

    // Resumo financeiro
    const summaryResult = await query(`
      SELECT
        COUNT(*) as total_sales,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(AVG(total), 0) as avg_ticket,
        COUNT(DISTINCT client_id) as unique_clients
      FROM sales s
      WHERE barbershop_id = $1 ${dateFilter}
        AND status = 'completed'
    `, [barbershop_id]);

    // Vendas por dia (últimos 30 dias)
    const dailyResult = await query(`
      SELECT
        DATE(sale_date) as date,
        COUNT(*) as sales_count,
        COALESCE(SUM(total), 0) as revenue
      FROM sales
      WHERE barbershop_id = $1
        AND sale_date >= CURRENT_DATE - INTERVAL '30 days'
        AND status = 'completed'
      GROUP BY DATE(sale_date)
      ORDER BY date DESC
    `, [barbershop_id]);

    res.json({
      success: true,
      data: {
        period,
        summary: summaryResult.rows[0],
        daily_sales: dailyResult.rows
      }
    });
  } catch (error: any) {
    console.error('Error fetching sales reports:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar relatórios',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;