
-- Add open INSERT policy on organizations for all authenticated users
CREATE POLICY "Authenticated can insert organizations"
ON public.organizations FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add open UPDATE policy on organizations for all authenticated users
CREATE POLICY "Authenticated can update organizations"
ON public.organizations FOR UPDATE
TO authenticated
USING (true);

-- Add open INSERT policy on departments for all authenticated users
CREATE POLICY "Authenticated can insert departments"
ON public.departments FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add open UPDATE policy on departments for all authenticated users
CREATE POLICY "Authenticated can update departments"
ON public.departments FOR UPDATE
TO authenticated
USING (true);

-- Add open policies on attachments for all authenticated users
CREATE POLICY "Authenticated can read all attachments"
ON public.attachments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert attachments"
ON public.attachments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update attachments"
ON public.attachments FOR UPDATE
TO authenticated
USING (true);

-- Add open policies on logs for all authenticated users
CREATE POLICY "Authenticated can read all logs"
ON public.logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert logs"
ON public.logs FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update logs"
ON public.logs FOR UPDATE
TO authenticated
USING (true);

-- Add open policies on log_entries for all authenticated users
CREATE POLICY "Authenticated can read all log entries"
ON public.log_entries FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert log entries"
ON public.log_entries FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update log entries"
ON public.log_entries FOR UPDATE
TO authenticated
USING (true);

-- Add open policies on feedback for all authenticated users
CREATE POLICY "Authenticated can read all feedback"
ON public.feedback FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert feedback"
ON public.feedback FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add open policies on log_files for all authenticated users
CREATE POLICY "Authenticated can read all log files"
ON public.log_files FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert log files"
ON public.log_files FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add open policies on profiles for all authenticated users
CREATE POLICY "Authenticated can read all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Add open policies on user_roles for all authenticated users
CREATE POLICY "Authenticated can read all user roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (true);
