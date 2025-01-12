/*
  # Set up storage for image uploads

  1. Create storage bucket for images
  2. Set up storage policies for authenticated users
  3. Enable public access for viewing images
*/

-- Create a new storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] IN ('categories', 'subcategories', 'products')
);

-- Create storage policy to allow authenticated users to update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images' AND owner = auth.uid())
WITH CHECK (bucket_id = 'images' AND owner = auth.uid());

-- Create storage policy to allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND owner = auth.uid());

-- Create storage policy to allow public access to view images
CREATE POLICY "Public access to view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');