-- Añadir columna para evidencia fotográfica en la tabla muestras
-- Se usa un array de texto (text[]) para almacenar las URLs o cadenas Base64 de las imágenes
ALTER TABLE public.muestras 
ADD COLUMN IF NOT EXISTS evidencia_fotografica text[] DEFAULT '{}';

-- Comentario para documentación
COMMENT ON COLUMN public.muestras.evidencia_fotografica IS 'Array de URLs o Base64 strings de evidencia fotográfica';
