import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, MapPin, Plus } from "lucide-react";

import { useCart } from "../../context/CartContext";
import {
  createAddress,
  getAddresses,
  type Direccion,
  type DireccionData,
} from "../../services/Address";
import {
  createOrder,
  getCheckoutSummary,
  type ResumenCheckout,
} from "../../services/Order";
import { getProfile } from "../../services/User";
import { apiErrorMessage, formatPrice } from "../../utils/format";
import SafeImage from "../../components/SafeImage";

import "./Shop.css";

const direccionVacia: DireccionData = {
  alias: "",
  direccion: "",
  ciudad: "",
  departamento: "",
  telefono_contacto: "",
};

function Checkout() {
  const navigate = useNavigate();
  const { recargar } = useCart();

  const [resumen, setResumen] = useState<ResumenCheckout | null>(null);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [idDireccion, setIdDireccion] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);

  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [nueva, setNueva] = useState<DireccionData>(direccionVacia);
  const [guardandoDireccion, setGuardandoDireccion] = useState(false);

  const [receptor, setReceptor] = useState({ nombre: "", cedula: "", telefono: "" });

  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getCheckoutSummary(), getAddresses(), getProfile()])
      .then(([res, dirs, perfil]) => {
        setResumen(res);
        setDirecciones(dirs);

        const predeterminada = dirs.find((d) => d.predeterminada) ?? dirs[0];
        setIdDireccion(predeterminada?.id_direccion ?? null);
        setMostrarNueva(dirs.length === 0);

        // Por defecto recibe quien compra.
        setReceptor({
          nombre: `${perfil.nombre} ${perfil.apellido}`.trim(),
          cedula: perfil.cedula ?? "",
          telefono: perfil.telefono ?? "",
        });
      })
      .catch((err) => setError(apiErrorMessage(err, "No fue posible cargar el checkout.")))
      .finally(() => setCargando(false));
  }, []);

  const guardarDireccion = async (evento: FormEvent) => {
    evento.preventDefault();
    setGuardandoDireccion(true);
    setError("");

    try {
      const datos: DireccionData = {
        direccion: nueva.direccion.trim(),
        ciudad: nueva.ciudad.trim(),
        departamento: nueva.departamento.trim(),
        ...(nueva.alias?.trim() && { alias: nueva.alias.trim() }),
        ...(nueva.telefono_contacto?.trim() && {
          telefono_contacto: nueva.telefono_contacto.trim(),
        }),
      };

      const creada = await createAddress(datos);

      setDirecciones((actuales) => [creada, ...actuales]);
      setIdDireccion(creada.id_direccion);
      setNueva(direccionVacia);
      setMostrarNueva(false);
    } catch (err) {
      setError(apiErrorMessage(err, "No fue posible guardar la dirección."));
    } finally {
      setGuardandoDireccion(false);
    }
  };

  const confirmar = async () => {
    if (!idDireccion) {
      setError("Selecciona o agrega una dirección de envío.");
      return;
    }

    setConfirmando(true);
    setError("");

    try {
      const pedido = await createOrder({
        id_direccion: idDireccion,
        ...(receptor.nombre.trim() && { nombre_receptor: receptor.nombre.trim() }),
        ...(receptor.cedula.trim() && { cedula_receptor: receptor.cedula.trim() }),
        ...(receptor.telefono.trim() && { telefono_receptor: receptor.telefono.trim() }),
      });

      await recargar();

      navigate(`/mis-pedidos/${pedido.id_pedido}`, { state: { nuevo: true } });
    } catch (err) {
      setError(apiErrorMessage(err, "No fue posible crear el pedido."));
      getCheckoutSummary().then(setResumen).catch(() => undefined);
    } finally {
      setConfirmando(false);
    }
  };

  const contenido = () => {
    if (cargando) {
      return <div className="shop-status">Preparando tu pedido...</div>;
    }

    if (!resumen || resumen.items.length === 0) {
      return (
        <div className="shop-empty">
          <h2>No hay productos para comprar</h2>
          <p>{error || "Tu carrito está vacío."}</p>
          <Link to="/productos" className="shop-button">
            Explorar productos
          </Link>
        </div>
      );
    }

    return (
      <div className="shop-layout">
        <div className="checkout-steps">

          {/* ================= 1. DIRECCIÓN ================= */}
          <section className="shop-panel">
            <h2 className="checkout-step-title">
              <span>1</span> Dirección de envío
            </h2>

            {direcciones.length > 0 && (
              <div className="checkout-addresses">
                {direcciones.map((d) => (
                  <label
                    key={d.id_direccion}
                    className={
                      "checkout-address" +
                      (idDireccion === d.id_direccion ? " checkout-address--active" : "")
                    }
                  >
                    <input
                      type="radio"
                      name="direccion"
                      checked={idDireccion === d.id_direccion}
                      onChange={() => setIdDireccion(d.id_direccion)}
                    />

                    <MapPin size={18} />

                    <span>
                      <strong>{d.alias || "Dirección"}</strong>
                      {d.direccion}
                      <small>
                        {d.ciudad}, {d.departamento}
                      </small>
                    </span>

                    {idDireccion === d.id_direccion && (
                      <Check size={18} className="checkout-address-check" />
                    )}
                  </label>
                ))}
              </div>
            )}

            {mostrarNueva ? (
              <form className="shop-form" onSubmit={guardarDireccion}>
                <div className="shop-form-grid">
                  <label className="shop-field shop-field--full">
                    <span>Dirección *</span>
                    <input
                      required
                      maxLength={255}
                      placeholder="Calle, número, barrio, apto."
                      value={nueva.direccion}
                      onChange={(e) => setNueva({ ...nueva, direccion: e.target.value })}
                    />
                  </label>

                  <label className="shop-field">
                    <span>Ciudad *</span>
                    <input
                      required
                      maxLength={100}
                      value={nueva.ciudad}
                      onChange={(e) => setNueva({ ...nueva, ciudad: e.target.value })}
                    />
                  </label>

                  <label className="shop-field">
                    <span>Departamento *</span>
                    <input
                      required
                      maxLength={100}
                      value={nueva.departamento}
                      onChange={(e) => setNueva({ ...nueva, departamento: e.target.value })}
                    />
                  </label>

                  <label className="shop-field">
                    <span>Nombre de la dirección</span>
                    <input
                      maxLength={50}
                      placeholder="Casa, oficina..."
                      value={nueva.alias}
                      onChange={(e) => setNueva({ ...nueva, alias: e.target.value })}
                    />
                  </label>

                  <label className="shop-field">
                    <span>Teléfono de contacto</span>
                    <input
                      maxLength={20}
                      value={nueva.telefono_contacto}
                      onChange={(e) => setNueva({ ...nueva, telefono_contacto: e.target.value })}
                    />
                  </label>
                </div>

                <div className="shop-form-actions">
                  {direcciones.length > 0 && (
                    <button
                      type="button"
                      className="shop-button-secondary"
                      onClick={() => setMostrarNueva(false)}
                    >
                      Cancelar
                    </button>
                  )}

                  <button type="submit" className="shop-button" disabled={guardandoDireccion}>
                    {guardandoDireccion ? "Guardando..." : "Guardar dirección"}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                className="checkout-add-address"
                onClick={() => setMostrarNueva(true)}
              >
                <Plus size={16} /> Agregar otra dirección
              </button>
            )}
          </section>

          {/* ================= 2. RECEPTOR ================= */}
          <section className="shop-panel">
            <h2 className="checkout-step-title">
              <span>2</span> ¿Quién recibe?
            </h2>

            <div className="shop-form-grid">
              <label className="shop-field shop-field--full">
                <span>Nombre completo</span>
                <input
                  maxLength={150}
                  value={receptor.nombre}
                  onChange={(e) => setReceptor({ ...receptor, nombre: e.target.value })}
                />
              </label>

              <label className="shop-field">
                <span>Cédula</span>
                <input
                  maxLength={20}
                  value={receptor.cedula}
                  onChange={(e) => setReceptor({ ...receptor, cedula: e.target.value })}
                />
              </label>

              <label className="shop-field">
                <span>Teléfono</span>
                <input
                  maxLength={20}
                  value={receptor.telefono}
                  onChange={(e) => setReceptor({ ...receptor, telefono: e.target.value })}
                />
              </label>
            </div>
          </section>
        </div>

        {/* ================= RESUMEN ================= */}
        <aside className="shop-summary">
          <h2>Tu pedido</h2>

          <ul className="checkout-items">
            {resumen.items.map((item) => (
              <li key={item.id_producto}>
                <span className="checkout-item-image">
                  <SafeImage ruta={item.imagen_principal} alt="" fallback={item.nombre.charAt(0)} />
                  <em>{item.cantidad}</em>
                </span>
                <span className="checkout-item-name">{item.nombre}</span>
                <strong>{formatPrice(item.subtotal)}</strong>
              </li>
            ))}
          </ul>

          <dl className="shop-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatPrice(resumen.subtotal)}</dd>
            </div>
            <div>
              <dt>Envío</dt>
              <dd>{resumen.costo_envio === 0 ? "Gratis" : formatPrice(resumen.costo_envio)}</dd>
            </div>
            <div className="shop-totals-total">
              <dt>Total</dt>
              <dd>{formatPrice(resumen.total)}</dd>
            </div>
          </dl>

          {resumen.errores.length > 0 && (
            <ul className="shop-warnings">
              {resumen.errores.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}

          {error && <p className="shop-error">{error}</p>}

          <button
            type="button"
            className="shop-button shop-button--full"
            disabled={confirmando || !resumen.puede_comprar || !idDireccion}
            onClick={confirmar}
          >
            {confirmando ? "Confirmando..." : "Confirmar pedido"}
          </button>

          <p className="shop-note">
            Tu pedido quedará registrado como <strong>pendiente de pago</strong>.
            Te contactaremos para coordinar el pago y el envío.
          </p>
        </aside>
      </div>
    );
  };

  return (
    <>
      <main className="shop-page">
        <div className="shop-container">
          <header className="shop-header">
            <Link to="/carrito" className="shop-link">
              ← Volver al carrito
            </Link>
            <h1>Finalizar compra</h1>
          </header>

          {contenido()}
        </div>
      </main>

    </>
  );
}

export default Checkout;
