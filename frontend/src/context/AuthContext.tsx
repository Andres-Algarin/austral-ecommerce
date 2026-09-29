import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { login, logout } from "../services/Auth";
import {
  SESSION_EXPIRED_EVENT,
  SESSION_KEYS,
  clearSession,
} from "../api/axios";

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  estado: boolean;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  iniciarSesion: (correo: string, password: string) => Promise<void>;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): ReactNode {
  // Se lee al crear el estado (no en un efecto) para que, al recargar
  // una ruta protegida, la sesión ya exista en el primer render.
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(SESSION_KEYS.accessToken)
  );

  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const usuarioGuardado = localStorage.getItem(SESSION_KEYS.usuario);

    if (!usuarioGuardado || !localStorage.getItem(SESSION_KEYS.accessToken)) {
      return null;
    }

    try {
      return JSON.parse(usuarioGuardado) as Usuario;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // Si la sesión expira (no se pudo renovar el token),
    // axios avisa con este evento.
    const alExpirar = () => {
      setUsuario(null);
      setToken(null);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, alExpirar);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, alExpirar);
    };
  }, []);

  const iniciarSesion = async (correo: string, password: string) => {
    const respuesta = await login({
      correo,
      password,
    });

    localStorage.setItem(
      SESSION_KEYS.usuario,
      JSON.stringify(respuesta.usuario)
    );

    localStorage.setItem(
      SESSION_KEYS.accessToken,
      respuesta.access_token
    );

    localStorage.setItem(
      SESSION_KEYS.refreshToken,
      respuesta.refresh_token
    );

    setUsuario(respuesta.usuario);
    setToken(respuesta.access_token);
  };

  const cerrarSesion = () => {
    const refreshToken = localStorage.getItem(SESSION_KEYS.refreshToken);

    if (refreshToken) {
      // Si falla (p. ej. sin conexión), igual se cierra la sesión local.
      logout(refreshToken).catch(() => undefined);
    }

    clearSession();

    setUsuario(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        iniciarSesion,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }

  return context;
}
