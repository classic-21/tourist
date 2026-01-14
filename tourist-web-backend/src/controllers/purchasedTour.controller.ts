import { Request, Response } from "express";
import PurchasedTour from "../models/purchasedTour.model.js";
import { GlobalRequestDTO } from "../types/user.types.js";

export class PurchasedTourController {
  async createPurchasedTour(req: Request, res: Response) {
    const { tourID, userID } = req.body || {};

    if ([tourID, userID].some((item) => !item)) {
      res.status(400).json({
        statusCode: 400,
        message: "tourID and userID are required fields",
      });
      return;
    }

    try {
      await PurchasedTour.create({
        tourID,
        userID,
      });

      res
        .status(200)
        .json({ statusCode: 200, message: "Purchase added successfully!" });
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: "Please try again after sometime",
      });
    }
    return;
  }

  async getPurchasedToursByUserID(req: Request, res: Response) {
    const { userID } = (req as GlobalRequestDTO);
    const tourID = req.params.tourID;

    try {
      const purchasedTours = await PurchasedTour.find({ userID, tourID });

      res.status(200).json({
        statusCode: 200,
        purchasedTours,
      });
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: "Please try again after sometime",
      });
    }
    return;
  }
}
