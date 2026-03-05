import { Router } from "express";
import { DistrictController } from "../controllers/district.controller.js";
import { checkJWT, checkAdmin } from "../middleware/user.middleware.js";

const router = Router();
const ctrl = new DistrictController();

// Public — list all districts
router.route("/all").get(ctrl.getAllDistricts.bind(ctrl));

// Admin CRUD
router.route("/").post(checkAdmin, ctrl.createDistrict.bind(ctrl));
router.route("/:id").patch(checkAdmin, ctrl.updateDistrict.bind(ctrl));
router.route("/:id").delete(checkAdmin, ctrl.deleteDistrict.bind(ctrl));

// JWT — get single district with places
router.route("/:id").get(checkJWT, ctrl.getDistrict.bind(ctrl));

export default router;
