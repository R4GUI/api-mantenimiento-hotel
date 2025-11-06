const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET - Obtener refacciones por mantenimiento
router.get('/mantenimiento/:id_mantenimiento', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Refacciones WHERE id_mantenimiento = ? ORDER BY fecha_compra DESC',
      [req.params.id_mantenimiento]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener todas las refacciones
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT r.*, m.id_equipo, e.numero_serie
      FROM Refacciones r
      INNER JOIN MantenimientoPreventivo m ON r.id_mantenimiento = m.id_mantenimiento
      INNER JOIN Equipos e ON m.id_equipo = e.id_equipo
      ORDER BY r.fecha_compra DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener refacción por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Refacciones WHERE id_refaccion = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Refacción no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear nueva refacción
router.post('/', async (req, res) => {
  try {
    const { id_mantenimiento, folio_compra, descripcion, cantidad, costo_unitario, proveedor, fecha_compra } = req.body;
    const [result] = await db.query(
      'INSERT INTO Refacciones (id_mantenimiento, folio_compra, descripcion, cantidad, costo_unitario, proveedor, fecha_compra) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id_mantenimiento, folio_compra, descripcion, cantidad, costo_unitario, proveedor, fecha_compra]
    );
    res.status(201).json({
      id_refaccion: result.insertId,
      message: 'Refacción registrada exitosamente'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar refacción
router.put('/:id', async (req, res) => {
  try {
    const { id_mantenimiento, folio_compra, descripcion, cantidad, costo_unitario, proveedor, fecha_compra } = req.body;
    const [result] = await db.query(
      'UPDATE Refacciones SET id_mantenimiento = ?, folio_compra = ?, descripcion = ?, cantidad = ?, costo_unitario = ?, proveedor = ?, fecha_compra = ? WHERE id_refaccion = ?',
      [id_mantenimiento, folio_compra, descripcion, cantidad, costo_unitario, proveedor, fecha_compra, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Refacción no encontrada' });
    }
    res.json({ message: 'Refacción actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar refacción
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Refacciones WHERE id_refaccion = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Refacción no encontrada' });
    }
    res.json({ message: 'Refacción eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;