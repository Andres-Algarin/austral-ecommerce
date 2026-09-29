import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  getProfile,
  updateProfile,
} from "../../services/User";
import "./Profile.css";

interface Perfil {
  id_usuario: number;
  nombre: string;
  apellido: string;
  cedula: string;
  correo: string;
  telefono: string;
  rol: string;
  estado: boolean;
}

function Profile() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const datos = await getProfile();

        setPerfil(datos);
        setNombre(datos.nombre);
        setApellido(datos.apellido);
        setTelefono(datos.telefono);
      } catch {
        setError("No fue posible cargar tu perfil.");
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, []);

  const cancelarEdicion = () => {
    if (!perfil) {
      return;
    }

    setNombre(perfil.nombre);
    setApellido(perfil.apellido);
    setTelefono(perfil.telefono);
    setErrorFormulario("");
    setEditando(false);
  };

  const guardarCambios = async () => {
    setErrorFormulario("");
    setGuardando(true);

    try {
      const datosActualizados = await updateProfile({
        nombre,
        apellido,
        telefono,
      });

      setPerfil(datosActualizados);
      setNombre(datosActualizados.nombre);
      setApellido(datosActualizados.apellido);
      setTelefono(datosActualizados.telefono);

      setEditando(false);
    } catch (error: any) {
      setErrorFormulario(
        error.response?.data?.message ||
          "No fue posible actualizar tu perfil."
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <main className="user-profile-page">
        <p>Cargando perfil...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="user-profile-page">
        <p className="user-profile-error">{error}</p>
      </main>
    );
  }

  if (!perfil) {
    return null;
  }

  const iniciales =
    `${perfil.nombre.charAt(0)}${perfil.apellido.charAt(0)}`.toUpperCase();

  return (
    <main className="user-profile-page">
      <section className="user-profile-container">

        <a href="/" className="user-profile-back">
          <ArrowLeft size={18} />
          <span>Volver</span>
        </a>

        <div className="user-profile-header">
          <span>MI CUENTA</span>

          <h1>Mi perfil</h1>

          <p>
            Administra la información de tu cuenta Austral.
          </p>
        </div>

        <div className="user-profile-card">

          <div className="user-profile-identity">
            <div className="user-profile-avatar">
              {iniciales}
            </div>

            <div className="user-profile-identity-info">
              <h2>
                {perfil.nombre} {perfil.apellido}
              </h2>

              <span>
                {perfil.rol === "admin" ? "Administrador" : "Cliente"}
              </span>
            </div>
          </div>

          <div className="user-profile-section-title">
            <span>INFORMACIÓN PERSONAL</span>
          </div>

          <div className="user-profile-field">
            <span>Nombre</span>

            {editando ? (
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            ) : (
              <p>{perfil.nombre}</p>
            )}
          </div>

          <div className="user-profile-field">
            <span>Apellido</span>

            {editando ? (
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
              />
            ) : (
              <p>{perfil.apellido}</p>
            )}
          </div>

          <div className="user-profile-field">
            <span>Correo electrónico</span>

            <p>{perfil.correo}</p>
          </div>

          <div className="user-profile-field">
            <span>Teléfono</span>

            {editando ? (
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            ) : (
              <p>{perfil.telefono}</p>
            )}
          </div>

          <div className="user-profile-field">
            <span>Cédula</span>

            <p>{perfil.cedula}</p>
          </div>

          {errorFormulario && (
            <p className="user-profile-error">
              {errorFormulario}
            </p>
          )}

          {!editando ? (
            <button
              type="button"
              className="user-profile-edit-button"
              onClick={() => setEditando(true)}
            >
              Editar perfil
            </button>
          ) : (
            <div className="user-profile-actions">
              <button
                type="button"
                className="user-profile-save-button"
                onClick={guardarCambios}
                disabled={guardando}
              >
                {guardando
                  ? "Guardando..."
                  : "Guardar cambios"}
              </button>

              <button
                type="button"
                className="user-profile-cancel-button"
                onClick={cancelarEdicion}
                disabled={guardando}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Profile;