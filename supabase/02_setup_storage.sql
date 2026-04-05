-- Supabase Storage Setup for Resources
-- Run this SQL in your Supabase Dashboard > SQL Editor

-- 1. Create the resources bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, owner, created_at, updated_at)
VALUES ('resources', 'resources', true, null, now(), now())
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Policies for the resources bucket

-- Drop existing policies (if any) to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload resources" ON storage.objects;
DROP POLICY IF EXISTS "Public can read resources" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read resources" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own resources" ON storage.objects;

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Authenticated users can upload resources"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resources' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public to read all files in resources bucket
CREATE POLICY "Public can read resources"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'resources');

-- Allow authenticated users to read all files
CREATE POLICY "Authenticated users can read resources"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'resources');

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own resources"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'resources' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Ensure resources table has proper foreign key constraint
-- (Already exists in your schema)

-- All done! Your resources bucket is now ready for uploads.
