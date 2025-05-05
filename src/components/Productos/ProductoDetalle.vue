<template>
  <div class="product-detail-view">
    <div class="gallery">
      <img 
        :src="mainImage" 
        :alt="producto.nombre" 
        class="main-image" 
        @click="openLightbox(mainImageIndex)"
        style="cursor: zoom-in"
        @error="handleImageError"
      />
      <div class="thumbnails" v-if="hasImages">
        <img 
          v-for="(img, idx) in images" 
          :key="idx" 
          :src="BASE_URL + (img.smallUrl || img.url)" 
          class="thumb" 
          :class="{active: (BASE_URL + img.originalUrl) === mainImage}" 
          @click="openLightbox(idx)"
          @error="handleImageError"
        />
      </div>
      <vue-easy-lightbox
        :visible="lightboxVisible"
        :imgs="imageUrls"
        :index="lightboxIndex"
        @hide="lightboxVisible = false"
      />
    </div>
    <div class="product-info">
      <h1>{{ producto.nombre }}</h1>
      <div class="price">
        <span class="actual">${{ producto.precio }}</span>
        <!-- <span v-if="producto.descuento" class="old">${{ producto.precio + producto.descuento }}</span> -->
      </div>
      <p class="desc">{{ producto.descripcion }}</p>
      <div v-if="!isOutOfStock" class="stock">Stock: {{ producto.stock }}</div>
      <div v-else class="stock out">Sin stock</div>
      <!-- Selector de cantidad -->
      <div class="cantidad-select">
        <button 
          @click="() => cambiarCantidad(-1, producto.stock)" 
          :disabled="cantidad <= MIN_CANTIDAD"
        >-</button>
        <span>{{ cantidad }}</span>
        <button 
          @click="() => cambiarCantidad(1, producto.stock)" 
          :disabled="cantidad >= producto.stock"
        >+</button>
      </div>
      <!-- Botón agregar al carrito -->
      <button 
        class="add-cart" 
        :disabled="isOutOfStock" 
        @click="emitirAgregarAlCarrito"
      >Agregar al carrito</button>
      <div v-if="mensaje" class="msg">{{ mensaje }}</div>
      <!-- Características destacadas -->
      <ul class="features" v-once>
        <li>Envío gratis sobre $50.000</li>
        <li>Pago seguro</li>
        <li>Devolución garantizada</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import VueEasyLightbox from 'vue-easy-lightbox';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337';
import { useProductImage } from '@/composables/useProductImage';
import { useCartActions } from '@/composables/useCartActions';

import type { Producto } from '@/types/producto';

// Estado para el visor de imágenes
const lightboxVisible = ref(false);
const lightboxIndex = ref(0);

// Generar array de URLs absolutas para el visor
const images = computed(() => mapImagenesToImages(props.producto.imagenes.data));
const imageUrls = computed(() => images.value.map(img => BASE_URL + img.originalUrl));

function openLightbox(index: number) {
  lightboxIndex.value = index;
  lightboxVisible.value = true;
}

const mainImageIndex = computed(() => {
  return images.value.findIndex(img => BASE_URL + img.originalUrl === mainImage.value);
});

const props = defineProps({
  producto: {
    type: Object as () => Producto, 
    required: true,
    validator: (value: Producto) => {
      return Boolean(value.nombre && typeof value.precio === 'number');
    }
  },
  cantidad: { 
    type: Number, 
    default: 1 
  }
});

const emit = defineEmits<{
  'agregar-al-carrito': [{ producto: Producto; cantidad: number }]
}>();

// Computed properties
const hasImages = computed(() => props.producto.imagenes?.data?.length > 0);
const isOutOfStock = computed(() => props.producto.stock === 0);

// Composables
console.log("producto composables", props.producto);
// Adaptar las imágenes del producto al formato esperado por useProductImage
function mapImagenesToImages(imagenes: Producto['imagenes']['data']) {
  return imagenes.map(img => ({
    url: img.attributes.formats?.small?.url || img.attributes.url,
    smallUrl: img.attributes.formats?.thumbnail?.url || img.attributes.url,
    originalUrl: img.attributes.url,
    alt: img.attributes.alternativeText || img.attributes.name,
    caption: img.attributes.caption,
    width: img.attributes.width,
    height: img.attributes.height
  }));
}

const { mainImage, setMainImage, handleImageError, updateImagesFromProduct } = useProductImage(images.value);
const { cantidad, mensaje, cambiarCantidad, mostrarMensaje, resetCantidad } = useCartActions(props.cantidad);
const MIN_CANTIDAD = 1;

// Watch effect


watch(() => props.producto, (nuevo) => {
  resetCantidad();
  if (nuevo.imagenes && Array.isArray(nuevo.imagenes.data) && nuevo.imagenes.data.length > 0) {
    updateImagesFromProduct(mapImagenesToImages(nuevo.imagenes.data));
  }
});

// Methods
function emitirAgregarAlCarrito() {
  emit('agregar-al-carrito', { 
    producto: props.producto, 
    cantidad: cantidad.value 
  });
  mostrarMensaje('¡Producto agregado al carrito!');
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
