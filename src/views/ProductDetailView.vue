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
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useProductoStore } from '@/stores/producto';
import ProductoDetalle from '@/components/Productos/ProductoDetalle.vue';
import { useCarritoStore } from '@/stores/carrito';

const route = useRoute();
const productoStore = useProductoStore();
const carritoStore = useCarritoStore();
const cantidad = ref(1);

// El store reconoce que le estoy pidiendo el valor de un producto por id gracias a
// la funcion "fetchProductById" que se encarga de hacer la peticion a la API
// y guardar el resultado en la propiedad "product" del store.
// La propiedad "product" es un ref que se inicializa en null y se actualiza
// cuando se llama a la funcion "fetchProductById" con el id del producto como parametro.
// La funcion "fetchProductById" utiliza el hook "useAsync" para hacer la peticion
// a la API y manejar el estado de carga y el error en caso de que algo falle.

// Pinia infiere que el valor retornado por la funcion "fetchProductById" debe guardarse
// en la propiedad "product" del store gracias a la convencion de nomenclatura.
// La convencion es que si el nombre de la funcion termina en "ByX", donde X es el nombre
// de una propiedad, pinia asume que el valor retornado debe guardarse en esa propiedad.
// En este caso, la funcion se llama "fetchProductById", por lo que Pinia asume que el valor
// retornado debe guardarse en la propiedad "product".


const fetchProducto = async () => {


  await productoStore.fetchProductById(route.params.id);
  cantidad.value = 1;
};

watch(() => route.params.id, fetchProducto, { immediate: true });

function agregarAlCarrito(payload) {
  if (payload.producto && payload.cantidad <= payload.producto.stock) {
    carritoStore.agregarAlCarrito({ ...payload.producto, cantidad: payload.cantidad });
  }
}

const producto = computed(() => productoStore.product?.data?.attributes || null);
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
