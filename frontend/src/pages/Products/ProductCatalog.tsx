import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";

import ProductCard from "../../components/ProductCard/ProductCard";
import { getCategories, type Categoria } from "../../services/Category";
import {
  getProducts,
  type FiltrosProductos,
  type Paginado,
  type Producto,
} from "../../services/Product";

import "./Products.css";

const ORDENES: { valor: NonNullable<FiltrosProductos["orden"]>; label: string }[] = [
  { valor: "recientes", label: "Más recientes" },
  { valor: "precio_asc", label: "Precio: menor a mayor" },
  { valor: "precio_desc", label: "Precio: mayor a menor" },
  { valor: "nombre", label: "Nombre (A-Z)" },
];

const POR_PAGINA = 12;

interface ProductCatalogProps {
  // En la página de una categoría, la categoría queda fija.
  categoriaFija?: number;
}

/*
|--------------------------------------------------------------------------
| Catálogo con búsqueda, filtros, orden y paginación.
| Los filtros viven en la URL (?q=&categoria=&orden=&page=&en_stock=).
|--------------------------------------------------------------------------
*/
function ProductCatalog({ categoriaFija }: ProductCatalogProps) {
  const [params, setParams] = useSearchParams();

  const q = params.get("q") ?? "";
  const categoria = categoriaFija ?? (Number(params.get("categoria")) || undefined);
  const orden = (params.get("orden") as FiltrosProductos["orden"]) || "recientes";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const enStock = params.get("en_stock") === "true";

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [resultado, setResultado] = useState<Paginado<Producto> | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [textoBusqueda, setTextoBusqueda] = useState(q);

  // Mantener el campo sincronizado si la búsqueda cambia desde el navbar.
  useEffect(() => {
    setTextoBusqueda(q);
  }, [q]);

  useEffect(() => {
    if (categoriaFija) {
      return;
    }

    getCategories()
      .then(setCategorias)
      .catch(() => setCategorias([]));
  }, [categoriaFija]);

  useEffect(() => {
    let cancelado = false;

    setCargando(true);
    setError("");

    getProducts({
      q: q || undefined,
      categoria,
      orden,
      page,
      limit: POR_PAGINA,
      en_stock: enStock || undefined,
    })
      .then((data) => {
        if (!cancelado) {
          setResultado(data);
        }
      })
      .catch(() => {
        if (!cancelado) {
          setError("No fue posible cargar los productos. Intenta de nuevo.");
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
  }, [q, categoria, orden, page, enStock]);

  /*
  |--------------------------------------------------------------------------
  | Cambiar filtros (vuelve a la página 1)
  |--------------------------------------------------------------------------
  */
  const actualizar = (cambios: Record<string, string | undefined>) => {
    const nuevos = new URLSearchParams(params);

    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor) {
        nuevos.set(clave, valor);
      } else {
        nuevos.delete(clave);
      }
    }

    if (!("page" in cambios)) {
      nuevos.delete("page");
    }

    setParams(nuevos);
  };

  const cambiarPagina = (nueva: number) => {
    actualizar({ page: nueva > 1 ? String(nueva) : undefined });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buscar = (evento: FormEvent) => {
    evento.preventDefault();
    actualizar({ q: textoBusqueda.trim() || undefined });
  };

  const hayFiltros = Boolean(q || (!categoriaFija && categoria) || enStock);

  return (
    <section className="catalog">
      <div className="catalog-container">

        {/* ================= FILTROS ================= */}
        <div className="catalog-toolbar">
          <form className="catalog-search" onSubmit={buscar}>
            <Search size={18} />

            <input
              type="search"
              placeholder="Buscar productos..."
              value={textoBusqueda}
              onChange={(e) => setTextoBusqueda(e.target.value)}
              aria-label="Buscar productos"
            />
          </form>

          <div className="catalog-controls">
            <label className="catalog-stock-toggle">
              <input
                type="checkbox"
                checked={enStock}
                onChange={(e) =>
                  actualizar({ en_stock: e.target.checked ? "true" : undefined })
                }
              />
              <span>Solo disponibles</span>
            </label>

            <select
              className="catalog-sort"
              value={orden}
              onChange={(e) =>
                actualizar({
                  orden: e.target.value === "recientes" ? undefined : e.target.value,
                })
              }
              aria-label="Ordenar productos"
            >
              {ORDENES.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!categoriaFija && categorias.length > 0 && (
          <div className="catalog-chips" role="group" aria-label="Categorías">
            <button
              type="button"
              className={"catalog-chip" + (!categoria ? " catalog-chip--active" : "")}
              onClick={() => actualizar({ categoria: undefined })}
            >
              Todas
            </button>

            {categorias.map((cat) => (
              <button
                key={cat.id_categoria}
                type="button"
                className={
                  "catalog-chip" +
                  (categoria === cat.id_categoria ? " catalog-chip--active" : "")
                }
                onClick={() => actualizar({ categoria: String(cat.id_categoria) })}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        )}

        {/* ================= RESULTADOS ================= */}
        <div className="catalog-summary">
          <span>
            {resultado && !cargando
              ? `${resultado.total} ${resultado.total === 1 ? "producto" : "productos"}`
              : " "}
            {q && !cargando && (
              <>
                {" "}para <strong>"{q}"</strong>
              </>
            )}
          </span>

          {hayFiltros && (
            <button
              type="button"
              className="catalog-clear"
              onClick={() =>
                setParams(new URLSearchParams())
              }
            >
              <X size={14} /> Limpiar filtros
            </button>
          )}
        </div>

        {error ? (
          <div className="catalog-status">{error}</div>
        ) : cargando && !resultado ? (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="catalog-skeleton" />
            ))}
          </div>
        ) : resultado && resultado.data.length === 0 ? (
          <div className="catalog-empty">
            <h3>No encontramos productos</h3>
            <p>Prueba con otra búsqueda o quita algunos filtros.</p>
          </div>
        ) : (
          <div className={"product-grid" + (cargando ? " catalog-loading" : "")}>
            {resultado?.data.map((producto) => (
              <ProductCard key={producto.id_producto} producto={producto} />
            ))}
          </div>
        )}

        {/* ================= PAGINACIÓN ================= */}
        {resultado && resultado.totalPages > 1 && (
          <nav className="catalog-pagination" aria-label="Paginación">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => cambiarPagina(page - 1)}
            >
              ← Anterior
            </button>

            <span>
              Página {page} de {resultado.totalPages}
            </span>

            <button
              type="button"
              disabled={page >= resultado.totalPages}
              onClick={() => cambiarPagina(page + 1)}
            >
              Siguiente →
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}

export default ProductCatalog;
