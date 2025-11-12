const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🧩 Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// 🔥 Conexión con Firebase
const { db } = require('./config/firebase');

// 📦 Importar rutas
const areasRoutes = require('./routes/areas');
const tiposRoutes = require('./routes/tipos');
const equiposRoutes = require('./routes/equipos');
const mantenimientoRoutes = require('./routes/mantenimiento');
const refaccionesRoutes = require('./routes/refacciones');
const historialRoutes = require('./routes/historial');
const estadisticasRoutes = require('./routes/estadisticas');

// 🚏 Usar rutas (todas en plural para que coincidan con tu frontend Angular)
app.use('/api/areas', areasRoutes);
app.use('/api/tipos', tiposRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/mantenimientos', mantenimientoRoutes);
app.use('/api/refacciones', refaccionesRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/estadisticas', estadisticasRoutes);

// 🏠 Ruta principal de prueba
app.get('/', (req, res) => {
  res.json({
    mensaje: '🏨 API Hotel Mantenimiento con Firebase',
    estado: '✅ Operativo',
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

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto: ${PORT}`);
  console.log(`✅ Conectado a Firebase Firestore`);
});
