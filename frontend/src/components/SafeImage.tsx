import { useState } from "react";
import type { ImgHTMLAttributes, ReactNode } from "react";

import { imageUrl } from "../utils/format";

interface SafeImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  // Ruta del backend ("/uploads/...") o URL completa.
  ruta: string | null | undefined;
  // Lo que se muestra si no hay imagen o no carga.
  fallback: ReactNode;
}

/*
|--------------------------------------------------------------------------
| Imagen que muestra un respaldo si la ruta está vacía o el archivo no
| existe, en lugar del ícono de imagen rota del navegador.
|--------------------------------------------------------------------------
*/
function SafeImage({ ruta, fallback, ...props }: SafeImageProps) {
  const [fallida, setFallida] = useState<string | null>(null);

  if (!ruta || fallida === ruta) {
    return <>{fallback}</>;
  }

  return <img {...props} src={imageUrl(ruta)} onError={() => setFallida(ruta)} />;
}

export default SafeImage;
