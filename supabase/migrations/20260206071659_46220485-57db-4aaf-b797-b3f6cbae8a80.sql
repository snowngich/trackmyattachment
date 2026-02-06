
-- Fix: Restrict coordinator log access to only their assigned attachments
DROP POLICY IF EXISTS "Admins and coordinators can read all logs" ON public.logs;

CREATE POLICY "Admins can read all logs"
ON public.logs
FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Coordinators can read assigned logs"
ON public.logs
FOR SELECT
TO authenticated
USING (
  is_coordinator() AND EXISTS (
    SELECT 1 FROM public.attachments
    WHERE attachments.id = logs.attachment_id
    AND attachments.coordinator_id = auth.uid()
  )
);
