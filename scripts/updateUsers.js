const { db } = require('../config/firebase');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function updateUsers() {
  try {
    console.log('🔄 Actualizando usuarios...');

    // Usuario Admin (ya existe, pero lo actualizamos por si acaso)
    await db.collection('usuarios').doc('admin').set({
      username: 'admin',
      password: hashPassword('admin'),
      rol: 'admin',
      nombre: 'Administrador',
      area: 'Administración',
      activo: true,
      created_at: new Date().toISOString()
    });

    // Usuarios de Mantenimiento (1-5)
    const mantenimiento = [
      { username: 'mantenimiento1', nombre: 'Mantenimiento 1' },
      { username: 'mantenimiento2', nombre: 'Mantenimiento 2' },
      { username: 'mantenimiento3', nombre: 'Mantenimiento 3' },
      { username: 'mantenimiento4', nombre: 'Mantenimiento 4' },
      { username: 'mantenimiento5', nombre: 'Mantenimiento 5' }
    ];

    for (const user of mantenimiento) {
      await db.collection('usuarios').doc(user.username).set({
        username: user.username,
        password: hashPassword(user.username),
        rol: 'mantenimiento',
        nombre: user.nombre,
        area: 'Mantenimiento',
        activo: true,
        created_at: new Date().toISOString()
      });
    }

    // Usuarios Ama de Llaves (1-5)
    const amaLlaves = [
      { username: 'amadellaves1', nombre: 'Ama de Llaves 1' },
      { username: 'amadellaves2', nombre: 'Ama de Llaves 2' },
      { username: 'amadellaves3', nombre: 'Ama de Llaves 3' },
      { username: 'amadellaves4', nombre: 'Ama de Llaves 4' },
      { username: 'amadellaves5', nombre: 'Ama de Llaves 5' }
    ];

    for (const user of amaLlaves) {
      await db.collection('usuarios').doc(user.username).set({
        username: user.username,
        password: hashPassword(user.username),
        rol: 'amadellaves',
        nombre: user.nombre,
        area: 'Ama de Llaves',
        activo: true,
        created_at: new Date().toISOString()
      });
    }

    console.log('✅ Usuarios actualizados exitosamente');
    console.log('📌 Admin: admin / admin');
    console.log('📌 Mantenimiento: mantenimiento1-5 / (contraseña = usuario)');
    console.log('📌 Ama de Llaves: amadellaves1-5 / (contraseña = usuario)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateUsers();