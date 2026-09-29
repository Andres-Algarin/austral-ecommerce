import { Link } from "react-router-dom";

import type { Categoria } from "../../services/Category";
import SafeImage from "../SafeImage";

import "./CategoryCard.css";

function CategoryCard({ categoria }: { categoria: Categoria }) {
  return (
    <Link to={`/categorias/${categoria.id_categoria}`} className="category-card">
      <div className="category-card-image">
        <SafeImage
          ruta={categoria.imagen}
          alt={categoria.nombre}
          loading="lazy"
          fallback={<span className="category-card-placeholder">
            {categoria.nombre.charAt(0).toUpperCase()}
          </span>}
        />
      </div>

      <div className="category-card-info">
        <h3>{categoria.nombre}</h3>
        <span>Explorar colección →</span>
      </div>
    </Link>
  );
}

export default CategoryCard;
