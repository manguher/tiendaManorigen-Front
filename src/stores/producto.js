// src/stores/producto.js
import { defineStore } from 'pinia';
import productApi from '../api/producto';

const baseUrl = import.meta.env.VITE_APP_STRAPI_BASE_URL;
console.log('BASE URL', baseUrl);

export const useProductoStore = defineStore('producto', {
  state: () => ({
    products: [],
    product: null,
    loading: false,
    error: null
  }),
  actions: {
    async fetchProducts() {
      this.loading = true;
      this.error = null;
      try {
        const products = await productApi.fetchProducts();
        const listProducts = products.data.map(item => {
          // Extrae los atributos
          const { id } = item;
          const { nombre, descripcion, precio, stock, createdAt, updatedAt, publishedAt, imagenes } = item.attributes;
          // Extrae las URLs de las imágenes
          const imageDetails = imagenes?.data.map(img => {
            const { url, formats } = img.attributes;
            return {
              url: `${baseUrl}${url}`,
              thumbnailUrl: formats?.thumbnail ? `${baseUrl}${formats.thumbnail.url}` : null,
              smallUrl: formats?.small ? `${baseUrl}${formats.small.url}` : null,
            };
          }) || [];
          // Retorna el objeto con las imágenes incluidas
          return {
            id,
            nombre,
            descripcion,
            precio,
            stock,
            createdAt,
            updatedAt,
            publishedAt,
            images: imageDetails // Incluye los detalles de las imágenes
          };
        });
        this.products = listProducts;
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    async fetchProductById(productId) {
      this.loading = true;
      this.error = null;
      try {
        const product = await productApi.fetchProductById(productId);
        this.product = product;
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    async createProduct(productData) {
      this.loading = true;
      this.error = null;
      try {
        const newProduct = await productApi.createProduct(productData);
        this.products.push(newProduct);
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    async updateProduct({ productId, productData }) {
      this.loading = true;
      this.error = null;
      try {
        const updatedProduct = await productApi.updateProduct(productId, productData);
        const index = this.products.findIndex(product => product.id === updatedProduct.id);
        if (index !== -1) {
          this.products.splice(index, 1, updatedProduct);
        }
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    },
    async deleteProduct(productId) {
      this.loading = true;
      this.error = null;
      try {
        await productApi.deleteProduct(productId);
        this.products = this.products.filter(product => product.id !== productId);
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    }
  }
});
