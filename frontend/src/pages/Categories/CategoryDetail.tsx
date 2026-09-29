import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PageHero from "../../components/PageHero/PageHero";
import ProductCatalog from "../Products/ProductCatalog";
import { getCategory, type Categoria } from "../../services/Category";

import "../Products/Products.css";

function CategoryDetail() {
  const { id } = useParams();
  const id_categoria = Number(id);

  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [noEncontrada, setNoEncontrada] = useState(false);

  useEffect(() => {
    setCategoria(null);
    setNoEncontrada(false);

    getCategory(id_categoria)
      .then(setCategoria)
      .catch(() => setNoEncontrada(true));
  }, [id_categoria]);

  return (
    <>
      <main>
        {noEncontrada ? (
          <section className="catalog">
            <div className="catalog-container catalog-empty">
              <h3>Categoría no disponible</h3>
              <p>
                <Link to="/categorias">Ver todas las categorías →</Link>
              </p>
            </div>
          </section>
        ) : (
          <>
            <PageHero
              compact
              eyebrow="CATEGORÍA"
              title={categoria ? <em>{categoria.nombre}</em> : " "}
            >
              <Link to="/categorias" className="catalog-back-link">
                ← Todas las categorías
              </Link>
            </PageHero>

            {/* La key reinicia los filtros al cambiar de categoría */}
            <ProductCatalog key={id_categoria} categoriaFija={id_categoria} />
          </>
        )}
      </main>

    </>
  );
}

export default CategoryDetail;
