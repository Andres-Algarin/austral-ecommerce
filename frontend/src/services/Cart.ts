import api from "../api/axios";
import type { Producto } from "./Product";

export interface ItemCarrito {
  id_detalle_carrito: number;
  id_carrito: number;
  id_producto: number;
  cantidad: number;
  fecha_agregado: string;
  producto: Producto;
}

export const getCartItems = async (): Promise<ItemCarrito[]> => {
  const response = await api.get<ItemCarrito[]>("/cart-details");

  return response.data;
};

export const addToCart = async (
  id_producto: number,
  cantidad: number
): Promise<ItemCarrito> => {
  const response = await api.post<ItemCarrito>("/cart-details", {
    id_producto,
    cantidad,
  });

  return response.data;
};

export const updateCartItem = async (
  id: number,
  cantidad: number
): Promise<ItemCarrito> => {
  const response = await api.patch<ItemCarrito>(`/cart-details/${id}`, {
    cantidad,
  });

  return response.data;
};

export const removeCartItem = async (id: number) => {
  const response = await api.delete<{ message: string }>(
    `/cart-details/${id}`
  );

  return response.data;
};
