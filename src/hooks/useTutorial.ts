import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { driver, DriveStep } from 'driver.js';
import { useAuth } from '../context/AuthContext';

export function useTutorial() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [hasStartedAuto, setHasStartedAuto] = useState(false);

  // Helper to determine tutorial config based on route
  const getTutorialConfig = useCallback((pathname: string): { key: string; steps: DriveStep[] } => {
    if (pathname.startsWith('/app/proyectos')) {
      return {
        key: 'proyectos',
        steps: [
        {
          popover: {
            title: 'Módulo de Proyectos',
            description: 'Aquí gestionas todas las obras y proyectos de construcción.'
          }
        },
        {
          element: '#btn-new-project',
          popover: {
            title: 'Crear Proyecto',
            description: 'Haz clic aquí para registrar una nueva obra. Deberás asignar un nombre, cliente y las normas aplicables.',
            side: "bottom",
            align: 'end'
          }
        },
        {
          element: '#projects-filters',
          popover: {
            title: 'Filtros y Búsqueda',
            description: 'Utiliza estas herramientas para encontrar proyectos rápidamente por nombre, cliente o estado (Activo, Completado).',
            side: "bottom"
          }
        },
        {
          element: '#btn-export-csv',
          popover: {
            title: 'Exportar Datos',
            description: 'Descarga el listado completo de proyectos en formato CSV para análisis externo.',
            side: "bottom",
            align: 'end'
          }
        },
        {
          element: '#projects-list',
          popover: {
            title: 'Listado de Proyectos',
            description: 'Aquí ves el resumen de cada proyecto. Puedes editar o eliminar proyectos existentes desde las acciones en cada fila.',
            side: "top"
          }
        }
      ]};
    } else if (pathname.startsWith('/app/muestras')) {
      return {
        key: 'muestras',
        steps: [
        {
          popover: {
            title: 'Gestión de Muestras',
            description: 'Registra y controla el flujo de las muestras que llegan al laboratorio.'
          }
        },
        {
          element: '#btn-new-sample',
          popover: {
            title: 'Registrar Muestra',
            description: 'Inicia el proceso de recepción. Se generará un código único y código QR para trazabilidad.',
            side: "bottom",
            align: 'end'
          }
        },
        {
          element: '#samples-filters',
          popover: {
            title: 'Búsqueda Avanzada',
            description: 'Filtra por proyecto, estado de la muestra (Pendiente, Aprobado) o busca por código específico.',
            side: "bottom"
          }
        },
        {
          element: '#samples-list',
          popover: {
            title: 'Bitácora de Muestras',
            description: 'Visualiza el estado actual de cada muestra. Los colores indican si están pendientes de ensayo o ya aprobadas.',
            side: "top"
          }
        }
      ]};
    } else if (pathname.startsWith('/app/ensayos')) {
      return {
        key: 'ensayos',
        steps: [
        {
          popover: {
            title: 'Ejecución de Ensayos',
            description: 'Aquí es donde los técnicos registran los resultados de las pruebas de laboratorio.'
          }
        },
        {
          element: '#ensayos-filters',
          popover: {
            title: 'Encontrar Muestras',
            description: 'Localiza muestras pendientes de ensayo. Puedes filtrar por proyecto para organizar tu trabajo del día.',
            side: "bottom"
          }
        },
        {
          element: '#ensayos-list',
          popover: {
            title: 'Selección de Muestra',
            description: 'Haz clic en una muestra de la lista para abrir el formulario de captura de datos y registrar los resultados.',
            side: "top"
          }
        }
      ]};
    } else if (pathname.startsWith('/app/certificados')) {
      return {
        key: 'certificados',
        steps: [
        {
          popover: {
            title: 'Certificados e Informes',
            description: 'Generación final de documentos para el cliente.'
          }
        },
        {
          element: '#certs-filters',
          popover: {
            title: 'Filtrar Informes',
            description: 'Busca informes aprobados listos para imprimir. Puedes filtrar por tipo de ensayo (Concreto, Suelos, etc.).',
            side: "bottom"
          }
        },
        {
          element: '#certs-list',
          popover: {
            title: 'Historial de Certificados',
            description: 'Selecciona un registro para ver la vista previa del certificado PDF y descargarlo o imprimirlo.',
            side: "top"
          }
        },
        {
          element: '#btn-export-certs',
          popover: {
            title: 'Reporte Masivo',
            description: 'Exporta todos los datos de certificados filtrados a CSV para reportes mensuales.',
            side: "bottom",
            align: 'end'
          }
        }
      ]};
    } else if (pathname.startsWith('/app/normas')) {
      return {
        key: 'normas',
        steps: [
        {
          popover: {
            title: 'Biblioteca de Normas',
            description: 'Configura los estándares técnicos (NMX, ASTM, ACI) que rigen los ensayos.'
          }
        },
        {
          element: '#btn-new-norma',
          popover: {
            title: 'Agregar Norma',
            description: 'Da de alta una nueva norma técnica. Podrás definir sus límites y parámetros de aceptación.',
            side: "bottom",
            align: 'end'
          }
        },
        {
          element: '#normas-filters',
          popover: {
            title: 'Clasificación',
            description: 'Encuentra normas rápidamente filtrando por tipo (NMX, ASTM, etc.).',
            side: "bottom"
          }
        },
        {
          element: '#normas-list',
          popover: {
            title: 'Catálogo Vigente',
            description: 'Lista de normas activas disponibles para asociar a proyectos y ensayos.',
            side: "top"
          }
        }
      ]};
    } else if (pathname.startsWith('/app/inventarios')) {
      return {
        key: 'inventarios',
        steps: [
        {
          popover: {
            title: 'Control de Inventario',
            description: 'Gestiona equipos de laboratorio, reactivos y materiales consumibles.'
          }
        },
        {
          element: '#inventory-stats',
          popover: {
            title: 'Resumen Rápido',
            description: 'Tarjetas informativas con el conteo actual de equipos y materiales.',
            side: "bottom"
          }
        },
        {
          element: '#btn-new-item',
          popover: {
            title: 'Alta de Ítem',
            description: 'Registra nuevo equipo o material. Puedes asignar su ubicación o vincularlo a un proyecto específico.',
            side: "bottom",
            align: 'end'
          }
        },
        {
          element: '#inventory-filters',
          popover: {
            title: 'Buscador',
            description: 'Localiza ítems por nombre o filtra por categoría (Equipo, Reactivo, Material).',
            side: "bottom"
          }
        },
        {
          element: '#inventory-list',
          popover: {
            title: 'Existencias',
            description: 'Tabla detallada de existencias. Verifica estados de calibración y niveles de stock.',
            side: "top"
          }
        }
      ]};
    } else if (pathname.startsWith('/app/account')) {
      return {
        key: 'account',
        steps: [
        {
          popover: {
            title: 'Mi Cuenta',
            description: 'Gestiona tu información personal, seguridad y preferencias del sistema.'
          }
        },
        {
          element: '#account-tabs',
          popover: {
            title: 'Navegación de Cuenta',
            description: 'Usa este menú para alternar entre tu perfil, preferencias de interfaz y configuraciones avanzadas (si tienes permisos).',
            side: "right"
          }
        },
        {
          element: '#profile-info-card',
          popover: {
            title: 'Información Personal',
            description: 'Actualiza tu nombre y correo electrónico aquí.',
            side: "top"
          }
        },
        {
          element: '#security-card',
          popover: {
            title: 'Seguridad',
            description: 'Cambia tu contraseña regularmente para mantener tu cuenta segura.',
            side: "top"
          }
        },
        {
          element: '#tab-preferences',
          popover: {
            title: 'Preferencias',
            description: 'Haz clic aquí para cambiar el tema (claro/oscuro), idioma y colores de la interfaz.',
            side: "right"
          }
        }
      ]};
    } else {
      // Default / Dashboard Tutorial
      return {
        key: 'dashboard',
        steps: [
        {
          element: '#start-tutorial-btn',
          popover: {
            title: 'Bienvenido a ConstruLab',
            description: 'Este tutorial te guiará a través de las funciones principales de la plataforma.',
            side: "right",
            align: 'center'
          }
        },
        {
          element: '#nav-dashboard',
          popover: {
            title: 'Panel Principal (Dashboard)',
            description: 'Tu centro de control con métricas clave y alertas.',
            side: "right",
            align: 'start'
          }
        },
        {
          element: '#nav-operation',
          popover: {
            title: 'Módulo de Operación',
            description: 'Proyectos, Muestras, Ensayos y Certificados.',
            side: "right",
            align: 'start'
          }
        },
        {
          element: '#nav-management',
          popover: {
            title: 'Módulo de Gestión',
            description: 'Normas, Inventarios y Auditoría.',
            side: "right",
            align: 'start'
          }
        },
        {
          element: '#nav-system',
          popover: {
            title: 'Configuración',
            description: 'Planes y ajustes globales.',
            side: "right",
            align: 'start'
          }
        },
        {
          element: '#notifications-btn',
          popover: {
            title: 'Notificaciones',
            description: 'Alertas sobre nuevas muestras y resultados.',
            side: "bottom",
            align: 'end'
          }
        },
        {
          popover: {
            title: '¡Tip!',
            description: 'Navega a cualquier módulo (Proyectos, Muestras, etc.) y presiona este botón de ayuda nuevamente para ver un tutorial específico de esa sección.',
          }
        }
      ]};
    }
  }, []);

  const startTutorial = useCallback(() => {
    const { steps, key } = getTutorialConfig(location.pathname);

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '¡Entendido!',
      progressText: 'Paso {{current}} de {{total}}',
      steps: steps,
      onDestroyed: () => {
        // Mark as seen when closed or finished
        if (key) {
          localStorage.setItem(`tutorial_seen_${key}`, 'true');
        }
      }
    });

    driverObj.drive();
  }, [location, getTutorialConfig]);

  // Auto-start tutorial logic
  useEffect(() => {
    // Wait for auth to be ready
    if (loading || !user) return;
    
    // Check if we already tried to start in this navigation context to avoid loops
    // Note: Since location changes on navigation, this effect re-runs. 
    // We rely on localStorage check.

    const { key } = getTutorialConfig(location.pathname);
    const hasSeen = localStorage.getItem(`tutorial_seen_${key}`);

    if (!hasSeen) {
      // Small delay to ensure DOM elements are rendered (e.g. data tables)
      const timer = setTimeout(() => {
        // Check again inside timeout just in case
        if (!localStorage.getItem(`tutorial_seen_${key}`)) {
            startTutorial();
        }
      }, 1500); // 1.5s delay gives enough time for initial data fetch and UI paint

      return () => clearTimeout(timer);
    }
  }, [loading, user, location.pathname, getTutorialConfig, startTutorial]);

  return { startTutorial };
}
