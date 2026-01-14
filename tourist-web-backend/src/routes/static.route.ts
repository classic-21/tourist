import { Router } from "express";
import { StaticDataController } from "../controllers/staticData.controller.js";
import { checkJWT } from "../middleware/user.middleware.js";

const router = Router();

const staticDataController = new StaticDataController();

router
  .route("/getPlacesDescription")
  .get(
    staticDataController?.getDescriptionForPlaces.bind(staticDataController)
  );

router
  .route("/getStaticImages")
  .get(staticDataController.getImages.bind(staticDataController));

/* Old Route */
// router
//   .route("/getAllImages")
//   .get(staticDataController.getAllImages.bind(staticDataController));

router
  .route("/getAllImages")
  .get(staticDataController.getAllImagesNew.bind(staticDataController));

router
  .route("/getAllAudios")
  .get(staticDataController.getAllAudios.bind(staticDataController));

router
  ?.route("/placeData/:id")
  .get(staticDataController.getPlaceData.bind(staticDataController));

router
  ?.route("/placeData/subscribe/:id")
  .get(
    checkJWT,
    staticDataController.getPaidPlaceData.bind(staticDataController)
  );

export default router;
