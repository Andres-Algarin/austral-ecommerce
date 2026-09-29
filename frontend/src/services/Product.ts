import api from "../api/axios";

export interface Producto {
  id_producto: number;
  id_categoria: number;
  nombre: string;
  descripcion: string;
  beneficios: string;
  ingredientes: string;
  modo_uso: string;
  precio: number;
  stock: number;
  imagen_principal: string | null;
  estado: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  // Galería (solo viene en el detalle: GET /products/:id).
  imagenes?: {
    id_imagen: number;
    url_imagen: string;
    orden: number;
    es_principal: boolean;
  }[];
  category?: {
    id_categoria: number;
    nombre: string;
    imagen: string | null;
    estado: boolean;
    fecha_creacion: string;
    fecha_actualizacion: string;
  };
}

export interface CrearProductoData {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
  beneficios?: string;
  ingredientes?: string;
  modo_uso?: string;
  precio: number;
  stock: number;
  estado?: boolean;
  imagen_principal?: File | null;
}

export interface ActualizarProductoData {
  id_categoria?: number;
  nombre?: string;
  descripcion?: string;
  beneficios?: string;
  ingredientes?: string;
  modo_uso?: string;
  precio?: number;
  stock?: number;
  estado?: boolean;
  imagen_principal?: File | null;
}

export interface FiltrosProductos {
  categoria?: number;
  q?: string;
  min_precio?: number;
  max_precio?: number;
  en_stock?: boolean;
  orden?: "recientes" | "precio_asc" | "precio_desc" | "nombre";
  page?: number;
  limit?: number;
}

export interface Paginado<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Catálogo público: solo productos activos, con filtros y paginación.
export const getProducts = async (
  filtros: FiltrosProductos = {}
): Promise<Paginado<Producto>> => {
  const response =
    await api.get<Paginado<Producto>>("/products", {
      params: filtros,
    });

  return response.data;
};

// Solo admin: incluye productos inactivos.
export const getAdminProducts = async (): Promise<Producto[]> => {
  const response =
    await api.get<Producto[]>("/products/admin/all");

  return response.data;
};

export const getProduct = async (
  id: number
): Promise<Producto> => {
  const response =
    await api.get<Producto>(
      `/products/${id}`
    );

  return response.data;
};

export const createProduct = async (
  datos: CrearProductoData
): Promise<Producto> => {
  const formData = new FormData();

  formData.append(
    "id_categoria",
    String(datos.id_categoria)
  );

  formData.append(
    "nombre",
    datos.nombre
  );

  formData.append(
    "descripcion",
    datos.descripcion ?? ""
  );

  formData.append(
    "beneficios",
    datos.beneficios ?? ""
  );

  formData.append(
    "ingredientes",
    datos.ingredientes ?? ""
  );

  formData.append(
    "modo_uso",
    datos.modo_uso ?? ""
  );

  formData.append(
    "precio",
    String(datos.precio)
  );

  formData.append(
    "stock",
    String(datos.stock)
  );

  if (datos.estado !== undefined) {
    formData.append("estado", String(datos.estado));
  }

  if (datos.imagen_principal) {
    formData.append(
      "imagen_principal",
      datos.imagen_principal
    );
  }

  const response =
    await api.post<Producto>(
      "/products",
      formData
    );

  return response.data;
};

export const updateProduct = async (
  id: number,
  datos: ActualizarProductoData
): Promise<Producto> => {
  const formData = new FormData();

  if (datos.id_categoria !== undefined) {
    formData.append(
      "id_categoria",
      String(datos.id_categoria)
    );
  }

  if (datos.nombre !== undefined) {
    formData.append(
      "nombre",
      datos.nombre
    );
  }

  if (datos.descripcion !== undefined) {
    formData.append(
      "descripcion",
      datos.descripcion
    );
  }

  if (datos.beneficios !== undefined) {
    formData.append(
      "beneficios",
      datos.beneficios
    );
  }

  if (datos.ingredientes !== undefined) {
    formData.append(
      "ingredientes",
      datos.ingredientes
    );
  }

  if (datos.modo_uso !== undefined) {
    formData.append(
      "modo_uso",
      datos.modo_uso
    );
  }

  if (datos.precio !== undefined) {
    formData.append(
      "precio",
      String(datos.precio)
    );
  }

  if (datos.stock !== undefined) {
    formData.append(
      "stock",
      String(datos.stock)
    );
  }

  if (datos.estado !== undefined) {
    formData.append("estado", String(datos.estado));
  }

  if (datos.imagen_principal) {
    formData.append(
      "imagen_principal",
      datos.imagen_principal
    );
  }

  const response =
    await api.patch<Producto>(
      `/products/${id}`,
      formData
    );

  return response.data;
};

export const deleteProduct = async (
  id: number
): Promise<{ message: string; eliminado: boolean }> => {
  const response =
    await api.delete<{ message: string; eliminado: boolean }>(
      `/products/${id}`
    );

  return response.data;
};
// Cambios rápidos sin imagen (inventario): stock y visibilidad.
export const patchProduct = async (
  id: number,
  datos: { stock?: number; estado?: boolean }
): Promise<Producto> => {
  const response = await api.patch<Producto>(`/products/${id}`, datos);

  return response.data;
};
