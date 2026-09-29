import api from "../api/axios";

export interface UsuarioPerfil {
  id_usuario: number;
  nombre: string;
  apellido: string;
  cedula: string;
  correo: string;
  telefono: string;
  rol: string;
  estado: boolean;
}

export interface UpdateUserData {
  nombre?: string;
  apellido?: string;
  telefono?: string;
}

interface UpdateProfileResponse {
  message: string;
  usuario: UsuarioPerfil;
}

export const getProfile = async (): Promise<UsuarioPerfil> => {
  const response = await api.get<UsuarioPerfil>("/users/profile");

  return response.data;
};

export const updateProfile = async (
  datos: UpdateUserData
): Promise<UsuarioPerfil> => {
  const response = await api.patch<UpdateProfileResponse>(
    "/users/profile",
    datos
  );

  return response.data.usuario;
};