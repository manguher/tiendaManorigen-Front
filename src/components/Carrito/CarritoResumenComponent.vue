<template>
  <div class="carrito-resumen">
    <h2>Resumen del Carrito</h2>
    <div v-if="carrito.items.length === 0" class="carrito-vacio">
      El carrito está vacío.
    </div>
    <div v-else>
      <table class="carrito-tabla">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in carrito.items" :key="item.producto.id">
            <td>
              <img :src="item.producto.images && item.producto.images.length ? item.producto.images[0].thumbnailUrl || item.producto.images[0].url : ''" alt="Imagen" class="producto-img" />
            </td>
            <td>{{ item.producto.nombre }}</td>
            <td>
  <button @click="disminuirCantidadCarrito(item.producto.id)" class="cantidad-btn">-</button>
  <span class="cantidad-num">{{ item.cantidad }}</span>
  <button @click="aumentarCantidad(item.producto.id)" class="cantidad-btn">+</button>
  <button @click="confirmarEliminacion(item.producto.id)" class="eliminar-btn" title="Eliminar producto">
    🗑️
  </button>
</td>
            <td>${{ item.producto.precio }}</td>
            <td>${{ item.producto.precio * item.cantidad }}</td>
          </tr>
        </tbody>
      </table>
      <div class="carrito-total">
        <strong>Total a pagar:</strong> ${{ carrito.totalAPagar }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCarritoStore } from '@/stores/carrito';
const carrito = useCarritoStore();

function aumentarCantidad(productoId) {
  const item = carrito.items.find(i => i.producto.id === productoId);
  if (item) {
    carrito.agregarAlCarrito(item.producto);
  }
}

function disminuirCantidadCarrito(productoId) {
  const item = carrito.items.find(i => i.producto.id === productoId);
  console.log("item.cantidad", item.cantidad)
  if (item && item.cantidad > 0) {
    carrito.disminuirCantidad(productoId);
  }
}

function confirmarEliminacion(productoId) {
  if (window.confirm('¿Seguro que deseas eliminar este producto del carrito?')) {
    carrito.eliminarDelCarrito(productoId);
  }
}
</script>

<style scoped>
.carrito-resumen {
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  max-width: 600px;
  margin: 0 auto;
}

/* Scroll horizontal en móviles para la tabla */
.carrito-tabla {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  overflow-x: auto;
  display: block;
}
.carrito-tabla th,
.carrito-tabla td {
  border: 1px solid #eee;
  padding: 0.5rem;
  text-align: center;
  min-width: 80px;
}
.cantidad-btn {
  background: #f1f1f1;
  border: none;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  font-size: 1.2rem;
  margin: 0 4px;
  cursor: pointer;
  transition: background 0.2s;
}
.cantidad-btn:hover {
  background: #e0e0e0;
}
.cantidad-num {
  display: inline-block;
  min-width: 24px;
  text-align: center;
}
.eliminar-btn {
  background: transparent;
  border: none;
  margin-left: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  color: #e74c3c;
  vertical-align: middle;
  transition: color 0.2s;
}
.eliminar-btn:hover {
  color: #c0392b;
}


.producto-img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
}
.carrito-total {
  text-align: right;
  font-size: 1.2rem;
  margin-top: 1rem;
}
.carrito-vacio {
  text-align: center;
  color: #888;
  font-size: 1.1rem;
  margin: 2rem 0;
}

@media (max-width: 600px) {
  .carrito-resumen {
    padding: 0.5rem;
    max-width: 100vw;
  }
  .carrito-tabla {
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
  }
  .carrito-tabla th, .carrito-tabla td {
    padding: 0.3rem;
    min-width: 70px;
  }
  .producto-img {
    width: 36px;
    height: 36px;
  }
  .carrito-total {
    font-size: 1rem;
    margin-top: 0.5rem;
  }
}

@media (max-width: 400px) {
  .carrito-tabla th, .carrito-tabla td {
    font-size: 0.85rem;
    min-width: 60px;
  }
  .producto-img {
    width: 28px;
    height: 28px;
  }
}
</style>
