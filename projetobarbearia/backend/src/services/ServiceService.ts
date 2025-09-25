import { query } from '../config/database';
import { Service, CreateServiceData, UpdateServiceData } from '../models/Service';
import { v4 as uuidv4 } from 'uuid';

export class ServiceService {
  async create(serviceData: CreateServiceData): Promise<Service> {
    const id = uuidv4();

    const queryText = `
      INSERT INTO services (id, name, description, price, duration, category, barbershop_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      id,
      serviceData.name,
      serviceData.description || null,
      serviceData.price,
      serviceData.duration,
      serviceData.category,
      serviceData.barbershop_id
    ];

    const result = await query(queryText, values);
    return result.rows[0];
  }

  async findById(id: string): Promise<Service | null> {
    const queryText = 'SELECT * FROM services WHERE id = $1 AND active = true';
    const result = await query(queryText, [id]);
    return result.rows[0] || null;
  }

  async findAll(barbershop_id?: string, limit: number = 50, offset: number = 0): Promise<Service[]> {
    let queryText = `
      SELECT * FROM services
      WHERE active = true
    `;
    const values: any[] = [];
    let paramCount = 1;

    if (barbershop_id) {
      queryText += ` AND barbershop_id = $${paramCount++}`;
      values.push(barbershop_id);
    }

    queryText += ` ORDER BY name LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(limit, offset);

    const result = await query(queryText, values);
    return result.rows;
  }

  async findByCategory(category: string, barbershop_id?: string): Promise<Service[]> {
    let queryText = `
      SELECT * FROM services
      WHERE category = $1 AND active = true
    `;
    const values: any[] = [category];

    if (barbershop_id) {
      queryText += ' AND barbershop_id = $2';
      values.push(barbershop_id);
    }

    queryText += ' ORDER BY name';

    const result = await query(queryText, values);
    return result.rows;
  }

  async findByBarbershop(barbershop_id: string): Promise<Service[]> {
    const queryText = `
      SELECT * FROM services
      WHERE barbershop_id = $1 AND active = true
      ORDER BY category, name
    `;
    const result = await query(queryText, [barbershop_id]);
    return result.rows;
  }

  async update(id: string, serviceData: UpdateServiceData): Promise<Service | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (serviceData.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(serviceData.name);
    }
    if (serviceData.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(serviceData.description);
    }
    if (serviceData.price !== undefined) {
      fields.push(`price = $${paramCount++}`);
      values.push(serviceData.price);
    }
    if (serviceData.duration !== undefined) {
      fields.push(`duration = $${paramCount++}`);
      values.push(serviceData.duration);
    }
    if (serviceData.category !== undefined) {
      fields.push(`category = $${paramCount++}`);
      values.push(serviceData.category);
    }
    if (serviceData.active !== undefined) {
      fields.push(`active = $${paramCount++}`);
      values.push(serviceData.active);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    const queryText = `
      UPDATE services
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    values.push(id);

    const result = await query(queryText, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const queryText = 'UPDATE services SET active = false WHERE id = $1';
    const result = await query(queryText, [id]);
    return (result.rowCount || 0) > 0;
  }

  async hardDelete(id: string): Promise<boolean> {
    const queryText = 'DELETE FROM services WHERE id = $1';
    const result = await query(queryText, [id]);
    return (result.rowCount || 0) > 0;
  }

  async getCategories(barbershop_id?: string): Promise<string[]> {
    let queryText = 'SELECT DISTINCT category FROM services WHERE active = true';
    const values: any[] = [];

    if (barbershop_id) {
      queryText += ' AND barbershop_id = $1';
      values.push(barbershop_id);
    }

    queryText += ' ORDER BY category';

    const result = await query(queryText, values);
    return result.rows.map(row => row.category);
  }

  async count(barbershop_id?: string): Promise<number> {
    let queryText = 'SELECT COUNT(*) as count FROM services WHERE active = true';
    const values: any[] = [];

    if (barbershop_id) {
      queryText += ' AND barbershop_id = $1';
      values.push(barbershop_id);
    }

    const result = await query(queryText, values);
    return parseInt(result.rows[0].count);
  }

  async searchByName(searchTerm: string, barbershop_id?: string): Promise<Service[]> {
    let queryText = `
      SELECT * FROM services
      WHERE LOWER(name) LIKE LOWER($1) AND active = true
    `;
    const values: any[] = [`%${searchTerm}%`];

    if (barbershop_id) {
      queryText += ' AND barbershop_id = $2';
      values.push(barbershop_id);
    }

    queryText += ' ORDER BY name';

    const result = await query(queryText, values);
    return result.rows;
  }
}