import { API_URL } from "../api/axios";

/*
|--------------------------------------------------------------------------
| PRECIOS
|--------------------------------------------------------------------------
*/

export function formatPrice(valor: number | string) {
  return `$${Number(valor).toLocaleString("es-CO", {
    maximumFractionDigits: 0,
  })}`;
}

/*
|--------------------------------------------------------------------------
| IMÁGENES DEL BACKEND
|--------------------------------------------------------------------------
| El backend guarda rutas como "/uploads/products/x.png".
*/

export function imageUrl(ruta: string | null | undefined) {
  if (!ruta) {
    return "";
  }

  if (ruta.startsWith("http://") || ruta.startsWith("https://")) {
    return ruta;
  }

  return `${API_URL}/${ruta.replace(/^\/+/, "")}`;
}

/*
|--------------------------------------------------------------------------
| FECHAS
|--------------------------------------------------------------------------
*/

export function formatDate(fecha: string | Date) {
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(fecha: string | Date) {
  return new Date(fecha).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/*
|--------------------------------------------------------------------------
| ERRORES DE LA API
|--------------------------------------------------------------------------
| NestJS devuelve "message" como texto o como lista de textos.
*/

export function apiErrorMessage(error: unknown, porDefecto: string) {
  const mensaje = (
    error as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;

  if (Array.isArray(mensaje)) {
    return mensaje.join(" ");
  }

  return mensaje || porDefecto;
}
