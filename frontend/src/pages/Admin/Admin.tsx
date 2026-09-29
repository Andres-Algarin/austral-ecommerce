import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Package,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  updateCategory,
  type Categoria,
} from "../../services/Category";

import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  updateProduct,
  type Producto,
} from "../../services/Product";

import { Link } from "react-router-dom";

import api from "../../api/axios";

import AdminOrders from "./AdminOrders";
import AdminClients from "./AdminClients";
import AdminInventory from "./AdminInventory";
import AdminProductGallery from "./AdminProductGallery";

import "./Admin.css";
import "./AdminSections.css";

/*
|--------------------------------------------------------------------------
| TIPOS
|--------------------------------------------------------------------------
*/

type ModuleItem = {
  id: string;
  tag: string;
  title: string;
  description: string;
  available: boolean;
};

/*
|--------------------------------------------------------------------------
| MÓDULOS DEL PANEL
|--------------------------------------------------------------------------
*/

type FiltroEstadoProducto =
  | "todos"
  | "visibles"
  | "ocultos"
  | "agotados"
  | "bajo";

const FILTROS_ESTADO_PRODUCTO: {
  id: FiltroEstadoProducto;
  label: string;
}[] = [
  { id: "todos", label: "Todos" },
  { id: "visibles", label: "Visibles" },
  { id: "ocultos", label: "Ocultos" },
  { id: "agotados", label: "Agotados" },
  { id: "bajo", label: "Stock bajo" },
];

/*
|--------------------------------------------------------------------------
| Quita tildes y pasa a minúsculas para buscar sin importar acentos
| ("calendula" encuentra "Caléndula").
|--------------------------------------------------------------------------
*/
const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const modules: ModuleItem[] = [
  {
    id: "categorias",
    tag: "CATÁLOGO",
    title: "Categorías",
    description:
      "Administra las categorías que estarán disponibles para los productos de Austral.",
    available: true,
  },
  {
    id: "productos",
    tag: "CATÁLOGO",
    title: "Productos",
    description:
      "Administra los productos disponibles en la tienda Austral.",
    available: true,
  },
  {
    id: "pedidos",
    tag: "VENTAS",
    title: "Pedidos",
    description:
      "Revisa los pedidos y actualiza su estado.",
    available: true,
  },
  {
    id: "clientes",
    tag: "USUARIOS",
    title: "Clientes",
    description:
      "Consulta los clientes y gestiona su acceso.",
    available: true,
  },
  {
    id: "inventario",
    tag: "STOCK",
    title: "Inventario",
    description:
      "Controla las existencias de tus productos.",
    available: true,
  },
];

/*
|--------------------------------------------------------------------------
| ICONOS
|--------------------------------------------------------------------------
*/

const icons: Record<string, ReactNode> = {
  categorias: (
    <path
      d="M12 2C12 2 7 7.5 7 12.5C7 15.9 9.24 18 12 18C14.76 18 17 15.9 17 12.5C17 7.5 12 2 12 2Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),

  productos: (
    <path
      d="M4 7L12 3L20 7M4 7V17L12 21M4 7L12 11M12 21L20 17V7M12 21V11M20 7L12 11"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  ),

  pedidos: (
    <path
      d="M6 3H18V21L15 19L12 21L9 19L6 21V3ZM9 8H15M9 12H15M9 16H13"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  ),

  clientes: (
    <path
      d="M16 14C18.2 14 20 15.8 20 18V20H4V18C4 15.8 5.8 14 8 14H16ZM12 12C9.79 12 8 10.21 8 8C8 5.79 9.79 4 12 4C14.21 4 16 5.79 16 8C16 10.21 14.21 12 12 12Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  ),

  inventario: (
    <path
      d="M4 8L12 4L20 8M4 8V16L12 20M4 8L12 12M12 20L20 16V8M12 20V12M20 8L12 12"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  ),
};

/*
|--------------------------------------------------------------------------
| URL DE IMÁGENES
|--------------------------------------------------------------------------
*/

function obtenerUrlImagen(
  imagen: string | null | undefined,
) {
  if (!imagen) {
    return "";
  }

  if (
    imagen.startsWith("http://") ||
    imagen.startsWith("https://")
  ) {
    return imagen;
  }

  const baseURL =
    api.defaults.baseURL ||
    "http://localhost:3000";

  if (imagen.startsWith("/")) {
    return `${baseURL}${imagen}`;
  }

  return `${baseURL}/${imagen}`;
}

/*
|--------------------------------------------------------------------------
| COMPONENTE
|--------------------------------------------------------------------------
*/

function Admin() {
  const { usuario } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | ESTADO GENERAL
  |--------------------------------------------------------------------------
  */

  const [activeId, setActiveId] =
    useState("categorias");

  const [error, setError] = useState("");

  // Mensajes informativos (no son errores).
  const [aviso, setAviso] = useState("");

  const [guardando, setGuardando] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | CATEGORÍAS
  |--------------------------------------------------------------------------
  */

  const [categorias, setCategorias] =
    useState<Categoria[]>([]);

  const [
    cargandoCategorias,
    setCargandoCategorias,
  ] = useState(true);

  const [
    mostrarFormularioCategoria,
    setMostrarFormularioCategoria,
  ] = useState(false);

  const [
    editandoCategoriaId,
    setEditandoCategoriaId,
  ] = useState<number | null>(null);

  const [nombreCategoria, setNombreCategoria] =
    useState("");

  const [imagenCategoria, setImagenCategoria] =
    useState<File | null>(null);

  /*
  |--------------------------------------------------------------------------
  | PRODUCTOS
  |--------------------------------------------------------------------------
  */

  const [productos, setProductos] =
    useState<Producto[]>([]);

  // Búsqueda y filtros de la lista de productos.
  const [busquedaProducto, setBusquedaProducto] =
    useState("");

  const [
    filtroCategoriaProducto,
    setFiltroCategoriaProducto,
  ] = useState<number | "">("");

  const [
    filtroEstadoProducto,
    setFiltroEstadoProducto,
  ] = useState<FiltroEstadoProducto>("todos");

  const [
    cargandoProductos,
    setCargandoProductos,
  ] = useState(false);

  const [
    mostrarFormularioProducto,
    setMostrarFormularioProducto,
  ] = useState(false);

  const [
    editandoProductoId,
    setEditandoProductoId,
  ] = useState<number | null>(null);

  const [nombreProducto, setNombreProducto] =
    useState("");

  const [
    idCategoriaProducto,
    setIdCategoriaProducto,
  ] = useState("");

  const [
    descripcionProducto,
    setDescripcionProducto,
  ] = useState("");

  const [
    beneficiosProducto,
    setBeneficiosProducto,
  ] = useState("");

  const [
    ingredientesProducto,
    setIngredientesProducto,
  ] = useState("");

  const [
    modoUsoProducto,
    setModoUsoProducto,
  ] = useState("");

  const [precioProducto, setPrecioProducto] =
    useState("");

  const [stockProducto, setStockProducto] =
    useState("");

  const [estadoProducto, setEstadoProducto] =
    useState(true);

  const [
    imagenPrincipalProducto,
    setImagenPrincipalProducto,
  ] = useState<File | null>(null);

  const [
    imagenProductoActual,
    setImagenProductoActual,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | CARGAR CATEGORÍAS
  |--------------------------------------------------------------------------
  */

  const cargarCategorias = async () => {
    try {
      setError("");
      setCargandoCategorias(true);

      const data = await getAdminCategories();

      setCategorias(data);
    } catch (error: any) {
      console.error(
        "Error cargando categorías:",
        error,
      );

      setError(
        error.response?.data?.message ||
          "No fue posible cargar las categorías.",
      );
    } finally {
      setCargandoCategorias(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CARGAR PRODUCTOS
  |--------------------------------------------------------------------------
  */

  const cargarProductos = async () => {
    try {
      setError("");
      setCargandoProductos(true);

      const data = await getAdminProducts();

      setProductos(data);
    } catch (error: any) {
      console.error(
        "Error cargando productos:",
        error,
      );

      setError(
        error.response?.data?.message ||
          "No fue posible cargar los productos.",
      );
    } finally {
      setCargandoProductos(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CARGA INICIAL
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    cargarCategorias();
    cargarProductos();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CREAR CATEGORÍA
  |--------------------------------------------------------------------------
  */

  const abrirCrearCategoria = () => {
    setEditandoCategoriaId(null);

    setNombreCategoria("");

    setImagenCategoria(null);

    setError("");

    setMostrarFormularioCategoria(true);
  };

  /*
  |--------------------------------------------------------------------------
  | EDITAR CATEGORÍA
  |--------------------------------------------------------------------------
  */

  const abrirEditarCategoria = (
    categoria: Categoria,
  ) => {
    setEditandoCategoriaId(
      categoria.id_categoria,
    );

    setNombreCategoria(categoria.nombre);

    setImagenCategoria(null);

    setError("");

    setMostrarFormularioCategoria(true);
  };

  /*
  |--------------------------------------------------------------------------
  | CERRAR FORMULARIO CATEGORÍA
  |--------------------------------------------------------------------------
  */

  const cerrarFormularioCategoria = () => {
    if (guardando) {
      return;
    }

    setMostrarFormularioCategoria(false);

    setEditandoCategoriaId(null);

    setNombreCategoria("");

    setImagenCategoria(null);

    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | GUARDAR CATEGORÍA
  |--------------------------------------------------------------------------
  */

  const guardarCategoria = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!nombreCategoria.trim()) {
      setError(
        "El nombre de la categoría es obligatorio.",
      );

      return;
    }

    if (
      editandoCategoriaId === null &&
      !imagenCategoria
    ) {
      setError(
        "Debes seleccionar una imagen para la categoría.",
      );

      return;
    }

    try {
      setGuardando(true);
      setError("");

      const datos = {
        nombre: nombreCategoria.trim(),
        imagen: imagenCategoria,
      };

      if (editandoCategoriaId !== null) {
        await updateCategory(
          editandoCategoriaId,
          datos,
        );
      } else {
        await createCategory(datos);
      }

      await cargarCategorias();

      cerrarFormularioCategoria();
    } catch (error: any) {
      console.error(
        "Error guardando categoría:",
        error.response?.data || error,
      );

      setError(
        error.response?.data?.message ||
          "No fue posible guardar la categoría.",
      );
    } finally {
      setGuardando(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | ELIMINAR CATEGORÍA
  |--------------------------------------------------------------------------
  */

  const eliminarCategoria = async (
    categoria: Categoria,
  ) => {
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`,
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");

      await deleteCategory(
        categoria.id_categoria,
      );

      await cargarCategorias();
    } catch (error: any) {
      console.error(
        "Error eliminando categoría:",
        error.response?.data || error,
      );

      setError(
        error.response?.data?.message ||
          "No fue posible eliminar la categoría.",
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CAMBIAR ESTADO CATEGORÍA
  |--------------------------------------------------------------------------
  */

  const cambiarEstadoCategoria = async (
    categoria: Categoria,
  ) => {
    try {
      setError("");

      const nuevoEstado =
        !categoria.estado;

      await updateCategory(
        categoria.id_categoria,
        {
          estado: nuevoEstado,
        },
      );

      setCategorias(
        (categoriasActuales) =>
          categoriasActuales.map(
            (item) =>
              item.id_categoria ===
              categoria.id_categoria
                ? {
                    ...item,
                    estado: nuevoEstado,
                  }
                : item,
          ),
      );
    } catch (error: any) {
      console.error(
        "Error cambiando estado:",
        error.response?.data || error,
      );

      setError(
        error.response?.data?.message ||
          "No fue posible cambiar el estado de la categoría.",
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CREAR PRODUCTO
  |--------------------------------------------------------------------------
  */

  const abrirCrearProducto = () => {
    setEditandoProductoId(null);

    setNombreProducto("");

    setIdCategoriaProducto("");

    setDescripcionProducto("");

    setBeneficiosProducto("");

    setIngredientesProducto("");

    setModoUsoProducto("");

    setPrecioProducto("");

    setStockProducto("");

    setEstadoProducto(true);

    setImagenPrincipalProducto(null);

    setImagenProductoActual("");

    setError("");

    setMostrarFormularioProducto(true);
  };

  /*
  |--------------------------------------------------------------------------
  | EDITAR PRODUCTO
  |--------------------------------------------------------------------------
  */

  const abrirEditarProducto = (
    producto: Producto,
  ) => {
    setEditandoProductoId(
      producto.id_producto,
    );

    setNombreProducto(producto.nombre);

    setIdCategoriaProducto(
      String(producto.id_categoria),
    );

    setDescripcionProducto(
      producto.descripcion || "",
    );

    setBeneficiosProducto(
      producto.beneficios || "",
    );

    setIngredientesProducto(
      producto.ingredientes || "",
    );

    setModoUsoProducto(
      producto.modo_uso || "",
    );

    setPrecioProducto(
      String(producto.precio),
    );

    setStockProducto(
      String(producto.stock),
    );

    setEstadoProducto(
      producto.estado ?? true,
    );

    setImagenPrincipalProducto(null);

    setImagenProductoActual(
      producto.imagen_principal || "",
    );

    setError("");

    setMostrarFormularioProducto(true);
  };

  /*
  |--------------------------------------------------------------------------
  | CERRAR FORMULARIO PRODUCTO
  |--------------------------------------------------------------------------
  */

  const cerrarFormularioProducto = () => {
    if (guardando) {
      return;
    }

    setMostrarFormularioProducto(false);

    setEditandoProductoId(null);

    setNombreProducto("");

    setIdCategoriaProducto("");

    setDescripcionProducto("");

    setBeneficiosProducto("");

    setIngredientesProducto("");

    setModoUsoProducto("");

    setPrecioProducto("");

    setStockProducto("");

    setEstadoProducto(true);

    setImagenPrincipalProducto(null);

    setImagenProductoActual("");

    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | GUARDAR PRODUCTO
  |--------------------------------------------------------------------------
  */

  const guardarProducto = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const nombre =
      nombreProducto.trim();

    const idCategoria =
      Number(idCategoriaProducto);

    const precio =
      Number(precioProducto);

    const stock =
      Number(stockProducto);

    /*
    |--------------------------------------------------------------------------
    | VALIDAR NOMBRE
    |--------------------------------------------------------------------------
    */

    if (!nombre) {
      setError(
        "El nombre del producto es obligatorio.",
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDAR CATEGORÍA
    |--------------------------------------------------------------------------
    */

    if (
      !idCategoriaProducto ||
      !Number.isInteger(idCategoria) ||
      idCategoria < 1
    ) {
      setError(
        "Debes seleccionar una categoría válida.",
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDAR PRECIO
    |--------------------------------------------------------------------------
    */

    if (
      precioProducto.trim() === "" ||
      Number.isNaN(precio) ||
      precio < 0
    ) {
      setError(
        "El precio debe ser un número mayor o igual a 0.",
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDAR STOCK
    |--------------------------------------------------------------------------
    */

    if (
      stockProducto.trim() === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError(
        "El stock debe ser un número entero mayor o igual a 0.",
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDAR IMAGEN AL CREAR
    |--------------------------------------------------------------------------
    */

    if (
      editandoProductoId === null &&
      !imagenPrincipalProducto
    ) {
      setError(
        "Debes seleccionar una imagen para el producto.",
      );

      return;
    }

    try {
      setGuardando(true);
      setError("");

      /*
      |--------------------------------------------------------------------------
      | DATOS DEL PRODUCTO
      |--------------------------------------------------------------------------
      */

      const datos = {
        id_categoria: idCategoria,

        nombre,

        descripcion:
          descripcionProducto.trim(),

        beneficios:
          beneficiosProducto.trim(),

        ingredientes:
          ingredientesProducto.trim(),

        modo_uso:
          modoUsoProducto.trim(),

        precio,

        stock,

        estado: estadoProducto,

        imagen_principal:
          imagenPrincipalProducto,
      };

      /*
      |--------------------------------------------------------------------------
      | CREAR / EDITAR
      |--------------------------------------------------------------------------
      */

      if (editandoProductoId !== null) {
        await updateProduct(
          editandoProductoId,
          datos,
        );
      } else {
        await createProduct(datos);
      }

      /*
      |--------------------------------------------------------------------------
      | RECARGAR
      |--------------------------------------------------------------------------
      */

      await cargarProductos();

      cerrarFormularioProducto();
    } catch (error: any) {
      console.error(
        "ERROR PRODUCTO:",
        error.response?.data || error,
      );

      const mensaje =
        error.response?.data?.message;

      if (Array.isArray(mensaje)) {
        setError(
          mensaje.join(" "),
        );
      } else {
        setError(
          mensaje ||
            "No fue posible guardar el producto.",
        );
      }
    } finally {
      setGuardando(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | ELIMINAR PRODUCTO
  |--------------------------------------------------------------------------
  */

  const eliminarProducto = async (
    producto: Producto,
  ) => {
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar el producto "${producto.nombre}"?`,
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");
      setAviso("");

      const respuesta = await deleteProduct(
        producto.id_producto,
      );

      // Si el producto tiene pedidos, el backend lo desactiva
      // en lugar de eliminarlo y lo explica en el mensaje.
      if (respuesta.eliminado === false) {
        setAviso(respuesta.message);
      }

      await cargarProductos();
    } catch (error: any) {
      console.error(
        "Error eliminando producto:",
        error.response?.data || error,
      );

      setError(
        error.response?.data?.message ||
          "No fue posible eliminar el producto.",
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PRODUCTO ACTIVO
  |--------------------------------------------------------------------------
  */

  const terminoProducto = normalizar(
    busquedaProducto.trim(),
  );

  const productosFiltrados = productos.filter(
    (producto) => {
      if (
        filtroCategoriaProducto !== "" &&
        producto.id_categoria !==
          filtroCategoriaProducto
      ) {
        return false;
      }

      switch (filtroEstadoProducto) {
        case "visibles":
          if (!producto.estado) return false;
          break;
        case "ocultos":
          if (producto.estado) return false;
          break;
        case "agotados":
          if (producto.stock > 0) return false;
          break;
        case "bajo":
          if (
            producto.stock <= 0 ||
            producto.stock > 5
          ) {
            return false;
          }
          break;
      }

      if (!terminoProducto) {
        return true;
      }

      return [
        producto.nombre,
        producto.descripcion,
        producto.category?.nombre,
      ].some(
        (valor) =>
          valor &&
          normalizar(valor).includes(
            terminoProducto,
          ),
      );
    },
  );

  const hayFiltrosProducto =
    terminoProducto !== "" ||
    filtroCategoriaProducto !== "" ||
    filtroEstadoProducto !== "todos";

  const limpiarFiltrosProducto = () => {
    setBusquedaProducto("");
    setFiltroCategoriaProducto("");
    setFiltroEstadoProducto("todos");
  };

  const active =
    modules.find(
      (module) =>
        module.id === activeId,
    ) ?? modules[0];

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <main className="admin-page">
      <div className="admin-shell">

        {/* ================================================================
            SIDEBAR
        ================================================================= */}

        <aside className="admin-sidebar">

          <div className="admin-sidebar-brand">
            <img
              src="/Logo.png"
              alt="Austral"
              className="admin-sidebar-logo"
            />
          </div>

          <span className="admin-sidebar-label">
            ADMINISTRACIÓN
          </span>

          <nav className="admin-nav">

            {modules.map((mod) => (
              <button
                key={mod.id}
                type="button"
                className={
                  "admin-nav-item" +
                  (mod.id === activeId
                    ? " admin-nav-item--active"
                    : "") +
                  (!mod.available
                    ? " admin-nav-item--soon"
                    : "")
                }
                onClick={() => {
                  if (!mod.available) {
                    return;
                  }

                  setActiveId(mod.id);

                  setError("");

                  if (
                    mod.id ===
                    "productos"
                  ) {
                    cargarProductos();
                  }

                  if (
                    mod.id ===
                    "categorias"
                  ) {
                    cargarCategorias();
                  }
                }}
              >

                <span className="admin-nav-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    {icons[mod.id]}
                  </svg>
                </span>

                <span className="admin-nav-text">

                  <span className="admin-nav-title">
                    {mod.title}
                  </span>

                  {!mod.available && (
                    <span className="admin-nav-soon">
                      Próximamente
                    </span>
                  )}

                </span>

              </button>
            ))}

          </nav>

          <Link
            to="/"
            className="admin-back-button"
          >
            ← Volver al inicio
          </Link>

        </aside>

        {/* ================================================================
            CONTENIDO PRINCIPAL
        ================================================================= */}

        <section className="admin-container">

          {/* HEADER */}

          <div className="admin-header">

            <span className="admin-label">
              ADMINISTRACIÓN · AUSTRAL
            </span>

            <h1>
              Panel administrativo
            </h1>

            <p>
              Bienvenido,{" "}
              {usuario?.nombre}.
              Desde aquí podrás gestionar
              los diferentes elementos de tu
              tienda Austral.
            </p>

          </div>

          {/* DIVISOR */}

          <div
            className="admin-divider"
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          {/* ==============================================================
              CATEGORÍAS
          =============================================================== */}

          {activeId === "categorias" && (
            <section className="admin-content">

              <div className="admin-content-header">

                <div>

                  <span className="admin-module-label">
                    CATÁLOGO
                  </span>

                  <h2>
                    {active.title}
                  </h2>

                  <p>
                    Administra las categorías
                    disponibles para los
                    productos de Austral.
                  </p>

                </div>

              </div>

              {error && (
                <div className="admin-error">
                  {error}
                </div>
              )}

              {cargandoCategorias ? (

                <div className="admin-status">
                  Cargando categorías...
                </div>

              ) : categorias.length === 0 ? (

                <div className="admin-empty">

                  <div className="admin-empty-icon">
                    <Plus size={25} />
                  </div>

                  <h3>
                    Aún no hay categorías
                  </h3>

                  <p>
                    Crea la primera categoría
                    para comenzar a organizar
                    los productos de Austral.
                  </p>

                  <button
                    type="button"
                    className="admin-empty-button"
                    onClick={
                      abrirCrearCategoria
                    }
                  >
                    Agregar categoría
                  </button>

                </div>

              ) : (

                <div className="admin-category-grid">

                  {/* NUEVA CATEGORÍA */}

                  <button
                    type="button"
                    className="admin-category-add-card"
                    onClick={
                      abrirCrearCategoria
                    }
                  >

                    <span className="admin-category-add-icon">
                      <Plus size={30} />
                    </span>

                    <span className="admin-category-add-title">
                      Nueva categoría
                    </span>

                    <span className="admin-category-add-text">
                      Agrega una nueva categoría
                    </span>

                  </button>

                  {/* CATEGORÍAS */}

                  {categorias.map(
                    (categoria) => (
                      <article
                        key={
                          categoria.id_categoria
                        }
                        className={
                          "admin-category-card" +
                          (!categoria.estado
                            ? " admin-category-card--inactive"
                            : "")
                        }
                      >

                        <div className="admin-category-image">

                          {categoria.imagen ? (

                            <img
                              src={obtenerUrlImagen(
                                categoria.imagen,
                              )}
                              alt={
                                categoria.nombre
                              }
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";
                              }}
                            />

                          ) : (

                            <span>
                              {categoria.nombre
                                .charAt(0)
                                .toUpperCase()}
                            </span>

                          )}

                        </div>

                        <div className="admin-category-info">

                          <div className="admin-category-title-row">

                            <h3>
                              {
                                categoria.nombre
                              }
                            </h3>

                            <span
                              className={
                                "admin-category-status" +
                                (categoria.estado
                                  ? " admin-category-status--active"
                                  : " admin-category-status--inactive")
                              }
                            >
                              {categoria.estado
                                ? "Activa"
                                : "Oculta"}
                            </span>

                          </div>

                          <p>
                            {categoria.estado
                              ? "Visible en la tienda."
                              : "No se muestra en la tienda."}
                          </p>

                        </div>

                        <div className="admin-category-actions">

                          {/* ESTADO */}

                          <button
                            type="button"
                            className="admin-category-action"
                            onClick={() =>
                              cambiarEstadoCategoria(
                                categoria,
                              )
                            }
                            title={
                              categoria.estado
                                ? "Ocultar categoría"
                                : "Mostrar categoría"
                            }
                            aria-label={
                              categoria.estado
                                ? `Ocultar ${categoria.nombre}`
                                : `Mostrar ${categoria.nombre}`
                            }
                          >
                            {categoria.estado ? (
                              <Eye size={18} />
                            ) : (
                              <EyeOff
                                size={18}
                              />
                            )}
                          </button>

                          {/* EDITAR */}

                          <button
                            type="button"
                            className="admin-category-action"
                            onClick={() =>
                              abrirEditarCategoria(
                                categoria,
                              )
                            }
                            title="Editar categoría"
                            aria-label={`Editar ${categoria.nombre}`}
                          >
                            <Pencil size={18} />
                          </button>

                          {/* ELIMINAR */}

                          <button
                            type="button"
                            className="admin-category-action admin-category-action--delete"
                            onClick={() =>
                              eliminarCategoria(
                                categoria,
                              )
                            }
                            title="Eliminar categoría"
                            aria-label={`Eliminar ${categoria.nombre}`}
                          >
                            <Trash2 size={18} />
                          </button>

                        </div>

                      </article>
                    ),
                  )}

                </div>
              )}

            </section>
          )}

          {/* ==============================================================
              PRODUCTOS
          =============================================================== */}

          {activeId === "productos" && (
            <section className="admin-content">

              <div className="admin-content-header">

                <div>

                  <span className="admin-module-label">
                    CATÁLOGO
                  </span>

                  <h2>
                    {active.title}
                  </h2>

                  <p>
                    Administra los productos
                    disponibles para la tienda
                    Austral.
                  </p>

                </div>

              </div>

              {error && (
                <div className="admin-error">
                  {error}
                </div>
              )}

              {aviso && (
                <div className="admin-notice">
                  {aviso}
                </div>
              )}

              {/* BÚSQUEDA Y FILTROS */}

              <div className="admin-toolbar">
                <div className="admin-chips">
                  {FILTROS_ESTADO_PRODUCTO.map(
                    (filtro) => (
                      <button
                        key={filtro.id}
                        type="button"
                        className={
                          "admin-chip" +
                          (filtroEstadoProducto ===
                          filtro.id
                            ? " admin-chip--active"
                            : "")
                        }
                        onClick={() =>
                          setFiltroEstadoProducto(
                            filtro.id,
                          )
                        }
                      >
                        {filtro.label}
                      </button>
                    ),
                  )}
                </div>

                <div className="admin-toolbar-group">
                  <select
                    className="admin-select"
                    value={filtroCategoriaProducto}
                    onChange={(e) =>
                      setFiltroCategoriaProducto(
                        e.target.value
                          ? Number(e.target.value)
                          : "",
                      )
                    }
                    aria-label="Filtrar por categoría"
                  >
                    <option value="">
                      Todas las categorías
                    </option>

                    {categorias.map((categoria) => (
                      <option
                        key={categoria.id_categoria}
                        value={categoria.id_categoria}
                      >
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>

                  <input
                    type="search"
                    className="admin-search"
                    placeholder="Buscar producto"
                    value={busquedaProducto}
                    onChange={(e) =>
                      setBusquedaProducto(
                        e.target.value,
                      )
                    }
                  />
                </div>
              </div>

              {!cargandoProductos && (
                <div className="admin-results">
                  <span>
                    {hayFiltrosProducto
                      ? `${productosFiltrados.length} de ${productos.length} productos`
                      : `${productos.length} productos`}
                  </span>

                  {hayFiltrosProducto && (
                    <button
                      type="button"
                      className="admin-text-button"
                      onClick={limpiarFiltrosProducto}
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              )}

              {cargandoProductos ? (

                <div className="admin-status">
                  Cargando productos...
                </div>

              ) : (

                <div className="admin-product-grid">

                  {/* NUEVO PRODUCTO */}

                  <button
                    type="button"
                    className="admin-product-add-card"
                    onClick={
                      abrirCrearProducto
                    }
                  >

                    <span className="admin-product-add-icon">
                      <Plus size={30} />
                    </span>

                    <span className="admin-product-add-title">
                      Nuevo producto
                    </span>

                    <span className="admin-product-add-text">
                      Agrega un nuevo producto
                    </span>

                  </button>

                  {/* PRODUCTOS */}

                  {productosFiltrados.map(
                    (producto) => (
                      <article
                        key={
                          producto.id_producto
                        }
                        className={
                          "admin-product-card" +
                          (!producto.estado
                            ? " admin-product-card--inactive"
                            : "")
                        }
                      >

                        <div className="admin-product-image">

                          {producto.imagen_principal ? (

                            <img
                              src={obtenerUrlImagen(
                                producto.imagen_principal,
                              )}
                              alt={
                                producto.nombre
                              }
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";
                              }}
                            />

                          ) : (

                            <Package size={42} />

                          )}

                        </div>

                        <div className="admin-product-info">

                          <div className="admin-product-title-row">

                            <h3>
                              {
                                producto.nombre
                              }
                            </h3>

                            <span
                              className={
                                "admin-product-status" +
                                (producto.estado &&
                                producto.stock > 0
                                  ? " admin-product-status--active"
                                  : " admin-product-status--inactive")
                              }
                            >
                              {!producto.estado
                                ? "Oculto"
                                : producto.stock >
                                    0
                                  ? "Disponible"
                                  : "Agotado"}
                            </span>

                          </div>

                          <p className="admin-product-category">
                            {producto.category
                              ?.nombre ||
                              `Categoría #${producto.id_categoria}`}
                          </p>

                          <div className="admin-product-meta">

                            <span>
                              $
                              {Number(
                                producto.precio,
                              ).toLocaleString(
                                "es-CO",
                              )}
                            </span>

                            <span>
                              Stock:{" "}
                              {
                                producto.stock
                              }
                            </span>

                          </div>

                        </div>

                        <div className="admin-product-actions">

                          <button
                            type="button"
                            className="admin-category-action"
                            onClick={() =>
                              abrirEditarProducto(
                                producto,
                              )
                            }
                            title="Editar producto"
                            aria-label={`Editar ${producto.nombre}`}
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            type="button"
                            className="admin-category-action admin-category-action--delete"
                            onClick={() =>
                              eliminarProducto(
                                producto,
                              )
                            }
                            title="Eliminar producto"
                            aria-label={`Eliminar ${producto.nombre}`}
                          >
                            <Trash2 size={18} />
                          </button>

                        </div>

                      </article>
                    ),
                  )}

                </div>
              )}

            </section>
          )}

          {activeId === "pedidos" && <AdminOrders />}

          {activeId === "clientes" && <AdminClients />}

          {activeId === "inventario" && <AdminInventory />}
        </section>
      </div>

      {/* ================================================================
          MODAL CATEGORÍA
      ================================================================= */}

      {mostrarFormularioCategoria && (

        <div
          className="admin-modal-overlay"
          onMouseDown={
            cerrarFormularioCategoria
          }
        >

          <div
            className="admin-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >

            <div className="admin-modal-header">

              <div>

                <span className="admin-module-label">
                  {editandoCategoriaId !==
                  null
                    ? "EDITAR"
                    : "NUEVA CATEGORÍA"}
                </span>

                <h2>
                  {editandoCategoriaId !==
                  null
                    ? "Editar categoría"
                    : "Agregar categoría"}
                </h2>

              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={
                  cerrarFormularioCategoria
                }
                disabled={guardando}
                aria-label="Cerrar"
              >
                ×
              </button>

            </div>

            <form
              className="admin-category-form"
              onSubmit={guardarCategoria}
            >

              <div className="admin-form-field">

                <label htmlFor="categoria-nombre">
                  Nombre de la categoría
                </label>

                <input
                  id="categoria-nombre"
                  type="text"
                  value={nombreCategoria}
                  onChange={(e) =>
                    setNombreCategoria(
                      e.target.value,
                    )
                  }
                  placeholder="Ej. Shampoo"
                  required
                />

              </div>

              <div className="admin-form-field">

                <label htmlFor="categoria-imagen">
                  Imagen de la categoría
                </label>

                <input
                  id="categoria-imagen"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImagenCategoria(
                      e.target.files?.[0] ??
                        null,
                    )
                  }
                />

                <span className="admin-form-help">
                  Selecciona una imagen desde tu computador.
                </span>

              </div>

              {error && (
                <div className="admin-error">
                  {error}
                </div>
              )}

              <div className="admin-modal-actions">

                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={
                    cerrarFormularioCategoria
                  }
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="admin-save-button"
                  disabled={guardando}
                >
                  {guardando
                    ? "Guardando..."
                    : editandoCategoriaId !==
                        null
                      ? "Guardar cambios"
                      : "Crear categoría"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ================================================================
          MODAL PRODUCTO
      ================================================================= */}

      {mostrarFormularioProducto && (

        <div
          className="admin-modal-overlay"
          onMouseDown={
            cerrarFormularioProducto
          }
        >

          <div
            className="admin-modal admin-product-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >

            <div className="admin-modal-header">

              <div>

                <span className="admin-module-label">
                  {editandoProductoId !==
                  null
                    ? "EDITAR"
                    : "NUEVO PRODUCTO"}
                </span>

                <h2>
                  {editandoProductoId !==
                  null
                    ? "Editar producto"
                    : "Agregar producto"}
                </h2>

              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={
                  cerrarFormularioProducto
                }
                disabled={guardando}
                aria-label="Cerrar"
              >
                ×
              </button>

            </div>

            <form
              className="admin-product-form"
              onSubmit={guardarProducto}
            >

              <div className="admin-product-form-grid">

                {/* NOMBRE */}

                <div className="admin-form-field">

                  <label htmlFor="producto-nombre">
                    Nombre del producto
                  </label>

                  <input
                    id="producto-nombre"
                    type="text"
                    value={nombreProducto}
                    onChange={(e) =>
                      setNombreProducto(
                        e.target.value,
                      )
                    }
                    placeholder="Ej. Shampoo Reparador"
                    required
                  />

                </div>

                {/* CATEGORÍA */}

                <div className="admin-form-field">

                  <label htmlFor="producto-categoria">
                    Categoría
                  </label>

                  <select
                    id="producto-categoria"
                    value={
                      idCategoriaProducto
                    }
                    onChange={(e) =>
                      setIdCategoriaProducto(
                        e.target.value,
                      )
                    }
                    required
                  >

                    <option value="">
                      Selecciona una categoría
                    </option>

                    {categorias.map(
                      (categoria) => (

                        <option
                          key={
                            categoria.id_categoria
                          }
                          value={
                            categoria.id_categoria
                          }
                        >
                          {
                            categoria.nombre
                          }
                        </option>

                      ),
                    )}

                  </select>

                  {categorias.length ===
                    0 && (
                    <span className="admin-form-help">
                      Primero debes crear una categoría.
                    </span>
                  )}

                </div>

                {/* DESCRIPCIÓN */}

                <div className="admin-form-field admin-product-form-field--full">

                  <label htmlFor="producto-descripcion">
                    Descripción
                  </label>

                  <textarea
                    id="producto-descripcion"
                    value={
                      descripcionProducto
                    }
                    onChange={(e) =>
                      setDescripcionProducto(
                        e.target.value,
                      )
                    }
                    placeholder="Describe el producto..."
                    rows={4}
                  />

                </div>

                {/* PRECIO */}

                <div className="admin-form-field">

                  <label htmlFor="producto-precio">
                    Precio
                  </label>

                  <input
                    id="producto-precio"
                    type="number"
                    min="0"
                    step="0.01"
                    value={precioProducto}
                    onChange={(e) =>
                      setPrecioProducto(
                        e.target.value,
                      )
                    }
                    placeholder="Ej. 45000"
                    required
                  />

                </div>

                {/* STOCK */}

                <div className="admin-form-field">

                  <label htmlFor="producto-stock">
                    Stock
                  </label>

                  <input
                    id="producto-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={stockProducto}
                    onChange={(e) =>
                      setStockProducto(
                        e.target.value,
                      )
                    }
                    placeholder="Ej. 20"
                    required
                  />

                </div>

                {/* ESTADO */}

                <div className="admin-form-field">

                  <label htmlFor="producto-estado">
                    Estado
                  </label>

                  <select
                    id="producto-estado"
                    value={
                      estadoProducto
                        ? "true"
                        : "false"
                    }
                    onChange={(e) =>
                      setEstadoProducto(
                        e.target.value ===
                          "true",
                      )
                    }
                  >

                    <option value="true">
                      Activo
                    </option>

                    <option value="false">
                      Oculto
                    </option>

                  </select>

                  <span className="admin-form-help">
                    Los productos ocultos no se mostrarán en la tienda.
                  </span>

                </div>

                {/* BENEFICIOS */}

                <div className="admin-form-field admin-product-form-field--full">

                  <label htmlFor="producto-beneficios">
                    Beneficios
                  </label>

                  <textarea
                    id="producto-beneficios"
                    value={
                      beneficiosProducto
                    }
                    onChange={(e) =>
                      setBeneficiosProducto(
                        e.target.value,
                      )
                    }
                    placeholder="Beneficios principales del producto..."
                    rows={3}
                  />

                </div>

                {/* INGREDIENTES */}

                <div className="admin-form-field">

                  <label htmlFor="producto-ingredientes">
                    Ingredientes
                  </label>

                  <textarea
                    id="producto-ingredientes"
                    value={
                      ingredientesProducto
                    }
                    onChange={(e) =>
                      setIngredientesProducto(
                        e.target.value,
                      )
                    }
                    placeholder="Ingredientes..."
                    rows={3}
                  />

                </div>

                {/* MODO DE USO */}

                <div className="admin-form-field">

                  <label htmlFor="producto-modo-uso">
                    Modo de uso
                  </label>

                  <textarea
                    id="producto-modo-uso"
                    value={
                      modoUsoProducto
                    }
                    onChange={(e) =>
                      setModoUsoProducto(
                        e.target.value,
                      )
                    }
                    placeholder="Indica cómo utilizar el producto..."
                    rows={3}
                  />

                </div>

                {/* IMAGEN */}

                <div className="admin-form-field admin-product-form-field--full">

                  <label htmlFor="producto-imagen">
                    Imagen principal
                  </label>

                  <input
                    id="producto-imagen"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setImagenPrincipalProducto(
                        e.target.files?.[0] ??
                          null,
                      )
                    }
                  />

                  <span className="admin-form-help">

                    {editandoProductoId !==
                      null &&
                    imagenProductoActual
                      ? "Selecciona una nueva imagen solamente si deseas reemplazar la actual."
                      : "Selecciona una imagen desde tu computador. Máximo 5 MB."}

                  </span>

                  {/* IMAGEN ACTUAL */}

                  {editandoProductoId !==
                    null &&
                    imagenProductoActual && (

                      <div className="admin-product-current-image">

                        <img
                          src={obtenerUrlImagen(
                            imagenProductoActual,
                          )}
                          alt="Imagen actual del producto"
                        />

                        <span>
                          Imagen actual
                        </span>

                      </div>

                    )}

                  {/* ARCHIVO NUEVO */}

                  {imagenPrincipalProducto && (

                    <span className="admin-form-file-name">

                      Archivo seleccionado:{" "}

                      {
                        imagenPrincipalProducto.name
                      }

                    </span>

                  )}

                </div>

              </div>

              {/* GALERÍA (solo al editar un producto existente) */}

              {editandoProductoId !== null && (
                <AdminProductGallery
                  id_producto={editandoProductoId}
                  onPrincipalChange={cargarProductos}
                />
              )}

              {/* ERROR */}

              {error && (
                <div className="admin-error">
                  {error}
                </div>
              )}

              {/* BOTONES */}

              <div className="admin-modal-actions">

                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={
                    cerrarFormularioProducto
                  }
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="admin-save-button"
                  disabled={
                    guardando ||
                    categorias.length ===
                      0
                  }
                >
                  {guardando
                    ? "Guardando..."
                    : editandoProductoId !==
                        null
                      ? "Guardar cambios"
                      : "Crear producto"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}

export default Admin;