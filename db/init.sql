
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
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    visible BOOLEAN DEFAULT true
);

-- Insertar usuario admin
INSERT INTO users (email, password)
VALUES ('admin@pedidiosahora.com', 'password123');

--Tabla para pedidos que hagan los clientes
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'confirmado'
);

--Tabla para pedidos-menu que hagan los clientes
CREATE TABLE pedidos_menus(
    id_pedido INT,
    id_menu INT,
    cantidad INT,
    precio_unitario DECIMAL(10,2),
    PRIMARY KEY (id_pedido, id_menu),
    FOREIGN KEY (id_menu) REFERENCES menus(id),
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id)
);

-- Tabla para mesas físicas del restaurante
CREATE TABLE mesas (
    id SERIAL PRIMARY KEY,
    numero INT NOT NULL UNIQUE,
    qr_token VARCHAR(255) NOT NULL UNIQUE,
    estado VARCHAR(50) DEFAULT 'libre'
);

-- Tabla para agrupar comensales bajo una sesión activa de mesa
CREATE TABLE sesiones_mesas (
    id SERIAL PRIMARY KEY,
    mesa_id INT REFERENCES mesas(id) ON DELETE CASCADE,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'activa'
);

-- Columnas de mesa en pedidos
ALTER TABLE pedidos ADD COLUMN mesa_id INT REFERENCES mesas(id) ON DELETE SET NULL;
ALTER TABLE pedidos ADD COLUMN sesion_mesa_id INT REFERENCES sesiones_mesas(id) ON DELETE SET NULL;

-- 10 mesas fijas con sus tokens QR únicos
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
(10, 'm10-qr-j3t5b2n9');


INSERT INTO menus (nombre, descripcion, precio, visible) VALUES
('El Primer Grito (Uruguay 1930)', 'Plato ppal: Pastel de papa al horno de barro. Bebida: Vermut con soda. Postre: Flan casero con dulce de leche.', 26000, true),
('El Hat-Trick de Stábile', 'Plato ppal: Tres empanadas de carne cortada a cuchillo. Bebida: Copa de vino Malbec de la casa. Postre: Panqueque con dulce de leche.', 25500, true),
('La Final del Río de la Plata', 'Plato ppal: Suprema de pollo a la Suiza con papas noisette. Bebida: Agua saborizada. Postre: Budín de pan mixto.', 28000, true),
('El Matador Kempes', 'Plato ppal: Bife de chorizo con papas fritas a caballo. Bebida: Copa de vino tinto robusto. Postre: Ensalada de frutas frescas.', 36000, true),
('El Abrazo del Alma', 'Plato ppal: Ñoquis caseros con estofado de carne. Bebida: Gaseosa línea Coca-Cola. Postre: Tarantela.', 27000, true),
('La Noche de los Papelitos', 'Plato ppal: Milanesa de ternera gigante a la napolitana con puré mixturado. Bebida: Cerveza tirada de 500ml. Postre: Helado de dos bochas.', 31000, true),
('El Pato Fillol', 'Plato ppal: Tira de asado crocante con ensalada mixta. Bebida: Agua mineral con gas. Postre: Queso y dulce (vigilante).', 38000, true),
('La Estrategia del Flaco Menotti', 'Plato ppal: Ravioles de espinaca y ricota con salsa scarparo. Bebida: Copa de vino blanco Chardonnay. Postre: Mousse de chocolate.', 28500, true),
('La Final contra la Naranja Mecánica', 'Plato ppal: Ojo de bife premium con verduras asadas. Bebida: Gaseosa mediana. Postre: Volcán de dulce de leche con helado.', 44000, true),
('La Muralla de Passarella', 'Plato ppal: Matambre a la pizza con papas fritas. Bebida: Chop de cerveza. Postre: Flan mixto (crema y dulce).', 32000, true),

('La Mano de Dios', 'Plato ppal: Sándwich de vacío al asador en pan de campo. Bebida: Fernet con coca clásico. Postre: Porción de chocotorta casera.', 29500, true),
('El Gol del Siglo', 'Plato ppal: Bife ancho premium con chimichurri y papas rústicas. Bebida: Copa de vino Malbec Reserva. Postre: Copa Melba.', 45000, true),
('El Barrilete Cósmico', 'Plato ppal: Suprema de pollo a la Maryland. Bebida: Gaseosa mediana. Postre: Panqueque quemado al ron con dulce de leche.', 29000, true),
('La Pizarra de Bilardo', 'Plato ppal: Pollo al verdeo con papas noisette. Bebida: Agua saborizada. Postre: Ensalada de frutas con crema.', 27500, true),
('El Toque de Burruchaga', 'Plato ppal: Bondiola de cerdo a la barbacoa con puré de manzanas. Bebida: Pinta de cerveza artesanal. Postre: Peras al borgoña.', 34000, true),
('La Muralla Tata Brown', 'Plato ppal: Costillitas de cerdo a la riojana. Bebida: Gaseosa línea Coca-Cola. Postre: Almendrado con salsa de charlotte.', 33000, true),
('El Gran Capitán del 86', 'Plato ppal: Entraña entera con porción de puré de papas. Bebida: Copa de vino Cabernet Sauvignon. Postre: Tiramisú artesanal.', 42000, true),
('La Batalla de Puebla', 'Plato ppal: Vacío del fino cocinado a fuego lento. Bebida: Vermut de la casa con rodaja de limón. Postre: Flan casero.', 37000, true),
('El Baile a los Belgas', 'Plato ppal: Canelones de carne y verdura con salsa mixta. Bebida: Agua mineral. Postre: Bocha de helado de dulce de leche.', 26500, true),
('Azteca Dorado', 'Plato ppal: Parrillada individual (chorizo, morcilla, chinchulín y tira de asado). Bebida: Gaseosa mediana. Postre: Postre Balcarce.', 41000, true),

('El Tobillo de Diego', 'Plato ppal: Lasaña rellena de jamón, queso y carne con salsa bolognesa. Bebida: Copa de vino tinto. Postre: Flan con crema.', 28000, true),
('Las Manos de Goyco', 'Plato ppal: Milanesa de lomo a la provenzal con papas rejilla. Bebida: Cerveza rubia de 500ml. Postre: Postre Don Pedro.', 32000, true),
('El Agitador Caniggia', 'Plato ppal: Pechuguitas de pollo al ajillo con papas españolas. Bebida: Agua saborizada. Postre: Frutillas con crema.', 27000, true),
('El Bidón de Branco', 'Plato ppal: Sorrentinos de jamón y queso con salsa rosa. Bebida: Agua mineral sin gas. Postre: Mousse de dulce de leche.', 27500, true),
('El Llanto de Roma', 'Plato ppal: Bife de cuadril jugoso con ensalada de rúcula y parmesano. Bebida: Copa de vino Syrah. Postre: Ensalada de frutas.', 35000, true),

('Me Cortaron las Piernas (USA 1994)', 'Plato ppal: Hamburguesa casera Albiceleste doble con queso, bacon y papas rústicas. Bebida: Gaseosa mediana. Postre: Sundae de chocolate.', 25000, true),
('El Golazo de Maxi Rodríguez (Alemania 2006)', 'Plato ppal: Ojo de bife mariposa con papas fritas. Bebida: Copa de vino Malbec de etiqueta. Postre: Porción de torta rogel.', 43000, true),
('El Abrazo de Diego y Messi (Sudáfrica 2010)', 'Plato ppal: Milanesa de bife de chorizo napolitana con papas fritas. Bebida: Gaseosa mediana. Postre: Bombón suizo.', 33500, true),
('La Garra de Mascherano (Brasil 2014)', 'Plato ppal: Tira de asado ancha con ensalada de lechuga, tomate y cebolla. Bebida: Agua con gas. Postre: Flan mixto.', 38500, true),
('El Hoy te Convertís en Héroe', 'Plato ppal: Pastel de cordero patagónico al gratén. Bebida: Copa de vino Cabernet Franc. Postre: Peras a la menta con helado.', 36000, true),
('El Milagro de Rojo contra Nigeria (Rusia 2018)', 'Plato ppal: Matambre tierno de cerdo a la mostaza con puré de batatas. Bebida: Cerveza artesanal tirada. Postre: Budín de pan casero.', 31500, true),

('La Scaloneta', 'Plato ppal: Asado de tira al asador con papas rústicas y chimichurri. Bebida: Fernet con coca servido en vaso viajero. Postre: Porción de chocotorta.', 39500, true),
('¿Qué Mirás, Bobo?', 'Plato ppal: Bife de chorizo angosto con huevo frito y papas fritas. Bebida: Copa de Malbec de Altura. Postre: Volcán de chocolate amargo.', 41000, true),
('La Atajada del Dibu en el 122''', 'Plato ppal: Ojo de bife premium (punto jugoso) con puré con nuez moscada. Bebida: Agua mineral premium. Postre: Postre de tres leches.', 46000, true),
('El Baile de Di María', 'Plato ppal: Suprema de pollo rellena de jamón, queso y espinaca con crema de verdeo. Bebida: Copa de vino Torrontés. Postre: Copa de frutillas con crema.', 29500, true),
('El Penal de Montiel', 'Plato ppal: Bife de lomo tierno con papas fritas provenzal. Bebida: Copa de vino tinto Blend. Postre: Panqueque de dulce de leche quemado.', 48000, true),
('Muchachos', 'Plato ppal: Milanesa gigante de ternera a la napolitana con papas fritas. Bebida: Gaseosa grande. Postre: Flan casero mixto.', 34000, true),
('El Cinco de Copas', 'Plato ppal: Cinco empanadas gourmet a elección. Bebida: Vermut rosso con naranja. Postre: Helado artesanal.', 26500, true),
('La Araña que Pica', 'Plato ppal: Bondiola de cerdo braseada a la cerveza negra con puré de calabaza. Bebida: Chop de cerveza artesanal. Postre: Brownie con helado.', 33000, true),
('El Motorcito De Paul', 'Plato ppal: Ñoquis de papa caseros con salsa bolognesa abundante. Bebida: Gaseosa mediana. Postre: Ensalada de frutas de estación.', 25500, true),
('El Líder Messi', 'Plato ppal: El bife de lomo más tierno de la casa con papas gratinadas. Bebida: Copa de vino tinto Premium. Postre: Tiramisú especial.', 52000, true),
('La Final Más Épica', 'Plato ppal: Vacío del fino madurado con guarnición de achuras. Bebida: Vino Malbec Reserva. Postre: Queso y dulce de membrillo.', 47500, true),
('Los Penales contra Países Bajos', 'Plato ppal: Milanesa de pollo suprema con fideos al oleo. Bebida: Agua saborizada. Postre: Crema catalana.', 26000, true),
('La Locura de Scaloni', 'Plato ppal: Costillar al asador por porción con papas fritas rústicas. Bebida: Pinta de cerveza IPA fría. Postre: Flan tradicional con dulce de leche.', 39000, true),
('El Andá p''allá', 'Plato ppal: Raviolones de cordero con salsa de hongos. Bebida: Copa de vino Pinot Noir. Postre: Mousse de chocolate semiamargo.', 35000, true),
('La Caravana de los 5 Millones', 'Plato ppal: Choripán de puro cerdo premium en pan francés con chimichurri. Bebida: Fernet con coca mediano. Postre: Alfajor helado artesanal.', 25000, true),
('Abuela Lalala', 'Plato ppal: Canelones de verdura caseros con salsa fileto y crema. Bebida: Agua mineral. Postre: Bocha de helado de crema americana.', 25500, true),
('El Maracanazo Pre-Mundial', 'Plato ppal: Bife de cuadril jugoso con ensalada de tomate y huevo. Bebida: Copa de vino tinto. Postre: Tarta de manzana tibia con helado.', 34500, true),
('La Finalissima en Wembley', 'Plato ppal: Fish and chips al estilo argentino. Bebida: Limonada con menta y jengibre. Postre: Ensalada de frutas.', 27000, true),
('Las Tres Estrellas en el Pecho', 'Plato ppal: Ojo de bife con hueso madurado con papas fritas y ensalada. Bebida: Copa de vino Malbec de autor. Postre: Postre vigilante clásico.', 55000, true);