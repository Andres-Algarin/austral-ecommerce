import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Check, CircleCheck, X } from "lucide-react";

import OrderBadge from "../../components/OrderBadge/OrderBadge";
import { cancelMyOrder, getMyOrder, type EstadoPedido, type Pedido } from "../../services/Order";
import { apiErrorMessage, formatDateTime, formatPrice } from "../../utils/format";
import SafeImage from "../../components/SafeImage";

import "./Shop.css";

const PASOS: EstadoPedido[] = ["Pendiente", "Pagado", "Preparando", "Enviado", "Entregado"];

function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const esNuevo = Boolean((location.state as { nuevo?: boolean } | null)?.nuevo);

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [confirmarCancelacion, setConfirmarCancelacion] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    getMyOrder(Number(id))
      .then(setPedido)
      .catch(() => setError("No encontramos este pedido."))
      .finally(() => setCargando(false));
  }, [id]);

  const cancelar = async () => {
    if (!pedido) {
      return;
    }

    setCancelando(true);
    setError("");

    try {
      setPedido(await cancelMyOrder(pedido.id_pedido));
      setConfirmarCancelacion(false);
    } catch (err) {
      setError(apiErrorMessage(err, "No fue posible cancelar el pedido."));
    } finally {
      setCancelando(false);
    }
  };

  const contenido = () => {
    if (cargando) {
      return <div className="shop-status">Cargando pedido...</div>;
    }

    if (!pedido) {
      return (
        <div className="shop-empty">
          <h2>{error || "Pedido no encontrado"}</h2>
          <Link to="/mis-pedidos" className="shop-button">
            Ver mis pedidos
          </Link>
        </div>
      );
    }

    const cancelado = pedido.estado === "Cancelado";
    const pasoActual = PASOS.indexOf(pedido.estado);

    return (
      <>
        {esNuevo && !cancelado && (
          <div className="order-success">
            <CircleCheck size={22} />
            <div>
              <strong>¡Recibimos tu pedido!</strong>
              <p>
                Quedó registrado como pendiente de pago. Te contactaremos para
                coordinar el pago y el envío.
              </p>
            </div>
          </div>
        )}

        {/* ================= ESTADO ================= */}
        <section className="shop-panel">
          {cancelado ? (
            <div className="order-cancelled">
              <X size={18} /> Este pedido fue cancelado.
            </div>
          ) : (
            <ol className="order-timeline">
              {PASOS.map((paso, i) => (
                <li
                  key={paso}
                  className={
                    i < pasoActual
                      ? "order-step--done"
                      : i === pasoActual
                        ? "order-step--current"
                        : ""
                  }
                >
                  <span>{i <= pasoActual ? <Check size={14} /> : i + 1}</span>
                  {paso}
                </li>
              ))}
            </ol>
          )}
        </section>

        <div className="shop-layout">
          {/* ================= PRODUCTOS ================= */}
          <section className="shop-panel">
            <h2 className="shop-panel-title">Productos</h2>

            <ul className="checkout-items checkout-items--large">
              {pedido.detalles.map((d) => (
                <li key={d.id_detalle_pedido}>
                  <span className="checkout-item-image">
                    <SafeImage ruta={d.producto?.imagen_principal} alt="" fallback={d.producto?.nombre.charAt(0)} />
                    <em>{d.cantidad}</em>
                  </span>

                  <span className="checkout-item-name">
                    {d.producto ? (
                      <Link to={`/productos/${d.id_producto}`}>{d.producto.nombre}</Link>
                    ) : (
                      "Producto"
                    )}
                    <small>{formatPrice(d.precio_unitario)} c/u</small>
                  </span>

                  <strong>{formatPrice(d.subtotal)}</strong>
                </li>
              ))}
            </ul>
          </section>

          {/* ================= RESUMEN ================= */}
          <aside className="shop-summary">
            <h2>Pedido #{pedido.id_pedido}</h2>

            <div className="order-meta">
              <OrderBadge estado={pedido.estado} />
              <span>{formatDateTime(pedido.fecha)}</span>
            </div>

            <div className="order-shipping">
              <span>Envío a</span>
              <p>
                <strong>{pedido.nombre_receptor}</strong>
                {pedido.direccion_envio}
                <br />
                {pedido.ciudad_envio}, {pedido.departamento_envio}
                {pedido.telefono_receptor && (
                  <>
                    <br />
                    Tel. {pedido.telefono_receptor}
                  </>
                )}
              </p>
            </div>

            <dl className="shop-totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatPrice(pedido.subtotal)}</dd>
              </div>
              {Number(pedido.descuento) > 0 && (
                <div>
                  <dt>Descuento</dt>
                  <dd>−{formatPrice(pedido.descuento)}</dd>
                </div>
              )}
              <div>
                <dt>Envío</dt>
                <dd>
                  {Number(pedido.costo_envio) === 0 ? "Gratis" : formatPrice(pedido.costo_envio)}
                </dd>
              </div>
              <div className="shop-totals-total">
                <dt>Total</dt>
                <dd>{formatPrice(pedido.total)}</dd>
              </div>
            </dl>

            {error && <p className="shop-error">{error}</p>}

            {pedido.estado === "Pendiente" &&
              (confirmarCancelacion ? (
                <div className="order-cancel-confirm">
                  <p>¿Seguro que quieres cancelar este pedido?</p>
                  <div>
                    <button
                      type="button"
                      className="shop-button-secondary"
                      onClick={() => setConfirmarCancelacion(false)}
                      disabled={cancelando}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      className="shop-button shop-button--danger"
                      onClick={cancelar}
                      disabled={cancelando}
                    >
                      {cancelando ? "Cancelando..." : "Sí, cancelar"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="shop-button-secondary shop-button--full"
                  onClick={() => setConfirmarCancelacion(true)}
                >
                  Cancelar pedido
                </button>
              ))}
          </aside>
        </div>
      </>
    );
  };

  return (
    <>
      <main className="shop-page">
        <div className="shop-container">
          <header className="shop-header">
            <Link to="/mis-pedidos" className="shop-link">
              ← Mis pedidos
            </Link>
            <h1>{pedido ? `Pedido #${pedido.id_pedido}` : "Pedido"}</h1>
          </header>

          {contenido()}
        </div>
      </main>

    </>
  );
}

export default OrderDetail;
