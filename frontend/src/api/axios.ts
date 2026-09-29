import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
});

/*
|--------------------------------------------------------------------------
| SESIÓN EN localStorage
|--------------------------------------------------------------------------
*/

export const SESSION_KEYS = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  usuario: "usuario",
} as const;

// Evento para que AuthContext se entere cuando la sesión expira.
export const SESSION_EXPIRED_EVENT = "auth:session-expired";

export function clearSession() {
  localStorage.removeItem(SESSION_KEYS.accessToken);
  localStorage.removeItem(SESSION_KEYS.refreshToken);
  localStorage.removeItem(SESSION_KEYS.usuario);
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(SESSION_KEYS.accessToken);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/*
|--------------------------------------------------------------------------
| RENOVACIÓN AUTOMÁTICA DEL ACCESS TOKEN
|--------------------------------------------------------------------------
| El access token dura poco (15 min). Si una petición responde 401,
| se pide uno nuevo con el refresh token y se reintenta una vez.
| Si llegan varias 401 a la vez, todas esperan la misma renovación.
*/

let renovacionEnCurso: Promise<string | null> | null = null;

async function renovarAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(SESSION_KEYS.refreshToken);

  if (!refreshToken) {
    return null;
  }

  try {
    // axios "limpio" para no pasar por estos interceptores.
    const { data } = await axios.post<{
      access_token: string;
      refresh_token: string;
    }>(`${API_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });

    localStorage.setItem(SESSION_KEYS.accessToken, data.access_token);
    localStorage.setItem(SESSION_KEYS.refreshToken, data.refresh_token);

    return data.access_token;
  } catch {
    return null;
  }
}

interface ConfigConReintento extends InternalAxiosRequestConfig {
  _reintentado?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as ConfigConReintento | undefined;

    const esRutaDeAuth = original?.url?.startsWith("/auth/");

    if (
      error.response?.status !== 401 ||
      !original ||
      original._reintentado ||
      esRutaDeAuth
    ) {
      return Promise.reject(error);
    }

    original._reintentado = true;

    renovacionEnCurso ??= renovarAccessToken().finally(() => {
      renovacionEnCurso = null;
    });

    const nuevoToken = await renovacionEnCurso;

    if (!nuevoToken) {
      clearSession();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));

      return Promise.reject(error);
    }

    original.headers.Authorization = `Bearer ${nuevoToken}`;

    return api(original);
  }
);

export default api;
