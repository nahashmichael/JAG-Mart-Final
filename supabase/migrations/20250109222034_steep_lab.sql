-- Drop existing policies for categories table
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable write access for admin users" ON categories;

-- Create policies for categories table
CREATE POLICY "Enable read access for all users"
ON categories FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for admin users"
ON categories FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
    AND is_super_admin = true
  )
);

CREATE POLICY "Enable update for admin users"
ON categories FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
    AND is_super_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
    AND is_super_admin = true
  )
);

CREATE POLICY "Enable delete for admin users"
ON categories FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
    AND is_super_admin = true
  )
);