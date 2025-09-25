export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'admin' | 'barber' | 'client';
  avatar?: string;
  created_at: Date;
  updated_at: Date;
  active: boolean;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'admin' | 'barber' | 'client';
  avatar?: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  phone?: string;
  avatar?: string;
  active?: boolean;
}