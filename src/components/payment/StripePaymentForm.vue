<template>
  <div class="stripe-payment-form">
    <form id="payment-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="card-element">
          Tarjeta de crédito o débito
        </label>
        <div id="card-element" class="form-control">
          <!-- Stripe Elements will be inserted here -->
        </div>
        <div id="card-errors" class="error-message" role="alert">
          {{ errorMessage }}
        </div>
      </div>
      
      <button 
        type="submit" 
        class="btn btn-primary w-100"
        :disabled="isProcessing || !stripe || !elements"
      >
        <span v-if="isProcessing" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        {{ isProcessing ? 'Procesando pago...' : `Pagar $${amount}` }}
      </button>
    </form>
  </div>
</template>

<script>
import { loadStripe } from '@stripe/stripe-js';
import { ref, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'StripePaymentForm',
  props: {
    amount: {
      type: Number,
      required: true
    },
    publishableKey: {
      type: String,
      required: true
    },
    clientSecret: {
      type: String,
      required: true
    }
  },
  emits: ['payment-success', 'payment-error'],
  setup(props, { emit }) {
    const stripe = ref(null);
    const elements = ref(null);
    const cardElement = ref(null);
    const isProcessing = ref(false);
    const errorMessage = ref('');

    // Inicializar Stripe
    const initializeStripe = async () => {
      try {
        stripe.value = await loadStripe(props.publishableKey);
        elements.value = stripe.value.elements();
        
        // Crear elemento de tarjeta
        const card = elements.value.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#32325d',
              '::placeholder': {
                color: '#aab7c4'
              }
            },
            invalid: {
              color: '#fa755a',
              iconColor: '#fa755a'
            }
          }
        });
        
        cardElement.value = card;
        card.mount('#card-element');
        
        // Manejar errores de validación en tiempo real
        card.on('change', (event) => {
          errorMessage.value = event.error ? event.error.message : '';
        });
        
      } catch (error) {
        console.error('Error al inicializar Stripe:', error);
        emit('payment-error', { error: 'No se pudo inicializar el procesador de pagos' });
      }
    };

    // Manejar el envío del formulario
    const handleSubmit = async () => {
      if (!stripe.value || !elements.value) {
        return;
      }
      
      isProcessing.value = true;
      errorMessage.value = '';
      
      try {
        const { error, paymentIntent } = await stripe.value.confirmCardPayment(
          props.clientSecret,
          {
            payment_method: {
              card: cardElement.value,
              billing_details: {
                // Aquí podrías agregar más detalles del cliente
                // name: 'Nombre del cliente',
                // email: 'cliente@ejemplo.com'
              }
            }
          }
        );
        
        if (error) {
          errorMessage.value = error.message || 'Error al procesar el pago';
          emit('payment-error', { error: error.message });
        } else if (paymentIntent.status === 'succeeded') {
          emit('payment-success', { paymentIntent });
        }
      } catch (error) {
        console.error('Error al procesar el pago:', error);
        errorMessage.value = 'Ocurrió un error al procesar el pago';
        emit('payment-error', { error: error.message });
      } finally {
        isProcessing.value = false;
      }
    };

    // Inicializar cuando el componente se monte
    onMounted(() => {
      initializeStripe();
    });

    // Limpiar cuando el componente se desmonte
    onBeforeUnmount(() => {
      if (cardElement.value) {
        cardElement.value.destroy();
      }
    });

    return {
      stripe,
      elements,
      isProcessing,
      errorMessage,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.stripe-payment-form {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 46px;
  background-color: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  border-color: #1976d2;
  outline: none;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  min-height: 1.25rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-primary {
  color: white;
  background-color: #1976d2;
  border-color: #1976d2;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1565c0;
  border-color: #1461b8;
}

.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  background-color: #90caf9;
  border-color: #90caf9;
}

.w-100 {
  width: 100%;
}

.spinner-border {
  display: inline-block;
  width: 1rem;
  height: 1rem;
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
</style>
