-- 1. Actualización de nombres a formatos amigables
UPDATE public.normas
SET nombre = CASE codigo
    WHEN 'NMX-C-165-ONNCCE' THEN 'Densidad y Absorción (Fino)'
    WHEN 'NMX-C-164-ONNCCE' THEN 'Densidad y Absorción (Grueso)'
    WHEN 'NMX-C-077-ONNCCE' THEN 'Granulometría'
    WHEN 'NMX-C-305-ONNCCE' THEN 'Equivalente de Arena'
    WHEN 'NMX-C-196-ONNCCE' THEN 'Desgaste Los Ángeles'
    WHEN 'NMX-C-111-ONNCCE' THEN 'Calidad de Agregados'
    WHEN 'NMX-C-083-ONNCCE' THEN 'Compresión de Cilindros'
    WHEN 'NMX-C-156-ONNCCE' THEN 'Revenimiento (Slump)'
    WHEN 'NMX-C-161-ONNCCE' THEN 'Muestreo de Concreto'
    WHEN 'NMX-C-169-ONNCCE' THEN 'Flexión (Vigas)'
    WHEN 'NMX-C-109-ONNCCE' THEN 'Cabeceo de Cilindros'
    WHEN 'NMX-C-159-ONNCCE' THEN 'Elaboración de Muestras'
    WHEN 'NMX-C-128-ONNCCE' THEN 'Módulo de Elasticidad'
    WHEN 'NMX-C-155-ONNCCE' THEN 'Especificaciones de Mezcla'
    WHEN 'NMX-C-148-ONNCCE' THEN 'Control de Curado'
    WHEN 'NMX-C-416-ONNCCE' THEN 'Compactación en Sitio'
    WHEN 'NMX-C-476-ONNCCE' THEN 'Proctor Estándar'
    WHEN 'NMX-C-468-ONNCCE' THEN 'Límites de Atterberg'
    WHEN 'NMX-C-431-ONNCCE' THEN 'Ensayo CBR'
    WHEN 'NMX-C-414-ONNCCE' THEN 'Calidad de Cemento'
    WHEN 'NMX-B-457-CANACERO' THEN 'Tensión de Varilla'
    WHEN 'NMX-B-113-CANACERO' THEN 'Doblado de Varilla'
    WHEN 'NMX-B-290-CANACERO' THEN 'Malla Electrosoldada'
    WHEN 'NMX-C-434-ONNCCE' THEN 'Asfalto por Ignición'
    ELSE nombre
END;

-- 2. Eliminación segura de duplicados
-- Esta consulta mantiene el registro más reciente (creado al final)
-- y evita borrar normas que ya estén en uso en muestras o proyectos para no generar errores de llave foránea.

DELETE FROM public.normas
WHERE id IN (
    SELECT id FROM (
        SELECT id,
        ROW_NUMBER() OVER (PARTITION BY codigo ORDER BY created_at DESC) as r_num
        FROM public.normas
    ) t
    WHERE t.r_num > 1
)
AND id NOT IN (SELECT DISTINCT norma_id FROM public.muestras WHERE norma_id IS NOT NULL)
AND id NOT IN (SELECT DISTINCT norma_id FROM public.proyecto_normas WHERE norma_id IS NOT NULL);
