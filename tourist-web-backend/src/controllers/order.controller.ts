import { Request, Response } from "express";
import { createResponseObject } from "../utils/response.js";
import User from "../models/user.model.js";
import Tour from "../models/tour.model.js";
import District from "../models/district.model.js";
import Place from "../models/place.model.js";
import {
  checkSignature,
  getRazorpayCreds,
  getRazorpayInstance,
} from "../utils/paymentGateway.js";
import Order from "../models/order.model.js";
import { GlobalRequestDTO } from "../types/user.types.js";
import mongoose from "mongoose";
import PurchasedTour from "../models/purchasedTour.model.js";
import PurchasedDistrict from "../models/purchasedDistrict.model.js";
import PurchasedPlace from "../models/purchasedPlace.model.js";

export class OrderController {
  async createOrder(req: Request, res: Response): Promise<void> {
    const { userID } = req as GlobalRequestDTO;

    const { tourID } = req.params || {};

    if (!userID) {
      res.status(401).json(createResponseObject(401, "Unauthorized Access"));
      return;
    }

    if (!tourID) {
      res.status(411).json(createResponseObject(411, "No tour id found"));
      return;
    }

    const userDetails = await User.findById(userID).select(
      "-password -refreshToken -createdAt, -updatedAt"
    );

    if (!userDetails) {
      res.status(401).json(createResponseObject(401, "Unauthorized Access"));
      return;
    }

    const tourDetails = await Tour.findById(tourID);

    if (!tourDetails) {
      res
        .status(411)
        .json(createResponseObject(411, "The tour is no longer available"));
      return;
    }

    const razorpayInstance = getRazorpayInstance();

    if (!razorpayInstance) {
      res
        .status(422)
        .json(
          createResponseObject(
            422,
            "Our payment partner is currently facing issues we will be back soon"
          )
        );
    }

    try {
      const purchasedTourDetails = await PurchasedTour.findOne({
        userID,
        tourID,
      });

      if (purchasedTourDetails) {
        res
          .status(411)
          .json(createResponseObject(411, "Tour is already purchased"));

        return;
      }
    } catch (error) {}

    let newOrder;

    try {
      newOrder = await Order.create({
        userID: userDetails?.id,
        tourID: tourDetails?.id,
        amount: tourDetails?.amount,
        status: 0,
      });

      if (!newOrder) {
        res
          .status(500)
          .json(
            createResponseObject(
              500,
              "Something went wrong. Please try again in sometime"
            )
          );
        return;
      }
    } catch (error) {
      res
        .status(500)
        .json(
          createResponseObject(
            500,
            "Something went wrong. Please try again in sometime"
          )
        );
      return;
    }

    let razorpayOrderDetails;

    try {
      razorpayOrderDetails = await razorpayInstance.orders.create({
        amount: Number(tourDetails?.amount) * 100,
        currency: "INR",
        receipt: newOrder?.id,
      });
    } catch (error) {
      console.log(">>>error in razorpay order details: ", error);
      res
        .status(500)
        .json(
          createResponseObject(
            500,
            "Our payment partner is facing some issue. Please try again in sometime."
          )
        );
      return;
    }

    if (!razorpayOrderDetails) {
      res
        .status(411)
        .json(
          createResponseObject(
            500,
            "Our payment partner is facing some issue. Please try again in sometime."
          )
        );
      return;
    }

    let updateOrder;
    try {
      updateOrder = await Order.findOneAndUpdate(
        {
          _id: newOrder?._id,
        },
        {
          $set: {
            razorpayOrderID: razorpayOrderDetails?.id,
          },
        },
        { new: true }
      );
    } catch (error) {
      console.log(">>>error in updating order: ", error);
    }

    if (!updateOrder) {
      console.log(
        `Order with orderID - ${newOrder?.id} could not udpated with razorpayOrderID in the DB.`
      );
    }

    const response = {
      id: newOrder?.id,
      amount: razorpayOrderDetails?.amount,
      paymentOrderID: razorpayOrderDetails?.id,
    };

    res
      .status(200)
      .json(createResponseObject(200, "Order created successfully", response));

    return;
  }

  async getOrder(req: Request, res: Response): Promise<void> {
    const { userID } = req as GlobalRequestDTO;

    const { orderID } = req.params;

    if (!orderID) {
      res.status(411).json(createResponseObject(411, "No orderID found"));
      return;
    }

    let orderDetails = await Order.findById(orderID).select(
      "-razorpayOrderID -deletedAt"
    );

    const razorpayPaymentID = orderDetails?.razorpayPaymentID;

    if (!razorpayPaymentID) {
      res
        .status(411)
        .json(
          createResponseObject(411, "No order found for order_id: ", orderID)
        );
      return;
    }

    const razorpayInstance = getRazorpayInstance();

    const paymentStatus = await razorpayInstance.payments.fetch(
      razorpayPaymentID
    );

    if (paymentStatus.status === "captured") {
      try {
        orderDetails = await Order.findByIdAndUpdate(
          orderDetails?._id,
          { status: 1 },
          { new: true }
        );
        console.log("Payment is successful!");
      } catch (error) {
        console.log(
          `>>>error in updating order status for orderID: ${orderID}, err: `,
          JSON.stringify(error)
        );
        res
          .status(500)
          .json(
            createResponseObject(
              500,
              "Error in updating order status for orderID: ",
              orderID
            )
          );

        return;
      }
    } else if (paymentStatus.status === "failed") {
      try {
        orderDetails = await Order.findByIdAndUpdate(
          orderDetails?._id,
          { status: 2 },
          { new: true }
        );
        console.log("Payment failed!");
      } catch (error) {
        res
          .status(500)
          .json(
            createResponseObject(
              500,
              "Error in updating order status for orderID: ",
              orderID
            )
          );
        console.log(
          `>>>error in updating order status for orderID: ${orderID}, err: `,
          JSON.stringify(error)
        );
        return;
      }
    }

    if (userID != orderDetails?.userID?.toString()) {
      res.status(401).json(createResponseObject(401, "Unauthorized access"));
      return;
    }

    if (!orderDetails) {
      res
        .status(411)
        .json(createResponseObject(411, "No order exists for this id"));
      return;
    }

    res
      .status(200)
      .json(
        createResponseObject(200, "Order fetched successfully", orderDetails)
      );

    return;
  }

  async getOrderDetailsByTourID(req: Request, res: Response): Promise<void> {
    const { userID } = req as GlobalRequestDTO;

    const { tourID } = req.params;

    if (!tourID) {
      res.status(411).json(createResponseObject(411, "No tourID found"));
      return;
    }

    const tourDetails = await Tour.findById(tourID);

    if (!tourDetails) {
      res
        .status(411)
        .json(createResponseObject(411, "The tour is no longer available"));
      return;
    }

    const orderDetails = await Order.findOne({
      tourID: tourDetails?._id,
      userID: userID,
    }).sort({ createdAt: -1 });

    if (!orderDetails) {
      res
        .status(411)
        .json(createResponseObject(411, "No order exists for this tour"));
      return;
    }

    res.status(200).json(
      createResponseObject(200, "Order fetched successfully", {
        userID,
        tourID,
        orderID: orderDetails?.id,
        status:
          orderDetails?.status === 0
            ? "Pending"
            : orderDetails?.status === 1
            ? "Success"
            : "Failed",
      })
    );

    return;
  }

  async verifyPayment(req: Request, res: Response): Promise<void> {
    const razorpaySignature = req.headers["x-razorpay-signature"];

    const razorpayresponse = JSON.stringify(req.body);

    if (!razorpaySignature || !razorpayresponse) {
      res
        .status(411)
        .json(
          createResponseObject(
            411,
            "Either no razorpaySignature or razorpayresponse not present"
          )
        );
      return;
    }

    const doesSignatureMatch = checkSignature(
      razorpaySignature?.toString(),
      razorpayresponse
    );

    if (!doesSignatureMatch) {
      res
        .status(411)
        .json(createResponseObject(411, "Razorpay signature does not match"));
      return;
    }

    const { id, order_id } = req.body.payload.payment.entity;

    if (req.body.event === "order.paid") {
      const session = await mongoose.startSession();
      // Payment successful, update order status in DB
      try {
        session.startTransaction();

        const udpatedOrderDetails = await Order.findOneAndUpdate(
          { razorpayOrderID: order_id },
          { $set: { razorpayPaymentID: id, status: 1 } },
          { new: true }
        );

        // Create the appropriate purchased record based on order type
        if (udpatedOrderDetails?.tourID) {
          await PurchasedTour.create({
            orderID: udpatedOrderDetails._id,
            tourID: udpatedOrderDetails.tourID,
            userID: udpatedOrderDetails.userID,
          });
        } else if (udpatedOrderDetails && (udpatedOrderDetails as any)?.districtID) {
          await PurchasedDistrict.create({
            orderID: (udpatedOrderDetails as any)._id,
            districtID: (udpatedOrderDetails as any).districtID,
            userID: (udpatedOrderDetails as any).userID,
          });
        } else if (udpatedOrderDetails && (udpatedOrderDetails as any)?.placeID) {
          await PurchasedPlace.create({
            orderID: (udpatedOrderDetails as any)._id,
            placeID: (udpatedOrderDetails as any).placeID,
            userID: (udpatedOrderDetails as any).userID,
          });
        }

        session.commitTransaction();

        session.endSession();
        res.status(200).json(createResponseObject(200, "Payment successful"));
        return;
      } catch (error) {
        await session.abortTransaction();
        session.endSession();

        res
          .status(500)
          .json(
            createResponseObject(
              500,
              "Something went wrong. Please try again in sometime"
            )
          );
        return;
      }
    }

    if (req.body.event === "payment.failed") {
      // Payment failed, update order status in DB
      await Order.findOneAndUpdate(
        { razorpayOrderID: order_id },
        { $set: { razorpayPaymentID: id, status: 2 } },
        { new: true }
      );
    }

    res.status(200).json({ message: "Webhook processed" });
    return;
  }

  async getRazoropayCreds(req: Request, res: Response): Promise<void> {
    const razorpayCreds = getRazorpayCreds();

    res.status(200).json({
      ...razorpayCreds,
    });

    return;
  }

  async createDistrictOrder(req: Request, res: Response): Promise<void> {
    const { userID } = req as GlobalRequestDTO;
    const { districtID } = req.params;

    if (!userID) {
      res.status(401).json(createResponseObject(401, "Unauthorized Access"));
      return;
    }

    const district = await District.findOne({ _id: districtID, deletedAt: null });
    if (!district) {
      res.status(404).json(createResponseObject(404, "District not found"));
      return;
    }

    const alreadyPurchased = await PurchasedDistrict.findOne({ userID, districtID });
    if (alreadyPurchased) {
      res.status(411).json(createResponseObject(411, "District already purchased"));
      return;
    }

    // Dev mode — Razorpay not configured, grant access directly
    if (!process.env.RAZORPAY_KEY || process.env.RAZORPAY_KEY === "placeholder") {
      const mockOrder = await Order.create({ userID, districtID, amount: district.amount, status: 1 });
      await PurchasedDistrict.create({ userID, districtID, orderID: mockOrder._id });
      res.status(200).json(createResponseObject(200, "Dev mode: access granted without payment", {
        id: mockOrder.id, amount: district.amount * 100, paymentOrderID: null,
      }));
      return;
    }

    const razorpayInstance = getRazorpayInstance();

    let newOrder;
    try {
      newOrder = await Order.create({
        userID,
        districtID,
        amount: district.amount,
        status: 0,
      });
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Something went wrong. Please try again."));
      return;
    }

    let razorpayOrderDetails;
    try {
      razorpayOrderDetails = await razorpayInstance.orders.create({
        amount: Number(district.amount) * 100,
        currency: "INR",
        receipt: newOrder?.id,
      });
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Payment partner facing issues."));
      return;
    }

    await Order.findByIdAndUpdate(newOrder._id, { $set: { razorpayOrderID: razorpayOrderDetails?.id } });

    res.status(200).json(createResponseObject(200, "District order created", {
      id: newOrder?.id,
      amount: razorpayOrderDetails?.amount,
      paymentOrderID: razorpayOrderDetails?.id,
    }));
  }

  async createPlaceOrder(req: Request, res: Response): Promise<void> {
    const { userID } = req as GlobalRequestDTO;
    const { placeID } = req.params;

    if (!userID) {
      res.status(401).json(createResponseObject(401, "Unauthorized Access"));
      return;
    }

    const place = await Place.findOne({ _id: placeID, deletedAt: null });
    if (!place) {
      res.status(404).json(createResponseObject(404, "Place not found"));
      return;
    }

    const alreadyPurchased = await PurchasedPlace.findOne({ userID, placeID });
    if (alreadyPurchased) {
      res.status(411).json(createResponseObject(411, "Place already purchased"));
      return;
    }

    // Dev mode — Razorpay not configured, grant access directly
    if (!process.env.RAZORPAY_KEY || process.env.RAZORPAY_KEY === "placeholder") {
      const mockOrder = await Order.create({ userID, placeID, amount: place.amount, status: 1 });
      await PurchasedPlace.create({ userID, placeID, orderID: mockOrder._id });
      res.status(200).json(createResponseObject(200, "Dev mode: access granted without payment", {
        id: mockOrder.id, amount: place.amount * 100, paymentOrderID: null,
      }));
      return;
    }

    const razorpayInstance = getRazorpayInstance();

    let newOrder;
    try {
      newOrder = await Order.create({
        userID,
        placeID,
        amount: place.amount,
        status: 0,
      });
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Something went wrong. Please try again."));
      return;
    }

    let razorpayOrderDetails;
    try {
      razorpayOrderDetails = await razorpayInstance.orders.create({
        amount: Number(place.amount) * 100,
        currency: "INR",
        receipt: newOrder?.id,
      });
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Payment partner facing issues."));
      return;
    }

    await Order.findByIdAndUpdate(newOrder._id, { $set: { razorpayOrderID: razorpayOrderDetails?.id } });

    res.status(200).json(createResponseObject(200, "Place order created", {
      id: newOrder?.id,
      amount: razorpayOrderDetails?.amount,
      paymentOrderID: razorpayOrderDetails?.id,
    }));
  }

  async getPurchasedDistricts(req: Request, res: Response): Promise<void> {
    const { userID } = req as GlobalRequestDTO;
    if (!userID) {
      res.status(401).json(createResponseObject(401, "Unauthorized Access"));
      return;
    }
    try {
      const purchased = await PurchasedDistrict.find({ userID })
        .populate("districtID", "name state amount imageUrl")
        .populate("orderID", "createdAt")
        .sort({ createdAt: -1 });

      const data = purchased.map((pd) => {
        const district = pd.districtID as any;
        const order = pd.orderID as any;
        return {
          districtID: district?._id,
          name: district?.name,
          state: district?.state,
          amount: district?.amount,
          imageUrl: district?.imageUrl,
          date: order?.createdAt
            ? new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })
            : null,
        };
      });

      res.status(200).json(createResponseObject(200, "Purchased districts fetched", data));
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
  }

  async getPurchasedPlaces(req: Request, res: Response): Promise<void> {
    const { userID } = req as GlobalRequestDTO;
    if (!userID) {
      res.status(401).json(createResponseObject(401, "Unauthorized Access"));
      return;
    }
    try {
      const purchased = await PurchasedPlace.find({ userID })
        .populate("placeID", "name districtID amount imageUrl")
        .populate("orderID", "createdAt")
        .sort({ createdAt: -1 });

      const data = purchased.map((pp) => {
        const place = pp.placeID as any;
        const order = pp.orderID as any;
        return {
          placeID: place?._id,
          name: place?.name,
          districtID: place?.districtID,
          amount: place?.amount,
          imageUrl: place?.imageUrl,
          date: order?.createdAt
            ? new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })
            : null,
        };
      });

      res.status(200).json(createResponseObject(200, "Purchased places fetched", data));
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
  }

  async getPurchasedTours(req: Request, res: Response): Promise<void> {
    const { userID } = req as GlobalRequestDTO;

    if (!userID) {
      res.status(401).json(createResponseObject(401, "Unauthorized Access"));
      return;
    }

    try {
      const purchasedTours = await PurchasedTour.find({ userID })
        .populate("tourID", "name place amount")
        .populate("orderID", "createdAt")
        .sort({ createdAt: -1 });

      const response = purchasedTours.map((pt) => {
        const tour = pt.tourID as any;
        const order = pt.orderID as any;
        return {
          tourID: tour?._id,
          name: tour?.name,
          place: tour?.place,
          amount: tour?.amount,
          date: order?.createdAt
            ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
              })
            : null,
        };
      });

      res
        .status(200)
        .json(
          createResponseObject(200, "Purchased tours fetched successfully", response)
        );
    } catch (error) {
      res
        .status(500)
        .json(createResponseObject(500, "Internal Server Error"));
    }

    return;
  }
}
