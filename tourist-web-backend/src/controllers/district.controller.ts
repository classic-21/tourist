import { Request, Response } from "express";
import { createResponseObject } from "../utils/response.js";
import District from "../models/district.model.js";
import Place from "../models/place.model.js";
import PurchasedDistrict from "../models/purchasedDistrict.model.js";
import { GlobalRequestDTO } from "../types/user.types.js";

export class DistrictController {
  // GET /districts/all — public
  async getAllDistricts(req: Request, res: Response): Promise<void> {
    try {
      const districts = await District.find({ deletedAt: null }).sort({ name: 1 });

      // Attach place count for each district
      const districtIds = districts.map((d) => d._id);
      const placeCounts = await Place.aggregate([
        { $match: { districtID: { $in: districtIds }, deletedAt: null } },
        { $group: { _id: "$districtID", count: { $sum: 1 } } },
      ]);

      const countMap: Record<string, number> = {};
      for (const pc of placeCounts) {
        countMap[pc._id.toString()] = pc.count;
      }

      const data = districts.map((d: any) => ({
        id: d._id,
        name: d.name,
        description: d.description,
        imageUrl: d.imageUrl,
        amount: d.amount,
        state: d.state,
        placeCount: countMap[d._id.toString()] ?? 0,
      }));

      res.status(200).json(createResponseObject(200, "Districts fetched successfully", data));
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
  }

  // GET /districts/:id — JWT required
  async getDistrict(req: Request, res: Response): Promise<void> {
    const { userID, isTestUser } = req as GlobalRequestDTO;
    const { id } = req.params;

    try {
      const district = await District.findOne({ _id: id, deletedAt: null });
      if (!district) {
        res.status(404).json(createResponseObject(404, "District not found"));
        return;
      }

      const places = await Place.find({ districtID: id, deletedAt: null }).sort({ order: 1 });

      // Check if user has purchased this district
      const purchased = isTestUser
        ? true
        : !!(await PurchasedDistrict.findOne({ userID, districtID: id }));

      res.status(200).json(
        createResponseObject(200, "District fetched successfully", {
          id: district._id,
          name: district.name,
          description: district.description,
          imageUrl: district.imageUrl,
          amount: district.amount,
          state: district.state,
          purchased,
          places: places.map((p: any) => ({
            id: p._id,
            name: p.name,
            description: p.description,
            imageUrl: p.imageUrl,
            order: p.order,
            amount: p.amount,
          })),
        })
      );
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
  }

  // POST /districts — admin
  async createDistrict(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, imageUrl, amount, state } = req.body;

      if (!name || amount === undefined) {
        res.status(400).json(createResponseObject(400, "name and amount are required"));
        return;
      }

      const district = await District.create({ name, description, imageUrl, amount, state });
      res.status(201).json(createResponseObject(201, "District created successfully", { id: district._id, name: district.name }));
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(409).json(createResponseObject(409, "District with this name already exists"));
      } else {
        res.status(500).json(createResponseObject(500, "Internal Server Error"));
      }
    }
  }

  // PATCH /districts/:id — admin
  async updateDistrict(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const { name, description, imageUrl, amount, state } = req.body;
      const updated = await District.findByIdAndUpdate(
        id,
        { $set: { name, description, imageUrl, amount, state } },
        { new: true, runValidators: true }
      );
      if (!updated) {
        res.status(404).json(createResponseObject(404, "District not found"));
        return;
      }
      res.status(200).json(createResponseObject(200, "District updated successfully", updated));
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
  }

  // DELETE /districts/:id — admin, soft delete
  async deleteDistrict(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const district = await District.findById(id);
      if (!district) {
        res.status(404).json(createResponseObject(404, "District not found"));
        return;
      }
      await (district as any).softDelete();
      res.status(200).json(createResponseObject(200, "District deleted successfully"));
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
  }
}
