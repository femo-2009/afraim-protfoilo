CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;

DROP POLICY IF EXISTS "profile admin update" ON public.profile;
CREATE POLICY "profile admin update"
ON public.profile
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "profile admin insert" ON public.profile;
CREATE POLICY "profile admin insert"
ON public.profile
FOR INSERT
TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "skills admin all" ON public.skills;
CREATE POLICY "skills admin all"
ON public.skills
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "certs admin all" ON public.certificates;
CREATE POLICY "certs admin all"
ON public.certificates
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "projects admin all" ON public.projects;
CREATE POLICY "projects admin all"
ON public.projects
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "portfolio public read" ON storage.objects;
DROP POLICY IF EXISTS "portfolio admin write" ON storage.objects;
DROP POLICY IF EXISTS "portfolio admin update" ON storage.objects;
DROP POLICY IF EXISTS "portfolio admin delete" ON storage.objects;

CREATE POLICY "portfolio admin write"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio' AND private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "portfolio admin update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio' AND private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (bucket_id = 'portfolio' AND private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "portfolio admin delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio' AND private.has_role(auth.uid(), 'admin'::public.app_role));