# Configuración de Supabase para ConstruLab

Este proyecto utiliza Supabase como Backend-as-a-Service (BaaS) para la gestión de base de datos, autenticación y almacenamiento.

## 1. Configuración Inicial

### Variables de Entorno
El archivo `.env` en la raíz del proyecto contiene las credenciales de conexión:

```env
VITE_SUPABASE_URL=https://fbcgtvqlfjreiafgymbs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Cliente de Supabase
El cliente se inicializa en `src/lib/supabase.ts`.

## 2. Base de Datos (PostgreSQL)

El esquema completo de la base de datos se encuentra en el archivo `supabase_schema.sql`.
Para inicializar la base de datos:

1.  Ve al [Dashboard de Supabase](https://fbcgtvqlfjreiafgymbs.supabase.co).
2.  Abre el **SQL Editor**.
3.  Copia el contenido de `supabase_schema.sql`.
4.  Ejecuta el script.

### Tablas Principales
*   `profiles`: Información extendida de usuarios (Roles, Permisos).
*   `company_settings`: Configuración global de la empresa (Logo, Dirección).
*   `proyectos`: Gestión de obras.
*   `normas`: Catálogo de normas técnicas.
*   `muestras`: Registro de muestras y resultados.
*   `inventario`: Control de equipos y materiales.
*   `templates`: Plantillas de certificados.
*   `audit_logs`: Registro de actividad.

## 3. Autenticación

El sistema utiliza **Supabase Auth**.
*   Los usuarios se registran con email/password.
*   Un **Trigger** de PostgreSQL (`on_auth_user_created`) crea automáticamente un registro en la tabla `public.profiles`.
*   El rol por defecto es `tecnico`.

## 4. Contextos de React

La lógica de negocio se ha migrado de `localStorage` a Supabase en los siguientes contextos:

*   **AuthContext**: Maneja el inicio de sesión, cierre de sesión y carga del perfil de usuario.
*   **CompanyContext**: Carga la configuración de la empresa y la lista de usuarios.
*   **DataContext**: Maneja el CRUD de Proyectos, Normas, Muestras, Inventario y Plantillas.

## 5. Políticas de Seguridad (RLS)

Se han habilitado políticas Row Level Security (RLS) en todas las tablas.
*   **Lectura**: Permitida para usuarios autenticados.
*   **Escritura**: Restringida según el rol (Administradores/Gerentes tienen permisos completos, Técnicos tienen permisos limitados en ciertas tablas).
*   *Nota: Las políticas actuales son permisivas para el MVP y deben refinarse antes de producción masiva.*
