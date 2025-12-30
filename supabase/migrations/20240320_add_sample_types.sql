-- Migration: Add supported_sample_types to normas table

-- 1. Create the enum type for sample categories (optional, but good for data integrity)
CREATE TYPE sample_category AS ENUM ('Concreto', 'Suelo', 'Acero', 'Agregados', 'Asfalto', 'Otro');

-- 2. Add the column to the normas table
-- We use an array of text (or the enum) to allow multiple compatible types per norm
ALTER TABLE normas 
ADD COLUMN tipos_muestra_compatibles text[] DEFAULT '{}';

-- 3. Update existing data (Examples based on mock data logic)
-- Concreto Norms
UPDATE normas 
SET tipos_muestra_compatibles = ARRAY['Concreto'] 
WHERE codigo IN ('NMX-C-414', 'ACI 318', 'NMX-C-155-ONNCCE-2014', 'NMX-C-161-ONNCCE-2013', 'NMX-C-083-ONNCCE-2014', 'NMX-C-156-ONNCCE-2010', 'NMX-C-109-ONNCCE-2013');

-- Agregados
UPDATE normas 
SET tipos_muestra_compatibles = ARRAY['Agregados', 'Concreto'] 
WHERE codigo IN ('NMX-C-077-ONNCCE', 'NMX-C-164-ONNCCE');

-- Suelos
UPDATE normas 
SET tipos_muestra_compatibles = ARRAY['Suelo'] 
WHERE codigo IN ('NMX-C-416-ONNCCE', 'ASTM D1883', 'ASTM D2216');

-- Acero
UPDATE normas 
SET tipos_muestra_compatibles = ARRAY['Acero'] 
WHERE codigo IN ('NMX-B-172', 'NMX-B-113', 'ASTM E415');

-- 4. Create an index for faster filtering if needed
CREATE INDEX idx_normas_sample_types ON normas USING GIN (tipos_muestra_compatibles);

-- 5. Comments
COMMENT ON COLUMN normas.tipos_muestra_compatibles IS 'Array of sample categories that this norm applies to (e.g., Concreto, Suelo)';
