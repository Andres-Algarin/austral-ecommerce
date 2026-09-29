import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import HeroCarousel from "../components/HeroCarousel/HeroCarousel";
import ProductCard from "../components/ProductCard/ProductCard";
import SafeImage from "../components/SafeImage";

import { getCategories, type Categoria } from "../services/Category";
import { getProducts, type Producto } from "../services/Product";

import "./Home.css";

const heroImages = [
  { src: "/Hero1.png", alt: "Producto Austral con hojas de cáñamo" },
  { src: "/Hero2.png", alt: "Línea de productos Austral" },
  { src: "/Hero3.png", alt: "Producto Austral 100% natural" },
];

function Home() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [cargandoProductos, setCargandoProductos] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategorias)
      .catch(() => setCategorias([]))
      .finally(() => setCargandoCategorias(false));

    // Los más recientes con stock disponible.
    getProducts({ orden: "recientes", en_stock: true, limit: 4 })
      .then((r) => setProductos(r.data))
      .catch(() => setProductos([]))
      .finally(() => setCargandoProductos(false));
  }, []);

  return (
    <>
      <main className="home-page">

        {/* =====================================================
            HERO
            ===================================================== */}

        <section className="home-hero">

          <div className="home-hero-decor home-hero-decor--one" />

          <div className="home-hero-decor home-hero-decor--two" />

          <img
            src="/leaf.png"
            alt=""
            className="home-hero-leaf home-hero-leaf--left"
          />

          <img
            src="/leaf-flip.png"
            alt=""
            className="home-hero-leaf home-hero-leaf--right"
          />

          <div className="home-hero-grid">

            <div className="home-hero-content">

              <span className="home-hero-eyebrow">
                BELLEZA NATURAL · AUSTRAL
              </span>

              <h1>
                Cuidado natural que se siente{" "}
                <em>bien.</em>
              </h1>

              <p>
                Fórmulas para el cabello y la piel con una
                mirada más natural, pensadas para convertir
                tu rutina diaria en un momento para vos.
              </p>

              <div className="home-hero-actions">

                <Link
                  to="/productos"
                  className="home-hero-cta"
                >
                  Explorar productos
                  <span>→</span>
                </Link>

                <Link
                  to="/categorias"
                  className="home-hero-secondary"
                >
                  Ver categorías
                </Link>

              </div>

              <div className="home-hero-points">

                <span>
                  <b>✦</b>
                  Ingredientes naturales
                </span>

                <span>
                  <b>✦</b>
                  Cuidado diario
                </span>

              </div>

            </div>

            <div className="home-hero-media">

              <HeroCarousel
                images={heroImages}
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            CATEGORÍAS
            ===================================================== */}

        <section className="home-categories" id="categorias">
          <div className="home-container">
            <div className="home-section-heading">
              <div>
                <span>DESCUBRE AUSTRAL</span>
                <h2>
                  Encuentra lo que tu <em>rutina necesita.</em>
                </h2>
              </div>

              <Link to="/categorias">Ver todas las categorías →</Link>
            </div>

            {cargandoCategorias ? (
              <div className="home-cat-grid">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="home-skeleton home-skeleton--cat" />
                ))}
              </div>
            ) : categorias.length === 0 ? (
              <div className="home-empty">Pronto encontrarás aquí nuestras colecciones.</div>
            ) : (
              <div className="home-cat-grid">
                {categorias.map((categoria, index) => (
                  <Link
                    key={categoria.id_categoria}
                    to={`/categorias/${categoria.id_categoria}`}
                    className="home-cat"
                  >
                    <SafeImage
                      ruta={categoria.imagen}
                      alt=""
                      loading="lazy"
                      fallback={<span className="home-cat-placeholder" />}
                    />

                    <div className="home-cat-overlay">
                      <span className="home-cat-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div>
                        <h3>{categoria.nombre}</h3>
                        <span className="home-cat-cta">
                          Explorar colección <em>→</em>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            PRODUCTOS
            ===================================================== */}

        <section className="home-products">
          <div className="home-container">
            <div className="home-section-heading">
              <div>
                <span>RECIÉN LLEGADOS</span>
                <h2>
                  Cuidado natural <em>para cada día.</em>
                </h2>
              </div>

              <Link to="/productos">Ver todos los productos →</Link>
            </div>

            {cargandoProductos ? (
              <div className="product-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="home-skeleton home-skeleton--product" />
                ))}
              </div>
            ) : productos.length === 0 ? (
              <div className="home-empty">Muy pronto tendremos productos disponibles.</div>
            ) : (
              <div className="product-grid">
                {productos.map((producto) => (
                  <ProductCard key={producto.id_producto} producto={producto} />
                ))}
              </div>
            )}

            <div className="home-products-footer">
              <Link to="/productos" className="home-hero-cta">
                Explorar la tienda <span>→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

    </>
  );
}

export default Home;