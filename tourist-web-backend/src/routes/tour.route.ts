import { Router } from "express";
import { TourController } from "../controllers/tour.controller.js";
import { checkJWT } from "../middleware/user.middleware.js";

const router = Router();

const tourInstance = new TourController();

router.route("/").post(tourInstance?.createTour.bind(tourInstance));

router.route("/all").get(tourInstance?.getAllTours.bind(tourInstance));

router.route("/:id").get(checkJWT, tourInstance?.getTour.bind(tourInstance));

router
  .route("/subscribed/:tourID/:language")
  .get(checkJWT, tourInstance?.getSubscribedTourAudio.bind(tourInstance));

export default router;
