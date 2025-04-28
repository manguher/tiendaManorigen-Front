<template>
  <Layout>
    <router-view /> <!-- Aquí se renderizan las vistas según la ruta -->
  </Layout>
</template>

<script>
import Layout from './components/layout/Layout.vue'

export default {
  components: {
    Layout
  }
}
</script>
