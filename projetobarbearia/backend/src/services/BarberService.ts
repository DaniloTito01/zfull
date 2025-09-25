import { query } from '../config/database';
import { Barber, CreateBarberData, UpdateBarberData } from '../models/Barber';
import { v4 as uuidv4 } from 'uuid';

export class BarberService {
  async create(barberData: CreateBarberData): Promise<Barber> {
    const id = uuidv4();

    const queryText = `
      INSERT INTO barbers (id, user_id, barbershop_id, specialties, experience_years, commission_rate, schedule, bio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      id,
      barberData.user_id,
      barberData.barbershop_id,
      barberData.specialties,
      barberData.experience_years,
      barberData.commission_rate,
      JSON.stringify(barberData.schedule),
      barberData.bio || null
    ];

    const result = await query(queryText, values);
    return result.rows[0];
  }

  async findById(id: string): Promise<Barber | null> {
    const queryText = `
      SELECT b.*, u.name, u.email, u.phone, u.avatar
      FROM barbers b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = $1 AND b.active = true AND u.active = true
    `;
    const result = await query(queryText, [id]);
    return result.rows[0] || null;
  }

  async findByUserId(user_id: string): Promise<Barber | null> {
    const queryText = `
      SELECT b.*, u.name, u.email, u.phone, u.avatar
      FROM barbers b
      JOIN users u ON b.user_id = u.id
      WHERE b.user_id = $1 AND b.active = true AND u.active = true
    `;
    const result = await query(queryText, [user_id]);
    return result.rows[0] || null;
  }

  async findAll(barbershop_id?: string, limit: number = 50, offset: number = 0): Promise<Barber[]> {
    let queryText = `
      SELECT b.*, u.name, u.email, u.phone, u.avatar
      FROM barbers b
      JOIN users u ON b.user_id = u.id
      WHERE b.active = true AND u.active = true
    `;
    const values: any[] = [];
    let paramCount = 1;

    if (barbershop_id) {
      queryText += ` AND b.barbershop_id = $${paramCount++}`;
      values.push(barbershop_id);
    }

    queryText += ` ORDER BY u.name LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(limit, offset);

    const result = await query(queryText, values);
    return result.rows;
  }

  async findByBarbershop(barbershop_id: string): Promise<Barber[]> {
    const queryText = `
      SELECT b.*, u.name, u.email, u.phone, u.avatar
      FROM barbers b
      JOIN users u ON b.user_id = u.id
      WHERE b.barbershop_id = $1 AND b.active = true AND u.active = true
      ORDER BY u.name
    `;
    const result = await query(queryText, [barbershop_id]);
    return result.rows;
  }

  async findBySpecialty(specialty: string, barbershop_id?: string): Promise<Barber[]> {
    let queryText = `
      SELECT b.*, u.name, u.email, u.phone, u.avatar
      FROM barbers b
      JOIN users u ON b.user_id = u.id
      WHERE $1 = ANY(b.specialties) AND b.active = true AND u.active = true
    `;
    const values: any[] = [specialty];

    if (barbershop_id) {
      queryText += ' AND b.barbershop_id = $2';
      values.push(barbershop_id);
    }

    queryText += ' ORDER BY u.name';

    const result = await query(queryText, values);
    return result.rows;
  }

  async update(id: string, barberData: UpdateBarberData): Promise<Barber | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (barberData.specialties !== undefined) {
      fields.push(`specialties = $${paramCount++}`);
      values.push(barberData.specialties);
    }
    if (barberData.experience_years !== undefined) {
      fields.push(`experience_years = $${paramCount++}`);
      values.push(barberData.experience_years);
    }
    if (barberData.commission_rate !== undefined) {
      fields.push(`commission_rate = $${paramCount++}`);
      values.push(barberData.commission_rate);
    }
    if (barberData.schedule !== undefined) {
      fields.push(`schedule = $${paramCount++}`);
      values.push(JSON.stringify(barberData.schedule));
    }
    if (barberData.bio !== undefined) {
      fields.push(`bio = $${paramCount++}`);
      values.push(barberData.bio);
    }
    if (barberData.active !== undefined) {
      fields.push(`active = $${paramCount++}`);
      values.push(barberData.active);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    const queryText = `
      UPDATE barbers
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    values.push(id);

    const result = await query(queryText, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const queryText = 'UPDATE barbers SET active = false WHERE id = $1';
    const result = await query(queryText, [id]);
    return (result.rowCount || 0) > 0;
  }

  async hardDelete(id: string): Promise<boolean> {
    const queryText = 'DELETE FROM barbers WHERE id = $1';
    const result = await query(queryText, [id]);
    return (result.rowCount || 0) > 0;
  }

  async getAvailableSlots(barberId: string, date: Date, service_duration: number = 30): Promise<string[]> {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    const barber = await this.findById(barberId);
    if (!barber || !barber.schedule) {
      return [];
    }

    const schedule = typeof barber.schedule === 'string' ? JSON.parse(barber.schedule) : barber.schedule;
    const daySchedule = schedule[dayOfWeek];

    if (!daySchedule || !daySchedule.start_time || !daySchedule.end_time) {
      return [];
    }

    const appointmentsQuery = `
      SELECT start_time, end_time
      FROM appointments
      WHERE barber_id = $1 AND appointment_date = $2
      AND status NOT IN ('cancelled', 'no_show')
    `;
    const appointmentsResult = await query(appointmentsQuery, [barberId, dateStr]);
    const appointments = appointmentsResult.rows;

    const slots: string[] = [];
    const startMinutes = this.timeToMinutes(daySchedule.start_time);
    const endMinutes = this.timeToMinutes(daySchedule.end_time);

    let breakStartMinutes = null;
    let breakEndMinutes = null;
    if (daySchedule.break_start && daySchedule.break_end) {
      breakStartMinutes = this.timeToMinutes(daySchedule.break_start);
      breakEndMinutes = this.timeToMinutes(daySchedule.break_end);
    }

    for (let time = startMinutes; time < endMinutes; time += service_duration) {
      const slotEndTime = time + service_duration;

      if (slotEndTime > endMinutes) break;

      if (breakStartMinutes && breakEndMinutes) {
        if ((time >= breakStartMinutes && time < breakEndMinutes) ||
            (slotEndTime > breakStartMinutes && slotEndTime <= breakEndMinutes) ||
            (time < breakStartMinutes && slotEndTime > breakEndMinutes)) {
          continue;
        }
      }

      const isOccupied = appointments.some(apt => {
        const aptStartMinutes = this.timeToMinutes(apt.start_time);
        const aptEndMinutes = this.timeToMinutes(apt.end_time);
        return (time >= aptStartMinutes && time < aptEndMinutes) ||
               (slotEndTime > aptStartMinutes && slotEndTime <= aptEndMinutes) ||
               (time < aptStartMinutes && slotEndTime > aptEndMinutes);
      });

      if (!isOccupied) {
        slots.push(this.minutesToTime(time));
      }
    }

    return slots;
  }

  async getStats(barberId: string, start_date?: Date, end_date?: Date) {
    const currentDate = new Date();
    const startOfMonth = start_date || new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = end_date || new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const statsQuery = `
      SELECT
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
        SUM(CASE WHEN status = 'completed' THEN total_price ELSE 0 END) as total_revenue,
        AVG(CASE WHEN status = 'completed' THEN total_price ELSE NULL END) as avg_ticket
      FROM appointments
      WHERE barber_id = $1
      AND appointment_date >= $2
      AND appointment_date <= $3
    `;

    const result = await query(statsQuery, [
      barberId,
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]
    ]);

    const stats = result.rows[0];

    const upcomingQuery = `
      SELECT a.*, c.id as client_id, u.name as client_name, u.phone as client_phone, s.name as service_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN users u ON c.user_id = u.id
      JOIN services s ON a.service_id = s.id
      WHERE a.barber_id = $1
      AND a.appointment_date >= CURRENT_DATE
      AND a.status IN ('scheduled', 'confirmed')
      ORDER BY a.appointment_date, a.start_time
      LIMIT 5
    `;

    const upcomingResult = await query(upcomingQuery, [barberId]);

    return {
      total_appointments: parseInt(stats.total_appointments) || 0,
      completed_appointments: parseInt(stats.completed_appointments) || 0,
      total_revenue: parseFloat(stats.total_revenue) || 0,
      avg_ticket: parseFloat(stats.avg_ticket) || 0,
      upcoming_appointments: upcomingResult.rows
    };
  }

  async updateSchedule(barberId: string, schedule: any): Promise<Barber | null> {
    return this.update(barberId, { schedule });
  }

  async getSpecialties(barbershop_id?: string): Promise<string[]> {
    let queryText = `
      SELECT DISTINCT unnest(specialties) as specialty
      FROM barbers
      WHERE active = true
    `;
    const values: any[] = [];

    if (barbershop_id) {
      queryText += ' AND barbershop_id = $1';
      values.push(barbershop_id);
    }

    queryText += ' ORDER BY specialty';

    const result = await query(queryText, values);
    return result.rows.map(row => row.specialty);
  }

  async count(barbershop_id?: string): Promise<number> {
    let queryText = 'SELECT COUNT(*) as count FROM barbers WHERE active = true';
    const values: any[] = [];

    if (barbershop_id) {
      queryText += ' AND barbershop_id = $1';
      values.push(barbershop_id);
    }

    const result = await query(queryText, values);
    return parseInt(result.rows[0].count);
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}