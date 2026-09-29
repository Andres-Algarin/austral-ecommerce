import api from "../api/axios";

export interface Direccion {
  id_direccion: number;
  id_usuario: number;
  alias: string | null;
  direccion: string;
  ciudad: string;
  departamento: string;
  codigo_postal: string | null;
  telefono_contacto: string | null;
  predeterminada: boolean;
  fecha_creacion: string;
}

export interface DireccionData {
  alias?: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  codigo_postal?: string;
  telefono_contacto?: string;
  predeterminada?: boolean;
}

export const getAddresses = async (): Promise<Direccion[]> => {
  const response = await api.get<Direccion[]>("/addresses");

  return response.data;
};

export const createAddress = async (
  datos: DireccionData
): Promise<Direccion> => {
  const response = await api.post<Direccion>("/addresses", datos);

  return response.data;
};

export const deleteAddress = async (id: number) => {
  const response = await api.delete<{ message: string }>(`/addresses/${id}`);

  return response.data;
};
