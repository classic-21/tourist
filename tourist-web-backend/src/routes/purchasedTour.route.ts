import { Router } from "express";
import { PurchasedTourController } from "../controllers/purchasedTour.controller.js";
import { checkJWT } from "../middleware/user.middleware.js";

const router = Router();

const purchasedTourInstance = new PurchasedTourController();

router
  .route("/")
  .post(purchasedTourInstance?.createPurchasedTour.bind(purchasedTourInstance));

router
  .route("/:tourID/tour")
  .get(
    checkJWT,
    purchasedTourInstance?.getPurchasedToursByUserID.bind(purchasedTourInstance)
  );

export default router;
