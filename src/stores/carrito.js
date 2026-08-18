import { defineStore } from 'pinia';

const STORAGE_KEY = 'carrito';

function cargarCarrito() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export const useCarritoStore = defineStore('carrito', {
  state: () => ({
    items: cargarCarrito() // Cada item: { producto, cantidad }
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
    _guardar() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    },
    agregarAlCarrito(producto) {
      const existente = this.items.find(item => item.producto.id === producto.id);
      if (existente) {
        existente.cantidad++;
      } else {
        this.items.push({ producto, cantidad: 1 });
      }
      this._guardar();
    },
    disminuirCantidad(productoId) {
      const item = this.items.find(i => i.producto.id === productoId);
      if (item && item.cantidad > 0) {
        item.cantidad--;
      }
      this._guardar();
    },
    eliminarDelCarrito(productoId) {
      this.items = this.items.filter(item => item.producto.id !== productoId);
      this._guardar();
    },
    vaciarCarrito() {
      this.items = [];
      this._guardar();
    }
  }
});
