import { Router, Request, Response } from 'express';
import { ClientService } from '../services/ClientService';
import { authenticateToken } from './users';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const clientService = new ClientService();

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { user_id, date_of_birth, preferences } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id é obrigatório' });
    }

    const client = await clientService.create({
      user_id,
      date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
      preferences
    });

    res.status(201).json(client);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let clients;
    let total;

    if (search) {
      clients = await clientService.searchByName(String(search), Number(limit));
      total = clients.length;
    } else {
      clients = await clientService.findAll(Number(limit), offset);
      total = await clientService.count();
    }

    res.json({
      clients,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/frequent', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const clients = await clientService.getMostFrequent(Number(limit));
    res.json(clients);
  } catch (error) {
    console.error('Erro ao buscar clientes frequentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/loyalty', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { min_points = 100 } = req.query;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const clients = await clientService.getByLoyaltyPoints(Number(min_points));
    res.json(clients);
  } catch (error) {
    console.error('Erro ao buscar clientes por pontos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/recent', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { days = 30, limit = 10 } = req.query;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const clients = await clientService.getRecentClients(Number(days), Number(limit));
    res.json(clients);
  } catch (error) {
    console.error('Erro ao buscar clientes recentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/birthdays', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const clients = await clientService.getBirthdaysThisMonth();
    res.json(clients);
  } catch (error) {
    console.error('Erro ao buscar aniversariantes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/phone/:phone', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { phone } = req.params;
    const client = await clientService.findByPhone(phone);

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error('Erro ao buscar cliente por telefone:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/email/:email', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.params;
    const client = await clientService.findByEmail(email);

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error('Erro ao buscar cliente por email:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const client = await clientService.findById(id);

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const clientWithStats = await clientService.getWithStats(id);
    if (!clientWithStats) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(clientWithStats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas do cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = 20 } = req.query;

    const history = await clientService.getAppointmentHistory(id, Number(limit));
    res.json(history);
  } catch (error) {
    console.error('Erro ao buscar histórico do cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { date_of_birth, preferences, loyalty_points, total_visits, last_visit } = req.body;

    const client = await clientService.update(id, {
      date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
      preferences,
      loyalty_points: loyalty_points ? Number(loyalty_points) : undefined,
      total_visits: total_visits ? Number(total_visits) : undefined,
      last_visit: last_visit ? new Date(last_visit) : undefined
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id/preferences', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({ error: 'Preferências são obrigatórias' });
    }

    const client = await clientService.updatePreferences(id, preferences);
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(client);
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id/loyalty-points', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { points } = req.body;

    if (!points || typeof points !== 'number') {
      return res.status(400).json({ error: 'Pontos devem ser um número válido' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const success = await clientService.updateLoyaltyPoints(id, points);
    if (!success) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ message: 'Pontos de fidelidade atualizados com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar pontos de fidelidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const success = await clientService.delete(id);
    if (!success) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ message: 'Cliente desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export { router as clientsRouter };