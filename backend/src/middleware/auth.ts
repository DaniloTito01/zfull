import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  barbershop_id: string;
  is_super_admin: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ success: false, error: 'Token de acesso requerido' });
    }

    // Verificar se o token é válido
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(403).json({ success: false, error: 'Token inválido' });
    }

    // Buscar usuário no banco de dados
    let userQuery: string;
    let queryParams: any[];

    if (decoded.is_super_admin) {
      userQuery = `
        SELECT id, email, name, 'super_admin' as role, null as barbershop_id, true as is_super_admin, is_active
        FROM super_admins
        WHERE id = $1 AND is_active = true
      `;
      queryParams = [decoded.userId];
    } else {
      userQuery = `
        SELECT u.id, u.email, u.name, u.role, u.barbershop_id, false as is_super_admin, u.is_active,
               b.name as barbershop_name
        FROM users u
        LEFT JOIN barbershops b ON u.barbershop_id = b.id
        WHERE u.id = $1 AND u.is_active = true
      `;
      queryParams = [decoded.userId];
    }

    const result = await pool.query(userQuery, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado ou inativo' });
    }

    const user = result.rows[0];

    // Anexar usuário à requisição
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      barbershop_id: user.barbershop_id,
      is_super_admin: user.is_super_admin
    };

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
  }
};

// Middleware para verificar se é super admin
export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.is_super_admin) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Apenas super administradores podem acessar este recurso.'
    });
  }
  next();
};

// Middleware para verificar se tem acesso à barbearia
export const requireBarbershopAccess = (req: AuthRequest, res: Response, next: NextFunction) => {
  const barbershopId = req.params.barbershop_id || req.query.barbershop_id || req.body.barbershop_id;

  if (!barbershopId) {
    return res.status(400).json({ success: false, error: 'ID da barbearia é obrigatório' });
  }

  // Super admin tem acesso a todas as barbearias
  if (req.user?.is_super_admin) {
    return next();
  }

  // Usuário normal só pode acessar sua própria barbearia
  if (req.user?.barbershop_id !== barbershopId) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Você não tem permissão para acessar esta barbearia.'
    });
  }

  next();
};

// Middleware para verificar role específica
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    // Super admin tem acesso total
    if (req.user.is_super_admin) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Acesso negado. Roles necessárias: ${roles.join(', ')}`
      });
    }

    next();
  };
};

export default { authenticateToken, requireSuperAdmin, requireBarbershopAccess, requireRole };