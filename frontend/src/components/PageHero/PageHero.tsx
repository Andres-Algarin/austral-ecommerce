import type { ReactNode } from "react";

import "./PageHero.css";

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  compact?: boolean;
  children?: ReactNode;
}

/*
|--------------------------------------------------------------------------
| Encabezado de página con el estilo de Austral.
| En "title" se puede usar <em> para resaltar palabras en morado.
|--------------------------------------------------------------------------
*/
function PageHero({
  eyebrow,
  title,
  description,
  compact = false,
  children,
}: PageHeroProps) {
  return (
    <section className={"page-hero" + (compact ? " page-hero--compact" : "")}>
      <img src="/leaf.png" alt="" className="page-hero-leaf page-hero-leaf--left" />
      <img src="/leaf-flip.png" alt="" className="page-hero-leaf page-hero-leaf--right" />

      <div className="page-hero-content">
        <span className="page-hero-eyebrow">{eyebrow}</span>

        <h1>{title}</h1>

        {description && <p>{description}</p>}

        {children}
      </div>
    </section>
  );
}

export default PageHero;
