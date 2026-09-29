import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { resetPassword } from "../../services/Auth";
import { apiErrorMessage } from "../../utils/format";

import "./Login.css";

// Página a la que lleva el enlace del correo: /restablecer-contrasena?token=...
function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [listo, setListo] = useState("");

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    setError("");

    try {
      const respuesta = await resetPassword(token, password);
      setListo(respuesta.message);
    } catch (err) {
      setError(apiErrorMessage(err, "No fue posible cambiar la contraseña."));
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
            Una nueva
            <br />
            contraseña.
          </h1>
          <p>Elige una contraseña que no uses en otros sitios.</p>
        </div>
      </section>

      <section className="login-section">
        <div className="login-container">
          <div className="login-header">
            <span>RECUPERAR ACCESO</span>
            <h2>Crear contraseña</h2>
          </div>

          {!token ? (
            <div className="login-success">
              <p>El enlace no es válido. Solicita uno nuevo.</p>
              <Link to="/recuperar-contrasena" className="login-button">
                Solicitar enlace
              </Link>
            </div>
          ) : listo ? (
            <div className="login-success">
              <p>{listo}</p>
              <Link to="/login" className="login-button">
                Iniciar sesión
              </Link>
            </div>
          ) : (
            <form className="login-form" onSubmit={enviar}>
              <div className="login-field">
                <label htmlFor="password">Nueva contraseña</label>

                <div className="password-input">
                  <input
                    id="password"
                    type={mostrar ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setMostrar(!mostrar)}
                    aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {mostrar ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="confirmacion">Confirmar contraseña</label>
                <input
                  id="confirmacion"
                  type={mostrar ? "text" : "password"}
                  value={confirmacion}
                  onChange={(e) => setConfirmacion(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="login-error">
                  {error}{" "}
                  {error.includes("expiró") && (
                    <Link to="/recuperar-contrasena">Solicitar otro enlace</Link>
                  )}
                </p>
              )}

              <button type="submit" className="login-button" disabled={cargando}>
                {cargando ? "Guardando..." : "Guardar contraseña"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default ResetPassword;
