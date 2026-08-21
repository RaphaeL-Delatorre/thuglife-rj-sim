INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'midia',
  'midia',
  false,
  52428800,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "midia_public_read" ON storage.objects;
DROP POLICY IF EXISTS "midia_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "midia_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "midia_auth_delete" ON storage.objects;

CREATE POLICY "midia_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'midia');

CREATE POLICY "midia_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'midia');

CREATE POLICY "midia_auth_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'midia')
  WITH CHECK (bucket_id = 'midia');

CREATE POLICY "midia_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'midia');
