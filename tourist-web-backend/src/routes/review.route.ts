import { Router } from "express";
import { ReviewController } from "../controllers/review.controller.js";
import { checkJWT } from "../middleware/user.middleware.js";

const router = Router();
const reviewInstance = new ReviewController();

// GET /reviews/:tourID - get all reviews for a tour (public)
router
  .route("/:tourID")
  .get(reviewInstance.getReviews.bind(reviewInstance));

// POST /reviews/:tourID - add a review (auth required, must have purchased)
router
  .route("/:tourID")
  .post(checkJWT, reviewInstance.addReview.bind(reviewInstance));

export default router;
