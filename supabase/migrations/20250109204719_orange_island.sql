/*
  # Fix Admin Profile Setup

  1. Changes
    - Ensures super_admin role exists
    - Adds unique constraint on admin_profiles user_id
    - Creates admin profile for the super admin user
    - Adds proper RLS policies for admin_profiles table
  
  2. Security
    - Adds RLS policies for admin_profiles
    - Only super admins can view admin profiles
*/

-- Ensure super_admin role exists
INSERT INTO roles (name, description)
VALUES ('super_admin', 'Super Administrator with full system access')
ON CONFLICT (name) DO NOTHING;

-- Add unique constraint to admin_profiles user_id
ALTER TABLE admin_profiles
ADD CONSTRAINT admin_profiles_user_id_key UNIQUE (user_id);

-- Get the super admin role id and create admin profile
DO $$
DECLARE
  super_admin_role_id uuid;
  admin_user_id uuid;
BEGIN
  -- Get the super admin role id
  SELECT id INTO super_admin_role_id
  FROM roles
  WHERE name = 'super_admin';

  -- Get the admin user id
  SELECT id INTO admin_user_id
  FROM users
  WHERE email = 'admin@jagmart.com';

  -- Update user role if needed
  IF admin_user_id IS NOT NULL THEN
    UPDATE users
    SET role_id = super_admin_role_id
    WHERE id = admin_user_id;

    -- Create admin profile if it doesn't exist
    INSERT INTO admin_profiles (user_id, is_super_admin)
    VALUES (admin_user_id, true)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Super admins can view admin profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Super admins can insert admin profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Super admins can update admin profiles" ON admin_profiles;

-- Add RLS policies for admin_profiles
CREATE POLICY "Super admins can view admin profiles"
  ON admin_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid()
      AND r.name = 'super_admin'
    )
  );

CREATE POLICY "Super admins can insert admin profiles"
  ON admin_profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid()
      AND r.name = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update admin profiles"
  ON admin_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid()
      AND r.name = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid()
      AND r.name = 'super_admin'
    )
  );