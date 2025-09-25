export interface Barbershop {
  id: string;
  name: string;
  description?: string;
  address: Address;
  phone: string;
  email?: string;
  website?: string;
  opening_hours: WeeklyOpeningHours;
  settings: BarbershopSettings;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
}

export interface WeeklyOpeningHours {
  monday?: OpeningHours;
  tuesday?: OpeningHours;
  wednesday?: OpeningHours;
  thursday?: OpeningHours;
  friday?: OpeningHours;
  saturday?: OpeningHours;
  sunday?: OpeningHours;
}

export interface OpeningHours {
  open_time: string;
  close_time: string;
  closed?: boolean;
}

export interface BarbershopSettings {
  appointment_interval: number;
  max_advance_booking_days: number;
  cancellation_policy_hours: number;
  auto_confirm_appointments: boolean;
  accept_walk_ins: boolean;
}

export interface CreateBarbershopData {
  name: string;
  description?: string;
  address: Address;
  phone: string;
  email?: string;
  website?: string;
  opening_hours: WeeklyOpeningHours;
  settings: BarbershopSettings;
}

export interface UpdateBarbershopData {
  name?: string;
  description?: string;
  address?: Address;
  phone?: string;
  email?: string;
  website?: string;
  opening_hours?: WeeklyOpeningHours;
  settings?: BarbershopSettings;
  active?: boolean;
}