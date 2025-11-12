const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// GET - Obtener estadísticas generales
router.get('/', async (req, res) => {
  try {
    // Contar equipos totales
    const equiposSnapshot = await db.collection('equipos').get();
    const totalEquipos = equiposSnapshot.size;
    
    // Contar equipos operativos
    const operativosSnapshot = await db.collection('equipos')
      .where('estado', '==', 'Operativo')
      .get();
    const equiposOperativos = operativosSnapshot.size;
    
    // Contar mantenimientos pendientes
    const pendientesSnapshot = await db.collection('mantenimientos')
      .where('estado', '==', 'Pendiente')
      .get();
    const mantenimientosPendientes = pendientesSnapshot.size;
    
    // Calcular costo total de refacciones
    const refaccionesSnapshot = await db.collection('refacciones').get();
    let costoTotal = 0;
    refaccionesSnapshot.forEach(doc => {
      const data = doc.data();
      costoTotal += (data.cantidad * data.costo_unitario) || 0;
    });
    
    res.json({
      totalEquipos,
      equiposOperativos,
      mantenimientosPendientes,
      costoTotal: costoTotal.toFixed(2)
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Estadísticas por área
router.get('/areas', async (req, res) => {
  try {
    const areasSnapshot = await db.collection('areas').get();
    const estadisticasPorArea = [];
    
    for (const areaDoc of areasSnapshot.docs) {
      const areaData = areaDoc.data();
      
      // Contar equipos en esta área
      const equiposSnapshot = await db.collection('equipos')
        .where('id_area', '==', areaDoc.id)
        .get();
      
      estadisticasPorArea.push({
        id_area: areaDoc.id,
        nombre_area: areaData.nombre_area,
        total_equipos: equiposSnapshot.size
      });
    }
    
    res.json(estadisticasPorArea);
  } catch (error) {
    console.error('Error al obtener estadísticas por área:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Próximos mantenimientos
router.get('/proximos-mantenimientos', async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const snapshot = await db.collection('mantenimientos')
      .where('estado', '==', 'Pendiente')
      .where('fecha_programada', '>=', hoy)
      .orderBy('fecha_programada', 'asc')
      .limit(10)
      .get();
    
    const proximosMantenimientos = [];
    for (const doc of snapshot.docs) {
      const mantData = doc.data();
      
      // Obtener info del equipo
      let equipoData = {};
      if (mantData.id_equipo) {
        const equipoDoc = await db.collection('equipos').doc(mantData.id_equipo).get();
        if (equipoDoc.exists) {
          equipoData = equipoDoc.data();
        }
      }
      
      proximosMantenimientos.push({
        id_mantenimiento: doc.id,
        ...mantData,
        numero_serie: equipoData.numero_serie || '',
        marca: equipoData.marca || '',
        modelo: equipoData.modelo || ''
      });
    }
    
    res.json(proximosMantenimientos);
  } catch (error) {
    console.error('Error al obtener próximos mantenimientos:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;