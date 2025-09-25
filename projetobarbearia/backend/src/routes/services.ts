import { Router, Request, Response } from 'express';
import { ServiceService } from '../services/ServiceService';
import { authenticateToken } from './users';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const serviceService = new ServiceService();

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, duration, category, barbershop_id } = req.body;

    if (!name || !price || !duration || !category || !barbershop_id) {
      return res.status(400).json({ error: 'Nome, preço, duração, categoria e barbershop_id são obrigatórios' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const service = await serviceService.create({
      name,
      description,
      price: Number(price),
      duration: Number(duration),
      category,
      barbershop_id
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, barbershop_id, category, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let services;
    let total;

    if (search) {
      services = await serviceService.searchByName(String(search), barbershop_id ? String(barbershop_id) : undefined);
      total = services.length;
    } else if (category) {
      services = await serviceService.findByCategory(String(category), barbershop_id ? String(barbershop_id) : undefined);
      total = services.length;
    } else {
      services = await serviceService.findAll(barbershop_id ? String(barbershop_id) : undefined, Number(limit), offset);
      total = await serviceService.count(barbershop_id ? String(barbershop_id) : undefined);
    }

    res.json({
      services,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/categories', async (req: Request, res: Response) => {
  try {
    const { barbershop_id } = req.query;
    const categories = await serviceService.getCategories(barbershop_id ? String(barbershop_id) : undefined);
    res.json(categories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = await serviceService.findById(id);

    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    res.json(service);
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, category, active } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const service = await serviceService.update(id, {
      name,
      description,
      price: price ? Number(price) : undefined,
      duration: duration ? Number(duration) : undefined,
      category,
      active
    });

    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    res.json(service);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const success = await serviceService.delete(id);
    if (!success) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    res.json({ message: 'Serviço desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export { router as servicesRouter };