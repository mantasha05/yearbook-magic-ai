
-- 1. Create profiles table for multi-user support
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  email text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS (permissive)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Fix projects RLS: Drop restrictive policies, recreate as permissive
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Fix project_sections RLS
DROP POLICY IF EXISTS "Users can view own sections" ON public.project_sections;
DROP POLICY IF EXISTS "Users can insert own sections" ON public.project_sections;
DROP POLICY IF EXISTS "Users can update own sections" ON public.project_sections;
DROP POLICY IF EXISTS "Users can delete own sections" ON public.project_sections;

CREATE POLICY "Users can view own sections"
  ON public.project_sections FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_sections.project_id
      AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own sections"
  ON public.project_sections FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_sections.project_id
      AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own sections"
  ON public.project_sections FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_sections.project_id
      AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own sections"
  ON public.project_sections FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_sections.project_id
      AND projects.user_id = auth.uid()
  ));

-- 5. Fix uploads RLS
DROP POLICY IF EXISTS "Users can view their own uploads" ON public.uploads;
DROP POLICY IF EXISTS "Users can insert their own uploads" ON public.uploads;
DROP POLICY IF EXISTS "Users can update their own uploads" ON public.uploads;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON public.uploads;

CREATE POLICY "Users can view their own uploads"
  ON public.uploads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploads"
  ON public.uploads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads"
  ON public.uploads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads"
  ON public.uploads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_sections_project_id ON public.project_sections(project_id);
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON public.uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_project_id ON public.uploads(project_id);
CREATE INDEX IF NOT EXISTS idx_project_sections_sort ON public.project_sections(project_id, sort_order);
