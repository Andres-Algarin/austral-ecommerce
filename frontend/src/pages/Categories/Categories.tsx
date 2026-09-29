import { useEffect, useState } from "react";

import PageHero from "../../components/PageHero/PageHero";
import CategoryCard from "../../components/CategoryCard/CategoryCard";
import { getCategories, type Categoria } from "../../services/Category";

import "../Products/Products.css";

function Categories() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories()
      .then(setCategorias)
      .catch(() => setError("No fue posible cargar las categorías."))
      .finally(() => setCargando(false));
  }, []);

  return (
    <>
      <main>
        <PageHero
          compact
          eyebrow="DESCUBRE AUSTRAL"
          title={
            <>
              Nuestras <em>categorías</em>
            </>
          }
          description="Encuentra lo que tu rutina necesita: cuidado del cabello, de la piel y bienestar natural."
        />

        <section className="catalog">
          <div className="catalog-container">
            {cargando ? (
              <div className="category-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="catalog-skeleton" />
                ))}
              </div>
            ) : error ? (
              <div className="catalog-status">{error}</div>
            ) : categorias.length === 0 ? (
              <div className="catalog-empty">
                <h3>Aún no hay categorías</h3>
                <p>Pronto encontrarás aquí nuestras colecciones.</p>
              </div>
            ) : (
              <div className="category-grid">
                {categorias.map((categoria) => (
                  <CategoryCard key={categoria.id_categoria} categoria={categoria} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

    </>
  );
}

export default Categories;
