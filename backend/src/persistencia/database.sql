-- No es necesario crear la base de datos con este script,
-- Docker Compose se encarga de ello usando las variables de entorno.

-- Usamos "users" en lugar de "user" porque "user" es una palabra reservada en PostgreSQL.
-- También se corrigió un error de sintaxis (una coma al final).
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Tabla para el menú del restaurante
CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL
);