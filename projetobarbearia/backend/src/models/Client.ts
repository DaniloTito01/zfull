export interface Client {
  id: string;
  user_id: string;
  date_of_birth?: Date;
  preferences?: ClientPreferences;
  loyalty_points: number;
  total_visits: number;
  last_visit?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ClientPreferences {
  preferred_barbers: string[];
  preferred_services: string[];
  notes?: string;
}

export interface CreateClientData {
  user_id: string;
  date_of_birth?: Date;
  preferences?: ClientPreferences;
}

export interface UpdateClientData {
  date_of_birth?: Date;
  preferences?: ClientPreferences;
  loyalty_points?: number;
  total_visits?: number;
  last_visit?: Date;
}