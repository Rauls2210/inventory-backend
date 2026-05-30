-- ----------------------------------------------------------------------------
-- Inventory Management System — database schema
-- Idempotent: safe to run multiple times.
-- ----------------------------------------------------------------------------

-- Enum for inventory actions.
DO $$
BEGIN
  CREATE TYPE inventory_action AS ENUM ('ADD', 'DEDUCT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- Users -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  sku        TEXT NOT NULL UNIQUE,
  price      DOUBLE PRECISION NOT NULL,
  stock      INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inventory transactions (audit trail) ----------------------------------------
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id             SERIAL PRIMARY KEY,
  product_id     INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  action         inventory_action NOT NULL,
  quantity       INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock      INTEGER NOT NULL,
  created_by     INTEGER NOT NULL REFERENCES users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_id
  ON inventory_transactions(product_id);
