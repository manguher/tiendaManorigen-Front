<template>
  <ProductoDetalle
    v-if="!productoStore.loading && producto"
    :producto="producto"
    :cantidad="cantidad"
    @agregar-al-carrito="agregarAlCarrito"
  />
  <div v-else-if="productoStore.loading" class="loading">Cargando producto...</div>
  <div v-else class="error">No se encontró el producto.</div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProductoStore } from '@/stores/producto';
import ProductoDetalle from '@/components/Productos/ProductoDetalle.vue';
import { useCarritoStore } from '@/stores/carrito';

const route = useRoute();
const productoStore = useProductoStore();
const carritoStore = useCarritoStore();
const producto = ref(null);
const cantidad = ref(1);

const fetchProducto = async () => {
  console.log("route.params.id", route.params.id);
  await productoStore.fetchProductById(route.params.id);
  console.log("productoStore.product", productoStore.product.data.attributes.stock);
  console.log("productoStore.product.stock", productoStore.product.data.attributes.stock);
  producto.value = productoStore.product.data.attributes;
  cantidad.value = 1;
};

onMounted(fetchProducto);
watch(() => route.params.id, fetchProducto);

function agregarAlCarrito(payload) {
  console.log("payload", payload);
  // payload: { producto, cantidad }
  if (payload.producto && payload.cantidad <= payload.producto.stock) {
    carritoStore.agregarAlCarrito({ ...payload.producto, cantidad: payload.cantidad });
  }
}
</script>

<style scoped>
.product-detail-view {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 2rem;
  max-width: 900px;
  margin: 2rem auto;
}
.gallery {
  flex: 1 1 320px;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.main-image {
  width: 320px;
  height: 320px;
  object-fit: contain;
  border-radius: 10px;
  background: #f7f7f7;
  margin-bottom: 1rem;
}
.thumbnails {
  display: flex;
  gap: 8px;
}
.thumb {
  width: 54px;
  height: 54px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border 0.2s;
}
.thumb.active, .thumb:hover {
  border-color: #e74c3c;
}
.product-info {
  flex: 2 1 340px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.price {
  font-size: 2rem;
  color: #e74c3c;
  margin-bottom: 0.5rem;
}
.price .old {
  color: #888;
  font-size: 1.2rem;
  text-decoration: line-through;
  margin-left: 1rem;
}
.desc {
  font-size: 1.1rem;
  color: #333;
}
.stock {
  color: #27ae60;
  font-weight: bold;
}
.stock.out {
  color: #e74c3c;
}
.cantidad-select {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cantidad-select button {
  width: 32px;
  height: 32px;
  font-size: 1.3rem;
  border: none;
  border-radius: 50%;
  background: #eee;
  cursor: pointer;
  transition: background 0.2s;
}
.cantidad-select button:disabled {
  background: #ddd;
  cursor: not-allowed;
}
.add-cart {
  background: #e74c3c;
  color: #fff;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  border-radius: 8px;
  margin-top: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.add-cart:disabled {
  background: #aaa;
}
.features {
  margin-top: 1.5rem;
  padding-left: 1.2rem;
  color: #555;
  font-size: 1rem;
}
.features li {
  margin-bottom: 0.4rem;
}
.msg {
  margin-top: 0.5rem;
  color: #27ae60;
  font-weight: bold;
}
.loading, .error {
  text-align: center;
  font-size: 1.2rem;
  padding: 2rem;
  color: #888;
}
@media (max-width: 700px) {
  .product-detail-view {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }
  .gallery {
    min-width: 100%;
    align-items: stretch;
  }
  .main-image {
    width: 100%;
    height: 220px;
  }
}
</style>
