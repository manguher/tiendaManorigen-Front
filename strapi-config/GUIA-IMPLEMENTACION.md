# Guía de Implementación - Content Types para Tienda

## 📋 Pasos para crear los Content Types en Strapi

### 1. Crear Content Type "Usuario"

1. Ve a **Content-Type Builder** en tu panel de Strapi
2. Haz clic en **"Create new collection type"**
3. Nombre: `usuario` (singular), `usuarios` (plural)
4. Agrega los siguientes campos:

#### Campos del Usuario:
```
email (Email)
├── Required: ✅
├── Unique: ✅
└── Private: ❌

nombre (Text)
├── Required: ✅
├── Max length: 100
└── Short text

apellido (Text)
├── Required: ❌
├── Max length: 100
└── Short text

telefono (Text)
├── Required: ❌
├── Max length: 20
└── Short text

tipo (Enumeration)
├── Required: ✅
├── Values: ["registrado", "invitado"]
└── Default: "invitado"

fechaRegistro (Date)
├── Required: ✅
├── Type: datetime
└── Default: now

activo (Boolean)
├── Required: ✅
└── Default: true

direcciones (JSON)
├── Required: ❌
└── Para guardar múltiples direcciones

ultimoAcceso (Date)
├── Required: ❌
└── Type: datetime

metadata (JSON)
├── Required: ❌
└── Datos adicionales del usuario
```

### 2. Crear Content Type "Orden"

1. En **Content-Type Builder**, crea otra collection
2. Nombre: `orden` (singular), `ordenes` (plural)
3. Agrega los siguientes campos:

#### Campos de la Orden:
```
numeroOrden (Text)
├── Required: ✅
├── Unique: ✅
├── Max length: 20
└── Short text

estado (Enumeration)
├── Required: ✅
├── Values: ["pendiente", "pagado", "procesando", "enviado", "entregado", "cancelado", "reembolsado"]
└── Default: "pendiente"

metodoPago (Enumeration)
├── Required: ✅
├── Values: ["credit_card", "paypal", "transfer", "cash_on_delivery"]
└── No default

subtotal (Number)
├── Required: ✅
├── Type: decimal
├── Min: 0
└── Format: decimal

iva (Number)
├── Required: ✅
├── Type: decimal
├── Min: 0
└── Format: decimal

costoEnvio (Number)
├── Required: ✅
├── Type: decimal
├── Min: 0
└── Default: 0

descuento (Number)
├── Required: ❌
├── Type: decimal
├── Min: 0
└── Default: 0

total (Number)
├── Required: ✅
├── Type: decimal
├── Min: 0
└── Format: decimal

fechaOrden (Date)
├── Required: ✅
├── Type: datetime
└── Default: now

fechaPago (Date)
├── Required: ❌
└── Type: datetime

fechaEnvio (Date)
├── Required: ❌
└── Type: datetime

fechaEntrega (Date)
├── Required: ❌
└── Type: datetime

direccionEnvio (JSON)
├── Required: ✅
└── Estructura: { nombreCompleto, direccion, ciudad, codigoPostal, telefono }

items (JSON)
├── Required: ✅
└── Array de productos: [{ producto, cantidad, precioUnitario, subtotal }]

datosPago (JSON)
├── Required: ❌
└── Información del pago: { transactionId, paymentMethod, amount, currency }

tracking (Text)
├── Required: ❌
├── Max length: 100
└── Número de seguimiento

notas (Rich Text)
├── Required: ❌
└── Notas adicionales de la orden

metadata (JSON)
├── Required: ❌
└── Datos adicionales: { tipoUsuario, ip, userAgent }

cuponDescuento (Text)
├── Required: ❌
├── Max length: 50
└── Código de cupón aplicado
```

### 3. Crear Relación entre Usuario y Orden

1. En el Content Type **"orden"**, agrega un campo de relación:
```
usuario (Relation)
├── Relation type: Many to One
├── Target: Usuario
└── Field name in "Usuario": ordenes
```

### 4. Configurar Permisos

#### Para usuarios públicos (Public):
```
Usuario:
├── find: ✅ (con filtros)
├── findOne: ✅
├── create: ✅
└── update: ✅ (solo propios registros)

Orden:
├── find: ✅ (con filtros)
├── findOne: ✅
├── create: ✅
└── update: ✅ (solo cambios de estado)
```

### 5. Estructura de Datos de Ejemplo

#### Usuario:
```json
{
  "email": "juan@email.com",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "+56912345678",
  "tipo": "invitado",
  "fechaRegistro": "2024-01-15T10:30:00.000Z",
  "activo": true,
  "direcciones": [
    {
      "tipo": "principal",
      "direccion": "Av. Principal 123",
      "ciudad": "Santiago",
      "codigoPostal": "8320000"
    }
  ],
  "metadata": {
    "fuente": "checkout_invitado",
    "dispositivo": "desktop"
  }
}
```

#### Orden:
```json
{
  "numeroOrden": "ORD-123456",
  "usuario": 1,
  "estado": "pagado",
  "metodoPago": "credit_card",
  "subtotal": 42000,
  "iva": 7980,
  "costoEnvio": 3000,
  "descuento": 0,
  "total": 52980,
  "fechaOrden": "2024-01-15T14:30:00.000Z",
  "fechaPago": "2024-01-15T14:32:00.000Z",
  "direccionEnvio": {
    "nombreCompleto": "Juan Pérez",
    "direccion": "Av. Principal 123",
    "ciudad": "Santiago",
    "codigoPostal": "8320000",
    "telefono": "+56912345678"
  },
  "items": [
    {
      "producto": 1,
      "cantidad": 2,
      "precioUnitario": 21000,
      "subtotal": 42000
    }
  ],
  "datosPago": {
    "transactionId": "pi_1234567890",
    "paymentMethod": "stripe",
    "amount": 52980,
    "currency": "CLP"
  },
  "metadata": {
    "tipoUsuario": "invitado",
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0..."
  }
}
```

## 🔧 Configuraciones Adicionales

### Variables de Entorno (.env)
```
# Strapi
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=tu_token_aqui

# Frontend
VITE_APP_STRAPI_URL=http://localhost:1337/api
```

### Filtros de Seguridad
- Los usuarios solo pueden ver sus propias órdenes
- Validar email en consultas de órdenes
- Limitar campos sensibles en respuestas públicas

## 🚀 Próximos Pasos

1. Crear los Content Types siguiendo esta guía
2. Configurar permisos apropiados
3. Probar las APIs desde el frontend
4. Implementar validaciones adicionales si es necesario

## 📞 Soporte

Si tienes problemas con la implementación, revisa:
- Logs de Strapi para errores de API
- Configuración de CORS
- Permisos de Content Types
- Estructura de las relaciones
