# 🔐 Configuración de Permisos en Strapi

## ❌ **Problema Actual**
Error 403 al intentar acceder a `/usuarios` desde el frontend porque Strapi bloquea el acceso público por defecto.

## ✅ **Solución: Configurar Permisos**

### **Paso 1: Acceder al Admin Panel**
1. Asegúrate de que Strapi esté corriendo: `npm run develop`
2. Ve a: http://localhost:1337/admin
3. Inicia sesión con tu cuenta de administrador

### **Paso 2: Configurar Role "Public"**
1. Ve a **Settings** (⚙️ en la barra lateral)
2. Selecciona **Users & Permissions Plugin**
3. Haz clic en **Roles**
4. Selecciona **Public**

### **Paso 3: Configurar Permisos para "Usuario"**
En la sección **Permissions**, busca **Usuario** y marca:
- ✅ **find** - Para buscar usuarios existentes
- ✅ **create** - Para crear usuarios invitados
- ✅ **findOne** - Para obtener usuario por ID

### **Paso 4: Configurar Permisos para "Orden"**
En la sección **Permissions**, busca **Orden** y marca:
- ✅ **create** - Para crear órdenes
- ✅ **find** - Para buscar órdenes (consulta de pedidos)
- ✅ **findOne** - Para obtener orden específica

### **Paso 5: Guardar Cambios**
1. Haz clic en **Save** en la parte superior derecha
2. Los cambios se aplicarán inmediatamente

## 🔒 **Consideraciones de Seguridad**

### **Permisos Mínimos Necesarios:**
```
Usuario:
- find: Para verificar si el email ya existe
- create: Para crear usuarios invitados
- findOne: Para obtener datos del usuario

Orden:
- create: Para guardar pedidos
- find: Para consulta de pedidos por email
- findOne: Para ver detalles de pedido específico
```

### **NO Habilitar:**
- ❌ **update** en Usuario (evita modificaciones no autorizadas)
- ❌ **delete** en Usuario/Orden (evita eliminaciones accidentales)

## 🧪 **Probar la Configuración**

### **Test 1: Crear Usuario**
```bash
curl -X POST http://localhost:1337/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "email": "test@example.com",
      "nombre": "Usuario Test",
      "tipo": "invitado"
    }
  }'
```

### **Test 2: Buscar Usuario**
```bash
curl "http://localhost:1337/api/usuarios?filters[email][\$eq]=test@example.com"
```

## 🚨 **Solución de Problemas**

### **Si sigues viendo 403:**
1. Verifica que guardaste los cambios en Strapi Admin
2. Reinicia Strapi: `Ctrl+C` y luego `npm run develop`
3. Limpia caché del navegador
4. Verifica que la URL sea correcta: `/api/usuarios` (no `/usuarios`)

### **Si ves error de CORS:**
Agrega en `config/middlewares.js` de Strapi:
```javascript
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:5173'], // Tu frontend URL
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      headers: ['Content-Type', 'Authorization'],
    },
  },
  // ... otros middlewares
];
```

## 📝 **Próximos Pasos**
1. Configurar permisos según esta guía
2. Probar el checkout desde el frontend
3. Verificar que se crean usuarios y órdenes correctamente
4. Implementar políticas personalizadas si necesitas más control
