
ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS tiktok_shop_cipher TEXT;
