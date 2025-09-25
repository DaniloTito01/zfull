// Mock database for development and demo purposes
// This simulates a complete database with all relationships

export interface MockBarbershop {
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
}

export interface MockClient {
  id: string;
  barbershop_id: string;
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  preferences?: string;
  notes?: string;
  total_visits: number;
  total_spent: number;
  created_at: string;
}

export interface MockBarber {
  id: string;
  barbershop_id: string;
  name: string;
  email: string;
  phone: string;
  specialty?: string;
  bio?: string;
  commission_rate?: number;
  working_hours?: string;
  days_off?: string;
  active: boolean;
  created_at: string;
}

export interface MockService {
  id: string;
  barbershop_id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  active: boolean;
  created_at: string;
}

export interface MockProduct {
  id: string;
  barbershop_id: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock_quantity: number;
  min_stock?: number;
  category?: string;
  brand?: string;
  barcode?: string;
  active: boolean;
  created_at: string;
}

export interface MockAppointment {
  id: string;
  barbershop_id: string;
  client_id: string;
  barber_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  price: number;
  created_at: string;
}

export interface MockSale {
  id: string;
  barbershop_id: string;
  client_id?: string;
  barber_id: string;
  items: {
    type: 'service' | 'product';
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  payment_method: string;
  date: string;
  created_at: string;
}

// Mock Data
export const mockBarbershops: MockBarbershop[] = [
  {
    id: 'bb-001',
    name: 'Barbearia Clássica',
    address: {
      street: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567'
    },
    logo_url: 'https://placeholder.co/150x150/png',
    plan_id: 'premium',
    is_active: true,
    owner_id: 'user-001',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'bb-002',
    name: 'Corte & Estilo',
    address: {
      street: 'Av. Paulista, 456',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100'
    },
    logo_url: 'https://placeholder.co/150x150/png',
    plan_id: 'basic',
    is_active: true,
    owner_id: 'user-002',
    created_at: '2024-02-01T00:00:00Z'
  }
];

export const mockClients: MockClient[] = [
  {
    id: 'cli-001',
    barbershop_id: 'bb-001',
    name: 'João Silva',
    phone: '(11) 99999-9999',
    email: 'joao@email.com',
    birthday: '1985-05-15',
    preferences: 'Corte baixo, barba aparada',
    notes: 'Cliente VIP',
    total_visits: 25,
    total_spent: 1250,
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'cli-002',
    barbershop_id: 'bb-001',
    name: 'Pedro Santos',
    phone: '(11) 88888-8888',
    email: 'pedro@email.com',
    birthday: '1990-08-22',
    preferences: 'Corte moderno',
    notes: '',
    total_visits: 12,
    total_spent: 600,
    created_at: '2024-02-01T00:00:00Z'
  },
  {
    id: 'cli-003',
    barbershop_id: 'bb-001',
    name: 'Carlos Lima',
    phone: '(11) 77777-7777',
    email: 'carlos@email.com',
    birthday: '1988-12-10',
    preferences: 'Cabelo e barba',
    notes: 'Alérgico a determinados produtos',
    total_visits: 18,
    total_spent: 900,
    created_at: '2024-01-20T00:00:00Z'
  }
];

export const mockBarbers: MockBarber[] = [
  {
    id: 'bar-001',
    barbershop_id: 'bb-001',
    name: 'Roberto Silva',
    email: 'roberto@barbearia.com',
    phone: '(11) 91111-1111',
    specialty: 'Corte Masculino',
    bio: '15 anos de experiência em cortes clássicos',
    commission_rate: 50,
    working_hours: '08:00 - 18:00',
    days_off: 'Domingo',
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'bar-002',
    barbershop_id: 'bb-001',
    name: 'Antonio Costa',
    email: 'antonio@barbearia.com',
    phone: '(11) 92222-2222',
    specialty: 'Barba',
    bio: 'Especialista em barbas e bigodes',
    commission_rate: 45,
    working_hours: '09:00 - 19:00',
    days_off: 'Segunda',
    active: true,
    created_at: '2024-01-05T00:00:00Z'
  }
];

export const mockServices: MockService[] = [
  {
    id: 'srv-001',
    barbershop_id: 'bb-001',
    name: 'Corte Masculino',
    description: 'Corte tradicional masculino',
    duration: 30,
    price: 35,
    category: 'corte',
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'srv-002',
    barbershop_id: 'bb-001',
    name: 'Barba Completa',
    description: 'Aparar e modelar barba',
    duration: 20,
    price: 25,
    category: 'barba',
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'srv-003',
    barbershop_id: 'bb-001',
    name: 'Corte + Barba',
    description: 'Pacote completo de corte e barba',
    duration: 45,
    price: 55,
    category: 'combo',
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  }
];

export const mockProducts: MockProduct[] = [
  {
    id: 'prod-001',
    barbershop_id: 'bb-001',
    name: 'Pomada Modeladora',
    description: 'Pomada premium para cabelo',
    price: 45,
    cost: 25,
    stock_quantity: 15,
    min_stock: 5,
    category: 'pomada',
    brand: 'BarberLine',
    barcode: '7891234567890',
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'prod-002',
    barbershop_id: 'bb-001',
    name: 'Óleo para Barba',
    description: 'Óleo hidratante para barba',
    price: 35,
    cost: 18,
    stock_quantity: 8,
    min_stock: 3,
    category: 'oleo',
    brand: 'BeardCare',
    barcode: '7891234567891',
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  }
];

export const mockAppointments: MockAppointment[] = [
  {
    id: 'apt-001',
    barbershop_id: 'bb-001',
    client_id: 'cli-001',
    barber_id: 'bar-001',
    service_id: 'srv-001',
    appointment_date: '2024-12-25',
    appointment_time: '14:00',
    status: 'confirmed',
    notes: 'Cliente preferencial',
    price: 35,
    created_at: '2024-12-20T00:00:00Z'
  },
  {
    id: 'apt-002',
    barbershop_id: 'bb-001',
    client_id: 'cli-002',
    barber_id: 'bar-002',
    service_id: 'srv-002',
    appointment_date: '2024-12-26',
    appointment_time: '15:30',
    status: 'pending',
    notes: '',
    price: 25,
    created_at: '2024-12-20T00:00:00Z'
  }
];

export const mockSales: MockSale[] = [
  {
    id: 'sale-001',
    barbershop_id: 'bb-001',
    client_id: 'cli-001',
    barber_id: 'bar-001',
    items: [
      {
        type: 'service',
        id: 'srv-001',
        name: 'Corte Masculino',
        quantity: 1,
        price: 35
      },
      {
        type: 'product',
        id: 'prod-001',
        name: 'Pomada Modeladora',
        quantity: 1,
        price: 45
      }
    ],
    total: 80,
    payment_method: 'credit_card',
    date: '2024-12-20',
    created_at: '2024-12-20T10:30:00Z'
  }
];

// Helper functions to simulate database operations
export class MockDatabase {
  private static nextId = 1000;

  static generateId(prefix: string): string {
    return `${prefix}-${String(this.nextId++).padStart(3, '0')}`;
  }

  // Clients
  static getClients(barbershop_id: string): MockClient[] {
    return mockClients.filter(client => client.barbershop_id === barbershop_id);
  }

  static getClientById(id: string): MockClient | undefined {
    return mockClients.find(client => client.id === id);
  }

  static createClient(data: Omit<MockClient, 'id' | 'total_visits' | 'total_spent' | 'created_at'>): MockClient {
    const newClient: MockClient = {
      ...data,
      id: this.generateId('cli'),
      total_visits: 0,
      total_spent: 0,
      created_at: new Date().toISOString()
    };
    mockClients.push(newClient);
    return newClient;
  }

  // Barbers
  static getBarbers(barbershop_id: string): MockBarber[] {
    return mockBarbers.filter(barber => barber.barbershop_id === barbershop_id);
  }

  static createBarber(data: Omit<MockBarber, 'id' | 'created_at'>): MockBarber {
    const newBarber: MockBarber = {
      ...data,
      id: this.generateId('bar'),
      created_at: new Date().toISOString()
    };
    mockBarbers.push(newBarber);
    return newBarber;
  }

  // Services
  static getServices(barbershop_id: string): MockService[] {
    return mockServices.filter(service => service.barbershop_id === barbershop_id);
  }

  static createService(data: Omit<MockService, 'id' | 'created_at'>): MockService {
    const newService: MockService = {
      ...data,
      id: this.generateId('srv'),
      created_at: new Date().toISOString()
    };
    mockServices.push(newService);
    return newService;
  }

  // Products
  static getProducts(barbershop_id: string): MockProduct[] {
    return mockProducts.filter(product => product.barbershop_id === barbershop_id);
  }

  static createProduct(data: Omit<MockProduct, 'id' | 'created_at'>): MockProduct {
    const newProduct: MockProduct = {
      ...data,
      id: this.generateId('prod'),
      created_at: new Date().toISOString()
    };
    mockProducts.push(newProduct);
    return newProduct;
  }

  // Appointments
  static getAppointments(barbershop_id: string): MockAppointment[] {
    return mockAppointments.filter(appointment => appointment.barbershop_id === barbershop_id);
  }

  static createAppointment(data: Omit<MockAppointment, 'id' | 'created_at'>): MockAppointment {
    const newAppointment: MockAppointment = {
      ...data,
      id: this.generateId('apt'),
      created_at: new Date().toISOString()
    };
    mockAppointments.push(newAppointment);
    return newAppointment;
  }

  // Sales
  static getSales(barbershop_id: string): MockSale[] {
    return mockSales.filter(sale => sale.barbershop_id === barbershop_id);
  }

  static createSale(data: Omit<MockSale, 'id' | 'created_at'>): MockSale {
    const newSale: MockSale = {
      ...data,
      id: this.generateId('sale'),
      created_at: new Date().toISOString()
    };
    mockSales.push(newSale);
    return newSale;
  }
}