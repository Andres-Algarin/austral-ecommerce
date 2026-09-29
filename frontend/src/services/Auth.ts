import api from "../api/axios";

interface LoginData {
  correo: string;
  password: string;
}

interface LoginResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  usuario: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    correo: string;
    rol: string;
    estado: boolean;
  };
}

export const login = async (
  datos: LoginData
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", datos);

  return response.data;
};

// Revoca el refresh token en el servidor.
export const logout = async (refreshToken: string) => {
  const response = await api.post<{ message: string }>("/auth/logout", {
    refresh_token: refreshToken,
  });

  return response.data;
};

interface RegisterData {
  nombre: string;
  apellido: string;
  cedula: string;
  correo: string;
  telefono: string;
  password: string;
}

interface RegisterResponse {
  message: string;
  usuario: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    correo: string;
    rol: string;
    estado: boolean;
  };
}

export const register = async (
  datos: RegisterData
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>(
    "/auth/register",
    datos
  );

  return response.data;
};

// Envía el correo con el enlace de recuperación.
export const forgotPassword = async (correo: string) => {
  const response = await api.post<{ message: string }>(
    "/auth/forgot-password",
    { correo }
  );

  return response.data;
};

// "token" viene en el enlace: /restablecer-contrasena?token=...
export const resetPassword = async (token: string, password: string) => {
  const response = await api.post<{ message: string }>(
    "/auth/reset-password",
    { token, password }
  );

  return response.data;
};
