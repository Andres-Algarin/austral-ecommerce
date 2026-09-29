import { Link } from "react-router-dom";
import { Eye, FlaskConical, HandHeart, Sprout, Target, Users } from "lucide-react";


import "./About.css";

const pilares = [
  {
    icono: <Sprout size={22} />,
    titulo: "Cultivo ecológico",
    texto: "Cultivamos gran parte de nuestros insumos botánicos con prácticas ecológicas.",
  },
  {
    icono: <HandHeart size={22} />,
    titulo: "Comercio justo",
    texto: "Lo que nuestra tierra no produce lo obtenemos de familias campesinas de la zona.",
  },
  {
    icono: <FlaskConical size={22} />,
    titulo: "Alquimia botánica",
    texto: "Cada fórmula es el resultado de un proceso consciente con extractos de alta calidad.",
  },
  {
    icono: <Users size={22} />,
    titulo: "Liderado por mujeres",
    texto: "Un emprendimiento familiar que nació en la finca y creció con los saberes de la tierra.",
  },
];

const emprendedoras = [
  { nombre: "Marleny Bustamante", foto: "/emprendedora2.jpg" },
  { nombre: "Natalia Arango Bustamante", foto: "/emprenderora1.jpeg" },
];

function About() {
  return (
    <>
      <main className="about-page">

        {/* ================= HERO ================= */}
        <section className="about-hero">
          <img src="/leaf.png" alt="" className="about-leaf about-leaf--left" />
          <img src="/leaf-flip.png" alt="" className="about-leaf about-leaf--right" />

          <div className="about-hero-content">
            <span className="about-eyebrow">¿QUIÉNES SOMOS?</span>

            <h1>
              Raíces que <em>transforman.</em>
            </h1>

            <p>
              Cosmética natural hecha en familia, con extractos botánicos y
              respeto por la tierra.
            </p>
          </div>
        </section>

        {/* ================= HISTORIA ================= */}
        <section className="about-story">
          <div className="about-container about-story-text">
            <span className="about-label">NUESTRA HISTORIA</span>

            <h2>
              Nacimos en la tranquilidad <em>de la finca.</em>
            </h2>

            <p>
              Austral nació impulsada por el amor y la visión de una madre
              que decidió reconectarse con los saberes ancestrales de la
              tierra. Hoy, somos un emprendimiento familiar liderado por
              mujeres que cultivan con prácticas ecológicas gran parte de los
              insumos botánicos que dan vida a nuestras fórmulas.
            </p>

            <p>
              Lo que nuestra propia tierra no produce, lo obtenemos de manos
              de campesinos de la zona, asegurando una cadena de valor ética,
              transparente y local.
            </p>

            <blockquote>
              Cada shampoo en crema, oleato de romero y caléndula, pomada o
              jabón es el resultado de un proceso consciente: una alquimia
              botánica diseñada para cuidar de ti mientras protegemos el
              planeta.
            </blockquote>
          </div>
        </section>

        {/* ================= EMPRENDEDORAS ================= */}
        {/* Las fotos tienen fondo negro: se muestran en marcos oscuros
            con un degradado de la marca para que se integren. */}
        <section className="about-team">
          <div className="about-container">
            <div className="about-team-heading">
              <span className="about-label">EL CORAZÓN DE AUSTRAL</span>
              <h2>
                Las mujeres <em>detrás de Austral</em>
              </h2>
            </div>

            <div className="about-team-grid">
              {emprendedoras.map((persona) => (
                <figure key={persona.nombre} className="about-member">
                  <div className="about-portrait">
                    <img src={persona.foto} alt={persona.nombre} />
                  </div>

                  <figcaption>
                    <strong>{persona.nombre}</strong>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ================= PILARES ================= */}
        <section className="about-pillars">
          <div className="about-container">
            <div className="about-pillars-grid">
              {pilares.map((pilar) => (
                <article key={pilar.titulo} className="about-pillar">
                  <span className="about-pillar-icon">{pilar.icono}</span>
                  <h3>{pilar.titulo}</h3>
                  <p>{pilar.texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================= MISIÓN Y VISIÓN ================= */}
        <section className="about-purpose">
          <div className="about-container about-purpose-grid">
            <article className="about-purpose-card">
              <span className="about-purpose-icon">
                <Target size={22} />
              </span>

              <span className="about-label about-label--light">MISIÓN</span>

              <p>
                En Austral nos dedicamos a la creación de productos de
                cosmética natural, elaborando shampoos tipo crema, oleatos,
                pomadas y jabones mediante el uso de extractos botánicos de alta
                calidad. Como emprendimiento familiar liderado por mujeres,
                cultivamos nuestras propias plantas bajo prácticas ecológicas y
                nos abastecemos a través de comercio justo con familias
                campesinas locales.
              </p>

              <p>
                Nuestro propósito es ofrecer alternativas de cuidado personal
                que promuevan el bienestar integral de nuestros clientes,
                garantizando un impacto ambiental positivo y honrando el poder
                de la naturaleza.
              </p>
            </article>

            <article className="about-purpose-card">
              <span className="about-purpose-icon">
                <Eye size={22} />
              </span>

              <span className="about-label about-label--light">VISIÓN</span>

              <p>
                Consolidar a Austral como una marca referente en el sector de
                los negocios verdes y la cosmética natural en Colombia,
                destacándonos por la autenticidad, la innovación en nuestras
                formulaciones y nuestro compromiso inquebrantable con la
                sostenibilidad.
              </p>

              <p>
                Aspiramos a escalar nuestro modelo de producción consciente,
                fortaleciendo la economía agrícola local para transformar la
                rutina de cuidado personal en un acto de respeto hacia el
                cuerpo y el medio ambiente.
              </p>
            </article>
          </div>
        </section>

        {/* ================= CIERRE ================= */}
        <section className="about-closing">
          <h2>
            Cuidarte también es <em>cuidar la tierra.</em>
          </h2>

          <div className="about-closing-actions">
            <Link to="/productos" className="about-button">
              Conoce nuestros productos →
            </Link>

            <Link to="/valor-de-nuestros-ingredientes" className="about-link">
              El valor de nuestros ingredientes
            </Link>
          </div>
        </section>
      </main>

    </>
  );
}

export default About;
