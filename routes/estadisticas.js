const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET - Obtener estadísticas generales
router.get('/', async (req, res) => {
  try {
    const [totalEquipos] = await db.query('SELECT COUNT(*) as total FROM Equipos');
    const [equiposOperativos] = await db.query("SELECT COUNT(*) as total FROM Equipos WHERE estado = 'Operativo'");
    const [mantenimientosPendientes] = await db.query("SELECT COUNT(*) as total FROM MantenimientoPreventivo WHERE estado = 'Programado'");
    const [costoRefacciones] = await db.query('SELECT COALESCE(SUM(costo_total), 0) as total FROM Refacciones');
    const [costoHistorial] = await db.query('SELECT COALESCE(SUM(costo), 0) as total FROM HistorialEquipo');

    const estadisticas = {
      totalEquipos: totalEquipos[0].total,
      equiposOperativos: equiposOperativos[0].total,
      mantenimientosPendientes: mantenimientosPendientes[0].total,
      costoTotal: parseFloat(costoRefacciones[0].total) + parseFloat(costoHistorial[0].total)
    };

    res.json(estadisticas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Equipos por área
router.get('/equipos-por-area', async (req, res) => {
  try {
    const query = `
      SELECT a.nombre_area, COUNT(e.id_equipo) as cantidad
      FROM Areas a
      LEFT JOIN Equipos e ON a.id_area = e.id_area
      GROUP BY a.id_area, a.nombre_area
      ORDER BY cantidad DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Equipos por tipo
router.get('/equipos-por-tipo', async (req, res) => {
  try {
    const query = `
      SELECT t.nombre_tipo, COUNT(e.id_equipo) as cantidad
      FROM Tipos t
      LEFT JOIN Equipos e ON t.id_tipo = e.id_tipo
      GROUP BY t.id_tipo, t.nombre_tipo
      ORDER BY cantidad DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Mantenimientos por mes
router.get('/mantenimientos-por-mes', async (req, res) => {
  try {
    const query = `
      SELECT 
        YEAR(fecha_programada) as año,
        MONTH(fecha_programada) as mes,
        COUNT(*) as cantidad
      FROM MantenimientoPreventivo
      WHERE fecha_programada >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY año, mes
      ORDER BY año DESC, mes DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;