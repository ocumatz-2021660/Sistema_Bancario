import { Router } from "express";
import { createRol, getRoles } from "./rol.controller.js";

const router = Router();

// Crear un nuevo rol
router.post('/create', createRol);

// Obtener todos los roles
router.get('/', getRoles);

export default router;
