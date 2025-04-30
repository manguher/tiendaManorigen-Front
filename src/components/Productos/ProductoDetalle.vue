<template>
  <div class="product-detail-view">
    <div class="gallery">
      <img :src="mainImage" :alt="producto.nombre" class="main-image" />
      <div class="thumbnails" v-if="producto.images && producto.images.length > 1">
        <img v-for="(img, idx) in producto.images" :key="idx" :src="img.smallUrl || img.url" class="thumb" :class="{active: img.url === mainImage}" @click="mainImage = img.url" />
      </div>
    </div>
    <div class="product-info">
      <h1>{{ producto.nombre }}</h1>
      <div class="price">
        <span class="actual">${{ producto.precio }}</span>
        <span v-if="producto.descuento" class="old">${{ producto.precio + producto.descuento }}</span>
      </div>
      <p class="desc">{{ producto.descripcion }}</p>
      <div v-if="producto.stock > 0" class="stock">Stock: {{ producto.stock }}</div>
      <div v-else class="stock out">Sin stock</div>
      <!-- Selector de cantidad -->
      <div class="cantidad-select">
        <button @click="cambiarCantidad(-1)" :disabled="cantidadLocal <= 1">-</button>
        <span>{{ cantidadLocal }}</span>
        <button @click="cambiarCantidad(1)" :disabled="cantidadLocal >= producto.stock">+</button>
      </div>
      <!-- Botón agregar al carrito -->
      <button class="add-cart" :disabled="producto.stock === 0" @click="emitirAgregarAlCarrito">Agregar al carrito</button>
      <div v-if="mensaje" class="msg">{{ mensaje }}</div>
      <!-- Características destacadas -->
      <ul class="features">
        <li>Envío gratis sobre $50.000</li>
        <li>Pago seguro</li>
        <li>Devolución garantizada</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
const props = defineProps({
  producto: { type: Object, required: true },
  cantidad: { type: Number, default: 1 }
});
const emit = defineEmits(['agregar-al-carrito']);

const cantidadLocal = ref(props.cantidad);
const mainImage = ref(props.producto.images && props.producto.images.length ? props.producto.images[0].url : '');
const mensaje = ref('');

watch(() => props.producto, (nuevo) => {
  cantidadLocal.value = 1;
  if (nuevo && nuevo.images && nuevo.images.length) {
    mainImage.value = nuevo.images[0].url;
  }
});

function cambiarCantidad(delta) {
  const nueva = cantidadLocal.value + delta;
  if (nueva >= 1 && nueva <= props.producto.stock) {
    cantidadLocal.value = nueva;
  }
}

function emitirAgregarAlCarrito() {
  emit('agregar-al-carrito', { producto: props.producto, cantidad: cantidadLocal.value });
  mensaje.value = '¡Producto agregado al carrito!';
  setTimeout(() => mensaje.value = '', 1800);
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
</style>
