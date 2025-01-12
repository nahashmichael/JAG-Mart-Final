/*
  # Fix Users Table Policies

  1. Changes
    - Drops existing policies on users table
    - Creates new, simplified policies that avoid recursion
    - Adds basic CRUD policies for users table
  
  2. Security
    - Maintains security while avoiding infinite recursion
    - Users can only view and update their own data
    - Super admins can view all users
*/

-- Drop existing policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;

-- Create new policies without recursive checks
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create a separate policy for admin access
CREATE POLICY "Super admins can view all users"
ON users
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM admin_profiles
    WHERE user_id = auth.uid()
    AND is_super_admin = true
  )
);

-- Create a policy for super admin updates
CREATE POLICY "Super admins can update all users"
ON users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM admin_profiles
    WHERE user_id = auth.uid()
    AND is_super_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM admin_profiles
    WHERE user_id = auth.uid()
    AND is_super_admin = true
  )
);