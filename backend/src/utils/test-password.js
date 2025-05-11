const bcrypt = require('bcryptjs');
require('dotenv').config();

// Valores a probar
const plainPassword = 'admin123';
const storedHash = '$2a$10$BLMZFAnCPXX0cVRmdPP3Meu3NR/xDVGZ.YT8xzrxxfLkKiTjRZyia';

// Función para verificar la contraseña
async function verifyPassword() {
  try {
    // Verificar si el hash almacenado es correcto
    const isMatch = await bcrypt.compare(plainPassword, storedHash);
    
    console.log('Contraseña verificada:');
    console.log('---------------------');
    console.log('Contraseña: admin123');
    console.log('¿Coincide con el hash almacenado?', isMatch ? 'SÍ' : 'NO');
    
    // Si no coincide, generar un nuevo hash correcto
    if (!isMatch) {
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(plainPassword, salt);
      
      console.log('\nGenerando nuevo hash para "admin123":');
      console.log('---------------------');
      console.log('Nuevo hash generado:', newHash);
      console.log('\nActualiza el hash en complete-database.sql reemplazando:');
      console.log('Original:', storedHash);
      console.log('Nuevo:', newHash);
    }
  } catch (error) {
    console.error('Error al verificar la contraseña:', error);
  }
}

// Ejecutar la verificación
verifyPassword();
