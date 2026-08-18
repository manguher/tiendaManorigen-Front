<template>
  <div class="pago-resultado">
    <div class="resultado-card" :class="estadoClase">
      <div class="resultado-icon">{{ icono }}</div>
      <h2>{{ titulo }}</h2>
      <p>{{ mensaje }}</p>
      <p v-if="numeroOrden" class="orden-numero">
        Número de orden: <strong>{{ numeroOrden }}</strong>
      </p>
      <p v-if="esExito" class="orden-nota">
        Guarda tu número de orden para consultar el estado de tu pedido.
      </p>

      <div class="resultado-acciones">
        <router-link v-if="esExito && numeroOrden" to="/seguimiento" class="btn btn-primary">
          Consultar mi pedido
        </router-link>
        <router-link v-if="!esExito" to="/checkout" class="btn btn-primary">
          Reintentar pago
        </router-link>
        <router-link to="/" class="btn btn-secondary">Volver al inicio</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { useCarritoStore } from '@/stores/carrito';

export default {
  name: 'PagoResultadoView',
  data() {
    return {
      status: this.$route.query.status || 'error',
      numeroOrden: this.$route.query.orden || null
    };
  },
  computed: {
    esExito() {
      return this.status === 'autorizada';
    },
    estadoClase() {
      return this.esExito ? 'resultado-exito' : 'resultado-error';
    },
    icono() {
      return this.esExito ? '✓' : '✕';
    },
    titulo() {
      const titulos = {
        autorizada: '¡Pago exitoso!',
        rechazada: 'Pago rechazado',
        cancelado: 'Pago cancelado',
        error: 'Error al procesar el pago'
      };
      return titulos[this.status] || titulos.error;
    },
    mensaje() {
      const mensajes = {
        autorizada: 'Tu pedido ha sido pagado correctamente.',
        rechazada: 'La transacción fue rechazada por el emisor. Puedes intentar con otro medio de pago.',
        cancelado: 'Cancelaste el pago antes de completarlo. Tu pedido quedó registrado como pendiente.',
        error: 'Ocurrió un problema al confirmar el pago. Si el cargo se realizó, contáctanos con tu número de orden.'
      };
      return mensajes[this.status] || mensajes.error;
    }
  },
  mounted() {
    if (this.esExito) {
      useCarritoStore().vaciarCarrito();
    }
  }
};
</script>

<style scoped>
.pago-resultado {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.resultado-card {
  background: white;
  border-radius: 8px;
  padding: 3rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 520px;
  width: 100%;
}

.resultado-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.resultado-exito .resultado-icon,
.resultado-exito h2 {
  color: #4caf50;
}

.resultado-error .resultado-icon,
.resultado-error h2 {
  color: #dc3545;
}

.resultado-card p {
  color: #666;
  margin: 0.5rem 0;
}

.orden-numero {
  font-size: 1.1rem;
  color: #333;
}

.orden-nota {
  font-style: italic;
  font-size: 0.9rem;
}

.resultado-acciones {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #1976d2;
  color: white;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}
</style>
