/*
  # Improve User Creation Handling

  1. Changes
    - Improve error handling in handle_new_user function
    - Add better logging for debugging
    - Ensure proper role assignment
    - Add safety checks

  2. Security
    - Maintains existing RLS policies
    - Ensures proper role assignment
*/

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Get the default user role ID with error handling
  SELECT id INTO default_role_id 
  FROM public.roles 
  WHERE name = 'user';

  IF default_role_id IS NULL THEN
    RAISE LOG 'Default user role not found. Creating it...';
    
    INSERT INTO public.roles (name, description)
    VALUES ('user', 'Regular user with standard privileges')
    RETURNING id INTO default_role_id;
  END IF;

  -- Create user profile with error handling
  BEGIN
    INSERT INTO public.users (id, email, role_id)
    VALUES (NEW.id, NEW.email, default_role_id);
  EXCEPTION WHEN unique_violation THEN
    -- If user already exists, update the record
    UPDATE public.users
    SET email = NEW.email,
        role_id = COALESCE(role_id, default_role_id),
        updated_at = now()
    WHERE id = NEW.id;
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NULL;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure all existing users have proper role assignment
DO $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Get or create default role
  SELECT id INTO default_role_id
  FROM public.roles
  WHERE name = 'user';

  IF default_role_id IS NULL THEN
    INSERT INTO public.roles (name, description)
    VALUES ('user', 'Regular user with standard privileges')
    RETURNING id INTO default_role_id;
  END IF;

  -- Update any users without roles
  UPDATE public.users
  SET role_id = default_role_id
  WHERE role_id IS NULL;
END $$;