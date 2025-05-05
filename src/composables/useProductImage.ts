import { ref } from 'vue';
import type { Ref } from 'vue';

import type { Imagen } from '@/types/producto';



// El hook useProductImage nos permite manejar las imagenes de un producto
// Recibe un array de objetos tipo Image, que contiene la url de la imagen
// y opcionalmente una url de una imagen peque a (smallUrl)
// 
// El hook devuelve 3 valores
//   - mainImage, que es un ref que contiene la url de la imagen principal del producto
//   - setMainImage, que es una funcion que permite cambiar la imagen principal
//   - handleImageError, que es una funcion que se encarga de mostrar una imagen de fallback en caso de error
//   - updateImagesFromProduct, que es una funcion que permite actualizar las imagenes del producto

// Espera un array de objetos con { url, smallUrl, originalUrl }
const BASE_URL = "http://localhost:1337";

function makeAbsolute(url: string) {
  if (!url) return '';
  return url.startsWith('http') ? url : BASE_URL + url;
}

export function useProductImage(initialImages: { url: string; smallUrl: string; originalUrl: string }[] = []) {
  const mainImage = ref<string>(initialImages.length ? makeAbsolute(initialImages[0].originalUrl) : '');
  const fallbackImage = '/assets/images/no-image.jpg';

  const setMainImage = (url: string) => {
    mainImage.value = makeAbsolute(url);
  };

  const handleImageError = (event: Event) => {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = fallbackImage;
  };

  const updateImagesFromProduct = (images: { url: string; smallUrl: string; originalUrl: string }[]) => {
    if (images && images.length > 0) {
      mainImage.value = makeAbsolute(images[0].originalUrl);
    }
  };

  return {
    mainImage,
    setMainImage,
    handleImageError,
    updateImagesFromProduct,
  };
}
