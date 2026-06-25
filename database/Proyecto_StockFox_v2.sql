-- ──────────────────────────────────────────────────────────────────────────────
-- Proyecto: Sistema de Gestión del Kiosco - StockFox
-- BBBD Oficial del Proyecto
-- Materia:  Administración y Gestión de Base de Datos
-- Curso y Escuela: 5°8° — E.T. 29° D.E. 06
-- Año: 2026
-- ──────────────────────────────────────────────────────────────────────────────

DROP DATABASE IF EXISTS StockFox_V2; -- Si la BBDD ya existe, se elimina para poder recrearla

-- Crea la base de datos con soporte completo para caracteres especiales
CREATE DATABASE StockFox_V2
    CHARACTER SET utf8mb4 -- Define qué caracteres puede almacenar la base de datos. Es la versión completa de UTF-8 que soporta prácticamente todos los carácteres
    COLLATE utf8mb4_unicode_ci; -- Define cómo se comparan y ordenan los textos. Significa que no distingue entre mayúsculas y minúsculas al comparar.
    
-- Selecciona la base de datos a usar para que todas las tablas se creen dentro de ella.
USE StockFox_V2;

-- ──────────────────────────────────────────────────────────────────────────────
-- BLOQUE 1: ENTIDADES FUERTES SIN DEPENDENCIAS Entidades Fuertes sin Dependencias
-- Tablas que no dependen de ninguna otra tabla.
-- ──────────────────────────────────────────────────────────────────────────────

-- TABLA: USUARIOS --
CREATE TABLE USUARIOS (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY, -- Identificador único del usuario. Se asigna automáticamente.
    -- Nombre y apellido del usuario.
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL, -- Contraseña encriptada con bcrypt. Nunca se guarda en texto plano. VARCHAR(255) porque bcrypt genera hashes de entre 60 y 72 caracteres.
    rol ENUM('Encargada', 'Ayudante') NOT NULL -- Define el perfil de acceso. Solo puede ser 'Encargada' o 'Ayudante'. -- ENUM garantiza que no se pueda guardar ningún otro valor.
);

-- TABLA: ALUMNOS --
CREATE TABLE ALUMNOS (
    id_alumno INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    anio TINYINT NOT NULL,      -- 1, 2, 3, 4, 5, 6
	division TINYINT NOT NULL,  -- 1, 2, 3... 10
    -- PIN encriptado para autenticación del alumno.
    pin_hash    VARCHAR(255) NOT NULL -- PIN encriptado para autenticación del alumno. VARCHAR(255) por la misma razón que contrasena_hash: longitud del hash.
);

-- TABLA: CATEGORIA_PRODUCTO --
CREATE TABLE CATEGORIA_PRODUCTO (
    id_categoria    INT         AUTO_INCREMENT PRIMARY KEY,
    -- UNIQUE garantiza que no puedan existir dos categorías con el mismo nombre.
    nombre VARCHAR(50) NOT NULL UNIQUE -- UNIQUE garantiza que no puedan existir dos categorías con el mismo nombre.
);

-- TABLA: PROVEEDORES --
CREATE TABLE PROVEEDORES (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20)  NOT NULL,
    dias_visita VARCHAR(50)  NOT NULL -- Días de la semana en que el proveedor visita el kiosco
);

-- ──────────────────────────────────────────────────────────────────────────────────────────────────────
-- BLOQUE 2: ENTIDADES QUE DEPENDEN DEL BLOQUE 1
-- Tablas que tienen FK apuntando a las tablas del bloque 1, se deben de crear si o si despues que esas.
-- ──────────────────────────────────────────────────────────────────────────────────────────────────────

-- TABLA: PRODUCTOS --
CREATE TABLE PRODUCTOS (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL, -- FK a CATEGORIA_PRODUCTO: cada producto pertenece a una categoría.
    nombre VARCHAR(100) NOT NULL,
    precio_actual DECIMAL(10,2) NOT NULL, -- Precio de venta actual. DECIMAL(10,2) = hasta 99999999.99 pesos.
    stock INT NOT NULL CHECK (stock >= 0), -- Stock disponible. CHECK evita que se guarde un número negativo.
    stock_minimo INT NOT NULL, -- Si el stock baja de este número, el sistema genera una alerta.
    foto_url VARCHAR(255) NULL, -- URL de la imagen del producto. NULL porque es opcional.
    disponible BOOLEAN NOT NULL, -- TRUE si el producto está visible y disponible para venta. FALSE si no.
    FOREIGN KEY (id_categoria) REFERENCES CATEGORIA_PRODUCTO(id_categoria)
);

-- TABLA: VENTAS --
CREATE TABLE VENTAS (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL, -- FK a USUARIOS: quién registró la venta (encargada o ayudante).
    fecha_hora DATETIME NOT NULL, -- Fecha y hora exacta de la venta.
    total DECIMAL(10,2) NOT NULL, -- Total de la venta. No debe cambiar aunque cambien los precios de los productos.
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
);

-- TABLA: PEDIDOS --
CREATE TABLE PEDIDOS (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_alumno INT NOT NULL, -- FK a ALUMNOS: qué alumno realizó el pedido
    horario_retiro TIME NOT NULL, -- Hora acordada para que el alumno retire su pedido 
    estado  ENUM('pendiente', 'listo', 'entregado') NOT NULL, -- Estado actual del pedido en el flujo del sistema.
    total DECIMAL(10,2) NOT NULL, -- Total del pedido
    fecha_creacion  DATETIME NOT NULL, -- Fecha y hora en que el alumno realizó el pedido.
    FOREIGN KEY (id_alumno) REFERENCES ALUMNOS(id_alumno)
);

-- TABLA: COMPRAS_PROVEEDOR --
CREATE TABLE COMPRAS_PROVEEDOR (
    id_compra INT AUTO_INCREMENT PRIMARY KEY, -- Identificador único de la compra. Se asigna automáticamente.
    id_proveedor INT NOT NULL, -- FK a PROVEEDORES: a qué proveedor se le realizó la compra.
    id_usuario INT NOT NULL, -- FK a USUARIOS: quién registró la compra en el sistema.
    fecha DATETIME NOT NULL, -- Fecha y hora de la compra.
    monto_total DECIMAL(10,2) NOT NULL, -- Total de la compra. Atributo DERIVADO almacenado.
    FOREIGN KEY (id_proveedor) REFERENCES PROVEEDORES(id_proveedor),
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
);
 
-- TABLA: PROMOCIONES --
CREATE TABLE PROMOCIONES (
    id_promocion INT AUTO_INCREMENT PRIMARY KEY, -- Identificador único de la promoción. Se asigna automáticamente.
    id_usuario INT NOT NULL, -- FK a USUARIOS: quién creó la promoción.
    nombre VARCHAR(100) NOT NULL, -- Nombre descriptivo de la promo (ej: '2x1 Alfajores').
    precio_especial DECIMAL(10,2) NOT NULL, -- Precio especial que tiene la promoción.
    fecha_inicio DATE NOT NULL, -- Fecha en que la promoción empieza a estar activa.
    fecha_fin DATE NOT NULL, -- Fecha en que la promoción deja de estar activa.
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
);
 
-- TABLA: GASTOS_OPERATIVOS --
CREATE TABLE GASTOS_OPERATIVOS (
    id_gasto INT AUTO_INCREMENT PRIMARY KEY, -- Identificador único del gasto. Se asigna automáticamente.
    id_usuario INT NOT NULL, -- FK a USUARIOS: quién registró el gasto.
    descripcion VARCHAR(255) NOT NULL, -- Descripción del gasto.
    monto DECIMAL(10,2) NOT NULL, -- Monto total del gasto.
    fecha DATE NOT NULL, -- Fecha del gasto.
    categoria VARCHAR(50) NULL, -- Tipo de gasto (ej: 'Servicio', 'Limpieza'). NULL porque es opcional.
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
);
 
-- TABLA: HISTORIAL_PRECIOS --
CREATE TABLE HISTORIAL_PRECIOS (
    id_historial INT AUTO_INCREMENT PRIMARY KEY, -- Identificador único del registro. Se asigna automáticamente.
    id_producto INT NOT NULL, -- FK a PRODUCTOS: de qué producto se modificó el precio.
    id_usuario INT NOT NULL, -- FK a USUARIOS: quién hizo el cambio.
    precio_anterior DECIMAL(10,2) NOT NULL, -- Precio previo al cambio.
    precio_nuevo DECIMAL(10,2) NOT NULL, -- Nuevo precio asignado.
    fecha_cambio DATETIME NOT NULL, -- Fecha y hora del cambio.
    FOREIGN KEY (id_producto) REFERENCES PRODUCTOS(id_producto),
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
);
 
-- TABLA: MENU_DIA --
CREATE TABLE MENU_DIA (
    id_menu INT AUTO_INCREMENT PRIMARY KEY, -- Identificador único del menú. Se asigna automáticamente.
    id_usuario INT NOT NULL, -- FK a USUARIOS: quién cargó el menú del día.
    descripcion VARCHAR(255) NOT NULL, -- Descripción textual del menú (ej: 'Arroz con pollo').
    precio DECIMAL(10,2) NOT NULL, -- Precio del menú.
    fecha DATE NOT NULL, -- Fecha a la que corresponde el menú.
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
);
 
-- TABLA: PAGOS_PROVEEDOR --
CREATE TABLE PAGOS_PROVEEDOR (
    id_pago INT AUTO_INCREMENT PRIMARY KEY, -- Identificador único del pago. Se asigna automáticamente.
    id_proveedor INT NOT NULL, -- FK a PROVEEDORES: a qué proveedor se le realizó el pago.
    id_usuario INT NOT NULL, -- FK a USUARIOS: quién registró el pago.
    fecha DATETIME NOT NULL, -- Fecha y hora del pago.
    monto DECIMAL(10,2) NOT NULL, -- Monto pagado al proveedor.
    FOREIGN KEY (id_proveedor) REFERENCES PROVEEDORES(id_proveedor),
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
);
 
-- ──────────────────────────────────────────────────────────────────────────────
-- BLOQUE 3: ENTIDADES DÉBILES (TABLAS DE DETALLE E INTERMEDIAS)
-- Dependen de las tablas anteriores para existir.
-- Resuelven los atributos multivaluados del modelo.
-- Se crean al final porque referencian tablas de los dos bloques anteriores.
-- ──────────────────────────────────────────────────────────────────────────────
 
-- TABLA: DETALLE_VENTA --
-- Resuelve el atributo multivaluado 'productos' de VENTAS.
CREATE TABLE DETALLE_VENTA (
    id_detalleventa INT AUTO_INCREMENT PRIMARY KEY, -- Identificador único del detalle. Se asigna automáticamente.
    id_venta INT NOT NULL, -- FK a VENTAS: a qué venta pertenece este detalle.
    id_producto INT NOT NULL, -- FK a PRODUCTOS: qué producto se vendió.
    cantidad INT NOT NULL CHECK (cantidad > 0), -- Cantidad de unidades vendidas. CHECK evita que se guarde un valor de 0 o negativo.
    precio_unitario DECIMAL(10,2) NOT NULL, -- Precio al momento de la venta. Se guarda acá para que si el precio cambia después, el historial no se altere.
    FOREIGN KEY (id_venta) REFERENCES VENTAS(id_venta),
    FOREIGN KEY (id_producto) REFERENCES PRODUCTOS(id_producto)
);
 
-- TABLA: DETALLE_PEDIDO --
-- Resuelve el atributo multivaluado 'productos' de PEDIDOS.
CREATE TABLE DETALLE_PEDIDO (
    id_detallepedido INT AUTO_INCREMENT PRIMARY KEY, -- Identificador único del detalle. Se asigna automáticamente.
    id_pedido INT NOT NULL, -- FK a PEDIDOS: a qué pedido pertenece este detalle.
    id_producto INT NOT NULL, -- FK a PRODUCTOS: qué producto se pidió.
    cantidad INT NOT NULL CHECK (cantidad > 0), -- Cantidad pedida. CHECK evita que se guarde un valor de 0 o negativo.
    precio_unitario DECIMAL(10,2) NOT NULL, -- Precio al momento del pedido. Misma razón que en DETALLE_VENTA.
    FOREIGN KEY (id_pedido) REFERENCES PEDIDOS(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES PRODUCTOS(id_producto)
);
 
-- TABLA: DETALLE_COMPRA --
-- Resuelve el atributo multivaluado 'productos' de COMPRAS_PROVEEDOR.
CREATE TABLE DETALLE_COMPRA (
    id_detallecompra INT AUTO_INCREMENT PRIMARY KEY, -- Identificador único del detalle. Se asigna automáticamente.
    id_compra INT NOT NULL, -- FK a COMPRAS_PROVEEDOR: a qué compra pertenece este detalle.
    id_producto INT NOT NULL, -- FK a PRODUCTOS: qué producto se compró.
    cantidad INT NOT NULL CHECK (cantidad > 0), -- Cantidad comprada del producto. CHECK evita que se guarde un valor de 0 o negativo.
    precio_costo DECIMAL(10,2) NOT NULL, -- Precio de costo unitario en esa compra. Se guarda acá porque el costo puede cambiar de una compra a otra.
    FOREIGN KEY (id_compra) REFERENCES COMPRAS_PROVEEDOR(id_compra),
    FOREIGN KEY (id_producto) REFERENCES PRODUCTOS(id_producto)
);
 
-- TABLA: DETALLE_PROMOCION --
-- Resuelve el atributo multivaluado 'productos' de PROMOCIONES.
CREATE TABLE DETALLE_PROMOCION (
    id_detallepromo INT AUTO_INCREMENT PRIMARY KEY, -- Identificador único del detalle. Se asigna automáticamente.
    id_promocion INT NOT NULL, -- FK a PROMOCIONES: a qué promoción pertenece este detalle.
    id_producto INT NOT NULL, -- FK a PRODUCTOS: qué producto forma parte de la promoción.
    cantidad INT NOT NULL, -- Cantidad del producto incluida en la promo (ej: 2 en una promo 2x1).
    FOREIGN KEY (id_promocion) REFERENCES PROMOCIONES(id_promocion),
    FOREIGN KEY (id_producto) REFERENCES PRODUCTOS(id_producto)
);
 
-- TABLA: PROVEEDOR_PRODUCTO --
-- Tabla intermedia que resuelve la relación M:N entre PROVEEDORES y PRODUCTOS.
-- Su PK es COMPUESTA: la combinación de id_proveedor + id_producto debe ser única.
-- Esto impide registrar dos veces que el mismo proveedor vende el mismo producto.
CREATE TABLE PROVEEDOR_PRODUCTO (
    id_proveedor INT NOT NULL, -- Parte de la PK compuesta. FK a PROVEEDORES.
    id_producto INT NOT NULL, -- Parte de la PK compuesta. FK a PRODUCTOS.
    PRIMARY KEY (id_proveedor, id_producto), -- PK compuesta: la combinación de ambos debe ser única.
    FOREIGN KEY (id_proveedor) REFERENCES PROVEEDORES(id_proveedor),
    FOREIGN KEY (id_producto) REFERENCES PRODUCTOS(id_producto)
);

-- ──────────────────────────────────────────────────────────────────────────────
-- BLOQUE DE ALTAS (INSERTs)
-- ──────────────────────────────────────────────────────────────────────────────

-- TABLA: USUARIOS --
-- Se insertan los usuarios del sistema: encargadas y ayudantes del kiosco.
INSERT INTO USUARIOS (nombre, apellido, contrasena_hash, rol) VALUES
('María',    'González',  '$2b$12$KIXabc123placeholder001', 'Encargada'),
('Laura',    'Fernández', '$2b$12$KIXabc123placeholder002', 'Encargada'),
('Sofía',    'Ramírez',   '$2b$12$KIXabc123placeholder003', 'Ayudante'),
('Valentina','López',     '$2b$12$KIXabc123placeholder004', 'Ayudante'),
('Camila',   'Martínez',  '$2b$12$KIXabc123placeholder005', 'Ayudante');

-- TABLA: ALUMNOS --
-- Se insertan alumnos de distintos cursos que pueden realizar pedidos.
INSERT INTO ALUMNOS (nombre, apellido, anio, division, pin_hash) VALUES
('Micaela',   'Arevalo', 5, 8, '$2b$12$PINabc123placeholder001'),
('Mirian',    'Anaya', 6, 7, '$2b$12$PINabc123placeholder002'),
('Madelaine', 'Tumiri', 4, 8, '$2b$12$PINabc123placeholder003'),
('Luca',      'Correa', 5, 8, '$2b$12$PINabc123placeholder004'),
('Perla',     'Salas', 5, 8, '$2b$12$PINabc123placeholder005');

-- TABLA: CATEGORIA_PRODUCTO --
-- Categorías que agrupan los productos reales del kiosco.
INSERT INTO CATEGORIA_PRODUCTO (nombre) VALUES
('Snacks'),                  -- ID: 1
('Galletitas'),              -- ID: 2 
('Alfajores y Chocolates'),  -- ID: 3 (los chocolates que contenga el kiosco)
('Dulces'),                  -- ID: 4 (dulces/golosinas que vende el kiosco)
('Bebidas'),                 -- ID: 5 (bebidas que vende el kiosco)
('Bocados y Aperitivos'),    -- ID: 6 (productos de comida que vende el kiosco para desayunar/almorzar)
('Bebidas Calientes'),       -- ID: 7 (cafe caliente grande, mediano, etc)
('Productos Extra'),         -- ID: 8 (productos físicos: yerba, vasos, pañuelos, etc.)
('Servicios');               -- ID: 9 (servicios del kiosco: calentar comida, agua, vianda, etc.)

-- TABLA: PROVEEDORES --
-- Proveedores que abastecen el kiosco con distintos productos.
INSERT INTO PROVEEDORES (nombre, telefono, dias_visita) VALUES
('Distribuidora La Continental',    '1145678901', 'Lunes, Miércoles'),  -- Snacks y frituras
('Baggio Jugos S.A.',               '1167890123', 'Martes, Jueves'),    -- Jugos Baggio
('Panadería La Espiga',             '1156781234', 'Lunes, Viernes'),    -- Productos de panadería
('Frigorífico Don Carlos',          '1134562345', 'Miércoles'),         -- Carnes y pollo
('Arcor S.A.',                      '1178903456', 'Jueves, Viernes'),   -- Golosinas marca Arcor
('Distribuidora de Bebidas El Río', '1190123456', 'Martes, Jueves'),    -- Gaseosas y aguas
('Guaymallen S.A.',                 '1123456789', 'Lunes'),             -- Alfajores Guaymallen
('Georgalos S.A.',                  '1134567890', 'Miércoles, Viernes'),-- Alfajores Georgalos
('Mondelez Argentina',              '1156789012', 'Martes');            -- Oreo, Tita y Opera

-- TABLA: PRODUCTOS --
-- Productos reales extraídos del menú del kiosco.
-- Stock y stock_minimo son valores de ejemplo para datos de prueba.
INSERT INTO PRODUCTOS (id_categoria, nombre, precio_actual, stock, stock_minimo, foto_url, disponible) VALUES
-- SNACKS (id_categoria = 1) --
(1, 'Saladix Jamón',                        3000.00, 20,  5, '/images/SaladixJamon.webp', TRUE),
(1, 'Saladix Pizza',                        3000.00, 20,  5, '/images/SaladixPizza.webp', TRUE),
(1, 'Nikitos Pizzitos',                     2800.00, 20,  5, '/images/NikitosPizzitos.webp', TRUE),
(1, 'Nikitos Tutucas',                      2800.00, 20,  5, '/images/NikitosTutucas.webp', TRUE),
(1, 'Krachitos Tradicionales',              3500.00, 15,  5, '/images/KrachitosTradicional.png', TRUE),
(1, 'Krachitos Americanas',                 3500.00, 15,  5, '/images/KrachitosAmericanos.png', TRUE),
(1, 'Quento Papas Fritas Cheddar',          2200.00, 20,  5, '/images/QuentoPapasFritasCheddar.webp', TRUE), 
(1, 'Twistos Mediano Jamón',                5500.00, 15,  5, '/images/TwistosMedianosJamon.jpg', TRUE), 
(1, 'Twistos Grande Jamón',                 6800.00, 10,  3, '/images/TwistosGrandesJamon.webp', TRUE), 
(1, 'Galletitas Kesitas',                   2000.00, 20,  5, '/images/GalletitasKesitas.webp', TRUE),
(1, 'Galletitas Rex',                       2000.00, 20,  5, '/images/GalletitasRex.webp', TRUE),
(1, 'Quento Papas Fritas Crema ',           2200.00, 15,  5, '/images/QuentoPapasFritasCrema.webp', TRUE), 
(1, 'Pipas',                                1500.00, 20,  5, '/images/Pipas.webp', TRUE),
-- GALLETITAS (id_categoria = 2) --
(2, 'Galletitas de Agua Traviata',          1400.00, 20,  5, '/images/GalletitadeAguaTraviata.webp', TRUE),
(2, 'Galletitas de Agua Traviata Rex',      1800.00, 20,  5, '/images/GalletitasdeAguaTravitaRex.webp', TRUE),
(2, 'Galletitas Cerealitas Clásica',        3000.00, 15,  5, '/images/GalletitaCerealitas.webp', TRUE),
(2, 'Galletitas 9 de Oro Normal',           2200.00, 20,  5, '/images/Galletitas9deOro.jpg', TRUE),
(2, 'Galletitas 9 de Oro Grande',           3000.00, 15,  5, '/images/GalletitasCoflerBlock.jpg', TRUE),
(2, 'Galletitas 9 de Oro Chips Chocolate',  3000.00, 15,  5, '/images/Galletitas9deOroGrande.webp', TRUE),
(2, 'Don Satur Salado',                     2200.00, 15,  5, '/images/DonSaturSalada.jpg', TRUE), 
(2, 'Don Satur Dulce',                      2200.00, 15,  5, '/images/DonSaturDulce.webp', TRUE), 
(2, 'Galletitas Orgánicas Avena y Miel',    3500.00, 10,  3, '/images/GalletitasOrganicasAvenayMiel.jpg', TRUE),
(2, 'Chocolinas Grandes',                   4000.00, 15,  5, '/images/ChocolinasGandes.webp', TRUE), 
(2, 'Chocolinas Medianas',                  2600.00, 20,  5, '/images/ChocolinasNormal.jpg', TRUE), 
(2, 'Galletitas Cofler Block',              3000.00, 15,  5, '/images/GalletitaCoflerBlock.jpg', TRUE), 
(2, 'Galletitas Toddy',                     3000.00, 15,  5, '/images/GalletitasToddy.webp', TRUE),
(2, 'Galletas Suavecitas',                  2000.00, 20,  5, '/images/GalletitasSuavecitas.webp', TRUE), 
(2, 'Galletas Mini Coronitas Frambuesa',    2000.00, 15,  5, '/images/GalletitasMiniCoronitasFrambuesa.webp', TRUE), 
(2, 'Sonrisas',                             2000.00, 20,  5, '/images/GalletitasSonrisas.webp', TRUE), 
(2, 'Merengadas',                           2000.00, 20,  5, '/images/Merengadas.webp', TRUE),
(2, 'Rumbas',                               2000.00, 20,  5, '/images/GalletitasRumbas.jpg', TRUE),
(2, 'Oreos',                                2800.00, 20,  5, '/images/Oreo.webp', TRUE),
(2, 'Opera Chiquitas',                      1600.00, 20,  5, '/images/GalletitasOpera.jpg', TRUE), 
-- ALFAJORES Y CHOCOLATES (id_categoria = 3) --
(3, 'Alfajor Guaymallen Chocolate Negro',    600.00, 30, 10, '/images/GuaymallenNegro.png', TRUE),
(3, 'Alfajor Guaymallen Chocolate Blanco',   600.00, 30, 10, '/images/GuaymallenBlanco.png', TRUE),
(3, 'Alfajor BonoBon',                      2600.00, 20,  5, '/images/AlfajorBonobon.png', TRUE),
(3, 'Alfajor MiniTorta Águila Clásico',     2600.00, 20,  5, '/images/AlfajorAguilaClasico.webp', TRUE),
(3, 'Alfajor MiniTorta Águila Brownie',     2600.00, 20,  5, '/images/AlfajorAquilaBrownie.webp', TRUE),
(3, 'Alfajor Jorgito Blanco',               1800.00, 20,  5, '/images/AlfajorJorgitoBlanco.jpg', TRUE),
(3, 'Alfajor Jorgito Negro',                1800.00, 20,  5, '/images/AlfajorJorgitoNegro.jpeg', TRUE),
(3, 'Alfajor Fantoche Triple Blanco',       1500.00, 20,  5, '/images/AlfajorFantocheBlanco.jpeg', TRUE),
(3, 'Alfajor Fantoche Triple Negro',        1500.00, 20,  5, '/images/AlfajorFantocheNegro.jpg', TRUE),
(3, 'Alfajor Jorgelin Negro',               2000.00, 20,  5, '/images/AlfajorJorgelinNegro.webp', TRUE), 
(3, 'Alfajor Jorgelin Blanco',              2000.00, 20,  5, '/images/AlfajorJorgelinBlanco.webp', TRUE),
(3, 'Alfajor Pepitos',                      2600.00, 20,  5, '/images/AlfajorPepitos.webp', TRUE),
(3, 'Alfajor Tri Shot',                     2600.00, 15,  5, '/images/AlfajorTriShot.webp', TRUE),
(3, 'Alfajor Triple de Oreo',               2600.00, 15,  5, '/images/AlfajorTripleOreo.webp', TRUE),
(3, 'Tita Chocolate',                       1400.00, 25,  5, '/images/ChocolateTita.webp', TRUE),
(3, 'Alfajor Cofler Block',                 3000.00, 15,  5, '/images/AlfajorCoflerBlock.webp', TRUE),
(3, 'Bon o Bon Chocolate',                  1000.00, 30, 10, '/images/BonoBonNegro.jpg', TRUE),
(3, 'Bon o Bon Chocolate Blanco',           1000.00, 30, 10, '/images/BonoBonBlanco.jpg', TRUE),
-- DULCES (id_categoria = 4) --
(4, 'Caramelos Sugus Confitados',          2000.00, 20,  5, '/images/SugusConfitados.jpg', TRUE), 
(4, 'Chicles Beldent Frutilla',             1300.00, 20,  5, '/images/BeldentFrutilla.webp', TRUE), 
(4, 'Chicles Beldent Menta Fuerte',         1300.00, 20,  5, '/images/BeldentMenta.webp', TRUE), 
(4, 'Chicles Beldent Menta',                1300.00, 20,  5, '/images/BeldentMentaFuerte.jpg', TRUE), 
(4, 'Chicle Bazooka Menta',                  200.00, 40, 10, '/images/BazookaMenta.jpg', TRUE), 
(4, 'Chicle Bazooka Banana',                 200.00, 40, 10, '/images/BazookaBanana.jpeg', TRUE), 
(4, 'Gomitas Mogul Normal Rollo',           1700.00, 20,  5, '/images/MogulRollo.webp', TRUE), 
(4, 'Gomitas Mogul Extreme Rollo',          1700.00, 20,  5, '/images/MogulExtremeRollo.webp', TRUE), 
(4, 'Turron de Maní Arcor',                  600.00, 30, 10, '/images/TurronManiArcor.jpg', TRUE),
(4, 'Caramelos Sugus Max Frutilla',          200.00, 40, 10, '/images/SugusMaxFrutilla.jpg', TRUE), 
(4, 'Gomitas Fizz Extreme',                 1000.00, 20,  5, '/images/FizzExtreme.webp', TRUE),
(4, 'Caramelito de Miel Arcor',              200.00, 40, 10, '/images/CarameloMielArcor.jpg', TRUE),
(4, 'Chicles Bubbalos Frutilla',             250.00, 30, 10, '/images/BubbalooFrutilla.jpg', TRUE),
(4, 'Chicles Bubbalos Tutti Frutti',         250.00, 30, 10, '/images/BubbalooTuttiFrutti.jpg', TRUE),
(4, 'Chicles Bubbalos Menta',                250.00, 30, 10, '/images/BubbalooMenta.jpg', TRUE), 
(4, 'Chicles Bubbalos Uva',                  250.00, 30, 10, '/images/BubbalooUva.jpg', TRUE), 
(4, 'Chupetin Ácido Evolution Extreme Dúo', 500.00, 30, 10, '/images/ChupetinEvolutionExtreme.png', TRUE), 
(4, 'Chupetín Pors Evolution Cereza',        500.00, 30, 10, '/images/ChupetinPopEvolutionBlueberry.png', TRUE), 
(4, 'Chupetín Pors Evolution Blueberry',     500.00, 30, 10, '/images/ChupetinPopEvolutionCereza.jpg', TRUE), 
(4, 'Caramelos Misky',                       100.00, 50, 10, '/images/CaramelosSueltosMisky.png', TRUE),
(4, 'Caramelos Palito de la Selva',          100.00, 50, 10, '/images/CarameloPalitoDeLaSelva.jpeg', TRUE),
(4, 'Gomitas Mogul Extreme Paquete 500gr',  1700.00, 20,  5, '/images/MogulExtreme.webp', TRUE),
-- BEBIDAS (id_categoria = 5) --
(5, 'Agua Con Gas Magna 500cc',             2000.00, 20,  5, '/images/AguaConGas.webp', TRUE), 
(5, 'Jugo Cepita Naranja Pequeño',          1800.00, 20,  5, '/images/CepitaNaranjaMini.webp', TRUE),
(5, 'Jugo Cepita Durazno Pequeño',          1800.00, 20,  5, '/images/CepitaDuraznoMini.webp', TRUE), 
(5, 'Paso de Los Toros 500ml',              2200.00, 15,  5, '/images/PasoDeLosToros.jpg', TRUE), 
(5, 'Pepsi 500ml',                          2200.00, 15,  5, '/images/Pepsi.jpg', TRUE), 
(5, '7up 500ml',                            2200.00, 15,  5, '/images/SevenUp.webp', TRUE),
(5, 'Coca Cola Mini',                       2000.00, 20,  5, '/images/CocaColaMini.webp', TRUE),
(5, 'Coca Cola 600ml',                      2800.00, 15,  5, '/images/CocaCola.webp', TRUE),
(5, 'Fanta 500ml',                          2800.00, 15,  5, '/images/Fanta.webp', TRUE),
(5, 'Jugo Baggio Naranja 200ml',            1500.00, 30, 10, '/images/BaggioNaranja.webp', TRUE), 
(5, 'Jugo Baggio Manzana 200ml',            1500.00, 30, 10, '/images/BaggioManzana.webp', TRUE),
(5, 'Chocolatada Shake 200ml',              1500.00, 25, 10, '/images/BaggioChocolatadaShake.png', TRUE), 
(5, 'Jugo Placer Pomelo 500ml',             1800.00, 20,  5, '/images/PlacerPomelo.jpg', TRUE),
(5, 'Jugo Placer Manzana 500ml',            1800.00, 20,  5, '/images/PlacerMnazana.jpg', TRUE),
(5, 'Jugo Placer Naranja 500ml',            1800.00, 20,  5, '/images/PlacerNaranja.jpg', TRUE),
(5, 'Agua Villavicencio 500ml',             1800.00, 20,  5, '/images/AguaVillavicencio.webp', TRUE),
-- BOCADOS Y APERITIVOS (id_categoria = 6) --
(6, 'Luneta',                                 4500.00, 15,  5, '/images/Luneta.jpg', TRUE),
(6, 'Medialuna',                              1500.00, 40, 10, '/images/Medialunas.jpg', TRUE),
(6, 'Medialuna con Jamón y Queso',            2000.00, 30, 10, '/images/MedialunasconJamonyQueso.png', TRUE),
(6, 'Tostado de Jamón y Queso',               3000.00, 15,  5, '/images/TostadasdeJamonyQueso.jpg', TRUE),
(6, 'Torta Frita',                            1000.00, 30, 10, '/images/Tortafritas.png', TRUE),
(6, 'Chipa',                                   400.00, 40, 10, '/images/Chipas.png', TRUE),
(6, 'Dona de Chocolate',                      1700.00, 20,  5, '/images/DonasdeChocolate.png', TRUE),
(6, 'Bizcochuelo de Vainilla (porción)',      1500.00, 15,  5, '/images/BizcochuelodeVainilla.png', TRUE), 
(6, 'Bizcochuelo de Chocolate (porción)',     1500.00, 15,  5, '/images/BizcochuelodeChocolate.png', TRUE),
(6, 'Pebete',                                 4000.00, 15,  5, '/images/Pebete.png', TRUE),
(6, 'Cono de Papas',                          3500.00, 15,  5, '/images/ConodePapas.webp', TRUE), 
(6, 'Hamburguesa Sola',                       5500.00, 10,  3, '/images/HamburguesaCompleta.jpg', TRUE), 
(6, 'Hamburguesa con Jamón y Queso',          6000.00, 10,  3, '/images/HamburguesaCompleta.jpg', TRUE), 
(6, 'Hamburguesa Completa',                   7000.00, 10,  3, '/images/HamburguesaCompleta.jpg', TRUE), 
(6, 'Sándwich de Milanesa Sola',              6000.00,  8,  3, '/images/SandwichMilanesa.jpg', TRUE),
(6, 'Sándwich de Milanesa con J y Q',         6500.00,  8,  3, '/images/SandwichMilanesa.jpg', TRUE),
(6, 'Sándwich de Milanesa Completo',          7500.00,  8,  3, '/images/SandwichMilanesa.jpg', TRUE),
(6, 'Patinesa Sola',                          5000.00,  8,  3, '/images/Patinesa.png', TRUE), 
(6, 'Patinesa con Jamón y Queso',             5500.00,  8,  3, '/images/Patinesa.png', TRUE), 
(6, 'Patinesa Completo',                      6000.00,  8,  3, '/images/Patinesa.png', TRUE),
(6, 'Patinesa Napolitana con Papas Fritas',   7500.00,  8,  3, '/images/Patinesa.png', TRUE), 
(6, 'Churrasquito Sola',                      6000.00,  8,  3, '/images/Churrasquito.jpg', TRUE), 
(6, 'Churrasquito con Jamón y Queso',         6500.00,  8,  3, '/images/Churrasquito.jpg', TRUE), 
(6, 'Churrasquito Completo',                  7500.00,  8,  3, '/images/Churrasquito.jpg', TRUE), 
(6, 'Tortilla',                               5500.00,  8,  3, '/images/Tortilla.jpg', TRUE), 
(6, 'Ensalada',                               6500.00,  8,  3, '/images/Ensalada.webp', TRUE), 
(6, 'Ensalada de Frutas',                     4000.00, 10,  3, '/images/EnsaladaDeFruta.webp', TRUE), 
(6, 'Empanada',                               2000.00, 25, 10, '/images/Empanadas.jpg', TRUE), 
(6, 'Porción de Pizza',                       1500.00, 20,  5, '/images/PorcionPizza.jpg', TRUE),
(6, 'Pancho',                                 2500.00, 15,  5, '/images/Pancho.jpg', TRUE),
-- BEBIDAS CALIENTES (id_categoria = 7) --
(7, 'Chocolatada Caliente',                   2500.00, 30, 10, '/images/ChocolatadaCaliente.webp', TRUE),
(7, 'Café Mediano',                           2000.00, 30, 10, '/images/CafeMediano.png', TRUE),
(7, 'Café Grande',                            2500.00, 30, 10, '/images/CafeGrande.png', TRUE), 
-- PRODUCTOS EXTRA (id_categoria = 8) --
(8, 'Yerba Amanda',                            3200.00, 10,  3, '/images/YerbaAmanda.webp', TRUE),
(8, 'Protector Mosquitos Off',                 5500.00,  5,  2, '/images/ProtectordeMosquitos.jpg', TRUE), 
(8, 'Vasos Descartables',                       100.00,100, 20, '/images/VasosDescartables.jpg', TRUE), 
(8, 'Pañuelos',                                 700.00, 20,  5, '/images/PañuelitosDescartables.jpg', TRUE), 
-- SERVICIOS (id_categoria = 9) --
(9, 'Calentar Comida',                          200.00, 999, 0, NULL, TRUE), 
(9, 'Calentar Agua',                            200.00, 999, 0, NULL, TRUE), 
(9, 'Calentar Vianda Escolar',                  300.00, 999, 0, NULL, TRUE), 
-- PRODUCTOS RESTANTES (que me faltaron) --
(1, 'Nikitos Papas Fritas', 2800.00, 20, 5, '/images/NikitosPapasFritas.webp', TRUE), 
(1, 'Quento Papas Fritas Jamón Serrano', 2200.00, 15, 5, '/images/QuentoPapasFritasJamonSerrano.png', TRUE), 
(2, 'Pitusas Chocolate',      2000.00, 20, 5, '/images/PitusasChocolate.png', TRUE), 
(2, 'Pitusas Black',          2000.00, 20, 5, '/images/PitusasBlack.png', TRUE), 
(2, 'Pitusas Frutilla',       2000.00, 20, 5, '/images/PitusasFrutilla.png', TRUE), 
(2, 'Pitusas Limón',          2000.00, 20, 5, '/images/PitusasLimon.png', TRUE), 
(2, 'Pitusas Dulce de Leche', 2000.00, 20, 5, '/images/PitusasDulcedeLeche.png', TRUE), 
(4, 'Halls Menta',            1200.00, 20, 5, '/images/HallsMenta.webp', TRUE), 
(4, 'Halls Menta Fuerte',     1200.00, 20, 5, '/images/HallsMentaFuerte.webp', TRUE), 
(4, 'Halls Naranja',          1200.00, 20, 5, '/images/HallsNaranja.webp', TRUE),
(4, 'Halls Miel con Menta',   1200.00, 20, 5, '/images/HallsMielConMenta.webp', TRUE),
(5, 'PowerAde Mountain Blast',    3000.00, 10, 3, '/images/PowerAdeFrutasTropicales.png', TRUE), 
(5, 'PowerAde Frutas Tropicales', 3000.00, 10, 3, '/images/PowerAdeMountainBlast.png', TRUE), 
(5, 'Jugo Placer Ananá 500ml', 1800.00, 20, 5, '/images/PlacerAnana.jpg', TRUE), 
(6, 'Hamburguesa con Lechuga y Tomate',          6000.00, 10, 3, '/images/HamburguesaCompleta.jpg', TRUE), 
(6, 'Sándwich de Milanesa con Lechuga y Tomate', 6500.00,  8, 3, '/images/SandwichMilanesa.jpg', TRUE), 
(6, 'Patinesa con Lechuga y Tomate',             5500.00,  8, 3, '/images/Patinesa.png', TRUE), 
(6, 'Churrasquito con Lechuga y Tomate',         6500.00,  8, 3, '/images/Churrasquito.jpg', TRUE);

-- TABLA: VENTAS --
-- Ventas realizadas en distintos días por diferentes usuarios.
INSERT INTO VENTAS (id_usuario, fecha_hora, total) VALUES
(1, '2026-05-05 09:15:00',  9000.00),   -- Venta 1
(2, '2026-05-05 10:30:00', 11000.00),   -- Venta 2
(3, '2026-05-06 09:00:00',  6000.00),   -- Venta 3
(4, '2026-05-06 11:00:00',  8600.00),   -- Venta 4
(1, '2026-05-07 09:45:00',  9800.00);   -- Venta 5

-- TABLA: DETALLE_VENTA --
-- Productos incluidos en cada venta (usando IDs reales de los productos insertados).
INSERT INTO DETALLE_VENTA (id_venta, id_producto, cantidad, precio_unitario) VALUES
(1, 91,  2, 1500.00),  -- 2 Medialunas
(1, 121, 1, 2000.00),  -- 1 Café Mediano
(1, 81,  2, 2800.00),  -- 2 Coca Cola 600ml
(2, 106, 1, 7500.00),  -- 1 Sándwich de Milanesa Completo
(2, 113, 1, 7500.00),  -- 1 Churrasquito Completo 
(3, 94,  3, 1000.00),  -- 3 Tortas Fritas
(3, 122, 1, 2500.00),  -- 1 Café Grande
(3, 34,  1,  600.00),  -- 1 Alfajor Guaymallen Chocolate Negro
(4, 99,  1, 4000.00),  -- 1 Pebete
(4, 83,  2, 1500.00),  -- 2 Jugos Baggio Naranja 200ml
(4, 130, 1, 2800.00),  -- 1 Nikitos Papas Fritas
(5, 92,  2, 2000.00),  -- 2 Medialunas con Jamón y Queso
(5, 121, 1, 2000.00),  -- 1 Café Mediano
(5, 34,  3,  600.00);  -- 3 Alfajores Guaymallen Chocolate Negro

-- TABLA: PEDIDOS --
-- Pedidos anticipados realizados por alumnos.
INSERT INTO PEDIDOS (id_alumno, horario_retiro, estado, total, fecha_creacion) VALUES
(1, '10:00:00', 'pendiente',  6500.00, '2026-05-07 08:30:00'),
(2, '10:30:00', 'listo',     11000.00, '2026-05-07 08:45:00'),
(3, '11:00:00', 'entregado',  4500.00, '2026-05-06 09:00:00'),
(4, '10:00:00', 'entregado',  8000.00, '2026-05-06 09:10:00'),
(5, '10:30:00', 'pendiente',  9800.00, '2026-05-07 09:00:00');

-- TABLA: DETALLE_PEDIDO --
-- Productos dentro de cada pedido (usando IDs reales).
INSERT INTO DETALLE_PEDIDO (id_pedido, id_producto, cantidad, precio_unitario) VALUES
(1, 109, 1, 6000.00),  -- 1 Patinesa Completa (reemplaza Patitas de Pollo c/Papas)
(1, 83,  1, 1500.00),  -- 1 Jugo Baggio Naranja 200ml
(2, 106, 1, 7500.00),  -- 1 Sándwich de Milanesa Completo (reemplaza Sándwich Vegetariano)
(2, 113, 1, 7500.00),  -- 1 Churrasquito Completo (reemplaza Salchipapa)
(3, 94,  3, 1000.00),  -- 3 Tortas Fritas
(3, 121, 1, 2000.00),  -- 1 Café Mediano
(3, 3,   1, 2800.00),  -- 1 Nikitos Pizzitos
(4, 99,  1, 4000.00),  -- 1 Pebete
(4, 122, 1, 2500.00),  -- 1 Café Grande
(4, 34,  1,  600.00),  -- 1 Alfajor Guaymallen Chocolate Negro
(5, 103, 1, 7000.00),  -- 1 Hamburguesa Completa (reemplaza Hamburguesa Completa con Huevo)
(5, 100, 1, 3500.00);  -- 1 Cono de Papas

-- TABLA: COMPRAS_PROVEEDOR --
-- Compras realizadas a proveedores para reabastecer el stock.
INSERT INTO COMPRAS_PROVEEDOR (id_proveedor, id_usuario, fecha, monto_total) VALUES
(3, 1, '2026-05-04 08:00:00', 15000.00),  -- Compra 1: Panadería La Espiga
(2, 1, '2026-05-05 08:30:00', 12500.00),  -- Compra 2: Baggio Jugos S.A.
(3, 2, '2026-05-05 09:00:00', 20000.00),  -- Compra 3: Panadería La Espiga
(4, 2, '2026-05-06 08:00:00', 35000.00),  -- Compra 4: Frigorífico Don Carlos
(1, 1, '2026-05-07 08:15:00', 18000.00);  -- Compra 5: Distribuidora La Continental

-- TABLA: DETALLE_COMPRA --
-- Productos comprados en cada compra a proveedor (usando IDs reales).
INSERT INTO DETALLE_COMPRA (id_compra, id_producto, cantidad, precio_costo) VALUES
(1, 94,  100, 500.00),   -- 100 Tortas Fritas (Panadería La Espiga)
(1, 91,  150, 750.00),   -- 150 Medialunas (Panadería La Espiga)
(1, 117,  80, 800.00),   -- 80 Empanadas (Panadería La Espiga)
(2, 83,  200, 700.00),   -- 200 Jugos Baggio Naranja (Baggio Jugos S.A.)
(3, 92,   80, 900.00),   -- 80 Medialunas con Jamón y Queso (Panadería La Espiga)
(3, 91,  100, 750.00),   -- 100 Medialunas (Panadería La Espiga)
(4, 113,  50, 2800.00),  -- 50 Churrasquito Completo (Frigorífico Don Carlos)
(4, 103,  20, 3500.00),  -- 20 Hamburguesas Completas (Frigorífico Don Carlos)
(5, 1,   100, 1200.00),  -- 100 Saladix Jamón (Distribuidora La Continental)
(5, 130, 100, 1100.00);  -- 100 Nikitos Papas Fritas (Distribuidora La Continental)

-- TABLA: PROMOCIONES --
-- Promociones activas en el kiosco, basadas en el listado real de precios.
INSERT INTO PROMOCIONES (id_usuario, nombre, precio_especial, fecha_inicio, fecha_fin) VALUES
(1, 'Café con Leche + 5 Chipá',               3800.00, '2026-05-01', '2026-05-31'), -- ID: 1
(1, 'Café con Leche + Medialuna c/ J y Q',    3800.00, '2026-05-01', '2026-05-31'), -- ID: 2
(1, 'Café con Leche + 2 Medialunas',          4500.00, '2026-05-01', '2026-05-31'), -- ID: 3
(2, 'Desayuno: Café + Tostado J y Q',         3500.00, '2026-05-01', '2026-05-31'), -- ID: 4
(2, 'Dos Empanadas + Jugo Baggio 200ml',      5000.00, '2026-05-01', '2026-05-31'), -- ID: 5
(1, 'Chocolatada + Porción de Bizcochuelo',   3500.00, '2026-05-01', '2026-05-31'), -- ID: 6
(1, 'Patitas de Pollo con Papas Fritas',      6000.00, '2026-05-01', '2026-05-31'), -- ID: 7
(1, 'Hamburguesa con Papas Fritas y Placer',  7500.00, '2026-05-01', '2026-05-31'), -- ID: 8
(2, 'Menú Estudiantil',                       5000.00, '2026-05-01', '2026-05-31'); -- ID: 9

-- TABLA: DETALLE_PROMOCION --
-- Productos que componen cada promoción (usando IDs reales).
INSERT INTO DETALLE_PROMOCION (id_promocion, id_producto, cantidad) VALUES
(1, 121,  1),  -- Promo 1 (Café + 5 Chipá): Café Mediano
(1, 95,   5),  -- Promo 1: 5 Chipas
(2, 121,  1),  -- Promo 2 (Café + Medialuna c/JyQ): Café Mediano
(2, 92,   1),  -- Promo 2: Medialuna con Jamón y Queso
(3, 121,  1),  -- Promo 3 (Café + 2 Medialunas): Café Mediano
(3, 91,   2),  -- Promo 3: 2 Medialunas
(4, 121,  1),  -- Promo 4 (Desayuno: Café + Tostado J y Q): Café Mediano
(4, 93,   1),  -- Promo 4: Tostado de Jamón y Queso
(5, 117,  2),  -- Promo 5 (2 Empanadas + Jugo Baggio): 2 Empanadas
(5, 83,   1),  -- Promo 5: Jugo Baggio Naranja 200ml
(6, 120,  1),  -- Promo 6 (Chocolatada + Bizcochuelo): Chocolatada Caliente
(6, 97,   1),  -- Promo 6: Bizcochuelo de Vainilla (porción)
(7, 109,  1),  -- Promo 7 (Patinesa Completa): producto único (reemplaza Patitas de Pollo)
(8, 103,  1),  -- Promo 8 (Hamburguesa + Papas y Placer): Hamburguesa Completa
(8, 86,   1),  -- Promo 8: Jugo Placer Pomelo 500ml
(9, 121,  1);  -- Promo 9 (Menú Estudiantil): Café Mediano (representativo del menú)

-- TABLA: GASTOS_OPERATIVOS --
-- Gastos del kiosco no relacionados con compras a proveedores.
INSERT INTO GASTOS_OPERATIVOS (id_usuario, descripcion, monto, fecha, categoria) VALUES
(1, 'Compra de papel para impresora del menú', 1500.00, '2026-05-02', 'Insumos'),
(1, 'Bolsas y servilletas descartables',       2000.00, '2026-05-03', 'Insumos'),
(2, 'Limpieza semanal del local',              3000.00, '2026-05-05', 'Limpieza'),
(1, 'Gas para la cocina (recarga)',            5000.00, '2026-05-06', 'Servicio'),
(2, 'Aderezos y condimentos varios',           4500.00, '2026-05-07', 'Insumos');

-- TABLA: HISTORIAL_PRECIOS --
-- Cambios de precio registrados en el sistema (usando IDs reales de productos).
INSERT INTO HISTORIAL_PRECIOS (id_producto, id_usuario, precio_anterior, precio_nuevo, fecha_cambio) VALUES
( 91, 1, 1200.00, 1500.00, '2026-04-01 10:00:00'),  -- Medialuna subió
( 94, 1,  800.00, 1000.00, '2026-04-01 10:05:00'),  -- Torta Frita subió
(121, 2, 1500.00, 2000.00, '2026-04-15 09:00:00'),  -- Café Mediano subió
(113, 1, 5000.00, 7500.00, '2026-04-20 11:00:00'),  -- Churrasquito Completo subió
( 81, 2, 2200.00, 2800.00, '2026-05-01 08:30:00');  -- Coca Cola 600ml subió

-- TABLA: MENU_DIA --
-- Menús del día cargados por las encargadas.
-- Cada entrada combina productos reales del kiosco con un precio especial de menú,
-- menor al que saldría comprar cada ítem por separado. La encargada carga un nuevo
-- registro cada mañana desde el sistema.
INSERT INTO MENU_DIA (id_usuario, descripcion, precio, fecha) VALUES
(1, 'Hamburguesa Completa + Cono de Papas + Jugo Placer 500ml',        9000.00, '2026-05-05'),  -- Separado: $12300
(2, 'Sándwich de Milanesa Completo + Coca Cola 600ml',                 8000.00, '2026-05-06'),  -- Separado: $10300
(1, 'Patinesa Completa con Huevo + Jugo Baggio 200ml',                 7500.00, '2026-05-07'),  -- Separado: $8500
(2, 'Churrasquito Completo + Cono de Papas con Aderezo + Agua 500ml', 11000.00, '2026-05-08'),  -- Separado: $13800
(1, 'Ensalada con Pollo + Porción de Pizza + Jugo Placer 500ml',       9500.00, '2026-05-09');  -- Separado: $10800

-- TABLA: PAGOS_PROVEEDOR --
-- Pagos realizados a proveedores por las compras.
INSERT INTO PAGOS_PROVEEDOR (id_proveedor, id_usuario, fecha, monto) VALUES
(3, 1, '2026-05-04 09:00:00', 15000.00),  -- Pago a Panadería La Espiga
(2, 1, '2026-05-05 10:00:00', 12500.00),  -- Pago a Baggio Jugos S.A.
(3, 2, '2026-05-05 11:00:00', 20000.00),  -- Pago a Panadería La Espiga
(4, 2, '2026-05-06 09:30:00', 35000.00),  -- Pago a Frigorífico Don Carlos
(1, 1, '2026-05-07 09:00:00', 18000.00);  -- Pago a Distribuidora La Continental

-- TABLA: PROVEEDOR_PRODUCTO --
-- Relación entre proveedores y los productos que suministran (M:N).
INSERT INTO PROVEEDOR_PRODUCTO (id_proveedor, id_producto) VALUES
-- Distribuidora La Continental (proveedor 1): Snacks
(1, 1),    -- Saladix Jamón
(1, 2),    -- Saladix Pizza
(1, 3),    -- Nikitos Pizzitos
(1, 130),  -- Nikitos Papas Fritas
(1, 5),    -- Krachitos Tradicionales
(1, 6),    -- Krachitos Americanas
(1, 7),    -- Quento Papas Fritas Cheddar
(1, 8),    -- Twistos Mediano Jamón
(1, 9),    -- Twistos Grande Jamón
(1, 4),    -- Nikitos Tutucas
(1, 13),   -- Pipas
-- Baggio Jugos S.A. (proveedor 2): Jugos Baggio
(2, 83),   -- Jugo Baggio Naranja 200ml
(2, 84),   -- Jugo Baggio Manzana 200ml
-- Panadería La Espiga (proveedor 3): Panadería
(3, 91),   -- Medialuna
(3, 92),   -- Medialuna con Jamón y Queso
(3, 93),   -- Tostado de Jamón y Queso
(3, 117),  -- Empanada
(3, 94),   -- Torta Frita
(3, 95),   -- Chipa
(3, 96),   -- Dona de Chocolate
(3, 97),   -- Bizcochuelo de Vainilla
(3, 98),   -- Bizcochuelo de Chocolate
(3, 118),  -- Porción de Pizza
-- Frigorífico Don Carlos (proveedor 4): Carnes
(4, 113),  -- Churrasquito Completo
(4, 103),  -- Hamburguesa Completa
(4, 109),  -- Patinesa Completa
-- Arcor S.A. (proveedor 5)
(5, 37),   -- Alfajor MiniTorta Águila Clásico
(5, 38),   -- Alfajor MiniTorta Águila Brownie
(5, 50),   -- Bon o Bon Chocolate
(5, 51),   -- Bon o Bon Chocolate Blanco
(5, 23),   -- Chocolinas Grandes
(5, 24),   -- Chocolinas Medianas
(5, 25),   -- Galletitas Cofler Block
(5, 49),   -- Alfajor Cofler Block
(5, 60),   -- Turron de Maní Arcor
(5, 63),   -- Caramelito de Miel Arcor
(5, 64),   -- Chicles Bubbalos Frutilla
(5, 65),   -- Chicles Bubbalos Tutti Frutti
(5, 66),   -- Chicles Bubbalos Menta
(5, 67),   -- Chicles Bubbalos Uva
-- Distribuidora de Bebidas El Río (proveedor 6)
(6, 74),   -- Agua Con Gas Magna 500cc
(6, 77),   -- Paso de Los Toros 500ml
(6, 78),   -- Pepsi 500ml
(6, 79),   -- 7up 500ml
(6, 80),   -- Coca Cola Mini
(6, 81),   -- Coca Cola 600ml
(6, 82),   -- Fanta 500ml
(6, 85),   -- Chocolatada Shake 200ml
(6, 86),   -- Jugo Placer Pomelo 500ml
(6, 87),   -- Jugo Placer Manzana 500ml
(6, 88),   -- Jugo Placer Naranja 500ml
(6, 89),   -- Agua Villavicencio 500ml
(6, 141),  -- PowerAde Mountain Blast
(6, 142),  -- PowerAde Frutas Tropicales
(6, 143),  -- Jugo Placer Ananá 500ml
-- Guaymallen S.A. (proveedor 7)
(7, 34),   -- Alfajor Guaymallen Chocolate Negro
(7, 35),   -- Alfajor Guaymallen Chocolate Blanco
-- Georgalos S.A. (proveedor 8)
(8, 39),   -- Alfajor Jorgito Blanco
(8, 40),   -- Alfajor Jorgito Negro
(8, 41),   -- Alfajor Fantoche Triple Blanco
(8, 42),   -- Alfajor Fantoche Triple Negro
(8, 43),   -- Alfajor Jorgelin Negro
(8, 44),   -- Alfajor Jorgelin Blanco
(8, 45),   -- Alfajor Pepitos
(8, 46),   -- Alfajor Tri Shot
-- Mondelez Argentina (proveedor 9)
(9, 32),   -- Oreos
(9, 33),   -- Opera Chiquitas
(9, 48);   -- Tita Chocolate
 
SELECT DATABASE();
SHOW DATABASES;
