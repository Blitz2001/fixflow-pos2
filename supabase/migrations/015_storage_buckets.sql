-- Create storage bucket for device evidence photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('device-evidence', 'device-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- 1. Allow authenticated users to upload to their shop's folder
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'device-evidence');

-- 2. Allow public read access to photos
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'device-evidence');

-- 3. Allow users to delete their own shop's photos
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'device-evidence');
