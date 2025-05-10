# Instrucciones para importar la base de datos

Para configurar correctamente la base de datos manualmente:

1. Asegúrate de tener MySQL instalado en tu sistema.

2. Abre MySQL Command Line Client (o el cliente MySQL que uses) e inicia sesión.

3. Ejecuta los siguientes comandos para crear la base de datos:

```sql
CREATE DATABASE IF NOT EXISTS anma;
USE anma;
```

4. Luego, puedes importar el script SQL completo de una de estas maneras:

   a. Desde el cliente MySQL:
   ```sql
   SOURCE c:/Users/Usuario/Proyectos/task-manager-anma/backend/src/config/setup-anma.sql
   ```

   b. O desde la línea de comandos (si tienes el ejecutable de MySQL en tu PATH):
   ```bash
   mysql -u root -p anma < c:/Users/Usuario/Proyectos/task-manager-anma/backend/src/config/setup-anma.sql
   ```

5. Verifica que las tablas se hayan creado con:
```sql
USE anma;
SHOW TABLES;
```

Deberías ver las siguientes tablas:
- clients
- projects
- resources
- task_resources
- tasks
- users

El usuario administrador predeterminado se crea con:
- Email: admin@example.com
- Password: admin123
