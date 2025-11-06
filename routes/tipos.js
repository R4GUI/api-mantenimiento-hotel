const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET - Obtener todos los tipos
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Tipos ORDER BY nombre_tipo');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener tipo por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Tipos WHERE id_tipo = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Tipo no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear nuevo tipo
router.post('/', async (req, res) => {
  try {
    const { nombre_tipo, descripcion } = req.body;
    const [result] = await db.query(
      'INSERT INTO Tipos (nombre_tipo, descripcion) VALUES (?, ?)',
      [nombre_tipo, descripcion]
    );
    res.status(201).json({
      id_tipo: result.insertId,
      nombre_tipo,
      descripcion,
      message: 'Tipo creado exitosamente'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar tipo
router.put('/:id', async (req, res) => {
  try {
    const { nombre_tipo, descripcion } = req.body;
    const [result] = await db.query(
      'UPDATE Tipos SET nombre_tipo = ?, descripcion = ? WHERE id_tipo = ?',
      [nombre_tipo, descripcion, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tipo no encontrado' });
    }
    res.json({ message: 'Tipo actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar tipo
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Tipos WHERE id_tipo = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tipo no encontrado' });
    }
    res.json({ message: 'Tipo eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;