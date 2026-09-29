import { BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { existsSync, unlinkSync } from 'fs';
import { diskStorage } from 'multer';
import { join, normalize, sep } from 'path';

/*
 * Carpeta raíz de archivos subidos: backend/uploads
 * (este archivo compila a dist/common/uploads.js).
 */
export const UPLOADS_ROOT = join(__dirname, '..', '..', 'uploads');

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/*
 * Solo imágenes. La extensión se toma del tipo MIME, no del
 * nombre original, para que no se pueda subir "foto.html".
 */
const EXTENSIONES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

interface ArchivoSubido {
  mimetype: string;
  filename?: string;
}

type Callback<T> = (error: Error | null, value: T) => void;

export function imageUploadOptions(
  carpeta: 'products' | 'categories',
  prefijo: string,
) {
  return {
    storage: diskStorage({
      destination: join(UPLOADS_ROOT, carpeta),
      filename: (
        _req: unknown,
        file: ArchivoSubido,
        callback: Callback<string>,
      ) => {
        const nombre = `${prefijo}-${Date.now()}-${randomBytes(6).toString('hex')}`;

        callback(null, `${nombre}${EXTENSIONES[file.mimetype]}`);
      },
    }),

    fileFilter: (
      _req: unknown,
      file: ArchivoSubido,
      callback: Callback<boolean>,
    ) => {
      if (!EXTENSIONES[file.mimetype]) {
        callback(
          new BadRequestException(
            'Solo se permiten imágenes JPG, PNG, WEBP o GIF.',
          ),
          false,
        );
        return;
      }

      callback(null, true);
    },

    limits: {
      fileSize: MAX_IMAGE_BYTES,
      files: 10,
    },
  };
}

/*
 * Borra del disco un archivo guardado como "/uploads/...".
 * Ignora rutas externas o que intenten salir de la carpeta.
 */
export function deleteUploadedFile(url: string | null | undefined) {
  if (!url || !url.startsWith('/uploads/')) {
    return;
  }

  const ruta = normalize(join(UPLOADS_ROOT, url.slice('/uploads/'.length)));

  if (!ruta.startsWith(UPLOADS_ROOT + sep)) {
    return;
  }

  try {
    if (existsSync(ruta)) {
      unlinkSync(ruta);
    }
  } catch {
    // Si no se puede borrar, no es motivo para fallar la operación.
  }
}
