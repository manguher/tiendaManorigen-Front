<template>
  <div class="guest-order-lookup">
    <div class="container">
      <div class="lookup-header">
        <h1>Consultar Mi Pedido</h1>
        <p>Ingresa tu email y número de orden para ver los detalles de tu compra</p>
      </div>

      <!-- Formulario de búsqueda -->
      <div v-if="!selectedOrder" class="lookup-form">
        <form @submit.prevent="searchOrder">
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input 
              id="email"
              v-model="searchForm.email" 
              type="email" 
              required 
              placeholder="tu@email.com"
            >
          </div>
          
          <div class="form-group">
            <label for="orderNumber">Número de Orden</label>
            <input 
              id="orderNumber"
              v-model="searchForm.orderNumber" 
              type="text" 
              required 
              placeholder="123456"
            >
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Buscando...' : 'Buscar Pedido' }}
          </button>
        </form>

        <!-- Mensaje de error -->
        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <!-- Última orden guardada -->
        <div v-if="lastOrder" class="last-order-section">
          <h3>Tu última compra</h3>
          <div class="last-order-card">
            <p><strong>Orden:</strong> #{{ lastOrder.orderNumber }}</p>
            <p><strong>Email:</strong> {{ lastOrder.email }}</p>
            <p><strong>Fecha:</strong> {{ formatDate(lastOrder.date) }}</p>
            <button 
              @click="loadLastOrder" 
              class="btn btn-outline-primary"
              :disabled="loading"
            >
              Ver Detalles
            </button>
          </div>
        </div>
      </div>

      <!-- Detalles de la orden -->
      <div v-else class="order-details">
        <div class="order-header">
          <h2>Detalles del Pedido #{{ selectedOrder.attributes.numeroOrden }}</h2>
          <button @click="goBack" class="btn btn-secondary">← Buscar otra orden</button>
        </div>

        <div class="order-info-grid">
          <!-- Estado de la orden -->
          <div class="info-card">
            <h3>Estado del Pedido</h3>
            <div class="status-badge" :class="`status-${selectedOrder.attributes.estado}`">
              {{ getStatusText(selectedOrder.attributes.estado) }}
            </div>
            <p class="order-date">
              Realizado el {{ formatDate(selectedOrder.attributes.fechaOrden) }}
            </p>
          </div>

          <!-- Información de envío -->
          <div class="info-card">
            <h3>Dirección de Envío</h3>
            <div class="shipping-info">
              <p><strong>{{ selectedOrder.attributes.direccionEnvio.nombreCompleto }}</strong></p>
              <p>{{ selectedOrder.attributes.direccionEnvio.direccion }}</p>
              <p>{{ selectedOrder.attributes.direccionEnvio.ciudad }}, {{ selectedOrder.attributes.direccionEnvio.codigoPostal }}</p>
              <p>Tel: {{ selectedOrder.attributes.direccionEnvio.telefono }}</p>
            </div>
          </div>

          <!-- Resumen del pedido -->
          <div class="info-card">
            <h3>Resumen del Pedido</h3>
            <div class="order-summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>${{ Number(selectedOrder.attributes.subtotal).toLocaleString('es-CL') }}</span>
              </div>
              <div class="summary-row">
                <span>IVA:</span>
                <span>${{ Number(selectedOrder.attributes.iva).toLocaleString('es-CL') }}</span>
              </div>
              <div class="summary-row">
                <span>Envío:</span>
                <span v-if="selectedOrder.attributes.costoEnvio > 0">
                  ${{ Number(selectedOrder.attributes.costoEnvio).toLocaleString('es-CL') }}
                </span>
                <span v-else>Gratis</span>
              </div>
              <div class="summary-row total">
                <span><strong>Total:</strong></span>
                <span><strong>${{ Number(selectedOrder.attributes.total).toLocaleString('es-CL') }}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Items del pedido -->
        <div class="order-items">
          <h3>Productos Ordenados</h3>
          <div class="items-list">
            <div 
              v-for="(item, index) in selectedOrder.attributes.items" 
              :key="index"
              class="item-card"
            >
              <div class="item-info">
                <h4>Producto ID: {{ item.producto }}</h4>
                <p>Cantidad: {{ item.cantidad }}</p>
                <p>Precio unitario: ${{ Number(item.precioUnitario).toLocaleString('es-CL') }}</p>
                <p><strong>Subtotal: ${{ Number(item.subtotal).toLocaleString('es-CL') }}</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useGuestOrders } from '@/composables/useGuestOrders';

export default {
  name: 'GuestOrderLookup',
  setup() {
    const { loading, error, getOrderDetails, getLastOrder } = useGuestOrders();
    
    return {
      loading,
      error,
      getOrderDetails,
      getLastOrder
    };
  },
  data() {
    return {
      searchForm: {
        email: '',
        orderNumber: ''
      },
      selectedOrder: null,
      lastOrder: null
    };
  },
  mounted() {
    // Cargar la última orden si existe
    this.lastOrder = this.getLastOrder();
  },
  methods: {
    async searchOrder() {
      const order = await this.getOrderDetails(
        this.searchForm.orderNumber, 
        this.searchForm.email
      );
      
      if (order) {
        this.selectedOrder = order;
      }
    },

    async loadLastOrder() {
      if (this.lastOrder) {
        const order = await this.getOrderDetails(
          this.lastOrder.orderNumber, 
          this.lastOrder.email
        );
        
        if (order) {
          this.selectedOrder = order;
        }
      }
    },

    goBack() {
      this.selectedOrder = null;
      this.searchForm = { email: '', orderNumber: '' };
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    getStatusText(status) {
      const statusMap = {
        'pendiente': 'Pendiente',
        'pagado': 'Pagado',
        'procesando': 'Procesando',
        'enviado': 'Enviado',
        'entregado': 'Entregado',
        'cancelado': 'Cancelado'
      };
      return statusMap[status] || status;
    }
  }
};
</script>

<style scoped>
.guest-order-lookup {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.lookup-header {
  text-align: center;
  margin-bottom: 2rem;
}

.lookup-header h1 {
  color: #333;
  margin-bottom: 0.5rem;
}

.lookup-header p {
  color: #666;
  font-size: 1.1rem;
}

.lookup-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1565c0;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-outline-primary {
  background-color: transparent;
  color: #1976d2;
  border: 1px solid #1976d2;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.last-order-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.last-order-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #1976d2;
}

.order-details {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.order-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.info-card h3 {
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.875rem;
}

.status-pendiente {
  background-color: #fff3cd;
  color: #856404;
}

.status-pagado {
  background-color: #d4edda;
  color: #155724;
}

.status-procesando {
  background-color: #cce5ff;
  color: #004085;
}

.status-enviado {
  background-color: #e2e3e5;
  color: #383d41;
}

.status-entregado {
  background-color: #d1ecf1;
  color: #0c5460;
}

.order-date {
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.shipping-info p {
  margin-bottom: 0.25rem;
}

.order-summary .summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.order-summary .total {
  border-top: 1px solid #ddd;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

.order-items {
  margin-top: 2rem;
}

.items-list {
  display: grid;
  gap: 1rem;
}

.item-card {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #1976d2;
}

.item-info h4 {
  margin-bottom: 0.5rem;
  color: #333;
}

.item-info p {
  margin-bottom: 0.25rem;
  color: #666;
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .order-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
