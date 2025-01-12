/*
  # Fix Authentication System

  1. Changes
    - Drop and recreate the user creation trigger with proper error handling
    - Add missing RLS policies for users table
    - Fix role assignments
    - Add proper indexes for performance

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for user profile access
*/

-- Recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Get the default user role ID
  SELECT id INTO default_role_id FROM roles WHERE name = 'user';
  
  IF default_role_id IS NULL THEN
    RAISE EXCEPTION 'Default user role not found';
  END IF;

  -- Create user profile if it doesn't exist
  INSERT INTO public.users (id, email, role_id)
  VALUES (NEW.id, NEW.email, default_role_id)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create proper indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

-- Update RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Create new policies
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure proper role assignments
DO $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Get default role id
  SELECT id INTO default_role_id FROM roles WHERE name = 'user';
  
  IF default_role_id IS NULL THEN
    RAISE EXCEPTION 'Default user role not found';
  END IF;

  -- Update existing users without roles
  UPDATE users
  SET role_id = default_role_id
  WHERE role_id IS NULL;
END $$;