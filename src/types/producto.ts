// Interfaces para imágenes y productos

export interface ImagenFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path: string | null;
  width: number;
  height: number;
  size: number;
  sizeInBytes: number;
  url: string;
}

export interface ImagenAttributes {
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail?: ImagenFormat;
    small?: ImagenFormat;
    medium?: ImagenFormat;
    large?: ImagenFormat;
    [key: string]: ImagenFormat | undefined;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface Imagen {
  id: number;
  attributes: ImagenAttributes;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  imagenes: {
    data: Imagen[];
  };
}
