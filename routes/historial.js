const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET - Obtener historial por equipo
router.get('/equipo/:id_equipo', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM HistorialEquipo WHERE id_equipo = ? ORDER BY fecha_evento DESC',
      [req.params.id_equipo]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener todo el historial
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT h.*, e.numero_serie, a.nombre_area, t.nombre_tipo
      FROM HistorialEquipo h
      INNER JOIN Equipos e ON h.id_equipo = e.id_equipo
      INNER JOIN Areas a ON e.id_area = a.id_area
      INNER JOIN Tipos t ON e.id_tipo = t.id_tipo
      ORDER BY h.fecha_evento DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear nuevo registro de historial
router.post('/', async (req, res) => {
  try {
    const { id_equipo, fecha_evento, tipo_evento, descripcion, realizado_por, costo } = req.body;
    const [result] = await db.query(
      'INSERT INTO HistorialEquipo (id_equipo, fecha_evento, tipo_evento, descripcion, realizado_por, costo) VALUES (?, ?, ?, ?, ?, ?)',
      [id_equipo, fecha_evento, tipo_evento, descripcion, realizado_por, costo]
    );
    res.status(201).json({
      id_historial: result.insertId,
      message: 'Registro de historial creado exitosamente'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar registro de historial
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM HistorialEquipo WHERE id_historial = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    res.json({ message: 'Registro eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;