import { Request, Response } from "express";
import Tour from "../models/tour.model.js";
import {
  getResourcesFromFolder,
  getSingleResouceFromFolder,
} from "../utils/cloudinary.js";
import PurchasedTour from "../models/purchasedTour.model.js";
import User from "../models/user.model.js";
import { GlobalRequestDTO } from "../types/user.types.js";
import {
  getPresignedUrlsForFolder,
  getS3PresignedUrl,
} from "../utils/s3Helper.js";

export class TourController {
  private readonly foldersArray = [1, 2, 3, 4, 5];

  async createTour(req: Request, res: Response) {
    const { mappingID, name, description, place, amount } = req.body || {};

    if ([mappingID, name, description, place].some((item) => !item)) {
      res.status(400).json({
        statusCode: 400,
        message: "mappingID, name, description and place are required fields",
      });
      return;
    }

    try {
      await Tour.create({
        name,
        description,
        place,
        mappingID,
        amount,
      });

      res
        .status(200)
        .json({ statusCode: 200, message: "Tour added successfully!" });
    } catch (error) {
      console.log("Error: ", JSON.stringify(error));
      res.status(500).json({
        statusCode: 500,
        message: "Please try again after sometime",
      });
    }
    return;
  }

  async getAllTours(req: Request, res: Response) {
    try {
      const { place, minPrice, maxPrice } = req.query;

      const query: Record<string, any> = { deletedAt: null };

      if (place && typeof place === "string" && place.trim()) {
        query.place = { $regex: place.trim(), $options: "i" };
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        query.amount = {};
        if (minPrice !== undefined) query.amount.$gte = Number(minPrice);
        if (maxPrice !== undefined) query.amount.$lte = Number(maxPrice);
      }

      const toursDetails = await Tour.find(query).select(
        "-createdAt -updatedAt -__v -deletedAt"
      );

      const response = toursDetails.map((tour) => {
        return {
          id: tour._id,
          name: tour.name,
          description: tour.description,
          place: tour.place,
          amount: tour.amount,
          mappingID: tour.mappingID,
        };
      });

      res.status(200).json({
        statusCode: 200,
        message: "All tours fetched successfully!",
        data: response,
      });
    } catch (error) {
      console.log("Error in get tours api: ", JSON.stringify(error));
      res.status(500).json({
        statusCode: 500,
        message: "Please try again after sometime",
      });
    }
    return;
  }

  async updateTour(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, description, place, amount, mappingID } = req.body;

    if (!id) {
      res.status(400).json({ statusCode: 400, message: "Tour ID is required" });
      return;
    }

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (place !== undefined) updates.place = place;
    if (amount !== undefined) updates.amount = amount;
    if (mappingID !== undefined) updates.mappingID = mappingID;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ statusCode: 400, message: "No fields to update" });
      return;
    }

    try {
      const updated = await Tour.findByIdAndUpdate(id, { $set: updates }, { new: true });
      if (!updated) {
        res.status(404).json({ statusCode: 404, message: "Tour not found" });
        return;
      }
      res.status(200).json({ statusCode: 200, message: "Tour updated successfully", data: updated });
    } catch (error) {
      res.status(500).json({ statusCode: 500, message: "Internal Server Error" });
    }
    return;
  }

  async deleteTour(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ statusCode: 400, message: "Tour ID is required" });
      return;
    }

    try {
      const tour = await Tour.findById(id);
      if (!tour) {
        res.status(404).json({ statusCode: 404, message: "Tour not found" });
        return;
      }
      await (tour as any).softDelete();
      res.status(200).json({ statusCode: 200, message: "Tour deleted successfully" });
    } catch (error) {
      res.status(500).json({ statusCode: 500, message: "Internal Server Error" });
    }
    return;
  }

  async getTour(req: Request, res: Response): Promise<void> {
    const { id } = req?.params;

    if (!id) {
      res.status(400).json({
        statusCode: 400,
        message: "No id found",
      });
    }

    const tourDetails = await Tour.findById(id).select(
      "-createdAt -updatedAt -__v -deletedAt"
    );

    const [rawPlaceImages, rawPlaceAudios] = await Promise.all([
      getPresignedUrlsForFolder(`toursImages/${tourDetails?.mappingID}`).catch(() => []),
      getPresignedUrlsForFolder(`toursAudios/trial/${tourDetails?.mappingID}`).catch(() => []),
    ]);

    console.log(">>>rawPlaceAudios: ", rawPlaceAudios);

    const placesDescription = {
      id: tourDetails?._id,
      name: tourDetails?.name,
      description: tourDetails?.description,
      place: tourDetails?.place,
      amount: tourDetails?.amount,
      mappingID: tourDetails?.mappingID,
    };

    const filteredPlaceImages = Array.isArray(rawPlaceImages)
      ? rawPlaceImages?.map((item: any, id: number) => {
          const isDefault = item?.name?.search("default");
          return {
            id: id + 1,
            imageName: isDefault !== -1 ? "default" : item?.name,
            url: item?.url,
          };
        })
      : [];

    const filteredPlaceAudios = Array.isArray(rawPlaceAudios)
      ? rawPlaceAudios?.map((item: any, id: number) => {
          const isDefault = item?.name?.search("default");
          return {
            id: id + 1,
            audioName: isDefault !== -1 ? "default" : item?.name,
            url: item?.url,
          };
        })
      : [];

    const placeCompleteData = {
      ...placesDescription,
      images: filteredPlaceImages || [],
      audios: filteredPlaceAudios || [],
    };

    res.status(200).json({
      statusCode: 200,
      message: "Data fetched successfully.",
      data: placeCompleteData,
    });
    return;
  }

  async getSubscribedTourAudio(req: Request, res: Response): Promise<void> {
    const { tourID, language } = req?.params || {};

    const { userID } = req as GlobalRequestDTO;

    if (!tourID || !language) {
      res.status(400).json({
        statusCode: 400,
        message: "No id or language found",
      });
      return;
    }

    const [tourDetails, userDetails, tourPurchasedDetails] = await Promise.all([
      Tour.findById(tourID).select("-createdAt -updatedAt -__v -deletedAt"),
      User.findById(userID),
      PurchasedTour.findOne({ userID, tourID }),
    ]);

    if (!tourDetails) {
      res.status(404).json({
        statusCode: 404,
        message: "No tour found with this id",
      });
      return;
    }

    if (!tourPurchasedDetails) {
      res.status(403).json({
        statusCode: 403,
        message: "Forbidden access",
      });
      return;
    }

    let paidAudioUrl = null;
    try {
      paidAudioUrl = await getS3PresignedUrl(
        `toursAudios/paid/${tourDetails?.mappingID}/${language}.mp3`
        // TODO: add expiry time when going live
      );
    } catch (error) {
      console.log("S3 error fetching paid audio:", error);
    }

    res.status(200).json({
      statusCode: 200,
      message: "Data fetched successfully.",
      data: {
        id: tourDetails?._id,
        audioUrl: paidAudioUrl,
      },
    });

    return;
  }
}
