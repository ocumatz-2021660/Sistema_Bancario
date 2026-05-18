import { body } from "express-validator";
import { handleValidationErrors } from "./validation.js";
import { validateJWT } from "./validate-JWT.js";

export const createServiceValidator = [
    validateJWT, // Primero verificamos que el usuario esté logueado
    body('descripcion_servicio', 'La descripción es obligatoria').notEmpty(),
    body('puntos_minimos_servicio', 'Los puntos deben ser un número positivo').isInt({ min: 1 }),
    body('cuenta_servicio', 'El ID de la cuenta no es válido').isMongoId(),
    handleValidationErrors 
];