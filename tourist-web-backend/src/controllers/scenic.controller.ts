import { Request, Response } from "express";
import { createResponseObject } from "../utils/response.js";
import Scenic from "../models/scenic.model.js";
import { GlobalRequestDTO } from "../types/user.types.js";
import { hasAccessToScenic, hasAccessToPlace } from "../utils/accessHelper.js";
import { getS3PresignedUrl, getS3ClientInstance } from "../utils/s3Helper.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class ScenicController {
  // GET /scenics/place/:placeID — JWT required, access check
  async getScenicsByPlace(req: Request, res: Response): Promise<void> {
    const { userID } = req as GlobalRequestDTO;
    const placeID = req.params.placeID as string;

    try {
      const hasAccess = await hasAccessToPlace(userID, placeID);
      if (!hasAccess) {
        res.status(403).json(createResponseObject(403, "Access denied. Purchase this place or district to continue."));
        return;
      }

      const scenics = await Scenic.find({ placeID, deletedAt: null }).sort({ order: 1 });
      res.status(200).json(
        createResponseObject(200, "Scenics fetched successfully", scenics.map((s: any) => ({
          id: s._id,
          name: s.name,
          description: s.description,
          imageUrl: s.imageUrl,
          order: s.order,
          languages: s.audios?.map((a: any) => a.language) ?? [],
        })))
      );
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
  }

  // GET /scenics/:scenicID/audio/:language — JWT required, access check
  async getScenicAudio(req: Request, res: Response): Promise<void> {
    const { userID } = req as GlobalRequestDTO;
    const scenicID = req.params.scenicID as string;
    const language = req.params.language as string;

    try {
      const hasAccess = await hasAccessToScenic(userID, scenicID);
      if (!hasAccess) {
        res.status(403).json(createResponseObject(403, "Access denied. Purchase this place or district to continue."));
        return;
      }

      const scenic = await Scenic.findOne({ _id: scenicID, deletedAt: null });
      if (!scenic) {
        res.status(404).json(createResponseObject(404, "Scenic not found"));
        return;
      }

      const audioEntry = (scenic as any).audios?.find((a: any) => a.language === language);
      if (!audioEntry) {
        res.status(404).json(createResponseObject(404, `No audio available for language: ${language}`));
        return;
      }

      // TODO: replace with S3 presigned URL when S3 is configured
      // const audioUrl = await getS3PresignedUrl(audioEntry.s3Key, 3600);
      const audioUrl = audioEntry.s3Key.startsWith("http")
        ? audioEntry.s3Key
        : await getS3PresignedUrl(audioEntry.s3Key, 3600);

      res.status(200).json(
        createResponseObject(200, "Audio URL fetched successfully", {
          scenicID,
          language,
          audioUrl,
        })
      );
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
  }

  // POST /scenics — admin
  async createScenic(req: Request, res: Response): Promise<void> {
    try {
      const { placeID, name, description, imageUrl, order, audios } = req.body;
      if (!placeID || !name) {
        res.status(400).json(createResponseObject(400, "placeID and name are required"));
        return;
      }
      const scenic = await Scenic.create({ placeID, name, description, imageUrl, order, audios });
      res.status(201).json(createResponseObject(201, "Scenic created successfully", { id: scenic._id, name: scenic.name }));
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
  }

  // PATCH /scenics/:id — admin
  async updateScenic(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const { placeID, name, description, imageUrl, order, audios } = req.body;
      const updated = await Scenic.findByIdAndUpdate(
        id,
        { $set: { placeID, name, description, imageUrl, order, audios } },
        { new: true, runValidators: true }
      );
      if (!updated) {
        res.status(404).json(createResponseObject(404, "Scenic not found"));
        return;
      }
      res.status(200).json(createResponseObject(200, "Scenic updated successfully", updated));
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
  }

  // DELETE /scenics/:id — admin
  async deleteScenic(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const scenic = await Scenic.findByIdAndUpdate(
        id,
        { $set: { deletedAt: new Date() } },
        { new: true }
      );
      if (!scenic) {
        res.status(404).json(createResponseObject(404, "Scenic not found"));
        return;
      }
      res.status(200).json(createResponseObject(200, "Scenic deleted successfully"));
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
  }

  // POST /scenics/:id/audio — admin — returns S3 presigned PUT URL
  async uploadScenicAudio(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { language, fileName } = req.body;

    if (!language || !fileName) {
      res.status(400).json(createResponseObject(400, "language and fileName are required"));
      return;
    }

    try {
      const scenic = await Scenic.findById(id);
      if (!scenic) {
        res.status(404).json(createResponseObject(404, "Scenic not found"));
        return;
      }

      const bucket = process.env.BUCKET_NAME;
      const env = process.env.ENV || "dev";
      const s3Key = `scenics/${id}/${language}/${fileName}`;

      // In dev without S3, return a placeholder
      if (!bucket || bucket === "placeholder" || !process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === "placeholder") {
        // Save the s3Key to the scenic anyway
        const audios = (scenic as any).audios ?? [];
        const existingIdx = audios.findIndex((a: any) => a.language === language);
        if (existingIdx >= 0) {
          audios[existingIdx].s3Key = s3Key;
        } else {
          audios.push({ language, s3Key });
        }
        (scenic as any).audios = audios;
        await scenic.save();

        res.status(200).json(createResponseObject(200, "Dev mode: S3 not configured, key saved", {
          uploadUrl: "",
          s3Key,
        }));
        return;
      }

      const s3Client = getS3ClientInstance();
      const uploadUrl = await getSignedUrl(
        s3Client,
        new PutObjectCommand({
          Bucket: bucket,
          Key: `${env}/${s3Key}`,
          ContentType: "audio/mpeg",
        }),
        { expiresIn: 600 } // 10 minutes
      );

      // Update the scenic's audio entry
      const audios = (scenic as any).audios ?? [];
      const existingIdx = audios.findIndex((a: any) => a.language === language);
      if (existingIdx >= 0) {
        audios[existingIdx].s3Key = s3Key;
      } else {
        audios.push({ language, s3Key });
      }
      (scenic as any).audios = audios;
      await scenic.save();

      res.status(200).json(createResponseObject(200, "Upload URL generated", { uploadUrl, s3Key }));
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
  }

  // GET /scenics/:id — admin/public info
  async getScenic(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const scenic = await Scenic.findOne({ _id: id, deletedAt: null });
      if (!scenic) {
        res.status(404).json(createResponseObject(404, "Scenic not found"));
        return;
      }
      res.status(200).json(createResponseObject(200, "Scenic fetched", scenic));
    } catch (error) {
      res.status(500).json(createResponseObject(500, "Internal Server Error"));
    }
  }
}
