export interface Formato {
  id: number;
  nombre: string;
  codigo: string;
  schema: any;
  activo: boolean;
}

export interface ImageInfo {
  id: number;
  imagen: string;
  nombre_original: string;
  tamano: number;
  subida_en: string;
}

export interface LocalImage {
  uri: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}