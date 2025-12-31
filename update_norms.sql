-- 1. Agregar columna para detalles adicionales (si no existe)
ALTER TABLE normas ADD COLUMN IF NOT EXISTS detalles_adicionales JSONB;

-- 2. Actualizar normas

-- Actualizar NMX-C-165-ONNCCE
UPDATE normas SET
  nombre = 'Densidad y Absorción Fino',
  campos = '[{"id": "f_nmx_c_165_onncce_0", "nombre": "Peso Matraz Agua", "tipo": "number", "esRequerido": true, "unidad": "g"}, {"id": "f_nmx_c_165_onncce_1", "nombre": "Peso Matraz Muestra Agua", "tipo": "number", "esRequerido": true, "unidad": "g"}, {"id": "f_nmx_c_165_onncce_2", "nombre": "Peso Muestra SSS", "tipo": "number", "esRequerido": true, "unidad": "g"}, {"id": "f_nmx_c_165_onncce_3", "nombre": "Densidad Relativa", "tipo": "number", "esRequerido": true, "unidad": "g/cm³"}, {"id": "f_nmx_c_165_onncce_4", "nombre": "Absorción", "tipo": "number", "esRequerido": true, "unidad": "%"}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Densidad relativa aparente (seca/SSS) y absorción de agregado fino", "muestra": "500g mínimo, pasa malla 4.75mm", "equipo_principal": ["Balanza 0.1g", "Horno 110°C", "Picnómetro", "Termómetro"], "datos_reportados": ["Dr_seca", "Dr_SSS", "Absorción(%)"], "tolerancias": "±0.01 densidad, ±0.1% absorción", "procedimiento_resumido": ["1. Secar muestra 24h horno 110°C → Masa seca (Ms)", "2. Inmersión agua 24h → Saturar", "3. SSS (paño) → Masa SSS (Msss)", "4. Picnómetro: Mpicnó + agua | Mpicnó + agua + SSS", "5. Dr = [Msss - Ms] / Volumen desplazado"]}'::jsonb
WHERE codigo = 'NMX-C-165-ONNCCE';

-- Actualizar NMX-C-164-ONNCCE
UPDATE normas SET
  nombre = 'Densidad y Absorción Grueso',
  campos = '[{"id": "f_nmx_c_164_onncce_0", "nombre": "Peso al Aire", "tipo": "number", "esRequerido": true, "unidad": "g"}, {"id": "f_nmx_c_164_onncce_1", "nombre": "Peso en Agua", "tipo": "number", "esRequerido": true, "unidad": "g"}, {"id": "f_nmx_c_164_onncce_2", "nombre": "Peso SSS", "tipo": "number", "esRequerido": true, "unidad": "g"}, {"id": "f_nmx_c_164_onncce_3", "nombre": "Densidad Relativa SSS", "tipo": "number", "esRequerido": true, "unidad": "g/cm³"}, {"id": "f_nmx_c_164_onncce_4", "nombre": "Absorción", "tipo": "number", "esRequerido": true, "unidad": "%"}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Densidad relativa (seca/SSS) y absorción agregado grueso", "muestra": "2-5kg por fracción (4.75-37.5mm)", "equipo_principal": ["Balanza", "Horno", "Canastilla sumergible"], "datos_reportados": ["Dr_seca", "Dr_SSS", "Absorción(%) por fracción"], "tolerancias": "±0.01 densidad, ±0.2% absorción", "procedimiento_resumido": ["1. Secar horno → Masa seca (Ms)", "2. Inmersión 24h → SSS (Msss)", "3. Pesar sumergida (Msub)", "4. Dr_seca = Ms / (Msss - Msub) × ρ_agua", "5. Absorción = [(Msss - Ms)/Ms] × 100"]}'::jsonb
WHERE codigo = 'NMX-C-164-ONNCCE';

-- Actualizar NMX-C-077-ONNCCE
UPDATE normas SET
  nombre = 'Granulometría',
  campos = '[{"id": "f_nmx_c_077_onncce_0", "nombre": "Malla", "tipo": "text", "esRequerido": true}, {"id": "f_nmx_c_077_onncce_1", "nombre": "Peso Retenido", "tipo": "number", "esRequerido": true, "unidad": "g"}, {"id": "f_nmx_c_077_onncce_2", "nombre": "Retenido Parcial", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_c_077_onncce_3", "nombre": "Retenido Acumulado", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_c_077_onncce_4", "nombre": "Que Pasa", "tipo": "number", "esRequerido": true, "unidad": "%"}, {"id": "f_nmx_c_077_onncce_5", "nombre": "Módulo de Finura", "tipo": "number", "esRequerido": true}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Distribución granulométrica agregados", "muestra": "Fino: 500g | Grueso: 2-25kg", "equipo_principal": ["Tamices ASTM", "Balanza", "Agitador tamices"], "datos_reportados": ["%Pasa", "%Retenido acumulado", "Módulo finura"], "tolerancias": "±2% masas retenidas", "procedimiento_resumido": ["1. Secar y pesar muestra inicial", "2. Tamizar 10-15 min por tamiz", "3. Pesar retenidos → Calcular % pasa/acumulado", "4. Módulo finura = Σ(%retenido × factor)/100"]}'::jsonb
WHERE codigo = 'NMX-C-077-ONNCCE';

-- Actualizar NMX-C-305-ONNCCE
UPDATE normas SET
  nombre = 'Equivalente de Arena',
  campos = '[{"id": "f_nmx_c_305_onncce_0", "nombre": "Lectura Arcilla", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_c_305_onncce_1", "nombre": "Lectura Arena", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_c_305_onncce_2", "nombre": "Equivalente de Arena", "tipo": "text", "esRequerido": true}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Contenido finos plásticos en arena", "muestra": "200g arena seca (pasa #4)", "equipo_principal": ["Cilindro EA", "Solución CaCl2+glicerina"], "datos_reportados": ["Equivalente Arena (%)"], "limites": "≥75% para concreto", "procedimiento_resumido": ["1. Arena seca hasta marca 100ml", "2. Solución hasta 203ml → 25 golpes pistón", "3. Reposo 30s → 25 golpes → Reposo", "4. EA = (Altura arena/Altura total) × 100"]}'::jsonb
WHERE codigo = 'NMX-C-305-ONNCCE';

-- Actualizar NMX-C-196-ONNCCE
UPDATE normas SET
  nombre = 'Desgaste Los Ángeles',
  campos = '[{"id": "f_nmx_c_196_onncce_0", "nombre": "Graduación", "tipo": "text", "esRequerido": true}, {"id": "f_nmx_c_196_onncce_1", "nombre": "Peso Inicial", "tipo": "number", "esRequerido": true, "unidad": "g"}, {"id": "f_nmx_c_196_onncce_2", "nombre": "Peso Final", "tipo": "number", "esRequerido": true, "unidad": "g"}, {"id": "f_nmx_c_196_onncce_3", "nombre": "Tamiz 12", "tipo": "text", "esRequerido": true}, {"id": "f_nmx_c_196_onncce_4", "nombre": "Desgaste", "tipo": "text", "esRequerido": true}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Resistencia abrasión/impacto", "muestra": "5-10kg según fracción", "equipo_principal": ["Máquina LA", "11 esferas acero (470g c/u)"], "datos_reportados": ["Pérdida LA (%)"], "limites": "≤50% concreto estructural", "procedimiento_resumido": ["1. Preparar fracción → Pesar inicial", "2. + Esferas → 500 rev 30-33 rpm", "3. Tamizar No.12 (1.7mm) → Pesar retenido", "4. Pérdida = [(Inicial-Final)/Inicial]×100"]}'::jsonb
WHERE codigo = 'NMX-C-196-ONNCCE';

-- Actualizar NMX-C-083-ONNCCE
UPDATE normas SET
  nombre = 'Compresión de Cilindros',
  campos = '[{"id": "f_nmx_c_083_onncce_0", "nombre": "Edad de Ensayo", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_c_083_onncce_1", "nombre": "Diámetro Promedio", "tipo": "number", "esRequerido": true, "unidad": "cm"}, {"id": "f_nmx_c_083_onncce_2", "nombre": "Área", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_c_083_onncce_3", "nombre": "Carga Máxima", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_c_083_onncce_4", "nombre": "Resistencia", "tipo": "number", "esRequerido": true, "unidad": "MPa"}, {"id": "f_nmx_c_083_onncce_5", "nombre": "Tipo de Falla", "tipo": "text", "esRequerido": true}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Resistencia compresión concreto", "especimenes": "Ø15×30cm (estándar)", "equipo_principal": ["Prensa compresión ±3%", "Regla"], "edades": ["3", "7", "28 días"], "procedimiento_resumido": ["1. Medir Ø, h → Área = π(Ø/2)²", "2. Centrar cilindro en prensa", "3. Carga 0.25-0.35 MPa/s hasta falla", "4. fc = Carga máx (kN) / Área (m²)"]}'::jsonb
WHERE codigo = 'NMX-C-083-ONNCCE';

-- Actualizar NMX-C-156-ONNCCE
UPDATE normas SET
  nombre = 'Revenimiento Slump',
  campos = '[{"id": "f_nmx_c_156_onncce_0", "nombre": "Revenimiento Obtenido", "tipo": "number", "esRequerido": true, "unidad": "cm"}, {"id": "f_nmx_c_156_onncce_1", "nombre": "Hora de Muestreo", "tipo": "text", "esRequerido": true}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Consistencia concreto fresco", "equipo": "Cono Abrams (Ø100/200×300mm)", "limites": "5-18cm típico", "procedimiento_resumido": ["1. 3 capas × 25 varillazos c/u", "2. Levantar cono 5-10s", "3. Medir abatimiento máximo"]}'::jsonb
WHERE codigo = 'NMX-C-156-ONNCCE';

-- Actualizar NMX-C-161-ONNCCE
UPDATE normas SET
  nombre = 'Muestreo de Concreto',
  campos = '[{"id": "f_nmx_c_161_onncce_0", "nombre": "Volumen de Muestra", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_c_161_onncce_1", "nombre": "Procedimiento", "tipo": "text", "esRequerido": true}, {"id": "f_nmx_c_161_onncce_2", "nombre": "Temperatura Concreto", "tipo": "number", "esRequerido": true, "unidad": "°C"}, {"id": "f_nmx_c_161_onncce_3", "nombre": "Temperatura Ambiente", "tipo": "number", "esRequerido": true, "unidad": "°C"}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Muestras representativas concreto fresco", "equipo": ["Recipientes limpios", "Palas", "Cronómetro"], "procedimiento_resumido": ["1. Tomar porciones diferentes puntos descarga", "2. Homogenizar suavemente", "3. Proteger sol/viento/pérdida agua"]}'::jsonb
WHERE codigo = 'NMX-C-161-ONNCCE';

-- Actualizar NMX-C-109-ONNCCE
UPDATE normas SET
  nombre = 'Cabeceo de Cilindros',
  campos = '[{"id": "f_nmx_c_109_onncce_0", "nombre": "Material de Cabeceo", "tipo": "text", "esRequerido": true}, {"id": "f_nmx_c_109_onncce_1", "nombre": "Espesor Promedio", "tipo": "number", "esRequerido": true, "unidad": "g"}, {"id": "f_nmx_c_109_onncce_2", "nombre": "Planicidad", "tipo": "text", "esRequerido": true}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Superficies planas/perpendiculares cilindros", "equipo": ["Placas metálicas", "Azufre + carga mineral"], "procedimiento_resumido": ["1. Azufre fundido → Capa en placa", "2. Posicionar cilindro vertical", "3. Enfriar → Verificar planicidad"]}'::jsonb
WHERE codigo = 'NMX-C-109-ONNCCE';

-- Actualizar NMX-C-169-ONNCCE
UPDATE normas SET
  nombre = 'Flexión Vigas',
  campos = '[{"id": "f_nmx_c_169_onncce_0", "nombre": "Ancho Promedio", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_c_169_onncce_1", "nombre": "Peralte Promedio", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_c_169_onncce_2", "nombre": "Claro de Ensayo", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_c_169_onncce_3", "nombre": "Carga Máxima", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_c_169_onncce_4", "nombre": "Módulo de Ruptura MR", "tipo": "number", "esRequerido": true, "unidad": "MPa"}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Resistencia flexión vigas concreto endurecido", "equipo": ["Sierra corte", "Máquina flexión"], "procedimiento_resumido": ["1. Cortar vigas prismáticas", "2. Ensayo tercio puntos/centro", "3. MR = (PL)/(bd²) donde P=carga ruptura"]}'::jsonb
WHERE codigo = 'NMX-C-169-ONNCCE';

-- Actualizar NMX-C-128-ONNCCE
UPDATE normas SET
  nombre = 'Módulo de Elasticidad',
  campos = '[{"id": "f_nmx_c_128_onncce_0", "nombre": "Carga 40", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_c_128_onncce_1", "nombre": "Deformación 40", "tipo": "text", "esRequerido": true}, {"id": "f_nmx_c_128_onncce_2", "nombre": "Módulo Elasticidad", "tipo": "number", "esRequerido": true, "unidad": "MPa"}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Módulo elasticidad estático concreto", "equipo": ["Prensa control deformación", "Extensómetros"], "procedimiento_resumido": ["1. Ciclos carga 0-40% fc", "2. Medir deformaciones lineales", "3. E = Δσ/Δε (tramo lineal)"]}'::jsonb
WHERE codigo = 'NMX-C-128-ONNCCE';

-- Actualizar NMX-C-111-ONNCCE
UPDATE normas SET
  nombre = 'Calidad de Agregados',
  campos = '[{"id": "f_nmx_c_111_onncce_0", "nombre": "Tipo de Agregado", "tipo": "text", "esRequerido": true}, {"id": "f_nmx_c_111_onncce_1", "nombre": "Densidad Relativa", "tipo": "number", "esRequerido": true, "unidad": "g/cm³"}, {"id": "f_nmx_c_111_onncce_2", "nombre": "Absorción", "tipo": "number", "esRequerido": true, "unidad": "%"}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Requisitos calidad agregados concreto", "normas_relacionadas": ["C-077", "C-164", "C-165", "C-196", "C-305"], "usa_resultados_de": ["Granulometría", "Densidad", "EA", "Los Ángeles"]}'::jsonb
WHERE codigo = 'NMX-C-111-ONNCCE';

-- Actualizar NMX-C-155-ONNCCE
UPDATE normas SET
  nombre = 'Especificaciones de Mezcla',
  campos = '[{"id": "f_nmx_c_155_onncce_0", "nombre": "Resistencia Diseño fc", "tipo": "number", "esRequerido": true, "unidad": "MPa"}, {"id": "f_nmx_c_155_onncce_1", "nombre": "Edad de Garantía", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_c_155_onncce_2", "nombre": "Tamaño Máximo Agregado", "tipo": "text", "esRequerido": true}, {"id": "f_nmx_c_155_onncce_3", "nombre": "Revenimiento Nominal", "tipo": "number", "esRequerido": true, "unidad": "cm"}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Especificaciones concreto hidráulico", "usa_resultados_de": ["C-083", "C-156", "C-161"]}'::jsonb
WHERE codigo = 'NMX-C-155-ONNCCE';

-- Actualizar NMX-C-148-ONNCCE
UPDATE normas SET
  nombre = 'Control de Curado',
  campos = '[{"id": "f_nmx_c_148_onncce_0", "nombre": "Temperatura °C", "tipo": "number", "esRequerido": true, "unidad": "°C"}, {"id": "f_nmx_c_148_onncce_1", "nombre": "Humedad Relativa", "tipo": "number", "esRequerido": true, "unidad": "%"}, {"id": "f_nmx_c_148_onncce_2", "nombre": "Agua Saturada con Cal", "tipo": "boolean", "esRequerido": true}, {"id": "f_nmx_c_148_onncce_3", "nombre": "Registro Automático", "tipo": "boolean", "esRequerido": true}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Condiciones gabinetes/cuartos húmedos", "requisitos": "23±2°C, HR≥95%", "equipo": ["Termohigrógrafos", "Tanques cal"]}'::jsonb
WHERE codigo = 'NMX-C-148-ONNCCE';

-- Actualizar NMX-C-416-ONNCCE
UPDATE normas SET
  nombre = 'Compactación en Sitio',
  campos = '[{"id": "f_nmx_c_416_onncce_0", "nombre": "SueloPVS", "tipo": "text", "esRequerido": true}, {"id": "f_nmx_c_416_onncce_1", "nombre": "M Proctor", "tipo": "text", "esRequerido": true}, {"id": "f_nmx_c_416_onncce_2", "nombre": "Humedad óptima", "tipo": "number", "esRequerido": true, "unidad": "%"}, {"id": "f_nmx_c_416_onncce_3", "nombre": "Peso Vol. Sitio", "tipo": "number", "esRequerido": true, "unidad": "g"}, {"id": "f_nmx_c_416_onncce_4", "nombre": "Humedad Sitio", "tipo": "number", "esRequerido": true, "unidad": "%"}, {"id": "f_nmx_c_416_onncce_5", "nombre": "Compactación", "tipo": "number", "esRequerido": true}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Compactación terracerías en sitio", "equipo": ["Densímetro arena", "Nuclear"], "procedimiento_resumido": ["1. Muestreo sitio", "2. Proctor laboratorio", "3. %Compactación = (γ_sitio/γ_proctor)×100"]}'::jsonb
WHERE codigo = 'NMX-C-416-ONNCCE';

-- Actualizar NMX-C-476-ONNCCE
UPDATE normas SET
  nombre = 'Proctor Estándar',
  campos = '[{"id": "f_nmx_c_476_onncce_0", "nombre": "Peso Vol. Seco Máx", "tipo": "number", "esRequerido": true, "unidad": "g"}, {"id": "f_nmx_c_476_onncce_1", "nombre": "Humedad óptima", "tipo": "number", "esRequerido": true, "unidad": "%"}, {"id": "f_nmx_c_476_onncce_2", "nombre": "Golpes por Capa", "tipo": "text", "esRequerido": true}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Curva compactación Proctor", "equipo": ["Molde 1/30pie³", "Martillo 2.7kg caída 30cm"], "procedimiento_resumido": ["1. 4-6 humedades → 3 capas × 25 golpes", "2. γ_húmeda → γ_seca por contenido agua", "3. Máxima γ_seca y humedad óptima"]}'::jsonb
WHERE codigo = 'NMX-C-476-ONNCCE';

-- Actualizar NMX-C-468-ONNCCE
UPDATE normas SET
  nombre = 'Límites de Atterberg',
  campos = '[{"id": "f_nmx_c_468_onncce_0", "nombre": "Límite Líquido LL", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_c_468_onncce_1", "nombre": "Límite Plástico LP", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_c_468_onncce_2", "nombre": "Índice Plástico IP", "tipo": "number", "esRequerido": true}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Clasificación suelos finos", "equipo": ["Casagrande LL", "Placa vidrio LP"], "procedimiento_resumido": ["LL: 25 golpes cierra surco", "LP: Tira 3mm agrieta", "IP = LL - LP"]}'::jsonb
WHERE codigo = 'NMX-C-468-ONNCCE';

-- Actualizar NMX-C-431-ONNCCE
UPDATE normas SET
  nombre = 'Ensayo CBR',
  campos = '[{"id": "f_nmx_c_431_onncce_0", "nombre": "CBR al 100%", "tipo": "number", "esRequerido": true, "unidad": "%"}, {"id": "f_nmx_c_431_onncce_1", "nombre": "CBR al 95%", "tipo": "number", "esRequerido": true, "unidad": "%"}, {"id": "f_nmx_c_431_onncce_2", "nombre": "Expansión", "tipo": "number", "esRequerido": true}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Capacidad soporte suelo", "equipo": ["Molde CBR", "Pistón penetración"], "procedimiento_resumido": ["1. Compactar Proctor óptimo", "2. Penetración 2.5/5mm", "3. CBR = (Carga suelo/Carga estándar)×100"]}'::jsonb
WHERE codigo = 'NMX-C-431-ONNCCE';

-- Actualizar NMX-B-457-CANACERO
UPDATE normas SET
  nombre = 'Tensión de Varilla',
  campos = '[{"id": "f_nmx_b_457_canacero_0", "nombre": "Grado", "tipo": "text", "esRequerido": true}, {"id": "f_nmx_b_457_canacero_1", "nombre": "Número de Varilla", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_b_457_canacero_2", "nombre": "Esfuerzo Fluencia Fy", "tipo": "text", "esRequerido": true, "unidad": "MPa"}, {"id": "f_nmx_b_457_canacero_3", "nombre": "Resistencia Tensión R", "tipo": "number", "esRequerido": true, "unidad": "MPa"}, {"id": "f_nmx_b_457_canacero_4", "nombre": "Alargamiento", "tipo": "number", "esRequerido": true}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Especificaciones varilla corrugada", "equipo": ["Máquina tracción"], "procedimiento_resumido": ["1. Cortar probeta calibrada", "2. Tracción hasta fluencia/ruptura", "3. Fy, Fu, elongación %"]}'::jsonb
WHERE codigo = 'NMX-B-457-CANACERO';

-- Actualizar NMX-B-113-CANACERO
UPDATE normas SET
  nombre = 'Doblado de Varilla',
  campos = '[{"id": "f_nmx_b_113_canacero_0", "nombre": "Diámetro", "tipo": "number", "esRequerido": true, "unidad": "cm"}, {"id": "f_nmx_b_113_canacero_1", "nombre": "Mandril", "tipo": "text", "esRequerido": true}, {"id": "f_nmx_b_113_canacero_2", "nombre": "Ángulo Doblado", "tipo": "text", "esRequerido": true}, {"id": "f_nmx_b_113_canacero_3", "nombre": "Observaciones Visuales", "tipo": "text", "esRequerido": true}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Ductilidad productos acero", "equipo": ["Mandriles", "Prensa doblado"], "procedimiento_resumido": ["1. Doblar 180° sobre mandril", "2. Inspeccionar fisuras"]}'::jsonb
WHERE codigo = 'NMX-B-113-CANACERO';

-- Actualizar NMX-B-290-CANACERO
UPDATE normas SET
  nombre = 'Malla Electrosoldada',
  campos = '[{"id": "f_nmx_b_290_canacero_0", "nombre": "Designación 6x6-10/10 etc", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_b_290_canacero_1", "nombre": "Esfuerzo Fluencia", "tipo": "text", "esRequerido": true, "unidad": "MPa"}, {"id": "f_nmx_b_290_canacero_2", "nombre": "Resistencia Soldadura", "tipo": "number", "esRequerido": true, "unidad": "MPa"}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Especificaciones malla electrosoldada", "equipo": ["Vernier", "Tracción soldadura"], "procedimiento_resumido": ["1. Medir diámetros/separaciones", "2. Ensayo tracción nudos"]}'::jsonb
WHERE codigo = 'NMX-B-290-CANACERO';

-- Actualizar NMX-C-414-ONNCCE
UPDATE normas SET
  nombre = 'Calidad de Cemento',
  campos = '[{"id": "f_nmx_c_414_onncce_0", "nombre": "Tipo de Cemento", "tipo": "text", "esRequerido": true}, {"id": "f_nmx_c_414_onncce_1", "nombre": "Clase de Resistencia", "tipo": "number", "esRequerido": true, "unidad": "MPa"}, {"id": "f_nmx_c_414_onncce_2", "nombre": "Tiempo Fraguado Inicial", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_c_414_onncce_3", "nombre": "Tiempo Fraguado Final", "tipo": "number", "esRequerido": true}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Especificaciones cementos hidráulicos", "equipo": ["Vicat", "Prensa cubos mortero"], "procedimiento_resumido": ["1. Mortero normal → Cubos 50mm", "2. Compresión 3/7/28 días", "3. Fraguado Vicat"]}'::jsonb
WHERE codigo = 'NMX-C-414-ONNCCE';

-- Actualizar NMX-C-434-ONNCCE
UPDATE normas SET
  nombre = 'Asfalto por Ignición',
  campos = '[{"id": "f_nmx_c_434_onncce_0", "nombre": "Peso Inicial", "tipo": "number", "esRequerido": true, "unidad": "g"}, {"id": "f_nmx_c_434_onncce_1", "nombre": "Peso Final", "tipo": "number", "esRequerido": true, "unidad": "g"}, {"id": "f_nmx_c_434_onncce_2", "nombre": "Cemento Asfáltico", "tipo": "text", "esRequerido": true}, {"id": "f_nmx_c_434_onncce_3", "nombre": "Factor Calibración", "tipo": "number", "esRequerido": true}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Contenido ligante asfáltico", "equipo": ["Horno ignición", "Crisol"], "procedimiento_resumido": ["1. Pesar muestra → Ignición controlada", "2. Pesar residuo → % asfalto = [(Ini-Fin)/Ini]×100"]}'::jsonb
WHERE codigo = 'NMX-C-434-ONNCCE';

-- Actualizar NMX-C-159-ONNCCE
UPDATE normas SET
  nombre = 'Elaboración de Muestras',
  campos = '[{"id": "f_nmx_c_159_onncce_0", "nombre": "Temp. Concreto °C", "tipo": "number", "esRequerido": true, "unidad": "°C"}, {"id": "f_nmx_c_159_onncce_1", "nombre": "Temp. Ambiente °C", "tipo": "number", "esRequerido": true, "unidad": "°C"}, {"id": "f_nmx_c_159_onncce_2", "nombre": "Compactación", "tipo": "number", "esRequerido": true}, {"id": "f_nmx_c_159_onncce_3", "nombre": "Tipo de Curado", "tipo": "text", "esRequerido": true}, {"id": "f_nmx_c_159_onncce_4", "nombre": "Hora Elaboración", "tipo": "text", "esRequerido": true}]'::jsonb,
  detalles_adicionales = '{"objetivo": "Moldeo/curado especímenes laboratorio", "equipo": ["Moldes normalizados", "Varillas vibración"], "procedimiento_resumido": ["1. 2-3 capas × 25 varillazos", "2. Desmoldar 24h → Curado húmedo 23°C"]}'::jsonb
WHERE codigo = 'NMX-C-159-ONNCCE';

