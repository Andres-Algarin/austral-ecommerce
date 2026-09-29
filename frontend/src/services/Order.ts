import api from "../api/axios";
import type { Producto } from "./Product";

export const ESTADOS_PEDIDO = [
  "Pendiente",
  "Pagado",
  "Preparando",
  "Enviado",
  "Entregado",
  "Cancelado",
] as const;

export type EstadoPedido = (typeof ESTADOS_PEDIDO)[number];

// Mismas reglas que el backend.
export const TRANSICIONES_PEDIDO: Record<EstadoPedido, EstadoPedido[]> = {
  Pendiente: ["Pagado", "Cancelado"],
  Pagado: ["Preparando", "Cancelado"],
  Preparando: ["Enviado", "Cancelado"],
  Enviado: ["Entregado"],
  Entregado: [],
  Cancelado: [],
};

export interface DetallePedido {
  id_detalle_pedido: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
  producto?: Producto;
}

export interface Pedido {
  id_pedido: number;
  id_usuario: number;
  nombre_receptor: string | null;
  cedula_receptor: string | null;
  telefono_receptor: string | null;
  direccion_envio: string | null;
  ciudad_envio: string | null;
  departamento_envio: string | null;
  id_direccion: number;
  fecha: string;
  fecha_envio: string | null;
  fecha_actualizacion: string;
  estado: EstadoPedido;
  subtotal: string;
  descuento: string;
  costo_envio: string;
  total: string;
  detalles: DetallePedido[];
  // Solo en las rutas de administrador.
  cliente?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string | null;
  } | null;
}

export interface ResumenCheckout {
  items: {
    id_producto: number;
    nombre: string;
    imagen_principal: string | null;
    cantidad: number;
    stock: number;
    precio_unitario: number;
    subtotal: number;
  }[];
  subtotal: number;
  descuento: number;
  costo_envio: number;
  total: number;
  envio_gratis_desde: number | null;
  falta_para_envio_gratis: number | null;
  errores: string[];
  puede_comprar: boolean;
}

export interface CrearPedidoData {
  id_direccion: number;
  nombre_receptor?: string;
  cedula_receptor?: string;
  telefono_receptor?: string;
}

/*
|--------------------------------------------------------------------------
| CLIENTE
|--------------------------------------------------------------------------
*/

export const getCheckoutSummary = async (): Promise<ResumenCheckout> => {
  const response = await api.get<ResumenCheckout>("/orders/checkout/summary");

  return response.data;
};

export const createOrder = async (datos: CrearPedidoData): Promise<Pedido> => {
  const response = await api.post<Pedido>("/orders", datos);

  return response.data;
};

export const getMyOrders = async (): Promise<Pedido[]> => {
  const response = await api.get<Pedido[]>("/orders");

  return response.data;
};

export const getMyOrder = async (id: number): Promise<Pedido> => {
  const response = await api.get<Pedido>(`/orders/${id}`);

  return response.data;
};

export const cancelMyOrder = async (id: number): Promise<Pedido> => {
  const response = await api.patch<Pedido>(`/orders/${id}/cancel`);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| ADMINISTRADOR
|--------------------------------------------------------------------------
*/

export interface EstadisticasAdmin {
  ventas_totales: { monto: number; pedidos: number };
  ventas_ultimos_30_dias: { monto: number; pedidos: number };
  pedidos_por_estado: Record<EstadoPedido, number>;
  pedidos_pendientes: number;
  productos_bajo_stock: {
    id_producto: number;
    nombre: string;
    stock: number;
    imagen_principal: string | null;
  }[];
  umbral_bajo_stock: number;
  total_clientes: number;
  productos_activos: number;
}

export const getAdminOrders = async (
  estado?: EstadoPedido
): Promise<Pedido[]> => {
  const response = await api.get<Pedido[]>("/orders/admin", {
    params: estado ? { estado } : {},
  });

  return response.data;
};

export const getAdminOrder = async (id: number): Promise<Pedido> => {
  const response = await api.get<Pedido>(`/orders/admin/${id}`);

  return response.data;
};

export const updateOrderStatus = async (
  id: number,
  datos: {
    estado?: EstadoPedido;
    descuento?: number;
    costo_envio?: number;
  }
): Promise<Pedido> => {
  const response = await api.patch<Pedido>(
    `/orders/admin/${id}/status`,
    datos
  );

  return response.data;
};

export const getAdminStats = async (): Promise<EstadisticasAdmin> => {
  const response = await api.get<EstadisticasAdmin>("/orders/admin/stats");

  return response.data;
};
