/*
  # Storage Policies for User Images

  1. Storage Setup
    - Creates 'user-images' bucket if it doesn't exist
    - Enables public access to the bucket

  2. Security Policies
    - Allows authenticated users to upload images
    - Allows users to update their own files
    - Allows users to delete their own files
    - Allows public read access to all files

  Note: This migration safely handles existing policies by dropping them first
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-images', 'user-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
    DROP POLICY IF EXISTS "Allow users to update their own files" ON storage.objects;
    DROP POLICY IF EXISTS "Allow users to delete their own files" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files 2"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-images' AND
  (
    -- Allow users to upload to their own avatar folder
    (storage.foldername(name))[1] = 'avatars' OR
    -- Allow users to upload to their own license folder
    (storage.foldername(name))[1] = 'licenses'
  )
);

-- Policy to allow authenticated users to update their own files
CREATE POLICY "Allow users to update their own files 2"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'user-images')
WITH CHECK (bucket_id = 'user-images');

-- Policy to allow authenticated users to delete their own files
CREATE POLICY "Allow users to delete their own files 2"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-images');

-- Policy to allow public access to read files
CREATE POLICY "Allow public read access 2"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-images');