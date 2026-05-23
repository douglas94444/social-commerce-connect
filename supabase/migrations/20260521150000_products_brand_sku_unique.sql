
CREATE UNIQUE INDEX IF NOT EXISTS products_brand_sku_uidx
  ON public.products (brand_id, sku);
