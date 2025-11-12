const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// GET - Obtener todos los tipos
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('tipos').get();
    const tipos = [];
    snapshot.forEach(doc => {
      tipos.push({ id_tipo: doc.id, ...doc.data() });
    });
    res.json(tipos);
  } catch (error) {
    console.error('Error al obtener tipos:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener tipo por ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('tipos').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Tipo no encontrado' });
    }
    res.json({ id_tipo: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error al obtener tipo:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear nuevo tipo
router.post('/', async (req, res) => {
  try {
    const { nombre_tipo, descripcion } = req.body;
    
    // Validación
    if (!nombre_tipo) {
      return res.status(400).json({ error: 'El nombre del tipo es requerido' });
    }
    
    const docRef = await db.collection('tipos').add({
      nombre_tipo,
      descripcion: descripcion || '',
      created_at: new Date().toISOString()
    });
    
    res.status(201).json({
      id_tipo: docRef.id,
      nombre_tipo,
      descripcion,
      message: 'Tipo creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear tipo:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar tipo
router.put('/:id', async (req, res) => {
  try {
    const { nombre_tipo, descripcion } = req.body;
    
    await db.collection('tipos').doc(req.params.id).update({
      nombre_tipo,
      descripcion: descripcion || '',
      updated_at: new Date().toISOString()
    });
    
    res.json({ message: 'Tipo actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar tipo:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar tipo
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('tipos').doc(req.params.id).delete();
    res.json({ message: 'Tipo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar tipo:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;