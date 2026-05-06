import { v2 as cloudinary } from 'cloudinary';
import { config } from '../configs/config.js';
import fs from 'fs/promises';

// FIX: Bypass SSL (Cloudinary, etc.)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadImage = async (filePath, fileName) => {
  try {
    const folder = config.cloudinary.folder;
    
    // CORRECCIÓN CRÍTICA: Normalizar la ruta del archivo
    // Convertir todas las barras invertidas a barras normales
    const normalizedFilePath = filePath.replace(/\\/g, '/');
    
    // Remover la extensión del fileName para el public_id
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    
    const options = {
      public_id: fileNameWithoutExt,
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    };

    const result = await cloudinary.uploader.upload(normalizedFilePath, options);

    // Eliminar archivo local después de subir exitosamente
    try {
      await fs.unlink(normalizedFilePath);
    } catch {
      console.warn('Warning: Could not delete local file:', normalizedFilePath);
    }

    if (result.error) {
      throw new Error(`Error uploading image: ${result.error.message}`);
    }

    // CORRECCIÓN: Retornar la URL completa de Cloudinary en lugar de solo el fileName
    // La URL viene en result.secure_url y tiene el formato correcto:
    // https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.ext
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error?.message || error);

    try {
      await fs.unlink(filePath);
    } catch {
      console.warn('Warning: Could not delete local file after upload error');
    }

    throw new Error(
      `Failed to upload image to Cloudinary: ${error?.message || ''}`
    );
  }
};

export const deleteImage = async (imagePath) => {
  try {
    if (!imagePath || imagePath === config.cloudinary.defaultAvatarPath) {
      return true;
    }

    const folder = config.cloudinary.folder;
    
    // Si imagePath es una URL completa, extraer el public_id
    let publicId;
    if (imagePath.includes('cloudinary.com')) {
      // Extraer public_id de la URL
      // Formato: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.ext
      const urlParts = imagePath.split('/upload/');
      if (urlParts.length > 1) {
        const pathAfterUpload = urlParts[1];
        // Remover el número de versión (v1234567890/)
        const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
        // Remover la extensión
        publicId = pathWithoutVersion.replace(/\.[^/.]+$/, '');
      } else {
        publicId = imagePath;
      }
    } else {
      // Si no es URL, asumir que es solo el nombre del archivo
      publicId = imagePath.includes('/')
        ? imagePath
        : `${folder}/${imagePath}`;
    }
    
    const result = await cloudinary.uploader.destroy(publicId);

    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

export const getFullImageUrl = (imagePath) => {
  if (!imagePath) {
    return getDefaultAvatarUrl();
  }

  // Si ya es una URL completa de Cloudinary, retornarla directamente
  if (imagePath.startsWith('https://res.cloudinary.com/') || 
      imagePath.startsWith('http://res.cloudinary.com/')) {
    return imagePath;
  }

  // Si no es URL completa, construirla (para compatibilidad con datos antiguos)
  const baseUrl = config.cloudinary.baseUrl || `https://res.cloudinary.com/${config.cloudinary.cloudName}/image/upload/`;
  const folder = config.cloudinary.folder;

  const pathToUse = !imagePath
    ? config.cloudinary.defaultAvatarPath
    : imagePath.includes('/')
      ? imagePath
      : `${folder}/${imagePath}`;

  return `${baseUrl}${pathToUse}`;
};

export const getDefaultAvatarUrl = () => {
  const defaultPath = config.cloudinary.defaultAvatarPath;
  return getFullImageUrl(defaultPath);
};

export const getDefaultAvatarPath = () => {
  const defaultPath = config.cloudinary.defaultAvatarPath;
  // If dotenv didn't expand nested vars, build from env pieces
  if (defaultPath && defaultPath.includes('${')) {
    const folder = process.env.CLOUDINARY_FOLDER;
    const filename = process.env.CLOUDINARY_DEFAULT_AVATAR_FILENAME;
    if (folder || filename) {
      return [folder, filename].filter(Boolean).join('/');
    }
  }
  if (defaultPath && defaultPath.includes('/')) {
    return defaultPath.split('/').pop();
  }
  return defaultPath;
};

export default {
  uploadImage,
  deleteImage,
  getFullImageUrl,
  getDefaultAvatarUrl,
  getDefaultAvatarPath,
};