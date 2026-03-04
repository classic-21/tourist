import { Request, Response } from "express";
import { createResponseObject } from "../utils/response.js";
import Like from "../models/like.model.js";
import Tour from "../models/tour.model.js";
import { GlobalRequestDTO } from "../types/user.types.js";

export class LikeController {
  async toggleLike(req: Request, res: Response): Promise<void> {
    const { userID } = req as GlobalRequestDTO;
    const { tourID } = req.params;

    if (!userID) {
      res.status(401).json(createResponseObject(401, "Unauthorized Access"));
      return;
    }

    if (!tourID) {
      res.status(411).json(createResponseObject(411, "Tour ID is required"));
      return;
    }

    const tourExists = await Tour.findById(tourID);
    if (!tourExists) {
      res.status(404).json(createResponseObject(404, "Tour not found"));
      return;
    }

    try {
      const existing = await Like.findOne({ tourID, userID });
      if (existing) {
        await Like.deleteOne({ tourID, userID });
        res.status(200).json(createResponseObject(200, "Tour unliked", { liked: false }));
      } else {
        await Like.create({ tourID, userID });
        res.status(200).json(createResponseObject(200, "Tour liked", { liked: true }));
      }
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
    return;
  }

  async getLiked(req: Request, res: Response): Promise<void> {
    const { userID } = req as GlobalRequestDTO;

    if (!userID) {
      res.status(401).json(createResponseObject(401, "Unauthorized Access"));
      return;
    }

    try {
      const likes = await Like.find({ userID })
        .populate("tourID", "name place amount mappingID")
        .sort({ createdAt: -1 });

      const response = likes.map((like) => {
        const tour = like.tourID as any;
        return {
          tourID: tour?._id,
          name: tour?.name,
          place: tour?.place,
          amount: tour?.amount,
          mappingID: tour?.mappingID,
        };
      });

      res.status(200).json(
        createResponseObject(200, "Liked tours fetched successfully", response)
      );
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
    return;
  }

  async getLikedTourIDs(req: Request, res: Response): Promise<void> {
    const { userID } = req as GlobalRequestDTO;

    if (!userID) {
      res.status(401).json(createResponseObject(401, "Unauthorized Access"));
      return;
    }

    try {
      const likes = await Like.find({ userID }).select("tourID");
      const tourIDs = likes.map((like) => like.tourID.toString());
      res.status(200).json(
        createResponseObject(200, "Liked tour IDs fetched", tourIDs)
      );
    } catch {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
    return;
  }
}
