
-- Add supervisor_approved flag to logs for workflow control
ALTER TABLE public.logs ADD COLUMN IF NOT EXISTS supervisor_approved boolean NOT NULL DEFAULT false;

-- Add admin_approved flag to attachments so admin can activate from UI
-- (status column already exists, but we need admin to be able to update it)

-- Make organizations SELECT policy PERMISSIVE (currently RESTRICTIVE, blocking students)
DROP POLICY IF EXISTS "Anyone authenticated can read organizations" ON public.organizations;
CREATE POLICY "Anyone authenticated can read organizations"
ON public.organizations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage organizations" ON public.organizations;
CREATE POLICY "Admins can manage organizations"
ON public.organizations FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Make departments SELECT policy PERMISSIVE
DROP POLICY IF EXISTS "Anyone authenticated can read departments" ON public.departments;
CREATE POLICY "Anyone authenticated can read departments"
ON public.departments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;
CREATE POLICY "Admins can manage departments"
ON public.departments FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Allow admin to manage ALL attachments (update status etc)
DROP POLICY IF EXISTS "Admins can manage all attachments" ON public.attachments;
CREATE POLICY "Admins can manage all attachments"
ON public.attachments FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Allow admin to manage ALL logs
DROP POLICY IF EXISTS "Admins can read all logs" ON public.logs;
CREATE POLICY "Admins can manage all logs"
ON public.logs FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Allow supervisors to update logs (for supervisor_approved flag)
DROP POLICY IF EXISTS "Supervisors can update approved flag" ON public.logs;
CREATE POLICY "Supervisors can update approved flag"
ON public.logs FOR UPDATE TO authenticated
USING (is_supervisor_of_log(id));

-- Coordinator should see logs only after supervisor approval
DROP POLICY IF EXISTS "Coordinators can read assigned logs" ON public.logs;
CREATE POLICY "Coordinators can read approved assigned logs"
ON public.logs FOR SELECT TO authenticated
USING (
  is_coordinator() AND 
  supervisor_approved = true AND
  EXISTS (
    SELECT 1 FROM attachments 
    WHERE attachments.id = logs.attachment_id 
    AND attachments.coordinator_id = auth.uid()
  )
);

-- Coordinator log_entries: only see entries for approved logs
DROP POLICY IF EXISTS "Coordinators can read assigned log entries" ON public.log_entries;
CREATE POLICY "Coordinators can read approved log entries"
ON public.log_entries FOR SELECT TO authenticated
USING (
  is_coordinator() AND
  EXISTS (
    SELECT 1 FROM logs l
    JOIN attachments a ON l.attachment_id = a.id
    WHERE l.id = log_entries.log_id 
    AND l.supervisor_approved = true
    AND a.coordinator_id = auth.uid()
  )
);

-- Coordinator feedback: only on approved logs
DROP POLICY IF EXISTS "Coordinators can read feedback on assigned logs" ON public.feedback;
CREATE POLICY "Coordinators can read feedback on approved logs"
ON public.feedback FOR SELECT TO authenticated
USING (
  is_coordinator() AND
  EXISTS (
    SELECT 1 FROM logs l
    JOIN attachments a ON l.attachment_id = a.id
    WHERE l.id = feedback.log_id 
    AND l.supervisor_approved = true
    AND a.coordinator_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Coordinators can create feedback on assigned logs" ON public.feedback;
CREATE POLICY "Coordinators can create feedback on approved logs"
ON public.feedback FOR INSERT TO authenticated
WITH CHECK (
  is_coordinator() AND 
  author_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM logs l
    JOIN attachments a ON l.attachment_id = a.id
    WHERE l.id = feedback.log_id 
    AND l.supervisor_approved = true
    AND a.coordinator_id = auth.uid()
  )
);

-- Allow admin to read all profiles
DROP POLICY IF EXISTS "Admins and coordinators can read all profiles" ON public.profiles;
CREATE POLICY "Admins and coordinators can read all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (is_admin() OR is_coordinator());

-- Allow admin to read all user_roles  
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
CREATE POLICY "Admins can read all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (is_admin());

-- Allow admin delete on user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- Allow admin to manage all feedback
DROP POLICY IF EXISTS "Admins can manage all feedback" ON public.feedback;
CREATE POLICY "Admins can manage all feedback"
ON public.feedback FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- Enable realtime for logs so supervisor approvals show up
ALTER PUBLICATION supabase_realtime ADD TABLE public.logs;
