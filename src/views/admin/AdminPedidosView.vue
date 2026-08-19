<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import backendClient from '@/api/backendClient';

const authStore = useAuthStore();

const pedidos = ref([]);
const loading = ref(false);
const error = ref('');
const filtroEstado = ref('');
const busqueda = ref('');
const pedidoSeleccionado = ref(null);
const loadingDetalle = ref(false);
const errorEstado = ref('');

const estados = ['pendiente', 'pagado', 'procesando', 'enviado', 'entregado', 'cancelado', 'rechazado'];

const transiciones = {
  pendiente: ['cancelado'],
  pagado: ['procesando', 'cancelado'],
  procesando: ['enviado', 'cancelado'],
  enviado: ['entregado'],
  entregado: [],
  cancelado: [],
  rechazado: [],
};

const pedidosFiltrados = computed(() => {
  let result = pedidos.value;
  if (filtroEstado.value) {
    result = result.filter(p => p.estado === filtroEstado.value);
  }
  if (busqueda.value) {
    const q = busqueda.value.toLowerCase();
    result = result.filter(p =>
      p.numeroOrden?.toLowerCase().includes(q) ||
      p.emailContacto?.toLowerCase().includes(q)
    );
  }
  return result;
});

async function cargarPedidos() {
  loading.value = true;
  error.value = '';
  try {
    const response = await backendClient.get('/pedidos');
    pedidos.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al cargar pedidos';
  } finally {
    loading.value = false;
  }
}

async function verDetalle(id) {
  loadingDetalle.value = true;
  pedidoSeleccionado.value = null;
  errorEstado.value = '';
  try {
    const response = await backendClient.get(`/pedidos/${id}`);
    pedidoSeleccionado.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al cargar detalle';
  } finally {
    loadingDetalle.value = false;
  }
}

async function cambiarEstado(nuevoEstado) {
  if (!pedidoSeleccionado.value) return;
  errorEstado.value = '';
  try {
    const response = await backendClient.put(
      `/pedidos/${pedidoSeleccionado.value.id}/estado`,
      { estado: nuevoEstado }
    );
    pedidoSeleccionado.value = response.data;
    await cargarPedidos();
  } catch (err) {
    errorEstado.value = err.response?.data?.message || 'Error al cambiar estado';
  }
}

function cerrarDetalle() {
  pedidoSeleccionado.value = null;
  errorEstado.value = '';
}

function estadoClass(estado) {
  const classes = {
    pendiente: 'estado-pendiente',
    pagado: 'estado-pagado',
    procesando: 'estado-procesando',
    enviado: 'estado-enviado',
    entregado: 'estado-entregado',
    cancelado: 'estado-cancelado',
    rechazado: 'estado-rechazado',
  };
  return classes[estado] || '';
}

function formatearFecha(fecha) {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function formatearPesos(valor) {
  if (!valor) return '$0';
  return '$' + Number(valor).toLocaleString('es-CL');
}

onMounted(() => {
  cargarPedidos();
});
</script>

<template>
  <div class="admin-pedidos">
    <div class="admin-header">
      <h1>Gestión de Pedidos</h1>
      <div class="admin-user">
        <span>{{ authStore.user?.email }}</span>
        <button @click="authStore.logout()" class="btn-logout">Cerrar sesión</button>
      </div>
    </div>

    <div class="admin-filtros">
      <select v-model="filtroEstado" class="filtro-select">
        <option value="">Todos los estados</option>
        <option v-for="estado in estados" :key="estado" :value="estado">
          {{ estado.charAt(0).toUpperCase() + estado.slice(1) }}
        </option>
      </select>
      <input
        v-model="busqueda"
        type="text"
        placeholder="Buscar por número o email..."
        class="filtro-input"
      >
      <button @click="cargarPedidos" class="btn-refresh">Actualizar</button>
    </div>

    <div v-if="error" class="alert-error">{{ error }}</div>

    <div v-if="loading" class="loading">Cargando pedidos...</div>

    <div v-else-if="pedidosFiltrados.length === 0" class="empty">
      No hay pedidos que coincidan con los filtros.
    </div>

    <div v-else class="tabla-container">
      <table class="tabla-pedidos">
        <thead>
          <tr>
            <th>N° Orden</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pedido in pedidosFiltrados" :key="pedido.id">
            <td class="mono">{{ pedido.numeroOrden }}</td>
            <td>{{ formatearFecha(pedido.fechaOrden) }}</td>
            <td>{{ pedido.emailContacto }}</td>
            <td class="precio">{{ formatearPesos(pedido.total) }}</td>
            <td>
              <span class="estado-badge" :class="estadoClass(pedido.estado)">
                {{ pedido.estado }}
              </span>
            </td>
            <td>
              <button @click="verDetalle(pedido.id)" class="btn-detalle">Ver</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pedidoSeleccionado" class="modal-overlay" @click.self="cerrarDetalle">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Pedido {{ pedidoSeleccionado.numeroOrden }}</h2>
          <button @click="cerrarDetalle" class="btn-cerrar">X</button>
        </div>

        <div v-if="loadingDetalle" class="loading">Cargando detalle...</div>

        <div v-else class="modal-body">
          <div class="detalle-grid">
            <div class="detalle-section">
              <h3>Cliente</h3>
              <p><strong>Email:</strong> {{ pedidoSeleccionado.emailContacto }}</p>
              <p><strong>Fecha:</strong> {{ formatearFecha(pedidoSeleccionado.fechaOrden) }}</p>
              <p><strong>Estado:</strong>
                <span class="estado-badge" :class="estadoClass(pedidoSeleccionado.estado)">
                  {{ pedidoSeleccionado.estado }}
                </span>
              </p>
              <p v-if="pedidoSeleccionado.fechaPago">
                <strong>Fecha pago:</strong> {{ formatearFecha(pedidoSeleccionado.fechaPago) }}
              </p>
            </div>

            <div class="detalle-section">
              <h3>Envío</h3>
              <div v-if="pedidoSeleccionado.direccionEnvio">
                <p>{{ pedidoSeleccionado.direccionEnvio.nombreCompleto }}</p>
                <p>{{ pedidoSeleccionado.direccionEnvio.calle }}</p>
                <p>{{ pedidoSeleccionado.direccionEnvio.ciudad }}, {{ pedidoSeleccionado.direccionEnvio.comuna }}</p>
                <p>{{ pedidoSeleccionado.direccionEnvio.region }}</p>
                <p>Tel: {{ pedidoSeleccionado.direccionEnvio.telefono }}</p>
              </div>
            </div>
          </div>

          <div class="detalle-section">
            <h3>Productos</h3>
            <table class="tabla-items">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in pedidoSeleccionado.items" :key="item.id">
                  <td>{{ item.productoNombre }}</td>
                  <td class="center">{{ item.cantidad }}</td>
                  <td class="precio">{{ formatearPesos(item.precioUnitario) }}</td>
                  <td class="precio">{{ formatearPesos(item.subtotal) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="detalle-totales">
            <p><strong>Subtotal:</strong> {{ formatearPesos(pedidoSeleccionado.subtotal) }}</p>
            <p><strong>IVA (19%):</strong> {{ formatearPesos(pedidoSeleccionado.iva) }}</p>
            <p><strong>Envío:</strong> {{ formatearPesos(pedidoSeleccionado.costoEnvio) }}</p>
            <p class="total"><strong>Total:</strong> {{ formatearPesos(pedidoSeleccionado.total) }}</p>
          </div>

          <div v-if="pedidoSeleccionado.pagoTransbank" class="detalle-section">
            <h3>Pago Transbank</h3>
            <p><strong>Estado:</strong> {{ pedidoSeleccionado.pagoTransbank.estado }}</p>
            <p><strong>Monto:</strong> {{ formatearPesos(pedidoSeleccionado.pagoTransbank.monto) }}</p>
            <p v-if="pedidoSeleccionado.pagoTransbank.codigoAutorizacion">
              <strong>Cód. autorización:</strong> {{ pedidoSeleccionado.pagoTransbank.codigoAutorizacion }}
            </p>
            <p v-if="pedidoSeleccionado.pagoTransbank.tipoPago">
              <strong>Tipo pago:</strong> {{ pedidoSeleccionado.pagoTransbank.tipoPago }}
            </p>
          </div>

          <div class="detalle-acciones">
            <h3>Cambiar estado</h3>
            <div class="btn-estados">
              <button
                v-for="estado in (transiciones[pedidoSeleccionado.estado] || [])"
                :key="estado"
                @click="cambiarEstado(estado)"
                class="btn-estado"
              >
                {{ estado.charAt(0).toUpperCase() + estado.slice(1) }}
              </button>
              <span v-if="!transiciones[pedidoSeleccionado.estado]?.length" class="no-transiciones">
                No hay transiciones disponibles desde "{{ pedidoSeleccionado.estado }}"
              </span>
            </div>
            <div v-if="errorEstado" class="alert-error">{{ errorEstado }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-pedidos {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.admin-header h1 {
  font-size: 1.5rem;
  color: #333;
}
.admin-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.admin-user span {
  font-size: 0.9rem;
  color: #666;
}
.btn-logout {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}
.btn-logout:hover {
  background: #c0392b;
}
.admin-filtros {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.filtro-select, .filtro-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}
.filtro-input {
  flex: 1;
}
.btn-refresh {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}
.btn-refresh:hover {
  background: #1a252f;
}
.alert-error {
  background: #fee;
  color: #c0392b;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
.loading, .empty {
  text-align: center;
  padding: 2rem;
  color: #888;
}
.tabla-container {
  overflow-x: auto;
}
.tabla-pedidos {
  width: 100%;
  border-collapse: collapse;
}
.tabla-pedidos th {
  background: #f5f5f5;
  padding: 0.75rem;
  text-align: left;
  font-size: 0.85rem;
  color: #555;
  border-bottom: 2px solid #ddd;
}
.tabla-pedidos td {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
}
.mono {
  font-family: monospace;
  font-size: 0.85rem;
}
.precio {
  text-align: right;
}
.estado-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}
.estado-pendiente { background: #fff3cd; color: #856404; }
.estado-pagado { background: #d4edda; color: #155724; }
.estado-procesando { background: #cce5ff; color: #004085; }
.estado-enviado { background: #d1ecf1; color: #0c5460; }
.estado-entregado { background: #d4edda; color: #155724; }
.estado-cancelado { background: #f8d7da; color: #721c24; }
.estado-rechazado { background: #f8d7da; color: #721c24; }
.btn-detalle {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}
.btn-detalle:hover {
  background: #2980b9;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #eee;
}
.modal-header h2 {
  font-size: 1.2rem;
  margin: 0;
}
.btn-cerrar {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #999;
}
.btn-cerrar:hover {
  color: #333;
}
.modal-body {
  padding: 1.5rem;
}
.detalle-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.detalle-section h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #555;
}
.detalle-section p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}
.tabla-items {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
}
.tabla-items th {
  background: #f9f9f9;
  padding: 0.5rem;
  text-align: left;
  font-size: 0.8rem;
}
.tabla-items td {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
  font-size: 0.85rem;
}
.center { text-align: center; }
.detalle-totales {
  border-top: 1px solid #eee;
  padding-top: 1rem;
  margin-bottom: 1.5rem;
}
.detalle-totales p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  text-align: right;
}
.detalle-totales .total {
  font-size: 1.1rem;
  border-top: 1px solid #ddd;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}
.detalle-acciones h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}
.btn-estados {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.btn-estado {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}
.btn-estado:hover {
  background: #1a252f;
}
.no-transiciones {
  color: #888;
  font-size: 0.85rem;
}
@media (max-width: 700px) {
  .detalle-grid {
    grid-template-columns: 1fr;
  }
}
</style>
