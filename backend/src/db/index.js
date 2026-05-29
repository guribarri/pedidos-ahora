const { Pool } = require('pg');

// Configuración de conexión usando variables de entorno de Docker
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

// Migraciones incrementales — se ejecutan en orden al arrancar el servidor
const runMigrations = async () => {
  try {
    // Migración original: user_email en pedidos
    await pool.query("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);");

    // Tabla de mesas físicas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mesas (
        id SERIAL PRIMARY KEY,
        numero INT NOT NULL UNIQUE,
        qr_token VARCHAR(255) NOT NULL UNIQUE,
        estado VARCHAR(50) DEFAULT 'libre'
      );
    `);

    // Tabla de sesiones de mesa (agrupación de comensales)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sesiones_mesas (
        id SERIAL PRIMARY KEY,
        mesa_id INT REFERENCES mesas(id) ON DELETE CASCADE,
        fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_fin TIMESTAMP,
        estado VARCHAR(50) DEFAULT 'activa'
      );
    `);

    // Columnas de mesa en pedidos
    await pool.query("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS mesa_id INT REFERENCES mesas(id) ON DELETE SET NULL;");
    await pool.query("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS sesion_mesa_id INT REFERENCES sesiones_mesas(id) ON DELETE SET NULL;");

    // Insertar las 10 mesas fijas si no existen
    await pool.query(`
      INSERT INTO mesas (numero, qr_token) VALUES
        (1,  'm1-qr-a3f8k2p9'),
        (2,  'm2-qr-b7n4x1w6'),
        (3,  'm3-qr-c2j9r5t8'),
        (4,  'm4-qr-d6v1m3q7'),
        (5,  'm5-qr-e4h8l0u2'),
        (6,  'm6-qr-f9z3k7p5'),
        (7,  'm7-qr-g1y6n4s8'),
        (8,  'm8-qr-h5w2x9r3'),
        (9,  'm9-qr-i8q4j7v1'),
        (10, 'm10-qr-j3t5b2n9')
      ON CONFLICT (numero) DO NOTHING;
    `);

    console.log('✅ Migraciones aplicadas correctamente');
  } catch (err) {
    console.error('Error al aplicar migraciones:', err.message || err);
  }
};

runMigrations();

module.exports = pool;