-- Este script busca normas con el mismo nombre y les agrega el tipo de material para diferenciarlas.
-- Ejemplo: "Granulometría" -> "Granulometría [Agregados]"

UPDATE public.normas
SET nombre = nombre || ' [' || (
    SELECT string_agg(elem, ', ')
    FROM unnest(tipos_muestra_compatibles) AS elem
) || ']'
WHERE id IN (
    -- Seleccionar solo las normas que tienen nombres repetidos
    SELECT n.id
    FROM public.normas n
    JOIN (
        SELECT nombre 
        FROM public.normas 
        GROUP BY nombre 
        HAVING COUNT(*) > 1
    ) duplicados ON n.nombre = duplicados.nombre
)
AND tipos_muestra_compatibles IS NOT NULL 
AND array_length(tipos_muestra_compatibles, 1) > 0;
