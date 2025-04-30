// src/api/product.js
import axios from './index';

export default {
  async fetchProducts() {
    try {
      const response = await axios.get('/productos?populate=*');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  async fetchProductById(productId) {
    try {
      const response = await axios.get(`/productos/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },
  async createProduct(productData) {
    try {
      const response = await axios.post('/productos', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  async updateProduct(productId, productData) {
    try {
      const response = await axios.put(`/productos/${productId}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },
  async deleteProduct(productId) {
    try {
      await axios.delete(`/productos/${productId}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};
