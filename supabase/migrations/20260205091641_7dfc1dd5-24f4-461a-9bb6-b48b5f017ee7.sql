-- Create enums
CREATE TYPE public.app_role AS ENUM ('student', 'supervisor', 'coordinator', 'admin');
CREATE TYPE public.organization_type AS ENUM ('university', 'company');
CREATE TYPE public.attachment_status AS ENUM ('pending', 'active', 'completed', 'rejected');

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type organization_type NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create departments table (for both universities and companies)
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  department_id UUID REFERENCES public.departments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create attachments table (student placements)
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.organizations(id),
  department_id UUID REFERENCES public.departments(id),
  supervisor_id UUID REFERENCES auth.users(id),
  coordinator_id UUID REFERENCES auth.users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status attachment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create weekly logs table
CREATE TABLE public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attachment_id UUID NOT NULL REFERENCES public.attachments(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id UUID NOT NULL REFERENCES public.logs(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Create log_files table to track uploaded files
CREATE TABLE public.log_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id UUID NOT NULL REFERENCES public.logs(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper function: Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper function: Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Helper function: Check if current user is coordinator
CREATE OR REPLACE FUNCTION public.is_coordinator()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'coordinator')
$$;

-- Helper function: Check if current user is supervisor
CREATE OR REPLACE FUNCTION public.is_supervisor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'supervisor')
$$;

-- Helper function: Check if current user is student
CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'student')
$$;

-- Helper function: Get user's profile
CREATE OR REPLACE FUNCTION public.get_user_profile(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = _user_id
$$;

-- Helper function: Check if user is supervisor of attachment
CREATE OR REPLACE FUNCTION public.is_supervisor_of_attachment(_attachment_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.attachments
    WHERE id = _attachment_id AND supervisor_id = auth.uid()
  )
$$;

-- Helper function: Check if user is coordinator of attachment
CREATE OR REPLACE FUNCTION public.is_coordinator_of_attachment(_attachment_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.attachments
    WHERE id = _attachment_id AND coordinator_id = auth.uid()
  )
$$;

-- Helper function: Check if user owns log (is student of the attachment)
CREATE OR REPLACE FUNCTION public.is_log_owner(_log_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.logs l
    JOIN public.attachments a ON l.attachment_id = a.id
    WHERE l.id = _log_id AND a.student_id = auth.uid()
  )
$$;

-- Helper function: Check if user is supervisor of log's attachment
CREATE OR REPLACE FUNCTION public.is_supervisor_of_log(_log_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.logs l
    JOIN public.attachments a ON l.attachment_id = a.id
    WHERE l.id = _log_id AND a.supervisor_id = auth.uid()
  )
$$;

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Anyone authenticated can read organizations"
ON public.organizations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage organizations"
ON public.organizations FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- RLS Policies for departments
CREATE POLICY "Anyone authenticated can read departments"
ON public.departments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage departments"
ON public.departments FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins and coordinators can read all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.is_admin() OR public.is_coordinator());

CREATE POLICY "Supervisors can read assigned students profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  public.is_supervisor() AND EXISTS (
    SELECT 1 FROM public.attachments
    WHERE attachments.supervisor_id = auth.uid()
    AND attachments.student_id = profiles.user_id
  )
);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- RLS Policies for user_roles
CREATE POLICY "Users can read own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can read all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- RLS Policies for attachments
CREATE POLICY "Students can read own attachments"
ON public.attachments FOR SELECT TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Supervisors can read assigned attachments"
ON public.attachments FOR SELECT TO authenticated
USING (supervisor_id = auth.uid());

CREATE POLICY "Coordinators can read assigned attachments"
ON public.attachments FOR SELECT TO authenticated
USING (coordinator_id = auth.uid());

CREATE POLICY "Admins can manage all attachments"
ON public.attachments FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Coordinators can create attachments"
ON public.attachments FOR INSERT TO authenticated
WITH CHECK (public.is_coordinator() AND coordinator_id = auth.uid());

CREATE POLICY "Coordinators can update own attachments"
ON public.attachments FOR UPDATE TO authenticated
USING (public.is_coordinator() AND coordinator_id = auth.uid());

CREATE POLICY "Supervisors can update assigned attachments"
ON public.attachments FOR UPDATE TO authenticated
USING (supervisor_id = auth.uid());

-- RLS Policies for logs
CREATE POLICY "Students can read own logs"
ON public.logs FOR SELECT TO authenticated
USING (public.is_log_owner(id));

CREATE POLICY "Supervisors can read assigned logs"
ON public.logs FOR SELECT TO authenticated
USING (public.is_supervisor_of_log(id));

CREATE POLICY "Admins and coordinators can read all logs"
ON public.logs FOR SELECT TO authenticated
USING (public.is_admin() OR public.is_coordinator());

CREATE POLICY "Students can create logs"
ON public.logs FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.attachments
    WHERE attachments.id = attachment_id
    AND attachments.student_id = auth.uid()
  )
);

CREATE POLICY "Students can update own unsubmitted logs"
ON public.logs FOR UPDATE TO authenticated
USING (public.is_log_owner(id) AND submitted_at IS NULL);

-- RLS Policies for feedback
CREATE POLICY "Students can read feedback on own logs"
ON public.feedback FOR SELECT TO authenticated
USING (public.is_log_owner(log_id));

CREATE POLICY "Supervisors can read and create feedback"
ON public.feedback FOR SELECT TO authenticated
USING (author_id = auth.uid() OR public.is_supervisor_of_log(log_id));

CREATE POLICY "Supervisors can create feedback"
ON public.feedback FOR INSERT TO authenticated
WITH CHECK (public.is_supervisor() AND author_id = auth.uid());

CREATE POLICY "Admins can manage all feedback"
ON public.feedback FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- RLS Policies for log_files
CREATE POLICY "Students can manage own log files"
ON public.log_files FOR ALL TO authenticated
USING (public.is_log_owner(log_id))
WITH CHECK (public.is_log_owner(log_id));

CREATE POLICY "Supervisors can read log files"
ON public.log_files FOR SELECT TO authenticated
USING (public.is_supervisor_of_log(log_id));

CREATE POLICY "Admins can manage all log files"
ON public.log_files FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Storage policies for documents bucket
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Supervisors can read student documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents' AND
  public.is_supervisor() AND
  EXISTS (
    SELECT 1 FROM public.attachments
    WHERE attachments.supervisor_id = auth.uid()
    AND attachments.student_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Admins can manage all documents"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'documents' AND public.is_admin())
WITH CHECK (bucket_id = 'documents' AND public.is_admin());

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attachments_updated_at
BEFORE UPDATE ON public.attachments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_logs_updated_at
BEFORE UPDATE ON public.logs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  -- Default role is student
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();