// Tipos TypeScript para o sistema de barbearia

export interface Barbershop {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Barber {
  id: string;
  barbershop_id: string;
  name: string;
  email?: string;
  phone?: string;
  specialties?: string[];
  status: 'active' | 'inactive' | 'vacation';
  rating: number;
  work_schedule?: Record<string, { start: string; end: string }>;
  hire_date?: string;
  address?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  barbershop_id: string;
  name: string;
  phone?: string;
  email?: string;
  last_visit?: string;
  total_visits: number;
  total_spent: number;
  status: 'active' | 'inactive' | 'vip';
  preferred_barber_id?: string;
  notes?: string;
  birth_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  barbershop_id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  is_active: boolean;
  total_bookings: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  barbershop_id: string;
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  price: number;
  cost?: number;
  stock: number;
  min_stock: number;
  is_active: boolean;
  sold_this_month: number;
  sku?: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  barbershop_id: string;
  client_id?: string;
  client_name?: string;
  barber_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  price?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  barbershop_id: string;
  client_id?: string;
  client_name?: string;
  barber_id: string;
  sale_date: string;
  sale_time: string;
  subtotal: number;
  products_total: number;
  total: number;
  payment_method: 'cash' | 'card' | 'pix' | 'transfer';
  status: 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SaleService {
  id: string;
  sale_id: string;
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface SaleProduct {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

// DTOs para criação/atualização
export interface CreateBarbershopDTO {
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

export interface CreateBarberDTO {
  barbershop_id: string;
  name: string;
  email?: string;
  phone?: string;
  specialties?: string[];
  status?: 'active' | 'inactive' | 'vacation';
  work_schedule?: Record<string, { start: string; end: string }>;
  hire_date?: string;
  address?: string;
  avatar_url?: string;
}

export interface CreateClientDTO {
  barbershop_id: string;
  name: string;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive' | 'vip';
  preferred_barber_id?: string;
  notes?: string;
  birth_date?: string;
}

export interface CreateServiceDTO {
  barbershop_id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
}

export interface CreateProductDTO {
  barbershop_id: string;
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  price: number;
  cost?: number;
  stock?: number;
  min_stock?: number;
  sku?: string;
}

export interface CreateAppointmentDTO {
  barbershop_id: string;
  client_id?: string;
  client_name?: string;
  barber_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  price?: number;
  notes?: string;
}

export interface CreateSaleDTO {
  barbershop_id: string;
  client_id?: string;
  client_name?: string;
  barber_id: string;
  services: Array<{
    service_id: string;
    quantity?: number;
    unit_price: number;
  }>;
  products: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
  payment_method: 'cash' | 'card' | 'pix' | 'transfer';
  notes?: string;
}

// Tipos de resposta da API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Filtros e consultas
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  status?: string;
  category?: string;
  barber_id?: string;
  client_id?: string;
  date_from?: string;
  date_to?: string;
}