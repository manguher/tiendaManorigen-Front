<template>
    <footer>
      <div class="footer-content">
        <p>&copy; 2024 Mi Tienda. Todos los derechos reservados.</p>
        <ul>
          <li><a href="/privacy-policy">Política de Privacidad</a></li>
          <li><a href="/terms-of-service">Términos del Servicio</a></li>
          <li><a href="/contact">Contacto</a></li>
        </ul>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    name: 'Footer'
  }
  </script>
  
  <style scoped>
  footer {
    padding: 1rem;
    background-color: #333;
    color: #fff;
    text-align: center;
  }
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  li {
    display: inline;
    margin: 0 0.5rem;
  }
  
  a {
    color: #fff;
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }
  </style>
  