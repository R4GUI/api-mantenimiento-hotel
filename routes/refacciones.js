const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// GET - Obtener todas las refacciones
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('refacciones').get();
    const refacciones = [];
    
    for (const doc of snapshot.docs) {
      const refData = doc.data();
      
      // Calcular costo total
      refData.costo_total = refData.cantidad * refData.costo_unitario;
      
      refacciones.push({
        id_refaccion: doc.id,
        ...refData
      });
    }
    
    res.json(refacciones);
  } catch (error) {
    console.error('Error al obtener refacciones:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener refacciones por mantenimiento
router.get('/mantenimiento/:id', async (req, res) => {
  try {
    const snapshot = await db.collection('refacciones')
      .where('id_mantenimiento', '==', req.params.id)
      .get();
    
    const refacciones = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      data.costo_total = data.cantidad * data.costo_unitario;
      refacciones.push({ 
        id_refaccion: doc.id, 
        ...data 
      });
    });
    
    res.json(refacciones);
  } catch (error) {
    console.error('Error al obtener refacciones:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear nueva refacción
router.post('/', async (req, res) => {
  try {
    const refaccionData = {
      id_mantenimiento: req.body.id_mantenimiento,
      folio_compra: req.body.folio_compra,
      descripcion: req.body.descripcion,
      cantidad: parseInt(req.body.cantidad) || 1,
      costo_unitario: parseFloat(req.body.costo_unitario) || 0,
      proveedor: req.body.proveedor || '',
      created_at: new Date().toISOString()
    };
    
    // Validación
    if (!refaccionData.id_mantenimiento || !refaccionData.descripcion) {
      return res.status(400).json({ 
        error: 'Mantenimiento y descripción son requeridos' 
      });
    }
    
    // Calcular costo total
    refaccionData.costo_total = refaccionData.cantidad * refaccionData.costo_unitario;
    
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

// PUT - Actualizar refacción
router.put('/:id', async (req, res) => {
  try {
    const updateData = {
      id_mantenimiento: req.body.id_mantenimiento,
      folio_compra: req.body.folio_compra,
      descripcion: req.body.descripcion,
      cantidad: parseInt(req.body.cantidad) || 1,
      costo_unitario: parseFloat(req.body.costo_unitario) || 0,
      proveedor: req.body.proveedor || '',
      updated_at: new Date().toISOString()
    };
    
    // Calcular costo total
    updateData.costo_total = updateData.cantidad * updateData.costo_unitario;
    
    await db.collection('refacciones').doc(req.params.id).update(updateData);
    
    res.json({ message: 'Refacción actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar refacción:', error);
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