import { defineStore } from 'pinia';

export const useCarritoStore = defineStore('carrito', {
  state: () => ({
    items: [] // Cada item: { producto, cantidad }
  }),
  getters: {
    cantidadTotal(state) {
      return state.items.reduce((acc, item) => acc + item.cantidad, 0);
    },
    totalAPagar(state) {
      return state.items.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
    }
  },
  actions: {
    agregarAlCarrito(producto) {
      const existente = this.items.find(item => item.producto.id === producto.id);
      if (existente) {
        existente.cantidad++;
      } else {
        this.items.push({ producto, cantidad: 1 });
      }
    },
    disminuirCantidad(productoId) {
      const item = this.items.find(i => i.producto.id === productoId);
      if (item && item.cantidad > 0) {
        item.cantidad--;
      }
    },
    eliminarDelCarrito(productoId) {
      this.items = this.items.filter(item => item.producto.id !== productoId);
    },
    vaciarCarrito() {
      this.items = [];
    }
  }
});
