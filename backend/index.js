const express = require('express');
const { Pool } = require('pg');
const app = express();

// Configuración de conexión usando variables de entorno de Docker
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

app.get('/', async (req, res) => {
  res.send('API de PedidosAhora funcionando 🚀');
});

app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});