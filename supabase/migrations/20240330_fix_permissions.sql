-- Migration: Fix Permissions Persistence and Defaults
-- Date: 2024-03-30
-- Description: 
-- 1. Defines a standard function to get default permissions by role.
-- 2. Updates the handle_new_user trigger to use these defaults.
-- 3. Drops any potential triggers on 'profiles' that might be overriding permissions on update.
-- 4. Fixes currently broken profiles (reverting to 'M').
-- 5. Adds is_owner column to profiles to protect the main admin.
-- 6. Adds RLS policies for Admins to access all projects.

-- 1. Helper function to get default permissions
DROP FUNCTION IF EXISTS public.get_permissions_by_role(text);
CREATE OR REPLACE FUNCTION public.get_permissions_by_role(user_role text)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN CASE user_role
    WHEN 'administrador' THEN '{
      "access_proyectos": true,
      "access_muestras": true,
      "access_ensayos": true,
      "access_certificados": true,
      "access_inventarios": true,
      "access_resultados": true,
      "access_reportes": true,
      "access_auditoria": true,
      "access_notificaciones": true
    }'::jsonb
    WHEN 'gerente' THEN '{
      "access_proyectos": true,
      "access_muestras": true,
      "access_ensayos": true,
      "access_certificados": true,
      "access_inventarios": true,
      "access_resultados": true,
      "access_reportes": true,
      "access_auditoria": true,
      "access_notificaciones": true
    }'::jsonb
    WHEN 'residente' THEN '{
      "access_proyectos": true,
      "access_muestras": true,
      "access_ensayos": false,
      "access_certificados": true,
      "access_inventarios": false,
      "access_resultados": true,
      "access_reportes": false,
      "access_auditoria": false,
      "access_notificaciones": true
    }'::jsonb
    -- Tecnico defaults (Standard)
    ELSE '{
      "access_proyectos": true,
      "access_muestras": true,
      "access_ensayos": true,
      "access_certificados": false,
      "access_inventarios": false,
      "access_resultados": true,
      "access_reportes": false,
      "access_auditoria": false,
      "access_notificaciones": true
    }'::jsonb
  END;
END;
$$;

-- 2. Remove any triggers on public.profiles that might be resetting permissions on UPDATE
DO $$
DECLARE
    t_name text;
BEGIN
    FOR t_name IN
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_schema = 'public'
        AND event_object_table = 'profiles'
        AND event_manipulation = 'UPDATE'
    LOOP
        IF t_name NOT LIKE '%updated_at%' AND t_name NOT LIKE '%owner%' THEN
            EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(t_name) || ' ON public.profiles';
            RAISE NOTICE 'Dropped potential conflicting trigger: %', t_name;
        END IF;
    END LOOP;
END $$;

-- 3. Update the handle_new_user function (Trigger on auth.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, permissions)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'Nuevo Usuario'),
    COALESCE(new.raw_user_meta_data->>'role', 'tecnico'),
    public.get_permissions_by_role(COALESCE(new.raw_user_meta_data->>'role', 'tecnico'))
  );
  RETURN new;
END;
$$;

-- 4. Fix existing profiles that have corrupted permissions
UPDATE public.profiles
SET permissions = public.get_permissions_by_role(role)
WHERE 
  permissions IS NULL 
  OR 
  (
    (permissions->>'access_muestras')::boolean IS TRUE 
    AND (permissions->>'access_proyectos')::boolean IS NOT TRUE
    AND role IN ('administrador', 'gerente', 'tecnico')
  );

-- 5. Add is_owner column and protection logic
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT FALSE;

-- Set the oldest administrator as owner if no owner exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE is_owner = TRUE) THEN
        UPDATE public.profiles
        SET is_owner = TRUE
        WHERE id = (
            SELECT id FROM public.profiles 
            WHERE role = 'administrador' 
            ORDER BY created_at ASC 
            LIMIT 1
        );
    END IF;
END $$;

-- Create function to prevent deletion/update of owner
CREATE OR REPLACE FUNCTION public.protect_owner_profile()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_owner = TRUE THEN
        IF TG_OP = 'DELETE' THEN
            RAISE EXCEPTION 'No se puede eliminar al administrador principal (Propietario).';
        ELSIF TG_OP = 'UPDATE' THEN
            -- Allow updating basic info, but prevent changing is_owner to false or role
            IF NEW.is_owner = FALSE THEN
                RAISE EXCEPTION 'No se puede transferir la propiedad de esta manera.';
            END IF;
             IF NEW.role != 'administrador' THEN
                RAISE EXCEPTION 'El propietario debe mantener el rol de administrador.';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger
DROP TRIGGER IF EXISTS check_owner_protection ON public.profiles;
CREATE TRIGGER check_owner_protection
BEFORE DELETE OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_owner_profile();


-- 6. Create or Replace add_user_to_company RPC
DROP FUNCTION IF EXISTS public.add_user_to_company(text, text, jsonb);

CREATE OR REPLACE FUNCTION public.add_user_to_company(
  target_email text,
  target_role text,
  target_permissions jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  result jsonb;
BEGIN
  -- Check if user exists in profiles (linked to auth)
  SELECT id INTO target_user_id
  FROM public.profiles
  WHERE email = target_email;

  IF target_user_id IS NOT NULL THEN
    -- Prevent editing owner via this RPC
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id AND is_owner = TRUE) THEN
       RETURN '{"success": false, "message": "No se puede modificar al administrador principal desde aquí."}'::jsonb;
    END IF;

    -- User exists, update them
    UPDATE public.profiles
    SET 
      role = target_role,
      permissions = target_permissions,
      company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
    WHERE id = target_user_id;
    
    result := '{"success": true, "message": "Usuario agregado y actualizado exitosamente"}'::jsonb;
  ELSE
    result := '{"success": false, "message": "El usuario no está registrado en el sistema. Debe registrarse primero."}'::jsonb;
  END IF;

  RETURN result;
END;
$$;
