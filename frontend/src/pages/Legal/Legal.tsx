import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

import PageHero from "../../components/PageHero/PageHero";

import "./Legal.css";

export type TipoLegal = "privacidad" | "terminos" | "envios";

interface Seccion {
  titulo: string;
  contenido: ReactNode;
}

const paginas: Record<
  TipoLegal,
  { ruta: string; menu: string; eyebrow: string; titulo: ReactNode; intro?: string; secciones: Seccion[] }
> = {
  privacidad: {
    ruta: "/privacidad",
    menu: "Privacidad y Habeas Data",
    eyebrow: "TRANSPARENCIA Y PROTECCIÓN DE DATOS",
    titulo: (
      <>
        Política de <em>privacidad</em>
      </>
    ),
    intro:
      "En Austral, valoramos la confianza que depositas en nosotros al elegir nuestra cosmética natural. Para brindarte una experiencia de compra segura y eficiente, recolectamos y tratamos únicamente la información estrictamente necesaria bajo los siguientes parámetros:",
    secciones: [
      {
        titulo: "Datos de envío",
        contenido: (
          <p>
            Recolectamos tu nombre completo, dirección de entrega, ciudad,
            número de teléfono y cédula. Estos datos son utilizados
            exclusivamente para la logística de despacho y entrega de tus
            productos a través de nuestros aliados transportadores.
          </p>
        ),
      },
      {
        titulo: "Datos de pago (integración Wompi)",
        contenido: (
          <p>
            Para garantizar tu seguridad, Austral no almacena información
            financiera sensible (números de tarjetas de crédito o datos
            bancarios). Todo el proceso de pago es gestionado directamente por
            Wompi, bajo sus propios estándares de seguridad y cifrado. Nosotros
            solo recibimos la confirmación de la transacción para proceder con
            tu pedido.
          </p>
        ),
      },
      {
        titulo: "Seguridad y confidencialidad",
        contenido: (
          <p>
            Tu información es tratada bajo estrictas medidas de seguridad
            técnica. No compartimos, vendemos ni distribuimos tus datos
            personales con terceros para fines comerciales ajenos a nuestra
            operación.
          </p>
        ),
      },
      {
        titulo: "Tus derechos (Habeas Data)",
        contenido: (
          <p>
            Como titular de la información, tienes derecho a conocer,
            actualizar, rectificar o solicitar la eliminación de tus datos de
            nuestras bases de datos en cualquier momento escribiendo a{" "}
            <a href="mailto:australcosmeticanatural@gmail.com">
              australcosmeticanatural@gmail.com
            </a>
            .
          </p>
        ),
      },
    ],
  },

  terminos: {
    ruta: "/terminos",
    menu: "Términos y condiciones",
    eyebrow: "CONDICIONES DE COMPRA",
    titulo: (
      <>
        Términos y <em>condiciones</em>
      </>
    ),
    secciones: [
      {
        titulo: "Alcance",
        contenido: (
          <p>
            Al realizar una compra en Austral, aceptas que los productos
            adquiridos son para uso personal.
          </p>
        ),
      },
      {
        titulo: "Proceso de pago",
        contenido: (
          <p>
            Los pagos se procesan a través de la pasarela Wompi. El cliente es
            responsable de verificar que los datos ingresados en la plataforma
            sean correctos.
          </p>
        ),
      },
      {
        titulo: "Responsabilidad",
        contenido: (
          <p>
            Austral se compromete a entregar los productos en los tiempos
            estipulados y bajo estándares de calidad óptimos. La
            responsabilidad de Austral se limita al valor del producto
            adquirido.
          </p>
        ),
      },
    ],
  },

  envios: {
    ruta: "/envios-cambios",
    menu: "Envíos y cambios",
    eyebrow: "ENVÍOS Y GARANTÍAS",
    titulo: (
      <>
        Política de envíos <em>y cambios</em>
      </>
    ),
    secciones: [
      {
        titulo: "Tiempos de envío",
        contenido: (
          <p>
            Los pedidos se procesan en un plazo de 1 día hábil tras la
            confirmación del pago por parte de Wompi. El tiempo de entrega
            final dependerá de la transportadora y la ubicación.
          </p>
        ),
      },
      {
        titulo: "Cambios y garantías",
        contenido: (
          <ul>
            <li>
              <strong>Calidad:</strong> si el producto llega con defectos de
              fabricación o en mal estado, cuentas con 3 días para reportarlo.
            </li>
            <li>
              <strong>Condición:</strong> para cambios, el producto debe
              conservar su empaque original, sello de seguridad intacto y no
              presentar signos de uso.
            </li>
            <li>
              <strong>Proceso:</strong> contáctanos por nuestro canal de{" "}
              <a href="https://wa.me/573233529434" target="_blank" rel="noreferrer">
                WhatsApp
              </a>{" "}
              para gestionar tu solicitud. Los costos de envío por devoluciones
              serán asumidos por el cliente.
            </li>
          </ul>
        ),
      },
    ],
  },
};

function Legal({ tipo }: { tipo: TipoLegal }) {
  const pagina = paginas[tipo];

  return (
    <>
      <main className="legal-page">
        <PageHero compact eyebrow={pagina.eyebrow} title={pagina.titulo} />

        <div className="legal-layout">
          {/* Menú entre políticas */}
          <nav className="legal-nav" aria-label="Políticas">
            {Object.values(paginas).map((p) => (
              <NavLink
                key={p.ruta}
                to={p.ruta}
                className={({ isActive }) =>
                  "legal-nav-link" + (isActive ? " legal-nav-link--active" : "")
                }
              >
                {p.menu}
              </NavLink>
            ))}
          </nav>

          <article className="legal-content">
            {pagina.intro && <p className="legal-intro">{pagina.intro}</p>}

            {pagina.secciones.map((seccion, index) => (
              <section key={seccion.titulo} className="legal-section">
                <span className="legal-number">{String(index + 1).padStart(2, "0")}</span>

                <div>
                  <h2>{seccion.titulo}</h2>
                  {seccion.contenido}
                </div>
              </section>
            ))}
          </article>
        </div>
      </main>

    </>
  );
}

export default Legal;
