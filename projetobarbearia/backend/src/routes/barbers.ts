import { Router, Request, Response } from 'express';
import { BarberService } from '../services/BarberService';
import { authenticateToken } from './users';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const barberService = new BarberService();

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { user_id, barbershop_id, specialties, experience_years, commission_rate, schedule, bio } = req.body;

    if (!user_id || !barbershop_id || !specialties || !schedule) {
      return res.status(400).json({ error: 'user_id, barbershop_id, especialidades e horário são obrigatórios' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const barber = await barberService.create({
      user_id,
      barbershop_id,
      specialties: Array.isArray(specialties) ? specialties : [specialties],
      experience_years: Number(experience_years) || 0,
      commission_rate: Number(commission_rate) || 0,
      schedule,
      bio
    });

    res.status(201).json(barber);
  } catch (error) {
    console.error('Erro ao criar barbeiro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, barbershop_id, specialty } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let barbers;
    let total;

    if (specialty) {
      barbers = await barberService.findBySpecialty(String(specialty), barbershop_id ? String(barbershop_id) : undefined);
      total = barbers.length;
    } else {
      barbers = await barberService.findAll(barbershop_id ? String(barbershop_id) : undefined, Number(limit), offset);
      total = await barberService.count(barbershop_id ? String(barbershop_id) : undefined);
    }

    res.json({
      barbers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar barbeiros:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/specialties', async (req: Request, res: Response) => {
  try {
    const { barbershop_id } = req.query;
    const specialties = await barberService.getSpecialties(barbershop_id ? String(barbershop_id) : undefined);
    res.json(specialties);
  } catch (error) {
    console.error('Erro ao buscar especialidades:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const barber = await barberService.findById(id);

    if (!barber) {
      return res.status(404).json({ error: 'Barbeiro não encontrado' });
    }

    res.json(barber);
  } catch (error) {
    console.error('Erro ao buscar barbeiro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id/available-slots', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, service_duration = 30 } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Data é obrigatória' });
    }

    const slots = await barberService.getAvailableSlots(
      id,
      new Date(String(date)),
      Number(service_duration)
    );

    res.json(slots);
  } catch (error) {
    console.error('Erro ao buscar horários disponíveis:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    if (req.user.role !== 'admin' && req.user.role !== 'barber') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const stats = await barberService.getStats(
      id,
      start_date ? new Date(String(start_date)) : undefined,
      end_date ? new Date(String(end_date)) : undefined
    );

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas do barbeiro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { specialties, experience_years, commission_rate, schedule, bio, active } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const barber = await barberService.update(id, {
      specialties: specialties ? (Array.isArray(specialties) ? specialties : [specialties]) : undefined,
      experience_years: experience_years ? Number(experience_years) : undefined,
      commission_rate: commission_rate ? Number(commission_rate) : undefined,
      schedule,
      bio,
      active
    });

    if (!barber) {
      return res.status(404).json({ error: 'Barbeiro não encontrado' });
    }

    res.json(barber);
  } catch (error) {
    console.error('Erro ao atualizar barbeiro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id/schedule', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { schedule } = req.body;

    if (!schedule) {
      return res.status(400).json({ error: 'Horário é obrigatório' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'barber') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const barber = await barberService.updateSchedule(id, schedule);
    if (!barber) {
      return res.status(404).json({ error: 'Barbeiro não encontrado' });
    }

    res.json(barber);
  } catch (error) {
    console.error('Erro ao atualizar horário do barbeiro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const success = await barberService.delete(id);
    if (!success) {
      return res.status(404).json({ error: 'Barbeiro não encontrado' });
    }

    res.json({ message: 'Barbeiro desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar barbeiro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export { router as barbersRouter };