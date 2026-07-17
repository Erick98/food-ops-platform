-- ═══════════════════════════════════════════════════════════════════════════
--  Food-Ops Platform — Database Schema v2
--  Postgres + Supabase (RLS enabled)
--  Last updated: 2026-07-16
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── EXTENSIONS ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── TENANTS ──────────────────────────────────────────────────────────────────
-- One row per brand: Ito Café, Garnachaland, etc.
CREATE TABLE IF NOT EXISTS tenants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,   -- e.g. 'ito-cafe', 'garnachaland'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data (run once on fresh project)
INSERT INTO tenants (name, slug) VALUES
  ('Ito Café',       'ito-cafe'),
  ('Garnachaland',   'garnachaland')
ON CONFLICT (slug) DO NOTHING;

-- ─── PROFILES ─────────────────────────────────────────────────────────────────
-- Extends Supabase auth.users. Created automatically via trigger.
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  full_name   TEXT NOT NULL,
  email       TEXT,
  role        TEXT NOT NULL DEFAULT 'cashier'
                CHECK (role IN ('admin', 'manager', 'cashier', 'kitchen')),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup (role = cashier by default; admin must upgrade)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, tenant_id, full_name, email)
  VALUES (
    NEW.id,
    -- Tenant must be passed as user metadata during signup: { tenant_id: '...' }
    (NEW.raw_user_meta_data->>'tenant_id')::UUID,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── PRODUCTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category    TEXT NOT NULL,
  image_url   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(tenant_id, category);

-- ─── INVENTORY ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id),
  name           TEXT NOT NULL,
  unit           TEXT NOT NULL,        -- 'kg', 'L', 'pzs', 'g'
  quantity       NUMERIC(10,4) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_quantity   NUMERIC(10,4) NOT NULL DEFAULT 0,
  cost_per_unit  NUMERIC(10,4) NOT NULL DEFAULT 0,
  supplier       TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_tenant ON inventory_items(tenant_id);

-- ─── RECIPES ──────────────────────────────────────────────────────────────────
-- Links products to inventory for automatic stock deduction
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  inventory_item_id   UUID NOT NULL REFERENCES inventory_items(id),
  quantity_required   NUMERIC(10,4) NOT NULL CHECK (quantity_required > 0),
  UNIQUE (product_id, inventory_item_id)
);

-- ─── ORDERS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  profile_id      UUID NOT NULL REFERENCES profiles(id),
  total_amount    NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  tax_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','preparing','ready','closed','cancelled')),
  payment_method  TEXT NOT NULL
                    CHECK (payment_method IN ('cash','card','transfer')),
  -- table_id FK added after tables table is created (see ALTER below)
  table_id        UUID,
  table_number    TEXT,   -- deprecated; keep for backcompat
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- FK constraint added after tables table definition
-- ALTER TABLE orders ADD CONSTRAINT fk_orders_table FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_tenant_date ON orders(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(tenant_id, status);

-- ─── ORDER ITEMS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id),
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(10,2) NOT NULL,
  subtotal    NUMERIC(10,2) NOT NULL,
  notes       TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ─── MERMAS (WASTE LOG) ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mermas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  quantity_lost     NUMERIC(10,4) NOT NULL CHECK (quantity_lost > 0),
  cost_value        NUMERIC(10,2) NOT NULL,
  reason            TEXT,
  reported_by       UUID REFERENCES profiles(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mermas_tenant_date ON mermas(tenant_id, created_at DESC);

-- ─── PROMOTIONS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promotions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('pct_discount','fixed_discount','combo')),
  value         NUMERIC(10,2) NOT NULL,  -- % or MXN depending on type
  applies_to    JSONB,                   -- product_ids or category names
  time_from     TIME,                    -- e.g. '08:00'
  time_to       TIME,                    -- e.g. '11:00'
  valid_from    DATE,
  valid_until   DATE,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DAILY SALES SUMMARY VIEW (for Google Sheets sync) ───────────────────────
CREATE OR REPLACE VIEW sales_daily_summary AS
SELECT
  DATE(o.created_at)                        AS fecha,
  o.tenant_id,
  t.name                                    AS sucursal,
  COUNT(*)                                  AS total_ordenes,
  SUM(o.total_amount)                       AS ventas_totales,
  AVG(o.total_amount)                       AS ticket_promedio,
  SUM(CASE WHEN o.payment_method='cash'     THEN o.total_amount ELSE 0 END) AS efectivo,
  SUM(CASE WHEN o.payment_method='card'     THEN o.total_amount ELSE 0 END) AS tarjeta,
  SUM(CASE WHEN o.payment_method='transfer' THEN o.total_amount ELSE 0 END) AS transferencia,
  COUNT(CASE WHEN o.status='cancelled'      THEN 1 END) AS canceladas
FROM orders o
JOIN tenants t ON t.id = o.tenant_id
WHERE o.status = 'completed'
GROUP BY DATE(o.created_at), o.tenant_id, t.name
ORDER BY fecha DESC, t.name;

-- ─── RLS POLICIES ─────────────────────────────────────────────────────────────
-- Helper function: get the calling user's tenant_id
CREATE OR REPLACE FUNCTION auth_tenant_id()
RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid()
$$;

-- Enable RLS on all tables
ALTER TABLE tenants         ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE mermas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions      ENABLE ROW LEVEL SECURITY;

-- Tenants: each user sees only their tenant
CREATE POLICY "tenant_self" ON tenants FOR SELECT
  USING (id = auth_tenant_id());

-- Profiles: users see only their tenant's profiles
CREATE POLICY "profiles_tenant" ON profiles FOR ALL
  USING (tenant_id = auth_tenant_id());

-- Products
CREATE POLICY "products_tenant" ON products FOR ALL
  USING (tenant_id = auth_tenant_id());

-- Inventory
CREATE POLICY "inventory_tenant" ON inventory_items FOR ALL
  USING (tenant_id = auth_tenant_id());

-- Recipe ingredients (inherit product tenant)
CREATE POLICY "recipes_tenant" ON recipe_ingredients FOR ALL
  USING (
    product_id IN (SELECT id FROM products WHERE tenant_id = auth_tenant_id())
  );

-- Orders
CREATE POLICY "orders_tenant" ON orders FOR ALL
  USING (tenant_id = auth_tenant_id());

-- Order items (inherit order tenant)
CREATE POLICY "order_items_tenant" ON order_items FOR ALL
  USING (
    order_id IN (SELECT id FROM orders WHERE tenant_id = auth_tenant_id())
  );

-- Mermas
CREATE POLICY "mermas_tenant" ON mermas FOR ALL
  USING (tenant_id = auth_tenant_id());

-- Promotions
CREATE POLICY "promotions_tenant" ON promotions FOR ALL
  USING (tenant_id = auth_tenant_id());

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE TRIGGER trg_products_updated_at        BEFORE UPDATE ON products        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_inventory_updated_at       BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated_at          BEFORE UPDATE ON orders          FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── CASH SHIFTS (TURNOS DE CAJA) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cash_shifts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  opened_by       UUID NOT NULL REFERENCES profiles(id),
  closed_by       UUID REFERENCES profiles(id),
  opened_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at       TIMESTAMPTZ,
  starting_cash   NUMERIC(10,2) NOT NULL DEFAULT 0,
  expected_cash   NUMERIC(10,2),
  actual_cash     NUMERIC(10,2),
  difference      NUMERIC(10,2),
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'closed'))
);

CREATE INDEX IF NOT EXISTS idx_cash_shifts_tenant ON cash_shifts(tenant_id, status);

ALTER TABLE cash_shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cash_shifts_tenant" ON cash_shifts FOR ALL
  USING (tenant_id = auth_tenant_id());

-- ─── SUPPLIERS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  name            TEXT NOT NULL,
  contact_name    TEXT,
  phone           TEXT,
  email           TEXT,
  address         TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_tenant ON suppliers(tenant_id);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suppliers_tenant" ON suppliers FOR ALL
  USING (tenant_id = auth_tenant_id());

CREATE TRIGGER trg_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── PURCHASE ORDERS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  supplier_id     UUID NOT NULL REFERENCES suppliers(id),
  created_by      UUID NOT NULL REFERENCES profiles(id),
  total_amount    NUMERIC(10,2) NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'sent', 'received', 'cancelled')),
  notes           TEXT,
  expected_date   DATE,
  received_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant ON purchase_orders(tenant_id, status);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "purchase_orders_tenant" ON purchase_orders FOR ALL
  USING (tenant_id = auth_tenant_id());

CREATE TRIGGER trg_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── PURCHASE ORDER ITEMS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id   UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  inventory_item_id   UUID NOT NULL REFERENCES inventory_items(id),
  quantity            NUMERIC(10,4) NOT NULL CHECK (quantity > 0),
  unit_price          NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal            NUMERIC(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_po_items_po ON purchase_order_items(purchase_order_id);

ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "purchase_order_items_tenant" ON purchase_order_items FOR ALL
  USING (
    purchase_order_id IN (SELECT id FROM purchase_orders WHERE tenant_id = auth_tenant_id())
  );


-- ─── TABLES & ZONES (Gestión de Mesas) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tables (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  name            TEXT NOT NULL, -- e.g. "Mesa 1", "Barra 1"
  zone            TEXT NOT NULL, -- e.g. "Terraza", "Salón Principal"
  capacity        INTEGER NOT NULL DEFAULT 2,
  status          TEXT NOT NULL DEFAULT 'free'
                    CHECK (status IN ('free', 'occupied', 'dirty')),
  current_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tables_tenant_zone ON tables(tenant_id, zone);

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tables_tenant" ON tables FOR ALL
  USING (tenant_id = auth_tenant_id());

CREATE TRIGGER trg_tables_updated_at BEFORE UPDATE ON tables FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── POST-TABLES FK (orders → tables) ─────────────────────────────────────────
-- Run once after tables table exists. Safe to run multiple times (IF NOT EXISTS workaround).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_orders_table'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT fk_orders_table
      FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_id) WHERE table_id IS NOT NULL;

-- ─── CUSTOMERS (CRM / LOYALTY) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  first_name      TEXT NOT NULL,
  last_name       TEXT,
  email           TEXT,
  phone           TEXT,
  loyalty_points  INTEGER NOT NULL DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_tenant" ON customers FOR ALL
  USING (tenant_id = auth_tenant_id());

CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ALTER orders to optionally link to a customer
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

-- ─── INVOICES / FACTURACIÓN (CFDI stub) ──────────────────────────────────────
-- Stores billing data and CFDI-generation status for each order.
-- Actual CFDI emission is delegated to a third-party provider (e.g. Facturapi, SAT).
CREATE TABLE IF NOT EXISTS invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id       UUID REFERENCES customers(id) ON DELETE SET NULL,
  -- Fiscal data of the recipient (RFC, razon social, etc.)
  rfc               TEXT NOT NULL,
  razon_social      TEXT NOT NULL,
  uso_cfdi          TEXT NOT NULL DEFAULT 'G03',  -- G03 = Gastos generales
  regimen_fiscal    TEXT NOT NULL DEFAULT '616',  -- 616 = Sin obligaciones fiscales
  cfdi_uuid         TEXT UNIQUE,                  -- UUID returned by SAT/provider
  serie             TEXT,                         -- e.g. 'A'
  folio             INTEGER,
  subtotal          NUMERIC(10,2) NOT NULL,
  tax_amount        NUMERIC(10,2) NOT NULL DEFAULT 0,
  total             NUMERIC(10,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'MXN',
  status            TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft','sent','stamped','cancelled','error')),
  pdf_url           TEXT,
  xml_url           TEXT,
  error_message     TEXT,
  emitted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant_date ON invoices(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices_tenant" ON invoices FOR ALL
  USING (tenant_id = auth_tenant_id());

CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── ATTENDANCE / TIME CLOCK (Control de Asistencia) ──────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  profile_id      UUID NOT NULL REFERENCES profiles(id),
  clock_in        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clock_out       TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attendance_tenant_date ON attendance(tenant_id, clock_in DESC);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance_tenant" ON attendance FOR ALL
  USING (tenant_id = auth_tenant_id());

CREATE TRIGGER trg_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── PAYROLL SETTLEMENTS (Liquidaciones / Nómina) ─────────────────────────────
CREATE TABLE IF NOT EXISTS payroll_settlements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  profile_id      UUID NOT NULL REFERENCES profiles(id),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  total_hours     NUMERIC(10,2) NOT NULL DEFAULT 0,
  hourly_rate     NUMERIC(10,2) NOT NULL DEFAULT 0,
  base_pay        NUMERIC(10,2) NOT NULL DEFAULT 0,
  bonuses         NUMERIC(10,2) NOT NULL DEFAULT 0,
  deductions      NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_pay         NUMERIC(10,2) NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'approved', 'paid')),
  paid_at         TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payroll_tenant_date ON payroll_settlements(tenant_id, period_start DESC);

ALTER TABLE payroll_settlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payroll_settlements_tenant" ON payroll_settlements FOR ALL
  USING (tenant_id = auth_tenant_id());

CREATE TRIGGER trg_payroll_settlements_updated_at BEFORE UPDATE ON payroll_settlements FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- ==========================================
-- GASTOS OPERATIVOS (EXPENSES)
-- ==========================================
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL CHECK (category IN ('maintenance', 'services', 'supplies', 'petty_cash', 'other')),
    expense_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant expenses" 
    ON expenses FOR SELECT 
    USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert expenses for their tenant" 
    ON expenses FOR INSERT 
    WITH CHECK (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their tenant expenses" 
    ON expenses FOR UPDATE 
    USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- ─── RESERVATIONS (Reservaciones) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT,
  table_id        UUID REFERENCES tables(id) ON DELETE SET NULL,
  party_size      INTEGER NOT NULL DEFAULT 2,
  reservation_time TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'seated', 'cancelled', 'no_show')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_tenant_date ON reservations(tenant_id, reservation_time DESC);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reservations_tenant" ON reservations FOR ALL
  USING (tenant_id = auth_tenant_id());

CREATE TRIGGER trg_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── CHECKLISTS (Audits / Tareas Operativas) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS checklists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  title           TEXT NOT NULL,
  description     TEXT,
  frequency       TEXT NOT NULL DEFAULT 'daily'
                    CHECK (frequency IN ('daily', 'weekly', 'monthly', 'opening', 'closing', 'custom')),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklists_tenant ON checklists(tenant_id);

ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklists_tenant" ON checklists FOR ALL USING (tenant_id = auth_tenant_id());
CREATE TRIGGER trg_checklists_updated_at BEFORE UPDATE ON checklists FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Items de Checklists
CREATE TABLE IF NOT EXISTS checklist_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id    UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  task_name       TEXT NOT NULL,
  is_required     BOOLEAN NOT NULL DEFAULT TRUE,
  order_index     INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_items_chk ON checklist_items(checklist_id);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklist_items_tenant" ON checklist_items FOR ALL
  USING (checklist_id IN (SELECT id FROM checklists WHERE tenant_id = auth_tenant_id()));

-- Logs (Registros de cumplimiento de checklist)
CREATE TABLE IF NOT EXISTS checklist_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  checklist_id    UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  completed_by    UUID NOT NULL REFERENCES profiles(id),
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'completed'
                    CHECK (status IN ('completed', 'incomplete')),
  -- JSON store for individual item completion: { "item_id": true/false }
  items_state     JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_checklist_logs_tenant ON checklist_logs(tenant_id, completed_at DESC);

ALTER TABLE checklist_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklist_logs_tenant" ON checklist_logs FOR ALL USING (tenant_id = auth_tenant_id());

-- ─── DELIVERY PLATFORMS (Integraciones) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS delivery_platforms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  name            TEXT NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  api_key         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_platforms_tenant ON delivery_platforms(tenant_id);

ALTER TABLE delivery_platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "delivery_platforms_tenant" ON delivery_platforms FOR ALL
  USING (tenant_id = auth_tenant_id());

CREATE TRIGGER trg_delivery_platforms_updated_at BEFORE UPDATE ON delivery_platforms FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_platform_id UUID REFERENCES delivery_platforms(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS external_order_id TEXT;

-- ─── BRANCH SETTINGS (Configuración por Sucursal) ────────────────────────────
-- Stores operational config per tenant: hours, IVA, printer, etc.
CREATE TABLE IF NOT EXISTS branch_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL UNIQUE REFERENCES tenants(id),
  -- Fiscal
  iva_rate              NUMERIC(5,2) NOT NULL DEFAULT 16.00,
  include_iva_in_price  BOOLEAN NOT NULL DEFAULT FALSE,
  rfc                   TEXT,
  razon_social          TEXT,
  regimen_fiscal        TEXT DEFAULT '616',
  -- Hours
  open_time             TIME DEFAULT '08:00',
  close_time            TIME DEFAULT '22:00',
  days_open             TEXT[] DEFAULT ARRAY['Mon','Tue','Wed','Thu','Fri','Sat'],
  -- Operational
  currency              TEXT NOT NULL DEFAULT 'MXN',
  ticket_footer         TEXT DEFAULT 'Gracias por su visita.',
  print_logo            BOOLEAN NOT NULL DEFAULT TRUE,
  printer_ip            TEXT,
  -- Social / contact
  phone                 TEXT,
  address               TEXT,
  website               TEXT,
  instagram             TEXT,
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE branch_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "branch_settings_tenant" ON branch_settings FOR ALL
  USING (tenant_id = auth_tenant_id());

CREATE TRIGGER trg_branch_settings_updated_at
  BEFORE UPDATE ON branch_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==========================================
-- 20. SALES GOALS (Metas de Ventas y KPIs)
-- ==========================================
CREATE TABLE sales_goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  target_sales numeric(10,2) NOT NULL DEFAULT 0,
  target_orders integer NOT NULL DEFAULT 0,
  target_ticket_average numeric(10,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE sales_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenants can manage their own sales goals"
  ON sales_goals FOR ALL
  USING (tenant_id = (current_setting('app.current_tenant_id'))::uuid);
