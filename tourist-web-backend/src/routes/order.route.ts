import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";
import { checkJWT } from "../middleware/user.middleware.js";

const router = Router();

const orderControllerInstance = new OrderController();

// Webhook Payment URL
router
  .route("/verifyPayment/webhook")
  .post(orderControllerInstance.verifyPayment.bind(orderControllerInstance));

// Literal routes (must come before parameterized)
router
  .route("/purchased")
  .get(
    checkJWT,
    orderControllerInstance.getPurchasedTours.bind(orderControllerInstance)
  );

router
  .route("/purchased/districts")
  .get(
    checkJWT,
    orderControllerInstance.getPurchasedDistricts.bind(orderControllerInstance)
  );

router
  .route("/purchased/places")
  .get(
    checkJWT,
    orderControllerInstance.getPurchasedPlaces.bind(orderControllerInstance)
  );

// District and Place order creation
router
  .route("/district/:districtID")
  .post(checkJWT, orderControllerInstance.createDistrictOrder.bind(orderControllerInstance));

router
  .route("/place/:placeID")
  .post(checkJWT, orderControllerInstance.createPlaceOrder.bind(orderControllerInstance));

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

// Create Tour Order API
router
  .route("/:tourID")
  .post(
    checkJWT,
    orderControllerInstance.createOrder.bind(orderControllerInstance)
  );

export default router;
