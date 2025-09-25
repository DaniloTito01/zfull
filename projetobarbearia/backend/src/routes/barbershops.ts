import { Router, Request, Response } from 'express';
import { BarbershopService } from '../services/BarbershopService';
import { authenticateToken } from './users';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const barbershopService = new BarbershopService();

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, address, phone, email, website, opening_hours, settings } = req.body;

    if (!name || !address || !phone || !opening_hours || !settings) {
      return res.status(400).json({ error: 'Nome, endereço, telefone, horários e configurações são obrigatórios' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const barbershop = await barbershopService.create({
      name,
      description,
      address,
      phone,
      email,
      website,
      opening_hours,
      settings
    });

    res.status(201).json(barbershop);
  } catch (error) {
    console.error('Erro ao criar barbearia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, city, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let barbershops;
    let total;

    if (search) {
      barbershops = await barbershopService.searchByName(String(search), Number(limit));
      total = barbershops.length;
    } else if (city) {
      barbershops = await barbershopService.findByCity(String(city));
      total = barbershops.length;
    } else {
      barbershops = await barbershopService.findAll(Number(limit), offset);
      total = await barbershopService.count();
    }

    res.json({
      barbershops,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar barbearias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/nearby', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude e longitude são obrigatórias' });
    }

    const barbershops = await barbershopService.findNearby(
      Number(latitude),
      Number(longitude),
      Number(radius)
    );

    res.json(barbershops);
  } catch (error) {
    console.error('Erro ao buscar barbearias próximas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const barbershop = await barbershopService.findById(id);

    if (!barbershop) {
      return res.status(404).json({ error: 'Barbearia não encontrada' });
    }

    res.json(barbershop);
  } catch (error) {
    console.error('Erro ao buscar barbearia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const stats = await barbershopService.getStats(
      id,
      start_date ? new Date(String(start_date)) : undefined,
      end_date ? new Date(String(end_date)) : undefined
    );

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas da barbearia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id/upcoming-appointments', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { days = 7, limit = 50 } = req.query;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const appointments = await barbershopService.getUpcomingAppointments(
      id,
      Number(days),
      Number(limit)
    );

    res.json(appointments);
  } catch (error) {
    console.error('Erro ao buscar próximos agendamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id/is-open', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const isOpen = await barbershopService.isOpen(
      id,
      date ? new Date(String(date)) : undefined
    );

    res.json({ isOpen });
  } catch (error) {
    console.error('Erro ao verificar se está aberto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, address, phone, email, website, opening_hours, settings, active } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const barbershop = await barbershopService.update(id, {
      name,
      description,
      address,
      phone,
      email,
      website,
      opening_hours,
      settings,
      active
    });

    if (!barbershop) {
      return res.status(404).json({ error: 'Barbearia não encontrada' });
    }

    res.json(barbershop);
  } catch (error) {
    console.error('Erro ao atualizar barbearia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id/settings', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { settings } = req.body;

    if (!settings) {
      return res.status(400).json({ error: 'Configurações são obrigatórias' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const barbershop = await barbershopService.updateSettings(id, settings);
    if (!barbershop) {
      return res.status(404).json({ error: 'Barbearia não encontrada' });
    }

    res.json(barbershop);
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id/opening-hours', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { opening_hours } = req.body;

    if (!opening_hours) {
      return res.status(400).json({ error: 'Horários de funcionamento são obrigatórios' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const barbershop = await barbershopService.updateOpeningHours(id, opening_hours);
    if (!barbershop) {
      return res.status(404).json({ error: 'Barbearia não encontrada' });
    }

    res.json(barbershop);
  } catch (error) {
    console.error('Erro ao atualizar horários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const success = await barbershopService.delete(id);
    if (!success) {
      return res.status(404).json({ error: 'Barbearia não encontrada' });
    }

    res.json({ message: 'Barbearia desativada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar barbearia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export { router as barbershopsRouter };