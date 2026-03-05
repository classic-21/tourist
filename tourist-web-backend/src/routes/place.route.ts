import { Router } from "express";
import { PlaceController } from "../controllers/place.controller.js";
import { checkJWT, checkAdmin } from "../middleware/user.middleware.js";

const router = Router();
const ctrl = new PlaceController();

// Literal before parameterized
router.route("/district/:districtID").get(checkJWT, ctrl.getPlacesByDistrict.bind(ctrl));

// Admin CRUD
router.route("/").post(checkAdmin, ctrl.createPlace.bind(ctrl));
router.route("/:id").patch(checkAdmin, ctrl.updatePlace.bind(ctrl));
router.route("/:id").delete(checkAdmin, ctrl.deletePlace.bind(ctrl));

// JWT — get single place with scenics
router.route("/:id").get(checkJWT, ctrl.getPlace.bind(ctrl));

export default router;
