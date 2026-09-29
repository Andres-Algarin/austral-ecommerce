import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus } from "lucide-react";

import PageHero from "../../components/PageHero/PageHero";

import "./FAQ.css";

const preguntas: { pregunta: string; respuesta: ReactNode }[] = [
  {
    pregunta:
      "¿Por qué mi shampoo Austral tiene una textura diferente a los shampoos convencionales?",
    respuesta: (
      <>
        <p>
          En Austral, creemos en la honestidad del producto. A diferencia de
          los shampoos industriales, que están compuestos mayoritariamente por
          agua (a veces hasta un 80%) y agentes espesantes sintéticos, nuestras
          fórmulas son tipo crema. Esto significa:
        </p>
        <ul>
          <li>
            <strong>Menor % de agua:</strong> eliminamos el relleno
            innecesario.
          </li>
          <li>
            <strong>Mayor concentración de bioactivos:</strong> cada gramo de
            producto está cargado de principios activos naturales.
          </li>
          <li>
            <strong>Resultado:</strong> obtienes una fórmula densa, pura y
            altamente eficiente. Con una menor cantidad de producto, logras un
            resultado superior, respetando la biología natural de tu cuero
            cabelludo y el medio ambiente.
          </li>
        </ul>
      </>
    ),
  },
  {
    pregunta:
      "¿Mi cabello necesita un periodo de adaptación al cambiar a los shampoos en crema de Austral?",
    respuesta: (
      <p>
        Sí, es completamente normal. Si tu cabello ha estado expuesto durante
        años a siliconas, sulfatos y parabenos de los shampoos convencionales,
        existe un periodo de desintoxicación o transición que suele durar entre
        una y dos semanas. Durante estos primeros lavados, tu fibra capilar se
        liberará de residuos sintéticos, permitiendo que los bioactivos
        naturales penetren realmente y devuelvan la salud y el equilibrio
        natural a tu cuero cabelludo.
      </p>
    ),
  },
  {
    pregunta:
      "¿Cómo debo almacenar mis productos Austral para garantizar su frescura y efectividad?",
    respuesta: (
      <p>
        Al ser formulaciones altamente concentradas con ingredientes naturales
        y botánicos, te recomendamos mantenerlos en un lugar fresco, seco y
        alejado de la luz solar directa. Procura cerrar bien los envases
        después de cada uso y evita el ingreso excesivo de agua en el producto
        para preservar intactas las propiedades de los extractos vegetales.
      </p>
    ),
  },
  {
    pregunta:
      "¿Los empaques de Austral son ecológicos y respetuosos con el medio ambiente?",
    respuesta: (
      <>
        <p>
          En Austral, nuestro compromiso con el planeta es una evolución
          constante. Actualmente, nos encontramos en una fase de transición
          activa hacia una sostenibilidad integral.
        </p>
        <p>
          Nuestros aceites ya se presentan en vidrio, un material 100%
          reciclable y protector. Para nuestras líneas de shampoo tipo crema y
          jabones, utilizamos envases que garantizan la integridad, seguridad y
          conservación de las propiedades bioactivas de nuestros ingredientes,
          especialmente en ambientes húmedos como el baño.
        </p>
        <p>
          Sabemos que el plástico es un reto ambiental y, por ello, estamos en
          una búsqueda técnica rigurosa de materiales que cumplan con tres
          pilares innegociables:
        </p>
        <ul>
          <li>
            <strong>Seguridad técnica:</strong> que mantenga la pureza y
            efectividad de nuestras fórmulas concentradas.
          </li>
          <li>
            <strong>Seguridad de uso:</strong> que sea resistente y seguro en
            entornos de ducha.
          </li>
          <li>
            <strong>Impacto ambiental:</strong> que se alinee con nuestros
            valores de Negocio Verde.
          </li>
        </ul>
        <p>
          Cada decisión en nuestros empaques es un paso pensado hacia un futuro
          más consciente. Te invitamos a ser parte de este proceso y a seguir
          nuestras actualizaciones mientras evolucionamos hacia empaques aún
          más responsables.
        </p>
      </>
    ),
  },
  {
    pregunta:
      "¿Los productos Austral son seguros para pieles sensibles, mujeres en embarazo o niños?",
    respuesta: (
      <p>
        Nuestras fórmulas están diseñadas con ingredientes botánicos de alta
        pureza (como caléndula y manzanilla) reconocidos por su suavidad y
        propiedades calmantes. Están libres de sulfatos agresivos, parabenos o
        fragancias sintéticas irritantes. Sin embargo, si tienes una condición
        dermatológica específica o alergias diagnosticadas, te sugerimos
        revisar la lista detallada de ingredientes en cada producto o realizar
        una prueba de sensibilidad previa en el antebrazo.
      </p>
    ),
  },
];

function FAQ() {
  // La primera pregunta aparece abierta.
  const [abierta, setAbierta] = useState<number | null>(0);

  return (
    <>
      <main className="faq-page">
        <PageHero
          compact
          eyebrow="RESOLVEMOS TUS DUDAS"
          title={
            <>
              Preguntas <em>frecuentes</em>
            </>
          }
        />

        <section className="faq-section">
          <div className="faq-list">
            {preguntas.map((item, index) => {
              const estaAbierta = abierta === index;

              return (
                <article
                  key={item.pregunta}
                  className={"faq-item" + (estaAbierta ? " faq-item--open" : "")}
                >
                  <button
                    type="button"
                    className="faq-question"
                    onClick={() => setAbierta(estaAbierta ? null : index)}
                    aria-expanded={estaAbierta}
                  >
                    <span>{item.pregunta}</span>
                    <span className="faq-icon">
                      {estaAbierta ? <Minus size={18} /> : <Plus size={18} />}
                    </span>
                  </button>

                  {estaAbierta && <div className="faq-answer">{item.respuesta}</div>}
                </article>
              );
            })}
          </div>

          <div className="faq-contact">
            <h2>¿No encontraste tu respuesta?</h2>
            <p>
              Escríbenos a{" "}
              <a href="mailto:australcosmeticanatural@gmail.com">
                australcosmeticanatural@gmail.com
              </a>{" "}
              o por <a href="https://wa.me/573233529434" target="_blank" rel="noreferrer">WhatsApp</a>.
              También puedes conocer <Link to="/valor-de-nuestros-ingredientes">el valor de nuestros ingredientes</Link>.
            </p>
          </div>
        </section>
      </main>

    </>
  );
}

export default FAQ;
