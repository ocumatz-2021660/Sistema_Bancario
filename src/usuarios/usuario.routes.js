import { Router } from "express";
import { createUsuario, getUsuarios } from "./usuario.controller.js";

const router = Router();


router.post('/create', createUsuario);


router.get('/', getUsuarios);

export default router;
