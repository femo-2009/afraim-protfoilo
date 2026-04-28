GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

DROP POLICY IF EXISTS "portfolio public read" ON storage.objects;
CREATE POLICY "portfolio public read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'portfolio');