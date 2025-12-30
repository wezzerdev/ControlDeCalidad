-- Script avanzado para eliminar duplicados y reasignar relaciones
-- Este script fusiona los duplicados en el registro más reciente y elimina los antiguos.

BEGIN;

-- 1. Crear tabla temporal para mapear duplicados (Perdedor -> Ganador)
CREATE TEMP TABLE temp_norma_merge AS
WITH RankedNormas AS (
    SELECT 
        id, 
        codigo, 
        created_at,
        ROW_NUMBER() OVER (PARTITION BY codigo ORDER BY created_at DESC) as rn
    FROM public.normas
)
SELECT 
    loser.id AS loser_id,
    winner.id AS winner_id,
    loser.codigo
FROM RankedNormas loser
JOIN RankedNormas winner ON loser.codigo = winner.codigo AND winner.rn = 1
WHERE loser.rn > 1;

-- 2. Actualizar tabla 'muestras': Reasignar muestras al ganador
UPDATE public.muestras
SET norma_id = m.winner_id
FROM temp_norma_merge m
WHERE muestras.norma_id = m.loser_id;

-- 3. Actualizar tabla 'proyecto_normas': 
-- 3a. Eliminar relaciones del perdedor si el proyecto YA tiene al ganador (evitar duplicados en PK)
DELETE FROM public.proyecto_normas pn
USING temp_norma_merge m
WHERE pn.norma_id = m.loser_id
AND EXISTS (
    SELECT 1 FROM public.proyecto_normas pn2 
    WHERE pn2.proyecto_id = pn.proyecto_id 
    AND pn2.norma_id = m.winner_id
);

-- 3b. Mover relaciones restantes del perdedor al ganador
UPDATE public.proyecto_normas
SET norma_id = m.winner_id
FROM temp_norma_merge m
WHERE proyecto_normas.norma_id = m.loser_id;

-- 4. Finalmente, eliminar las normas duplicadas (perdedoras)
DELETE FROM public.normas
USING temp_norma_merge m
WHERE normas.id = m.loser_id;

-- 5. Mostrar cuántas se eliminaron (opcional, solo para verificar)
-- SELECT count(*) FROM temp_norma_merge;

DROP TABLE temp_norma_merge;

COMMIT;
