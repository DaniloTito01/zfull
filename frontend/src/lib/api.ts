const API_BASE = import.meta.env.VITE_API_BASE || '';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [GET ${endpoint}]:`, error);
      throw error;
    }
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [POST ${endpoint}]:`, error);
      throw error;
    }
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [PUT ${endpoint}]:`, error);
      throw error;
    }
  }

  async delete<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [DELETE ${endpoint}]:`, error);
      throw error;
    }
  }
}

// Instância singleton
export const apiClient = new ApiClient();

// API Service Functions
export const apiService = {
  // Barbershops
  barbershops: {
    getAll: () => apiClient.get<ApiResponse<Barbershop[]>>('/barbershops'),
    getById: (id: string) => apiClient.get<ApiResponse<Barbershop>>(`/barbershops/${id}`),
    create: (data: CreateBarbershopData) => apiClient.post<ApiResponse<Barbershop>>('/barbershops', data),
    update: (id: string, data: UpdateBarbershopData) => apiClient.put<ApiResponse<Barbershop>>(`/barbershops/${id}`, data),
    getDashboard: (id: string) => apiClient.get<ApiResponse<BarbershopDashboard>>(`/barbershops/${id}/dashboard`),
  },

  // Clients
  clients: {
    getAll: (barbershopId: string, params?: ClientsParams) => {
      const query = new URLSearchParams({ barbershop_id: barbershopId, ...params });
      return apiClient.get<ApiResponse<Client[]>>(`/clients?${query}`);
    },
    getById: (id: string) => apiClient.get<ApiResponse<Client>>(`/clients/${id}`),
    create: (data: CreateClientData) => apiClient.post<ApiResponse<Client>>('/clients', data),
    update: (id: string, data: UpdateClientData) => apiClient.put<ApiResponse<Client>>(`/clients/${id}`, data),
    delete: (id: string) => apiClient.delete<ApiResponse<any>>(`/clients/${id}`),
  },

  // Barbers
  barbers: {
    getAll: (barbershopId: string) => {
      const query = new URLSearchParams({ barbershop_id: barbershopId });
      return apiClient.get<ApiResponse<Barber[]>>(`/barbers?${query}`);
    },
    getById: (id: string) => apiClient.get<ApiResponse<Barber>>(`/barbers/${id}`),
    create: (data: CreateBarberData) => apiClient.post<ApiResponse<Barber>>('/barbers', data),
    update: (id: string, data: UpdateBarberData) => apiClient.put<ApiResponse<Barber>>(`/barbers/${id}`, data),
    delete: (id: string) => apiClient.delete<ApiResponse<void>>(`/barbers/${id}`),
    getAvailableSlots: (barberId: string, date: string) => {
      const query = new URLSearchParams({ barber_id: barberId, date });
      return apiClient.get<ApiResponse<string[]>>(`/barbers/available-slots?${query}`);
    },
  },

  // Services
  services: {
    getAll: (barbershopId: string) => {
      const query = new URLSearchParams({ barbershop_id: barbershopId });
      return apiClient.get<ApiResponse<Service[]>>(`/services?${query}`);
    },
    getById: (id: string) => apiClient.get<ApiResponse<Service>>(`/services/${id}`),
    create: (data: CreateServiceData) => apiClient.post<ApiResponse<Service>>('/services', data),
    update: (id: string, data: UpdateServiceData) => apiClient.put<ApiResponse<Service>>(`/services/${id}`, data),
    delete: (id: string) => apiClient.delete<ApiResponse<void>>(`/services/${id}`),
  },

  // Appointments
  appointments: {
    getAll: (barbershopId: string, params?: AppointmentsParams) => {
      const query = new URLSearchParams({ barbershop_id: barbershopId, ...params });
      return apiClient.get<ApiResponse<Appointment[]>>(`/appointments?${query}`);
    },
    getById: (id: string) => apiClient.get<ApiResponse<Appointment>>(`/appointments/${id}`),
    create: (data: CreateAppointmentData) => apiClient.post<ApiResponse<Appointment>>('/appointments', data),
    update: (id: string, data: UpdateAppointmentData) => apiClient.put<ApiResponse<Appointment>>(`/appointments/${id}`, data),
    updateStatus: (id: string, status: string) => apiClient.put<ApiResponse<Appointment>>(`/appointments/${id}/status`, { status }),
    delete: (id: string, reason?: string) => apiClient.delete<ApiResponse<any>>(`/appointments/${id}`, reason ? { reason } : undefined),
    getCalendar: (barbershopId: string, params?: CalendarParams) => {
      const query = new URLSearchParams({ barbershop_id: barbershopId, ...params });
      return apiClient.get<ApiResponse<CalendarData>>(`/appointments/calendar?${query}`);
    },
  },

  // Products
  products: {
    getAll: (barbershopId: string, params?: ProductsParams) => {
      const query = new URLSearchParams({ barbershop_id: barbershopId, ...params });
      return apiClient.get<ApiResponse<Product[]>>(`/products?${query}`);
    },
    getById: (id: string) => apiClient.get<ApiResponse<Product>>(`/products/${id}`),
    create: (data: CreateProductData) => apiClient.post<ApiResponse<Product>>('/products', data),
    update: (id: string, data: UpdateProductData) => apiClient.put<ApiResponse<Product>>(`/products/${id}`, data),
    delete: (id: string) => apiClient.delete<ApiResponse<void>>(`/products/${id}`),
    updateStock: (id: string, data: StockMovementData) =>
      apiClient.post<ApiResponse<StockUpdate>>(`/products/${id}/stock`, data),
  },

  // Sales
  sales: {
    getAll: (barbershopId: string, params?: SalesParams) => {
      const query = new URLSearchParams({ barbershop_id: barbershopId, ...params });
      return apiClient.get<ApiResponse<Sale[]>>(`/sales?${query}`);
    },
    getById: (id: string) => apiClient.get<ApiResponse<SaleWithItems>>(`/sales/${id}`),
    create: (data: CreateSaleData) => apiClient.post<ApiResponse<Sale>>('/sales', data),
    getDaily: (barbershopId: string, date?: string) => {
      const query = new URLSearchParams({ barbershop_id: barbershopId, ...(date && { date }) });
      return apiClient.get<ApiResponse<DailySales>>(`/sales/daily?${query}`);
    },
    getReports: (barbershopId: string, period?: string) => {
      const query = new URLSearchParams({ barbershop_id: barbershopId, ...(period && { period }) });
      return apiClient.get<ApiResponse<SalesReports>>(`/sales/reports?${query}`);
    },
  },

  // Legacy endpoint for dashboard
  data: () => apiClient.get<ApiDataResponse>('/data'),
};

// Base API Response Type
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Entity Types
export interface Barbershop {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  logo_url?: string;
  plan_id?: string;
  is_active: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface BarbershopDashboard {
  barbershop: Barbershop;
  today_appointments: number;
  today_revenue: number;
  pending_appointments: number;
  total_clients: number;
  total_barbers: number;
  avg_rating: number;
  recent_appointments: Appointment[];
}

export interface Client {
  id: string;
  barbershop_id: string;
  name: string;
  phone: string;
  email?: string;
  birth_date?: string;
  address?: string;
  preferred_barber_id?: string;
  notes?: string;
  total_spent: number;
  total_visits: number;
  last_visit?: string;
  status: 'active' | 'inactive';
  client_since: string;
  preferred_barber_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Barber {
  id: string;
  barbershop_id: string;
  name: string;
  phone: string;
  email?: string;
  specialty?: string;
  commission_rate: number;
  working_hours: any;
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
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  barbershop_id: string;
  client_id: string;
  client_name?: string;
  client_phone?: string;
  barber_id: string;
  barber_name?: string;
  service_id: string;
  service_name?: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  price: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  barbershop_id: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  barcode?: string;
  cost_price: number;
  sell_price: number;
  current_stock: number;
  min_stock: number;
  is_active: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  barbershop_id: string;
  client_id?: string;
  client_name?: string;
  barber_id?: string;
  barber_name?: string;
  appointment_id?: string;
  sale_date: string;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: 'cash' | 'card' | 'pix';
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  item_type: 'service' | 'product';
  item_id: string;
  item_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface SaleWithItems {
  sale: Sale;
  items: SaleItem[];
}

// Request Data Types
export interface CreateBarbershopData {
  name: string;
  phone: string;
  email: string;
  address: string;
  logo_url?: string;
  plan_id?: string;
  owner_id: string;
}

export interface UpdateBarbershopData extends Partial<CreateBarbershopData> {
  is_active?: boolean;
}

export interface CreateClientData {
  barbershop_id: string;
  name: string;
  phone: string;
  email?: string;
  birth_date?: string;
  address?: string;
  preferred_barber_id?: string;
  notes?: string;
}

export interface UpdateClientData extends Partial<CreateClientData> {
  status?: 'active' | 'inactive';
}

export interface CreateBarberData {
  barbershop_id: string;
  name: string;
  phone: string;
  email?: string;
  specialty?: string;
  commission_rate?: number;
  working_hours?: any;
}

export interface UpdateBarberData extends Partial<CreateBarberData> {
  is_active?: boolean;
}

export interface CreateServiceData {
  barbershop_id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  is_active?: boolean;
}

export interface CreateAppointmentData {
  barbershop_id: string;
  client_id: string;
  barber_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  duration?: number;
  notes?: string;
}

export interface UpdateAppointmentData extends Partial<CreateAppointmentData> {
  status?: Appointment['status'];
  price?: number;
}

export interface CreateProductData {
  barbershop_id: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  barcode?: string;
  cost_price?: number;
  sell_price: number;
  current_stock?: number;
  min_stock?: number;
  image_url?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  is_active?: boolean;
}

export interface StockMovementData {
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
}

export interface StockUpdate {
  previous_stock: number;
  new_stock: number;
  movement_type: string;
  quantity: number;
}

export interface CreateSaleData {
  barbershop_id: string;
  client_id?: string;
  barber_id?: string;
  appointment_id?: string;
  items: Array<{
    item_type: 'service' | 'product';
    item_id: string;
    quantity: number;
    unit_price: number;
  }>;
  discount?: number;
  payment_method?: 'cash' | 'card' | 'pix';
  notes?: string;
}

// Query Parameters
export interface ClientsParams {
  search?: string;
  status?: string;
  page?: string;
  limit?: string;
}

export interface AppointmentsParams {
  date?: string;
  barber_id?: string;
  client_id?: string;
  status?: string;
  page?: string;
  limit?: string;
}

export interface CalendarParams {
  start_date?: string;
  end_date?: string;
  barber_id?: string;
}

export interface ProductsParams {
  category?: string;
  is_active?: string;
  low_stock?: string;
}

export interface SalesParams {
  barber_id?: string;
  client_id?: string;
  date?: string;
  page?: string;
  limit?: string;
}

// Dashboard/Report Types
export interface CalendarData {
  appointments: Appointment[];
  available_slots: Array<{
    barber_id: string;
    barber_name: string;
    date: string;
    available_times: string[];
  }>;
}

export interface DailySales {
  date: string;
  summary: {
    total_sales: number;
    total_revenue: number;
    avg_ticket: number;
    unique_clients: number;
    cash_sales: number;
    card_sales: number;
    pix_sales: number;
  };
  top_products: Array<{
    name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  top_services: Array<{
    name: string;
    times_sold: number;
    revenue: number;
  }>;
}

export interface SalesReports {
  period: string;
  summary: {
    total_sales: number;
    total_revenue: number;
    avg_ticket: number;
    unique_clients: number;
  };
  daily_sales: Array<{
    date: string;
    sales_count: number;
    revenue: number;
  }>;
}

// Legacy types for compatibility
export interface ApiDataResponse {
  barbershops: Array<{
    id: string;
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    logo_url: string;
    plan_id: string;
    is_active: boolean;
    owner_id: string;
    created_at: string;
  }>;
  services: Array<{
    id: string;
    barbershop_id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    category: string;
  }>;
  appointments: Array<{
    id: string;
    barbershop_id: string;
    client_name: string;
    client_phone: string;
    service_id: string;
    barber_id: string;
    date: string;
    time: string;
    status: string;
    price: number;
  }>;
  metrics: {
    total_barbershops: number;
    total_appointments_today: number;
    total_revenue_month: number;
    avg_rating: number;
    generated_at: string;
    database_connected?: boolean;
    database_time?: string;
  };
}

export default apiClient;