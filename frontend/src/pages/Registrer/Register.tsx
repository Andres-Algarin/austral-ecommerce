import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/Auth";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const [formulario, setFormulario] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    correo: "",
    telefono: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormulario({
      ...formulario,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setExito("");
    setCargando(true);

    try {
      await register(formulario);

      setExito("Cuenta creada correctamente. Redirigiendo...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error: any) {
      const mensaje =
        error.response?.data?.message ||
        "No fue posible crear la cuenta. Inténtalo nuevamente.";

      setError(Array.isArray(mensaje) ? mensaje.join(", ") : mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="register-page">
      <section className="register-brand">
        <div className="register-brand-content">
          <span className="register-brand-label">AUSTRAL</span>

          <h1>
            Cuida tu cabello,
            <br />
            cuida tu esencia.
          </h1>

          <p>
            Crea tu cuenta y descubre productos seleccionados para el cuidado
            y bienestar de tu cabello.
          </p>
        </div>
      </section>

      <section className="register-section">
        <div className="register-container">
          <div className="register-header">
            <span>AUSTRAL</span>
            <h2>Crear cuenta</h2>
            <p>Regístrate para comenzar a disfrutar de Austral.</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="register-row">
              <div className="register-field">
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre"
                  value={formulario.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="register-field">
                <label htmlFor="apellido">Apellido</label>
                <input
                  id="apellido"
                  type="text"
                  placeholder="Tu apellido"
                  value={formulario.apellido}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="cedula">Cédula</label>
              <input
                id="cedula"
                type="text"
                placeholder="Número de documento"
                value={formulario.cedula}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="correo">Correo electrónico</label>
              <input
                id="correo"
                type="email"
                placeholder="correo@ejemplo.com"
                value={formulario.correo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                type="tel"
                placeholder="300 000 0000"
                value={formulario.telefono}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="password">Contraseña</label>

              <div className="register-password-input">
                <input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  placeholder="Crea una contraseña"
                  value={formulario.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  aria-label={
                    mostrarPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {mostrarPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {error && <p className="register-error">{error}</p>}

            {exito && <p className="register-success">{exito}</p>}

            <button
              type="submit"
              className="register-button"
              disabled={cargando}
            >
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <div className="register-login">
            <span>¿Ya tienes una cuenta?</span>
            <a href="/login">Iniciar sesión</a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Register;