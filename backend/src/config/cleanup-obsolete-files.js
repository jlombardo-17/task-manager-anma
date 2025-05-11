// Script para eliminar archivos redundantes de SQL
const fs = require('fs');
const path = require('path');

// Archivos que vamos a eliminar
const filesToDelete = [
  'simple-update.sql',
  'update-schema.sql',
  'update-database.js'
];

async function cleanupFiles() {
  console.log('Iniciando limpieza de archivos redundantes...');
  
  try {
    // Eliminar cada archivo
    for (const file of filesToDelete) {
      const filePath = path.join(__dirname, file);
      
      // Verificar si el archivo existe
      if (fs.existsSync(filePath)) {
        // Eliminar el archivo
        fs.unlinkSync(filePath);
        console.log(`Archivo eliminado: ${file}`);
      } else {
        console.log(`Archivo no encontrado: ${file}`);
      }
    }
    
    console.log('¡Limpieza completada exitosamente!');
  } catch (error) {
    console.error('Error al eliminar archivos:', error.message);
  }
}

// Preguntar confirmación
console.log('Este script eliminará los siguientes archivos:');
filesToDelete.forEach(file => console.log('- ' + file));
console.log('\n¿Desea continuar? (Presione cualquier tecla para continuar, Ctrl+C para cancelar)');

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', async () => {
  process.stdin.setRawMode(false);
  process.stdin.pause();
  await cleanupFiles();
  process.exit(0);
});
