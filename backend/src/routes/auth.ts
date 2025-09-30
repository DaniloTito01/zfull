import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Login de usuário da barbearia
router.post('/login', async (req, res) => {
  const requestId = (req as any).requestId || 'unknown';
  console.log(`🔑 [AUTH] Login attempt started`, {
    requestId,
    email: req.body.email,
    hasPassword: !!req.body.password,
    timestamp: new Date().toISOString()
  });

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log(`❌ [AUTH] Login failed - missing credentials`, {
        requestId,
        hasEmail: !!email,
        hasPassword: !!password
      });
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário na barbearia
    const userQuery = `
      SELECT u.id, u.email, u.password_hash, u.name, u.role, u.barbershop_id, u.is_active,
             b.name as barbershop_name, b.is_active as barbershop_is_active
      FROM users u
      LEFT JOIN barbershops b ON u.barbershop_id = b.id
      WHERE u.email = $1 AND u.is_active = true
    `;

    const userResult = await pool.query(userQuery, [email.toLowerCase().trim()]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha inválidos'
      });
    }

    const user = userResult.rows[0];

    // Verificar se a barbearia está ativa
    if (!user.barbershop_is_active) {
      return res.status(403).json({
        success: false,
        error: 'Barbearia inativa. Entre em contato com o suporte.'
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha inválidos'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        barbershop_id: user.barbershop_id,
        is_super_admin: false
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Atualizar último login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Criar sessão
    await pool.query(
      'INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, await bcrypt.hash(token, 10), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          barbershop: {
            id: user.barbershop_id,
<<<<<<< HEAD
            name: user.barbershop_name
=======
            name: user.barbershop_name,
            is_active: user.barbershop_is_active
>>>>>>> beb8a79 (🚀 Initial commit - ZBarbe Sistema de Gestão de Barbearias)
          }
        }
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor'
    });
  }
});

// Login de super admin
router.post('/super-admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }

    // Buscar super admin
    const adminQuery = `
      SELECT id, email, password_hash, name, is_active
      FROM super_admins
      WHERE email = $1 AND is_active = true
    `;

    const adminResult = await pool.query(adminQuery, [email.toLowerCase().trim()]);

    if (adminResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha inválidos'
      });
    }

    const admin = adminResult.rows[0];

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha inválidos'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: admin.id,
        email: admin.email,
        is_super_admin: true
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Atualizar último login
    await pool.query(
      'UPDATE super_admins SET last_login = NOW() WHERE id = $1',
      [admin.id]
    );

    // Criar sessão
    await pool.query(
      'INSERT INTO user_sessions (super_admin_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [admin.id, await bcrypt.hash(token, 10), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: 'super_admin',
          is_super_admin: true
        }
      }
    });

  } catch (error) {
    console.error('Erro no login super admin:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor'
    });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];

    if (token) {
      const tokenHash = await bcrypt.hash(token, 10);
      await pool.query(
        'DELETE FROM user_sessions WHERE token_hash = $1',
        [tokenHash]
      );
    }

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor'
    });
  }
});

// Verificar token/usuário atual
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;

    let userData: any = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_super_admin: user.is_super_admin
    };

    if (!user.is_super_admin && user.barbershop_id) {
      // Buscar informações da barbearia
      const barbershopQuery = 'SELECT id, name, is_active FROM barbershops WHERE id = $1';
      const barbershopResult = await pool.query(barbershopQuery, [user.barbershop_id]);

      if (barbershopResult.rows.length > 0) {
        userData.barbershop = {
          id: barbershopResult.rows[0].id,
          name: barbershopResult.rows[0].name,
          is_active: barbershopResult.rows[0].is_active
        };
      }
    }

    res.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor'
    });
  }
});

// Registrar novo usuário (só para admins da barbearia e super admins)
router.post('/register', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { email, password, name, role, barbershop_id } = req.body;

    // Validações básicas
    if (!email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        error: 'Email, senha, nome e role são obrigatórios'
      });
    }

    if (!['admin', 'barbeiro', 'atendente'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role inválida. Use: admin, barbeiro ou atendente'
      });
    }

    let targetBarbershopId = barbershop_id;

    // Super admin pode criar usuário para qualquer barbearia
    if (req.user!.is_super_admin) {
      if (!barbershop_id) {
        return res.status(400).json({
          success: false,
          error: 'Super admin deve especificar barbershop_id'
        });
      }
    } else {
      // Usuário normal só pode criar para sua barbearia e deve ser admin
      if (req.user!.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Apenas administradores podem criar novos usuários'
        });
      }
      targetBarbershopId = req.user!.barbershop_id;
    }

    // Verificar se email já existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email já está em uso'
      });
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 12);

    // Criar usuário
    const newUserQuery = `
      INSERT INTO users (email, password_hash, name, role, barbershop_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, name, role, barbershop_id, created_at
    `;

    const newUserResult = await pool.query(newUserQuery, [
      email.toLowerCase().trim(),
      passwordHash,
      name,
      role,
      targetBarbershopId
    ]);

    const newUser = newUserResult.rows[0];

    res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        barbershop_id: newUser.barbershop_id,
        created_at: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor'
    });
  }
});

export default router;