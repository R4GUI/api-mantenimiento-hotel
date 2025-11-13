const { db } = require('../config/firebase');
const crypto = require('crypto');

// Función para hashear contraseñas (simple pero seguro)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function initializeUsers() {
  try {
    console.log('🔄 Inicializando usuarios...');

    // Usuario Admin
    await db.collection('usuarios').doc('adminhb').set({
      username: 'adminhb',
      password: hashPassword('adminhb'), // Cambia esta contraseña por una segura
      rol: 'admin',
      nombre: 'Administrador',
      activo: true,
      created_at: new Date().toISOString()
    });

    // Usuarios Empleados
    const empleados = [
      { username: 'hotelhb1', nombre: 'Empleado 1' },
      { username: 'hotelhb2', nombre: 'Empleado 2' },
      { username: 'hotelhb3', nombre: 'Empleado 3' },
      { username: 'hotelhb4', nombre: 'Empleado 4' },
      { username: 'hotelhb5', nombre: 'Empleado 5' }
    ];

    for (const empleado of empleados) {
      await db.collection('usuarios').doc(empleado.username).set({
        username: empleado.username,
        password: hashPassword(empleado.username), // La contraseña es igual al usuario
        rol: 'empleado',
        nombre: empleado.nombre,
        activo: true,
        created_at: new Date().toISOString()
      });
    }

    console.log('✅ Usuarios creados exitosamente');
    console.log('📌 Admin: adminhb / adminhb');
    console.log('📌 Empleados: hotelhb1-5 / (contraseña = usuario)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initializeUsers();