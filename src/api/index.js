import axios from 'axios';

// Cliente Axios para Strapi (solo catálogo de productos)
const strapiClient = axios.create({
  baseURL: import.meta.env.VITE_APP_STRAPI_BASE_URL 
    ? `${import.meta.env.VITE_APP_STRAPI_BASE_URL}/api` 
    : 'http://localhost:1337/api',
});

export default strapiClient;