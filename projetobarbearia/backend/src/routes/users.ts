import { Router, Request, Response } from 'express';
import { UserService } from '../services/UserService';
import jwt from 'jsonwebtoken';

const router = Router();
const userService = new UserService();

interface AuthRequest extends Request {
  user?: any;
}

const authenticateToken = (req: AuthRequest, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await userService.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isValidPassword = await userService.validatePassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Email, senha, nome e role são obrigatórios' });
    }

    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email já está em uso' });
    }

    const user = await userService.create({
      email,
      password,
      name,
      phone,
      role
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, role } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let users;
    if (role) {
      users = await userService.findByRole(String(role), Number(limit), offset);
    } else {
      users = await userService.findAll(Number(limit), offset);
    }

    const total = role ? await userService.countByRole(String(role)) : await userService.count();

    res.json({
      users: users.map(({ password, ...user }) => user),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await userService.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await userService.update(req.user.id, {
      name,
      phone,
      avatar
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, avatar, active } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const user = await userService.update(id, {
      name,
      phone,
      avatar,
      active
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    const user = await userService.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const isValidPassword = await userService.validatePassword(user, currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    await userService.updatePassword(req.user.id, newPassword);
    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const success = await userService.delete(id);
    if (!success) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export { router as usersRouter, authenticateToken };