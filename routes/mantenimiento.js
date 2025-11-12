const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// GET - Obtener todos los mantenimientos
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('mantenimientos').get();
    const mantenimientos = [];
    
    for (const doc of snapshot.docs) {
      const mantData = doc.data();
      
      // Obtener información del equipo
      let equipoData = {};
      if (mantData.id_equipo) {
        const equipoDoc = await db.collection('equipos').doc(mantData.id_equipo).get();
        if (equipoDoc.exists) {
          equipoData = equipoDoc.data();
        }
      }
      
      mantenimientos.push({
        id_mantenimiento: doc.id,
        ...mantData,
        numero_serie: equipoData.numero_serie || '',
        marca: equipoData.marca || '',
        modelo: equipoData.modelo || ''
      });
    }
    
    res.json(mantenimientos);
  } catch (error) {
    console.error('Error al obtener mantenimientos:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener mantenimiento por ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('mantenimientos').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Mantenimiento no encontrado' });
    }
    
    const mantData = doc.data();
    
    // Obtener información del equipo
    let equipoData = {};
    if (mantData.id_equipo) {
      const equipoDoc = await db.collection('equipos').doc(mantData.id_equipo).get();
      if (equipoDoc.exists) {
        equipoData = equipoDoc.data();
      }
    }
    
    res.json({ 
      id_mantenimiento: doc.id, 
      ...mantData,
      numero_serie: equipoData.numero_serie || '',
      marca: equipoData.marca || '',
      modelo: equipoData.modelo || ''
    });
  } catch (error) {
    console.error('Error al obtener mantenimiento:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear nuevo mantenimiento
router.post('/', async (req, res) => {
  try {
    const mantenimientoData = {
      id_equipo: req.body.id_equipo,
      fecha_programada: req.body.fecha_programada,
      fecha_realizado: req.body.fecha_realizado || null,
      responsable: req.body.responsable,
      tipo_mantenimiento: req.body.tipo_mantenimiento || 'Preventivo',
      estado: req.body.estado || 'Pendiente',
      descripcion_trabajo: req.body.descripcion_trabajo || '',
      observaciones: req.body.observaciones || '',
      created_at: new Date().toISOString()
    };
    
    // Validación
    if (!mantenimientoData.id_equipo || !mantenimientoData.fecha_programada || !mantenimientoData.responsable) {
      return res.status(400).json({ 
        error: 'Equipo, fecha programada y responsable son requeridos' 
      });
    }
    
    const docRef = await db.collection('mantenimientos').add(mantenimientoData);
    
    // Actualizar estado del equipo si es necesario
    if (mantenimientoData.estado === 'En Proceso') {
      await db.collection('equipos').doc(mantenimientoData.id_equipo).update({
        estado: 'En Mantenimiento'
      });
    }
    
    res.status(201).json({
      id_mantenimiento: docRef.id,
      ...mantenimientoData,
      message: 'Mantenimiento creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear mantenimiento:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar mantenimiento
router.put('/:id', async (req, res) => {
  try {
    const updateData = {
      id_equipo: req.body.id_equipo,
      fecha_programada: req.body.fecha_programada,
      fecha_realizado: req.body.fecha_realizado,
      responsable: req.body.responsable,
      tipo_mantenimiento: req.body.tipo_mantenimiento,
      estado: req.body.estado,
      descripcion_trabajo: req.body.descripcion_trabajo,
      observaciones: req.body.observaciones,
      updated_at: new Date().toISOString()
    };
    
    await db.collection('mantenimientos').doc(req.params.id).update(updateData);
    
    // Si se completó el mantenimiento, actualizar el estado del equipo
    if (req.body.estado === 'Completado' && req.body.id_equipo) {
      await db.collection('equipos').doc(req.body.id_equipo).update({
        estado: 'Operativo',
        ultimo_mantenimiento: new Date().toISOString()
      });
    }
    
    res.json({ message: 'Mantenimiento actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar mantenimiento:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar mantenimiento
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('mantenimientos').doc(req.params.id).delete();
    res.json({ message: 'Mantenimiento eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar mantenimiento:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;