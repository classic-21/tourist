import { Router } from "express";
import { TourController } from "../controllers/tour.controller.js";
import { checkJWT, checkAdmin } from "../middleware/user.middleware.js";

const router = Router();

const tourInstance = new TourController();

// Literal routes must come BEFORE parameterized routes

// GET /all - get all tours (public, with optional filter query params)
router.route("/all").get(tourInstance.getAllTours.bind(tourInstance));

// GET /subscribed/:tourID/:language - get paid audio for subscribed user
router
  .route("/subscribed/:tourID/:language")
  .get(checkJWT, tourInstance.getSubscribedTourAudio.bind(tourInstance));

// Admin-only: create tour
router.route("/").post(checkAdmin, tourInstance.createTour.bind(tourInstance));

// Parameterized routes for single tour
router
  .route("/:id")
  .get(checkJWT, tourInstance.getTour.bind(tourInstance))
  .patch(checkAdmin, tourInstance.updateTour.bind(tourInstance))
  .delete(checkAdmin, tourInstance.deleteTour.bind(tourInstance));

export default router;
