-- ===============================================
-- SISTEMA DE BARBEARIA - SCHEMA COMPLETO
-- ===============================================

-- Extension para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================================
-- 1. TABELA BARBEARIAS
-- ===============================================
CREATE TABLE IF NOT EXISTS barbershops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    logo_url TEXT,
    address JSONB,
    phone VARCHAR(20),
    email VARCHAR(255),
    plan_id VARCHAR(50) DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    owner_id UUID,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===============================================
-- 2. TABELA CLIENTES
-- ===============================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    birth_date DATE,
    address TEXT,
    preferred_barber_id UUID,
    client_since DATE DEFAULT CURRENT_DATE,
    total_visits INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, vip
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===============================================
-- 3. TABELA BARBEIROS
-- ===============================================
CREATE TABLE IF NOT EXISTS barbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
    user_id UUID, -- para futuro sistema de auth
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    photo_url TEXT,
    specialty TEXT[],
    commission_rate DECIMAL(5,2) DEFAULT 50.00,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, vacation
    hire_date DATE DEFAULT CURRENT_DATE,
    working_hours JSONB DEFAULT '{"monday":{"start":"09:00","end":"18:00","active":true},"tuesday":{"start":"09:00","end":"18:00","active":true},"wednesday":{"start":"09:00","end":"18:00","active":true},"thursday":{"start":"09:00","end":"18:00","active":true},"friday":{"start":"09:00","end":"18:00","active":true},"saturday":{"start":"09:00","end":"17:00","active":true},"sunday":{"start":"09:00","end":"15:00","active":false}}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===============================================
-- 4. TABELA SERVIÇOS
-- ===============================================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'corte',
    duration INTEGER NOT NULL, -- em minutos
    price DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 50.00,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===============================================
-- 5. TABELA PRODUTOS
-- ===============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'outros',
    brand VARCHAR(100),
    barcode VARCHAR(50),
    cost_price DECIMAL(10,2) DEFAULT 0,
    sell_price DECIMAL(10,2) NOT NULL,
    current_stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===============================================
-- 6. TABELA AGENDAMENTOS
-- ===============================================
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INTEGER NOT NULL, -- em minutos
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, confirmed, in_progress, completed, cancelled
    price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===============================================
-- 7. TABELA VENDAS
-- ===============================================
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    barber_id UUID REFERENCES barbers(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    sale_date TIMESTAMP DEFAULT NOW(),
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cash', -- cash, card, pix
    status VARCHAR(20) DEFAULT 'completed', -- pending, completed, cancelled
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===============================================
-- 8. TABELA ITENS DA VENDA
-- ===============================================
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL, -- service, product
    item_id UUID NOT NULL, -- service_id ou product_id
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===============================================
-- 9. TABELA MOVIMENTAÇÕES DE ESTOQUE
-- ===============================================
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL, -- in, out, adjustment
    quantity INTEGER NOT NULL,
    reason VARCHAR(255),
    reference_id UUID, -- sale_id, purchase_id, etc
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===============================================
-- 10. TABELA SERVIÇOS DOS BARBEIROS (RELAÇÃO N:N)
-- ===============================================
CREATE TABLE IF NOT EXISTS barber_services (
    barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (barber_id, service_id)
);

-- ===============================================
-- ÍNDICES PARA PERFORMANCE
-- ===============================================
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_barber ON appointments(barber_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_barbershop ON appointments(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_barbershop ON sales(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_barbershop ON clients(barbershop_id);

-- ===============================================
-- TRIGGER PARA UPDATED_AT
-- ===============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_barbershops_updated_at BEFORE UPDATE ON barbershops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON barbers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- DADOS INICIAIS DE EXEMPLO
-- ===============================================

-- Inserir barbearias
INSERT INTO barbershops (name, slug, address, phone, email, plan_id, is_active) VALUES
('Barbearia Clássica', 'barbearia-classica',
 '{"street":"Rua das Flores, 123","city":"São Paulo","state":"SP","zipCode":"01234-567"}',
 '(11) 99999-9999', 'contato@barbeariaclassica.com', 'premium', true),
('Corte & Estilo', 'corte-estilo',
 '{"street":"Av. Paulista, 456","city":"São Paulo","state":"SP","zipCode":"01310-100"}',
 '(11) 88888-8888', 'contato@corteestilo.com', 'basic', true)
ON CONFLICT (slug) DO NOTHING;

-- Inserir barbeiros
INSERT INTO barbers (barbershop_id, name, phone, email, specialty, commission_rate, status)
SELECT
    bb.id,
    'João Silva',
    '(11) 97777-7777',
    'joao@barbeariaclassica.com',
    ARRAY['corte masculino', 'barba'],
    60.00,
    'active'
FROM barbershops bb WHERE bb.slug = 'barbearia-classica'
ON CONFLICT DO NOTHING;

INSERT INTO barbers (barbershop_id, name, phone, email, specialty, commission_rate, status)
SELECT
    bb.id,
    'Pedro Santos',
    '(11) 96666-6666',
    'pedro@barbeariaclassica.com',
    ARRAY['corte moderno', 'design'],
    55.00,
    'active'
FROM barbershops bb WHERE bb.slug = 'barbearia-classica'
ON CONFLICT DO NOTHING;

-- Inserir serviços
INSERT INTO services (barbershop_id, name, description, category, duration, price, commission_rate)
SELECT
    bb.id,
    'Corte Masculino',
    'Corte tradicional masculino',
    'corte',
    30,
    25.00,
    50.00
FROM barbershops bb WHERE bb.slug = 'barbearia-classica'
ON CONFLICT DO NOTHING;

INSERT INTO services (barbershop_id, name, description, category, duration, price, commission_rate)
SELECT
    bb.id,
    'Barba Completa',
    'Aparar e modelar barba',
    'barba',
    20,
    15.00,
    50.00
FROM barbershops bb WHERE bb.slug = 'barbearia-classica'
ON CONFLICT DO NOTHING;

INSERT INTO services (barbershop_id, name, description, category, duration, price, commission_rate)
SELECT
    bb.id,
    'Corte + Barba',
    'Corte masculino + barba completa',
    'combo',
    45,
    35.00,
    55.00
FROM barbershops bb WHERE bb.slug = 'barbearia-classica'
ON CONFLICT DO NOTHING;

-- Inserir produtos
INSERT INTO products (barbershop_id, name, description, category, brand, cost_price, sell_price, current_stock, min_stock)
SELECT
    bb.id,
    'Pomada Modeladora',
    'Pomada para cabelo com fixação forte',
    'pomada',
    'Barber Line',
    8.00,
    15.00,
    50,
    10
FROM barbershops bb WHERE bb.slug = 'barbearia-classica'
ON CONFLICT DO NOTHING;

INSERT INTO products (barbershop_id, name, description, category, brand, cost_price, sell_price, current_stock, min_stock)
SELECT
    bb.id,
    'Shampoo Anti-Caspa',
    'Shampoo medicinal anti-caspa',
    'shampoo',
    'Clear Men',
    12.00,
    22.00,
    30,
    5
FROM barbershops bb WHERE bb.slug = 'barbearia-classica'
ON CONFLICT DO NOTHING;

-- Inserir clientes
INSERT INTO clients (barbershop_id, name, phone, email, birth_date, total_visits, total_spent, status)
SELECT
    bb.id,
    'Carlos Oliveira',
    '(11) 95555-5555',
    'carlos@email.com',
    '1985-03-15',
    15,
    375.00,
    'vip'
FROM barbershops bb WHERE bb.slug = 'barbearia-classica'
ON CONFLICT DO NOTHING;

INSERT INTO clients (barbershop_id, name, phone, email, birth_date, total_visits, total_spent, status)
SELECT
    bb.id,
    'Roberto Lima',
    '(11) 94444-4444',
    'roberto@email.com',
    '1990-07-22',
    8,
    200.00,
    'active'
FROM barbershops bb WHERE bb.slug = 'barbearia-classica'
ON CONFLICT DO NOTHING;

-- Inserir agendamentos (apenas os futuros)
INSERT INTO appointments (barbershop_id, client_id, barber_id, service_id, appointment_date, appointment_time, duration, status, price)
SELECT
    bb.id,
    c.id,
    b.id,
    s.id,
    CURRENT_DATE + INTERVAL '1 day',
    '14:00',
    30,
    'confirmed',
    25.00
FROM barbershops bb
JOIN clients c ON c.barbershop_id = bb.id AND c.name = 'Carlos Oliveira'
JOIN barbers b ON b.barbershop_id = bb.id AND b.name = 'João Silva'
JOIN services s ON s.barbershop_id = bb.id AND s.name = 'Corte Masculino'
WHERE bb.slug = 'barbearia-classica'
ON CONFLICT DO NOTHING;

-- ===============================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- ===============================================

-- View para métricas do dashboard
CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT
    bb.id as barbershop_id,
    bb.name as barbershop_name,
    (SELECT COUNT(*) FROM appointments a WHERE a.barbershop_id = bb.id AND a.appointment_date = CURRENT_DATE) as appointments_today,
    (SELECT COUNT(*) FROM clients c WHERE c.barbershop_id = bb.id AND c.status = 'active') as total_clients,
    (SELECT COUNT(*) FROM barbers b WHERE b.barbershop_id = bb.id AND b.status = 'active') as total_barbers,
    (SELECT COALESCE(SUM(s.total), 0) FROM sales s WHERE s.barbershop_id = bb.id AND DATE_TRUNC('month', s.sale_date) = DATE_TRUNC('month', CURRENT_DATE)) as revenue_month,
    (SELECT COALESCE(SUM(s.total), 0) FROM sales s WHERE s.barbershop_id = bb.id AND DATE(s.sale_date) = CURRENT_DATE) as revenue_today
FROM barbershops bb
WHERE bb.is_active = true;

-- View para agendamentos com detalhes
CREATE OR REPLACE VIEW appointments_detailed AS
SELECT
    a.id,
    a.barbershop_id,
    a.appointment_date,
    a.appointment_time,
    a.duration,
    a.status,
    a.price,
    a.notes,
    a.created_at,
    c.name as client_name,
    c.phone as client_phone,
    b.name as barber_name,
    s.name as service_name,
    s.category as service_category
FROM appointments a
JOIN clients c ON a.client_id = c.id
JOIN barbers b ON a.barber_id = b.id
JOIN services s ON a.service_id = s.id;

COMMIT;