
-- Add student registration number to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_reg_number text;

-- Create log_entries table for structured daily log entries
CREATE TABLE public.log_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  log_id uuid NOT NULL REFERENCES public.logs(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  time_from time,
  time_to time,
  activity text NOT NULL,
  problem_faced text,
  lesson_learnt text,
  supervisor_remarks text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_log_entries_log_id ON public.log_entries(log_id);

-- Enable RLS
ALTER TABLE public.log_entries ENABLE ROW LEVEL SECURITY;

-- Students can manage their own log entries (via log ownership)
CREATE POLICY "Students can manage own log entries"
ON public.log_entries
FOR ALL
USING (public.is_log_owner(log_id))
WITH CHECK (public.is_log_owner(log_id));

-- Supervisors can read log entries for logs they supervise
CREATE POLICY "Supervisors can read assigned log entries"
ON public.log_entries
FOR SELECT
USING (public.is_supervisor_of_log(log_id));

-- Supervisors can update supervisor_remarks on assigned log entries
CREATE POLICY "Supervisors can update remarks on assigned entries"
ON public.log_entries
FOR UPDATE
USING (public.is_supervisor_of_log(log_id));

-- Coordinators can read log entries for their assigned attachments
CREATE POLICY "Coordinators can read assigned log entries"
ON public.log_entries
FOR SELECT
USING (
  public.is_coordinator() AND EXISTS (
    SELECT 1 FROM public.logs l
    JOIN public.attachments a ON l.attachment_id = a.id
    WHERE l.id = log_entries.log_id AND a.coordinator_id = auth.uid()
  )
);

-- Admins can manage all log entries
CREATE POLICY "Admins can manage all log entries"
ON public.log_entries
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_log_entries_updated_at
BEFORE UPDATE ON public.log_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
