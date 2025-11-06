const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET - Obtener todos los equipos con información completa
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT e.*, a.nombre_area, t.nombre_tipo 
      FROM Equipos e
      INNER JOIN Areas a ON e.id_area = a.id_area
      INNER JOIN Tipos t ON e.id_tipo = t.id_tipo
      ORDER BY e.id_equipo DESC
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener equipo por ID
router.get('/:id', async (req, res) => {
  try {
    const query = `
      SELECT e.*, a.nombre_area, t.nombre_tipo 
      FROM Equipos e
      INNER JOIN Areas a ON e.id_area = a.id_area
      INNER JOIN Tipos t ON e.id_tipo = t.id_tipo
      WHERE e.id_equipo = ?
    `;
    const [rows] = await db.query(query, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear nuevo equipo
router.post('/', async (req, res) => {
  try {
    const { numero_serie, id_area, id_tipo, marca, modelo, fecha_adquisicion, estado, observaciones } = req.body;
    const [result] = await db.query(
      'INSERT INTO Equipos (numero_serie, id_area, id_tipo, marca, modelo, fecha_adquisicion, estado, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [numero_serie, id_area, id_tipo, marca, modelo, fecha_adquisicion, estado, observaciones]
    );
    res.status(201).json({
      id_equipo: result.insertId,
      message: 'Equipo creado exitosamente'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar equipo
router.put('/:id', async (req, res) => {
  try {
    const { numero_serie, id_area, id_tipo, marca, modelo, fecha_adquisicion, estado, observaciones } = req.body;
    const [result] = await db.query(
      'UPDATE Equipos SET numero_serie = ?, id_area = ?, id_tipo = ?, marca = ?, modelo = ?, fecha_adquisicion = ?, estado = ?, observaciones = ? WHERE id_equipo = ?',
      [numero_serie, id_area, id_tipo, marca, modelo, fecha_adquisicion, estado, observaciones, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }
    res.json({ message: 'Equipo actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar equipo
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Equipos WHERE id_equipo = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Equipo no encontrado' });
    }
    res.json({ message: 'Equipo eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;