const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// GET - Obtener lista única de proveedores
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('refacciones').get();
    
    // Extraer proveedores únicos
    const proveedoresSet = new Set();
    snapshot.docs.forEach(doc => {
      const proveedor = doc.data().proveedor;
      if (proveedor && proveedor.trim() !== '') {
        proveedoresSet.add(proveedor.trim());
      }
    });
    
    // Convertir a array y ordenar alfabéticamente
    const proveedores = Array.from(proveedoresSet).sort();
    
    res.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener gastos por proveedor con filtro de fechas
router.get('/gastos', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    // Obtener todas las refacciones
    const snapshot = await db.collection('refacciones').get();
    const refacciones = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Obtener mantenimientos para filtrar por fecha
    const mantenimientosSnapshot = await db.collection('mantenimientos').get();
    const mantenimientos = mantenimientosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filtrar mantenimientos por fecha si se proporcionan
    let mantenimientosFiltrados = mantenimientos;
    if (fechaInicio && fechaFin) {
      mantenimientosFiltrados = mantenimientos.filter(m => {
        const fecha = new Date(m.fecha_programada);
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        return fecha >= inicio && fecha <= fin;
      });
    }
    
    const idsMantenimientosFiltrados = mantenimientosFiltrados.map(m => m.id);
    
    // Agrupar refacciones por proveedor
    const gastosPorProveedor = {};
    
    refacciones.forEach(ref => {
      // Solo incluir si el mantenimiento está en el rango de fechas
      if (idsMantenimientosFiltrados.includes(ref.id_mantenimiento)) {
        const proveedor = ref.proveedor || 'Sin Proveedor';
        const costo = (ref.costo_unitario || 0) * ref.cantidad;
        
        if (!gastosPorProveedor[proveedor]) {
          gastosPorProveedor[proveedor] = {
            proveedor: proveedor,
            totalGastado: 0,
            cantidadRefacciones: 0,
            refacciones: []
          };
        }
        
        gastosPorProveedor[proveedor].totalGastado += costo;
        gastosPorProveedor[proveedor].cantidadRefacciones += 1;
        gastosPorProveedor[proveedor].refacciones.push({
          nombre: ref.nombre_refaccion,
          cantidad: ref.cantidad,
          costo: costo
        });
      }
    });
    
    // Convertir a array y ordenar por total gastado (mayor a menor)
    const resultado = Object.values(gastosPorProveedor)
      .sort((a, b) => b.totalGastado - a.totalGastado);
    
    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener gastos por proveedor:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;