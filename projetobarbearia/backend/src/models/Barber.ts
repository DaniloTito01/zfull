export interface Barber {
  id: string;
  user_id: string;
  barbershop_id: string;
  specialties: string[];
  experience_years: number;
  commission_rate: number;
  schedule: WeeklySchedule;
  bio?: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface WeeklySchedule {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DaySchedule {
  start_time: string;
  end_time: string;
  break_start?: string;
  break_end?: string;
}

export interface CreateBarberData {
  user_id: string;
  barbershop_id: string;
  specialties: string[];
  experience_years: number;
  commission_rate: number;
  schedule: WeeklySchedule;
  bio?: string;
}

export interface UpdateBarberData {
  specialties?: string[];
  experience_years?: number;
  commission_rate?: number;
  schedule?: WeeklySchedule;
  bio?: string;
  active?: boolean;
}