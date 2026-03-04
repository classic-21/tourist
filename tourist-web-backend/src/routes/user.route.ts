import { Router } from "express";
import { UsersController } from "../controllers/user.controller.js";
import { checkJWT } from "../middleware/user.middleware.js";

const router = Router();

const userInstance = new UsersController();

router.route("/create").post(userInstance?.createUser.bind(userInstance));
router.route("/login").post(userInstance?.userLogin.bind(userInstance));
router
  .route("/generateAccessToken")
  .post(userInstance.getAccessToken.bind(userInstance));
router
  .route("/logout")
  .post(checkJWT, userInstance.logoutUser.bind(userInstance));

router
  .route("/profile")
  .get(checkJWT, userInstance?.getUserProfile.bind(userInstance))
  .patch(checkJWT, userInstance?.updateUserProfile.bind(userInstance));

router
  .route("/change-password")
  .patch(checkJWT, userInstance?.changePassword.bind(userInstance));

export default router;
