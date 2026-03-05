import { Request, Response } from "express";
import { createResponseObject } from "../utils/response.js";
import Like from "../models/like.model.js";
import Tour from "../models/tour.model.js";
import District from "../models/district.model.js";
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

    // Accept both Tour IDs and District IDs (3-layer hierarchy)
    const tourExists = await Tour.findById(tourID).catch(() => null);
    const districtExists = tourExists ? null : await District.findOne({ _id: tourID, deletedAt: null }).catch(() => null);
    if (!tourExists && !districtExists) {
      res.status(404).json(createResponseObject(404, "Item not found"));
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
      const likes = await Like.find({ userID }).sort({ createdAt: -1 });

      const response = await Promise.all(
        likes.map(async (like) => {
          const id = like.tourID?.toString();
          // Try tour first, then district
          const tour = await Tour.findById(id).select("name place amount mappingID").catch(() => null);
          if (tour) {
            return {
              tourID: tour._id,
              name: (tour as any).name,
              place: (tour as any).place,
              amount: (tour as any).amount,
              mappingID: (tour as any).mappingID,
            };
          }
          const district = await District.findOne({ _id: id, deletedAt: null }).select("name state amount").catch(() => null);
          if (district) {
            return {
              tourID: district._id,
              name: (district as any).name,
              place: (district as any).state,
              amount: (district as any).amount,
            };
          }
          return { tourID: id, name: "Unknown", place: "", amount: 0 };
        })
      );

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
