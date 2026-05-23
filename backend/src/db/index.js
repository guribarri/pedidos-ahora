const { Pool } = require('pg');

// Configuración de conexión usando variables de entorno de Docker
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

// Asegurar que la tabla de pedidos tenga el campo user_email en caso de migración incremental.
pool.query("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);")
  .catch((err) => {
    console.error('Error al asegurar esquema de pedidos:', err.message || err);
  });

module.exports = pool;