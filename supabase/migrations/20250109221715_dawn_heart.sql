-- Drop existing storage policies
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Public access to view images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete images" ON storage.objects;

-- Create storage policy to allow admin users to upload images
CREATE POLICY "Admin users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
    AND is_super_admin = true
  )
);

-- Create storage policy to allow admin users to update images
CREATE POLICY "Admin users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
    AND is_super_admin = true
  )
)
WITH CHECK (
  bucket_id = 'images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
    AND is_super_admin = true
  )
);

-- Create storage policy to allow admin users to delete images
CREATE POLICY "Admin users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
    AND is_super_admin = true
  )
);

-- Create storage policy to allow public access to view images
CREATE POLICY "Public access to view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Ensure the images bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;