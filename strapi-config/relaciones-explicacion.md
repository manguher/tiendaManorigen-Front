# 🔗 Relaciones en Strapi: Usuario ↔ Órdenes

## 📊 Diagrama de la Relación

```
USUARIO (1)  ←→  ÓRDENES (Muchas)
     │
     ├── juan@email.com
     │   ├── Orden #001
     │   ├── Orden #002  
     │   └── Orden #003
     │
     └── maria@email.com
         ├── Orden #004
         └── Orden #005
```

## ⚙️ Configuración en Strapi

### 1. Content Type "Usuario"
```json
{
  "ordenes": {
    "type": "relation",
    "relation": "oneToMany",           ← UN usuario tiene MUCHAS órdenes
    "target": "api::orden.orden",      ← Apunta al Content Type Orden
    "mappedBy": "usuario"              ← Campo en Orden que conecta de vuelta
  }
}
```

### 2. Content Type "Orden"  
```json
{
  "usuario": {
    "type": "relation", 
    "relation": "manyToOne",           ← MUCHAS órdenes pertenecen a UN usuario
    "target": "api::usuario.usuario",  ← Apunta al Content Type Usuario
    "inversedBy": "ordenes"            ← Campo en Usuario que conecta de vuelta
  }
}
```

## 🎯 Pasos en Strapi Admin

### Paso 1: Crear Content Type "Usuario"
1. Ve a **Content-Type Builder**
2. **Create new collection type** → `usuario`
3. Agrega todos los campos (email, nombre, etc.)
4. **NO agregues la relación todavía**
5. **Save**

### Paso 2: Crear Content Type "Orden"
1. **Create new collection type** → `orden`
2. Agrega todos los campos (numeroOrden, estado, etc.)
3. **NO agregues la relación todavía**
4. **Save**

### Paso 3: Agregar Relación en "Orden"
1. Edita el Content Type **"Orden"**
2. **Add another field** → **Relation**
3. Configuración:
   ```
   Field name: usuario
   Relation type: Many to One
   Target: Usuario
   Field name in "Usuario": ordenes
   ```
4. **Save**

### Paso 4: Verificar Relación en "Usuario"
1. Edita el Content Type **"Usuario"**  
2. Deberías ver automáticamente el campo **"ordenes"**
3. Si no está, agrégalo:
   ```
   Field name: ordenes
   Relation type: One to Many
   Target: Orden
   Field name in "Orden": usuario
   ```
4. **Save**

## 🔍 Cómo Funciona en las APIs

### Crear una orden vinculada a un usuario:
```javascript
// POST /api/ordenes
{
  "data": {
    "numeroOrden": "ORD-123456",
    "usuario": 1,                    ← ID del usuario
    "total": 50000,
    "estado": "pendiente"
    // ... otros campos
  }
}
```

### Obtener usuario con sus órdenes:
```javascript
// GET /api/usuarios/1?populate=ordenes
{
  "data": {
    "id": 1,
    "email": "juan@email.com",
    "nombre": "Juan",
    "ordenes": [                     ← Array de órdenes del usuario
      {
        "id": 1,
        "numeroOrden": "ORD-123456",
        "total": 50000
      },
      {
        "id": 2, 
        "numeroOrden": "ORD-123457",
        "total": 75000
      }
    ]
  }
}
```

### Obtener orden con datos del usuario:
```javascript
// GET /api/ordenes/1?populate=usuario
{
  "data": {
    "id": 1,
    "numeroOrden": "ORD-123456",
    "total": 50000,
    "usuario": {                     ← Datos del usuario propietario
      "id": 1,
      "email": "juan@email.com",
      "nombre": "Juan"
    }
  }
}
```

## ❌ Errores Comunes

### 1. "belongs to many" vs "many to one"
- ❌ **belongs to many**: Para relaciones muchos-a-muchos (ej: productos ↔ categorías)
- ✅ **many to one**: Para relaciones muchos-a-uno (ej: órdenes → usuario)

### 2. Orden de creación
- ✅ Crear primero ambos Content Types SIN relaciones
- ✅ Después agregar las relaciones
- ❌ Intentar crear la relación antes que existan ambos Content Types

### 3. Nombres de campos
- ✅ En Orden: campo `usuario` (singular)
- ✅ En Usuario: campo `ordenes` (plural)
- ❌ Usar el mismo nombre en ambos lados

## 🧪 Probar la Relación

```javascript
// 1. Crear usuario
const usuario = await fetch('/api/usuarios', {
  method: 'POST',
  body: JSON.stringify({
    data: {
      email: 'test@test.com',
      nombre: 'Test User'
    }
  })
});

// 2. Crear orden vinculada
const orden = await fetch('/api/ordenes', {
  method: 'POST', 
  body: JSON.stringify({
    data: {
      numeroOrden: 'TEST-001',
      usuario: usuario.data.id,  ← Vincular con el usuario
      total: 10000
    }
  })
});

// 3. Verificar relación
const usuarioConOrdenes = await fetch(`/api/usuarios/${usuario.data.id}?populate=ordenes`);
console.log(usuarioConOrdenes.data.ordenes); // Debe mostrar la orden creada
```
