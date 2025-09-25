import { query } from '../config/database';
import { Barbershop, CreateBarbershopData, UpdateBarbershopData } from '../models/Barbershop';
import { v4 as uuidv4 } from 'uuid';

export class BarbershopService {
  async create(barbershopData: CreateBarbershopData): Promise<Barbershop> {
    const id = uuidv4();

    const queryText = `
      INSERT INTO barbershops (id, name, description, address, phone, email, website, opening_hours, settings)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      id,
      barbershopData.name,
      barbershopData.description || null,
      JSON.stringify(barbershopData.address),
      barbershopData.phone,
      barbershopData.email || null,
      barbershopData.website || null,
      JSON.stringify(barbershopData.opening_hours),
      JSON.stringify(barbershopData.settings)
    ];

    const result = await query(queryText, values);
    return result.rows[0];
  }

  async findById(id: string): Promise<Barbershop | null> {
    const queryText = 'SELECT * FROM barbershops WHERE id = $1 AND active = true';
    const result = await query(queryText, [id]);
    return result.rows[0] || null;
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<Barbershop[]> {
    const queryText = `
      SELECT * FROM barbershops
      WHERE active = true
      ORDER BY name
      LIMIT $1 OFFSET $2
    `;
    const result = await query(queryText, [limit, offset]);
    return result.rows;
  }

  async findByCity(city: string): Promise<Barbershop[]> {
    const queryText = `
      SELECT * FROM barbershops
      WHERE active = true
      AND address->>'city' ILIKE $1
      ORDER BY name
    `;
    const result = await query(queryText, [`%${city}%`]);
    return result.rows;
  }

  async findNearby(latitude: number, longitude: number, radiusKm: number = 10): Promise<Barbershop[]> {
    const queryText = `
      SELECT *,
             (6371 * acos(cos(radians($1)) * cos(radians(CAST(address->>'latitude' AS FLOAT)))
             * cos(radians(CAST(address->>'longitude' AS FLOAT)) - radians($2))
             + sin(radians($1)) * sin(radians(CAST(address->>'latitude' AS FLOAT))))) AS distance
      FROM barbershops
      WHERE active = true
      AND address->>'latitude' IS NOT NULL
      AND address->>'longitude' IS NOT NULL
      HAVING distance < $3
      ORDER BY distance
    `;
    const result = await query(queryText, [latitude, longitude, radiusKm]);
    return result.rows;
  }

  async update(id: string, barbershopData: UpdateBarbershopData): Promise<Barbershop | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (barbershopData.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(barbershopData.name);
    }
    if (barbershopData.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(barbershopData.description);
    }
    if (barbershopData.address !== undefined) {
      fields.push(`address = $${paramCount++}`);
      values.push(JSON.stringify(barbershopData.address));
    }
    if (barbershopData.phone !== undefined) {
      fields.push(`phone = $${paramCount++}`);
      values.push(barbershopData.phone);
    }
    if (barbershopData.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(barbershopData.email);
    }
    if (barbershopData.website !== undefined) {
      fields.push(`website = $${paramCount++}`);
      values.push(barbershopData.website);
    }
    if (barbershopData.opening_hours !== undefined) {
      fields.push(`opening_hours = $${paramCount++}`);
      values.push(JSON.stringify(barbershopData.opening_hours));
    }
    if (barbershopData.settings !== undefined) {
      fields.push(`settings = $${paramCount++}`);
      values.push(JSON.stringify(barbershopData.settings));
    }
    if (barbershopData.active !== undefined) {
      fields.push(`active = $${paramCount++}`);
      values.push(barbershopData.active);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    const queryText = `
      UPDATE barbershops
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    values.push(id);

    const result = await query(queryText, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const queryText = 'UPDATE barbershops SET active = false WHERE id = $1';
    const result = await query(queryText, [id]);
    return (result.rowCount || 0) > 0;
  }

  async hardDelete(id: string): Promise<boolean> {
    const queryText = 'DELETE FROM barbershops WHERE id = $1';
    const result = await query(queryText, [id]);
    return (result.rowCount || 0) > 0;
  }

  async getStats(barbershop_id: string, start_date?: Date, end_date?: Date) {
    const currentDate = new Date();
    const startOfMonth = start_date || new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = end_date || new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const appointmentsStatsQuery = `
      SELECT
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_appointments,
        COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_shows,
        SUM(CASE WHEN status = 'completed' THEN total_price ELSE 0 END) as total_revenue,
        AVG(CASE WHEN status = 'completed' THEN total_price ELSE NULL END) as avg_ticket
      FROM appointments
      WHERE barbershop_id = $1
      AND appointment_date >= $2
      AND appointment_date <= $3
    `;

    const appointmentsResult = await query(appointmentsStatsQuery, [
      barbershop_id,
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]
    ]);

    const appointmentsStats = appointmentsResult.rows[0];

    const barbersCountQuery = `
      SELECT COUNT(*) as count
      FROM barbers
      WHERE barbershop_id = $1 AND active = true
    `;
    const barbersResult = await query(barbersCountQuery, [barbershop_id]);

    const servicesCountQuery = `
      SELECT COUNT(*) as count
      FROM services
      WHERE barbershop_id = $1 AND active = true
    `;
    const servicesResult = await query(servicesCountQuery, [barbershop_id]);

    const clientsCountQuery = `
      SELECT COUNT(DISTINCT a.client_id) as count
      FROM appointments a
      WHERE a.barbershop_id = $1
    `;
    const clientsResult = await query(clientsCountQuery, [barbershop_id]);

    const topServicesQuery = `
      SELECT s.name, COUNT(*) as bookings, SUM(a.total_price) as revenue
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.barbershop_id = $1
      AND a.status = 'completed'
      AND a.appointment_date >= $2
      AND a.appointment_date <= $3
      GROUP BY s.id, s.name
      ORDER BY bookings DESC
      LIMIT 5
    `;
    const topServicesResult = await query(topServicesQuery, [
      barbershop_id,
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]
    ]);

    const topBarbersQuery = `
      SELECT u.name, COUNT(*) as appointments, SUM(a.total_price) as revenue
      FROM appointments a
      JOIN barbers b ON a.barber_id = b.id
      JOIN users u ON b.user_id = u.id
      WHERE a.barbershop_id = $1
      AND a.status = 'completed'
      AND a.appointment_date >= $2
      AND a.appointment_date <= $3
      GROUP BY b.id, u.name
      ORDER BY appointments DESC
      LIMIT 5
    `;
    const topBarbersResult = await query(topBarbersQuery, [
      barbershop_id,
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]
    ]);

    return {
      appointments: {
        total: parseInt(appointmentsStats.total_appointments) || 0,
        completed: parseInt(appointmentsStats.completed_appointments) || 0,
        cancelled: parseInt(appointmentsStats.cancelled_appointments) || 0,
        no_shows: parseInt(appointmentsStats.no_shows) || 0
      },
      revenue: {
        total: parseFloat(appointmentsStats.total_revenue) || 0,
        avg_ticket: parseFloat(appointmentsStats.avg_ticket) || 0
      },
      counts: {
        barbers: parseInt(barbersResult.rows[0].count) || 0,
        services: parseInt(servicesResult.rows[0].count) || 0,
        clients: parseInt(clientsResult.rows[0].count) || 0
      },
      top_services: topServicesResult.rows,
      top_barbers: topBarbersResult.rows
    };
  }

  async updateSettings(barbershop_id: string, settings: any): Promise<Barbershop | null> {
    return this.update(barbershop_id, { settings });
  }

  async updateOpeningHours(barbershop_id: string, opening_hours: any): Promise<Barbershop | null> {
    return this.update(barbershop_id, { opening_hours });
  }

  async searchByName(searchTerm: string, limit: number = 20): Promise<Barbershop[]> {
    const queryText = `
      SELECT * FROM barbershops
      WHERE LOWER(name) LIKE LOWER($1) AND active = true
      ORDER BY name
      LIMIT $2
    `;
    const result = await query(queryText, [`%${searchTerm}%`, limit]);
    return result.rows;
  }

  async count(): Promise<number> {
    const queryText = 'SELECT COUNT(*) as count FROM barbershops WHERE active = true';
    const result = await query(queryText);
    return parseInt(result.rows[0].count);
  }

  async getUpcomingAppointments(barbershop_id: string, days: number = 7, limit: number = 50) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const queryText = `
      SELECT a.*,
             u_client.name as client_name, u_client.phone as client_phone,
             u_barber.name as barber_name,
             s.name as service_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN users u_client ON c.user_id = u_client.id
      JOIN barbers b ON a.barber_id = b.id
      JOIN users u_barber ON b.user_id = u_barber.id
      JOIN services s ON a.service_id = s.id
      WHERE a.barbershop_id = $1
      AND a.appointment_date >= CURRENT_DATE
      AND a.appointment_date <= $2
      AND a.status IN ('scheduled', 'confirmed')
      ORDER BY a.appointment_date, a.start_time
      LIMIT $3
    `;

    const result = await query(queryText, [
      barbershop_id,
      endDate.toISOString().split('T')[0],
      limit
    ]);
    return result.rows;
  }

  async isOpen(barbershop_id: string, date?: Date): Promise<boolean> {
    const barbershop = await this.findById(barbershop_id);
    if (!barbershop) return false;

    const checkDate = date || new Date();
    const dayOfWeek = checkDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    const openingHours = typeof barbershop.opening_hours === 'string'
      ? JSON.parse(barbershop.opening_hours)
      : barbershop.opening_hours;

    const dayHours = openingHours[dayOfWeek];

    if (!dayHours || dayHours.closed) return false;

    const currentTime = checkDate.toTimeString().substring(0, 5);
    return currentTime >= dayHours.open_time && currentTime <= dayHours.close_time;
  }
}