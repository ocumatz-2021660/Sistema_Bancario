import { Router } from "express";
import { createService 
        , getServices
        , updateService
        , deleteService,
} from "./service.controller.js";
import { validateJWT } from "../../middlewares/validate-JWT.js";
import { isAdmin } from "../../middlewares/is.admin.js";

const router = Router();

router.post('/create', validateJWT, isAdmin, createService);
router.get('/', getServices);
router.put('/update/:id', validateJWT, isAdmin, updateService);
router.delete('/delete/:id', validateJWT, isAdmin, deleteService);

export default router;