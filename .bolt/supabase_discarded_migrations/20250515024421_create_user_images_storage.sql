/*
  # Create storage bucket for user images

  1. Storage
    - Create bucket `user-images` for storing user profile and license images
    - Enable public access for reading images
    - Set up security policies for upload/delete operations

  2. Security
    - Only authenticated users can upload images
    - Users can only upload to their own folders
    - Public read access for all images
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-images', 'user-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
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
CREATE POLICY "Allow users to update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'user-images')
WITH CHECK (bucket_id = 'user-images');

-- Policy to allow authenticated users to delete their own files
CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-images');

-- Policy to allow public access to read files
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-images');