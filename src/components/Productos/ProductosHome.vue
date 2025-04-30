<template>
  <div>
    <h1>Productos Destacados</h1>
    <!-- Indicador de carga -->
    <div v-if="productoStore.loading">Cargando productos...</div>
    <!-- Mensaje de error -->
    <div v-if="productoStore.error">Error: {{ productoStore.error.message }}</div>
    <!-- Lista de productos -->
    <ul v-if="productoStore.products.length">
      <li v-for="product in productoStore.products" :key="product.id">
        <h2>{{ product.nombre }}</h2>
        <h2>{{ product.id }}</h2>
        <p>{{ product.descripcion }}</p>
        <p>Precio: ${{ product.precio }}</p>
        <img :src="product.images[0].smallUrl" :alt="product.nombre" />
        <router-link :to="`/producto/${product.id}`">Ver detalle</router-link>
      </li>
    </ul>
    <!-- Mensaje cuando no hay productos -->
    <div v-if="!productoStore.loading && !productoStore.error && productoStore.products.length === 0">
      No hay productos disponibles.
    </div>
  </div>
</template>

<script>
import { defineComponent, onMounted } from 'vue';
import { useCarritoStore } from '@/stores/carrito';
import { useProductoStore } from '@/stores/producto';

export default defineComponent({
  setup() {
    const carrito = useCarritoStore();
    const productoStore = useProductoStore();

    onMounted(() => {
      productoStore.fetchProducts();
    });

    function agregarAlCarrito(producto) {
      carrito.agregarAlCarrito(producto);
    }

    return {
      carrito,
      productoStore,
      agregarAlCarrito
    };
  }
});
</script>