import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

import { forgotPassword } from "../../services/Auth";
import { apiErrorMessage } from "../../utils/format";

import "./Login.css";

function ForgotPassword() {
  const [correo, setCorreo] = useState("");
  const [enviado, setEnviado] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setCargando(true);
    setError("");

    try {
      const respuesta = await forgotPassword(correo);
      setEnviado(respuesta.message);
    } catch (err) {
      setError(apiErrorMessage(err, "No fue posible enviar el enlace. Intenta más tarde."));
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
            Vuelve a
            <br />
            tu rutina.
          </h1>
          <p>Te enviaremos un enlace para crear una nueva contraseña.</p>
        </div>
      </section>

      <section className="login-section">
        <div className="login-container">
          <div className="login-header">
            <span>RECUPERAR ACCESO</span>
            <h2>¿Olvidaste tu contraseña?</h2>
            <p>Escribe el correo con el que te registraste.</p>
          </div>

          {enviado ? (
            <div className="login-success">
              <p>{enviado}</p>
              <p>Revisa también tu carpeta de spam. El enlace vence en 30 minutos.</p>
            </div>
          ) : (
            <form className="login-form" onSubmit={enviar}>
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

              {error && <p className="login-error">{error}</p>}

              <button type="submit" className="login-button" disabled={cargando}>
                {cargando ? "Enviando..." : "Enviar enlace"}
              </button>
            </form>
          )}

          <div className="login-register">
            <span>¿La recordaste?</span>
            <Link to="/login">Iniciar sesión</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;
