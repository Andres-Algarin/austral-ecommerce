import api from "../api/axios";

export interface ImagenProducto {
  id_imagen: number;
  id_producto: number;
  url_imagen: string;
  orden: number;
  es_principal: boolean;
}

export const getProductImages = async (
  id_producto: number
): Promise<ImagenProducto[]> => {
  const response = await api.get<ImagenProducto[]>(
    `/product-images/product/${id_producto}`
  );

  return response.data;
};

export const uploadProductImages = async (
  id_producto: number,
  archivos: File[]
): Promise<ImagenProducto[]> => {
  const formData = new FormData();

  archivos.forEach((archivo) => formData.append("imagenes", archivo));

  const response = await api.post<ImagenProducto[]>(
    `/product-images/product/${id_producto}`,
    formData
  );

  return response.data;
};

export const setPrincipalImage = async (
  id_imagen: number
): Promise<ImagenProducto[]> => {
  const response = await api.patch<ImagenProducto[]>(
    `/product-images/${id_imagen}`,
    { es_principal: true }
  );

  return response.data;
};

export const deleteProductImage = async (id_imagen: number) => {
  const response = await api.delete<{ message: string }>(
    `/product-images/${id_imagen}`
  );

  return response.data;
};
