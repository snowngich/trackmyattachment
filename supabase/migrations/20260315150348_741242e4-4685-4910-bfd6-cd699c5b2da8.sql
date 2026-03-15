-- Allow authenticated users to read profiles of supervisors and coordinators (for dropdown population)
CREATE POLICY "Authenticated can read supervisor and coordinator profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = profiles.user_id
    AND ur.role IN ('supervisor', 'coordinator')
  )
);
