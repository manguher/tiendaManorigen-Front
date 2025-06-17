# Tienda Lira

Aplicación de tienda en línea desarrollada con Vue 3, Vite y Pinia.

## 🚀 Configuración del Proyecto

### Requisitos Previos

- Node.js 16+ y npm 8+
- Cuenta en [Stripe](https://stripe.com/) para procesamiento de pagos
- Instancia de Strapi configurada (o similar para el backend)

### Instalación

1. Clonar el repositorio:
   ```sh
   git clone https://github.com/tu-usuario/tienda-lira.git
   cd tienda-lira
   ```

2. Instalar dependencias:
   ```sh
   npm install
   ```

3. Configurar variables de entorno:
   - Copiar el archivo `.env.example` a `.env`:
     ```sh
     cp .env.example .env
     ```
   - Editar el archivo `.env` con tus credenciales

4. Iniciar el servidor de desarrollo:
   ```sh
   npm run dev
   ```

## 🔧 Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# URL base de la API de Strapi
VITE_APP_STRAPI_BASE_URL=http://localhost:1337

# Clave pública de Stripe (obtener de https://dashboard.stripe.com/apikeys)
VITE_APP_STRIPE_PUBLIC_KEY=pk_test_tu_clave_publica_de_prueba

# Configuración para producción (opcional)
# VITE_APP_STRIPE_PUBLIC_KEY_PROD=pk_live_tu_clave_publica_de_produccion
# VITE_APP_STRAPI_BASE_URL_PROD=https://tu-api-en-produccion.com
```

## 🛠️ Comandos Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila para producción
- `npm run preview` - Previsualiza la compilación de producción
- `npm run test:unit` - Ejecuta pruebas unitarias
- `npm run lint` - Ejecuta el linter

## 🏗️ Estructura del Proyecto

```
src/
├── assets/          # Recursos estáticos (imágenes, fuentes, etc.)
├── components/      # Componentes reutilizables
│   └── payment/     # Componentes de pago
├── composables/     # Lógica reutilizable
├── router/         # Configuración de rutas
├── stores/         # Stores de Pinia
├── views/          # Vistas/páginas
└── App.vue         # Componente raíz
```

## 🤝 Contribuir

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más información.

---

Desarrollado con ❤️ por Tu Nombre
