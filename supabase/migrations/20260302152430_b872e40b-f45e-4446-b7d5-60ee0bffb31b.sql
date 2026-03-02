-- Create storage bucket for yearbook uploads (10MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('yearbook-uploads', 'yearbook-uploads', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'yearbook-uploads');

-- Allow public read access to uploaded files
CREATE POLICY "Public read access for yearbook uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'yearbook-uploads');

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'yearbook-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create uploads tracking table
CREATE TABLE public.uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own uploads"
ON public.uploads FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploads"
ON public.uploads FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads"
ON public.uploads FOR DELETE TO authenticated
USING (auth.uid() = user_id);