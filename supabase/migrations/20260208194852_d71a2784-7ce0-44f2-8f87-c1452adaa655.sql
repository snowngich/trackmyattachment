
-- Allow coordinators to read feedback on logs from their assigned students
CREATE POLICY "Coordinators can read feedback on assigned logs"
ON public.feedback
FOR SELECT
USING (
  is_coordinator() AND EXISTS (
    SELECT 1
    FROM logs l
    JOIN attachments a ON l.attachment_id = a.id
    WHERE l.id = feedback.log_id
      AND a.coordinator_id = auth.uid()
  )
);

-- Allow coordinators to create feedback on logs from their assigned students
CREATE POLICY "Coordinators can create feedback on assigned logs"
ON public.feedback
FOR INSERT
WITH CHECK (
  is_coordinator()
  AND author_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM logs l
    JOIN attachments a ON l.attachment_id = a.id
    WHERE l.id = log_id
      AND a.coordinator_id = auth.uid()
  )
);
