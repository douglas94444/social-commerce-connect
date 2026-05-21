
-- Allow brand owners to insert orders (test orders) and sync logs for their brand
CREATE POLICY "Brand owners insert own orders" ON public.orders FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.brands b WHERE b.id = orders.brand_id AND b.user_id = auth.uid()));

CREATE POLICY "Brand owners insert own sync logs" ON public.sync_logs FOR INSERT
WITH CHECK (
  brand_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.brands b WHERE b.id = sync_logs.brand_id AND b.user_id = auth.uid())
);
