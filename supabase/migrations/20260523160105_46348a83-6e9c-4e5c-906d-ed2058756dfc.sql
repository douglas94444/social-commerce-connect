
-- 1. Realtime: restrict channel subscriptions
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Brand owners subscribe to own brand topic" ON realtime.messages;
CREATE POLICY "Brand owners subscribe to own brand topic"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.brands b
    WHERE b.user_id = auth.uid()
      AND realtime.topic() = 'brand:' || b.id::text
  )
);

-- 2. user_roles: explicitly deny self-insert for non-admins
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
CREATE POLICY "Only admins can update roles"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;
CREATE POLICY "Only admins can delete roles"
ON public.user_roles
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Revoke EXECUTE on internal SECURITY DEFINER functions from PostgREST roles
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
-- has_role still needs to be callable by authenticated for RLS policies (RLS runs as the calling role)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
