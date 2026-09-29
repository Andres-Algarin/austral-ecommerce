import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { getCheckoutSummary, type ResumenCheckout } from "../../services/Order";
import { apiErrorMessage, formatPrice } from "../../utils/format";
import SafeImage from "../../components/SafeImage";

import "./Shop.css";

function Cart() {
  const { usuario } = useAuth();
  const { items, cargando, actualizar, eliminar } = useCart();
  const navigate = useNavigate();

  const [resumen, setResumen] = useState<ResumenCheckout | null>(null);
  const [ocupado, setOcupado] = useState<number | null>(null);
  const [error, setError] = useState("");

  // El resumen (envío, total, problemas de stock) lo calcula el backend.
  useEffect(() => {
    if (!usuario || items.length === 0) {
      setResumen(null);
      return;
    }

    getCheckoutSummary()
      .then(setResumen)
      .catch(() => setResumen(null));
  }, [usuario, items]);

  const cambiarCantidad = async (id: number, cantidad: number) => {
    setOcupado(id);
    setError("");

    try {
      await actualizar(id, cantidad);
    } catch (err) {
      setError(apiErrorMessage(err, "No fue posible actualizar la cantidad."));
    } finally {
      setOcupado(null);
    }
  };

  const quitar = async (id: number) => {
    setOcupado(id);
    setError("");

    try {
      await eliminar(id);
    } catch (err) {
      setError(apiErrorMessage(err, "No fue posible quitar el producto."));
    } finally {
      setOcupado(null);
    }
  };

  const contenido = () => {
    if (!usuario) {
      return (
        <div className="shop-empty">
          <ShoppingBag size={34} />
          <h2>Inicia sesión para ver tu carrito</h2>
          <p>Guarda tus productos y finaliza tu compra desde cualquier dispositivo.</p>
          <Link to="/login" state={{ from: "/carrito" }} className="shop-button">
            Iniciar sesión
          </Link>
        </div>
      );
    }

    if (cargando && items.length === 0) {
      return <div className="shop-status">Cargando tu carrito...</div>;
    }

    if (items.length === 0) {
      return (
        <div className="shop-empty">
          <ShoppingBag size={34} />
          <h2>Tu carrito está vacío</h2>
          <p>Descubre nuestros productos naturales para el cabello y la piel.</p>
          <Link to="/productos" className="shop-button">
            Explorar productos
          </Link>
        </div>
      );
    }

    const progreso =
      resumen?.envio_gratis_desde && resumen.falta_para_envio_gratis !== null
        ? Math.min(100, (resumen.subtotal / resumen.envio_gratis_desde) * 100)
        : null;

    return (
      <div className="shop-layout">
        {/* ================= PRODUCTOS ================= */}
        <section className="shop-panel">
          <ul className="cart-list">
            {items.map((item) => {
              const producto = item.producto;
              const noDisponible = !producto.estado;

              return (
                <li
                  key={item.id_detalle_carrito}
                  className={"cart-item" + (ocupado === item.id_detalle_carrito ? " cart-item--busy" : "")}
                >
                  <Link to={`/productos/${producto.id_producto}`} className="cart-item-image">
                    <SafeImage
                      ruta={producto.imagen_principal}
                      alt={producto.nombre}
                      fallback={<span>{producto.nombre.charAt(0)}</span>}
                    />
                  </Link>

                  <div className="cart-item-info">
                    <Link to={`/productos/${producto.id_producto}`} className="cart-item-name">
                      {producto.nombre}
                    </Link>

                    <span className="cart-item-unit">
                      {formatPrice(producto.precio)} c/u
                    </span>

                    {noDisponible && (
                      <span className="cart-item-warning">Ya no está disponible</span>
                    )}

                    {!noDisponible && item.cantidad > producto.stock && (
                      <span className="cart-item-warning">
                        Solo quedan {producto.stock} unidades
                      </span>
                    )}
                  </div>

                  <div className="cart-item-qty">
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.id_detalle_carrito, item.cantidad - 1)}
                      disabled={item.cantidad <= 1 || ocupado !== null}
                      aria-label="Disminuir cantidad"
                    >
                      <Minus size={14} />
                    </button>

                    <span>{item.cantidad}</span>

                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.id_detalle_carrito, item.cantidad + 1)}
                      disabled={item.cantidad >= producto.stock || ocupado !== null}
                      aria-label="Aumentar cantidad"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <strong className="cart-item-total">
                    {formatPrice(Number(producto.precio) * item.cantidad)}
                  </strong>

                  <button
                    type="button"
                    className="cart-item-remove"
                    onClick={() => quitar(item.id_detalle_carrito)}
                    disabled={ocupado !== null}
                    aria-label={`Quitar ${producto.nombre}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </li>
              );
            })}
          </ul>

          {error && <p className="shop-error">{error}</p>}

          <Link to="/productos" className="shop-link">
            ← Seguir comprando
          </Link>
        </section>

        {/* ================= RESUMEN ================= */}
        <aside className="shop-summary">
          <h2>Resumen</h2>

          {resumen ? (
            <>
              {progreso !== null && (
                <div className="shop-shipping-progress">
                  <p>
                    <Truck size={16} />
                    {resumen.falta_para_envio_gratis === 0 ? (
                      <strong>¡Tienes envío gratis!</strong>
                    ) : (
                      <>
                        Te faltan <strong>{formatPrice(resumen.falta_para_envio_gratis ?? 0)}</strong>{" "}
                        para envío gratis
                      </>
                    )}
                  </p>
                  <div>
                    <span style={{ width: `${progreso}%` }} />
                  </div>
                </div>
              )}

              <dl className="shop-totals">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{formatPrice(resumen.subtotal)}</dd>
                </div>
                <div>
                  <dt>Envío</dt>
                  <dd>{resumen.costo_envio === 0 ? "Gratis" : formatPrice(resumen.costo_envio)}</dd>
                </div>
                <div className="shop-totals-total">
                  <dt>Total</dt>
                  <dd>{formatPrice(resumen.total)}</dd>
                </div>
              </dl>

              {resumen.errores.length > 0 && (
                <ul className="shop-warnings">
                  {resumen.errores.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                className="shop-button shop-button--full"
                disabled={!resumen.puede_comprar}
                onClick={() => navigate("/checkout")}
              >
                Finalizar compra
              </button>
            </>
          ) : (
            <div className="shop-status">Calculando...</div>
          )}
        </aside>
      </div>
    );
  };

  return (
    <>
      <main className="shop-page">
        <div className="shop-container">
          <header className="shop-header">
            <span>TU COMPRA</span>
            <h1>Carrito</h1>
          </header>

          {contenido()}
        </div>
      </main>

    </>
  );
}

export default Cart;
