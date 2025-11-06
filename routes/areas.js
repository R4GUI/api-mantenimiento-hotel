const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET - Obtener todas las áreas
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Areas ORDER BY nombre_area');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener área por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Areas WHERE id_area = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Área no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear nueva área
router.post('/', async (req, res) => {
  try {
    const { nombre_area, descripcion } = req.body;
    const [result] = await db.query(
      'INSERT INTO Areas (nombre_area, descripcion) VALUES (?, ?)',
      [nombre_area, descripcion]
    );
    res.status(201).json({
      id_area: result.insertId,
      nombre_area,
      descripcion,
      message: 'Área creada exitosamente'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar área
router.put('/:id', async (req, res) => {
  try {
    const { nombre_area, descripcion } = req.body;
    const [result] = await db.query(
      'UPDATE Areas SET nombre_area = ?, descripcion = ? WHERE id_area = ?',
      [nombre_area, descripcion, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Área no encontrada' });
    }
    res.json({ message: 'Área actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar área
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Areas WHERE id_area = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Área no encontrada' });
    }
    res.json({ message: 'Área eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;