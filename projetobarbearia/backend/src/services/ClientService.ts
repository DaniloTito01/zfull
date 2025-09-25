import { query } from '../config/database';
import { Client, CreateClientData, UpdateClientData } from '../models/Client';
import { v4 as uuidv4 } from 'uuid';

export class ClientService {
  async create(clientData: CreateClientData): Promise<Client> {
    const id = uuidv4();

    const queryText = `
      INSERT INTO clients (id, user_id, date_of_birth, preferences)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      id,
      clientData.user_id,
      clientData.date_of_birth || null,
      clientData.preferences ? JSON.stringify(clientData.preferences) : null
    ];

    const result = await query(queryText, values);
    return result.rows[0];
  }

  async findById(id: string): Promise<Client | null> {
    const queryText = `
      SELECT c.*, u.name, u.email, u.phone, u.avatar
      FROM clients c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1 AND u.active = true
    `;
    const result = await query(queryText, [id]);
    return result.rows[0] || null;
  }

  async findByUserId(user_id: string): Promise<Client | null> {
    const queryText = `
      SELECT c.*, u.name, u.email, u.phone, u.avatar
      FROM clients c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = $1 AND u.active = true
    `;
    const result = await query(queryText, [user_id]);
    return result.rows[0] || null;
  }

  async findByPhone(phone: string): Promise<Client | null> {
    const queryText = `
      SELECT c.*, u.name, u.email, u.phone, u.avatar
      FROM clients c
      JOIN users u ON c.user_id = u.id
      WHERE u.phone = $1 AND u.active = true
    `;
    const result = await query(queryText, [phone]);
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<Client | null> {
    const queryText = `
      SELECT c.*, u.name, u.email, u.phone, u.avatar
      FROM clients c
      JOIN users u ON c.user_id = u.id
      WHERE u.email = $1 AND u.active = true
    `;
    const result = await query(queryText, [email]);
    return result.rows[0] || null;
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<Client[]> {
    const queryText = `
      SELECT c.*, u.name, u.email, u.phone, u.avatar
      FROM clients c
      JOIN users u ON c.user_id = u.id
      WHERE u.active = true
      ORDER BY u.name
      LIMIT $1 OFFSET $2
    `;
    const result = await query(queryText, [limit, offset]);
    return result.rows;
  }

  async update(id: string, clientData: UpdateClientData): Promise<Client | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (clientData.date_of_birth !== undefined) {
      fields.push(`date_of_birth = $${paramCount++}`);
      values.push(clientData.date_of_birth);
    }
    if (clientData.preferences !== undefined) {
      fields.push(`preferences = $${paramCount++}`);
      values.push(JSON.stringify(clientData.preferences));
    }
    if (clientData.loyalty_points !== undefined) {
      fields.push(`loyalty_points = $${paramCount++}`);
      values.push(clientData.loyalty_points);
    }
    if (clientData.total_visits !== undefined) {
      fields.push(`total_visits = $${paramCount++}`);
      values.push(clientData.total_visits);
    }
    if (clientData.last_visit !== undefined) {
      fields.push(`last_visit = $${paramCount++}`);
      values.push(clientData.last_visit);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    const queryText = `
      UPDATE clients
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    values.push(id);

    const result = await query(queryText, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const client = await this.findById(id);
    if (!client) return false;

    const queryText = 'UPDATE users SET active = false WHERE id = $1';
    const result = await query(queryText, [client.user_id]);
    return (result.rowCount || 0) > 0;
  }

  async hardDelete(id: string): Promise<boolean> {
    const queryText = 'DELETE FROM clients WHERE id = $1';
    const result = await query(queryText, [id]);
    return (result.rowCount || 0) > 0;
  }

  async getWithStats(client_id: string) {
    const client = await this.findById(client_id);
    if (!client) return null;

    const statsQuery = `
      SELECT
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_appointments,
        COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_shows,
        SUM(CASE WHEN status = 'completed' THEN total_price ELSE 0 END) as total_spent,
        AVG(CASE WHEN status = 'completed' THEN total_price ELSE NULL END) as avg_ticket,
        MAX(CASE WHEN status = 'completed' THEN appointment_date ELSE NULL END) as last_visit
      FROM appointments
      WHERE client_id = $1
    `;

    const statsResult = await query(statsQuery, [client_id]);
    const stats = statsResult.rows[0];

    const favoriteServiceQuery = `
      SELECT s.name, COUNT(*) as count
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.client_id = $1 AND a.status = 'completed'
      GROUP BY s.id, s.name
      ORDER BY count DESC
      LIMIT 1
    `;

    const favoriteServiceResult = await query(favoriteServiceQuery, [client_id]);
    const favoriteService = favoriteServiceResult.rows[0];

    const favoriteBarberQuery = `
      SELECT u.name, COUNT(*) as count
      FROM appointments a
      JOIN barbers b ON a.barber_id = b.id
      JOIN users u ON b.user_id = u.id
      WHERE a.client_id = $1 AND a.status = 'completed'
      GROUP BY b.id, u.name
      ORDER BY count DESC
      LIMIT 1
    `;

    const favoriteBarberResult = await query(favoriteBarberQuery, [client_id]);
    const favoriteBarber = favoriteBarberResult.rows[0];

    return {
      ...client,
      stats: {
        total_appointments: parseInt(stats.total_appointments) || 0,
        completed_appointments: parseInt(stats.completed_appointments) || 0,
        cancelled_appointments: parseInt(stats.cancelled_appointments) || 0,
        no_shows: parseInt(stats.no_shows) || 0,
        total_spent: parseFloat(stats.total_spent) || 0,
        avg_ticket: parseFloat(stats.avg_ticket) || 0,
        last_visit: stats.last_visit,
        favorite_service: favoriteService?.name || null,
        favorite_barber: favoriteBarber?.name || null
      }
    };
  }

  async updateLoyaltyPoints(client_id: string, points: number): Promise<boolean> {
    const queryText = 'UPDATE clients SET loyalty_points = loyalty_points + $1 WHERE id = $2';
    const result = await query(queryText, [points, client_id]);
    return (result.rowCount || 0) > 0;
  }

  async getMostFrequent(limit: number = 10): Promise<Client[]> {
    const queryText = `
      SELECT c.*, u.name, u.email, u.phone, u.avatar
      FROM clients c
      JOIN users u ON c.user_id = u.id
      WHERE u.active = true
      ORDER BY c.total_visits DESC
      LIMIT $1
    `;
    const result = await query(queryText, [limit]);
    return result.rows;
  }

  async getByLoyaltyPoints(minPoints: number = 100): Promise<Client[]> {
    const queryText = `
      SELECT c.*, u.name, u.email, u.phone, u.avatar
      FROM clients c
      JOIN users u ON c.user_id = u.id
      WHERE c.loyalty_points >= $1 AND u.active = true
      ORDER BY c.loyalty_points DESC
    `;
    const result = await query(queryText, [minPoints]);
    return result.rows;
  }

  async updatePreferences(client_id: string, preferences: any): Promise<Client | null> {
    return this.update(client_id, { preferences });
  }

  async getAppointmentHistory(client_id: string, limit: number = 20) {
    const queryText = `
      SELECT a.*,
             u_barber.name as barber_name,
             s.name as service_name, s.price as service_price
      FROM appointments a
      JOIN barbers b ON a.barber_id = b.id
      JOIN users u_barber ON b.user_id = u_barber.id
      JOIN services s ON a.service_id = s.id
      WHERE a.client_id = $1
      ORDER BY a.appointment_date DESC, a.start_time DESC
      LIMIT $2
    `;

    const result = await query(queryText, [client_id, limit]);
    return result.rows;
  }

  async searchByName(searchTerm: string, limit: number = 20): Promise<Client[]> {
    const queryText = `
      SELECT c.*, u.name, u.email, u.phone, u.avatar
      FROM clients c
      JOIN users u ON c.user_id = u.id
      WHERE LOWER(u.name) LIKE LOWER($1) AND u.active = true
      ORDER BY u.name
      LIMIT $2
    `;
    const result = await query(queryText, [`%${searchTerm}%`, limit]);
    return result.rows;
  }

  async count(): Promise<number> {
    const queryText = `
      SELECT COUNT(*) as count
      FROM clients c
      JOIN users u ON c.user_id = u.id
      WHERE u.active = true
    `;
    const result = await query(queryText);
    return parseInt(result.rows[0].count);
  }

  async getRecentClients(days: number = 30, limit: number = 10): Promise<Client[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const queryText = `
      SELECT c.*, u.name, u.email, u.phone, u.avatar
      FROM clients c
      JOIN users u ON c.user_id = u.id
      WHERE c.created_at >= $1 AND u.active = true
      ORDER BY c.created_at DESC
      LIMIT $2
    `;
    const result = await query(queryText, [startDate.toISOString(), limit]);
    return result.rows;
  }

  async getBirthdaysThisMonth(): Promise<Client[]> {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;

    const queryText = `
      SELECT c.*, u.name, u.email, u.phone, u.avatar
      FROM clients c
      JOIN users u ON c.user_id = u.id
      WHERE EXTRACT(MONTH FROM c.date_of_birth) = $1 AND u.active = true
      ORDER BY EXTRACT(DAY FROM c.date_of_birth)
    `;
    const result = await query(queryText, [currentMonth]);
    return result.rows;
  }
}