// Middleware de subida directa a Cloudinary usando multer-storage-cloudinary
// Sube la imagen directo a Cloudinary sin pasar por disco local
import multer from 'multer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();

// Desactivar verificación SSL (necesario en algunos entornos)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Configurar Cloudinary con las variables de entorno del proyecto
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Tipos de imagen permitidos
const MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
  'image/avif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Crea un uploader de Cloudinary para una carpeta específica
 * @param {string} folder - Carpeta destino en Cloudinary
 * @returns {multer.Multer} Instancia de multer configurada con Cloudinary
 */
const createCloudinaryUploader = (folder) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
      const fileExt = extname(file.originalname);
      const baseName = file.originalname.replace(fileExt, '');
      const safeBase = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, '-') // Elimina caracteres especiales
        .replace(/^-+|-+$/g, '');

      const shortUuid = uuidv4().substring(0, 8);
      const publicId = `${safeBase}-${shortUuid}`;

      return {
        folder: folder,
        public_id: publicId,
        allowed_formats: ['jpeg', 'jpg', 'png', 'webp', 'avif'],
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
        resource_type: 'image',
      };
    },
  });

  return multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (MIMETYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(`Solo se permiten imágenes: ${MIMETYPES.join(', ')}`)
        );
      }
    },
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
  });
};

// Uploader para fotos de perfil de usuarios
export const uploadProfileImage = createCloudinaryUploader(
  process.env.CLOUDINARY_FOLDER || 'proyectobancario/profiles'
);

// Uploader para imágenes de publicaciones
export const uploadPublicationImage = createCloudinaryUploader(
  process.env.CLOUDINARY_PUBLICATIONS_FOLDER || 'proyectobancario/publications'
);

// Middleware para manejar errores de multer de forma amigable
export const handleCloudinaryUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande',
        error: `El tamaño máximo permitido es ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Campo de archivo inesperado',
        error: error.message,
      });
    }
  }

  if (error?.message?.includes('Solo se permiten imágenes')) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de archivo no permitido',
      error: error.message,
    });
  }

  next(error);
};

// Exportar cloudinary para uso en delete-file-on-error.js
export { cloudinary };