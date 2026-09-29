import { Link } from "react-router-dom";

import type { Producto } from "../../services/Product";
import SafeImage from "../SafeImage";
import { formatPrice } from "../../utils/format";

import "./ProductCard.css";

/*
|--------------------------------------------------------------------------
| Tarjeta de producto: solo lo necesario (imagen, categoría, nombre,
| precio y disponibilidad). Toda la tarjeta lleva al detalle.
|--------------------------------------------------------------------------
*/
function ProductCard({ producto }: { producto: Producto }) {
  const agotado = producto.stock <= 0;
  const pocasUnidades = !agotado && producto.stock <= 5;

  return (
    <Link
      to={`/productos/${producto.id_producto}`}
      className={"product-card" + (agotado ? " product-card--soldout" : "")}
    >
      <div className="product-card-image">
        <SafeImage
          ruta={producto.imagen_principal}
          alt={producto.nombre}
          loading="lazy"
          fallback={
            <span className="product-card-placeholder">
              {producto.nombre.charAt(0).toUpperCase()}
            </span>
          }
        />

        {agotado && <span className="product-card-badge">Agotado</span>}

        {pocasUnidades && (
          <span className="product-card-badge product-card-badge--low">
            Últimas unidades
          </span>
        )}
      </div>

      <div className="product-card-info">
        {producto.category && (
          <span className="product-card-category">
            {producto.category.nombre}
          </span>
        )}

        <h3>{producto.nombre}</h3>

        <div className="product-card-footer">
          <span className="product-card-price">
            {formatPrice(producto.precio)}
          </span>

          <span className="product-card-cta" aria-hidden="true">
            Ver →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
