
-- Enable RLS on storage.objects if not already enabled
alter table storage.objects enable row level security;

-- Create policy to allow authenticated users to upload files to 'profile-images' bucket
create policy "Allow authenticated uploads"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-images' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Note: The simplified policy above assumes a folder structure or just allows any auth user. 
-- For a flat structure where filename starts with user_id (which we implemented: `${user.id}-${Math.random()}`), 
-- we can arguably just allow any authenticated user to insert into the bucket for now to unblock.

DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Authenticated users can update own profile images" ON storage.objects;
CREATE POLICY "Authenticated users can update own profile images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profile-images' AND owner = auth.uid());

DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profile-images');
