// Middleware que elimina archivos subidos a Cloudinary si ocurre un error
// Evita que queden imágenes huérfanas en Cloudinary cuando falla el request
import { cloudinary } from './cloudinary-uploader.js';

/**
 * Middleware preventivo: escucha el evento 'finish' de la respuesta.
 * Si el status es >= 400, elimina la imagen que se subió a Cloudinary.
 * Se coloca ANTES del controlador en la cadena de middlewares.
 */
export const cleanUploaderFileOnFinish = (req, res, next) => {
  if (req.file) {
    res.on('finish', async () => {
      try {
        if (res.statusCode >= 400) {
          // multer-storage-cloudinary guarda el public_id en req.file.filename
          const publicId = req.file.publicId || req.file.filename;
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
            console.log(
              `Archivo Cloudinary eliminado por respuesta ${res.statusCode}: ${publicId}`
            );
          }
        }
      } catch (error) {
        console.error(
          `Error al eliminar archivo de Cloudinary tras error de respuesta: ${error.message}`
        );
      }
    });
  }
  next();
};

/**
 * Middleware de error: se coloca AL FINAL de la cadena de middlewares.
 * Si ocurre un error no capturado en la cadena, elimina el archivo subido.
 * Firma de 4 parámetros requerida para que Express lo reconozca como error handler.
 */
export const deleteFileOnError = async (err, req, res, next) => {
  try {
    if (req.file) {
      const publicId = req.file.publicId || req.file.filename;
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
        console.log(
          `Archivo Cloudinary eliminado por error en cadena: ${publicId}`
        );
      }
    }
  } catch (error) {
    console.error(
      `Error al eliminar archivo de Cloudinary (error handler): ${error.message}`
    );
  }
  // Pasar el error original al siguiente error handler
  next(err);
};