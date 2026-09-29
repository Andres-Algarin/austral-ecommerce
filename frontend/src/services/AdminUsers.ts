import api from "../api/axios";
import type { Paginado } from "./Product";

export interface Cliente {
  id_usuario: number;
  nombre: string;
  apellido: string;
  cedula: string;
  correo: string;
  telefono: string | null;
  rol: "cliente" | "admin";
  estado: boolean;
  fecha_registro: string;
  fecha_actualizacion: string;
}

export interface FiltrosClientes {
  q?: string;
  rol?: "cliente" | "admin";
  estado?: boolean;
  page?: number;
  limit?: number;
}

export const getUsers = async (
  filtros: FiltrosClientes = {}
): Promise<Paginado<Cliente>> => {
  const response = await api.get<Paginado<Cliente>>("/users", {
    params: filtros,
  });

  return response.data;
};

export const updateUserStatus = async (
  id: number,
  estado: boolean
): Promise<Cliente> => {
  const response = await api.patch<Cliente>(`/users/${id}/status`, {
    estado,
  });

  return response.data;
};

export const updateUserRole = async (
  id: number,
  rol: "cliente" | "admin"
): Promise<Cliente> => {
  const response = await api.patch<Cliente>(`/users/${id}/role`, { rol });

  return response.data;
};
