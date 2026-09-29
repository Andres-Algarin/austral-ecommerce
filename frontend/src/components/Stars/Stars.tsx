import { Star } from "lucide-react";

import "./Stars.css";

interface StarsProps {
  valor: number;
  tamano?: number;
  // Si se pasa, las estrellas son botones para calificar.
  onChange?: (valor: number) => void;
}

function Stars({ valor, tamano = 16, onChange }: StarsProps) {
  return (
    <span
      className={"stars" + (onChange ? " stars--input" : "")}
      aria-label={onChange ? undefined : `${valor} de 5 estrellas`}
      role={onChange ? "radiogroup" : "img"}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const llena = valor >= n - 0.25;
        const icono = (
          <Star
            size={tamano}
            strokeWidth={1.6}
            className={llena ? "stars-full" : "stars-empty"}
          />
        );

        return onChange ? (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={valor === n}
            aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
            onClick={() => onChange(n)}
          >
            {icono}
          </button>
        ) : (
          <span key={n}>{icono}</span>
        );
      })}
    </span>
  );
}

export default Stars;
