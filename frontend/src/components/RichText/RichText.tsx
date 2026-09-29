/*
|--------------------------------------------------------------------------
| Muestra texto escrito en el panel de administración respetando los
| saltos de línea. Las líneas que empiezan con "-", "•" o "*" se
| muestran como lista.
|--------------------------------------------------------------------------
*/
function RichText({ texto }: { texto: string }) {
  const lineas = texto
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter(Boolean);

  const bloques: ({ tipo: "p"; texto: string } | { tipo: "ul"; items: string[] })[] = [];

  for (const linea of lineas) {
    const esItem = /^[-•*]\s*/.test(linea);

    if (esItem) {
      const item = linea.replace(/^[-•*]\s*/, "");
      const ultimo = bloques[bloques.length - 1];

      if (ultimo?.tipo === "ul") {
        ultimo.items.push(item);
      } else {
        bloques.push({ tipo: "ul", items: [item] });
      }
    } else {
      bloques.push({ tipo: "p", texto: linea });
    }
  }

  return (
    <>
      {bloques.map((bloque, i) =>
        bloque.tipo === "p" ? (
          <p key={i}>{bloque.texto}</p>
        ) : (
          <ul key={i}>
            {bloque.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        )
      )}
    </>
  );
}

export default RichText;
