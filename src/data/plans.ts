export interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  maxUsers: number; // Added for logic
  cta: string;
}

export const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    price: '$0',
    period: 'Mes',
    description: 'Ideal para laboratorios pequeños o independientes.',
    features: [
      'Hasta 2 proyectos activos',
      'Gestión de hasta 50 muestras/mes',
      'Normas básicas (NMX-C-414)',
      '1 usuario técnico',
      'Soporte por email'
    ],
    maxUsers: 1,
    cta: 'Comenzar Gratis'
  },
  {
    id: 'professional',
    name: 'Profesional',
    price: '$99',
    period: 'Mes',
    description: 'Para laboratorios en crecimiento con múltiples obras.',
    features: [
      'Proyectos ilimitados',
      'Hasta 500 muestras/mes',
      'Todas las normas (NMX, ACI, ASTM)',
      'Hasta 5 usuarios',
      'Generación de certificados PDF',
      'Soporte prioritario'
    ],
    maxUsers: 5,
    cta: 'Plan Actual'
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    price: 'Personalizado',
    period: '',
    description: 'Soluciones a medida para grandes constructoras.',
    features: [
      'Muestras y proyectos ilimitados',
      'Usuarios ilimitados',
      'Normas privadas personalizadas',
      'API de integración',
      'Soporte 24/7 dedicado',
      'Despliegue On-Premise opcional'
    ],
    maxUsers: 9999, // Unlimited
    cta: 'Contactar Ventas'
  }
];
