-- Allow all authenticated users to read supervisor and coordinator roles (needed for dropdown population)
CREATE POLICY "Authenticated can read supervisor and coordinator roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (role IN ('supervisor', 'coordinator'));
