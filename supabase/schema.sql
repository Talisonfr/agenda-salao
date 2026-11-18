-- ==============================================================================
-- SCHEMA COMPLETO - AGENDA SALÃO BOUTIQUE (SUPABASE POSTGRESQL)
-- ==============================================================================

-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enums de Domínio
CREATE TYPE user_role AS ENUM ('PROPRIETARIA', 'PROFISSIONAL');
CREATE TYPE service_category AS ENUM ('CABELO', 'UNHAS', 'ESTETICA', 'SOBRANCELHA', 'OUTROS');
CREATE TYPE product_category AS ENUM ('COSMETICOS', 'SEMI_JOIAS', 'KITS_CAPILARES');
CREATE TYPE appointment_status AS ENUM (
  'PENDENTE_APROVACAO',
  'EM_NEGOCIACAO',
  'CONFIRMADO',
  'EM_ANDAMENTO',
  'CONCLUIDO',
  'CANCELADO',
  'RECUSADO'
);
CREATE TYPE payment_method AS ENUM ('PIX', 'CREDITO', 'DEBITO', 'DINHEIRO', 'PLANO_MENSAL');
CREATE TYPE plan_status AS ENUM ('PAGO', 'PENDENTE', 'ATRASADO');
CREATE TYPE stock_movement_type AS ENUM ('ENTRADA_COMPRA', 'SAIDA_VENDA', 'AJUSTE_MANUAL');

-- 3. Tabela de Perfis de Usuários (RBAC)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'PROFISSIONAL',
  commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 40.00, -- percentual padrão
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Tabela de Catálogo de Serviços
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category service_category NOT NULL DEFAULT 'CABELO',
  price NUMERIC(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  commission_percentage NUMERIC(5, 2) NOT NULL DEFAULT 40.00,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Tabela de Produtos de Revenda (Estoque Físico)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category product_category NOT NULL DEFAULT 'COSMETICOS',
  cost_price NUMERIC(10, 2) NOT NULL,
  sale_price NUMERIC(10, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 3,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Tabela de Clientes
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE, -- Chave de identificação via WhatsApp
  birth_date DATE,
  notes TEXT, -- Observações técnicas: colorações, histórico químico, alergias
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Tabela de Planos Mensais (Mensalistas)
CREATE TABLE monthly_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Ex: Pacote 4 Escovas / Mês
  monthly_fee NUMERIC(10, 2) NOT NULL,
  due_day INTEGER NOT NULL DEFAULT 10,
  total_sessions INTEGER NOT NULL DEFAULT 4,
  used_sessions INTEGER NOT NULL DEFAULT 0,
  status plan_status NOT NULL DEFAULT 'PENDENTE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Tabela de Agendamentos (Appointments)
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  professional_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Null se "Sem Preferência"
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status appointment_status NOT NULL DEFAULT 'PENDENTE_APROVACAO',
  negotiation_notes TEXT, -- Histórico de contrapropostas
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Itens do Agendamento / Comanda (Serviços + Produtos Vendidos Juntos)
CREATE TABLE appointment_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('SERVICE', 'PRODUCT')),
  service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  professional_commission_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- 10. Tabela de Transações Financeiras (Caixa / Checkout)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  installments INTEGER DEFAULT 1,
  card_fee_percentage NUMERIC(5, 2) DEFAULT 0.00,
  net_amount NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('SERVICO_CHECKOUT', 'VENDA_AVULSA', 'MENSALIDADE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. Movimentações de Estoque (Auditoria)
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_change INTEGER NOT NULL, -- Negativo para saídas, positivo para entradas
  movement_type stock_movement_type NOT NULL,
  reference_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ÍNDICES PARA ALTA PERFORMANCE
-- ==============================================================================
CREATE INDEX idx_appointments_date_status ON appointments (scheduled_date, status);
CREATE INDEX idx_appointments_customer ON appointments (customer_id);
CREATE INDEX idx_appointments_professional ON appointments (professional_id);
CREATE INDEX idx_customers_phone ON customers (phone);
CREATE INDEX idx_products_stock ON products (stock_quantity, min_stock);
CREATE INDEX idx_transactions_created_at ON transactions (created_at);

-- ==============================================================================
-- TRIGGERS E FUNÇÕES AUTOMATIZADAS
-- ==============================================================================

-- Atualização automática de updated_at em appointments
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Baixa automática de estoque quando produto é adicionado na comanda
CREATE OR REPLACE FUNCTION trigger_deduct_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.item_type = 'PRODUCT' AND NEW.product_id IS NOT NULL THEN
    -- Reduz estoque físico
    UPDATE products
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;

    -- Registra movimentação de auditoria
    INSERT INTO stock_movements (product_id, quantity_change, movement_type, notes)
    VALUES (NEW.product_id, -NEW.quantity, 'SAIDA_VENDA', 'Venda realizada na comanda ' || NEW.appointment_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_deduct_stock
AFTER INSERT ON appointment_items
FOR EACH ROW
EXECUTE FUNCTION trigger_deduct_product_stock();

-- View para alerta rápido de produtos com estoque baixo
CREATE OR REPLACE VIEW vw_low_stock_products AS
SELECT id, name, category, stock_quantity, min_stock, sale_price
FROM products
WHERE stock_quantity <= min_stock AND active = true;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Serviços e Produtos: Leitura pública para catálogo do agendamento
CREATE POLICY "Public Read Active Services" ON services
  FOR SELECT USING (active = true);

CREATE POLICY "Public Read Active Products" ON products
  FOR SELECT USING (active = true);

-- Clientes: Permitir criação pública no momento do agendamento
CREATE POLICY "Public Insert Customers" ON customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Customers By Phone" ON customers
  FOR SELECT USING (true);

-- Agendamentos: Permitir inserção de novas solicitações públicas
CREATE POLICY "Public Insert Appointments" ON appointments
  FOR INSERT WITH CHECK (status = 'PENDENTE_APROVACAO');

-- Proprietária: Acesso irrestrito a todas as tabelas
CREATE POLICY "Proprietaria Full Access Profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'PROPRIETARIA')
  );

CREATE POLICY "Proprietaria Full Access Services" ON services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'PROPRIETARIA')
  );

CREATE POLICY "Proprietaria Full Access Products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'PROPRIETARIA')
  );

CREATE POLICY "Proprietaria Full Access Customers" ON customers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'PROPRIETARIA')
  );

CREATE POLICY "Proprietaria Full Access Plans" ON monthly_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'PROPRIETARIA')
  );

CREATE POLICY "Proprietaria Full Access Appointments" ON appointments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'PROPRIETARIA')
  );

CREATE POLICY "Proprietaria Full Access Items" ON appointment_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'PROPRIETARIA')
  );

CREATE POLICY "Proprietaria Full Access Transactions" ON transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'PROPRIETARIA')
  );

CREATE POLICY "Proprietaria Full Access Stock" ON stock_movements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'PROPRIETARIA')
  );

-- Profissionais: Leitura da própria agenda
CREATE POLICY "Profissional View Own Appointments" ON appointments
  FOR SELECT USING (
    professional_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'PROPRIETARIA')
  );

CREATE POLICY "Profissional Update Own Appointments Status" ON appointments
  FOR UPDATE USING (
    professional_id = auth.uid()
  ) WITH CHECK (
    status IN ('EM_ANDAMENTO', 'CONCLUIDO')
  );
