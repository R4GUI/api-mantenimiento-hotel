const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// GET - Obtener todos los tickets
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('tickets').orderBy('fecha_creacion', 'desc').get();
    const tickets = snapshot.docs.map(doc => ({
      id_ticket: doc.id,
      ...doc.data()
    }));
    res.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener tickets por responsable (para empleados de mantenimiento)
router.get('/responsable/:username', async (req, res) => {
  try {
    const snapshot = await db.collection('tickets')
      .where('asignado_a', '==', req.params.username)
      .orderBy('fecha_creacion', 'desc')
      .get();
    
    const tickets = snapshot.docs.map(doc => ({
      id_ticket: doc.id,
      ...doc.data()
    }));
    
    res.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener tickets de hoy
router.get('/hoy', async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const snapshot = await db.collection('tickets')
      .where('fecha_creacion', '>=', hoy)
      .orderBy('fecha_creacion', 'desc')
      .get();
    
    const tickets = snapshot.docs.map(doc => ({
      id_ticket: doc.id,
      ...doc.data()
    }));
    
    res.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets de hoy:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear nuevo ticket (Ama de llaves)
router.post('/', async (req, res) => {
  try {
    // Obtener empleados de mantenimiento disponibles hoy
    const empleadosDisponibles = await obtenerEmpleadosDisponiblesHoy();
    
    if (empleadosDisponibles.length === 0) {
      return res.status(400).json({ 
        error: 'No hay empleados de mantenimiento disponibles hoy' 
      });
    }
    
    // Asignar aleatoriamente
    const empleadoAsignado = empleadosDisponibles[
      Math.floor(Math.random() * empleadosDisponibles.length)
    ];
    
    const ticketData = {
      area: req.body.area || '',
      piso: req.body.piso || '',
      habitacion: req.body.habitacion || '',
      descripcion_problema: req.body.descripcion_problema || '',
      prioridad: req.body.prioridad || 'Media',
      creado_por: req.body.creado_por || '',
      asignado_a: empleadoAsignado,
      estado: 'Pendiente',
      fecha_creacion: new Date().toISOString(),
      fecha_limite: calcularFechaLimite(),
      observaciones_mantenimiento: '',
      fecha_completado: null
    };
    
    const docRef = await db.collection('tickets').add(ticketData);
    
    res.status(201).json({
      id_ticket: docRef.id,
      ...ticketData,
      message: `Ticket creado y asignado a ${empleadoAsignado}`
    });
  } catch (error) {
    console.error('Error al crear ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar ticket (Mantenimiento)
router.put('/:id', async (req, res) => {
  try {
    const updateData = {
      estado: req.body.estado,
      observaciones_mantenimiento: req.body.observaciones_mantenimiento || '',
      updated_at: new Date().toISOString()
    };
    
    // Si se completa el ticket
    if (req.body.estado === 'Completado') {
      const horaActual = new Date().getHours();
      
      // Verificar si es después de las 8 PM
      if (horaActual >= 20) {
        return res.status(400).json({ 
          error: 'No se puede completar el ticket después de las 8 PM' 
        });
      }
      
      updateData.fecha_completado = new Date().toISOString();
    }
    
    await db.collection('tickets').doc(req.params.id).update(updateData);
    
    res.json({ message: 'Ticket actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar ticket (solo admin)
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('tickets').doc(req.params.id).delete();
    res.json({ message: 'Ticket eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener tickets no completados (para reporte del admin)
router.get('/incompletos/reporte', async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const snapshot = await db.collection('tickets')
      .where('fecha_creacion', '>=', hoy)
      .where('estado', '!=', 'Completado')
      .get();
    
    const tickets = snapshot.docs.map(doc => ({
      id_ticket: doc.id,
      ...doc.data()
    }));
    
    res.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets incompletos:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== FUNCIONES AUXILIARES ==========

// Función para obtener empleados disponibles hoy
async function obtenerEmpleadosDisponiblesHoy() {
  try {
    const hoy = new Date().toLocaleDateString('es-MX', { weekday: 'long' });
    const fechaHoy = new Date().toISOString().split('T')[0];
    
    // Obtener todos los empleados de mantenimiento
    const empleadosSnapshot = await db.collection('usuarios')
      .where('rol', '==', 'mantenimiento')
      .where('activo', '==', true)
      .get();
    
    const empleados = empleadosSnapshot.docs.map(doc => doc.data().username);
    
    // Filtrar por horarios
    const empleadosDisponibles = [];
    
    for (const empleado of empleados) {
      const horarioSnapshot = await db.collection('horarios')
        .where('username', '==', empleado)
        .where('fecha', '==', fechaHoy)
        .where('disponible', '==', true)
        .get();
      
      if (!horarioSnapshot.empty) {
        empleadosDisponibles.push(empleado);
      }
    }
    
    // Si no hay horarios definidos, devolver todos los empleados
    if (empleadosDisponibles.length === 0) {
      return empleados;
    }
    
    return empleadosDisponibles;
  } catch (error) {
    console.error('Error al obtener empleados disponibles:', error);
    // En caso de error, devolver todos los empleados de mantenimiento
    const empleadosSnapshot = await db.collection('usuarios')
      .where('rol', '==', 'mantenimiento')
      .where('activo', '==', true)
      .get();
    
    return empleadosSnapshot.docs.map(doc => doc.data().username);
  }
}

// Función para calcular fecha límite (hoy a las 8 PM)
function calcularFechaLimite() {
  const fechaLimite = new Date();
  fechaLimite.setHours(20, 0, 0, 0);
  return fechaLimite.toISOString();
}

module.exports = router;