import express from 'express';
import { query } from '../database.js';

const router = express.Router();

// GET /api/products - Listar produtos
router.get('/', async (req, res) => {
  try {
    const { barbershop_id, category, is_active = 'true', low_stock = 'false' } = req.query;

    if (!barbershop_id) {
      return res.status(400).json({
        success: false,
        error: 'barbershop_id é obrigatório'
      });
    }

    let whereClause = 'WHERE p.barbershop_id = $1';
    const params: any[] = [barbershop_id];

    if (is_active !== 'all') {
      whereClause += ` AND p.is_active = $${params.length + 1}`;
      params.push(is_active === 'true');
    }

    if (category) {
      whereClause += ` AND p.category = $${params.length + 1}`;
      params.push(category);
    }

    if (low_stock === 'true') {
      whereClause += ` AND p.current_stock <= p.min_stock`;
    }

    const result = await query(`
      SELECT
        p.id, p.name, p.description, p.category, p.brand, p.barcode,
        p.cost_price, p.sell_price, p.current_stock, p.min_stock,
        p.is_active, p.image_url, p.created_at, p.updated_at
      FROM products p
      ${whereClause}
      ORDER BY p.name
    `, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar produtos',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/products/:id - Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT
        p.id, p.name, p.description, p.category, p.brand, p.barcode,
        p.cost_price, p.sell_price, p.current_stock, p.min_stock,
        p.is_active, p.image_url, p.created_at, p.updated_at,
        bb.name as barbershop_name
      FROM products p
      JOIN barbershops bb ON p.barbershop_id = bb.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar produto',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/products - Criar novo produto
router.post('/', async (req, res) => {
  try {
    const {
      barbershop_id,
      name,
      description,
      category,
      brand,
      barcode,
      cost_price,
      sell_price,
      current_stock,
      min_stock,
      image_url
    } = req.body;

    // Validações básicas
    if (!barbershop_id || !name || !sell_price) {
      return res.status(400).json({
        success: false,
        error: 'barbershop_id, name e sell_price são obrigatórios'
      });
    }

    if (sell_price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Preço de venda deve ser maior que zero'
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
      INSERT INTO products (
        barbershop_id, name, description, category, brand, barcode,
        cost_price, sell_price, current_stock, min_stock, image_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, name, description, category, sell_price, current_stock, is_active, created_at
    `, [
      barbershop_id, name, description, category || 'outros', brand, barcode,
      cost_price || 0, sell_price, current_stock || 0, min_stock || 5, image_url
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Produto criado com sucesso'
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar produto',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/products/:id - Atualizar produto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, category, brand, barcode,
      cost_price, sell_price, current_stock, min_stock, is_active, image_url
    } = req.body;

    // Verificar se o produto existe
    const checkResult = await query('SELECT id FROM products WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    const result = await query(`
      UPDATE products
      SET name = COALESCE($2, name),
          description = COALESCE($3, description),
          category = COALESCE($4, category),
          brand = COALESCE($5, brand),
          barcode = COALESCE($6, barcode),
          cost_price = COALESCE($7, cost_price),
          sell_price = COALESCE($8, sell_price),
          current_stock = COALESCE($9, current_stock),
          min_stock = COALESCE($10, min_stock),
          is_active = COALESCE($11, is_active),
          image_url = COALESCE($12, image_url),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, description, category, sell_price, current_stock, is_active, updated_at
    `, [id, name, description, category, brand, barcode, cost_price, sell_price, current_stock, min_stock, is_active, image_url]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Produto atualizado com sucesso'
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar produto',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/products/:id/stock - Atualizar estoque
router.post('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { movement_type, quantity, reason } = req.body;

    if (!movement_type || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'movement_type e quantity são obrigatórios'
      });
    }

    const validTypes = ['in', 'out', 'adjustment'];
    if (!validTypes.includes(movement_type)) {
      return res.status(400).json({
        success: false,
        error: 'movement_type deve ser: ' + validTypes.join(', ')
      });
    }

    // Verificar se o produto existe
    const productResult = await query('SELECT current_stock FROM products WHERE id = $1', [id]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    const currentStock = parseInt(productResult.rows[0].current_stock);
    let newStock = currentStock;

    switch (movement_type) {
      case 'in':
        newStock = currentStock + parseInt(quantity);
        break;
      case 'out':
        newStock = currentStock - parseInt(quantity);
        break;
      case 'adjustment':
        newStock = parseInt(quantity);
        break;
    }

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        error: 'Estoque não pode ficar negativo'
      });
    }

    // Atualizar estoque
    await query('UPDATE products SET current_stock = $2 WHERE id = $1', [id, newStock]);

    // Registrar movimentação
    await query(`
      INSERT INTO stock_movements (product_id, movement_type, quantity, reason)
      VALUES ($1, $2, $3, $4)
    `, [id, movement_type, quantity, reason]);

    res.json({
      success: true,
      data: {
        previous_stock: currentStock,
        new_stock: newStock,
        movement_type,
        quantity
      },
      message: 'Estoque atualizado com sucesso'
    });
  } catch (error: any) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar estoque',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;