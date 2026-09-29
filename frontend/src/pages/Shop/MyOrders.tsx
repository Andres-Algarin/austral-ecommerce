import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";

import OrderBadge from "../../components/OrderBadge/OrderBadge";
import { getMyOrders, type Pedido } from "../../services/Order";
import { formatDate, formatPrice } from "../../utils/format";
import SafeImage from "../../components/SafeImage";

import "./Shop.css";

function MyOrders() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyOrders()
      .then(setPedidos)
      .catch(() => setError("No fue posible cargar tus pedidos."))
      .finally(() => setCargando(false));
  }, []);

  return (
    <>
      <main className="shop-page">
        <div className="shop-container shop-container--narrow">
          <header className="shop-header">
            <span>TU CUENTA</span>
            <h1>Mis pedidos</h1>
          </header>

          {cargando ? (
            <div className="shop-status">Cargando pedidos...</div>
          ) : error ? (
            <div className="shop-status">{error}</div>
          ) : pedidos.length === 0 ? (
            <div className="shop-empty">
              <Package size={34} />
              <h2>Aún no tienes pedidos</h2>
              <p>Cuando hagas tu primera compra, podrás seguirla desde aquí.</p>
              <Link to="/productos" className="shop-button">
                Explorar productos
              </Link>
            </div>
          ) : (
            <ul className="orders-list">
              {pedidos.map((pedido) => {
                const unidades = pedido.detalles.reduce((t, d) => t + d.cantidad, 0);

                return (
                  <li key={pedido.id_pedido}>
                    <Link to={`/mis-pedidos/${pedido.id_pedido}`} className="order-card">
                      <div className="order-card-thumbs">
                        {pedido.detalles.slice(0, 3).map((d) => (
                          <span key={d.id_detalle_pedido}>
                            <SafeImage ruta={d.producto?.imagen_principal} alt="" fallback={d.producto?.nombre.charAt(0) ?? "·"} />
                          </span>
                        ))}
                      </div>

                      <div className="order-card-info">
                        <strong>Pedido #{pedido.id_pedido}</strong>
                        <span>
                          {formatDate(pedido.fecha)} · {unidades}{" "}
                          {unidades === 1 ? "producto" : "productos"}
                        </span>
                      </div>

                      <OrderBadge estado={pedido.estado} />

                      <strong className="order-card-total">{formatPrice(pedido.total)}</strong>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

    </>
  );
}

export default MyOrders;
