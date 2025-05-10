// Script para actualizar la contraseña del usuario admin
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function updateAdminPassword() {
  try {
    // Datos para actualizar
    const email = 'admin@example.com';
    const newPassword = 'admin123';
    
    // Verificar que el usuario existe
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      console.log(`Usuario con email ${email} no existe en la base de datos`);
      return;
    }
    
    const user = rows[0];
    console.log('Usuario encontrado:');
    console.log('ID:', user.id);
    console.log('Nombre de usuario:', user.username);
    console.log('Email:', user.email);
    console.log('Rol:', user.role);
    
    // Hash de la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Actualizar la contraseña en la base de datos
    await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
    
    console.log(`Contraseña actualizada para el usuario ${email}`);
    console.log('Nueva contraseña (solo para propósitos de prueba):', newPassword);
    console.log('Hash de la nueva contraseña:', hashedPassword);
    
    // Cerrar la conexión a la base de datos
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Actualizar contraseña del administrador
updateAdminPassword();
