-- Criação das tabelas do sistema de barbearia

-- Tabela de barbearias
CREATE TABLE IF NOT EXISTS barbershops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address JSONB NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    website VARCHAR(255),
    opening_hours JSONB NOT NULL,
    settings JSONB NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'barber', 'client')),
    avatar VARCHAR(500),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de barbeiros
CREATE TABLE IF NOT EXISTS barbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    specialties TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 0,
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    schedule JSONB,
    bio TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, barbershop_id)
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    preferences JSONB,
    loyalty_points INTEGER DEFAULT 0,
    total_visits INTEGER DEFAULT 0,
    last_visit TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_barbers_barbershop ON barbers(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_barbers_user ON barbers(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_services_barbershop ON services(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_barber ON appointments(barber_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_barbershops_updated_at BEFORE UPDATE ON barbershops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON barbers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();