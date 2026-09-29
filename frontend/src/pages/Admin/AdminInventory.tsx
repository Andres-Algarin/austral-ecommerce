import { useEffect, useState } from "react";
import { Eye, EyeOff, Minus, Plus } from "lucide-react";

import {
  getAdminProducts,
  patchProduct,
  type Producto,
} from "../../services/Product";
import { apiErrorMessage, formatPrice } from "../../utils/format";
import SafeImage from "../../components/SafeImage";

import "./AdminSections.css";

const UMBRAL_BAJO = 5;

type Filtro = "todos" | "bajo" | "agotados" | "ocultos";

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "bajo", label: "Stock bajo" },
  { id: "agotados", label: "Agotados" },
  { id: "ocultos", label: "Ocultos" },
];

function AdminInventory() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [texto, setTexto] = useState("");

  // Stock editado que aún no se ha guardado, por producto.
  const [borradores, setBorradores] = useState<Record<number, string>>({});
  const [guardandoId, setGuardandoId] = useState<number | null>(null);

  useEffect(() => {
    getAdminProducts()
      .then(setProductos)
      .catch((err) => setError(apiErrorMessage(err, "No fue posible cargar el inventario.")))
      .finally(() => setCargando(false));
  }, []);

  const agotados = productos.filter((p) => p.stock <= 0);
  const bajos = productos.filter((p) => p.stock > 0 && p.stock <= UMBRAL_BAJO);
  const ocultos = productos.filter((p) => !p.estado);
  const unidades = productos.reduce((t, p) => t + p.stock, 0);

  const busqueda = texto.trim().toLowerCase();

  const visibles = productos
    .filter((p) => {
      if (filtro === "bajo") return p.stock > 0 && p.stock <= UMBRAL_BAJO;
      if (filtro === "agotados") return p.stock <= 0;
      if (filtro === "ocultos") return !p.estado;
      return true;
    })
    .filter(
      (p) =>
        !busqueda ||
        p.nombre.toLowerCase().includes(busqueda) ||
        p.category?.nombre.toLowerCase().includes(busqueda)
    )
    // Primero lo que necesita atención.
    .sort((a, b) => a.stock - b.stock);

  const reemplazar = (actualizado: Producto) => {
    setProductos((lista) =>
      lista.map((p) =>
        p.id_producto === actualizado.id_producto
          ? { ...p, stock: actualizado.stock, estado: actualizado.estado }
          : p
      )
    );
  };

  const guardarStock = async (producto: Producto, nuevo: number) => {
    if (!Number.isInteger(nuevo) || nuevo < 0) {
      setError("El stock debe ser un número entero mayor o igual a 0.");
      return;
    }

    setGuardandoId(producto.id_producto);
    setError("");
    setAviso("");

    try {
      reemplazar(await patchProduct(producto.id_producto, { stock: nuevo }));

      setBorradores(({ [producto.id_producto]: _descartado, ...resto }) => resto);
      setAviso(`Stock de "${producto.nombre}" actualizado a ${nuevo}.`);
    } catch (err) {
      setError(apiErrorMessage(err, "No fue posible actualizar el stock."));
    } finally {
      setGuardandoId(null);
    }
  };

  const alternarVisible = async (producto: Producto) => {
    setGuardandoId(producto.id_producto);
    setError("");
    setAviso("");

    try {
      reemplazar(await patchProduct(producto.id_producto, { estado: !producto.estado }));
      setAviso(
        `"${producto.nombre}" ahora está ${producto.estado ? "oculto en la tienda" : "visible en la tienda"}.`
      );
    } catch (err) {
      setError(apiErrorMessage(err, "No fue posible cambiar la visibilidad."));
    } finally {
      setGuardandoId(null);
    }
  };

  return (
    <section className="admin-content">
      <div className="admin-content-header">
        <div>
          <span className="admin-module-label">STOCK</span>
          <h2>Inventario</h2>
          <p>Controla las existencias y la visibilidad de tus productos.</p>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <span>Productos</span>
          <strong>{productos.length}</strong>
          <small>{unidades} unidades en total</small>
        </div>

        <div className={"admin-stat" + (bajos.length ? " admin-stat--warning" : "")}>
          <span>Stock bajo</span>
          <strong>{bajos.length}</strong>
          <small>{UMBRAL_BAJO} unidades o menos</small>
        </div>

        <div className={"admin-stat" + (agotados.length ? " admin-stat--danger" : "")}>
          <span>Agotados</span>
          <strong>{agotados.length}</strong>
          <small>sin unidades</small>
        </div>

        <div className="admin-stat">
          <span>Ocultos</span>
          <strong>{ocultos.length}</strong>
          <small>no visibles en la tienda</small>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-chips">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={"admin-chip" + (filtro === f.id ? " admin-chip--active" : "")}
              onClick={() => setFiltro(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          className="admin-search"
          placeholder="Buscar producto o categoría"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </div>

      {error && <div className="admin-error">{error}</div>}
      {aviso && <div className="admin-notice">{aviso}</div>}

      {cargando ? (
        <div className="admin-status">Cargando inventario...</div>
      ) : visibles.length === 0 ? (
        <div className="admin-status">No hay productos con esos filtros.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Stock</th>
                <th className="admin-table-right">Tienda</th>
              </tr>
            </thead>

            <tbody>
              {visibles.map((producto) => {
                const borrador = borradores[producto.id_producto];
                const valor = borrador ?? String(producto.stock);
                const cambiado = borrador !== undefined && Number(borrador) !== producto.stock;
                const ocupado = guardandoId === producto.id_producto;

                return (
                  <tr key={producto.id_producto} className={!producto.estado ? "admin-row-muted" : ""}>
                    <td>
                      <div className="admin-product-cell">
                        <span className="admin-order-thumb">
                          <SafeImage ruta={producto.imagen_principal} alt="" fallback={producto.nombre.charAt(0)} />
                        </span>
                        <span>
                          <span className="admin-cell-main">{producto.nombre}</span>
                          <span className="admin-cell-sub">{producto.category?.nombre}</span>
                        </span>
                      </div>
                    </td>

                    <td>{formatPrice(producto.precio)}</td>

                    <td>
                      <div className="admin-stock-editor">
                        <button
                          type="button"
                          aria-label="Restar una unidad"
                          disabled={ocupado || Number(valor) <= 0}
                          onClick={() =>
                            setBorradores((b) => ({
                              ...b,
                              [producto.id_producto]: String(Math.max(0, Number(valor) - 1)),
                            }))
                          }
                        >
                          <Minus size={13} />
                        </button>

                        <input
                          type="number"
                          min={0}
                          value={valor}
                          disabled={ocupado}
                          aria-label={`Stock de ${producto.nombre}`}
                          className={
                            producto.stock <= 0
                              ? "admin-stock--out"
                              : producto.stock <= UMBRAL_BAJO
                                ? "admin-stock--low"
                                : ""
                          }
                          onChange={(e) =>
                            setBorradores((b) => ({
                              ...b,
                              [producto.id_producto]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && cambiado) {
                              void guardarStock(producto, Number(valor));
                            }
                          }}
                        />

                        <button
                          type="button"
                          aria-label="Sumar una unidad"
                          disabled={ocupado}
                          onClick={() =>
                            setBorradores((b) => ({
                              ...b,
                              [producto.id_producto]: String(Number(valor) + 1),
                            }))
                          }
                        >
                          <Plus size={13} />
                        </button>

                        {cambiado && (
                          <button
                            type="button"
                            className="admin-stock-save"
                            disabled={ocupado}
                            onClick={() => guardarStock(producto, Number(valor))}
                          >
                            {ocupado ? "..." : "Guardar"}
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="admin-table-right">
                      <button
                        type="button"
                        className={
                          "admin-visibility" + (producto.estado ? "" : " admin-visibility--off")
                        }
                        onClick={() => alternarVisible(producto)}
                        disabled={ocupado}
                        title={producto.estado ? "Ocultar de la tienda" : "Mostrar en la tienda"}
                      >
                        {producto.estado ? <Eye size={15} /> : <EyeOff size={15} />}
                        {producto.estado ? "Visible" : "Oculto"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminInventory;
