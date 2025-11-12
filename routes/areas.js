const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// GET - Obtener todas las áreas
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('areas').get();
    const areas = [];
    snapshot.forEach(doc => {
      areas.push({ id_area: doc.id, ...doc.data() });
    });
    res.json(areas);
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener área por ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('areas').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Área no encontrada' });
    }
    res.json({ id_area: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error al obtener área:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear nueva área
router.post('/', async (req, res) => {
  try {
    const { nombre_area, descripcion } = req.body;
    
    // Validación
    if (!nombre_area) {
      return res.status(400).json({ error: 'El nombre del área es requerido' });
    }
    
    const docRef = await db.collection('areas').add({
      nombre_area,
      descripcion: descripcion || '',
      created_at: new Date().toISOString()
    });
    
    res.status(201).json({
      id_area: docRef.id,
      nombre_area,
      descripcion,
      message: 'Área creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear área:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar área
router.put('/:id', async (req, res) => {
  try {
    const { nombre_area, descripcion } = req.body;
    
    await db.collection('areas').doc(req.params.id).update({
      nombre_area,
      descripcion: descripcion || '',
      updated_at: new Date().toISOString()
    });
    
    res.json({ message: 'Área actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar área:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar área
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('areas').doc(req.params.id).delete();
    res.json({ message: 'Área eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar área:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;