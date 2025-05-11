// Script para inicializar o actualizar el esquema de la base de datos
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { spawn } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function initializeDatabase() {
  console.log('Iniciando inicialización/actualización de la base de datos...');

  // Configuración de la conexión
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'task_manager',
    multipleStatements: true // Importante para ejecutar múltiples consultas
  };

  try {
    // Leer el archivo SQL consolidado
    const sqlFilePath = path.join(__dirname, 'complete-database.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    // Crear conexión
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true
    });
    
    console.log('Conexión a MySQL establecida');

    // Asegurar que la base de datos existe
    console.log(`Verificando/creando base de datos ${dbConfig.database}...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.query(`USE ${dbConfig.database}`);
    
    // Ejecutar el script SQL
    console.log('Ejecutando script de inicialización/actualización...');
    await connection.query(sqlScript);
    
    console.log('¡Base de datos inicializada/actualizada exitosamente!');
    
    // Cerrar conexión
    await connection.end();
    
    // Ejecutar el script para asegurar que la contraseña de admin es correcta
    console.log('Asegurando que la contraseña de admin es correcta...');
    await updateAdminPassword();
    
    console.log('Inicialización completa y usuario admin verificado.');
    
  } catch (error) {
    console.error('Error al inicializar/actualizar la base de datos:', error.message);
    console.error(error);
    process.exit(1);
  }
}

/**
 * Función para ejecutar el script de actualización de contraseña de admin
 * como un proceso separado.
 */
function updateAdminPassword() {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../utils/update-admin-password.js');
    
    // Verificar si el archivo existe
    if (!fs.existsSync(scriptPath)) {
      console.log('Advertencia: Script de actualización de contraseña no encontrado.');
      return resolve();
    }
    
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit'
    });
    
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script de actualización de contraseña falló con código de salida ${code}`));
      }
    });
    
    child.on('error', error => {
      reject(error);
    });
  });
}

// Ejecutar la función principal
initializeDatabase();
