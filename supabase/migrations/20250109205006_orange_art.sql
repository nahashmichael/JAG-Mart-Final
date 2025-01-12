/*
  # Fix Admin Profile Policies

  1. Changes
    - Simplifies admin_profiles policies to prevent recursion
    - Adds basic RLS policies for admin_profiles
    - Ensures proper access control without circular dependencies
  
  2. Security
    - Maintains proper admin access control
    - Prevents policy recursion
    - Allows admins to view and manage admin profiles
*/

-- Drop existing policies on admin_profiles
DROP POLICY IF EXISTS "Super admins can view admin profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Super admins can insert admin profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Super admins can update admin profiles" ON admin_profiles;

-- Create simplified policies for admin_profiles
CREATE POLICY "Admin profiles are viewable by the profile owner"
ON admin_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admin profiles are insertable by super admins"
ON admin_profiles FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM admin_profiles
  WHERE user_id = auth.uid()
  AND is_super_admin = true
));

CREATE POLICY "Admin profiles are updatable by super admins"
ON admin_profiles FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM admin_profiles
  WHERE user_id = auth.uid()
  AND is_super_admin = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM admin_profiles
  WHERE user_id = auth.uid()
  AND is_super_admin = true
));

-- Ensure RLS is enabled
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Add initial super admin if not exists
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the admin user id
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@jagmart.com';

  IF admin_user_id IS NOT NULL THEN
    -- Insert admin profile if it doesn't exist
    INSERT INTO admin_profiles (user_id, is_super_admin)
    VALUES (admin_user_id, true)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;