/*
  # Fix Admin Authentication

  1. Changes
    - Simplifies user and role policies
    - Adds direct role access policies
    - Fixes infinite recursion issues
  
  2. Security
    - Maintains proper access control
    - Prevents policy recursion
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Super admins can update all users" ON users;

-- Create simplified policies for users table
CREATE POLICY "Enable read access for users"
ON users FOR SELECT
USING (
  -- Users can read their own profile
  auth.uid() = id
  OR 
  -- Super admins can read all profiles
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
    AND is_super_admin = true
  )
);

CREATE POLICY "Enable update access for users"
ON users FOR UPDATE
USING (
  -- Users can update their own profile
  auth.uid() = id
  OR 
  -- Super admins can update all profiles
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
    AND is_super_admin = true
  )
);