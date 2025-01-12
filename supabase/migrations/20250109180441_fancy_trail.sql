/*
  # Fix Authentication Triggers

  1. Changes
    - Create trigger function to handle user creation
    - Add trigger for auth.users table
    - Fix role assignment for new users
    - Ensure proper user profile creation

  2. Security
    - Maintain existing RLS policies
    - Keep role-based access control
*/

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Get the default user role ID
  SELECT id INTO default_role_id FROM roles WHERE name = 'user';

  -- Create user profile
  INSERT INTO public.users (id, email, role_id)
  VALUES (NEW.id, NEW.email, default_role_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure proper role assignments
DO $$
BEGIN
  -- Update existing users without roles to have the default user role
  UPDATE users u
  SET role_id = r.id
  FROM roles r
  WHERE r.name = 'user'
  AND u.role_id IS NULL;
END $$;