const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// GET - Obtener refacciones por mantenimiento
router.get('/mantenimiento/:id', async (req, res) => {
  try {
    const snapshot = await db.collection('refacciones')
      .where('id_mantenimiento', '==', req.params.id)
      .get();
    
    const refacciones = snapshot.docs.map(doc => ({
      id_refaccion: doc.id,
      ...doc.data()
    }));
    
    res.json(refacciones);
  } catch (error) {
    console.error('Error al obtener refacciones:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear refacción
router.post('/', async (req, res) => {
  try {
    const refaccionData = {
      id_mantenimiento: req.body.id_mantenimiento,
      nombre_refaccion: req.body.nombre_refaccion,
      cantidad: req.body.cantidad || 1,
      costo_unitario: req.body.costo_unitario || 0,
      proveedor: req.body.proveedor || '',
      created_at: new Date().toISOString()
    };

    // Validación
    if (!refaccionData.id_mantenimiento || !refaccionData.nombre_refaccion) {
      return res.status(400).json({ 
        error: 'ID de mantenimiento y nombre de refacción son requeridos' 
      });
    }

    const docRef = await db.collection('refacciones').add(refaccionData);
    
    res.status(201).json({
      id_refaccion: docRef.id,
      ...refaccionData,
      message: 'Refacción creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear refacción:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar refacción
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('refacciones').doc(req.params.id).delete();
    res.json({ message: 'Refacción eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar refacción:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;