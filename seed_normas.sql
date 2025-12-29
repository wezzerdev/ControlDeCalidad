-- Seed Normas Mexicanas (NMX) - Extended
-- This script populates the database with a comprehensive list of Mexican construction norms.

INSERT INTO "public"."normas" ("codigo", "nombre", "tipo", "descripcion", "activa", "campos")
VALUES 
-- CONCRETO
(
  'NMX-C-414-ONNCCE', 
  'Industria de la construcción - Cementos hidráulicos - Especificaciones y métodos de prueba', 
  'NMX', 
  'Establece las especificaciones y métodos de prueba que deben cumplir los cementos hidráulicos.',
  true,
  '[
    {"id": "f_414_tipo", "nombre": "Tipo de Cemento", "tipo": "select", "opciones": ["CPO", "CPP", "CPEG", "CPC", "CPS", "CEG"], "esRequerido": true},
    {"id": "f_414_resist", "nombre": "Clase de Resistencia", "tipo": "select", "opciones": ["20", "30", "30R", "40", "40R"], "esRequerido": true},
    {"id": "f_414_fraguado_ini", "nombre": "Tiempo Fraguado Inicial", "tipo": "number", "unidad": "min", "limiteMin": 45, "esRequerido": true},
    {"id": "f_414_fraguado_fin", "nombre": "Tiempo Fraguado Final", "tipo": "number", "unidad": "min", "limiteMax": 600, "esRequerido": true}
  ]'::jsonb
),
(
  'NMX-C-155-ONNCCE', 
  'Industria de la construcción - Concreto hidráulico - Especificaciones', 
  'NMX', 
  'Especificaciones para el concreto hidráulico dosificado en masa o volumen.',
  true,
  '[
    {"id": "f_155_fc", "nombre": "Resistencia Diseño (f''c)", "tipo": "number", "unidad": "kg/cm²", "esRequerido": true},
    {"id": "f_155_edad", "nombre": "Edad de Garantía", "tipo": "number", "unidad": "días", "esRequerido": true},
    {"id": "f_155_tma", "nombre": "Tamaño Máximo Agregado", "tipo": "number", "unidad": "mm", "esRequerido": true},
    {"id": "f_155_rev", "nombre": "Revenimiento Nominal", "tipo": "number", "unidad": "cm", "esRequerido": true}
  ]'::jsonb
),
(
  'NMX-C-083-ONNCCE', 
  'Industria de la construcción - Concreto - Determinación de la resistencia a la compresión de cilindros', 
  'NMX', 
  'Método de ensayo para determinar la resistencia a la compresión.',
  true,
  '[
    {"id": "f_083_edad", "nombre": "Edad de Ensayo", "tipo": "number", "unidad": "días", "esRequerido": true},
    {"id": "f_083_diam", "nombre": "Diámetro Promedio", "tipo": "number", "unidad": "cm", "esRequerido": true},
    {"id": "f_083_area", "nombre": "Área", "tipo": "number", "unidad": "cm²", "esRequerido": true},
    {"id": "f_083_carga", "nombre": "Carga Máxima", "tipo": "number", "unidad": "kgf", "esRequerido": true},
    {"id": "f_083_res", "nombre": "Resistencia", "tipo": "number", "unidad": "kg/cm²", "esRequerido": true},
    {"id": "f_083_fallo", "nombre": "Tipo de Falla", "tipo": "select", "opciones": ["Tipo 1", "Tipo 2", "Tipo 3", "Tipo 4", "Tipo 5", "Tipo 6"], "esRequerido": true}
  ]'::jsonb
),
(
  'NMX-C-156-ONNCCE', 
  'Industria de la construcción - Concreto - Determinación del revenimiento en el concreto fresco', 
  'NMX', 
  'Método para determinar la consistencia del concreto fresco.',
  true,
  '[
    {"id": "f_156_rev", "nombre": "Revenimiento Obtenido", "tipo": "number", "unidad": "cm", "esRequerido": true},
    {"id": "f_156_hora", "nombre": "Hora de Muestreo", "tipo": "text", "esRequerido": true}
  ]'::jsonb
),
(
  'NMX-C-161-ONNCCE', 
  'Industria de la construcción - Concreto fresco - Muestreo', 
  'NMX', 
  'Procedimientos para obtener muestras representativas de concreto fresco.',
  true,
  '[
    {"id": "f_161_vol", "nombre": "Volumen de Muestra", "tipo": "number", "unidad": "L", "esRequerido": true},
    {"id": "f_161_proc", "nombre": "Procedimiento", "tipo": "select", "opciones": ["Descarga Camión", "Pavimentadora", "Bomba"], "esRequerido": true},
    {"id": "f_161_temp", "nombre": "Temperatura Concreto", "tipo": "number", "unidad": "°C", "esRequerido": true},
    {"id": "f_161_amb", "nombre": "Temperatura Ambiente", "tipo": "number", "unidad": "°C", "esRequerido": true}
  ]'::jsonb
),
(
  'NMX-C-109-ONNCCE', 
  'Industria de la construcción - Concreto - Cabeceo de especímenes cilíndricos', 
  'NMX', 
  'Procedimiento para el cabeceo de cilindros de concreto.',
  true,
  '[
    {"id": "f_109_mat", "nombre": "Material de Cabeceo", "tipo": "select", "opciones": ["Azufre", "Neopreno", "Pasta Cemento"], "esRequerido": true},
    {"id": "f_109_esp", "nombre": "Espesor Promedio", "tipo": "number", "unidad": "mm", "limiteMax": 3, "esRequerido": true},
    {"id": "f_109_plan", "nombre": "Planicidad", "tipo": "select", "opciones": ["Conforme", "No Conforme"], "esRequerido": true}
  ]'::jsonb
),
(
  'NMX-C-169-ONNCCE', 
  'Industria de la construcción - Concreto - Obtención y ensayo de corazones y vigas', 
  'NMX', 
  'Determinación de la resistencia a la flexión (Vigas).',
  true,
  '[
    {"id": "f_169_ancho", "nombre": "Ancho Promedio", "tipo": "number", "unidad": "cm", "esRequerido": true},
    {"id": "f_169_peralte", "nombre": "Peralte Promedio", "tipo": "number", "unidad": "cm", "esRequerido": true},
    {"id": "f_169_claro", "nombre": "Claro de Ensayo", "tipo": "number", "unidad": "cm", "esRequerido": true},
    {"id": "f_169_carga", "nombre": "Carga Máxima", "tipo": "number", "unidad": "kgf", "esRequerido": true},
    {"id": "f_169_mr", "nombre": "Módulo de Ruptura (MR)", "tipo": "number", "unidad": "kg/cm²", "esRequerido": true}
  ]'::jsonb
),
(
  'NMX-C-128-ONNCCE', 
  'Industria de la construcción - Concreto - Determinación del módulo de elasticidad estático', 
  'NMX', 
  'Ensayo para determinar el módulo de elasticidad y relación de Poisson.',
  true,
  '[
    {"id": "f_128_carga1", "nombre": "Carga 40%", "tipo": "number", "unidad": "kgf", "esRequerido": true},
    {"id": "f_128_def1", "nombre": "Deformación 40%", "tipo": "number", "unidad": "mm", "esRequerido": true},
    {"id": "f_128_mod", "nombre": "Módulo Elasticidad", "tipo": "number", "unidad": "kg/cm²", "esRequerido": true}
  ]'::jsonb
),

-- AGREGADOS
(
  'NMX-C-077-ONNCCE', 
  'Industria de la construcción - Agregados para concreto - Análisis granulométrico', 
  'NMX', 
  'Determinación de la distribución del tamaño de partículas.',
  true,
  '[
    {"id": "f_077_tm", "nombre": "Malla", "tipo": "text", "scope": "specimen", "esRequerido": true},
    {"id": "f_077_ret", "nombre": "Peso Retenido", "tipo": "number", "unidad": "g", "scope": "specimen", "esRequerido": true},
    {"id": "f_077_porc", "nombre": "% Retenido Parcial", "tipo": "number", "unidad": "%", "scope": "specimen", "esRequerido": true},
    {"id": "f_077_acum", "nombre": "% Retenido Acumulado", "tipo": "number", "unidad": "%", "scope": "specimen", "esRequerido": true},
    {"id": "f_077_pasa", "nombre": "% Que Pasa", "tipo": "number", "unidad": "%", "scope": "specimen", "esRequerido": true},
    {"id": "f_077_mf", "nombre": "Módulo de Finura", "tipo": "number", "scope": "global", "esRequerido": true}
  ]'::jsonb
),
(
  'NMX-C-111-ONNCCE', 
  'Industria de la construcción - Agregados para concreto hidráulico - Especificaciones', 
  'NMX', 
  'Requisitos de calidad para agregados finos y gruesos.',
  true,
  '[
    {"id": "f_111_type", "nombre": "Tipo de Agregado", "tipo": "select", "opciones": ["Fino", "Grueso"], "esRequerido": true},
    {"id": "f_111_den", "nombre": "Densidad Relativa", "tipo": "number", "esRequerido": true},
    {"id": "f_111_abs", "nombre": "Absorción", "tipo": "number", "unidad": "%", "esRequerido": true}
  ]'::jsonb
),
(
  'NMX-C-164-ONNCCE', 
  'Industria de la construcción - Agregados - Determinación de la densidad relativa y absorción de agregado grueso', 
  'NMX', 
  'Método de prueba para densidad y absorción de gravas.',
  true,
  '[
    {"id": "f_164_aire", "nombre": "Peso al Aire", "tipo": "number", "unidad": "g", "esRequerido": true},
    {"id": "f_164_agua", "nombre": "Peso en Agua", "tipo": "number", "unidad": "g", "esRequerido": true},
    {"id": "f_164_sss", "nombre": "Peso SSS", "tipo": "number", "unidad": "g", "esRequerido": true},
    {"id": "f_164_den", "nombre": "Densidad Relativa (SSS)", "tipo": "number", "esRequerido": true},
    {"id": "f_164_abs", "nombre": "% Absorción", "tipo": "number", "unidad": "%", "esRequerido": true}
  ]'::jsonb
),
(
  'NMX-C-165-ONNCCE', 
  'Industria de la construcción - Agregados - Determinación de la densidad relativa y absorción de agregado fino', 
  'NMX', 
  'Método de prueba para densidad y absorción de arenas.',
  true,
  '[
    {"id": "f_165_matraz", "nombre": "Peso Matraz + Agua", "tipo": "number", "unidad": "g", "esRequerido": true},
    {"id": "f_165_total", "nombre": "Peso Matraz + Muestra + Agua", "tipo": "number", "unidad": "g", "esRequerido": true},
    {"id": "f_165_sss", "nombre": "Peso Muestra SSS", "tipo": "number", "unidad": "g", "esRequerido": true},
    {"id": "f_165_den", "nombre": "Densidad Relativa", "tipo": "number", "esRequerido": true},
    {"id": "f_165_abs", "nombre": "% Absorción", "tipo": "number", "unidad": "%", "esRequerido": true}
  ]'::jsonb
),
(
  'NMX-C-196-ONNCCE', 
  'Industria de la construcción - Agregados - Resistencia a la degradación por abrasión (Máquina de los Ángeles)', 
  'NMX', 
  'Determinación del desgaste en agregados gruesos.',
  true,
  '[
    {"id": "f_196_grado", "nombre": "Graduación", "tipo": "select", "opciones": ["A", "B", "C", "D"], "esRequerido": true},
    {"id": "f_196_pi", "nombre": "Peso Inicial", "tipo": "number", "unidad": "g", "esRequerido": true},
    {"id": "f_196_pf", "nombre": "Peso Final (Tamiz 12)", "tipo": "number", "unidad": "g", "esRequerido": true},
    {"id": "f_196_desg", "nombre": "% Desgaste", "tipo": "number", "unidad": "%", "esRequerido": true}
  ]'::jsonb
),
(
  'NMX-C-305-ONNCCE', 
  'Industria de la construcción - Agregados - Equivalente de arena', 
  'NMX', 
  'Determinación del equivalente de arena de suelos y agregados finos.',
  true,
  '[
    {"id": "f_305_arcilla", "nombre": "Lectura Arcilla", "tipo": "number", "unidad": "mm", "esRequerido": true},
    {"id": "f_305_arena", "nombre": "Lectura Arena", "tipo": "number", "unidad": "mm", "esRequerido": true},
    {"id": "f_305_ea", "nombre": "Equivalente de Arena", "tipo": "number", "unidad": "%", "esRequerido": true}
  ]'::jsonb
),

-- ACEROS
(
  'NMX-B-457-CANACERO', 
  'Industria siderúrgica - Varilla corrugada de acero de refuerzo - Especificaciones', 
  'NMX', 
  'Especificaciones para varilla corrugada.',
  true,
  '[
    {"id": "f_457_grado", "nombre": "Grado", "tipo": "select", "opciones": ["42", "52"], "esRequerido": true},
    {"id": "f_457_num", "nombre": "Número de Varilla", "tipo": "text", "esRequerido": true},
    {"id": "f_457_fy", "nombre": "Esfuerzo Fluencia (Fy)", "tipo": "number", "unidad": "MPa", "esRequerido": true},
    {"id": "f_457_fu", "nombre": "Resistencia Tensión (R)", "tipo": "number", "unidad": "MPa", "esRequerido": true},
    {"id": "f_457_alarg", "nombre": "Alargamiento", "tipo": "number", "unidad": "%", "esRequerido": true}
  ]'::jsonb
),
(
  'NMX-B-113-CANACERO', 
  'Industria siderúrgica - Método de prueba de doblado para productos de acero', 
  'NMX', 
  'Prueba de doblado para varillas y alambres.',
  true,
  '[
    {"id": "f_113_diam", "nombre": "Diámetro Mandril", "tipo": "number", "unidad": "mm", "esRequerido": true},
    {"id": "f_113_angulo", "nombre": "Ángulo Doblado", "tipo": "number", "unidad": "°", "esRequerido": true},
    {"id": "f_113_obs", "nombre": "Observaciones Visuales", "tipo": "select", "opciones": ["Sin grietas", "Grietas leves", "Fractura"], "esRequerido": true}
  ]'::jsonb
),
(
  'NMX-B-290-CANACERO', 
  'Industria siderúrgica - Malla electrosoldada de acero - Especificaciones', 
  'NMX', 
  'Especificaciones y pruebas para malla electrosoldada.',
  true,
  '[
    {"id": "f_290_desig", "nombre": "Designación (6x6-10/10 etc)", "tipo": "text", "esRequerido": true},
    {"id": "f_290_fy", "nombre": "Esfuerzo Fluencia", "tipo": "number", "unidad": "MPa", "esRequerido": true},
    {"id": "f_290_sold", "nombre": "Resistencia Soldadura", "tipo": "number", "unidad": "kgf", "esRequerido": true}
  ]'::jsonb
),

-- TERRACERÍAS
(
  'NMX-C-416-ONNCCE', 
  'Industria de la construcción - Muestreo de estructuras térreas y métodos de prueba', 
  'NMX', 
  'Compactación y peso volumétrico en sitio.',
  true,
  '[
    {"id": "f_416_pvsm", "nombre": "PVSM (Proctor)", "tipo": "number", "unidad": "kg/m³", "esRequerido": true},
    {"id": "f_416_hum_opt", "nombre": "Humedad Óptima", "tipo": "number", "unidad": "%", "esRequerido": true},
    {"id": "f_416_pv_sitio", "nombre": "Peso Vol. Sitio", "tipo": "number", "unidad": "kg/m³", "esRequerido": true},
    {"id": "f_416_hum_sitio", "nombre": "Humedad Sitio", "tipo": "number", "unidad": "%", "esRequerido": true},
    {"id": "f_416_comp", "nombre": "% Compactación", "tipo": "number", "unidad": "%", "esRequerido": true}
  ]'::jsonb
),
(
  'NMX-C-468-ONNCCE', 
  'Industria de la construcción - Geotecnia - Límites de consistencia', 
  'NMX', 
  'Determinación de Límite Líquido, Plástico e Índice Plástico (Límites de Atterberg).',
  true,
  '[
    {"id": "f_468_ll", "nombre": "Límite Líquido (LL)", "tipo": "number", "unidad": "%", "esRequerido": true},
    {"id": "f_468_lp", "nombre": "Límite Plástico (LP)", "tipo": "number", "unidad": "%", "esRequerido": true},
    {"id": "f_468_ip", "nombre": "Índice Plástico (IP)", "tipo": "number", "unidad": "%", "esRequerido": true}
  ]'::jsonb
),
(
  'NMX-C-476-ONNCCE', 
  'Industria de la construcción - Geotecnia - Compactación dinámica estándar (Proctor Estándar)', 
  'NMX', 
  'Método de prueba para determinar la curva de compactación.',
  true,
  '[
    {"id": "f_476_pvsm", "nombre": "Peso Vol. Seco Máx", "tipo": "number", "unidad": "kg/m³", "esRequerido": true},
    {"id": "f_476_hum", "nombre": "Humedad Óptima", "tipo": "number", "unidad": "%", "esRequerido": true},
    {"id": "f_476_golpes", "nombre": "Golpes por Capa", "tipo": "number", "esRequerido": true}
  ]'::jsonb
),
(
  'NMX-C-431-ONNCCE', 
  'Industria de la construcción - Geotecnia - Valor Relativo de Soporte (CBR)', 
  'NMX', 
  'Determinación de la capacidad de soporte del suelo.',
  true,
  '[
    {"id": "f_431_cbr_100", "nombre": "CBR al 100%", "tipo": "number", "unidad": "%", "esRequerido": true},
    {"id": "f_431_cbr_95", "nombre": "CBR al 95%", "tipo": "number", "unidad": "%", "esRequerido": true},
    {"id": "f_431_exp", "nombre": "Expansión", "tipo": "number", "unidad": "%", "esRequerido": true}
  ]'::jsonb
),

-- MEZCLAS ASFÁLTICAS
(
  'NMX-C-434-ONNCCE', 
  'Industria de la construcción - Asfalto - Contenido de asfalto por ignición', 
  'NMX', 
  'Determinación del contenido de cemento asfáltico.',
  true,
  '[
    {"id": "f_434_pi", "nombre": "Peso Inicial", "tipo": "number", "unidad": "g", "esRequerido": true},
    {"id": "f_434_pf", "nombre": "Peso Final", "tipo": "number", "unidad": "g", "esRequerido": true},
    {"id": "f_434_ca", "nombre": "% Cemento Asfáltico", "tipo": "number", "unidad": "%", "esRequerido": true},
    {"id": "f_434_calib", "nombre": "Factor Calibración", "tipo": "number", "esRequerido": true}
  ]'::jsonb
);
