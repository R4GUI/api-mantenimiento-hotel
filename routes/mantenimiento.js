const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET - Obtener todos los mantenimientos
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT m.*, e.numero_serie, a.nombre_area, t.nombre_tipo, e.marca, e.modelo
      FROM MantenimientoPreventivo m
      INNER JOIN Equipos e ON m.id_equipo = e.id_equipo
      INNER JOIN Areas a ON e.id_area = a.id_area
      INNER JOIN Tipos t ON e.id_tipo = t.id_tipo
      ORDER BY m.fecha_programada DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener mantenimientos por equipo
router.get('/equipo/:id_equipo', async (req, res) => {
  try {
    const query = `
      SELECT m.*, e.numero_serie, a.nombre_area, t.nombre_tipo
      FROM MantenimientoPreventivo m
      INNER JOIN Equipos e ON m.id_equipo = e.id_equipo
      INNER JOIN Areas a ON e.id_area = a.id_area
      INNER JOIN Tipos t ON e.id_tipo = t.id_tipo
      WHERE m.id_equipo = ?
      ORDER BY m.fecha_programada DESC
    `;
    const [rows] = await db.query(query, [req.params.id_equipo]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener mantenimiento por ID
router.get('/:id', async (req, res) => {
  try {
    const query = `
      SELECT m.*, e.numero_serie, a.nombre_area, t.nombre_tipo
      FROM MantenimientoPreventivo m
      INNER JOIN Equipos e ON m.id_equipo = e.id_equipo
      INNER JOIN Areas a ON e.id_area = a.id_area
      INNER JOIN Tipos t ON e.id_tipo = t.id_tipo
      WHERE m.id_mantenimiento = ?
    `;
    const [rows] = await db.query(query, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Mantenimiento no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear nuevo mantenimiento
router.post('/', async (req, res) => {
  try {
    const { id_equipo, fecha_programada, fecha_realizado, responsable, tipo_mantenimiento, estado, descripcion_trabajo, observaciones } = req.body;
    const [result] = await db.query(
      'INSERT INTO MantenimientoPreventivo (id_equipo, fecha_programada, fecha_realizado, responsable, tipo_mantenimiento, estado, descripcion_trabajo, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id_equipo, fecha_programada, fecha_realizado, responsable, tipo_mantenimiento, estado, descripcion_trabajo, observaciones]
    );
    res.status(201).json({
      id_mantenimiento: result.insertId,
      message: 'Mantenimiento programado exitosamente'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar mantenimiento
router.put('/:id', async (req, res) => {
  try {
    const { id_equipo, fecha_programada, fecha_realizado, responsable, tipo_mantenimiento, estado, descripcion_trabajo, observaciones } = req.body;
    const [result] = await db.query(
      'UPDATE MantenimientoPreventivo SET id_equipo = ?, fecha_programada = ?, fecha_realizado = ?, responsable = ?, tipo_mantenimiento = ?, estado = ?, descripcion_trabajo = ?, observaciones = ? WHERE id_mantenimiento = ?',
      [id_equipo, fecha_programada, fecha_realizado, responsable, tipo_mantenimiento, estado, descripcion_trabajo, observaciones, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Mantenimiento no encontrado' });
    }
    res.json({ message: 'Mantenimiento actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar mantenimiento
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM MantenimientoPreventivo WHERE id_mantenimiento = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Mantenimiento no encontrado' });
    }
    res.json({ message: 'Mantenimiento eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;