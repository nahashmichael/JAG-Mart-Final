-- Drop existing policies for products table
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable write access for admin users" ON products;

-- Create policies for products table
CREATE POLICY "Enable read access for all users"
ON products FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for admin users"
ON products FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
    AND is_super_admin = true
  )
);

CREATE POLICY "Enable update for admin users"
ON products FOR UPDATE
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
ON products FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
    AND is_super_admin = true
  )
);

-- Drop existing policies for subcategories table
DROP POLICY IF EXISTS "Enable read access for all users" ON subcategories;
DROP POLICY IF EXISTS "Enable write access for admin users" ON subcategories;

-- Create policies for subcategories table
CREATE POLICY "Enable read access for all users"
ON subcategories FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for admin users"
ON subcategories FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
    AND is_super_admin = true
  )
);

CREATE POLICY "Enable update for admin users"
ON subcategories FOR UPDATE
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
ON subcategories FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
    AND is_super_admin = true
  )
);