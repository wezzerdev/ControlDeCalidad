export type UserRole = 'administrador' | 'tecnico' | 'residente' | 'gerente';

export interface UserPermissions {
  access_proyectos: boolean;
  access_muestras: boolean;
  access_ensayos: boolean;
  access_certificados: boolean;
  access_inventarios: boolean;
  access_resultados: boolean;
  access_reportes: boolean;
  access_auditoria: boolean;
  access_notificaciones: boolean;
}

export const getPermissionsForRole = (role: UserRole): UserPermissions => {
  switch (role) {
    case 'administrador':
    case 'gerente':
      return {
        access_proyectos: true,
        access_muestras: true,
        access_ensayos: true,
        access_certificados: true,
        access_inventarios: true,
        access_resultados: true,
        access_reportes: true,
        access_auditoria: true,
        access_notificaciones: true
      };
    case 'residente':
      return {
        access_proyectos: true,
        access_muestras: true,
        access_ensayos: false,
        access_certificados: true,
        access_inventarios: false,
        access_resultados: true,
        access_reportes: false,
        access_auditoria: false,
        access_notificaciones: true
      };
    case 'tecnico':
    default:
      return {
        access_proyectos: true,
        access_muestras: true,
        access_ensayos: true,
        access_certificados: false,
        access_inventarios: false,
        access_resultados: true,
        access_reportes: false,
        access_auditoria: false,
        access_notificaciones: true
      };
  }
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  password?: string; // For mock auth only
  permissions?: UserPermissions;
  preferences?: {
    theme: 'light' | 'dark';
    primaryColor?: string;
    language: string;
    notifications: boolean;
  };
  createdAt: string;
  lastLogin: string;
  companyId?: string;
}

const defaultPermissions: UserPermissions = {
  access_proyectos: true,
  access_muestras: true,
  access_ensayos: true,
  access_certificados: true,
  access_inventarios: true,
  access_resultados: true,
  access_reportes: true,
  access_auditoria: true,
  access_notificaciones: true
};

export const mockUsers: User[] = [
  {
    id: 'user_admin',
    email: 'admin@laboratorio.com',
    name: 'Admin Principal',
    role: 'administrador',
    password: 'password123',
    avatar: 'https://ui-avatars.com/api/?name=Admin+Principal&background=25A418&color=fff',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
    permissions: defaultPermissions
  },
  {
    id: 'user_tecnico',
    email: 'tecnico@laboratorio.com',
    name: 'Juan Técnico',
    role: 'tecnico',
    password: 'password123',
    avatar: 'https://ui-avatars.com/api/?name=Juan+Tecnico&background=random',
    createdAt: '2024-01-02T00:00:00Z',
    lastLogin: new Date().toISOString(),
    permissions: defaultPermissions
  },
  {
    id: 'user_residente',
    email: 'residente@obra.com',
    name: 'Ing. Residente',
    role: 'residente',
    password: 'password123',
    avatar: 'https://ui-avatars.com/api/?name=Ing+Residente&background=random',
    createdAt: '2024-01-03T00:00:00Z',
    lastLogin: new Date().toISOString(),
    permissions: {
      access_proyectos: true,
      access_muestras: true, // Can see samples
      access_ensayos: false, // Cannot see tests details maybe?
      access_certificados: true, // Can download certs
      access_inventarios: false,
      access_resultados: true,
      access_reportes: false,
      access_auditoria: false,
      access_notificaciones: true
    }
  },
  {
    id: 'user_gerente',
    email: 'gerente@constructora.com',
    name: 'Gerente General',
    role: 'gerente',
    password: 'password123',
    avatar: 'https://ui-avatars.com/api/?name=Gerente+General&background=random',
    createdAt: '2024-01-04T00:00:00Z',
    lastLogin: new Date().toISOString(),
    permissions: defaultPermissions
  }
];

export interface NormaField {
  id: string;
  nombre: string;
  tipo: 'number' | 'text' | 'select' | 'boolean';
  unidad?: string;
  limiteMin?: number;
  limiteMax?: number;
  esRequerido: boolean;
  opciones?: string[]; // Para tipo select
  scope?: 'global' | 'specimen'; // 'global' = one value for test, 'specimen' = one value per specimen
}

export type SampleTypeCategory = 'Concreto' | 'Suelo' | 'Acero' | 'Agregados' | 'Asfalto' | 'Otro';

export interface Norma {
  id: string;
  codigo: string;
  nombre: string;
  tipo: 'NMX' | 'ACI' | 'ASTM' | 'Local' | 'Privada';
  descripcion: string;
  campos: NormaField[];
  activa: boolean;
  creadaPor: string;
  createdAt: string;
  // New field for relationship
  tiposMuestraCompatibles: SampleTypeCategory[];
  tutorial?: {
      pasos: string[];
      videoUrl?: string; // Optional link to a video
      tips?: string[];
  };
}

export const mockNormas: Norma[] = [
  {
    id: 'norma_nmx_c414',
    codigo: 'NMX-C-414',
    nombre: 'Concreto Hidráulico - Cabecería',
    tipo: 'NMX',
    descripcion: 'Norma mexicana para especificaciones de concreto hidráulico',
    activa: true,
    creadaPor: 'user_admin',
    createdAt: '2024-01-01T00:00:00Z',
    tiposMuestraCompatibles: ['Concreto'],
    tutorial: {
        pasos: [
            'Verificar que el espécimen cumpla con las dimensiones requeridas.',
            'Preparar la mezcla de azufre o almohadillas de neopreno según corresponda.',
            'Colocar el cabeceo asegurando la perpendicularidad.',
            'Dejar enfriar o asentar antes de la prueba.'
        ],
        tips: ['Revisar la planeidad de las placas de cabeceo periódicamente.']
    },
    campos: [
      {
        id: 'f1',
        nombre: 'Resistencia Compresión',
        tipo: 'number',
        unidad: 'kg/cm²',
        limiteMin: 200,
        esRequerido: true
      },
      {
        id: 'f2',
        nombre: 'Revenimiento',
        tipo: 'number',
        unidad: 'cm',
        limiteMin: 8,
        limiteMax: 12,
        esRequerido: true
      }
    ]
  },
  {
    id: 'norma_aci_318',
    codigo: 'ACI 318',
    nombre: 'Building Code Requirements for Structural Concrete',
    tipo: 'ACI',
    descripcion: 'Standard for structural concrete',
    activa: true,
    creadaPor: 'user_admin',
    createdAt: '2024-01-05T00:00:00Z',
    tiposMuestraCompatibles: ['Concreto'],
    campos: [
      {
        id: 'f_aci_qty',
        nombre: 'Cantidad de Cilindros',
        tipo: 'number',
        limiteMin: 1,
        limiteMax: 10,
        esRequerido: true,
        scope: 'global'
      },
      {
        id: 'f_aci_fc',
        nombre: 'f\'c de Diseño',
        tipo: 'number',
        unidad: 'MPa',
        limiteMin: 20,
        esRequerido: true,
        scope: 'specimen'
      },
      {
        id: 'f_aci_age',
        nombre: 'Edad de Evaluación',
        tipo: 'select',
        opciones: ['7 días', '14 días', '28 días'],
        esRequerido: true,
        scope: 'specimen'
      },
      {
        id: 'f_aci_method',
        nombre: 'Método de Aceptación',
        tipo: 'select',
        opciones: ['Promedio de 3', 'Promedio de 2', 'Valor Individual'],
        esRequerido: true,
        scope: 'specimen'
      },
      {
        id: 'f_aci_pass',
        nombre: 'Cumplimiento',
        tipo: 'boolean',
        esRequerido: true,
        scope: 'specimen'
      }
    ]
  },
  {
    id: 'norma_nmx_c155',
    codigo: 'NMX-C-155-ONNCCE-2014',
    nombre: 'Concreto Hidráulico - Especificaciones',
    tipo: 'NMX',
    descripcion: 'Establece las especificaciones para el concreto hidráulico en estado fresco y endurecido.',
    activa: true,
    creadaPor: 'user_admin',
    createdAt: '2024-01-10T00:00:00Z',
    tiposMuestraCompatibles: ['Concreto'],
    campos: [
      {
        id: 'f_c155_cement',
        nombre: 'Tipo de Cemento',
        tipo: 'text',
        esRequerido: true
      },
      {
        id: 'f_c155_wc',
        nombre: 'Relación Agua/Cemento',
        tipo: 'number',
        limiteMin: 0.3,
        limiteMax: 0.8,
        esRequerido: true
      },
      {
        id: 'f_c155_class',
        nombre: 'Clase de Concreto',
        tipo: 'select',
        opciones: ['Clase 1', 'Clase 2'],
        esRequerido: true
      },
      {
        id: 'f_c155_struct',
        nombre: 'Uso Estructural',
        tipo: 'boolean',
        esRequerido: true
      }
    ]
  },
  {
    id: 'norma_nmx_c161',
    codigo: 'NMX-C-161-ONNCCE-2013',
    nombre: 'Concreto Fresco - Muestreo',
    tipo: 'NMX',
    descripcion: 'Método para la obtención de muestras de concreto fresco en obra.',
    activa: true,
    creadaPor: 'user_admin',
    createdAt: '2024-01-10T00:00:00Z',
    tiposMuestraCompatibles: ['Concreto'],
    campos: [
      {
        id: 'f_c161_place',
        nombre: 'Lugar de Muestreo',
        tipo: 'text',
        esRequerido: true
      },
      {
        id: 'f_c161_time',
        nombre: 'Hora de Muestreo',
        tipo: 'text',
        esRequerido: true
      },
      {
        id: 'f_c161_method',
        nombre: 'Método de Muestreo',
        tipo: 'select',
        opciones: ['Descarga de Camión', 'Bomba', 'Molde'],
        esRequerido: true
      }
    ]
  },
  {
    id: 'norma_nmx_c083',
    codigo: 'NMX-C-083-ONNCCE-2014',
    nombre: 'Resistencia a la Compresión',
    tipo: 'NMX',
    descripcion: 'Determinación de la resistencia a la compresión de cilindros de concreto.',
    activa: true,
    creadaPor: 'user_admin',
    createdAt: '2024-01-10T00:00:00Z',
    tiposMuestraCompatibles: ['Concreto'],
    campos: [
      {
        id: 'f_c083_qty',
        nombre: 'Número de Cilindros',
        tipo: 'number',
        limiteMin: 1,
        limiteMax: 6,
        esRequerido: true,
        scope: 'global'
      },
      {
        id: 'f_c083_age',
        nombre: 'Edad de Ensayo',
        tipo: 'select',
        opciones: ['3 días', '7 días', '14 días', '28 días', '56 días'],
        esRequerido: true,
        scope: 'specimen'
      },
      {
        id: 'f_c083_1',
        nombre: 'Diámetro',
        tipo: 'number',
        unidad: 'cm',
        limiteMin: 14.8,
        limiteMax: 15.2,
        esRequerido: true,
        scope: 'specimen'
      },
      {
        id: 'f_c083_2',
        nombre: 'Altura',
        tipo: 'number',
        unidad: 'cm',
        limiteMin: 29.5,
        limiteMax: 30.5,
        esRequerido: true,
        scope: 'specimen'
      },
      {
        id: 'f_c083_3',
        nombre: 'Carga Máxima',
        tipo: 'number',
        unidad: 'kgf',
        esRequerido: true,
        scope: 'specimen'
      },
      {
        id: 'f_c083_4',
        nombre: 'Resistencia Calculada',
        tipo: 'number',
        unidad: 'kg/cm²',
        esRequerido: true,
        scope: 'specimen'
      }
    ]
  },
  {
    id: 'norma_nmx_c156',
    codigo: 'NMX-C-156-ONNCCE-2010',
    nombre: 'Revenimiento',
    tipo: 'NMX',
    descripcion: 'Determinación del revenimiento en el concreto fresco.',
    activa: true,
    creadaPor: 'user_admin',
    createdAt: '2024-01-10T00:00:00Z',
    tiposMuestraCompatibles: ['Concreto'],
    campos: [
      {
        id: 'f_c156_rev',
        nombre: 'Revenimiento',
        tipo: 'number',
        unidad: 'cm',
        esRequerido: true
      },
      {
        id: 'f_c156_cone',
        nombre: 'Tipo de Cono',
        tipo: 'select',
        opciones: ['Normal', 'Reducido'],
        esRequerido: true
      },
      {
        id: 'f_c156_obs',
        nombre: 'Observaciones',
        tipo: 'text',
        esRequerido: false
      }
    ]
  },
  {
    id: 'norma_nmx_c109',
    codigo: 'NMX-C-109-ONNCCE-2013',
    nombre: 'Cabeceo de Especímenes',
    tipo: 'NMX',
    descripcion: 'Procedimientos para el cabeceo de especímenes cilíndricos de concreto.',
    activa: true,
    creadaPor: 'user_admin',
    createdAt: '2024-01-10T00:00:00Z',
    tiposMuestraCompatibles: ['Concreto'],
    campos: [
      {
        id: 'f_c109_method',
        nombre: 'Método de Cabeceo',
        tipo: 'select',
        opciones: ['Azufre', 'Neopreno', 'Pasta de Cemento'],
        esRequerido: true
      },
      {
        id: 'f_c109_thick',
        nombre: 'Espesor del Cabeceo',
        tipo: 'number',
        unidad: 'mm',
        limiteMax: 3,
        esRequerido: true
      },
      {
        id: 'f_c109_cond',
        nombre: 'Condición del Espécimen',
        tipo: 'select',
        opciones: ['Bueno', 'Regular', 'Malo'],
        esRequerido: true
      }
    ]
  },
  {
    id: 'norma_nmx_c159',
    codigo: 'NMX-C-159-ONNCCE',
    nombre: 'Elaboración y Curado',
    tipo: 'NMX',
    descripcion: 'Elaboración y curado de especímenes de ensayo de concreto en el laboratorio.',
    activa: true,
    creadaPor: 'user_admin',
    createdAt: new Date().toISOString(),
    tiposMuestraCompatibles: ['Concreto'],
    campos: [
      { id: 'f_c159_temp_con', nombre: 'Temp. Concreto (°C)', tipo: 'number', esRequerido: true },
      { id: 'f_c159_temp_amb', nombre: 'Temp. Ambiente (°C)', tipo: 'number', esRequerido: true },
      { id: 'f_c159_method', nombre: 'Compactación', tipo: 'select', opciones: ['Varillado', 'Vibrado'], esRequerido: true },
      { id: 'f_c159_cure', nombre: 'Tipo de Curado', tipo: 'select', opciones: ['Húmedo', 'Cuarto de Niebla', 'Gabinete'], esRequerido: true },
      { id: 'f_c159_time', nombre: 'Hora Elaboración', tipo: 'text', esRequerido: true }
    ]
  },
  {
    id: 'norma_nmx_c148',
    codigo: 'NMX-C-148-ONNCCE',
    nombre: 'Gabinetes y Cuartos Húmedos',
    tipo: 'NMX',
    descripcion: 'Requisitos para gabinetes, cuartos húmedos y tanques de almacenamiento.',
    activa: true,
    creadaPor: 'user_admin',
    createdAt: new Date().toISOString(),
    tiposMuestraCompatibles: ['Concreto', 'Otro' as any],
    campos: [
      { id: 'f_c148_temp', nombre: 'Temperatura (°C)', tipo: 'number', limiteMin: 21, limiteMax: 25, esRequerido: true },
      { id: 'f_c148_hum', nombre: 'Humedad Relativa (%)', tipo: 'number', limiteMin: 95, esRequerido: true },
      { id: 'f_c148_lime', nombre: 'Agua Saturada con Cal', tipo: 'boolean', esRequerido: true },
      { id: 'f_c148_rec', nombre: 'Registro Automático', tipo: 'boolean', esRequerido: true }
    ]
  },
  // --- AGREGADOS Y SUELOS ---
  {
    id: 'norma_nmx_c077',
    codigo: 'NMX-C-077-ONNCCE',
    nombre: 'Análisis Granulométrico',
    tipo: 'NMX',
    descripcion: 'Determinación de la granulometría de los agregados.',
    activa: true,
    creadaPor: 'user_admin',
    createdAt: new Date().toISOString(),
    tiposMuestraCompatibles: ['Agregados', 'Concreto'],
    campos: [
      { id: 'f_c077_mesh', nombre: 'Tamaño de Malla', tipo: 'text', esRequerido: true, scope: 'specimen' },
      { id: 'f_c077_ret', nombre: '% Retenido', tipo: 'number', unidad: '%', esRequerido: true, scope: 'specimen' },
      { id: 'f_c077_acc', nombre: '% Acumulado', tipo: 'number', unidad: '%', esRequerido: true, scope: 'specimen' },
      { id: 'f_c077_pass', nombre: '% Que Pasa', tipo: 'number', unidad: '%', esRequerido: true, scope: 'specimen' },
      { id: 'f_c077_mod', nombre: 'Módulo de Finura', tipo: 'number', esRequerido: true, scope: 'global' },
      { id: 'f_c077_type', nombre: 'Tipo de Agregado', tipo: 'select', opciones: ['Fino', 'Grueso'], esRequerido: true, scope: 'global' }
    ]
  },
  {
    id: 'norma_nmx_c164',
    codigo: 'NMX-C-164-ONNCCE',
    nombre: 'Densidad y Absorción',
    tipo: 'NMX',
    descripcion: 'Determinación de la densidad relativa y absorción de agregados.',
    activa: true,
    creadaPor: 'user_admin',
    createdAt: new Date().toISOString(),
    tiposMuestraCompatibles: ['Agregados', 'Concreto'],
    campos: [
      { id: 'f_c164_dry', nombre: 'Peso Seco', tipo: 'number', unidad: 'g', esRequerido: true },
      { id: 'f_c164_sat', nombre: 'Peso Saturado', tipo: 'number', unidad: 'g', esRequerido: true },
      { id: 'f_c164_den', nombre: 'Densidad Aparente', tipo: 'number', unidad: 'g/cm³', esRequerido: true },
      { id: 'f_c164_abs', nombre: '% Absorción', tipo: 'number', unidad: '%', esRequerido: true }
    ]
  },
  
  // --- TERRACERÍAS ---
  {
    id: 'norma_nmx_c416',
    codigo: 'NMX-C-416-ONNCCE',
    nombre: 'Compactación (Proctor Estándar)',
    tipo: 'NMX',
    descripcion: 'Determinación de la masa volumétrica seca máxima y humedad óptima.',
    activa: true,
    creadaPor: 'user_admin',
    createdAt: new Date().toISOString(),
    tiposMuestraCompatibles: ['Suelo', 'Terracerías' as any],
    campos: [
      { id: 'f_c416_opt', nombre: 'Humedad Óptima', tipo: 'number', unidad: '%', esRequerido: true, scope: 'global' },
      { id: 'f_c416_max', nombre: 'Densidad Máxima', tipo: 'number', unidad: 'kg/m³', esRequerido: true, scope: 'global' },
      { id: 'f_c416_mat', nombre: 'Tipo de Material', tipo: 'text', esRequerido: true, scope: 'global' },
      // Puntos de la curva
      { id: 'f_c416_h', nombre: 'Humedad', tipo: 'number', unidad: '%', esRequerido: true, scope: 'specimen' },
      { id: 'f_c416_d', nombre: 'Densidad Seca', tipo: 'number', unidad: 'kg/m³', esRequerido: true, scope: 'specimen' }
    ]
  },
  {
    id: 'norma_astm_d1883',
    codigo: 'ASTM D1883',
    nombre: 'Valor Relativo de Soporte (CBR)',
    tipo: 'ASTM',
    descripcion: 'California Bearing Ratio of Laboratory-Compacted Soils.',
    activa: true,
    creadaPor: 'user_admin',
    createdAt: new Date().toISOString(),
    tiposMuestraCompatibles: ['Suelo'],
    campos: [
      { id: 'f_d1883_cbr', nombre: '% CBR', tipo: 'number', unidad: '%', esRequerido: true },
      { id: 'f_d1883_cond', nombre: 'Condición de Muestra', tipo: 'select', opciones: ['Remojado', 'No Remojado'], esRequerido: true },
      { id: 'f_d1883_energy', nombre: 'Energía de Compactación', tipo: 'text', esRequerido: true }
    ]
  },
  {
    id: 'norma_astm_d2216',
    codigo: 'ASTM D2216',
    nombre: 'Contenido de Humedad',
    tipo: 'ASTM',
    descripcion: 'Laboratory Determination of Water (Moisture) Content of Soil and Rock.',
    activa: true,
    creadaPor: 'user_admin',
    createdAt: new Date().toISOString(),
    tiposMuestraCompatibles: ['Suelo'],
    campos: [
      { id: 'f_d2216_wet', nombre: 'Peso Húmedo', tipo: 'number', unidad: 'g', esRequerido: true },
      { id: 'f_d2216_dry', nombre: 'Peso Seco', tipo: 'number', unidad: 'g', esRequerido: true },
      { id: 'f_d2216_water', nombre: '% Humedad', tipo: 'number', unidad: '%', esRequerido: true }
    ]
  },

  // --- ACEROS ---
  {
    id: 'norma_nmx_b172',
    codigo: 'NMX-B-172',
    nombre: 'Barras de Acero - Tensión',
    tipo: 'NMX',
    descripcion: 'Métodos de prueba para productos de acero (Tensión).',
    activa: true,
    creadaPor: 'user_admin',
    createdAt: new Date().toISOString(),
    tiposMuestraCompatibles: ['Acero'],
    campos: [
      { id: 'f_b172_diam', nombre: 'Diámetro Nominal', tipo: 'number', unidad: 'mm', esRequerido: true },
      { id: 'f_b172_load', nombre: 'Carga Máxima', tipo: 'number', unidad: 'kgf', esRequerido: true },
      { id: 'f_b172_fy', nombre: 'Esfuerzo de Fluencia (Fy)', tipo: 'number', unidad: 'MPa', limiteMin: 420, esRequerido: true },
      { id: 'f_b172_fu', nombre: 'Esfuerzo Último (Fu)', tipo: 'number', unidad: 'MPa', limiteMin: 630, esRequerido: true }
    ]
  },
  {
    id: 'norma_nmx_b113',
    codigo: 'NMX-B-113',
    nombre: 'Barras de Acero - Doblado',
    tipo: 'NMX',
    descripcion: 'Prueba de doblado para acero de refuerzo.',
    activa: true,
    creadaPor: 'user_admin',
    createdAt: new Date().toISOString(),
    tiposMuestraCompatibles: ['Acero'],
    campos: [
      { id: 'f_b113_diam', nombre: 'Diámetro', tipo: 'number', unidad: 'mm', esRequerido: true },
      { id: 'f_b113_angle', nombre: 'Ángulo de Doblado', tipo: 'number', unidad: 'grados', limiteMin: 180, esRequerido: true },
      { id: 'f_b113_cond', nombre: 'Condición Final', tipo: 'select', opciones: ['Sin Fisuras', 'Fisuras Leves', 'Fractura'], esRequerido: true },
      { id: 'f_b113_pass', nombre: 'Cumplimiento', tipo: 'boolean', esRequerido: true }
    ]
  },
  {
    id: 'norma_astm_e415',
    codigo: 'ASTM E415',
    nombre: 'Análisis Químico de Acero',
    tipo: 'ASTM',
    descripcion: 'Optical Emission Vacuum Spectrometric Analysis.',
    activa: true,
    creadaPor: 'user_admin',
    createdAt: new Date().toISOString(),
    tiposMuestraCompatibles: ['Acero'],
    campos: [
      { id: 'f_e415_c', nombre: '% Carbono', tipo: 'number', unidad: '%', limiteMax: 0.30, esRequerido: true },
      { id: 'f_e415_mn', nombre: '% Manganeso', tipo: 'number', unidad: '%', limiteMax: 1.50, esRequerido: true },
      { id: 'f_e415_p', nombre: '% Fósforo', tipo: 'number', unidad: '%', limiteMax: 0.035, esRequerido: true },
      { id: 'f_e415_s', nombre: '% Azufre', tipo: 'number', unidad: '%', limiteMax: 0.045, esRequerido: true },
      { id: 'f_e415_obs', nombre: 'Observaciones', tipo: 'text', esRequerido: false }
    ]
  }
];

export interface Proyecto {
  id: string;
  nombre: string;
  cliente: string;
  descripcion: string;
  direccion: string;
  normasAsignadas: string[]; // IDs de normas
  proveedores?: string[]; // New field for project-specific providers
  usuarios: { userId: string; rol: UserRole }[];
  estado: 'activo' | 'completado' | 'pausado';
  fechaInicio: string;
  fechaFin: string;
  createdAt: string;
}

export const mockProyectos: Proyecto[] = [
  {
    id: 'proj_torre_xyz',
    nombre: 'Torre XYZ',
    cliente: 'Constructora ABC',
    descripcion: 'Edificio residencial de 25 pisos en zona centro',
    direccion: 'Av. Reforma 123, CDMX',
    normasAsignadas: ['norma_nmx_c414'],
    proveedores: ['Cemex', 'Cruz Azul'],
    usuarios: [
      { userId: 'user_tecnico', rol: 'tecnico' },
      { userId: 'user_residente', rol: 'residente' }
    ],
    estado: 'activo',
    fechaInicio: '2024-02-01',
    fechaFin: '2025-02-01',
    createdAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'proj_hospital',
    nombre: 'Hospital Privado Norte',
    cliente: 'Grupo Salud',
    descripcion: 'Construcción de nueva ala de emergencias',
    direccion: 'Calle 5 de Mayo, Monterrey',
    normasAsignadas: ['norma_aci_318'],
    proveedores: ['Holcim', 'Moctezuma'],
    usuarios: [
      { userId: 'user_tecnico', rol: 'tecnico' },
      { userId: 'user_gerente', rol: 'gerente' }
    ],
    estado: 'activo',
    fechaInicio: '2024-03-15',
    fechaFin: '2024-12-20',
    createdAt: '2024-03-01T00:00:00Z'
  }
];

export interface Muestra {
  id: string;
  codigo: string;
  proyectoId: string;
  normaId: string;
  tipoMaterial: string;
  fechaRecepcion: string;
  fechaTermino?: string;
  fechaEnsayo?: string;
  ubicacion: string;
  proveedor: string;
  qrCode: string;
  resultados?: Record<string, number | string | boolean>; // Keyed by field ID
  estado: 'pendiente' | 'en_proceso' | 'aprobado' | 'rechazado';
  tecnicoId: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string; // Changed to string for consistency
  nombre: string;
  tipo: 'Equipo' | 'Reactivo' | 'Material';
  estado: 'Operativo' | 'Disponible' | 'En Uso' | 'Mantenimiento' | 'Agotado';
  ubicacion: string; // Keep for non-project locations
  proyectoId?: string; // Optional link to a project
  cantidad: number;
  unidad: string;
  ultimoMantenimiento?: string;
  fechaVencimiento?: string;
  minimoStock?: number;
}

export const mockInventory: InventoryItem[] = [
  { id: 'inv_1', nombre: 'Prensa Hidráulica 200T', tipo: 'Equipo', estado: 'Operativo', ubicacion: 'Lab Principal', cantidad: 1, unidad: 'pza', ultimoMantenimiento: '2023-11-15' },
  { id: 'inv_2', nombre: 'Balanza de Precisión', tipo: 'Equipo', estado: 'Operativo', ubicacion: 'Sala de Pesaje', cantidad: 2, unidad: 'pza', ultimoMantenimiento: '2023-12-01' },
  { id: 'inv_3', nombre: 'Azufre para Cabeceo', tipo: 'Reactivo', estado: 'Disponible', ubicacion: 'Almacén Químico', cantidad: 50, unidad: 'kg', minimoStock: 20 },
  { id: 'inv_4', nombre: 'Moldes Cilíndricos 15x30', tipo: 'Material', estado: 'En Uso', ubicacion: 'En Obra', proyectoId: 'proj_torre_xyz', cantidad: 24, unidad: 'pza' },
];

export const mockMuestras: Muestra[] = [
  {
    id: 'muestra_001',
    codigo: 'MUE-2024-001',
    proyectoId: 'proj_torre_xyz',
    normaId: 'norma_nmx_c414',
    tipoMaterial: 'Concreto Premezclado',
    fechaRecepcion: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    ubicacion: 'Losa Nivel 1',
    proveedor: 'Cemex',
    qrCode: 'QR-MUE-001',
    estado: 'aprobado',
    tecnicoId: 'user_tecnico',
    resultados: {
      'f1': 210, // > 200 ok
      'f2': 10   // 8-12 ok
    },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'muestra_002',
    codigo: 'MUE-2024-002',
    proyectoId: 'proj_torre_xyz',
    normaId: 'norma_nmx_c414',
    tipoMaterial: 'Concreto Premezclado',
    fechaRecepcion: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    ubicacion: 'Columna C4',
    proveedor: 'Cemex',
    qrCode: 'QR-MUE-002',
    estado: 'rechazado',
    tecnicoId: 'user_tecnico',
    resultados: {
      'f1': 180, // < 200 Fail
      'f2': 13   // > 12 Fail
    },
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'muestra_003',
    codigo: 'MUE-2024-003',
    proyectoId: 'proj_torre_xyz',
    normaId: 'norma_nmx_b113', // Acero - Doblado
    tipoMaterial: 'Varilla Corrugada',
    fechaRecepcion: new Date(Date.now() - 7200000).toISOString(),
    ubicacion: 'Almacén Central',
    proveedor: 'Deacero',
    qrCode: 'QR-MUE-003',
    estado: 'aprobado',
    tecnicoId: 'user_tecnico',
    resultados: {
      'f_b113_diam': 12.7,
      'f_b113_angle': 180,
      'f_b113_cond': 'Sin Fisuras',
      'f_b113_pass': true
    },
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'muestra_004',
    codigo: 'MUE-2024-004',
    proyectoId: 'proj_hospital',
    normaId: 'norma_astm_d1883', // Suelo - CBR
    tipoMaterial: 'Base Hidráulica',
    fechaRecepcion: new Date(Date.now() - 10800000).toISOString(),
    ubicacion: 'Tramo 5+200',
    proveedor: 'Cantera Local',
    qrCode: 'QR-MUE-004',
    estado: 'aprobado',
    tecnicoId: 'user_tecnico',
    resultados: {
      'f_d1883_cbr': 95,
      'f_d1883_cond': 'Remojado',
      'f_d1883_energy': 'Estándar'
    },
    createdAt: new Date(Date.now() - 10800000).toISOString()
  }
];

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details?: string;
  timestamp: string;
  ip: string;
  module: string;
}

export const mockAuditLogs: AuditLog[] = [
  { id: 'log_1', userId: 'user_tecnico', action: 'Registro Muestra', details: 'MUE-2024-005', timestamp: '2024-03-20T10:30:00Z', ip: '192.168.1.15', module: 'Muestras' },
  { id: 'log_2', userId: 'user_admin', action: 'Modificación Norma', details: 'NMX-C-414', timestamp: '2024-03-19T14:22:00Z', ip: '192.168.1.10', module: 'Normas' },
  { id: 'log_3', userId: 'user_residente', action: 'Descarga Certificado', details: 'CER-004', timestamp: '2024-03-19T09:15:00Z', ip: '189.20.45.12', module: 'Certificados' },
  { id: 'log_4', userId: 'user_tecnico', action: 'Ingreso al Sistema', timestamp: '2024-03-19T08:00:00Z', ip: '192.168.1.15', module: 'Auth' },
];

export interface Audit {
  id: string;
  type: 'Interna' | 'Externa' | 'Certificación';
  entity?: string; // e.g., EMA, ISO
  scheduledDate: string;
  auditor: string;
  status: 'Programada' | 'En Proceso' | 'Cerrada' | 'Cancelada';
  findings?: string;
  score?: string;
}

export const mockAudits: Audit[] = [
  { id: 'aud_1', type: 'Interna', scheduledDate: '2024-03-01', auditor: 'Equipo Calidad', status: 'Cerrada', score: '95%', findings: 'Sin no conformidades mayores.' },
  { id: 'aud_2', type: 'Externa', entity: 'EMA', scheduledDate: '2024-06-15', auditor: 'Entidad Mexicana', status: 'Programada' },
];

export interface CertificateTemplate {
  id: string;
  name: string;
  layout: 'classic' | 'modern' | 'minimal' | 'bold';
  primaryColor?: string; // Optional override
  showWatermark: boolean;
  showQr: boolean;
  showBorder: boolean;
  isDefault: boolean;
}

export const mockTemplates: CertificateTemplate[] = [
  {
    id: 'tpl_default',
    name: 'Estándar Corporativo',
    layout: 'classic',
    primaryColor: '#000000',
    showWatermark: true,
    showQr: true,
    showBorder: true,
    isDefault: true
  },
  {
    id: 'tpl_modern',
    name: 'Moderno Digital',
    layout: 'modern',
    primaryColor: '#2563eb',
    showWatermark: false,
    showQr: true,
    showBorder: false,
    isDefault: false
  }
];
