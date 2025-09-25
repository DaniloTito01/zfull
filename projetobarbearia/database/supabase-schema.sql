-- Sistema de Barbearia - Schema do Banco de Dados Supabase
-- Criado para suportar multi-tenant (múltiplas barbearias)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- =====================================================
-- 1. BARBEARIAS (Multi-tenant support)
-- =====================================================
CREATE TABLE barbershops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) UNIQUE,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    postal_code VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. BARBEIROS
-- =====================================================
CREATE TABLE barbers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    specialties TEXT[], -- Array de especialidades
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'vacation')),
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    work_schedule JSONB, -- Horários de trabalho por dia da semana
    hire_date DATE,
    address TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CLIENTES
-- =====================================================
CREATE TABLE clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    last_visit TIMESTAMP WITH TIME ZONE,
    total_visits INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'vip')),
    preferred_barber_id UUID REFERENCES barbers(id),
    notes TEXT,
    birth_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. SERVIÇOS
-- =====================================================
CREATE TABLE services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- Duração em minutos
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    total_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. PRODUTOS
-- =====================================================
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    brand VARCHAR(100),
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2), -- Custo de aquisição
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    sold_this_month INTEGER DEFAULT 0,
    sku VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. AGENDAMENTOS
-- =====================================================
CREATE TABLE appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id),
    client_name VARCHAR(255), -- Para clientes não cadastrados
    barber_id UUID NOT NULL REFERENCES barbers(id),
    service_id UUID NOT NULL REFERENCES services(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INTEGER NOT NULL, -- Duração em minutos
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    price DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. VENDAS (Cabeçalho da venda)
-- =====================================================
CREATE TABLE sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    barbershop_id UUID NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id),
    client_name VARCHAR(255), -- Para clientes não cadastrados
    barber_id UUID NOT NULL REFERENCES barbers(id),
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    sale_time TIME NOT NULL DEFAULT CURRENT_TIME,
    subtotal DECIMAL(10,2) DEFAULT 0, -- Total dos serviços
    products_total DECIMAL(10,2) DEFAULT 0, -- Total dos produtos
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'card', 'pix', 'transfer')),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled', 'refunded')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. ITENS DA VENDA (Serviços vendidos)
-- =====================================================
CREATE TABLE sale_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id),
    service_name VARCHAR(255) NOT NULL, -- Snapshot do nome na época da venda
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. PRODUTOS VENDIDOS
-- =====================================================
CREATE TABLE sale_products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL, -- Snapshot do nome na época da venda
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Barbeiros
CREATE INDEX idx_barbers_barbershop ON barbers(barbershop_id);
CREATE INDEX idx_barbers_status ON barbers(status);

-- Clientes
CREATE INDEX idx_clients_barbershop ON clients(barbershop_id);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_email ON clients(email);

-- Serviços
CREATE INDEX idx_services_barbershop ON services(barbershop_id);
CREATE INDEX idx_services_active ON services(is_active);

-- Produtos
CREATE INDEX idx_products_barbershop ON products(barbershop_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_category ON products(category);

-- Agendamentos
CREATE INDEX idx_appointments_barbershop ON appointments(barbershop_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_barber ON appointments(barber_id);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Vendas
CREATE INDEX idx_sales_barbershop ON sales(barbershop_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_barber ON sales(barber_id);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_barbershops_updated_at BEFORE UPDATE ON barbershops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON barbers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGERS PARA ESTATÍSTICAS AUTOMÁTICAS
-- =====================================================

-- Atualizar total_visits e total_spent do cliente após venda
CREATE OR REPLACE FUNCTION update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.client_id IS NOT NULL THEN
        UPDATE clients
        SET
            total_visits = (
                SELECT COUNT(*)
                FROM sales
                WHERE client_id = NEW.client_id AND status = 'completed'
            ),
            total_spent = (
                SELECT COALESCE(SUM(total), 0)
                FROM sales
                WHERE client_id = NEW.client_id AND status = 'completed'
            ),
            last_visit = NEW.sale_date
        WHERE id = NEW.client_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_client_stats_trigger
    AFTER INSERT OR UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_client_stats();

-- Atualizar estoque de produtos após venda
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_stock_trigger
    AFTER INSERT ON sale_products
    FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- =====================================================
-- DADOS INICIAIS DE EXEMPLO
-- =====================================================

-- Inserir barbearia exemplo
INSERT INTO barbershops (id, name, email, phone, address, city, state) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'BarberShop Pro', 'contato@barbershop.com', '(11) 99999-9999', 'Rua das Barbearias, 123', 'São Paulo', 'SP');

-- Inserir barbeiros exemplo
INSERT INTO barbers (barbershop_id, name, email, phone, specialties, work_schedule) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Carlos Silva', 'carlos@barbershop.com', '(11) 99888-7777',
 ARRAY['Corte Masculino', 'Barba', 'Bigode'],
 '{"monday": {"start": "08:00", "end": "18:00"}, "tuesday": {"start": "08:00", "end": "18:00"}}'),

('550e8400-e29b-41d4-a716-446655440000', 'Rafael Santos', 'rafael@barbershop.com', '(11) 99777-6666',
 ARRAY['Corte Infantil', 'Corte Feminino', 'Coloração'],
 '{"monday": {"start": "09:00", "end": "19:00"}, "tuesday": {"start": "09:00", "end": "19:00"}}');

-- Inserir serviços exemplo
INSERT INTO services (barbershop_id, name, description, duration, price, category) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Corte Masculino', 'Corte tradicional masculino', 30, 50.00, 'Corte'),
('550e8400-e29b-41d4-a716-446655440000', 'Barba', 'Aparar e modelar barba', 20, 35.00, 'Barba'),
('550e8400-e29b-41d4-a716-446655440000', 'Corte + Barba', 'Combo completo', 45, 70.00, 'Combo'),
('550e8400-e29b-41d4-a716-446655440000', 'Corte Infantil', 'Corte para crianças até 12 anos', 25, 35.00, 'Corte');

-- Inserir produtos exemplo
INSERT INTO products (barbershop_id, name, description, brand, category, price, cost, stock, min_stock) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Pomada Modeladora', 'Pomada premium para cabelo', 'BarberLine', 'Cabelo', 45.00, 25.00, 15, 5),
('550e8400-e29b-41d4-a716-446655440000', 'Óleo para Barba', 'Óleo hidratante para barba', 'BeardCare', 'Barba', 35.00, 18.00, 12, 5),
('550e8400-e29b-41d4-a716-446655440000', 'Shampoo Anticaspa', 'Shampoo medicinal anticaspa', 'CleanHair', 'Cabelo', 28.00, 15.00, 22, 8);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS para todas as tabelas
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_products ENABLE ROW LEVEL SECURITY;

-- Política básica: usuários só veem dados da sua barbearia
-- Nota: Isso seria personalizado baseado na autenticação do usuário
-- Por ora, permitir acesso total para desenvolvimento

CREATE POLICY "Allow all for development" ON barbershops FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON barbers FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON services FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON products FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON appointments FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON sales FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON sale_services FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON sale_products FOR ALL USING (true);