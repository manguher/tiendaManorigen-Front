<template>
  <div class="checkout-container">
    <div class="checkout-steps">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        :class="['step', { 'active': currentStep === index, 'completed': currentStep > index }]"
        @click="goToStep(index)"
      >
        {{ step }}
      </div>
    </div>

    <div class="checkout-content">
      <!-- Paso 1: Información de envío -->
      <div v-if="currentStep === 0" class="checkout-step">
        <h2>Información de Envío</h2>
        <form @submit.prevent="goToNextStep">
          <div class="form-group">
            <label>Nombre completo</label>
            <input v-model="shippingInfo.fullName" type="text" required>
          </div>
          <div class="form-group">
            <label>Correo electrónico</label>
            <input v-model="guestEmail" type="email" required placeholder="Para recibir confirmación de tu pedido">
          </div>
          <div class="form-group">
            <label>Dirección</label>
            <input v-model="shippingInfo.address" type="text" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Ciudad</label>
              <input v-model="shippingInfo.city" type="text" required>
            </div>
            <div class="form-group">
              <label>Comuna</label>
              <input v-model="shippingInfo.comuna" type="text" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Región</label>
              <input v-model="shippingInfo.region" type="text" required>
            </div>
            <div class="form-group">
              <label>Código Postal</label>
              <input v-model="shippingInfo.postalCode" type="text" required>
            </div>
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input v-model="shippingInfo.phone" type="tel" required>
          </div>
          <div class="form-group">
            <label>Referencia (opcional)</label>
            <input v-model="shippingInfo.referencia" type="text" placeholder="Ej: Dejar en conserjería">
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Continuar a revisar pedido</button>
          </div>
        </form>
      </div>

      <!-- Paso 2: Resumen y confirmación -->
      <div v-else class="checkout-step">
        <h2>Resumen del Pedido</h2>
        <div class="order-summary">
          <div class="shipping-info">
            <h3>Envío a:</h3>
            <p>{{ shippingInfo.fullName }}</p>
            <p>{{ shippingInfo.address }}</p>
            <p>{{ shippingInfo.city }}, {{ shippingInfo.comuna }}</p>
            <p>{{ shippingInfo.region }}, {{ shippingInfo.postalCode }}</p>
            <p v-if="shippingInfo.referencia">Referencia: {{ shippingInfo.referencia }}</p>
            <p>Tel: {{ shippingInfo.phone }}</p>
          </div>
          
          <div class="order-items">
            <h3>Tu pedido</h3>
            <div v-for="(item, index) in cartItems" :key="index" class="order-item">
              <img 
                :src="item.images && item.images.length ? item.images[0].thumbnailUrl || item.images[0].url : '/placeholder-product.jpg'" 
                :alt="item.nombre"
                class="product-image"
              >
              <div class="item-details">
                <h4>{{ item.nombre }}</h4>
                <div class="quantity-selector">
                  <button @click="updateQuantity(item.id, item.quantity - 1)" :disabled="item.quantity <= 1">-</button>
                  <span>{{ item.quantity }}</span>
                  <button @click="updateQuantity(item.id, item.quantity + 1)">+</button>
                </div>
                <p>Precio unitario: ${{ item.precio.toLocaleString('es-CL') }}</p>
                <p>Subtotal: ${{ (item.precio * item.quantity).toLocaleString('es-CL') }}</p>
              </div>
              <button @click="removeItem(item.id)" class="remove-item" title="Eliminar producto">
                🗑️
              </button>
            </div>
          </div>
          
          <div class="order-totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${{ Number(subtotal).toLocaleString('es-CL') }}</span>
            </div>
            <div class="total-row">
              <span>Envío:</span>
              <span v-if="shippingCost > 0">${{ Number(shippingCost).toLocaleString('es-CL') }}</span>
              <span v-else>Gratis</span>
            </div>
            <div class="total-row">
              <span>IVA (19%):</span>
              <span>${{ iva }}</span>
            </div>
            <div class="total-row total">
              <span>Total:</span>
              <span>${{ Number(total).toLocaleString('es-CL') }}</span>
            </div>
          </div>
        </div>
        
        <!-- Selección de método de pago -->
        <div class="payment-section">
          <h3>Método de Pago</h3>
          <div class="payment-methods">
            <div 
              v-for="method in paymentMethods" 
              :key="method.id"
              class="payment-method"
              :class="{ 'selected': paymentMethod === method.id }"
              @click="selectPaymentMethod(method.id)"
            >
              <div class="payment-method-icon">{{ method.icon }}</div>
              <span>{{ method.name }}</span>
            </div>
          </div>
          
          <!-- Mensaje informativo sobre Transbank -->
          <div v-if="paymentMethod === 'transbank'" class="payment-info-box">
            <p>🔒 Serás redirigido a Transbank para completar el pago de forma segura.</p>
            <p class="info-note">Acepta tarjetas de débito, crédito y prepago.</p>
          </div>
        </div>
        
        <!-- Mensajes de estado -->
        <div v-if="paymentStatus.message" :class="['alert', paymentStatus.type === 'error' ? 'alert-danger' : 'alert-success']">
          {{ paymentStatus.message }}
        </div>
        
        <div class="form-actions">
          <button @click="goToPreviousStep" class="btn btn-secondary">Atrás</button>
          <button 
            @click="processPayment" 
            class="btn btn-primary" 
            :disabled="isProcessing || !paymentMethod"
          >
            {{ isProcessing ? 'Procesando...' : getPaymentButtonText() }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCarritoStore } from '@/stores/carrito';
import checkoutApi from '@/api/checkout';
import transbankApi from '@/api/transbank';

export default {
  name: 'CheckoutView',
  data() {
    const carritoStore = useCarritoStore();
    return {
      carritoStore,
      currentStep: 0,
      steps: ['Envío', 'Revisar y Pagar'],
      shippingInfo: {
        fullName: '',
        address: '',
        city: '',
        comuna: '',
        region: '',
        postalCode: '',
        phone: '',
        referencia: ''
      },
      guestEmail: '', // Campo para el email del usuario invitado
      isGuestCheckout: true, // Por defecto usamos checkout como invitado
      orderNotes: '', // Notas adicionales del pedido
      paymentMethod: null,
      paymentMethods: [
        { id: 'transbank', name: 'Webpay Plus (Transbank)', icon: '💳' }
      ],
      paymentStatus: {
        type: '',
        message: ''
      },
      isProcessing: false
    }
  },
  computed: {
    cartItems() {
      return this.carritoStore.items.map(item => ({
        ...item.producto,
        quantity: item.cantidad
      }));
    },
    subtotal() {
      return this.carritoStore.totalAPagar.toFixed(2);
    },
    iva() {
      return (this.carritoStore.totalAPagar * 0.19).toFixed(2);
    },
    shippingCost() {
      // Envío gratuito para compras mayores a $50,000
      return this.carritoStore.totalAPagar >= 50000 ? 0 : 3000;
    },
    total() {
      return (parseFloat(this.subtotal) + parseFloat(this.iva) + parseFloat(this.shippingCost)).toFixed(2);
    }
  },
  methods: {
    updateQuantity(productoId, newQuantity) {
      const item = this.carritoStore.items.find(i => i.producto.id === productoId);
      if (item) {
        const difference = newQuantity - item.cantidad;
        if (difference > 0) {
          // Aumentar cantidad
          for (let i = 0; i < difference; i++) {
            this.carritoStore.agregarAlCarrito(item.producto);
          }
        } else if (difference < 0) {
          // Disminuir cantidad
          for (let i = 0; i < Math.abs(difference); i++) {
            this.carritoStore.disminuirCantidad(productoId);
          }
        }
      }
    },
    removeItem(productoId) {
      this.carritoStore.eliminarDelCarrito(productoId);
    },
    goToStep(step) {
      this.currentStep = step
    },
    goToNextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++
      }
    },
    goToPreviousStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    selectPaymentMethod(method) {
      this.paymentMethod = method
      console.log('Método de pago seleccionado:', method);
    },
    getPaymentButtonText() {
      if (this.paymentMethod === 'transbank') {
        return 'Ir a Webpay';
      }
      return 'Confirmar y pagar';
    },
    async processPayment() {
      if (this.paymentMethod !== 'transbank') return;

      this.isProcessing = true;
      this.paymentStatus = { type: '', message: '' };

      try {
        // 1. Crear el pedido en la API (valida precio/stock contra Strapi y recalcula totales)
        const checkoutData = {
          email: this.guestEmail,
          paymentMethod: this.paymentMethod,
          subtotal: this.subtotal,
          iva: this.iva,
          shippingCost: this.shippingCost,
          total: this.total,
          notas: this.orderNotes,
          shippingInfo: this.shippingInfo,
          items: this.cartItems,
          userType: 'guest'
        };

        const result = await checkoutApi.processGuestCheckout(checkoutData);

        if (!result.success) {
          throw new Error(result.error || 'Error al crear la orden');
        }

        const orden = result.orden;

        // Guardar referencia con el número de orden REAL generado por la API
        localStorage.setItem('lastGuestOrder', JSON.stringify({
          orderNumber: orden.numeroOrden,
          email: this.guestEmail,
          date: new Date().toISOString(),
          orderId: orden.id
        }));

        // 2. Iniciar transacción Webpay para ese pedido
        const pago = await transbankApi.initTransaction(orden.numeroOrden);

        if (!pago.success) {
          throw new Error(pago.error || 'No se pudo iniciar el pago con Transbank');
        }

        // 3. Redirigir a Webpay (el carrito se vacía en /pago/resultado si el pago es autorizado)
        transbankApi.redirectToWebpay(pago.url, pago.token);
      } catch (error) {
        console.error('❌ Error al procesar el pago:', error);
        this.paymentStatus = {
          type: 'error',
          message: error.message || 'Hubo un error al procesar tu pedido. Por favor, inténtalo de nuevo.'
        };
        this.isProcessing = false;
      }
    }
  }
}
</script>

<style scoped>
.checkout-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.checkout-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;
}

.checkout-steps::before {
  content: '';
  position: absolute;
  top: 15px;
  left: 0;
  right: 0;
  height: 2px;
  background: #e0e0e0;
  z-index: 1;
}

.step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  color: #9e9e9e;
  cursor: pointer;
  z-index: 2;
}

.step::before {
  content: attr(data-step);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e0e0e0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.step.active {
  color: #1976d2;
  font-weight: 500;
}

.step.active::before {
  background: #1976d2;
}

.step.completed {
  color: #4caf50;
}

.step.completed::before {
  background: #4caf50;
  content: '✓';
}

.checkout-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary {
  background: #1976d2;
  color: white;
}

.btn-primary:hover {
  background: #1565c0;
}

.btn-primary:disabled {
  background: #90caf9;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.payment-method {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-method:hover {
  border-color: #1976d2;
}

.payment-method.selected {
  border-color: #1976d2;
  background-color: #e3f2fd;
}

.payment-method img {
  width: 50px;
  height: 30px;
  object-fit: contain;
  margin-bottom: 0.5rem;
}

.payment-method-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.payment-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e0e0e0;
}

.payment-section h3 {
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.3rem;
}

.payment-info-box {
  margin-top: 1rem;
  padding: 1rem;
  background: #e3f2fd;
  border-left: 4px solid #1976d2;
  border-radius: 4px;
}

.payment-info-box p {
  margin: 0.5rem 0;
  color: #333;
}

.payment-info-box.test-mode {
  background: #fff3cd;
  border-left-color: #ffc107;
}

.payment-info-box .info-note {
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}

.order-summary {
  margin: 2rem 0;
}

.shipping-info {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.order-items {
  margin: 2rem 0;
}

.order-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
  position: relative;
}

.order-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.quantity-selector button {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.quantity-selector button:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #1976d2;
}

.quantity-selector button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-selector span {
  min-width: 30px;
  text-align: center;
  font-weight: 600;
}

.remove-item {
  position: absolute;
  top: 1rem;
  right: 0;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.remove-item:hover {
  opacity: 1;
}

/* Estilos para el contenedor de pago con Stripe */
.stripe-payment-container {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.loading-payment {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading-payment p {
  margin-top: 1rem;
}

/* Estilos para mensajes de estado */
.alert {
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 4px;
  font-size: 0.9rem;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

/* Ajustes para el formulario de Stripe */
#card-element {
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: white;
  margin-bottom: 1rem;
}

#card-errors {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  min-height: 1.25rem;
}

/* Estilos para el spinner de carga */
.spinner-border {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  vertical-align: -0.125em;
  border: 0.2em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
  margin-right: 0.5rem;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}

/* Clase para ocultar elementos accesiblemente */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.cart-item-image {
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details {
  flex: 1;
}

.order-totals {
  margin-top: 2rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.total {
  font-weight: bold;
  font-size: 1.2rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.success-message {
  text-align: center;
  padding: 3rem 1rem;
}

.guest-note {
  font-style: italic;
  color: #666;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.success-icon {
  font-size: 4rem;
  color: #4caf50;
  margin-bottom: 1rem;
}

.success-message h2 {
  color: #4caf50;
  margin-bottom: 1rem;
}

.success-message p {
  margin: 0.5rem 0;
  color: #666;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .payment-methods {
    grid-template-columns: 1fr;
  }
}
</style>
