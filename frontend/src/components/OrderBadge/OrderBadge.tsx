import type { EstadoPedido } from "../../services/Order";

import "./OrderBadge.css";

function OrderBadge({ estado }: { estado: EstadoPedido }) {
  return (
    <span className={`order-badge order-badge--${estado.toLowerCase()}`}>
      {estado}
    </span>
  );
}

export default OrderBadge;
