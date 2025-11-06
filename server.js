const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Importar rutas
const areasRoutes = require('./routes/areas');
const tiposRoutes = require('./routes/tipos');
const equiposRoutes = require('./routes/equipos');
const mantenimientoRoutes = require('./routes/mantenimiento');
const refaccionesRoutes = require('./routes/refacciones');
const historialRoutes = require('./routes/historial');
const estadisticasRoutes = require('./routes/estadisticas');

// Usar rutas
app.use('/api/areas', areasRoutes);
app.use('/api/tipos', tiposRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/mantenimientos', mantenimientoRoutes);
app.use('/api/refacciones', refaccionesRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/estadisticas', estadisticasRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: '🏨 API Sistema de Mantenimiento Hotel',
    version: '1.0.0',
    endpoints: {
      areas: '/api/areas',
      tipos: '/api/tipos',
      equipos: '/api/equipos',
      mantenimientos: '/api/mantenimientos',
      refacciones: '/api/refacciones',
      historial: '/api/historial',
      estadisticas: '/api/estadisticas'
    }
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    message: 'El endpoint solicitado no existe'
  });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log('═══════════════════════════════════════════');
//   console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
app.listen(PORT, '0.0.0.0', () => {
  console.log('═══════════════════════════════════════════');
  console.log(`🚀 Servidor corriendo en puerto: ${PORT}`);
  console.log('═══════════════════════════════════════════');
  console.log('📍 Endpoints disponibles:');
  console.log(`   GET    http://localhost:${PORT}/api/areas`);
  console.log(`   GET    http://localhost:${PORT}/api/tipos`);
  console.log(`   GET    http://localhost:${PORT}/api/equipos`);
  console.log(`   GET    http://localhost:${PORT}/api/mantenimientos`);
  console.log(`   GET    http://localhost:${PORT}/api/refacciones`);
  console.log(`   GET    http://localhost:${PORT}/api/historial`);
  console.log(`   GET    http://localhost:${PORT}/api/estadisticas`);
  console.log('═══════════════════════════════════════════');
  console.log('💡 Presiona Ctrl+C para detener el servidor');
});