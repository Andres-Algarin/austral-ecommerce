import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Check, Leaf, Minus, Plus, ShoppingBag, Sprout, Users } from "lucide-react";

import ProductCard from "../../components/ProductCard/ProductCard";
import RichText from "../../components/RichText/RichText";
import Stars from "../../components/Stars/Stars";
import ProductReviews from "./ProductReviews";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { getProduct, getProducts, type Producto } from "../../services/Product";
import { apiErrorMessage, formatPrice, imageUrl } from "../../utils/format";
import SafeImage from "../../components/SafeImage";

import "./ProductDetail.css";

type Pestana = "beneficios" | "ingredientes" | "modo_uso";

const PESTANAS: { id: Pestana; label: string }[] = [
  { id: "beneficios", label: "Beneficios" },
  { id: "ingredientes", label: "Ingredientes" },
  { id: "modo_uso", label: "Modo de uso" },
];

function ProductDetail() {
  const { id } = useParams();
  const id_producto = Number(id);

  const { usuario } = useAuth();
  const { agregar } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [relacionados, setRelacionados] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);

  const [imagenActiva, setImagenActiva] = useState(0);
  const [pestana, setPestana] = useState<Pestana>("beneficios");
  const [cantidad, setCantidad] = useState(1);
  const [agregando, setAgregando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [resumenResenas, setResumenResenas] = useState({ promedio: 0, total: 0 });

  useEffect(() => {
    let cancelado = false;

    setCargando(true);
    setNoEncontrado(false);
    setImagenActiva(0);
    setCantidad(1);
    setMensaje(null);

    getProduct(id_producto)
      .then((data) => {
        if (cancelado) {
          return;
        }

        setProducto(data);

        // Primera pestaña que tenga contenido.
        const primera = PESTANAS.find((p) => data[p.id]?.trim());
        setPestana(primera?.id ?? "beneficios");

        getProducts({ categoria: data.id_categoria, limit: 5 })
          .then((r) => {
            if (!cancelado) {
              setRelacionados(
                r.data.filter((p) => p.id_producto !== data.id_producto).slice(0, 4)
              );
            }
          })
          .catch(() => setRelacionados([]));
      })
      .catch(() => {
        if (!cancelado) {
          setNoEncontrado(true);
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [id_producto]);

  const alResumenResenas = useCallback((promedio: number, total: number) => {
    setResumenResenas({ promedio, total });
  }, []);

  if (cargando) {
    return (
      <>
        <main className="pd-page">
          <div className="pd-container pd-loading">
            <div className="pd-skeleton pd-skeleton--image" />
            <div className="pd-skeleton-group">
              <div className="pd-skeleton pd-skeleton--line" />
              <div className="pd-skeleton pd-skeleton--title" />
              <div className="pd-skeleton pd-skeleton--line" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (noEncontrado || !producto) {
    return (
      <>
        <main className="pd-page">
          <div className="pd-container pd-not-found">
            <h1>Producto no disponible</h1>
            <p>Es posible que el producto ya no esté a la venta.</p>
            <Link to="/productos" className="pd-button-primary">
              Ver todos los productos
            </Link>
          </div>
        </main>
      </>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Galería: imagen principal + imágenes adicionales (sin repetir)
  |--------------------------------------------------------------------------
  */
  const imagenes = [
    producto.imagen_principal,
    ...(producto.imagenes ?? []).map((img) => img.url_imagen),
  ].filter((url, i, lista): url is string => Boolean(url) && lista.indexOf(url) === i);

  const agotado = producto.stock <= 0;
  const pestanasConContenido = PESTANAS.filter((p) => producto[p.id]?.trim());

  const agregarAlCarrito = async () => {
    if (!usuario) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    setAgregando(true);
    setMensaje(null);

    try {
      await agregar(producto.id_producto, cantidad);
      setMensaje({ tipo: "ok", texto: "Agregado al carrito" });
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto: apiErrorMessage(error, "No fue posible agregar el producto."),
      });
    } finally {
      setAgregando(false);
    }
  };

  return (
    <>
      <main className="pd-page">
        <div className="pd-container">

          {/* ================= MIGAS ================= */}
          <nav className="pd-breadcrumb" aria-label="Ruta">
            <Link to="/">Inicio</Link>
            <span>/</span>
            <Link to="/productos">Productos</Link>
            {producto.category && (
              <>
                <span>/</span>
                <Link to={`/categorias/${producto.id_categoria}`}>
                  {producto.category.nombre}
                </Link>
              </>
            )}
          </nav>

          {/* ================= PRINCIPAL ================= */}
          <section className="pd-main">

            {/* Galería */}
            <div className="pd-gallery">
              <div className="pd-gallery-main">
                <SafeImage
                  ruta={imagenes[imagenActiva]}
                  alt={producto.nombre}
                  fallback={
                    <span className="pd-gallery-placeholder">
                      {producto.nombre.charAt(0).toUpperCase()}
                    </span>
                  }
                />
              </div>

              {imagenes.length > 1 && (
                <div className="pd-gallery-thumbs">
                  {imagenes.map((url, i) => (
                    <button
                      key={url}
                      type="button"
                      className={
                        "pd-gallery-thumb" + (i === imagenActiva ? " pd-gallery-thumb--active" : "")
                      }
                      onClick={() => setImagenActiva(i)}
                      aria-label={`Ver imagen ${i + 1}`}
                    >
                      <img src={imageUrl(url)} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Información esencial */}
            <div className="pd-info">
              {producto.category && (
                <Link to={`/categorias/${producto.id_categoria}`} className="pd-category">
                  {producto.category.nombre}
                </Link>
              )}

              <h1>{producto.nombre}</h1>

              {resumenResenas.total > 0 && (
                <a href="#resenas" className="pd-rating">
                  <Stars valor={resumenResenas.promedio} tamano={15} />
                  <span>
                    {resumenResenas.promedio.toFixed(1)} · {resumenResenas.total}{" "}
                    {resumenResenas.total === 1 ? "reseña" : "reseñas"}
                  </span>
                </a>
              )}

              <p className="pd-price">{formatPrice(producto.precio)}</p>

              {producto.descripcion?.trim() && (
                <div className="pd-description">
                  <RichText texto={producto.descripcion} />
                </div>
              )}

              <div className="pd-stock">
                <span
                  className={
                    "pd-stock-dot" +
                    (agotado ? " pd-stock-dot--out" : producto.stock <= 5 ? " pd-stock-dot--low" : "")
                  }
                />
                {agotado
                  ? "Agotado por ahora"
                  : producto.stock <= 5
                    ? `Últimas ${producto.stock} unidades`
                    : "Disponible"}
              </div>

              {!agotado && (
                <div className="pd-buy">
                  <div className="pd-quantity" aria-label="Cantidad">
                    <button
                      type="button"
                      onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                      disabled={cantidad <= 1}
                      aria-label="Disminuir cantidad"
                    >
                      <Minus size={16} />
                    </button>

                    <span>{cantidad}</span>

                    <button
                      type="button"
                      onClick={() => setCantidad((c) => Math.min(producto.stock, c + 1))}
                      disabled={cantidad >= producto.stock}
                      aria-label="Aumentar cantidad"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="pd-add-button"
                    onClick={agregarAlCarrito}
                    disabled={agregando}
                  >
                    <ShoppingBag size={18} />
                    {agregando ? "Agregando..." : "Agregar al carrito"}
                  </button>
                </div>
              )}

              {mensaje && (
                <p className={"pd-message pd-message--" + mensaje.tipo}>
                  {mensaje.tipo === "ok" && <Check size={16} />}
                  {mensaje.texto}
                  {mensaje.tipo === "ok" && <Link to="/carrito">Ver carrito →</Link>}
                </p>
              )}

              <ul className="pd-highlights">
                <li>
                  <Leaf size={17} /> Extractos botánicos de alta calidad
                </li>
                <li>
                  <Sprout size={17} /> Cultivo con prácticas ecológicas
                </li>
                <li>
                  <Users size={17} /> Comercio justo con familias campesinas
                </li>
              </ul>
            </div>
          </section>

          {/* ================= DETALLES EN PESTAÑAS ================= */}
          {pestanasConContenido.length > 0 && (
            <section className="pd-details">
              <div className="pd-tabs" role="tablist">
                {pestanasConContenido.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={pestana === p.id}
                    className={"pd-tab" + (pestana === p.id ? " pd-tab--active" : "")}
                    onClick={() => setPestana(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="pd-tab-panel" role="tabpanel">
                <RichText texto={producto[pestana] ?? ""} />
              </div>
            </section>
          )}

          {/* ================= RESEÑAS ================= */}
          <ProductReviews id_producto={producto.id_producto} onResumen={alResumenResenas} />

          {/* ================= RELACIONADOS ================= */}
          {relacionados.length > 0 && (
            <section className="pd-related">
              <div className="pd-section-heading">
                <span>DE LA MISMA LÍNEA</span>
                <h2>También te puede gustar</h2>
              </div>

              <div className="product-grid">
                {relacionados.map((p) => (
                  <ProductCard key={p.id_producto} producto={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

    </>
  );
}

export default ProductDetail;
