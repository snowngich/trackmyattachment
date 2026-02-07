
-- Allow students to create their own attachments (self-registration)
CREATE POLICY "Students can create own attachments"
ON public.attachments
FOR INSERT
WITH CHECK (student_id = auth.uid());

-- Add text fields for supervisor/lecturer names (filled by student before admin links accounts)
ALTER TABLE public.attachments ADD COLUMN IF NOT EXISTS supervisor_name text;
ALTER TABLE public.attachments ADD COLUMN IF NOT EXISTS lecturer_name text;
