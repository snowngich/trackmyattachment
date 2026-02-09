-- Fix RLS policies on attachments table - change from RESTRICTIVE to PERMISSIVE
-- Drop all existing policies and recreate as PERMISSIVE

DROP POLICY IF EXISTS "Admins can manage all attachments" ON public.attachments;
DROP POLICY IF EXISTS "Coordinators can create attachments" ON public.attachments;
DROP POLICY IF EXISTS "Coordinators can read assigned attachments" ON public.attachments;
DROP POLICY IF EXISTS "Coordinators can update own attachments" ON public.attachments;
DROP POLICY IF EXISTS "Students can create own attachments" ON public.attachments;
DROP POLICY IF EXISTS "Students can read own attachments" ON public.attachments;
DROP POLICY IF EXISTS "Supervisors can read assigned attachments" ON public.attachments;
DROP POLICY IF EXISTS "Supervisors can update assigned attachments" ON public.attachments;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Admins can manage all attachments"
ON public.attachments FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Coordinators can create attachments"
ON public.attachments FOR INSERT
WITH CHECK (is_coordinator() AND coordinator_id = auth.uid());

CREATE POLICY "Coordinators can read assigned attachments"
ON public.attachments FOR SELECT
USING (is_coordinator() AND coordinator_id = auth.uid());

CREATE POLICY "Coordinators can update own attachments"
ON public.attachments FOR UPDATE
USING (is_coordinator() AND coordinator_id = auth.uid());

CREATE POLICY "Students can create own attachments"
ON public.attachments FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can read own attachments"
ON public.attachments FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Supervisors can read assigned attachments"
ON public.attachments FOR SELECT
USING (supervisor_id = auth.uid());

CREATE POLICY "Supervisors can update assigned attachments"
ON public.attachments FOR UPDATE
USING (supervisor_id = auth.uid());

-- Also fix feedback, logs, log_entries, log_files policies to be PERMISSIVE
-- FEEDBACK
DROP POLICY IF EXISTS "Admins can manage all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Coordinators can create feedback on assigned logs" ON public.feedback;
DROP POLICY IF EXISTS "Coordinators can read feedback on assigned logs" ON public.feedback;
DROP POLICY IF EXISTS "Students can read feedback on own logs" ON public.feedback;
DROP POLICY IF EXISTS "Supervisors can create feedback" ON public.feedback;
DROP POLICY IF EXISTS "Supervisors can read and create feedback" ON public.feedback;

CREATE POLICY "Admins can manage all feedback" ON public.feedback FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Coordinators can create feedback on assigned logs" ON public.feedback FOR INSERT WITH CHECK (is_coordinator() AND author_id = auth.uid() AND EXISTS (SELECT 1 FROM logs l JOIN attachments a ON l.attachment_id = a.id WHERE l.id = feedback.log_id AND a.coordinator_id = auth.uid()));
CREATE POLICY "Coordinators can read feedback on assigned logs" ON public.feedback FOR SELECT USING (is_coordinator() AND EXISTS (SELECT 1 FROM logs l JOIN attachments a ON l.attachment_id = a.id WHERE l.id = feedback.log_id AND a.coordinator_id = auth.uid()));
CREATE POLICY "Students can read feedback on own logs" ON public.feedback FOR SELECT USING (is_log_owner(log_id));
CREATE POLICY "Supervisors can create feedback" ON public.feedback FOR INSERT WITH CHECK (is_supervisor() AND author_id = auth.uid());
CREATE POLICY "Supervisors can read feedback" ON public.feedback FOR SELECT USING (author_id = auth.uid() OR is_supervisor_of_log(log_id));

-- LOGS
DROP POLICY IF EXISTS "Admins can read all logs" ON public.logs;
DROP POLICY IF EXISTS "Coordinators can read assigned logs" ON public.logs;
DROP POLICY IF EXISTS "Students can create logs" ON public.logs;
DROP POLICY IF EXISTS "Students can read own logs" ON public.logs;
DROP POLICY IF EXISTS "Students can update own unsubmitted logs" ON public.logs;
DROP POLICY IF EXISTS "Supervisors can read assigned logs" ON public.logs;

CREATE POLICY "Admins can read all logs" ON public.logs FOR SELECT USING (is_admin());
CREATE POLICY "Coordinators can read assigned logs" ON public.logs FOR SELECT USING (is_coordinator() AND EXISTS (SELECT 1 FROM attachments WHERE attachments.id = logs.attachment_id AND attachments.coordinator_id = auth.uid()));
CREATE POLICY "Students can create logs" ON public.logs FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM attachments WHERE attachments.id = logs.attachment_id AND attachments.student_id = auth.uid()));
CREATE POLICY "Students can read own logs" ON public.logs FOR SELECT USING (is_log_owner(id));
CREATE POLICY "Students can update own unsubmitted logs" ON public.logs FOR UPDATE USING (is_log_owner(id) AND submitted_at IS NULL);
CREATE POLICY "Supervisors can read assigned logs" ON public.logs FOR SELECT USING (is_supervisor_of_log(id));

-- LOG_ENTRIES
DROP POLICY IF EXISTS "Admins can manage all log entries" ON public.log_entries;
DROP POLICY IF EXISTS "Coordinators can read assigned log entries" ON public.log_entries;
DROP POLICY IF EXISTS "Students can manage own log entries" ON public.log_entries;
DROP POLICY IF EXISTS "Supervisors can read assigned log entries" ON public.log_entries;
DROP POLICY IF EXISTS "Supervisors can update remarks on assigned entries" ON public.log_entries;

CREATE POLICY "Admins can manage all log entries" ON public.log_entries FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Coordinators can read assigned log entries" ON public.log_entries FOR SELECT USING (is_coordinator() AND EXISTS (SELECT 1 FROM logs l JOIN attachments a ON l.attachment_id = a.id WHERE l.id = log_entries.log_id AND a.coordinator_id = auth.uid()));
CREATE POLICY "Students can manage own log entries" ON public.log_entries FOR ALL USING (is_log_owner(log_id)) WITH CHECK (is_log_owner(log_id));
CREATE POLICY "Supervisors can read assigned log entries" ON public.log_entries FOR SELECT USING (is_supervisor_of_log(log_id));
CREATE POLICY "Supervisors can update remarks on assigned entries" ON public.log_entries FOR UPDATE USING (is_supervisor_of_log(log_id));

-- LOG_FILES
DROP POLICY IF EXISTS "Admins can manage all log files" ON public.log_files;
DROP POLICY IF EXISTS "Students can manage own log files" ON public.log_files;
DROP POLICY IF EXISTS "Supervisors can read log files" ON public.log_files;

CREATE POLICY "Admins can manage all log files" ON public.log_files FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Students can manage own log files" ON public.log_files FOR ALL USING (is_log_owner(log_id)) WITH CHECK (is_log_owner(log_id));
CREATE POLICY "Supervisors can read log files" ON public.log_files FOR SELECT USING (is_supervisor_of_log(log_id));

-- DEPARTMENTS
DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;
DROP POLICY IF EXISTS "Anyone authenticated can read departments" ON public.departments;

CREATE POLICY "Admins can manage departments" ON public.departments FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Anyone authenticated can read departments" ON public.departments FOR SELECT USING (true);

-- ORGANIZATIONS
DROP POLICY IF EXISTS "Admins can manage organizations" ON public.organizations;
DROP POLICY IF EXISTS "Anyone authenticated can read organizations" ON public.organizations;

CREATE POLICY "Admins can manage organizations" ON public.organizations FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Anyone authenticated can read organizations" ON public.organizations FOR SELECT USING (true);

-- PROFILES
DROP POLICY IF EXISTS "Admins and coordinators can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Supervisors can read assigned students profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Admins and coordinators can read all profiles" ON public.profiles FOR SELECT USING (is_admin() OR is_coordinator());
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Supervisors can read assigned students profiles" ON public.profiles FOR SELECT USING (is_supervisor() AND EXISTS (SELECT 1 FROM attachments WHERE attachments.supervisor_id = auth.uid() AND attachments.student_id = profiles.user_id));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());

-- USER_ROLES
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can read all roles" ON public.user_roles FOR SELECT USING (is_admin());
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());