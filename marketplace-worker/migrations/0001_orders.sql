CREATE TABLE IF NOT EXISTS marketplace_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idempotency_key TEXT NOT NULL UNIQUE,
  paypal_order_id TEXT NOT NULL UNIQUE,
  paypal_capture_id TEXT UNIQUE,
  product_id TEXT NOT NULL,
  product_version TEXT NOT NULL,
  amount TEXT NOT NULL,
  currency TEXT NOT NULL CHECK (currency = 'USD'),
  status TEXT NOT NULL CHECK (status IN ('CREATED', 'APPROVED', 'COMPLETED', 'REFUNDED', 'REVERSED', 'DENIED')),
  reference TEXT NOT NULL UNIQUE,
  download_count INTEGER NOT NULL DEFAULT 0,
  last_downloaded_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS marketplace_orders_product_status
  ON marketplace_orders (product_id, product_version, status);

CREATE TABLE IF NOT EXISTS marketplace_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS marketplace_recovery_limits (
  rate_key TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS marketplace_recovery_expiry
  ON marketplace_recovery_limits (expires_at);
