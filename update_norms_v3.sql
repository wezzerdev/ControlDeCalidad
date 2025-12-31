-- Actualización de normas v3: Normas adicionales para laboratorio de construcción

-- Bloque anónimo para manejar lógica y variables
DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- 1. OBTENER UN USUARIO VÁLIDO
    -- Seleccionamos el primer ID disponible en la tabla 'profiles' para satisfacer la llave foránea.
    SELECT id INTO v_user_id FROM profiles LIMIT 1;
    
    -- Si no hay usuarios, no podemos continuar de forma segura.
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Error: No se encontró ningún usuario en la tabla "profiles". Registre un usuario primero.';
    END IF;

    -- 2. LIMPIEZA DE DATOS (Mantenimiento)
    -- Eliminar duplicados manteniendo el registro más antiguo (por id) para evitar conflictos
    DELETE FROM normas a USING normas b
    WHERE a.id > b.id AND a.codigo = b.codigo;

    -- 3. ASEGURAR RESTRICCIÓN UNIQUE
    -- Esto previene errores futuros de duplicación
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'normas_codigo_key'
    ) THEN
        ALTER TABLE normas ADD CONSTRAINT normas_codigo_key UNIQUE (codigo);
    END IF;

    -- 4. INSERTAR NUEVAS NORMAS
    -- Usamos v_user_id para el campo created_by

    -- NMX-C-475-ONNCCE
    INSERT INTO normas (id, codigo, nombre, tipo, descripcion, activa, created_by, campos, detalles_adicionales)
    VALUES (
      gen_random_uuid(), -- Usamos gen_random_uuid() que es nativo de Postgres 13+ (o uuid_generate_v4 si está la extensión)
      'NMX-C-475-ONNCCE',
      'Proctor Modificado',
      'NMX',
      'Determinación del peso volumétrico seco máximo y humedad óptima (energía modificada)',
      true,
      v_user_id,
      '[{"id": "f_nmx_c_475_0", "nombre": "Peso Vol. Seco Máx", "tipo": "number", "esRequerido": true, "unidad": "kg/m³"}, {"id": "f_nmx_c_475_1", "nombre": "Humedad Óptima", "tipo": "number", "esRequerido": true, "unidad": "%"}, {"id": "f_nmx_c_475_2", "nombre": "Método (A/B/C)", "tipo": "text", "esRequerido": true}]'::jsonb,
      '{"objetivo": "Curva de compactación con energía modificada", "equipo_principal": ["Molde 4 o 6 pulg", "Pisón 4.54 kg", "Caída 45.7 cm"], "procedimiento_resumido": ["1. Preparar muestra", "2. Compactar en 5 capas", "3. 25 o 56 golpes por capa", "4. Determinar peso unitario y humedad"], "tolerancias": "Variable según material"}'::jsonb
    ) ON CONFLICT (codigo) DO NOTHING;

    -- NMX-C-157-ONNCCE
    INSERT INTO normas (id, codigo, nombre, tipo, descripcion, activa, created_by, campos, detalles_adicionales)
    VALUES (
      gen_random_uuid(),
      'NMX-C-157-ONNCCE',
      'Contenido de Aire',
      'NMX',
      'Determinación del contenido de aire en concreto fresco por el método de presión',
      true,
      v_user_id,
      '[{"id": "f_nmx_c_157_0", "nombre": "Contenido de Aire Aparente", "tipo": "number", "esRequerido": true, "unidad": "%"}, {"id": "f_nmx_c_157_1", "nombre": "Factor de Corrección Agregados", "tipo": "number", "esRequerido": true, "unidad": "%"}, {"id": "f_nmx_c_157_2", "nombre": "Contenido de Aire Final", "tipo": "number", "esRequerido": true, "unidad": "%"}]'::jsonb,
      '{"objetivo": "Medir aire atrapado e incluido en concreto", "equipo_principal": ["Olla de Washington (Medidor Tipo A o B)"], "procedimiento_resumido": ["1. Llenar olla en 3 capas", "2. Compactar y enrasar", "3. Aplicar presión y leer manómetro"], "limites": "Variable según diseño (ej. 4-6%)"}'::jsonb
    ) ON CONFLICT (codigo) DO NOTHING;

    -- NMX-C-088-ONNCCE
    INSERT INTO normas (id, codigo, nombre, tipo, descripcion, activa, created_by, campos, detalles_adicionales)
    VALUES (
      gen_random_uuid(),
      'NMX-C-088-ONNCCE',
      'Impurezas Orgánicas',
      'NMX',
      'Determinación de impurezas orgánicas en el agregado fino',
      true,
      v_user_id,
      '[{"id": "f_nmx_c_088_0", "nombre": "Color de la Solución", "tipo": "select", "esRequerido": true, "opciones": ["Más claro que estándar", "Igual a estándar", "Más oscuro que estándar"]}, {"id": "f_nmx_c_088_1", "nombre": "Resultado", "tipo": "select", "esRequerido": true, "opciones": ["Pasa", "No Pasa"]}]'::jsonb,
      '{"objetivo": "Detectar materia orgánica perjudicial en arena", "equipo_principal": ["Botellas de vidrio", "Solución NaOH 3%"], "procedimiento_resumido": ["1. Mezclar arena con solución", "2. Reposar 24h", "3. Comparar color con escala Gardner u orgánica"], "criterios": "Si es más oscuro, requiere pruebas adicionales"}'::jsonb
    ) ON CONFLICT (codigo) DO NOTHING;

    -- NMX-C-052-ONNCCE
    INSERT INTO normas (id, codigo, nombre, tipo, descripcion, activa, created_by, campos, detalles_adicionales)
    VALUES (
      gen_random_uuid(),
      'NMX-C-052-ONNCCE',
      'Penetración Asfalto',
      'NMX',
      'Determinación de la penetración en materiales asfálticos',
      true,
      v_user_id,
      '[{"id": "f_nmx_c_052_0", "nombre": "Temperatura de Ensayo", "tipo": "number", "esRequerido": true, "unidad": "°C"}, {"id": "f_nmx_c_052_1", "nombre": "Penetración 1", "tipo": "number", "esRequerido": true, "unidad": "0.1mm"}, {"id": "f_nmx_c_052_2", "nombre": "Penetración 2", "tipo": "number", "esRequerido": true, "unidad": "0.1mm"}, {"id": "f_nmx_c_052_3", "nombre": "Penetración 3", "tipo": "number", "esRequerido": true, "unidad": "0.1mm"}, {"id": "f_nmx_c_052_4", "nombre": "Promedio", "tipo": "number", "esRequerido": true, "unidad": "0.1mm"}]'::jsonb,
      '{"objetivo": "Medir consistencia de asfalto sólido/semisólido", "equipo_principal": ["Penetrómetro", "Aguja estándar", "Baño maría"], "procedimiento_resumido": ["1. Acondicionar muestra a 25°C", "2. Aplicar carga 100g por 5s", "3. Medir penetración de aguja"], "tolerancias": "Según rango de penetración"}'::jsonb
    ) ON CONFLICT (codigo) DO NOTHING;

END $$;
