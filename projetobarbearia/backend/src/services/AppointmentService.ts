import { query } from '../config/database';
import { Appointment, CreateAppointmentData, UpdateAppointmentData } from '../models/Appointment';
import { v4 as uuidv4 } from 'uuid';

export class AppointmentService {
  async create(appointmentData: CreateAppointmentData): Promise<Appointment> {
    const id = uuidv4();

    const serviceResult = await query('SELECT price, duration FROM services WHERE id = $1', [appointmentData.service_id]);
    if (!serviceResult.rows[0]) {
      throw new Error('Serviço não encontrado');
    }

    const service = serviceResult.rows[0];
    const startTime = appointmentData.start_time;
    const [hours, minutes] = startTime.split(':').map(Number);
    const endTime = `${String(hours + Math.floor((minutes + service.duration) / 60)).padStart(2, '0')}:${String((minutes + service.duration) % 60).padStart(2, '0')}`;

    const queryText = `
      INSERT INTO appointments (id, client_id, barber_id, service_id, barbershop_id, appointment_date, start_time, end_time, notes, total_price)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      id,
      appointmentData.client_id,
      appointmentData.barber_id,
      appointmentData.service_id,
      appointmentData.barbershop_id,
      appointmentData.appointment_date,
      startTime,
      endTime,
      appointmentData.notes || null,
      service.price
    ];

    const result = await query(queryText, values);
    return result.rows[0];
  }

  async findById(id: string): Promise<Appointment | null> {
    const queryText = `
      SELECT a.*,
             u_client.name as client_name, u_client.phone as client_phone,
             u_barber.name as barber_name,
             s.name as service_name, s.duration as service_duration
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN users u_client ON c.user_id = u_client.id
      JOIN barbers b ON a.barber_id = b.id
      JOIN users u_barber ON b.user_id = u_barber.id
      JOIN services s ON a.service_id = s.id
      WHERE a.id = $1
    `;
    const result = await query(queryText, [id]);
    return result.rows[0] || null;
  }

  async findAll(barbershop_id?: string, limit: number = 50, offset: number = 0): Promise<Appointment[]> {
    let queryText = `
      SELECT a.*,
             u_client.name as client_name, u_client.phone as client_phone,
             u_barber.name as barber_name,
             s.name as service_name, s.duration as service_duration
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN users u_client ON c.user_id = u_client.id
      JOIN barbers b ON a.barber_id = b.id
      JOIN users u_barber ON b.user_id = u_barber.id
      JOIN services s ON a.service_id = s.id
    `;
    const values: any[] = [];
    let paramCount = 1;

    if (barbershop_id) {
      queryText += ` WHERE a.barbershop_id = $${paramCount++}`;
      values.push(barbershop_id);
    }

    queryText += ` ORDER BY a.appointment_date DESC, a.start_time DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(limit, offset);

    const result = await query(queryText, values);
    return result.rows;
  }

  async findByDate(date: Date, barbershop_id?: string): Promise<Appointment[]> {
    let queryText = `
      SELECT a.*,
             u_client.name as client_name, u_client.phone as client_phone,
             u_barber.name as barber_name,
             s.name as service_name, s.duration as service_duration
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN users u_client ON c.user_id = u_client.id
      JOIN barbers b ON a.barber_id = b.id
      JOIN users u_barber ON b.user_id = u_barber.id
      JOIN services s ON a.service_id = s.id
      WHERE a.appointment_date = $1
    `;
    const values: any[] = [date.toISOString().split('T')[0]];

    if (barbershop_id) {
      queryText += ' AND a.barbershop_id = $2';
      values.push(barbershop_id);
    }

    queryText += ' ORDER BY a.start_time';

    const result = await query(queryText, values);
    return result.rows;
  }

  async findByBarber(barber_id: string, start_date?: Date, end_date?: Date): Promise<Appointment[]> {
    let queryText = `
      SELECT a.*,
             u_client.name as client_name, u_client.phone as client_phone,
             u_barber.name as barber_name,
             s.name as service_name, s.duration as service_duration
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN users u_client ON c.user_id = u_client.id
      JOIN barbers b ON a.barber_id = b.id
      JOIN users u_barber ON b.user_id = u_barber.id
      JOIN services s ON a.service_id = s.id
      WHERE a.barber_id = $1
    `;
    const values: any[] = [barber_id];
    let paramCount = 2;

    if (start_date) {
      queryText += ` AND a.appointment_date >= $${paramCount++}`;
      values.push(start_date.toISOString().split('T')[0]);
    }

    if (end_date) {
      queryText += ` AND a.appointment_date <= $${paramCount++}`;
      values.push(end_date.toISOString().split('T')[0]);
    }

    queryText += ' ORDER BY a.appointment_date, a.start_time';

    const result = await query(queryText, values);
    return result.rows;
  }

  async findByClient(client_id: string, limit: number = 20): Promise<Appointment[]> {
    const queryText = `
      SELECT a.*,
             u_client.name as client_name, u_client.phone as client_phone,
             u_barber.name as barber_name,
             s.name as service_name, s.duration as service_duration
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN users u_client ON c.user_id = u_client.id
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

  async findByStatus(status: string, barbershop_id?: string): Promise<Appointment[]> {
    let queryText = `
      SELECT a.*,
             u_client.name as client_name, u_client.phone as client_phone,
             u_barber.name as barber_name,
             s.name as service_name, s.duration as service_duration
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN users u_client ON c.user_id = u_client.id
      JOIN barbers b ON a.barber_id = b.id
      JOIN users u_barber ON b.user_id = u_barber.id
      JOIN services s ON a.service_id = s.id
      WHERE a.status = $1
    `;
    const values: any[] = [status];

    if (barbershop_id) {
      queryText += ' AND a.barbershop_id = $2';
      values.push(barbershop_id);
    }

    queryText += ' ORDER BY a.appointment_date, a.start_time';

    const result = await query(queryText, values);
    return result.rows;
  }

  async update(id: string, appointmentData: UpdateAppointmentData): Promise<Appointment | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (appointmentData.appointment_date !== undefined) {
      fields.push(`appointment_date = $${paramCount++}`);
      values.push(appointmentData.appointment_date.toISOString().split('T')[0]);
    }
    if (appointmentData.start_time !== undefined) {
      fields.push(`start_time = $${paramCount++}`);
      values.push(appointmentData.start_time);

      const appointment = await this.findById(id);
      if (appointment) {
        const serviceResult = await query('SELECT duration FROM services WHERE id = $1', [appointment.service_id]);
        if (serviceResult.rows[0]) {
          const duration = serviceResult.rows[0].duration;
          const [hours, minutes] = appointmentData.start_time.split(':').map(Number);
          const endTime = `${String(hours + Math.floor((minutes + duration) / 60)).padStart(2, '0')}:${String((minutes + duration) % 60).padStart(2, '0')}`;
          fields.push(`end_time = $${paramCount++}`);
          values.push(endTime);
        }
      }
    }
    if (appointmentData.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(appointmentData.status);
    }
    if (appointmentData.notes !== undefined) {
      fields.push(`notes = $${paramCount++}`);
      values.push(appointmentData.notes);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    const queryText = `
      UPDATE appointments
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    values.push(id);

    const result = await query(queryText, values);
    return result.rows[0] || null;
  }

  async cancel(id: string, reason?: string): Promise<boolean> {
    const notes = reason ? `Cancelado: ${reason}` : 'Cancelado';
    const queryText = 'UPDATE appointments SET status = $1, notes = $2 WHERE id = $3';
    const result = await query(queryText, ['cancelled', notes, id]);
    return (result.rowCount || 0) > 0;
  }

  async complete(id: string): Promise<boolean> {
    const queryText = 'UPDATE appointments SET status = $1 WHERE id = $2';
    const result = await query(queryText, ['completed', id]);

    if ((result.rowCount || 0) > 0) {
      const appointment = await this.findById(id);
      if (appointment) {
        await query('UPDATE clients SET total_visits = total_visits + 1, last_visit = NOW() WHERE id = $1', [appointment.client_id]);
      }
    }

    return (result.rowCount || 0) > 0;
  }

  async delete(id: string): Promise<boolean> {
    const queryText = 'DELETE FROM appointments WHERE id = $1';
    const result = await query(queryText, [id]);
    return (result.rowCount || 0) > 0;
  }

  async checkTimeSlotAvailability(barber_id: string, date: Date, start_time: string, end_time: string, excludeId?: string): Promise<boolean> {
    let queryText = `
      SELECT id FROM appointments
      WHERE barber_id = $1
      AND appointment_date = $2
      AND status NOT IN ('cancelled', 'no_show')
      AND (
        (start_time <= $3 AND end_time > $3) OR
        (start_time < $4 AND end_time >= $4) OR
        (start_time >= $3 AND end_time <= $4)
      )
    `;
    const values: any[] = [barber_id, date.toISOString().split('T')[0], start_time, end_time];

    if (excludeId) {
      queryText += ' AND id != $5';
      values.push(excludeId);
    }

    const result = await query(queryText, values);
    return result.rows.length === 0;
  }

  async getUpcoming(barbershop_id?: string, days: number = 7): Promise<Appointment[]> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    let queryText = `
      SELECT a.*,
             u_client.name as client_name, u_client.phone as client_phone,
             u_barber.name as barber_name,
             s.name as service_name, s.duration as service_duration
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN users u_client ON c.user_id = u_client.id
      JOIN barbers b ON a.barber_id = b.id
      JOIN users u_barber ON b.user_id = u_barber.id
      JOIN services s ON a.service_id = s.id
      WHERE a.appointment_date >= CURRENT_DATE
      AND a.appointment_date <= $1
      AND a.status IN ('scheduled', 'confirmed')
    `;
    const values: any[] = [endDate.toISOString().split('T')[0]];

    if (barbershop_id) {
      queryText += ' AND a.barbershop_id = $2';
      values.push(barbershop_id);
    }

    queryText += ' ORDER BY a.appointment_date, a.start_time';

    const result = await query(queryText, values);
    return result.rows;
  }

  async count(barbershop_id?: string): Promise<number> {
    let queryText = 'SELECT COUNT(*) as count FROM appointments';
    const values: any[] = [];

    if (barbershop_id) {
      queryText += ' WHERE barbershop_id = $1';
      values.push(barbershop_id);
    }

    const result = await query(queryText, values);
    return parseInt(result.rows[0].count);
  }

  async getStatistics(barbershop_id?: string, start_date?: Date, end_date?: Date) {
    let whereClause = 'WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (barbershop_id) {
      whereClause += ` AND barbershop_id = $${paramCount++}`;
      values.push(barbershop_id);
    }

    if (start_date) {
      whereClause += ` AND appointment_date >= $${paramCount++}`;
      values.push(start_date.toISOString().split('T')[0]);
    }

    if (end_date) {
      whereClause += ` AND appointment_date <= $${paramCount++}`;
      values.push(end_date.toISOString().split('T')[0]);
    }

    const queryText = `
      SELECT
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_shows,
        SUM(CASE WHEN status = 'completed' THEN total_price ELSE 0 END) as total_revenue
      FROM appointments
      ${whereClause}
    `;

    const result = await query(queryText, values);
    return result.rows[0];
  }
}