const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db } = require('../config/firebase');

// Función para hashear contraseñas
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    // Buscar usuario en Firestore
    const userDoc = await db.collection('usuarios').doc(username).get();

    if (!userDoc.exists) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const userData = userDoc.data();

    // Verificar contraseña
    const hashedPassword = hashPassword(password);
    if (userData.password !== hashedPassword) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Verificar si está activo
    if (!userData.activo) {
      return res.status(403).json({ error: 'Usuario desactivado' });
    }

    // Login exitoso - devolver datos del usuario (sin la contraseña)
    res.json({
      username: userData.username,
      nombre: userData.nombre,
      rol: userData.rol,
      message: 'Login exitoso'
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/auth/verify - Verificar si el token/sesión es válida
router.post('/verify', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Usuario requerido' });
    }

    const userDoc = await db.collection('usuarios').doc(username).get();

    if (!userDoc.exists || !userDoc.data().activo) {
      return res.status(401).json({ error: 'Sesión inválida' });
    }

    const userData = userDoc.data();
    res.json({
      username: userData.username,
      nombre: userData.nombre,
      rol: userData.rol
    });

  } catch (error) {
    console.error('Error en verify:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;