import { Request, Response } from "express";
import { createResponseObject } from "../utils/response.js";
import Review from "../models/review.model.js";
import Tour from "../models/tour.model.js";
import PurchasedTour from "../models/purchasedTour.model.js";
import User from "../models/user.model.js";
import { GlobalRequestDTO } from "../types/user.types.js";

export class ReviewController {
  async addReview(req: Request, res: Response): Promise<void> {
    const { userID } = req as GlobalRequestDTO;
    const { tourID } = req.params;
    const { rating, comment } = req.body;

    if (!userID) {
      res.status(401).json(createResponseObject(401, "Unauthorized Access"));
      return;
    }

    if (!tourID) {
      res.status(411).json(createResponseObject(411, "Tour ID is required"));
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      res.status(411).json(createResponseObject(411, "Rating must be between 1 and 5"));
      return;
    }

    const tourDetails = await Tour.findById(tourID);
    if (!tourDetails) {
      res.status(404).json(createResponseObject(404, "Tour not found"));
      return;
    }

    // Only purchased users can review
    const hasPurchased = await PurchasedTour.findOne({ userID, tourID });
    if (!hasPurchased) {
      res.status(403).json(createResponseObject(403, "You must purchase this tour to leave a review"));
      return;
    }

    try {
      await Review.findOneAndUpdate(
        { tourID, userID },
        { $set: { rating: Number(rating), comment: comment?.trim() ?? "" } },
        { upsert: true, new: true }
      );

      res.status(200).json(createResponseObject(200, "Review submitted successfully"));
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
    return;
  }

  async getReviews(req: Request, res: Response): Promise<void> {
    const { tourID } = req.params;

    if (!tourID) {
      res.status(411).json(createResponseObject(411, "Tour ID is required"));
      return;
    }

    try {
      const reviews = await Review.find({ tourID })
        .populate("userID", "name")
        .sort({ createdAt: -1 })
        .limit(50);

      const response = reviews.map((r) => {
        const user = r.userID as any;
        return {
          id: r._id,
          rating: r.rating,
          comment: r.comment,
          userName: user?.name ?? "Anonymous",
          createdAt: r.createdAt,
        };
      });

      // Calculate average rating
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : null;

      res.status(200).json(
        createResponseObject(200, "Reviews fetched successfully", {
          reviews: response,
          averageRating: avgRating ? Number(avgRating.toFixed(1)) : null,
          totalReviews: reviews.length,
        })
      );
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
    return;
  }
}
