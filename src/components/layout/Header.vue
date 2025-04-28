<template>
    <header class="header">
      <div class="top-bar">
        <span>PAGA HASTA 3 CUOTAS CON DÉBITO</span>
      </div>
      <div class="main-header">
        <div class="social-icons">
          <i class="fab fa-instagram"></i>
          <i class="fab fa-tiktok"></i>
          <i class="fab fa-pinterest"></i>
        </div>
        <div class="logo">
          <h1>La Lira</h1>
        </div>
        <div class="account-cart">
          <a href="#">Cuenta</a>
          <router-link to="/carrito" class="cart-link">
            Carrito
            <span v-if="carrito.cantidadTotal > 0" class="cart-count">({{ carrito.cantidadTotal }})</span>
            <span v-else class="cart-empty">(vacío)</span>
          </router-link>
        </div>
      </div>
      <nav class="nav-bar">
        <a href="#">Pasquines</a>
        <a href="#">Accesorios</a>
        <a href="#">Libros</a>
        <a href="#">Cómo usar tu Pasquín</a>
      </nav>
    </header>
  </template>
  
  <script>
  import { useCarritoStore } from '@/stores/carrito';
  import { computed } from 'vue';

  export default {
    name: 'Header',
    setup() {
      const carrito = useCarritoStore();
      return {
        carrito
      };
    }
  }
  </script>
  
  <style scoped>
  .header {
    text-align: center;
  }
  
  .top-bar {
    background-color: pink;
    padding: 5px 0;
  }
  
  .main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border-bottom: 1px solid #ddd;
  }
  
  .social-icons i {
    margin: 0 5px;
  }
  
  .logo h1 {
    font-family: 'Arial', sans-serif;
  }
  
  .account-cart a {
    margin: 0 10px;
    text-decoration: none;
    color: black;
  }
  
  .nav-bar {
    display: flex;
    justify-content: center;
    padding: 10px 0;
  }
  
  .nav-bar a {
    margin: 0 15px;
    text-decoration: none;
    color: black;
  }

  svg:not(:host).svg-inline--fa, svg:not(:root).svg-inline--fa {
    overflow: visible;
    box-sizing: content-box;
    margin: 0 5px;
}
  </style>
  