import api from "../api/axios";

export interface Categoria {
  id_categoria: number;
  nombre: string;
  imagen: string | null;
  estado: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface CrearCategoriaData {
  nombre: string;
  imagen?: File | null;
}

export interface ActualizarCategoriaData {
  nombre?: string;
  imagen?: File | null;
  estado?: boolean;
}

export const getCategories = async (): Promise<Categoria[]> => {
  const response = await api.get<Categoria[]>("/categories");

  return response.data;
};

// Solo admin: incluye categorías inactivas.
export const getAdminCategories = async (): Promise<Categoria[]> => {
  const response = await api.get<Categoria[]>("/categories/admin/all");

  return response.data;
};

export const getCategory = async (
  id: number
): Promise<Categoria> => {
  const response = await api.get<Categoria>(
    `/categories/${id}`
  );

  return response.data;
};

export const createCategory = async (
  datos: CrearCategoriaData
): Promise<Categoria> => {
  const formData = new FormData();

  formData.append("nombre", datos.nombre);

  if (datos.imagen) {
    formData.append("imagen", datos.imagen);
  }

  const response = await api.post<Categoria>(
    "/categories",
    formData
  );

  return response.data;
};

export const updateCategory = async (
  id: number,
  datos: ActualizarCategoriaData
): Promise<Categoria> => {
  const formData = new FormData();

  if (datos.nombre !== undefined) {
    formData.append("nombre", datos.nombre);
  }

  if (datos.estado !== undefined) {
    formData.append("estado", String(datos.estado));
  }

  if (datos.imagen) {
    formData.append("imagen", datos.imagen);
  }

  const response = await api.patch<Categoria>(
    `/categories/${id}`,
    formData
  );

  return response.data;
};

export const deleteCategory = async (
  id: number
) => {
  const response = await api.delete(
    `/categories/${id}`
  );

  return response.data;
};