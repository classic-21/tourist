import { Request, Response } from "express";
import { createResponseObject } from "../utils/response.js";
import Place from "../models/place.model.js";
import Scenic from "../models/scenic.model.js";
import { GlobalRequestDTO } from "../types/user.types.js";
import { hasAccessToPlace } from "../utils/accessHelper.js";

export class PlaceController {
  // GET /places/district/:districtID — JWT required
  async getPlacesByDistrict(req: Request, res: Response): Promise<void> {
    const { userID, isTestUser } = req as GlobalRequestDTO;
    const { districtID } = req.params;

    try {
      const places = await Place.find({ districtID, deletedAt: null }).sort({ order: 1 });
      res.status(200).json(
        createResponseObject(200, "Places fetched successfully", places.map((p: any) => ({
          id: p._id,
          name: p.name,
          description: p.description,
          imageUrl: p.imageUrl,
          order: p.order,
          amount: p.amount,
          districtID: p.districtID,
        })))
      );
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
  }

  // GET /places/:id — JWT required
  async getPlace(req: Request, res: Response): Promise<void> {
    const { userID, isTestUser } = req as GlobalRequestDTO;
    const id = req.params.id as string;

    try {
      const place = await Place.findOne({ _id: id, deletedAt: null });
      if (!place) {
        res.status(404).json(createResponseObject(404, "Place not found"));
        return;
      }

      const scenics = await Scenic.find({ placeID: id, deletedAt: null }).sort({ order: 1 });

      const hasAccess = await hasAccessToPlace(userID, id);

      res.status(200).json(
        createResponseObject(200, "Place fetched successfully", {
          id: place._id,
          name: place.name,
          description: place.description,
          imageUrl: place.imageUrl,
          order: place.order,
          amount: place.amount,
          districtID: place.districtID,
          purchased: hasAccess,
          scenics: scenics.map((s: any) => ({
            id: s._id,
            name: s.name,
            description: s.description,
            imageUrl: s.imageUrl,
            order: s.order,
            languages: s.audios?.map((a: any) => a.language) ?? [],
          })),
        })
      );
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
  }

  // POST /places — admin
  async createPlace(req: Request, res: Response): Promise<void> {
    try {
      const { districtID, name, description, imageUrl, order, amount } = req.body;
      if (!districtID || !name) {
        res.status(400).json(createResponseObject(400, "districtID and name are required"));
        return;
      }
      const place = await Place.create({ districtID, name, description, imageUrl, order, amount });
      res.status(201).json(createResponseObject(201, "Place created successfully", { id: place._id, name: place.name }));
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
  }

  // PATCH /places/:id — admin
  async updatePlace(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const { districtID, name, description, imageUrl, order, amount } = req.body;
      const updated = await Place.findByIdAndUpdate(
        id,
        { $set: { districtID, name, description, imageUrl, order, amount } },
        { new: true, runValidators: true }
      );
      if (!updated) {
        res.status(404).json(createResponseObject(404, "Place not found"));
        return;
      }
      res.status(200).json(createResponseObject(200, "Place updated successfully", updated));
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
  }

  // DELETE /places/:id — admin
  async deletePlace(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const place = await Place.findByIdAndUpdate(
        id,
        { $set: { deletedAt: new Date() } },
        { new: true }
      );
      if (!place) {
        res.status(404).json(createResponseObject(404, "Place not found"));
        return;
      }
      res.status(200).json(createResponseObject(200, "Place deleted successfully"));
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
  }
}
