import api from "../api/axios";

export interface Resena {
  id_resena: number;
  id_producto: number;
  id_usuario: number;
  calificacion: number;
  comentario: string | null;
  fecha: string;
  autor: string;
}

export interface ResenasProducto {
  promedio: number;
  total: number;
  distribucion: Record<number, number>;
  data: Resena[];
}

export interface Elegibilidad {
  puede_resenar: boolean;
  motivo: string | null;
  mi_resena: {
    id_resena: number;
    calificacion: number;
    comentario: string | null;
  } | null;
}

export const getProductReviews = async (
  id_producto: number
): Promise<ResenasProducto> => {
  const response = await api.get<ResenasProducto>(
    `/reviews/product/${id_producto}`
  );

  return response.data;
};

export const getReviewEligibility = async (
  id_producto: number
): Promise<Elegibilidad> => {
  const response = await api.get<Elegibilidad>(
    `/reviews/product/${id_producto}/eligibility`
  );

  return response.data;
};

export const createReview = async (datos: {
  id_producto: number;
  calificacion: number;
  comentario?: string;
}): Promise<Resena> => {
  const response = await api.post<Resena>("/reviews", datos);

  return response.data;
};

export const updateReview = async (
  id: number,
  datos: { calificacion?: number; comentario?: string }
): Promise<Resena> => {
  const response = await api.patch<Resena>(`/reviews/${id}`, datos);

  return response.data;
};
