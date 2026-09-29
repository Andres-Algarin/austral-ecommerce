import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import {
  getUsers,
  updateUserRole,
  updateUserStatus,
  type Cliente,
  type FiltrosClientes,
} from "../../services/AdminUsers";
import type { Paginado } from "../../services/Product";
import { apiErrorMessage, formatDate } from "../../utils/format";

import "./AdminSections.css";

type Filtro = "todos" | "activos" | "inactivos" | "admins";

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "activos", label: "Activos" },
  { id: "inactivos", label: "Inactivos" },
  { id: "admins", label: "Administradores" },
];

const POR_PAGINA = 15;

type Accion =
  | { tipo: "estado"; cliente: Cliente }
  | { tipo: "rol"; cliente: Cliente };

function AdminClients() {
  const { usuario } = useAuth();

  const [resultado, setResultado] = useState<Paginado<Cliente> | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [texto, setTexto] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [accion, setAccion] = useState<Accion | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Espera a que se deje de escribir antes de buscar.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setBusqueda(texto.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(t);
  }, [texto]);

  useEffect(() => {
    const filtros: FiltrosClientes = {
      page,
      limit: POR_PAGINA,
      ...(busqueda && { q: busqueda }),
      ...(filtro === "activos" && { estado: true }),
      ...(filtro === "inactivos" && { estado: false }),
      ...(filtro === "admins" && { rol: "admin" as const }),
    };

    let cancelado = false;

    setCargando(true);
    setError("");

    getUsers(filtros)
      .then((data) => !cancelado && setResultado(data))
      .catch((err) => !cancelado && setError(apiErrorMessage(err, "No fue posible cargar los clientes.")))
      .finally(() => !cancelado && setCargando(false));

    return () => {
      cancelado = true;
    };
  }, [filtro, busqueda, page]);

  const confirmar = async () => {
    if (!accion) {
      return;
    }

    setGuardando(true);
    setError("");

    try {
      const { cliente } = accion;

      const actualizado =
        accion.tipo === "estado"
          ? await updateUserStatus(cliente.id_usuario, !cliente.estado)
          : await updateUserRole(
              cliente.id_usuario,
              cliente.rol === "admin" ? "cliente" : "admin"
            );

      setResultado((actual) =>
        actual && {
          ...actual,
          data: actual.data.map((c) =>
            c.id_usuario === actualizado.id_usuario ? actualizado : c
          ),
        }
      );

      setAccion(null);
    } catch (err) {
      setError(apiErrorMessage(err, "No fue posible actualizar el usuario."));
    } finally {
      setGuardando(false);
    }
  };

  const mensajeConfirmacion = () => {
    if (!accion) {
      return "";
    }

    const nombre = `${accion.cliente.nombre} ${accion.cliente.apellido}`;

    if (accion.tipo === "estado") {
      return accion.cliente.estado
        ? `¿Desactivar a ${nombre}? No podrá iniciar sesión y se cerrarán sus sesiones abiertas.`
        : `¿Reactivar a ${nombre}? Podrá volver a iniciar sesión.`;
    }

    return accion.cliente.rol === "admin"
      ? `¿Quitar el acceso de administrador a ${nombre}?`
      : `¿Dar acceso de administrador a ${nombre}? Podrá gestionar productos, pedidos y clientes.`;
  };

  return (
    <section className="admin-content">
      <div className="admin-content-header">
        <div>
          <span className="admin-module-label">USUARIOS</span>
          <h2>Clientes</h2>
          <p>Consulta los clientes registrados y gestiona su acceso.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-chips">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={"admin-chip" + (filtro === f.id ? " admin-chip--active" : "")}
              onClick={() => {
                setFiltro(f.id);
                setPage(1);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          className="admin-search"
          placeholder="Buscar por nombre, correo o cédula"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </div>

      {error && <div className="admin-error">{error}</div>}

      {accion && (
        <div className="admin-confirm">
          <p>{mensajeConfirmacion()}</p>
          <div>
            <button
              type="button"
              className="admin-cancel-button"
              onClick={() => setAccion(null)}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={
                accion.tipo === "estado" && accion.cliente.estado
                  ? "admin-danger-button"
                  : "admin-save-button"
              }
              onClick={confirmar}
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Confirmar"}
            </button>
          </div>
        </div>
      )}

      {cargando && !resultado ? (
        <div className="admin-status">Cargando clientes...</div>
      ) : !resultado || resultado.data.length === 0 ? (
        <div className="admin-status">
          {busqueda || filtro !== "todos"
            ? "No hay usuarios con esos filtros."
            : "Aún no hay clientes registrados."}
        </div>
      ) : (
        <>
          <div className={"admin-table-wrap" + (cargando ? " admin-loading" : "")}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Contacto</th>
                  <th>Registro</th>
                  <th>Estado</th>
                  <th className="admin-table-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {resultado.data.map((cliente) => {
                  const esYo = cliente.id_usuario === usuario?.id_usuario;

                  return (
                    <tr key={cliente.id_usuario} className={!cliente.estado ? "admin-row-muted" : ""}>
                      <td>
                        <span className="admin-cell-main">
                          {cliente.nombre} {cliente.apellido}
                          {cliente.rol === "admin" && <em className="admin-role">Admin</em>}
                        </span>
                        <span className="admin-cell-sub">C.C. {cliente.cedula}</span>
                      </td>
                      <td>
                        <span className="admin-cell-main">{cliente.correo}</span>
                        <span className="admin-cell-sub">{cliente.telefono || "—"}</span>
                      </td>
                      <td className="admin-cell-sub">{formatDate(cliente.fecha_registro)}</td>
                      <td>
                        <span
                          className={
                            "admin-pill" + (cliente.estado ? " admin-pill--ok" : " admin-pill--off")
                          }
                        >
                          {cliente.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="admin-table-right">
                        {esYo ? (
                          <span className="admin-cell-sub">Tu cuenta</span>
                        ) : (
                          <div className="admin-row-actions">
                            <button
                              type="button"
                              className="admin-text-button"
                              onClick={() => setAccion({ tipo: "rol", cliente })}
                            >
                              {cliente.rol === "admin" ? "Quitar admin" : "Hacer admin"}
                            </button>
                            <button
                              type="button"
                              className={
                                "admin-text-button" +
                                (cliente.estado ? " admin-text-button--danger" : "")
                              }
                              onClick={() => setAccion({ tipo: "estado", cliente })}
                            >
                              {cliente.estado ? "Desactivar" : "Activar"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {resultado.totalPages > 1 && (
            <div className="admin-pagination">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                ← Anterior
              </button>
              <span>
                Página {page} de {resultado.totalPages} · {resultado.total} usuarios
              </span>
              <button
                type="button"
                disabled={page >= resultado.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default AdminClients;
