import { Router } from "express";
import { saveService } from "./service.controller.js";
import { createServiceValidator } from "../../middlewares/service-validators.js";

const router = Router();

router.post('/create', createServiceValidator, saveService);

export default router;