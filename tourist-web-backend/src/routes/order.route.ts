import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";
import { checkJWT } from "../middleware/user.middleware.js";

const router = Router();

const orderControllerInstance = new OrderController();

// router.route("/check").get(orderControllerInstance.getRazoropayCreds.bind(orderControllerInstance));s

// Webhook Payment URL
router
  .route("/verifyPayment/webhook")
  .post(orderControllerInstance.verifyPayment.bind(orderControllerInstance));

// Get Order Details
router
  .route("/:orderID")
  .get(
    checkJWT,
    orderControllerInstance.getOrder.bind(orderControllerInstance)
  );

router
  .route("/:tourID/tour")
  .get(
    checkJWT,
    orderControllerInstance.getOrderDetailsByTourID.bind(
      orderControllerInstance
    )
  );

// Create Order API
router
  .route("/:tourID")
  .post(
    checkJWT,
    orderControllerInstance.createOrder.bind(orderControllerInstance)
  );

export default router;
