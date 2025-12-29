-- Update add_user_to_company to accept permissions

DROP FUNCTION IF EXISTS add_user_to_company(text, text);
DROP FUNCTION IF EXISTS add_user_to_company(text, text, jsonb);

CREATE OR REPLACE FUNCTION add_user_to_company(
  target_email TEXT, 
  target_role TEXT,
  target_permissions JSONB DEFAULT NULL
)
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
        role = target_role,
        permissions = COALESCE(target_permissions, permissions)
    WHERE id = target_user_id;
    
    RETURN json_build_object('success', true, 'message', 'Usuario agregado a la empresa.');
  ELSE
    -- User doesn't exist. 
    RETURN json_build_object('success', true, 'message', 'El usuario debe registrarse usando este email.');
  END IF;
END;
$$;
