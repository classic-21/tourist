import { Request, Response } from "express";
import { createResponseObject } from "../utils/response.js";
import User from "../models/user.model.js";
import Tour from "../models/tour.model.js";
import {
  checkSignature,
  getRazorpayCreds,
  getRazorpayInstance,
} from "../utils/paymentGateway.js";
import Order from "../models/order.model.js";
import { GlobalRequestDTO } from "../types/user.types.js";
import mongoose from "mongoose";
import PurchasedTour from "../models/purchasedTour.model.js";

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

        await PurchasedTour.create({
          orderID: udpatedOrderDetails?._id,
          tourID: udpatedOrderDetails?.tourID,
          userID: udpatedOrderDetails?.userID,
        });

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
}
