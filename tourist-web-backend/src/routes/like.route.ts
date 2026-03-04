import { Router } from "express";
import { LikeController } from "../controllers/like.controller.js";
import { checkJWT } from "../middleware/user.middleware.js";

const router = Router();
const likeInstance = new LikeController();

// GET /likes - get all liked tours for authenticated user
router.route("/").get(checkJWT, likeInstance.getLiked.bind(likeInstance));

// GET /likes/ids - get just tourIDs liked by authenticated user (for discover page heart state)
router.route("/ids").get(checkJWT, likeInstance.getLikedTourIDs.bind(likeInstance));

// POST /likes/:tourID - toggle like for a tour
router
  .route("/:tourID")
  .post(checkJWT, likeInstance.toggleLike.bind(likeInstance));

export default router;
