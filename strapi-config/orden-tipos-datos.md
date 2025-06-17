# 📊 Tipos de Datos para Content Type "Orden"

## 🔢 **Campos Principales**

### **numeroOrden**
```
Tipo: Text (Short text)
├── Required: ✅ true
├── Unique: ✅ true
├── Max length: 20
├── Min length: 5
└── Regex pattern: ^ORD-[0-9]{6}$
```

### **usuario** (Relación)
```
Tipo: Relation
├── Relation type: Many to One
├── Target: Usuario
├── Required: ✅ true
└── Field name in "Usuario": ordenes
```

## 📋 **Estados y Métodos**

### **estado**
```
Tipo: Enumeration
├── Required: ✅ true
├── Default: "pendiente"
└── Values:
    ├── pendiente
    ├── pagado
    ├── procesando
    ├── enviado
    ├── entregado
    ├── cancelado
    └── reembolsado
```

### **metodoPago**
```
Tipo: Enumeration
├── Required: ✅ true
├── No default
└── Values:
    ├── credit_card
    ├── paypal
    ├── transfer
    └── cash_on_delivery
```

## 💰 **Campos Monetarios**

### **subtotal**
```
Tipo: Number
├── Required: ✅ true
├── Number format: decimal
├── Min: 0
└── Decimal places: 2
```

### **iva**
```
Tipo: Number
├── Required: ✅ true
├── Number format: decimal
├── Min: 0
└── Decimal places: 2
```

### **costoEnvio**
```
Tipo: Number
├── Required: ✅ true
├── Number format: decimal
├── Min: 0
├── Default: 0
└── Decimal places: 2
```

### **descuento**
```
Tipo: Number
├── Required: ❌ false
├── Number format: decimal
├── Min: 0
├── Default: 0
└── Decimal places: 2
```

### **total**
```
Tipo: Number
├── Required: ✅ true
├── Number format: decimal
├── Min: 0
└── Decimal places: 2
```

## 📅 **Campos de Fecha**

### **fechaOrden**
```
Tipo: Date
├── Required: ✅ true
├── Type: datetime
└── Default: now
```

### **fechaPago**
```
Tipo: Date
├── Required: ❌ false
├── Type: datetime
└── No default
```

### **fechaEnvio**
```
Tipo: Date
├── Required: ❌ false
├── Type: datetime
└── No default
```

### **fechaEntrega**
```
Tipo: Date
├── Required: ❌ false
├── Type: datetime
└── No default
```

## 📦 **Campos JSON**

### **direccionEnvio**
```
Tipo: JSON
├── Required: ✅ true
└── Estructura esperada:
    {
      "nombreCompleto": "string",
      "direccion": "string", 
      "ciudad": "string",
      "region": "string",
      "codigoPostal": "string",
      "telefono": "string",
      "instrucciones": "string"
    }
```

### **items**
```
Tipo: JSON
├── Required: ✅ true
└── Estructura esperada:
    [
      {
        "producto": number,
        "nombre": "string",
        "cantidad": number,
        "precioUnitario": number,
        "subtotal": number,
        "imagen": "string"
      }
    ]
```

### **datosPago**
```
Tipo: JSON
├── Required: ❌ false
└── Estructura esperada:
    {
      "transactionId": "string",
      "paymentMethod": "string",
      "amount": number,
      "currency": "string",
      "status": "string",
      "gateway": "string"
    }
```

### **metadata**
```
Tipo: JSON
├── Required: ❌ false
└── Estructura esperada:
    {
      "tipoUsuario": "string",
      "ip": "string",
      "userAgent": "string",
      "dispositivo": "string",
      "fuente": "string"
    }
```

## 📝 **Campos Adicionales**

### **tracking**
```
Tipo: Text (Short text)
├── Required: ❌ false
├── Max length: 100
└── Placeholder: "Número de seguimiento"
```

### **notas**
```
Tipo: Text (Long text)
├── Required: ❌ false
├── Max length: 1000
└── Placeholder: "Notas adicionales sobre la orden"
```

### **cuponDescuento**
```
Tipo: Text (Short text)
├── Required: ❌ false
├── Max length: 50
└── Placeholder: "Código de cupón aplicado"
```

## 🎯 **Configuración JSON Completa**

```json
{
  "numeroOrden": {
    "type": "string",
    "required": true,
    "unique": true,
    "maxLength": 20,
    "minLength": 5,
    "regex": "^ORD-[0-9]{6}$"
  },
  "usuario": {
    "type": "relation",
    "relation": "manyToOne",
    "target": "api::usuario.usuario",
    "inversedBy": "ordenes",
    "required": true
  },
  "estado": {
    "type": "enumeration",
    "enum": ["pendiente", "pagado", "procesando", "enviado", "entregado", "cancelado", "reembolsado"],
    "default": "pendiente",
    "required": true
  },
  "metodoPago": {
    "type": "enumeration",
    "enum": ["credit_card", "paypal", "transfer", "cash_on_delivery"],
    "required": true
  },
  "subtotal": {
    "type": "decimal",
    "required": true,
    "min": 0
  },
  "iva": {
    "type": "decimal", 
    "required": true,
    "min": 0
  },
  "costoEnvio": {
    "type": "decimal",
    "required": true,
    "min": 0,
    "default": 0
  },
  "descuento": {
    "type": "decimal",
    "required": false,
    "min": 0,
    "default": 0
  },
  "total": {
    "type": "decimal",
    "required": true,
    "min": 0
  },
  "fechaOrden": {
    "type": "datetime",
    "required": true
  },
  "fechaPago": {
    "type": "datetime",
    "required": false
  },
  "fechaEnvio": {
    "type": "datetime", 
    "required": false
  },
  "fechaEntrega": {
    "type": "datetime",
    "required": false
  },
  "direccionEnvio": {
    "type": "json",
    "required": true
  },
  "items": {
    "type": "json",
    "required": true
  },
  "datosPago": {
    "type": "json",
    "required": false
  },
  "tracking": {
    "type": "string",
    "required": false,
    "maxLength": 100
  },
  "notas": {
    "type": "text",
    "required": false
  },
  "metadata": {
    "type": "json",
    "required": false
  },
  "cuponDescuento": {
    "type": "string",
    "required": false,
    "maxLength": 50
  }
}
```

## 🔍 **Validaciones Recomendadas**

### **En el Backend (Strapi):**
- Validar que `total = subtotal + iva + costoEnvio - descuento`
- Verificar que `fechaPago >= fechaOrden`
- Validar que `fechaEnvio >= fechaPago`
- Comprobar formato de email en `direccionEnvio`

### **En el Frontend:**
- Validar campos requeridos antes de enviar
- Formatear números con 2 decimales
- Validar estructura de JSON antes de guardar
