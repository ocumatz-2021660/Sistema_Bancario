import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../configs/config.js';
import fs from 'fs';

// Crear el directorio de uploads si no existe
const createUploadDir = () => {
  if (!fs.existsSync(config.upload.uploadPath)) {
    fs.mkdirSync(config.upload.uploadPath, { recursive: true });
  }
};

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    createUploadDir();
    cb(null, config.upload.uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  if (config.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, JPG, PNG, GIF)'
      ),
      false
    );
  }
};

// Configuración de multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.upload.maxSize,
  },
  fileFilter: fileFilter,
});

/**
 * Middleware para manejar errores de upload
 */
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande',
        error: `El tamaño máximo permitido es ${config.upload.maxSize / (1024 * 1024)}MB`,
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

  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de archivo no permitido',
      error: 'Solo se permiten imágenes (JPEG, JPG, PNG, GIF)',
    });
  }

  next(error);
};

export const deleteFile = (filename) => {
  try {
    const filePath = path.join(config.upload.uploadPath, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

export const deleteFileByPath = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file by path:', error);
    return false;
  }
};
