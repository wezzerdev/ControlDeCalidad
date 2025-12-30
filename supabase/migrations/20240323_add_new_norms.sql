-- Insert NMX-C-159
INSERT INTO normas (
  codigo, 
  nombre, 
  tipo, 
  descripcion, 
  activa, 
  created_at, 
  tipos_muestra_compatibles, 
  campos
) VALUES (
  'NMX-C-159-ONNCCE',
  'Elaboración y Curado de Especímenes',
  'NMX',
  'Elaboración y curado de especímenes de ensayo de concreto en el laboratorio.',
  true,
  NOW(),
  ARRAY['Concreto'],
  '[
    { "id": "f_c159_temp_con", "nombre": "Temp. Concreto (°C)", "tipo": "number", "esRequerido": true },
    { "id": "f_c159_temp_amb", "nombre": "Temp. Ambiente (°C)", "tipo": "number", "esRequerido": true },
    { "id": "f_c159_method", "nombre": "Compactación", "tipo": "select", "opciones": ["Varillado", "Vibrado"], "esRequerido": true },
    { "id": "f_c159_cure", "nombre": "Tipo de Curado", "tipo": "select", "opciones": ["Húmedo", "Cuarto de Niebla", "Gabinete"], "esRequerido": true },
    { "id": "f_c159_time", "nombre": "Hora Elaboración", "tipo": "text", "esRequerido": true }
  ]'::jsonb
);

-- Insert NMX-C-148
INSERT INTO normas (
  codigo, 
  nombre, 
  tipo, 
  descripcion, 
  activa, 
  created_at, 
  tipos_muestra_compatibles, 
  campos
) VALUES (
  'NMX-C-148-ONNCCE',
  'Gabinetes y Cuartos Húmedos',
  'NMX',
  'Requisitos para gabinetes, cuartos húmedos y tanques de almacenamiento.',
  true,
  NOW(),
  ARRAY['Concreto', 'Otro'],
  '[
    { "id": "f_c148_temp", "nombre": "Temperatura (°C)", "tipo": "number", "limiteMin": 21, "limiteMax": 25, "esRequerido": true },
    { "id": "f_c148_hum", "nombre": "Humedad Relativa (%)", "tipo": "number", "limiteMin": 95, "esRequerido": true },
    { "id": "f_c148_lime", "nombre": "Agua Saturada con Cal", "tipo": "boolean", "esRequerido": true },
    { "id": "f_c148_rec", "nombre": "Registro Automático", "tipo": "boolean", "esRequerido": true }
  ]'::jsonb
);
