import "./OurIngredients.css";

const ingredientes = [
  {
    nombre: "Romero",
    etiqueta: "Rosmarinus Officinalis",
    texto: `Mucho más que una planta tradicional. Actúa como un potente estimulante del micro flujo sanguíneo en el folículo piloso, oxigenando la raíz, prolongando la fase de crecimiento capilar y devolviendo un brillo tridimensional y saludable.`,
    piel: `Gracias a sus potentes propiedades antioxidantes y astringentes, ayuda a purificar el cutis, combatiendo los radicales libres, tonificando los tejidos y equilibrando la producción de grasa natural sin resecar.`,
  },
  {
    nombre: "Caléndula",
    etiqueta: "Calendula Officinalis",
    texto: `El bálsamo por excelencia de la fitocosmética. Posee una alta concentración de flavonoides y triterpenos que calman de inmediato las rojeces, alivian la tirantez y ayudan a reequilibrar cueros cabelludos hiperreactivos o con tendencia a la descamación.`,
    piel: `El bálsamo regenerador por excelencia. Su alta concentración de flavonoides y triterpenos acelera la cicatrización, alivia irritaciones cutáneas, hidrata profundamente y suaviza las pieles más delicadas o sensibles.`,
  },
  {
    nombre: "Manzanilla",
    etiqueta: "Matricaria Chamomilla",
    texto: `Un activo botánico reconfortante que suaviza la fibra capilar de la raíz a la punta. Neutraliza las agresiones externas, alivia el picor y potencia de forma natural la luminosidad en tonos claros.`,
    piel: `Actúa como un potente antiinflamatorio y descongestionante tópico. Calma irritaciones, reduce la rojez y aporta una sensación de alivio inmediato en pieles estresadas o expuestas al entorno urbano.`,
  },
  {
    nombre: "Aloe Vera",
    etiqueta: "Aloe Barbadensis",
    texto: `Nuestro núcleo de hidratación profunda. Penetra en la hebra capilar aportando aminoácidos esenciales, polisacáridos y vitaminas que reparan la cutícula dañada desde el interior, logrando un control del frizz duradero y sin efecto graso.`,
  },
  {
    nombre: "Semillas de Lino",
    etiqueta: "Linum Usitatissimum",
    texto: `Una fuente excepcional de ácidos grasos omega-3 y lignanos. Crean una película protectora biodegradable que sella la humedad natural del cabello, aportando elasticidad, definición y un tacto de seda inigualable.`,
  },
  {
    nombre: "Miel y Propóleo",
    etiqueta: "El oro de la colmena",
    texto: `Actúan como un escudo bio-protector gracias a sus propiedades antioxidantes y antibacterianas naturales. Retienen la hidratación óptima, reparan la fibra castigada y devuelven la vitalidad a los cabellos sometidos al estrés urbano.`,
  },
  {
    nombre: "Semilla de Aguacate",
    etiqueta: "Persea Americana",
    texto: `Procesada bajo estrictos estándares de aprovechamiento sostenible, es rica en fitoesteroles y vitaminas A, D y E. Nutre intensamente las puntas abiertas y quebradizas, devolviendo la flexibilidad y la salud estructural a las melenas más exigentes.`,
  },
];

function OurIngredients() {
  return (
    <div className="ingredients-page">
      <main>
        <section className="ingredients-hero">
          <img
            src="/leaf.png"
            alt=""
            className="ingredients-leaf ingredients-leaf--left"
          />

          <img
            src="/leaf-flip.png"
            alt=""
            className="ingredients-leaf ingredients-leaf--right"
          />

          <div className="ingredients-hero-decoration ingredients-hero-decoration--one" />
          <div className="ingredients-hero-decoration ingredients-hero-decoration--two" />

          <div className="ingredients-hero-content">
            <span className="ingredients-eyebrow">
              EL CORAZÓN DE AUSTRAL
            </span>

            <h1>
              El valor de nuestros
              <em> ingredientes.</em>
            </h1>

            <p>
              En Austral, cada activo botánico es seleccionado meticulosamente
              y extraído bajo principios de biotecnología verde.
            </p>
          </div>
        </section>

        <section className="ingredients-intro">
          <div className="ingredients-intro-line" />

          <p>
            No añadimos ingredientes por inercia; cada uno cumple una función
            bioactiva específica para restaurar el equilibrio natural de tu
            cuerpo sin comprometer el planeta.
          </p>

          <div className="ingredients-intro-line" />
        </section>

        <section className="ingredients-list">
          <div className="ingredients-container">
            <div className="ingredients-section-heading">
              <span>ACTIVOS BOTÁNICOS</span>
              <h2>
                La naturaleza,
                <br />
                <em>en su mejor versión.</em>
              </h2>
            </div>

            <div className="ingredients-grid">
              {ingredientes.map((ingrediente, index) => (
                <article
                  className={`ingredient-card ${
                    index % 2 !== 0 ? "ingredient-card--offset" : ""
                  }`}
                  key={ingrediente.nombre}
                >
                  <div className="ingredient-card-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="ingredient-card-content">
                    <span className="ingredient-card-label">
                      {ingrediente.etiqueta}
                    </span>

                    <h3>{ingrediente.nombre}</h3>

                    <div className="ingredient-card-divider" />

                    <p>{ingrediente.texto}</p>

                    {ingrediente.piel && (
                      <div className="ingredient-skin">
                        <span>PARA LA PIEL</span>
                        <p>{ingrediente.piel}</p>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ingredients-closing">
          <img src="/leaf.png" alt="" />

          <div>
            <span>AUSTRAL · COSMÉTICA NATURAL</span>
            <h2>
              Ingredientes que
              <br />
              <em>tienen un propósito.</em>
            </h2>

            <p>
              Elegimos cada activo pensando en tu bienestar y en el respeto
              por nuestro entorno.
            </p>
          </div>

          <img src="/leaf-flip.png" alt="" />
        </section>
      </main>

    </div>
  );
}

export default OurIngredients;