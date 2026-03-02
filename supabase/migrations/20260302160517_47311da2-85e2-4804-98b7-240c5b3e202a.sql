
-- Projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Yearbook',
  template text NOT NULL DEFAULT 'vibrant',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Project sections table
CREATE TABLE public.project_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  title text NOT NULL,
  icon_name text NOT NULL DEFAULT 'MessageSquare',
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  content jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, section_key)
);

ALTER TABLE public.project_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sections" ON public.project_sections FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_sections.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can insert own sections" ON public.project_sections FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_sections.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update own sections" ON public.project_sections FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_sections.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete own sections" ON public.project_sections FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_sections.project_id AND projects.user_id = auth.uid()));

-- Add project_id to uploads table
ALTER TABLE public.uploads ADD COLUMN project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;
