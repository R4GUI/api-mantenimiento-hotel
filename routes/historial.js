const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// GET - Obtener todo el historial
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('historial_equipos')
      .orderBy('fecha_modificacion', 'desc')
      .get();
    
    const historial = [];
    snapshot.forEach(doc => {
      historial.push({ 
        id_historial: doc.id, 
        ...doc.data() 
      });
    });
    
    res.json(historial);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener historial por equipo
router.get('/equipo/:id', async (req, res) => {
  try {
    const snapshot = await db.collection('historial_equipos')
      .where('id_equipo', '==', req.params.id)
      .orderBy('fecha_modificacion', 'desc')
      .get();
    
    const historial = [];
    snapshot.forEach(doc => {
      historial.push({ 
        id_historial: doc.id, 
        ...doc.data() 
      });
    });
    
    res.json(historial);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Agregar entrada al historial
router.post('/', async (req, res) => {
  try {
    const historialData = {
      id_equipo: req.body.id_equipo,
      numero_serie: req.body.numero_serie,
      fecha_modificacion: new Date().toISOString(),
      tipo_modificacion: req.body.tipo_modificacion,
      descripcion: req.body.descripcion
    };
    
    const docRef = await db.collection('historial_equipos').add(historialData);
    
    res.status(201).json({
      id_historial: docRef.id,
      ...historialData,
      message: 'Entrada de historial creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear historial:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;