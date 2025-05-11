# Configuración de Base de Datos - Task Manager

Este documento describe cómo configurar la base de datos para la aplicación Task Manager.

## Opción 1: Configuración Automática (Recomendada)

La forma más sencilla de configurar la base de datos es utilizando el script de inicialización automática:

1. Asegúrate de tener correctamente configurado el archivo `.env` en la carpeta `backend/` con las credenciales de MySQL.

2. Ejecuta el siguiente comando desde la raíz del proyecto:

```bash
# En Windows PowerShell
cd backend
npm run db:init
```

Este proceso automáticamente creará la base de datos, todas las tablas necesarias y un usuario administrador.

## Opción 2: Configuración Manual

Si prefieres configurar la base de datos manualmente:

1. Asegúrate de tener MySQL instalado en tu sistema.

2. Abre MySQL Command Line Client (o el cliente MySQL que uses) e inicia sesión.

3. Ejecuta los siguientes comandos para crear la base de datos:

```sql
CREATE DATABASE IF NOT EXISTS anma;
USE anma;
```

4. Importa el script SQL completo:

   ```sql
   SOURCE c:/Users/Usuario/Proyectos/task-manager-anma/backend/src/config/complete-database.sql
   ```

   O desde la línea de comandos:
   
   ```bash
   mysql -u root -p anma < c:/Users/Usuario/Proyectos/task-manager-anma/backend/src/config/complete-database.sql
   ```

5. Verifica que las tablas se hayan creado:

```sql
USE anma;
SHOW TABLES;
```

Deberías ver las siguientes tablas principales:
- clients
- projects
- resources
- task_resources
- tasks
- users
- project_resources

## Información del Usuario Administrador

El usuario administrador predeterminado se crea con:
- Email: admin@example.com
- Password: admin123

## Resolución de Problemas

Si tienes problemas para iniciar sesión con el usuario administrador, ejecuta:

```bash
# En Windows PowerShell
cd backend
node src/utils/update-admin-password.js
```

Este script reiniciará la contraseña del administrador a "admin123".

## Más Información

Para más detalles sobre la estructura y gestión de la base de datos, consulta:
- `backend/src/config/DATABASE_README.md`
