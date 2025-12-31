He completado la solución para el problema de persistencia de permisos.

### Resumen de la Solución
El problema de que los permisos se revirtieran a solo "M" (probablemente solo `access_muestras`) se debía a que la base de datos tenía definiciones por defecto desactualizadas o incorrectas en sus triggers automáticos, los cuales sobrescribían los cambios realizados desde el frontend.

He generado un script de migración SQL (`20240330_fix_permissions.sql`) que corrige esto de raíz.

### Acciones Realizadas

1.  **Creación de Migración SQL**:
    *   Archivo: [20240330_fix_permissions.sql](file:///d:\Proyectos\Laboratorio de contruccion\supabase\migrations\20240330_fix_permissions.sql)
    *   **Función `get_permissions_by_role`**: Define la estructura correcta de permisos JSONB para cada rol (Administrador, Gerente, Técnico, Residente), asegurando que coincida con la lógica del frontend.
    *   **Limpieza de Triggers**: Elimina automáticamente cualquier trigger en la tabla `profiles` que intente modificar permisos durante una actualización (`UPDATE`), permitiendo que los cambios manuales del administrador persistan.
    *   **Corrección de `handle_new_user`**: Asegura que los nuevos usuarios registrados obtengan los permisos completos correctos desde el primer momento.
    *   **Reparación de Datos**: Incluye una sentencia `UPDATE` que busca usuarios con permisos corruptos (solo "M") y los restaura a los valores correctos según su rol.

2.  **Verificación de Código**:
    *   Se confirmó que la lógica en `TeamManagement.tsx` y `CompanyContext.tsx` es correcta y ahora funcionará como se espera una vez que la base de datos deje de interferir.

### Pasos para Aplicar la Corrección

Dado que este cambio implica lógica de base de datos en Supabase, debes aplicar el script manualmente:

1.  Abre el archivo [20240330_fix_permissions.sql](file:///d:\Proyectos\Laboratorio de contruccion\supabase\migrations\20240330_fix_permissions.sql) y copia todo su contenido.
2.  Ve a tu proyecto en **Supabase Dashboard** -> **SQL Editor**.
3.  Pega el código y haz clic en **Run**.

Una vez ejecutado, los permisos de los usuarios existentes se corregirán automáticamente y las futuras actualizaciones persistirán correctamente.