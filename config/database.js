const mysql = require('mysql2');
require('dotenv').config();

// Crear un pool de conexiones (más eficiente que una sola conexión)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Crear el pool de promesas para usar async/await
const promisePool = pool.promise();

// Verificar la conexión al iniciar
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error al conectar con MySQL:', err.message);
  } else {
    console.log(`✅ Conectado exitosamente a MySQL (${process.env.DB_NAME}) en ${process.env.DB_HOST}`);
    connection.release();
  }
});

module.exports = promisePool;
