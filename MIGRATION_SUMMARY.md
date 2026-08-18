# Resumen de Migración de APIs - Frontend Vue.js

## 📋 Resumen Ejecutivo

Se ha completado exitosamente la migración del frontend Vue.js para trabajar con la nueva arquitectura de backend dual:

- **Strapi (localhost:1337)**: Catálogo de productos únicamente
- **Backend Node.js/Express (localhost:3000)**: Pedidos, direcciones y usuarios

---

## 🗂️ Archivos Modificados

### 1. **Variables de Entorno**

#### `/.env.example` ✅
**Cambios:**
- Agregada variable `VITE_APP_BACKEND_API_URL=http://localhost:3000`
- Actualizada documentación para distinguir entre Strapi (productos) y Backend (pedidos/usuarios/direcciones)

**Acción requerida:** 
```bash
# Actualiza tu archivo .env con:
VITE_APP_BACKEND_API_URL=http://localhost:3000
```

---

### 2. **Nuevos Archivos Creados**

#### `/src/api/backendClient.js` ✅ NUEVO
**Propósito:** Cliente Axios dedicado para el backend Node.js/Express

**Características:**
- Base URL configurable desde variables de entorno
- Interceptores de error para logging
- Headers JSON por defecto

---

### 3. **Archivos API Migrados**

#### `/src/api/index.js` ✅
**Cambios:**
- Renombrado internamente a `strapiClient` para claridad
- Ahora usa `VITE_APP_STRAPI_BASE_URL` desde variables de entorno
- **USO:** Solo para productos (Strapi)

---

#### `/src/api/usuario.js` ✅
**Cambios principales:**
- Migrado de Strapi a backend Node.js
- Eliminada estructura anidada de Strapi (`data.attributes`)
- Actualizado a respuestas planas del nuevo backend

**Estructura de datos anterior (Strapi):**
```javascript
{
  data: {
    email: "...",
    nombre: "...",
    tipo: "invitado"
  }
}
```

**Estructura nueva (Backend Node.js):**
```javascript
{
  id: 1,
  email: "...",
  nombre: "...",
  telefono: "...",
  password: null
}
```

**Endpoints actualizados:**
- `GET /usuarios?email={email}` (antes: `/usuarios?filters[email][$eq]={email}`)
- `POST /usuarios` (estructura simplificada)
- `PUT /usuarios/{id}` (estructura simplificada)

---

#### `/src/api/direccion.js` ✅
**Cambios principales:**
- Migrado de Strapi a backend Node.js
- Agregados nuevos campos requeridos por el backend

**Nuevos campos:**
- `nombreDestinatario` (antes no existía)
- `telefonoContacto` (antes no existía)
- `esPrincipal` (boolean, default: false)

**Mapeo de compatibilidad:**
```javascript
nombreDestinatario: direccionData.nombreDestinatario || direccionData.nombreCompleto
telefonoContacto: direccionData.telefonoContacto || direccionData.telefono
```

**Endpoints actualizados:**
- `GET /direcciones?usuarioId={id}` (antes: `/direccions?filters[usuario][id][$eq]={id}`)
- `POST /direcciones` (estructura nueva)
- `PUT /direcciones/{id}` (estructura nueva)

---

#### `/src/api/orden.js` ✅
**Cambios principales:**
- Migrado de Strapi a backend Node.js
- Estructura de items completamente rediseñada para incluir datos de productos de Strapi

**Estructura anterior de items:**
```javascript
items: [{
  producto: item.id,
  cantidad: item.quantity,
  precioUnitario: item.precio,
  subtotal: item.precio * item.quantity
}]
```

**Estructura nueva de items:**
```javascript
items: [{
  productoIdStrapi: item.id,
  productoNombre: item.nombre,
  productoDescripcion: item.descripcion || '',
  productoImagenUrl: item.images[0]?.url || '',
  precioUnitario: parseFloat(item.precio),
  cantidad: item.quantity,
  subtotal: parseFloat(item.precio) * item.quantity
}]
```

**Estructura de direccionEnvio actualizada:**
```javascript
direccionEnvio: {
  nombreCompleto: "...",
  calle: "...",
  ciudad: "...",
  comuna: "...",
  region: "...",
  codigoPostal: "...",
  telefono: "...",
  referencia: ""
}
```

**Campos principales del pedido:**
- `usuarioId` (antes: `usuario` como relación)
- `subtotal`, `iva`, `costoEnvio`, `total`
- `metodoPago` (valores: "Transbank", "Transferencia", "Efectivo")
- `notas` (nuevo campo)
- `items[]` (estructura expandida)
- `direccionEnvio` (objeto completo)

**Endpoints actualizados:**
- `GET /pedidos?usuarioId={id}` (antes: filtros Strapi)
- `GET /pedidos?email={email}` (antes: filtros Strapi)
- `POST /pedidos` (estructura nueva)
- `PUT /pedidos/{id}` (estructura simplificada)

---

#### `/src/api/checkout.js` ✅
**Cambios principales:**
- Adaptado para trabajar con respuestas planas del nuevo backend
- Eliminadas referencias a `data.attributes` de Strapi
- Actualizado mapeo de métodos de pago

**Mapeo de métodos de pago:**
```javascript
{
  'tarjeta': 'Transbank',
  'transbank': 'Transbank',
  'transferencia': 'Transferencia',
  'efectivo': 'Efectivo'
}
```

**Flujo de checkout actualizado:**
1. Crear/encontrar usuario → respuesta plana
2. Crear dirección → respuesta plana con nuevos campos
3. Crear orden → respuesta plana con estructura completa

---

#### `/src/api/producto.js` ✅
**Sin cambios funcionales** - Sigue usando Strapi

**Confirmación:**
- Mantiene estructura de Strapi (`data.attributes`)
- Endpoints sin cambios
- Integración con store de productos intacta

---

### 4. **Componentes y Vistas Actualizados**

#### `/src/views/Checkout.vue` ✅
**Cambios principales:**

1. **Nuevos campos en shippingInfo:**
```javascript
shippingInfo: {
  fullName: '',
  address: '',
  city: '',
  comuna: '',      // NUEVO
  region: '',      // NUEVO
  postalCode: '',
  phone: '',
  referencia: ''   // NUEVO
}
```

2. **Nuevo campo orderNotes:**
```javascript
orderNotes: '' // Para notas del pedido
```

3. **Formulario actualizado:**
- Agregado campo "Comuna" (requerido)
- Agregado campo "Región" (requerido)
- Agregado campo "Referencia" (opcional)

4. **Resumen de pedido actualizado:**
- Muestra comuna y región
- Muestra referencia si existe

5. **Datos enviados al checkout:**
```javascript
checkoutData = {
  email: this.guestEmail,
  orderNumber: this.orderNumber.toString(),
  paymentMethod: this.paymentMethod,
  subtotal: this.subtotal,
  iva: this.iva,
  shippingCost: this.shippingCost,
  total: this.total,
  notas: this.orderNotes,        // NUEVO
  shippingInfo: this.shippingInfo, // Con nuevos campos
  items: this.cartItems,
  userType: 'guest',
  ip: await this.getUserIP(),
  userAgent: navigator.userAgent
}
```

---

#### `/src/composables/useGuestOrders.js` ✅
**Cambios:**
- Actualizado `sortedOrders` para trabajar con respuestas planas
- Cambiado de `a.attributes.fechaOrden` a `a.createdAt || a.fechaCreacion`

---

### 5. **Stores (Sin cambios)**

#### `/src/stores/producto.js` ✅
- Sin cambios - sigue usando Strapi correctamente
- Mapeo de productos funciona con estructura Strapi

#### `/src/stores/carrito.js` ✅
- Sin cambios necesarios
- Compatible con la estructura actual

---

## 🔄 Comparación de Estructuras de Datos

### Usuarios

| Campo | Strapi (Anterior) | Backend Node.js (Nuevo) |
|-------|-------------------|-------------------------|
| Estructura | `data.attributes.email` | `email` |
| Email | ✅ | ✅ |
| Nombre | ✅ | ✅ |
| Teléfono | ✅ | ✅ |
| Password | - | ✅ (null para invitados) |
| Tipo | ✅ | - |

### Direcciones

| Campo | Strapi (Anterior) | Backend Node.js (Nuevo) |
|-------|-------------------|-------------------------|
| Estructura | `data.attributes.*` | `*` (plano) |
| Calle | ✅ | ✅ |
| Ciudad | ✅ | ✅ |
| Comuna | ✅ | ✅ |
| Región | ✅ | ✅ |
| Código Postal | ✅ | ✅ |
| Referencia | ✅ | ✅ |
| Nombre Destinatario | ❌ | ✅ **NUEVO** |
| Teléfono Contacto | ❌ | ✅ **NUEVO** |
| Es Principal | ❌ | ✅ **NUEVO** |

### Pedidos

| Campo | Strapi (Anterior) | Backend Node.js (Nuevo) |
|-------|-------------------|-------------------------|
| Estructura | `data.attributes.*` | `*` (plano) |
| Usuario | Relación ID | `usuarioId` |
| Items | Relación a productos | Objeto completo con datos de Strapi |
| Dirección Envío | Objeto anidado | Objeto completo expandido |
| Método Pago | Enum limitado | String ("Transbank", etc.) |
| Notas | ❌ | ✅ **NUEVO** |

---

## 🚀 Pasos para Completar la Migración

### 1. Actualizar archivo .env
```bash
# Copia .env.example a .env si no existe
cp .env.example .env

# Asegúrate de tener estas variables:
VITE_APP_STRAPI_BASE_URL=http://localhost:1337
VITE_APP_BACKEND_API_URL=http://localhost:3000
```

### 2. Verificar que ambos servidores estén corriendo

**Strapi (Productos):**
```bash
# Debe estar corriendo en http://localhost:1337
# Endpoint de prueba: http://localhost:1337/api/productos
```

**Backend Node.js (Pedidos/Usuarios/Direcciones):**
```bash
# Debe estar corriendo en http://localhost:3000
# Endpoints de prueba:
# - http://localhost:3000/usuarios
# - http://localhost:3000/direcciones
# - http://localhost:3000/pedidos
```

### 3. Instalar dependencias (si es necesario)
```bash
npm install
```

### 4. Iniciar el frontend
```bash
npm run dev
```

---

## ✅ Checklist de Verificación

### Funcionalidades a Probar:

- [ ] **Catálogo de productos** - Debe cargar desde Strapi
- [ ] **Agregar productos al carrito** - Funcionalidad local
- [ ] **Formulario de checkout** - Nuevos campos (comuna, región, referencia)
- [ ] **Crear usuario invitado** - Debe usar backend Node.js
- [ ] **Crear dirección** - Debe usar backend Node.js con nuevos campos
- [ ] **Crear pedido** - Debe usar backend Node.js con estructura completa
- [ ] **Consultar pedidos por email** - Debe usar backend Node.js
- [ ] **Visualizar detalles de pedido** - Debe mostrar datos correctamente

---

## 🐛 Posibles Problemas y Soluciones

### Problema 1: Error de CORS
**Síntoma:** Errores de CORS al hacer peticiones al backend

**Solución:**
```javascript
// En tu backend Node.js, asegúrate de tener CORS configurado:
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173' // Puerto de Vite
}));
```

### Problema 2: Campos faltantes en direcciones
**Síntoma:** Error al crear direcciones

**Solución:** Verifica que el formulario de checkout incluya:
- `comuna` (requerido)
- `region` (requerido)
- `nombreDestinatario` (se mapea automáticamente desde `fullName`)
- `telefonoContacto` (se mapea automáticamente desde `phone`)

### Problema 3: Items de pedido sin datos de producto
**Síntoma:** Pedidos creados sin información de productos

**Solución:** Asegúrate de que los items del carrito tengan:
```javascript
{
  id: number,           // ID de Strapi
  nombre: string,
  descripcion: string,
  precio: number,
  images: [{url: string}],
  quantity: number
}
```

### Problema 4: Variables de entorno no cargadas
**Síntoma:** URLs hardcodeadas en lugar de variables

**Solución:**
```bash
# Reinicia el servidor de desarrollo después de cambiar .env
npm run dev
```

---

## 📊 Endpoints por Servicio

### Strapi (localhost:1337)
```
GET    /api/productos              - Listar productos
GET    /api/productos/:id          - Obtener producto
GET    /api/productos?populate=*   - Productos con relaciones
```

### Backend Node.js (localhost:3000)
```
# Usuarios
GET    /usuarios?email={email}     - Buscar por email
GET    /usuarios/:id               - Obtener por ID
POST   /usuarios                   - Crear usuario
PUT    /usuarios/:id               - Actualizar usuario

# Direcciones
GET    /direcciones?usuarioId={id} - Listar por usuario
GET    /direcciones/:id            - Obtener por ID
POST   /direcciones                - Crear dirección
PUT    /direcciones/:id            - Actualizar dirección
DELETE /direcciones/:id            - Eliminar dirección

# Pedidos
GET    /pedidos?usuarioId={id}     - Listar por usuario
GET    /pedidos?email={email}      - Listar por email
GET    /pedidos?numeroOrden={num}  - Buscar por número
GET    /pedidos/:id                - Obtener por ID
POST   /pedidos                    - Crear pedido
PUT    /pedidos/:id                - Actualizar pedido
```

---

## 📝 Notas Importantes

1. **Productos siguen en Strapi**: No se migró la gestión de productos. Strapi sigue siendo la fuente de verdad para el catálogo.

2. **Estructura de respuestas**: El backend Node.js devuelve objetos planos, no la estructura anidada de Strapi (`data.attributes`).

3. **IDs de productos**: Los pedidos guardan `productoIdStrapi` que referencia al ID del producto en Strapi, pero también guardan una copia de los datos del producto para histórico.

4. **Compatibilidad hacia atrás**: Se agregaron mapeos de compatibilidad en `direccion.js` para campos como `nombreCompleto` → `nombreDestinatario`.

5. **Métodos de pago**: Se normalizaron a valores específicos ("Transbank", "Transferencia", "Efectivo").

---

## 🎯 Próximos Pasos Recomendados

1. **Implementar autenticación completa** - Actualmente solo soporta usuarios invitados
2. **Agregar validación de stock** - Verificar disponibilidad antes de crear pedidos
3. **Implementar Transbank** - Completar integración de pagos
4. **Agregar gestión de estados de pedido** - Panel de seguimiento
5. **Implementar notificaciones por email** - Confirmaciones de pedido
6. **Agregar tests unitarios** - Para los nuevos servicios API

---

## 📞 Soporte

Si encuentras problemas durante la migración:

1. Verifica que ambos backends estén corriendo
2. Revisa la consola del navegador para errores de red
3. Verifica los logs del backend Node.js
4. Confirma que las variables de entorno estén correctamente configuradas

---

**Fecha de migración:** 22 de febrero de 2026  
**Versión del documento:** 1.0  
**Estado:** ✅ Migración completada
