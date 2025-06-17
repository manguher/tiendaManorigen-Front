// Configuración de permisos para los Content Types
// Este archivo es para referencia de cómo configurar los permisos en Strapi

const permisosPublicos = {
  // Permisos para Content Type "usuario"
  usuario: {
    find: {
      enabled: true,
      policy: '', // Política personalizada para filtrar por email propio
    },
    findOne: {
      enabled: true,
      policy: '', // Solo puede ver su propio usuario
    },
    create: {
      enabled: true,
      policy: '', // Cualquiera puede crear un usuario invitado
    },
    update: {
      enabled: true,
      policy: '', // Solo puede actualizar su propio usuario
    },
    delete: {
      enabled: false, // No permitir eliminación pública
    }
  },

  // Permisos para Content Type "orden"
  orden: {
    find: {
      enabled: true,
      policy: '', // Filtrar por usuario o email
    },
    findOne: {
      enabled: true,
      policy: '', // Solo puede ver sus propias órdenes
    },
    create: {
      enabled: true,
      policy: '', // Crear órdenes desde checkout
    },
    update: {
      enabled: true,
      policy: '', // Solo actualizar estado de pago
    },
    delete: {
      enabled: false, // No permitir eliminación pública
    }
  }
};

// Políticas personalizadas para mayor seguridad
const politicasPersonalizadas = {
  // Política para usuarios: solo pueden acceder a sus propios datos
  'is-owner-or-email-match': `
    module.exports = async (policyContext, config, { strapi }) => {
      const { user } = policyContext.state;
      const { email } = policyContext.request.query;
      
      // Si hay un usuario autenticado, debe ser el propietario
      if (user && user.id !== policyContext.params.id) {
        return false;
      }
      
      // Para usuarios invitados, verificar por email en query
      if (!user && email) {
        const entity = await strapi.entityService.findOne(
          'api::usuario.usuario',
          policyContext.params.id
        );
        return entity && entity.email === email;
      }
      
      return true;
    };
  `,

  // Política para órdenes: verificar propiedad por usuario o email
  'is-order-owner': `
    module.exports = async (policyContext, config, { strapi }) => {
      const { user } = policyContext.state;
      const { email } = policyContext.request.query;
      
      const orden = await strapi.entityService.findOne(
        'api::orden.orden',
        policyContext.params.id,
        { populate: ['usuario'] }
      );
      
      if (!orden) return false;
      
      // Si hay usuario autenticado, verificar que sea el propietario
      if (user) {
        return orden.usuario && orden.usuario.id === user.id;
      }
      
      // Para usuarios invitados, verificar por email
      if (email) {
        return orden.usuario && orden.usuario.email === email;
      }
      
      return false;
    };
  `
};

// Configuración de CORS para el frontend
const corsConfig = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', // Vite dev server
    'https://tu-dominio.com' // Dominio de producción
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware personalizado para validaciones
const validacionesCustom = {
  // Validar formato de email antes de crear usuario
  validarEmailUsuario: `
    module.exports = (config, { strapi }) => {
      return async (ctx, next) => {
        if (ctx.request.method === 'POST' && ctx.request.url.includes('/usuarios')) {
          const { email } = ctx.request.body.data || ctx.request.body;
          
          if (!email || !isValidEmail(email)) {
            return ctx.badRequest('Email inválido');
          }
        }
        
        await next();
      };
    };
  `,

  // Validar datos de orden antes de crear
  validarDatosOrden: `
    module.exports = (config, { strapi }) => {
      return async (ctx, next) => {
        if (ctx.request.method === 'POST' && ctx.request.url.includes('/ordenes')) {
          const data = ctx.request.body.data || ctx.request.body;
          
          // Validar que el total sea correcto
          const calculatedTotal = parseFloat(data.subtotal) + 
                                parseFloat(data.iva) + 
                                parseFloat(data.costoEnvio) - 
                                parseFloat(data.descuento || 0);
          
          if (Math.abs(calculatedTotal - parseFloat(data.total)) > 0.01) {
            return ctx.badRequest('Total de la orden no coincide con los cálculos');
          }
          
          // Validar que existan items
          if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
            return ctx.badRequest('La orden debe tener al menos un item');
          }
        }
        
        await next();
      };
    };
  `
};

module.exports = {
  permisosPublicos,
  politicasPersonalizadas,
  corsConfig,
  validacionesCustom
};
