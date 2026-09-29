import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Si llegó aquí desde otra página (p. ej. al agregar al carrito), vuelve a ella.
  const destino =
    (location.state as { from?: string } | null)?.from ?? "/";

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const manejarLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setCargando(true);

    try {
      await iniciarSesion(correo, password);
      navigate(destino, { replace: true });
    } catch (error: any) {
      const mensaje =
        error.response?.data?.message || "Correo o contraseña incorrectos";

      setError(Array.isArray(mensaje) ? mensaje.join(", ") : mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="login-brand-content">
          <Link to="/" className="login-brand-label">AUSTRAL</Link>
          <h1>
            Tu cabello,
            <br />
            tu esencia.
          </h1>
          <p>
            Productos seleccionados para el cuidado y bienestar de tu cabello.
          </p>
        </div>
      </section>

      <section className="login-section">
        <div className="login-container">
          <div className="login-header">
            <span>BIENVENIDO</span>
            <h2>Iniciar sesión</h2>
            <p>Ingresa a tu cuenta para continuar.</p>
          </div>

          <form className="login-form" onSubmit={manejarLogin}>
            <div className="login-field">
              <label htmlFor="correo">Correo electrónico</label>
              <input
                id="correo"
                type="email"
                placeholder="correo@ejemplo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Contraseña</label>

              <div className="password-input">
                <input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  {mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Link to="/recuperar-contrasena" className="login-forgot">
              ¿Olvidaste tu contraseña?
            </Link>

            {error && <p className="login-error">{error}</p>}

            <button
              type="submit"
              className="login-button"
              disabled={cargando}
            >
              {cargando ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="login-register">
            <span>¿No tienes una cuenta?</span>
            <Link to="/registro">Crear cuenta</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;