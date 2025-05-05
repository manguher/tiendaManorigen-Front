import { ref } from 'vue';
import type { Ref } from 'vue';

interface Product {
  nombre: string;
  precio: number;
  stock: number;
  descripcion: string;
  images: Array<{url: string; smallUrl?: string}>;
  descuento?: number;
}

export function useCartActions(initialQuantity = 1) {
  const cantidad = ref(initialQuantity);
  const mensaje = ref('');
  const MENSAJE_TIMEOUT = 1800;
  const MIN_CANTIDAD = 1;

  const cambiarCantidad = (delta: number, maxStock: number) => {
    const nueva = cantidad.value + delta;
    if (nueva >= MIN_CANTIDAD && nueva <= maxStock) {
      cantidad.value = nueva;
    }
  };

  const mostrarMensaje = (texto: string) => {
    mensaje.value = texto;
    setTimeout(() => mensaje.value = '', MENSAJE_TIMEOUT);
  };

  const resetCantidad = () => {
    cantidad.value = MIN_CANTIDAD;
  };

  return {
    cantidad,
    mensaje,
    cambiarCantidad,
    mostrarMensaje,
    resetCantidad,
  };
}
