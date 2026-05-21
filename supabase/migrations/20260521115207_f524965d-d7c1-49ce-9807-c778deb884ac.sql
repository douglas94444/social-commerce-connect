
-- Enum for order status
CREATE TYPE public.order_status AS ENUM (
  'pending',
  'awaiting_shipment',
  'label_generated',
  'shipped',
  'delivered',
  'cancelled',
  'failed'
);

-- Enum for sync log types
CREATE TYPE public.sync_log_type AS ENUM (
  'tiktok_oauth',
  'tiktok_product_sync',
  'tiktok_stock_sync',
  'tiktok_order_webhook',
  'tiktok_rts',
  'melhor_envio_quote',
  'melhor_envio_label',
  'email_notification'
);

CREATE TYPE public.sync_log_status AS ENUM ('success', 'error', 'pending');

-- PRODUCTS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  tiktok_product_id TEXT,
  sku TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  weight_grams INTEGER NOT NULL DEFAULT 0,
  length_cm NUMERIC(6,2) NOT NULL DEFAULT 0,
  width_cm NUMERIC(6,2) NOT NULL DEFAULT 0,
  height_cm NUMERIC(6,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (brand_id, sku)
);

CREATE INDEX idx_products_brand ON public.products(brand_id);
CREATE INDEX idx_products_tiktok ON public.products(tiktok_product_id);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brand owners view own products" ON public.products FOR SELECT
USING (EXISTS (SELECT 1 FROM public.brands b WHERE b.id = products.brand_id AND b.user_id = auth.uid()));
CREATE POLICY "Brand owners insert own products" ON public.products FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.brands b WHERE b.id = products.brand_id AND b.user_id = auth.uid()));
CREATE POLICY "Brand owners update own products" ON public.products FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.brands b WHERE b.id = products.brand_id AND b.user_id = auth.uid()));
CREATE POLICY "Brand owners delete own products" ON public.products FOR DELETE
USING (EXISTS (SELECT 1 FROM public.brands b WHERE b.id = products.brand_id AND b.user_id = auth.uid()));
CREATE POLICY "Admins view all products" ON public.products FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ORDERS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  tiktok_order_id TEXT NOT NULL,
  order_number TEXT,
  status public.order_status NOT NULL DEFAULT 'pending',
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  carrier TEXT,
  tracking_code TEXT,
  shipping_label_url TEXT,
  melhor_envio_order_id TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (brand_id, tiktok_order_id)
);

CREATE INDEX idx_orders_brand ON public.orders(brand_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brand owners view own orders" ON public.orders FOR SELECT
USING (EXISTS (SELECT 1 FROM public.brands b WHERE b.id = orders.brand_id AND b.user_id = auth.uid()));
CREATE POLICY "Brand owners update own orders" ON public.orders FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.brands b WHERE b.id = orders.brand_id AND b.user_id = auth.uid()));
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SYNC LOGS
CREATE TABLE public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  type public.sync_log_type NOT NULL,
  status public.sync_log_status NOT NULL,
  message TEXT,
  payload JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sync_logs_brand ON public.sync_logs(brand_id, created_at DESC);
CREATE INDEX idx_sync_logs_order ON public.sync_logs(order_id);

ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brand owners view own logs" ON public.sync_logs FOR SELECT
USING (brand_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.brands b WHERE b.id = sync_logs.brand_id AND b.user_id = auth.uid()));
CREATE POLICY "Admins view all logs" ON public.sync_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
