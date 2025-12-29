# ConstruLab SaaS - Sistema de Gestión para Laboratorios de Construcción

Este proyecto es una plataforma SaaS moderna diseñada para digitalizar y automatizar los procesos de laboratorios de control de calidad en la construcción.

## Características Principales

*   **Gestión de Proyectos (Obras):** Alta y seguimiento de obras, clientes y ubicaciones.
*   **Catálogo de Normas:** Soporte para normas NMX, ACI y ASTM. Editor de normas con validación automática de resultados.
*   **Gestión de Muestras:** Registro de muestras con generación automática de códigos QR para trazabilidad.
*   **Ejecución de Ensayos:** Formularios dinámicos basados en las normas configuradas. Validación automática de límites (pasa/no pasa).
*   **Emisión de Certificados:** Generación de informes de ensayo profesionales listos para imprimir o descargar.
*   **Dashboard:** Visualización de métricas clave (ensayos realizados, pendientes, estado de proyectos).
*   **Autenticación y Roles:** Sistema de login seguro con diferentes niveles de acceso (Administrador, Técnico, Gerente).

## Tecnologías Utilizadas

*   **Frontend:** React 18, TypeScript, Vite.
*   **UI/UX:** Tailwind CSS, Lucide React (iconos), Recharts (gráficos).
*   **Estado y Gestión de Datos:** Context API, React Hook Form, Zod (validación).
*   **Testing:** Vitest, React Testing Library.
*   **Utilidades:** `react-qr-code` (QR), `uuid`.

## Requisitos Previos

*   Node.js (v18 o superior)
*   pnpm (recomendado) o npm

## Instalación y Ejecución

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repo>
    cd laboratorio-construccion
    ```

2.  **Instalar dependencias:**
    ```bash
    pnpm install
    ```

3.  **Iniciar servidor de desarrollo:**
    ```bash
    pnpm dev
    ```
    La aplicación estará disponible en `http://localhost:5173`.

## Ejecución de Pruebas

El proyecto incluye pruebas unitarias y de integración.

```bash
pnpm test
```

Para ver la cobertura de pruebas (si está configurado):
```bash
pnpm vitest run --coverage
```

## Construcción para Producción

Para generar los archivos estáticos optimizados para producción:

```bash
pnpm build
```
Los archivos se generarán en la carpeta `dist`.

## Credenciales de Demo

Para acceder a la plataforma en modo desarrollo:

*   **Email:** `admin@laboratorio.com`
*   **Contraseña:** `password123`

## Estructura del Proyecto

*   `src/components`: Componentes reutilizables (UI, formularios específicos).
*   `src/context`: Manejo de estado global (Auth, Data, Toast).
*   `src/pages`: Vistas principales de la aplicación.
*   `src/data`: Datos simulados (mockData) para demostración.
*   `src/test`: Configuración y archivos de prueba.

---
Desarrollado con ❤️ para la industria de la construcción.

<!-- Deploy trigger -->
