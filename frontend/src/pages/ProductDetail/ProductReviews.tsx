import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

import Stars from "../../components/Stars/Stars";
import { useAuth } from "../../context/AuthContext";
import {
  createReview,
  getProductReviews,
  getReviewEligibility,
  updateReview,
  type Elegibilidad,
  type ResenasProducto,
} from "../../services/Review";
import { apiErrorMessage, formatDate } from "../../utils/format";

const VISIBLES_INICIAL = 4;

interface ProductReviewsProps {
  id_producto: number;
  onResumen?: (promedio: number, total: number) => void;
}

function ProductReviews({ id_producto, onResumen }: ProductReviewsProps) {
  const { usuario } = useAuth();

  const [resenas, setResenas] = useState<ResenasProducto | null>(null);
  const [elegibilidad, setElegibilidad] = useState<Elegibilidad | null>(null);
  const [visibles, setVisibles] = useState(VISIBLES_INICIAL);

  const [formAbierto, setFormAbierto] = useState(false);
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    try {
      const data = await getProductReviews(id_producto);
      setResenas(data);
      onResumen?.(data.promedio, data.total);
    } catch {
      setResenas(null);
    }

    if (usuario) {
      getReviewEligibility(id_producto)
        .then(setElegibilidad)
        .catch(() => setElegibilidad(null));
    } else {
      setElegibilidad(null);
    }
  }, [id_producto, usuario, onResumen]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const abrirFormulario = () => {
    const mia = elegibilidad?.mi_resena;

    setCalificacion(mia?.calificacion ?? 0);
    setComentario(mia?.comentario ?? "");
    setError("");
    setFormAbierto(true);
  };

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();

    if (calificacion === 0) {
      setError("Elige una calificación de 1 a 5 estrellas.");
      return;
    }

    setEnviando(true);
    setError("");

    try {
      const mia = elegibilidad?.mi_resena;

      if (mia) {
        await updateReview(mia.id_resena, { calificacion, comentario });
      } else {
        await createReview({ id_producto, calificacion, comentario });
      }

      setFormAbierto(false);
      await cargar();
    } catch (err) {
      setError(apiErrorMessage(err, "No fue posible guardar tu reseña."));
    } finally {
      setEnviando(false);
    }
  };

  if (!resenas) {
    return null;
  }

  const puedeEscribir = elegibilidad?.puede_resenar || Boolean(elegibilidad?.mi_resena);

  return (
    <section className="pd-reviews" id="resenas">
      <div className="pd-section-heading">
        <span>OPINIONES</span>
        <h2>Lo que dicen quienes lo usan</h2>
      </div>

      <div className="pd-reviews-layout">
        {/* ============ RESUMEN ============ */}
        <aside className="pd-reviews-summary">
          <strong className="pd-reviews-average">
            {resenas.total > 0 ? resenas.promedio.toFixed(1) : "—"}
          </strong>

          <Stars valor={resenas.promedio} tamano={18} />

          <span className="pd-reviews-count">
            {resenas.total === 0
              ? "Aún sin reseñas"
              : `${resenas.total} ${resenas.total === 1 ? "reseña" : "reseñas"}`}
          </span>

          {resenas.total > 0 && (
            <div className="pd-reviews-bars">
              {[5, 4, 3, 2, 1].map((n) => {
                const cantidad = resenas.distribucion[n] ?? 0;

                return (
                  <div key={n} className="pd-reviews-bar">
                    <span>{n}</span>
                    <div>
                      <span
                        style={{
                          width: `${(cantidad / resenas.total) * 100}%`,
                        }}
                      />
                    </div>
                    <span>{cantidad}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Acción según la sesión */}
          {!usuario ? (
            <p className="pd-reviews-note">
              <Link to="/login">Inicia sesión</Link> para dejar tu opinión
              sobre productos que hayas comprado.
            </p>
          ) : puedeEscribir && !formAbierto ? (
            <button
              type="button"
              className="pd-reviews-write"
              onClick={abrirFormulario}
            >
              {elegibilidad?.mi_resena ? "Editar mi reseña" : "Escribir una reseña"}
            </button>
          ) : !puedeEscribir && elegibilidad?.motivo ? (
            <p className="pd-reviews-note">{elegibilidad.motivo}</p>
          ) : null}
        </aside>

        {/* ============ LISTA / FORMULARIO ============ */}
        <div className="pd-reviews-main">
          {formAbierto && (
            <form className="pd-review-form" onSubmit={enviar}>
              <label>Tu calificación</label>
              <Stars valor={calificacion} tamano={26} onChange={setCalificacion} />

              <label htmlFor="pd-review-comment">
                Comentario <span>(opcional)</span>
              </label>
              <textarea
                id="pd-review-comment"
                rows={4}
                maxLength={1000}
                placeholder="¿Cómo te fue con el producto?"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />

              {error && <p className="pd-form-error">{error}</p>}

              <div className="pd-review-form-actions">
                <button
                  type="button"
                  className="pd-button-secondary"
                  onClick={() => setFormAbierto(false)}
                  disabled={enviando}
                >
                  Cancelar
                </button>

                <button type="submit" className="pd-button-primary" disabled={enviando}>
                  {enviando ? "Guardando..." : "Publicar reseña"}
                </button>
              </div>
            </form>
          )}

          {resenas.total === 0 ? (
            !formAbierto && (
              <div className="pd-reviews-empty">
                Este producto todavía no tiene reseñas.
              </div>
            )
          ) : (
            <>
              <ul className="pd-review-list">
                {resenas.data.slice(0, visibles).map((resena) => (
                  <li key={resena.id_resena} className="pd-review">
                    <div className="pd-review-header">
                      <span className="pd-review-avatar">
                        {resena.autor.charAt(0).toUpperCase()}
                      </span>

                      <div>
                        <strong>{resena.autor}</strong>
                        <span>{formatDate(resena.fecha)}</span>
                      </div>

                      <Stars valor={resena.calificacion} tamano={14} />
                    </div>

                    {resena.comentario && <p>{resena.comentario}</p>}
                  </li>
                ))}
              </ul>

              {resenas.data.length > visibles && (
                <button
                  type="button"
                  className="pd-reviews-more"
                  onClick={() => setVisibles((v) => v + VISIBLES_INICIAL)}
                >
                  Ver más reseñas
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProductReviews;
