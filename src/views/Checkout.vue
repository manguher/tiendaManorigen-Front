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
              <label>Código Postal</label>
              <input v-model="shippingInfo.postalCode" type="text" required>
            </div>
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input v-model="shippingInfo.phone" type="tel" required>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Continuar al pago</button>
          </div>
        </form>
      </div>

      <!-- Paso 2: Método de pago -->
      <div v-else-if="currentStep === 1" class="checkout-step">
        <h2>Método de Pago</h2>
        <div class="payment-methods">
          <div 
            v-for="method in paymentMethods" 
            :key="method.id"
            class="payment-method"
            :class="{ 'selected': paymentMethod === method.id }"
            @click="selectPaymentMethod(method.id)"
          >
            <img :src="method.icon" :alt="method.name">
            <span>{{ method.name }}</span>
          </div>
        </div>
        
        <!-- Formulario de pago con Stripe -->
        <div v-if="paymentMethod === 'credit_card'" class="stripe-payment-container">
          <StripePaymentForm
            v-if="stripeOptions.publishableKey && clientSecret"
            :amount="totalAmountForStripe"
            :publishable-key="stripeOptions.publishableKey"
            :client-secret="clientSecret"
            @payment-success="handlePaymentSuccess"
            @payment-error="handlePaymentError"
          />
          <div v-else class="loading-payment">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p>Preparando el procesador de pagos...</p>
          </div>
        </div>
        
        <!-- Mensajes de estado del pago -->
        <div v-if="paymentStatus.message" :class="['alert', paymentStatus.type === 'error' ? 'alert-danger' : 'alert-success']">
          {{ paymentStatus.message }}
        </div>
        
        <div class="form-actions">
          <button @click="goToPreviousStep" class="btn btn-secondary">Atrás</button>
          <button 
            v-if="paymentMethod !== 'credit_card'"
            @click="goToNextStep" 
            :disabled="!paymentMethod" 
            class="btn btn-primary"
          >
            Revisar pedido
          </button>
        </div>
      </div>

      <!-- Paso 3: Resumen y confirmación -->
      <div v-else-if="currentStep === 2" class="checkout-step">
        <h2>Resumen del Pedido</h2>
        <div class="order-summary">
          <div class="shipping-info">
            <h3>Envío a:</h3>
            <p>{{ shippingInfo.fullName }}</p>
            <p>{{ shippingInfo.address }}</p>
            <p>{{ shippingInfo.city }}, {{ shippingInfo.postalCode }}</p>
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
        
        <div class="form-actions">
          <button @click="goToPreviousStep" class="btn btn-secondary">Atrás</button>
          <button @click="processPayment" class="btn btn-primary" :disabled="isProcessing">
            {{ isProcessing ? 'Procesando...' : 'Confirmar y pagar' }}
          </button>
        </div>
      </div>
      
      <!-- Paso 4: Confirmación -->
      <div v-else class="checkout-step success-message">
        <div class="success-icon">✓</div>
        <h2>¡Pago exitoso!</h2>
        <p>Tu pedido ha sido procesado correctamente.</p>
        <p>Número de orden: #{{ orderNumber }}</p>
        <p>Hemos enviado un correo de confirmación a <strong>{{ guestEmail }}</strong> con los detalles de tu pedido.</p>
        <p class="guest-note">Guarda tu número de orden para consultas futuras.</p>
        <router-link to="/" class="btn btn-primary">Volver al inicio</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { useCarritoStore } from '@/stores/carrito';
import { useAuthStore } from '@/stores/auth';
import StripePaymentForm from '@/components/payment/StripePaymentForm.vue';
import checkoutApi from '@/api/checkout';
import axios from 'axios';

export default {
  name: 'CheckoutView',
  components: {
    StripePaymentForm
  },
  data() {
    const carritoStore = useCarritoStore();
    return {
      carritoStore,
      currentStep: 0,
      steps: ['Envío', 'Pago', 'Revisar', 'Confirmación'],
      shippingInfo: {
        fullName: '',
        address: '',
        city: '',
        postalCode: '',
        phone: ''
      },
      guestEmail: '', // Campo para el email del usuario invitado
      isGuestCheckout: true, // Por defecto usamos checkout como invitado
      paymentMethod: null,
      paymentMethods: [
        { id: 'credit_card', name: 'Tarjeta de crédito', icon: '/icons/credit-card.svg' },
        { id: 'paypal', name: 'PayPal', icon: '/icons/paypal.svg' },
        { id: 'transfer', name: 'Transferencia bancaria', icon: '/icons/bank-transfer.svg' }
      ],
      // Configuración de Stripe desde variables de entorno
      stripeOptions: {
        publishableKey: import.meta.env.VITE_APP_STRIPE_PUBLIC_KEY,
      },
      clientSecret: null,
      paymentStatus: {
        type: '',
        message: ''
      },
      isProcessing: false,
      orderNumber: Math.floor(100000 + Math.random() * 900000)
    }
  },
  computed: {
    // Convertir el total a centavos para Stripe (Stripe usa la menor unidad de la moneda)
    totalAmountForStripe() {
      // Asegurarse de que el total sea un número entero en centavos
      return Math.round(parseFloat(this.total) * 100);
    },
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
  watch: {
    // Cuando se selecciona el método de pago con tarjeta, crear la intención de pago
    async paymentMethod(newMethod) {
      if (newMethod === 'credit_card') {
        await this.createPaymentIntent();
      } else {
        // Limpiar el estado de pago si se cambia a otro método
        this.clientSecret = null;
        this.paymentStatus = { type: '', message: '' };
      }
    }
  },
  methods: {
    // Crear una intención de pago en el servidor
    async createPaymentIntent() {
      if (this.totalAmountForStripe <= 0) {
        this.paymentStatus = {
          type: 'error',
          message: 'El monto del carrito no es válido.'
        };
        return;
      }

      try {
        this.isProcessing = true;
        this.paymentStatus = { type: '', message: '' };
        
        // En una implementación real, esto sería una llamada a tu backend
        // const response = await axios.post('/api/payments/create-payment-intent', {
        //   amount: this.totalAmountForStripe,
        //   currency: 'clp',
        //   metadata: {
        //     orderId: `order_${Date.now()}`,
        //     userType: 'guest',
        //     email: this.guestEmail,
        //     shippingInfo: this.shippingInfo
        //   }
        // });
        
        // Simulamos la respuesta del servidor
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // En producción, usa la respuesta real del servidor:
        // this.clientSecret = response.data.clientSecret;
        
        // Para pruebas, usamos un client secret simulado
        this.clientSecret = 'pi_mock_secret_' + Math.random().toString(36).substr(2, 9);
        
      } catch (error) {
        console.error('Error al crear la intención de pago:', error);
        this.paymentStatus = {
          type: 'error',
          message: 'No se pudo inicializar el procesador de pagos. Por favor, intente nuevamente.'
        };
      } finally {
        this.isProcessing = false;
      }
    },
    
    // Manejar pago exitoso
    async handlePaymentSuccess({ paymentIntent }) {
      console.log('Pago exitoso:', paymentIntent);
      this.paymentStatus = {
        type: 'success',
        message: '¡Pago procesado correctamente! Guardando orden...'
      };
      
      try {
        // Preparar los datos del checkout
        const checkoutData = {
          email: this.guestEmail,
          orderNumber: this.orderNumber.toString(),
          paymentMethod: 'credit_card',
          subtotal: this.subtotal,
          iva: this.iva,
          shippingCost: this.shippingCost,
          total: this.total,
          shippingInfo: this.shippingInfo,
          items: this.cartItems,
          userType: 'guest',
          ip: await this.getUserIP(),
          userAgent: navigator.userAgent
        };
        
        // Procesar el checkout
        const result = await checkoutApi.processGuestCheckout(checkoutData);
        
        if (result.success) {
          // Confirmar el pago en la orden
          await checkoutApi.confirmOrderPayment(this.orderNumber.toString(), {
            transactionId: paymentIntent.id,
            paymentMethod: 'stripe',
            amount: paymentIntent.amount,
            currency: paymentIntent.currency
          });
          
          // Guardar información del pedido
          localStorage.setItem('lastGuestOrder', JSON.stringify({
            orderNumber: this.orderNumber,
            email: this.guestEmail,
            date: new Date().toISOString(),
            orderId: result.orden.id,
            paymentIntentId: paymentIntent.id
          }));
          
          // Avanzar al siguiente paso después de un breve retraso
          setTimeout(() => {
            this.goToNextStep();
            this.carritoStore.vaciarCarrito();
          }, 1500);
        } else {
          throw new Error(result.error || 'Error al guardar la orden');
        }
        
      } catch (error) {
        console.error('Error al guardar la orden:', error);
        this.paymentStatus = {
          type: 'error',
          message: 'El pago fue exitoso pero hubo un error al guardar la orden. Contacta soporte con el ID: ' + paymentIntent.id
        };
      }
    },
    
    // Manejar error en el pago
    handlePaymentError({ error }) {
      console.error('Error en el pago:', error);
      this.paymentStatus = {
        type: 'error',
        message: error || 'Ocurrió un error al procesar el pago. Por favor, intente nuevamente.'
      };
    },
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
    },
    async processPayment() {
      // Si el método de pago es tarjeta, el pago ya se procesó en el componente StripePaymentForm
      if (this.paymentMethod === 'credit_card') {
        // El pago ya se manejó a través de los eventos del componente Stripe
        return;
      }
      
      // Para otros métodos de pago (PayPal, transferencia, etc.)
      this.isProcessing = true;
      try {
        // Preparar los datos del pedido para un usuario invitado
        const checkoutData = {
          email: this.guestEmail,
          orderNumber: this.orderNumber.toString(),
          paymentMethod: this.paymentMethod,
          subtotal: this.subtotal,
          iva: this.iva,
          shippingCost: this.shippingCost,
          total: this.total,
          shippingInfo: this.shippingInfo,
          items: this.cartItems,
          userType: 'guest',
          ip: await this.getUserIP(),
          userAgent: navigator.userAgent
        };
        
        // Procesar el checkout usando la API de Strapi
        const result = await checkoutApi.processGuestCheckout(checkoutData);
        
        if (result.success) {
          // Guardar información del pedido en localStorage para referencia futura
          localStorage.setItem('lastGuestOrder', JSON.stringify({
            orderNumber: this.orderNumber,
            email: this.guestEmail,
            date: new Date().toISOString(),
            orderId: result.orden.id
          }));
          
          // Si todo sale bien, avanzamos al paso de confirmación
          this.goToNextStep();
          
          // Limpiar el carrito después de una compra exitosa
          this.carritoStore.vaciarCarrito();
        } else {
          throw new Error(result.error || 'Error al procesar la orden');
        }
        
      } catch (error) {
        console.error('Error al procesar el pago:', error);
        this.paymentStatus = {
          type: 'error',
          message: error.message || 'Hubo un error al procesar tu pago. Por favor, inténtalo de nuevo.'
        };
      } finally {
        this.isProcessing = false;
      }
    },
    // Obtener IP del usuario (opcional)
    async getUserIP() {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.log('No se pudo obtener la IP del usuario');
        return null;
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
}

.order-item img {
  width: 80px;
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
