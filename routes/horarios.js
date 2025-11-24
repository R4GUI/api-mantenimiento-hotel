const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// GET - Obtener todos los horarios
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('horarios').orderBy('fecha', 'desc').get();
    const horarios = snapshot.docs.map(doc => ({
      id_horario: doc.id,
      ...doc.data()
    }));
    res.json(horarios);
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener horarios por fecha
router.get('/fecha/:fecha', async (req, res) => {
  try {
    const snapshot = await db.collection('horarios')
      .where('fecha', '==', req.params.fecha)
      .get();
    
    const horarios = snapshot.docs.map(doc => ({
      id_horario: doc.id,
      ...doc.data()
    }));
    
    res.json(horarios);
  } catch (error) {
    console.error('Error al obtener horarios por fecha:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener horarios de un empleado
router.get('/empleado/:username', async (req, res) => {
  try {
    const snapshot = await db.collection('horarios')
      .where('username', '==', req.params.username)
      .orderBy('fecha', 'desc')
      .get();
    
    const horarios = snapshot.docs.map(doc => ({
      id_horario: doc.id,
      ...doc.data()
    }));
    
    res.json(horarios);
  } catch (error) {
    console.error('Error al obtener horarios del empleado:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear horario (solo admin)
router.post('/', async (req, res) => {
  try {
    const horarioData = {
      username: req.body.username,
      fecha: req.body.fecha,
      disponible: req.body.disponible !== undefined ? req.body.disponible : true,
      motivo: req.body.motivo || '',
      created_at: new Date().toISOString()
    };
    
    // Validación
    if (!horarioData.username || !horarioData.fecha) {
      return res.status(400).json({ 
        error: 'Usuario y fecha son requeridos' 
      });
    }
    
    // Verificar si ya existe un horario para ese empleado en esa fecha
    const existente = await db.collection('horarios')
      .where('username', '==', horarioData.username)
      .where('fecha', '==', horarioData.fecha)
      .get();
    
    if (!existente.empty) {
      // Actualizar el existente
      const docId = existente.docs[0].id;
      await db.collection('horarios').doc(docId).update({
        disponible: horarioData.disponible,
        motivo: horarioData.motivo,
        updated_at: new Date().toISOString()
      });
      
      return res.json({
        id_horario: docId,
        ...horarioData,
        message: 'Horario actualizado exitosamente'
      });
    }
    
    // Crear nuevo
    const docRef = await db.collection('horarios').add(horarioData);
    
    res.status(201).json({
      id_horario: docRef.id,
      ...horarioData,
      message: 'Horario creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear horario:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar horario
router.put('/:id', async (req, res) => {
  try {
    const updateData = {
      disponible: req.body.disponible,
      motivo: req.body.motivo || '',
      updated_at: new Date().toISOString()
    };
    
    await db.collection('horarios').doc(req.params.id).update(updateData);
    
    res.json({ message: 'Horario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar horario:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar horario
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('horarios').doc(req.params.id).delete();
    res.json({ message: 'Horario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar horario:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear horarios masivos para una semana
router.post('/semana', async (req, res) => {
  try {
    const { fechaInicio, empleados } = req.body;
    
    if (!fechaInicio || !empleados || empleados.length === 0) {
      return res.status(400).json({ 
        error: 'Fecha de inicio y lista de empleados son requeridos' 
      });
    }
    
    const fecha = new Date(fechaInicio);
    const horariosCreados = [];
    
    // Crear horarios para 7 días
    for (let i = 0; i < 7; i++) {
      const fechaActual = new Date(fecha);
      fechaActual.setDate(fecha.getDate() + i);
      const fechaStr = fechaActual.toISOString().split('T')[0];
      
      for (const empleado of empleados) {
        const horarioData = {
          username: empleado.username,
          fecha: fechaStr,
          disponible: empleado.disponible !== undefined ? empleado.disponible : true,
          motivo: empleado.motivo || '',
          created_at: new Date().toISOString()
        };
        
        const docRef = await db.collection('horarios').add(horarioData);
        horariosCreados.push({
          id_horario: docRef.id,
          ...horarioData
        });
      }
    }
    
    res.status(201).json({
      message: `${horariosCreados.length} horarios creados exitosamente`,
      horarios: horariosCreados
    });
  } catch (error) {
    console.error('Error al crear horarios masivos:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;