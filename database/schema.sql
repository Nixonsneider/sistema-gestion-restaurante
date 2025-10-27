-- Conectarse a la base de datos
\c bd_smartrest;

-- Solo para desarrollo, no en producción
DROP TABLE IF EXISTS pedido, producto, mesa, usuario CASCADE;

-- Tabla usuario
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('mesero', 'administrativo')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla mesa
CREATE TABLE mesa (
    id_mesa SERIAL PRIMARY KEY,
    numero_mesa INT NOT NULL,
    capacidad INT NOT NULL,
    estado VARCHAR(20) DEFAULT 'disponible'
);

-- Tabla producto
CREATE TABLE producto (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50),
    precio DECIMAL(10,2) NOT NULL,
    disponible BOOLEAN DEFAULT TRUE
);

-- Tabla pedido
CREATE TABLE pedido (
    id_pedido SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuario(id_usuario),
    id_mesa INT REFERENCES mesa(id_mesa),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'en curso',
    total DECIMAL(10,2)
);

-- Tabla detalle_pedido
CREATE TABLE detalle_pedido (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL REFERENCES pedido(id_pedido) ON DELETE CASCADE,
    id_producto INT NOT NULL REFERENCES producto(id_producto),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED
);

-- Tabla reservacion
CREATE TABLE reservacion (
    id_reservacion SERIAL PRIMARY KEY,
    id_mesa INT NOT NULL REFERENCES mesa(id_mesa),
    id_usuario INT NOT NULL REFERENCES usuario(id_usuario),
    nombre_cliente VARCHAR(100) NOT NULL,
    fecha_reservacion DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'cancelada', 'finalizada'))
);

-- Tabla factura
CREATE TABLE factura (
    id_factura SERIAL PRIMARY KEY,
    id_pedido INT UNIQUE NOT NULL REFERENCES pedido(id_pedido),
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metodo_pago VARCHAR(30) CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia')),
    total DECIMAL(10,2) NOT NULL
);


