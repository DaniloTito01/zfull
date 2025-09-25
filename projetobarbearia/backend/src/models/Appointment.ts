export interface Appointment {
  id: string;
  client_id: string;
  barber_id: string;
  service_id: string;
  barbershop_id: string;
  appointment_date: Date;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  total_price: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAppointmentData {
  client_id: string;
  barber_id: string;
  service_id: string;
  barbershop_id: string;
  appointment_date: Date;
  start_time: string;
  notes?: string;
}

export interface UpdateAppointmentData {
  appointment_date?: Date;
  start_time?: string;
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
}