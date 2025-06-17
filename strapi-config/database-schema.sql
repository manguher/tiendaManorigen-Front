-- Script SQL para crear las tablas de Usuario y Orden
-- (Opcional: Strapi crea las tablas automáticamente, pero esto es para referencia)

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    telefono VARCHAR(20),
    tipo VARCHAR(20) DEFAULT 'invitado' CHECK (tipo IN ('registrado', 'invitado')),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    direcciones JSON,
    ultimo_acceso TIMESTAMP,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Órdenes
CREATE TABLE ordenes (
    id SERIAL PRIMARY KEY,
    numero_orden VARCHAR(20) UNIQUE NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'procesando', 'enviado', 'entregado', 'cancelado', 'reembolsado')),
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('credit_card', 'paypal', 'transfer', 'cash_on_delivery')),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    iva DECIMAL(10,2) NOT NULL CHECK (iva >= 0),
    costo_envio DECIMAL(10,2) DEFAULT 0 CHECK (costo_envio >= 0),
    descuento DECIMAL(10,2) DEFAULT 0 CHECK (descuento >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    fecha_orden TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_pago TIMESTAMP,
    fecha_envio TIMESTAMP,
    fecha_entrega TIMESTAMP,
    direccion_envio JSON NOT NULL,
    items JSON NOT NULL,
    datos_pago JSON,
    tracking VARCHAR(100),
    notas TEXT,
    metadata JSON,
    cupon_descuento VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX idx_ordenes_numero ON ordenes(numero_orden);
CREATE INDEX idx_ordenes_usuario ON ordenes(usuario_id);
CREATE INDEX idx_ordenes_estado ON ordenes(estado);
CREATE INDEX idx_ordenes_fecha ON ordenes(fecha_orden);

-- Ejemplo de inserción de usuario invitado
INSERT INTO usuarios (email, nombre, telefono, tipo) 
VALUES ('juan@email.com', 'Juan Pérez', '+56912345678', 'invitado');

-- Ejemplo de inserción de orden
INSERT INTO ordenes (
    numero_orden, 
    usuario_id, 
    metodo_pago, 
    subtotal, 
    iva, 
    costo_envio, 
    total,
    direccion_envio,
    items
) VALUES (
    'ORD-123456',
    1,
    'credit_card',
    42000.00,
    7980.00,
    3000.00,
    52980.00,
    '{"nombreCompleto": "Juan Pérez", "direccion": "Av. Principal 123", "ciudad": "Santiago", "codigoPostal": "8320000", "telefono": "+56912345678"}',
    '[{"producto": 1, "cantidad": 2, "precioUnitario": 21000, "subtotal": 42000}]'
);
