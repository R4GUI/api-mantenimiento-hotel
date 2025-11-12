const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// GET - Obtener todos los equipos con información completa
router.get('/', async (req, res) => {
  try {
    const equiposSnapshot = await db.collection('equipos').get();
    const equipos = [];
    
    for (const doc of equiposSnapshot.docs) {
      const equipoData = doc.data();
      
      // Obtener información del área y tipo
      let areaData = {};
      let tipoData = {};
      
      if (equipoData.id_area) {
        const areaDoc = await db.collection('areas').doc(equipoData.id_area).get();
        if (areaDoc.exists) {
          areaData = areaDoc.data();
        }
      }
      
      if (equipoData.id_tipo) {
        const tipoDoc = await db.collection('tipos').doc(equipoData.id_tipo).get();
        if (tipoDoc.exists) {
          tipoData = tipoDoc.data();
        }
      }
      
      equipos.push({
        id_equipo: doc.id,
        ...equipoData,
        nombre_area: areaData.nombre_area || '',
        nombre_tipo: tipoData.nombre_tipo || ''
      });
    }
    
    res.json(equipos);
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener equipo por ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('equipos').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }
    
    const equipoData = doc.data();
    
    // Obtener información del área y tipo
    let areaData = {};
    let tipoData = {};
    
    if (equipoData.id_area) {
      const areaDoc = await db.collection('areas').doc(equipoData.id_area).get();
      if (areaDoc.exists) {
        areaData = areaDoc.data();
      }
    }
    
    if (equipoData.id_tipo) {
      const tipoDoc = await db.collection('tipos').doc(equipoData.id_tipo).get();
      if (tipoDoc.exists) {
        tipoData = tipoDoc.data();
      }
    }
    
    res.json({ 
      id_equipo: doc.id, 
      ...equipoData,
      nombre_area: areaData.nombre_area || '',
      nombre_tipo: tipoData.nombre_tipo || ''
    });
  } catch (error) {
    console.error('Error al obtener equipo:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear nuevo equipo
router.post('/', async (req, res) => {
  try {
    const equipoData = {
      numero_serie: req.body.numero_serie,
      id_area: req.body.id_area,
      id_tipo: req.body.id_tipo,
      marca: req.body.marca || '',
      modelo: req.body.modelo || '',
      fecha_adquisicion: req.body.fecha_adquisicion || new Date().toISOString().split('T')[0],
      estado: req.body.estado || 'Operativo',
      observaciones: req.body.observaciones || '',
      created_at: new Date().toISOString()
    };
    
    // Validación
    if (!equipoData.numero_serie || !equipoData.id_area || !equipoData.id_tipo) {
      return res.status(400).json({ 
        error: 'Número de serie, área y tipo son requeridos' 
      });
    }
    
    const docRef = await db.collection('equipos').add(equipoData);
    
    // Agregar al historial
    await db.collection('historial_equipos').add({
      id_equipo: docRef.id,
      numero_serie: equipoData.numero_serie,
      fecha_modificacion: new Date().toISOString(),
      tipo_modificacion: 'ALTA',
      descripcion: 'Equipo dado de alta en el sistema'
    });
    
    res.status(201).json({
      id_equipo: docRef.id,
      ...equipoData,
      message: 'Equipo creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear equipo:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar equipo
router.put('/:id', async (req, res) => {
  try {
    const updateData = {
      numero_serie: req.body.numero_serie,
      id_area: req.body.id_area,
      id_tipo: req.body.id_tipo,
      marca: req.body.marca || '',
      modelo: req.body.modelo || '',
      fecha_adquisicion: req.body.fecha_adquisicion,
      estado: req.body.estado,
      observaciones: req.body.observaciones || '',
      updated_at: new Date().toISOString()
    };
    
    await db.collection('equipos').doc(req.params.id).update(updateData);
    
    // Agregar al historial
    await db.collection('historial_equipos').add({
      id_equipo: req.params.id,
      numero_serie: updateData.numero_serie,
      fecha_modificacion: new Date().toISOString(),
      tipo_modificacion: 'MODIFICACION',
      descripcion: 'Equipo actualizado'
    });
    
    res.json({ message: 'Equipo actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar equipo:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar equipo
router.delete('/:id', async (req, res) => {
  try {
    const equipoDoc = await db.collection('equipos').doc(req.params.id).get();
    if (!equipoDoc.exists) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }
    
    const equipoData = equipoDoc.data();
    
    // Agregar al historial antes de eliminar
    await db.collection('historial_equipos').add({
      id_equipo: req.params.id,
      numero_serie: equipoData.numero_serie,
      fecha_modificacion: new Date().toISOString(),
      tipo_modificacion: 'BAJA',
      descripcion: 'Equipo dado de baja del sistema'
    });
    
    await db.collection('equipos').doc(req.params.id).delete();
    
    res.json({ message: 'Equipo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar equipo:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;