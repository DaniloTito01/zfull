import { Router, Request, Response } from 'express';
import { AppointmentService } from '../services/AppointmentService';
import { authenticateToken } from './users';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const appointmentService = new AppointmentService();

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { client_id, barber_id, service_id, barbershop_id, appointment_date, start_time, notes } = req.body;

    if (!client_id || !barber_id || !service_id || !barbershop_id || !appointment_date || !start_time) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
    }

    const appointmentDate = new Date(appointment_date);
    const isAvailable = await appointmentService.checkTimeSlotAvailability(
      barber_id,
      appointmentDate,
      start_time,
      start_time
    );

    if (!isAvailable) {
      return res.status(409).json({ error: 'Horário não disponível' });
    }

    const appointment = await appointmentService.create({
      client_id,
      barber_id,
      service_id,
      barbershop_id,
      appointment_date: appointmentDate,
      start_time,
      notes
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, barbershop_id, barber_id, client_id, status, date } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let appointments;
    let total;

    if (date) {
      appointments = await appointmentService.findByDate(new Date(String(date)), barbershop_id ? String(barbershop_id) : undefined);
      total = appointments.length;
    } else if (barber_id) {
      appointments = await appointmentService.findByBarber(String(barber_id));
      total = appointments.length;
    } else if (client_id) {
      appointments = await appointmentService.findByClient(String(client_id));
      total = appointments.length;
    } else if (status) {
      appointments = await appointmentService.findByStatus(String(status), barbershop_id ? String(barbershop_id) : undefined);
      total = appointments.length;
    } else {
      appointments = await appointmentService.findAll(barbershop_id ? String(barbershop_id) : undefined, Number(limit), offset);
      total = await appointmentService.count(barbershop_id ? String(barbershop_id) : undefined);
    }

    res.json({
      appointments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/upcoming', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { barbershop_id, days = 7 } = req.query;
    const appointments = await appointmentService.getUpcoming(
      barbershop_id ? String(barbershop_id) : undefined,
      Number(days)
    );
    res.json(appointments);
  } catch (error) {
    console.error('Erro ao buscar próximos agendamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/statistics', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { barbershop_id, start_date, end_date } = req.query;

    if (req.user.role !== 'admin' && req.user.role !== 'barber') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const stats = await appointmentService.getStatistics(
      barbershop_id ? String(barbershop_id) : undefined,
      start_date ? new Date(String(start_date)) : undefined,
      end_date ? new Date(String(end_date)) : undefined
    );

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await appointmentService.findById(id);

    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { appointment_date, start_time, status, notes } = req.body;

    const appointment = await appointmentService.update(id, {
      appointment_date: appointment_date ? new Date(appointment_date) : undefined,
      start_time,
      status,
      notes
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const success = await appointmentService.cancel(id, reason);
    if (!success) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json({ message: 'Agendamento cancelado com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id/complete', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin' && req.user.role !== 'barber') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const success = await appointmentService.complete(id);
    if (!success) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json({ message: 'Agendamento concluído com sucesso' });
  } catch (error) {
    console.error('Erro ao concluir agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const success = await appointmentService.delete(id);
    if (!success) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json({ message: 'Agendamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export { router as appointmentsRouter };