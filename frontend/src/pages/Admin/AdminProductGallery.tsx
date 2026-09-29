import { useEffect, useRef, useState } from "react";
import { ImagePlus, Star, Trash2 } from "lucide-react";

import {
  deleteProductImage,
  getProductImages,
  setPrincipalImage,
  uploadProductImages,
  type ImagenProducto,
} from "../../services/ProductImage";
import { apiErrorMessage, imageUrl } from "../../utils/format";

import "./AdminSections.css";

interface AdminProductGalleryProps {
  id_producto: number;
  // Avisa cuando cambia la imagen principal del producto.
  onPrincipalChange?: () => void;
}

/*
|--------------------------------------------------------------------------
| Galería de imágenes adicionales de un producto (solo al editar).
|--------------------------------------------------------------------------
*/
function AdminProductGallery({ id_producto, onPrincipalChange }: AdminProductGalleryProps) {
  const [imagenes, setImagenes] = useState<ImagenProducto[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getProductImages(id_producto)
      .then(setImagenes)
      .catch(() => setImagenes([]));
  }, [id_producto]);

  const ejecutar = async (accion: () => Promise<void>, mensajeError: string) => {
    setOcupado(true);
    setError("");

    try {
      await accion();
    } catch (err) {
      setError(apiErrorMessage(err, mensajeError));
    } finally {
      setOcupado(false);
    }
  };

  const subir = (archivos: FileList | null) => {
    if (!archivos || archivos.length === 0) {
      return;
    }

    const lista = Array.from(archivos).slice(0, 10);

    void ejecutar(async () => {
      const principalAntes = imagenes.find((i) => i.es_principal)?.id_imagen;
      const nuevas = await uploadProductImages(id_producto, lista);

      setImagenes(nuevas);

      if (nuevas.find((i) => i.es_principal)?.id_imagen !== principalAntes) {
        onPrincipalChange?.();
      }
    }, "No fue posible subir las imágenes.");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const marcarPrincipal = (imagen: ImagenProducto) =>
    ejecutar(async () => {
      setImagenes(await setPrincipalImage(imagen.id_imagen));
      onPrincipalChange?.();
    }, "No fue posible cambiar la imagen principal.");

  const eliminar = (imagen: ImagenProducto) =>
    ejecutar(async () => {
      await deleteProductImage(imagen.id_imagen);
      setImagenes(await getProductImages(id_producto));

      if (imagen.es_principal) {
        onPrincipalChange?.();
      }
    }, "No fue posible eliminar la imagen.");

  return (
    <div className="admin-gallery">
      <div className="admin-gallery-header">
        <label>Galería</label>
        <span className="admin-form-help">
          Imágenes adicionales que se ven en el detalle del producto. JPG, PNG o
          WEBP de hasta 5 MB.
        </span>
      </div>

      <div className="admin-gallery-grid">
        {imagenes.map((imagen) => (
          <div
            key={imagen.id_imagen}
            className={"admin-gallery-item" + (imagen.es_principal ? " admin-gallery-item--main" : "")}
          >
            <img src={imageUrl(imagen.url_imagen)} alt="" />

            {imagen.es_principal && <span className="admin-gallery-tag">Principal</span>}

            <div className="admin-gallery-actions">
              {!imagen.es_principal && (
                <button
                  type="button"
                  onClick={() => marcarPrincipal(imagen)}
                  disabled={ocupado}
                  title="Usar como imagen principal"
                  aria-label="Usar como imagen principal"
                >
                  <Star size={14} />
                </button>
              )}

              <button
                type="button"
                onClick={() => eliminar(imagen)}
                disabled={ocupado}
                title="Eliminar imagen"
                aria-label="Eliminar imagen"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="admin-gallery-add"
          onClick={() => inputRef.current?.click()}
          disabled={ocupado}
        >
          <ImagePlus size={22} />
          <span>{ocupado ? "Subiendo..." : "Agregar"}</span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          hidden
          onChange={(e) => subir(e.target.files)}
        />
      </div>

      {error && <div className="admin-error">{error}</div>}
    </div>
  );
}

export default AdminProductGallery;
