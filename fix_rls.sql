-- Fix RLS policies to allow company creation and user management
-- Including RECURSION FIXES

-- 0. Helper function to avoid recursion
-- This function runs with elevated privileges (SECURITY DEFINER) to look up the user's company_id
-- without triggering RLS policies on the profiles table again.
CREATE OR REPLACE FUNCTION get_my_company_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid();
$$;

-- 1. Allow authenticated users to create a company
-- This is necessary for the initial setup where an admin creates their company
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."company_settings";
CREATE POLICY "Enable insert for authenticated users" 
ON "public"."company_settings"
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 2. Allow users to view their own company (and any company if they are linked to it)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."company_settings";
CREATE POLICY "Enable read access for authenticated users" 
ON "public"."company_settings"
FOR SELECT 
TO authenticated 
USING (true);

-- 3. Allow admins to update their company details
DROP POLICY IF EXISTS "Enable update for company admins" ON "public"."company_settings";
CREATE POLICY "Enable update for company admins" 
ON "public"."company_settings"
FOR UPDATE 
TO authenticated 
USING (
  id = get_my_company_id()
  AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'administrador' OR profiles.role = 'gerente')
  )
);

-- 4. Ensure profiles can be updated (to link company_id)
DROP POLICY IF EXISTS "Enable update for users based on id" ON "public"."profiles";
CREATE POLICY "Enable update for users based on id" 
ON "public"."profiles"
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Allow admins to view all profiles in their company
-- AND users to view their own profile.
DROP POLICY IF EXISTS "Enable read access for company members" ON "public"."profiles";
CREATE POLICY "Enable read access for company members" 
ON "public"."profiles"
FOR SELECT 
TO authenticated 
USING (
  -- I can see myself
  id = auth.uid() 
  OR 
  -- I can see people in my company (using the secure function to get MY company ID)
  company_id = get_my_company_id()
);

-- 6. Allow admins to delete profiles (remove users)
DROP POLICY IF EXISTS "Enable delete for company admins" ON "public"."profiles";
CREATE POLICY "Enable delete for company admins" 
ON "public"."profiles"
FOR DELETE 
TO authenticated 
USING (
  company_id = get_my_company_id()
  AND 
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'administrador'
);

-- 7. Function to add user to company
DROP FUNCTION IF EXISTS add_user_to_company(text, text);

CREATE OR REPLACE FUNCTION add_user_to_company(target_email TEXT, target_role TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_company_id UUID;
  target_user_id UUID;
BEGIN
  -- Get current user's company
  SELECT company_id INTO current_company_id
  FROM profiles
  WHERE id = auth.uid();

  IF current_company_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'No tienes una empresa configurada.');
  END IF;

  -- Find target user by email (in profiles)
  SELECT id INTO target_user_id
  FROM profiles
  WHERE email = target_email;

  IF target_user_id IS NOT NULL THEN
    -- Update existing user
    UPDATE profiles
    SET company_id = current_company_id,
        role = target_role
    WHERE id = target_user_id;
    
    RETURN json_build_object('success', true, 'message', 'Usuario agregado a la empresa.');
  ELSE
    -- User doesn't exist. 
    -- We can't create an auth user here.
    -- We'll return success but noting that the user needs to register.
    RETURN json_build_object('success', true, 'message', 'El usuario debe registrarse usando este email.');
  END IF;
END;
$$;
