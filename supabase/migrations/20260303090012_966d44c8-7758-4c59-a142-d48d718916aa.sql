
-- Add metadata columns to projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS college text NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS batch text NOT NULL DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS department text NOT NULL DEFAULT '';
