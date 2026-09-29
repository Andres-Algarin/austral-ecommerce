import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  Menu,
  Package,
  Search,
  Shield,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { getProducts, type Producto } from "../../services/Product";
import { formatPrice } from "../../utils/format";
import SafeImage from "../SafeImage";

import "./Navbar.css";

const enlaces = [
  { to: "/", label: "Inicio", end: true },
  { to: "/productos", label: "Productos" },
  { to: "/categorias", label: "Categorías" },
  { to: "/quienes-somos", label: "Quiénes somos" },
];

/*
|--------------------------------------------------------------------------
| Resalta en negrita la parte del nombre que coincide con la búsqueda.
|--------------------------------------------------------------------------
*/
function resaltar(texto: string, busqueda: string): ReactNode {
  const termino = busqueda.trim();

  if (!termino) {
    return texto;
  }

  const inicio = texto.toLowerCase().indexOf(termino.toLowerCase());

  if (inicio === -1) {
    return texto;
  }

  return (
    <>
      {texto.slice(0, inicio)}
      <strong>{texto.slice(inicio, inicio + termino.length)}</strong>
      {texto.slice(inicio + termino.length)}
    </>
  );
}

function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const { cantidadTotal } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | BÚSQUEDA
  |--------------------------------------------------------------------------
  */

  const [busquedaAbierta, setBusquedaAbierta] = useState(false);
  const [texto, setTexto] = useState("");
  const [sugerencias, setSugerencias] = useState<Producto[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [resaltado, setResaltado] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const perfilRef = useRef<HTMLDivElement>(null);

  // Cerrar todo al cambiar de página.
  useEffect(() => {
    setMenuAbierto(false);
    setMostrarPerfil(false);
    setBusquedaAbierta(false);
  }, [location.pathname, location.search]);

  // Autocompletar mientras se escribe (espera 250 ms entre teclas).
  useEffect(() => {
    const termino = texto.trim();

    if (termino.length < 2) {
      setSugerencias([]);
      setBuscando(false);
      return;
    }

    let cancelado = false;

    setBuscando(true);

    const temporizador = window.setTimeout(async () => {
      try {
        const respuesta = await getProducts({ q: termino, limit: 6 });

        if (!cancelado) {
          setSugerencias(respuesta.data);
          setResaltado(-1);
        }
      } catch {
        if (!cancelado) {
          setSugerencias([]);
        }
      } finally {
        if (!cancelado) {
          setBuscando(false);
        }
      }
    }, 250);

    return () => {
      cancelado = true;
      window.clearTimeout(temporizador);
    };
  }, [texto]);

  useEffect(() => {
    if (busquedaAbierta) {
      inputRef.current?.focus();
    }
  }, [busquedaAbierta]);

  // Cerrar el menú de perfil al hacer clic fuera.
  useEffect(() => {
    if (!mostrarPerfil) {
      return;
    }

    const alHacerClic = (evento: MouseEvent) => {
      if (!perfilRef.current?.contains(evento.target as Node)) {
        setMostrarPerfil(false);
      }
    };

    document.addEventListener("mousedown", alHacerClic);

    return () => document.removeEventListener("mousedown", alHacerClic);
  }, [mostrarPerfil]);

  // Evitar que la página se desplace detrás del menú móvil.
  useEffect(() => {
    document.body.style.overflow = menuAbierto ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAbierto]);

  const alternarBusqueda = () => {
    setMenuAbierto(false);
    setMostrarPerfil(false);
    setBusquedaAbierta((actual) => !actual);
  };

  const cerrarBusqueda = () => {
    setBusquedaAbierta(false);
    setTexto("");
    setSugerencias([]);
  };

  const buscarTodo = () => {
    const termino = texto.trim();

    if (!termino) {
      return;
    }

    cerrarBusqueda();
    navigate(`/productos?q=${encodeURIComponent(termino)}`);
  };

  const irAProducto = (producto: Producto) => {
    cerrarBusqueda();
    navigate(`/productos/${producto.id_producto}`);
  };

  const manejarTeclas = (evento: KeyboardEvent<HTMLInputElement>) => {
    if (evento.key === "Escape") {
      cerrarBusqueda();
      return;
    }

    if (evento.key === "ArrowDown" && sugerencias.length > 0) {
      evento.preventDefault();
      setResaltado((actual) => (actual + 1) % sugerencias.length);
      return;
    }

    if (evento.key === "ArrowUp" && sugerencias.length > 0) {
      evento.preventDefault();
      setResaltado((actual) =>
        actual <= 0 ? sugerencias.length - 1 : actual - 1
      );
      return;
    }

    if (evento.key === "Enter") {
      evento.preventDefault();

      if (resaltado >= 0 && sugerencias[resaltado]) {
        irAProducto(sugerencias[resaltado]);
      } else {
        buscarTodo();
      }
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SESIÓN
  |--------------------------------------------------------------------------
  */

  const obtenerIniciales = () => {
    if (!usuario) {
      return "";
    }

    const nombre = usuario.nombre?.trim() || "";
    const apellido = usuario.apellido?.trim() || "";

    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const manejarCerrarSesion = () => {
    setMostrarPerfil(false);
    setMenuAbierto(false);
    cerrarSesion();
    navigate("/");
  };

  const terminoValido = texto.trim().length >= 2;

  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Logo: siempre lleva al inicio */}
        <Link to="/" className="navbar-logo" aria-label="Austral - Inicio">
          <img src="/Logo-cropped.png" alt="Austral" />
        </Link>

        {/* Enlaces (escritorio) */}
        <nav className="navbar-links" aria-label="Principal">
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.to}
              to={enlace.to}
              end={enlace.end}
              className={({ isActive }) =>
                "navbar-link" + (isActive ? " navbar-link--active" : "")
              }
            >
              {enlace.label}
            </NavLink>
          ))}
        </nav>

        {/* Acciones */}
        <div className="navbar-actions">

          <button
            type="button"
            className={
              "navbar-icon-button" +
              (busquedaAbierta ? " navbar-icon-button--active" : "")
            }
            onClick={alternarBusqueda}
            aria-label={busquedaAbierta ? "Cerrar búsqueda" : "Buscar"}
            aria-expanded={busquedaAbierta}
          >
            {busquedaAbierta ? (
              <X size={20} strokeWidth={2} />
            ) : (
              <Search size={20} strokeWidth={2} />
            )}
          </button>

          <Link
            to="/carrito"
            className="navbar-icon-button navbar-cart"
            aria-label={`Carrito (${cantidadTotal} productos)`}
          >
            <ShoppingBag size={20} strokeWidth={2} />

            {cantidadTotal > 0 && (
              <span className="navbar-cart-badge">
                {cantidadTotal > 99 ? "99+" : cantidadTotal}
              </span>
            )}
          </Link>

          {/* Perfil / login (escritorio) */}
          <div className="navbar-account">
            {usuario ? (
              <div className="navbar-profile" ref={perfilRef}>
                <button
                  type="button"
                  className="navbar-profile-button"
                  onClick={() => setMostrarPerfil((actual) => !actual)}
                  aria-label="Abrir menú de usuario"
                  aria-expanded={mostrarPerfil}
                >
                  <span>{obtenerIniciales()}</span>
                </button>

                {mostrarPerfil && (
                  <div className="navbar-profile-card">
                    <div className="navbar-profile-header">
                      <div className="navbar-profile-avatar">
                        {obtenerIniciales()}
                      </div>

                      <div className="navbar-profile-user-info">
                        <h3>
                          {usuario.nombre} {usuario.apellido}
                        </h3>

                        <span>{usuario.correo}</span>
                      </div>
                    </div>

                    <div className="navbar-profile-divider" />

                    <Link to="/perfil" className="navbar-profile-option">
                      <User size={18} />
                      <span>Mi perfil</span>
                    </Link>

                    <Link to="/mis-pedidos" className="navbar-profile-option">
                      <Package size={18} />
                      <span>Mis pedidos</span>
                    </Link>

                    {usuario.rol === "admin" && (
                      <Link to="/admin" className="navbar-profile-option">
                        <Shield size={18} />
                        <span>Panel administrativo</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      className="navbar-profile-logout"
                      onClick={manejarCerrarSesion}
                    >
                      <LogOut size={18} />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="navbar-login">
                Iniciar sesión
              </Link>
            )}
          </div>

          {/* Hamburguesa (celular) */}
          <button
            type="button"
            className="navbar-icon-button navbar-menu-button"
            onClick={() => {
              setBusquedaAbierta(false);
              setMenuAbierto((actual) => !actual);
            }}
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuAbierto}
          >
            {menuAbierto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ===================== PANEL DE BÚSQUEDA ===================== */}
      {busquedaAbierta && (
        <>
          <div className="navbar-search-backdrop" onClick={cerrarBusqueda} />

          <div className="navbar-search-panel" role="search">
            <div className="navbar-search-inner">
              <div className="navbar-search-field">
                <Search size={19} />

                <input
                  ref={inputRef}
                  type="search"
                  placeholder="Busca shampoo, jabón, oleato..."
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={manejarTeclas}
                  aria-label="Buscar productos"
                  autoComplete="off"
                />

                {texto && (
                  <button
                    type="button"
                    className="navbar-search-clear"
                    onClick={() => {
                      setTexto("");
                      inputRef.current?.focus();
                    }}
                    aria-label="Borrar búsqueda"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {terminoValido && (
                <div className="navbar-search-results">
                  {buscando && sugerencias.length === 0 ? (
                    <p className="navbar-search-status">Buscando...</p>
                  ) : sugerencias.length === 0 ? (
                    <p className="navbar-search-status">
                      No encontramos productos para "{texto.trim()}".
                    </p>
                  ) : (
                    <>
                      <ul>
                        {sugerencias.map((producto, index) => (
                          <li key={producto.id_producto}>
                            <button
                              type="button"
                              className={
                                "navbar-search-item" +
                                (index === resaltado
                                  ? " navbar-search-item--active"
                                  : "")
                              }
                              onMouseEnter={() => setResaltado(index)}
                              onClick={() => irAProducto(producto)}
                            >
                              <span className="navbar-search-thumb">
                                <SafeImage
                                  ruta={producto.imagen_principal}
                                  alt=""
                                  fallback={producto.nombre.charAt(0)}
                                />
                              </span>

                              <span className="navbar-search-text">
                                <span className="navbar-search-name">
                                  {resaltar(producto.nombre, texto)}
                                </span>

                                <span className="navbar-search-category">
                                  {producto.category?.nombre}
                                </span>
                              </span>

                              <span className="navbar-search-price">
                                {formatPrice(producto.precio)}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        className="navbar-search-all"
                        onClick={buscarTodo}
                      >
                        Ver todos los resultados →
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ===================== MENÚ MÓVIL ===================== */}
      {menuAbierto && (
        <>
          <div
            className="navbar-mobile-backdrop"
            onClick={() => setMenuAbierto(false)}
          />

          <nav className="navbar-mobile-menu" aria-label="Menú">
            {enlaces.map((enlace) => (
              <NavLink
                key={enlace.to}
                to={enlace.to}
                end={enlace.end}
                className={({ isActive }) =>
                  "navbar-mobile-link" +
                  (isActive ? " navbar-mobile-link--active" : "")
                }
              >
                {enlace.label}
              </NavLink>
            ))}

            <div className="navbar-mobile-divider" />

            {usuario ? (
              <>
                <div className="navbar-mobile-user">
                  <div className="navbar-profile-avatar">
                    {obtenerIniciales()}
                  </div>

                  <div>
                    <strong>
                      {usuario.nombre} {usuario.apellido}
                    </strong>
                    <span>{usuario.correo}</span>
                  </div>
                </div>

                <Link to="/perfil" className="navbar-mobile-link">
                  <User size={18} /> Mi perfil
                </Link>

                <Link to="/mis-pedidos" className="navbar-mobile-link">
                  <Package size={18} /> Mis pedidos
                </Link>

                {usuario.rol === "admin" && (
                  <Link to="/admin" className="navbar-mobile-link">
                    <Shield size={18} /> Panel administrativo
                  </Link>
                )}

                <button
                  type="button"
                  className="navbar-mobile-link navbar-mobile-logout"
                  onClick={manejarCerrarSesion}
                >
                  <LogOut size={18} /> Cerrar sesión
                </button>
              </>
            ) : (
              <div className="navbar-mobile-auth">
                <Link to="/login" className="navbar-mobile-login">
                  Iniciar sesión
                </Link>

                <Link to="/registro" className="navbar-mobile-register">
                  Crear cuenta
                </Link>
              </div>
            )}
          </nav>
        </>
      )}
    </header>
  );
}

export default Navbar;
