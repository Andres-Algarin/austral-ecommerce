import { useCallback, useEffect, useState } from "react";
import { Mail, MapPin, Phone, RefreshCw } from "lucide-react";

import OrderBadge from "../../components/OrderBadge/OrderBadge";
import {
  ESTADOS_PEDIDO,
  TRANSICIONES_PEDIDO,
  getAdminOrders,
  getAdminStats,
  updateOrderStatus,
  type EstadisticasAdmin,
  type EstadoPedido,
  type Pedido,
} from "../../services/Order";
import {
  apiErrorMessage,
  formatDateTime,
  formatPrice,
} from "../../utils/format";
import SafeImage from "../../components/SafeImage";

import "./AdminSections.css";

// Texto del botón para cada cambio de estado.
const ACCION: Record<EstadoPedido, string> = {
  Pendiente: "Marcar pendiente",
  Pagado: "Marcar como pagado",
  Preparando: "Empezar preparación",
  Enviado: "Marcar como enviado",
  Entregado: "Marcar como entregado",
  Cancelado: "Cancelar pedido",
};

function AdminOrders() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [stats, setStats] = useState<EstadisticasAdmin | null>(null);
  const [filtro, setFiltro] = useState<EstadoPedido | "">("");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [seleccionado, setSeleccionado] = useState<Pedido | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const [lista, estadisticas] = await Promise.all([
        getAdminOrders(filtro || undefined),
        getAdminStats(),
      ]);

      setPedidos(lista);
      setStats(estadisticas);
    } catch (err) {
      setError(apiErrorMessage(err, "No fue posible cargar los pedidos."));
    } finally {
      setCargando(false);
    }
  }, [filtro]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const texto = busqueda.trim().toLowerCase();

  const visibles = texto
    ? pedidos.filter((p) =>
        [
          String(p.id_pedido),
          p.nombre_receptor,
          p.cliente?.nombre,
          p.cliente?.apellido,
          p.cliente?.correo,
          p.ciudad_envio,
        ]
          .filter(Boolean)
          .some((valor) => String(valor).toLowerCase().includes(texto))
      )
    : pedidos;

  const alActualizar = (actualizado: Pedido) => {
    setSeleccionado(actualizado);
    setPedidos((lista) =>
      lista
        .map((p) => (p.id_pedido === actualizado.id_pedido ? actualizado : p))
        .filter((p) => !filtro || p.estado === filtro)
    );
    getAdminStats().then(setStats).catch(() => undefined);
  };

  return (
    <section className="admin-content">
      <div className="admin-content-header">
        <div>
          <span className="admin-module-label">VENTAS</span>
          <h2>Pedidos</h2>
          <p>Revisa los pedidos y actualiza su estado a medida que avanzan.</p>
        </div>

        <button type="button" className="admin-refresh" onClick={() => void cargar()}>
          <RefreshCw size={15} /> Actualizar
        </button>
      </div>

      {/* ================= INDICADORES ================= */}
      {stats && (
        <div className="admin-stats">
          <div className="admin-stat">
            <span>Ventas totales</span>
            <strong>{formatPrice(stats.ventas_totales.monto)}</strong>
            <small>{stats.ventas_totales.pedidos} pedidos pagados</small>
          </div>

          <div className="admin-stat">
            <span>Últimos 30 días</span>
            <strong>{formatPrice(stats.ventas_ultimos_30_dias.monto)}</strong>
            <small>{stats.ventas_ultimos_30_dias.pedidos} pedidos</small>
          </div>

          <div className="admin-stat admin-stat--highlight">
            <span>Por confirmar pago</span>
            <strong>{stats.pedidos_pendientes}</strong>
            <small>pedidos pendientes</small>
          </div>

          <div className="admin-stat">
            <span>Clientes</span>
            <strong>{stats.total_clientes}</strong>
            <small>registrados</small>
          </div>
        </div>
      )}

      {/* ================= FILTROS ================= */}
      <div className="admin-toolbar">
        <div className="admin-chips">
          <button
            type="button"
            className={"admin-chip" + (filtro === "" ? " admin-chip--active" : "")}
            onClick={() => setFiltro("")}
          >
            Todos
          </button>

          {ESTADOS_PEDIDO.map((estado) => (
            <button
              key={estado}
              type="button"
              className={"admin-chip" + (filtro === estado ? " admin-chip--active" : "")}
              onClick={() => setFiltro(estado)}
            >
              {estado}
              {stats && stats.pedidos_por_estado[estado] > 0 && (
                <em>{stats.pedidos_por_estado[estado]}</em>
              )}
            </button>
          ))}
        </div>

        <input
          type="search"
          className="admin-search"
          placeholder="Buscar por #, cliente o ciudad"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {error && <div className="admin-error">{error}</div>}

      {/* ================= LISTA ================= */}
      {cargando && pedidos.length === 0 ? (
        <div className="admin-status">Cargando pedidos...</div>
      ) : visibles.length === 0 ? (
        <div className="admin-status">
          {filtro || texto ? "No hay pedidos con esos filtros." : "Aún no hay pedidos."}
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th className="admin-table-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {visibles.map((pedido) => (
                <tr
                  key={pedido.id_pedido}
                  className="admin-table-clickable"
                  onClick={() => setSeleccionado(pedido)}
                >
                  <td>
                    <strong>#{pedido.id_pedido}</strong>
                  </td>
                  <td>
                    <span className="admin-cell-main">
                      {pedido.cliente
                        ? `${pedido.cliente.nombre} ${pedido.cliente.apellido}`
                        : pedido.nombre_receptor}
                    </span>
                    <span className="admin-cell-sub">{pedido.ciudad_envio}</span>
                  </td>
                  <td className="admin-cell-sub">{formatDateTime(pedido.fecha)}</td>
                  <td>
                    <OrderBadge estado={pedido.estado} />
                  </td>
                  <td className="admin-table-right">
                    <strong>{formatPrice(pedido.total)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {seleccionado && (
        <OrderModal
          pedido={seleccionado}
          onClose={() => setSeleccionado(null)}
          onUpdated={alActualizar}
        />
      )}
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| DETALLE DEL PEDIDO
|--------------------------------------------------------------------------
*/

interface OrderModalProps {
  pedido: Pedido;
  onClose: () => void;
  onUpdated: (pedido: Pedido) => void;
}

function OrderModal({ pedido, onClose, onUpdated }: OrderModalProps) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [confirmarCancelar, setConfirmarCancelar] = useState(false);

  const [descuento, setDescuento] = useState(String(Number(pedido.descuento)));
  const [envio, setEnvio] = useState(String(Number(pedido.costo_envio)));

  const siguientes = TRANSICIONES_PEDIDO[pedido.estado];
  const avanzar = siguientes.filter((e) => e !== "Cancelado");
  const puedeCancelar = siguientes.includes("Cancelado");

  const cambiar = async (datos: Parameters<typeof updateOrderStatus>[1]) => {
    setGuardando(true);
    setError("");

    try {
      onUpdated(await updateOrderStatus(pedido.id_pedido, datos));
      setConfirmarCancelar(false);
    } catch (err) {
      setError(apiErrorMessage(err, "No fue posible actualizar el pedido."));
    } finally {
      setGuardando(false);
    }
  };

  const valoresCambiaron =
    Number(descuento) !== Number(pedido.descuento) ||
    Number(envio) !== Number(pedido.costo_envio);

  return (
    <div className="admin-modal-overlay" onMouseDown={onClose}>
      <div
        className="admin-modal admin-order-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div>
            <span className="admin-module-label">{formatDateTime(pedido.fecha)}</span>
            <h2>Pedido #{pedido.id_pedido}</h2>
          </div>

          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="admin-order-status">
          <OrderBadge estado={pedido.estado} />
          {pedido.fecha_envio && (
            <span className="admin-cell-sub">Enviado el {formatDateTime(pedido.fecha_envio)}</span>
          )}
        </div>

        {/* ---------- Cliente y envío ---------- */}
        <div className="admin-order-grid">
          <div className="admin-order-box">
            <span className="admin-order-box-title">Cliente</span>
            {pedido.cliente ? (
              <>
                <strong>
                  {pedido.cliente.nombre} {pedido.cliente.apellido}
                </strong>
                <a href={`mailto:${pedido.cliente.correo}`}>
                  <Mail size={14} /> {pedido.cliente.correo}
                </a>
                {pedido.cliente.telefono && (
                  <a href={`tel:${pedido.cliente.telefono}`}>
                    <Phone size={14} /> {pedido.cliente.telefono}
                  </a>
                )}
              </>
            ) : (
              <span>—</span>
            )}
          </div>

          <div className="admin-order-box">
            <span className="admin-order-box-title">Enviar a</span>
            <strong>{pedido.nombre_receptor || "—"}</strong>
            {pedido.cedula_receptor && <span>C.C. {pedido.cedula_receptor}</span>}
            {pedido.telefono_receptor && (
              <span>
                <Phone size={14} /> {pedido.telefono_receptor}
              </span>
            )}
            <span>
              <MapPin size={14} /> {pedido.direccion_envio}, {pedido.ciudad_envio} (
              {pedido.departamento_envio})
            </span>
          </div>
        </div>

        {/* ---------- Productos ---------- */}
        <ul className="admin-order-items">
          {pedido.detalles.map((d) => (
            <li key={d.id_detalle_pedido}>
              <span className="admin-order-thumb">
                <SafeImage ruta={d.producto?.imagen_principal} alt="" fallback={d.producto?.nombre.charAt(0)} />
              </span>
              <span className="admin-order-item-name">
                {d.producto?.nombre ?? `Producto #${d.id_producto}`}
                <small>
                  {d.cantidad} × {formatPrice(d.precio_unitario)}
                </small>
              </span>
              <strong>{formatPrice(d.subtotal)}</strong>
            </li>
          ))}
        </ul>

        {/* ---------- Totales (editables solo si está Pendiente) ---------- */}
        <div className="admin-order-totals">
          <div>
            <span>Subtotal</span>
            <span>{formatPrice(pedido.subtotal)}</span>
          </div>

          {pedido.estado === "Pendiente" ? (
            <>
              <div>
                <label htmlFor="admin-descuento">Descuento</label>
                <input
                  id="admin-descuento"
                  type="number"
                  min={0}
                  step={100}
                  value={descuento}
                  onChange={(e) => setDescuento(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="admin-envio">Envío</label>
                <input
                  id="admin-envio"
                  type="number"
                  min={0}
                  step={100}
                  value={envio}
                  onChange={(e) => setEnvio(e.target.value)}
                />
              </div>
              {valoresCambiaron && (
                <button
                  type="button"
                  className="admin-link-button"
                  disabled={guardando}
                  onClick={() =>
                    cambiar({
                      descuento: Number(descuento) || 0,
                      costo_envio: Number(envio) || 0,
                    })
                  }
                >
                  Guardar descuento y envío
                </button>
              )}
            </>
          ) : (
            <>
              {Number(pedido.descuento) > 0 && (
                <div>
                  <span>Descuento</span>
                  <span>−{formatPrice(pedido.descuento)}</span>
                </div>
              )}
              <div>
                <span>Envío</span>
                <span>{formatPrice(pedido.costo_envio)}</span>
              </div>
            </>
          )}

          <div className="admin-order-total">
            <span>Total</span>
            <strong>{formatPrice(pedido.total)}</strong>
          </div>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {/* ---------- Acciones ---------- */}
        {confirmarCancelar ? (
          <div className="admin-confirm">
            <p>
              ¿Cancelar el pedido #{pedido.id_pedido}? El stock de sus productos
              se devolverá al inventario.
            </p>
            <div>
              <button
                type="button"
                className="admin-cancel-button"
                onClick={() => setConfirmarCancelar(false)}
                disabled={guardando}
              >
                Volver
              </button>
              <button
                type="button"
                className="admin-danger-button"
                onClick={() => cambiar({ estado: "Cancelado" })}
                disabled={guardando}
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        ) : (
          (avanzar.length > 0 || puedeCancelar) && (
            <div className="admin-modal-actions">
              {puedeCancelar && (
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={() => setConfirmarCancelar(true)}
                  disabled={guardando}
                >
                  Cancelar pedido
                </button>
              )}

              {avanzar.map((estado) => (
                <button
                  key={estado}
                  type="button"
                  className="admin-save-button"
                  onClick={() => cambiar({ estado })}
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : ACCION[estado]}
                </button>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default AdminOrders;
