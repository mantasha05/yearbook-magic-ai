
-- Add caption column to uploads table
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS caption text DEFAULT '';

-- Allow users to update their own uploads (for captions)
CREATE POLICY "Users can update their own uploads"
ON public.uploads
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
