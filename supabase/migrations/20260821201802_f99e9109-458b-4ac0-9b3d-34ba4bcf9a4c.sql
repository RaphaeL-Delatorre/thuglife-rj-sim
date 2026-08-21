CREATE POLICY "midia_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'midia');
CREATE POLICY "midia_auth_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'midia');
CREATE POLICY "midia_auth_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'midia') WITH CHECK (bucket_id = 'midia');
CREATE POLICY "midia_auth_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'midia');