import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  define: {
    'process.env': {}
  },
  // Configuración para TypeScript
  esbuild: {
    tsconfigRaw: '{}'
  },
  css: {
    postcss: './postcss.config.cjs',
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/variables.scss";`
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  optimizeDeps: {
    include: ['@stripe/stripe-js']
  },
  // Configuración para solucionar el problema de crypto.getRandomValues
  server: {
    fs: {
      strict: true,
    }
  }
})
