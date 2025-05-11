# Gestión de Base de Datos - Task Manager

## Descripción de los cambios

Se han consolidado todos los scripts de base de datos en un único archivo (`complete-database.sql`) que maneja tanto la creación inicial como las actualizaciones de la base de datos. Este enfoque simplifica la gestión de la estructura de la base de datos y evita redundancias.

## Archivos principales

1. **`complete-database.sql`**: Script SQL consolidado que realiza las siguientes acciones:
   - Crea todas las tablas necesarias si no existen
   - Añade columnas faltantes en tablas existentes
   - Crea índices para optimización de rendimiento
   - Añade restricciones de clave foránea
   - Inserta un usuario administrador por defecto si no existe

2. **`initialize-database.js`**: Script Node.js que ejecuta el script SQL consolidado:
   - Verifica/crea la base de datos si no existe
   - Ejecuta todas las consultas SQL necesarias
   - Maneja errores y provee feedback en la consola

## Estructura de la base de datos

La base de datos incluye las siguientes tablas:

- **`users`**: Usuarios del sistema con roles
- **`clients`**: Información de clientes
- **`resources`**: Recursos/personas con roles y tarifas por hora
- **`projects`**: Proyectos asociados a clientes con fechas, horas y costos
- **`tasks`**: Tareas dentro de proyectos con fechas, horas y prioridades
- **`project_resources`**: Tabla de unión entre proyectos y recursos
- **`task_resources`**: Tabla de unión entre tareas y recursos

## Cómo usar

### Inicializar/Actualizar la base de datos

Para inicializar o actualizar la base de datos, ejecuta:

```bash
npm run db:init
```

Este comando verifica si las tablas existen y las crea o actualiza según sea necesario.

### Requisitos

Asegúrate de que tu archivo `.env` contiene las siguientes variables:

```
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=task_manager
```

## Cambios eliminados

Se han eliminado los siguientes archivos redundantes:
- `simple-update.sql`
- `update-schema.sql`
- `update-database.js`

Toda la funcionalidad de estos archivos ha sido incorporada en `complete-database.sql` y `initialize-database.js`.

## Seguridad y mantenimiento

- El sistema verifica la existencia de tablas y columnas antes de intentar crearlas
- Las claves foráneas garantizan la integridad referencial
- Los índices optimizan el rendimiento de consultas frecuentes
