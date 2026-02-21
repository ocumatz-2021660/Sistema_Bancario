import { Router } from "express";
import { saveService, updateService, deleteService } from "./service.controller.js";
import { createServiceValidator } from "../../middlewares/service-validators.js";
import { validateJWT } from "../../middlewares/validate-JWT.js";

const router = Router();

router.post('/create', createServiceValidator, saveService);
router.put('/update/:id', [validateJWT], updateService);
router.delete('/delete/:id', [validateJWT], deleteService);

export default router;