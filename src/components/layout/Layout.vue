<template>
  <div class="layout">
    <Header />
    <main>
      <slot></slot> <!-- Aquí se renderiza el contenido de la vista actual -->
    </main>
    <Footer />
  </div>
</template>

<script>
import Header from './Header.vue'
import Footer from './Footer.vue'

export default {
  components: {
    Header,
    Footer
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Asegura que el layout ocupe toda la altura de la ventana */
  width: 100%; /* Asegura que el layout ocupe todo el ancho */
}

header,
main,
footer {
  width: 100%; /* Asegura que cada sección ocupe todo el ancho disponible */
  max-width: 100%; /* Evita que se sobrepase el ancho máximo */
}

main {
  flex: 1; /* Permite que el contenido principal crezca para llenar el espacio disponible */
}

body {
  margin: 0; /* Elimina cualquier margen por defecto */
  padding: 0; /* Elimina cualquier padding por defecto */
}
</style>
