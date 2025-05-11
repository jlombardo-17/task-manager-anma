// Script para actualizar el esquema de la base de datos
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function updateSchema() {
  console.log('Iniciando actualización de esquema de base de datos...');

  // Configuración de la conexión
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'task_manager',
    multipleStatements: true // Importante para ejecutar múltiples consultas
  };

  try {
    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, 'update-schema.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    // Crear conexión
    const connection = await mysql.createConnection(dbConfig);
    console.log('Conexión a base de datos establecida');

    // Ejecutar el script SQL
    console.log('Ejecutando script de actualización...');
    await connection.query(sqlScript);
    
    console.log('¡Esquema de base de datos actualizado exitosamente!');
    
    // Cerrar conexión
    await connection.end();
    
  } catch (error) {
    console.error('Error al actualizar el esquema de la base de datos:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar la función principal
updateSchema();
