import { Router } from "express";
import { ScenicController } from "../controllers/scenic.controller.js";
import { checkJWT, checkAdmin } from "../middleware/user.middleware.js";

const router = Router();
const ctrl = new ScenicController();

// Literal before parameterized
router.route("/place/:placeID").get(checkJWT, ctrl.getScenicsByPlace.bind(ctrl));

// Admin CRUD
router.route("/").post(checkAdmin, ctrl.createScenic.bind(ctrl));
router.route("/:id").patch(checkAdmin, ctrl.updateScenic.bind(ctrl));
router.route("/:id").delete(checkAdmin, ctrl.deleteScenic.bind(ctrl));
router.route("/:id/audio").post(checkAdmin, ctrl.uploadScenicAudio.bind(ctrl));

// JWT — get audio presigned URL
router.route("/:scenicID/audio/:language").get(checkJWT, ctrl.getScenicAudio.bind(ctrl));

// JWT — get single scenic info
router.route("/:id").get(checkJWT, ctrl.getScenic.bind(ctrl));

export default router;
