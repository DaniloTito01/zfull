export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: string;
  active: boolean;
  barbershop_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: string;
  barbershop_id: string;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  category?: string;
  active?: boolean;
}