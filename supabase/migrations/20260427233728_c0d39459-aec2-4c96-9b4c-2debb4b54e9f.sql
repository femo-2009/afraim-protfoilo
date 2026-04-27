REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

DROP POLICY IF EXISTS "portfolio public read" ON storage.objects;
CREATE POLICY "portfolio public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio' AND auth.role() = 'authenticated' OR bucket_id = 'portfolio');