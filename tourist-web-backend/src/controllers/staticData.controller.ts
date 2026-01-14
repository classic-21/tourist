import { Request, Response } from "express";
import { placesDescription } from "../static/index.js";
import {
  getImageUrlCloudinary,
  getListOfImagesFromCloudinary,
  getResourcesFromFolder,
  getSingleResouceFromFolder,
} from "../utils/cloudinary.js";
import { GlobalRequestDTO } from "../types/user.types.js";
import User from "../models/user.model.js";
import PurchasedTour from "../models/purchasedTour.model.js";
import Tour from "../models/tour.model.js";
import { getPresignedUrlsForFolder } from "../utils/s3Helper.js";
import { v4 as uuidv4 } from 'uuid';

export class StaticDataController {
  private readonly folders = [1, 2, 3, 4, 5];

  getDescriptionForPlaces(req: Request, response: Response): void {
    response.status(200).json({
      length: placesDescription?.length || 0,
      data: placesDescription || [],
    });
  }

  async getImages(req: Request, res: Response): Promise<void> {
    const { query } = req || {};
    if (!query) {
      console.log("No query received for finding image.");
      res.status(400).json({
        statusCode: 400,
        message: "No image with this id found",
      });
      return;
    }

    const { defaultImage, id: imageID } = query || {};

    if (!imageID) {
      console.log("No id received in query to fetch the image.");
      res.status(400).json({
        statusCode: 400,
        message: "No image with this id found",
      });
      return;
    }

    if (defaultImage) {
      const imagesURLs = await getListOfImagesFromCloudinary(imageID as string);
      res.status(200).json({
        statusCode: 200,
        message: "Image fetched successfully!",
        data: {
          length: imagesURLs?.length || 0,
          data: imagesURLs || [],
        },
      });

      return;
    }

    const imageURL = await getImageUrlCloudinary(imageID as string);

    res.status(200).json({
      statusCode: 200,
      message: "Image fetched successfully!",
      data: imageURL,
    });

    if (!query) {
      const allImages = await Promise.all([getListOfImagesFromCloudinary]);
    }
  }

  async getAudios(req: Request, res: Response): Promise<void> {
    const { query } = req || {};
    if (!query) {
      console.log("No query received for finding image.");
      res.status(400).json({
        statusCode: 400,
        message: "No image with this id found",
      });
      return;
    }

    const { defaultAudio, id: imageID } = query || {};

    if (!imageID) {
      console.log("No id received in query to fetch the image.");
      res.status(400).json({
        statusCode: 400,
        message: "No image with this id found",
      });
      return;
    }

    if (defaultAudio) {
      const imagesURLs = await getListOfImagesFromCloudinary(imageID as string);
      res.status(200).json({
        statusCode: 200,
        message: "Image fetched successfully!",
        data: {
          length: imagesURLs?.length || 0,
          data: imagesURLs || [],
        },
      });

      return;
    }

    const imageURL = await getImageUrlCloudinary(imageID as string);

    res.status(200).json({
      statusCode: 200,
      message: "Image fetched successfully!",
      data: imageURL,
    });
  }

  async getAllImages(req: Request, res: Response) {
    const allResources = [];

    for (const folder of this.folders) {
      const resources = await getResourcesFromFolder(folder, "static_images");
      allResources.push(...resources);
    }

    if (allResources.length > 0) {
      const allImages: any = {};

      allResources?.forEach((item) => {
        const folderNumber = item?.folder?.replace("static_images/", "");
        const isDefault = item?.public_id?.search("default");
        if (allImages?.hasOwnProperty(folderNumber)) {
          allImages[folderNumber]?.push({
            id: item?.asset_id,
            imageID:
              isDefault !== -1
                ? "default"
                : item?.public_id?.replace("/static_images/", "")?.slice(-1),
            url: item?.secure_url,
          });
        } else {
          allImages[folderNumber] = [
            {
              id: item?.asset_id,
              imageID:
                isDefault !== -1
                  ? "default"
                  : item?.public_id?.replace("static_images/", "")?.slice(-1),
              url: item?.secure_url,
            },
          ];
        }
      });

      res.status(200).json({
        statusCode: 200,
        message: "All Images fetched successfully",
        newData: { length: allImages?.length, data: allImages },
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: "No images found",
      data: [],
    });
    return;
  }

  async getAllAudios(req: Request, res: Response) {
    const allResources = [];

    for (const folder of this.folders) {
      const resources = await getResourcesFromFolder(folder);
      allResources.push(...resources);
    }

    if (allResources.length > 0) {
      const allAudios: any = {};

      allResources?.forEach((item) => {
        const folderNumber = item?.folder?.replace("static_audios/", "");
        const isDefault = item?.public_id?.search("default");
        if (allAudios?.hasOwnProperty(folderNumber)) {
          allAudios[folderNumber]?.push({
            id: item?.asset_id,
            imageID:
              isDefault !== -1
                ? "default"
                : item?.public_id?.replace("/static_audios/", "")?.slice(-1),
            url: item?.secure_url,
          });
        } else {
          allAudios[folderNumber] = [
            {
              id: item?.asset_id,
              imageID:
                isDefault !== -1
                  ? "default"
                  : item?.public_id?.replace("static_audios/", "")?.slice(-1),
              url: item?.secure_url,
            },
          ];
        }
      });

      res.status(200).json({
        statusCode: 200,
        message: "All audios fetched successfully",
        newData: { length: allAudios?.length, data: allAudios },
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: "No images found",
      data: [],
    });
  }

  async getPlaceData(req: Request, res: Response): Promise<void> {
    const { id } = req?.params;

    if (!id) {
      res.status(400).json({
        statusCode: 400,
        message: "No id found",
      });
    }

    const [rawPlaceImages, rawPlaceAudios] = await Promise.all([
      getResourcesFromFolder(Number(id), "static_images"),
      getResourcesFromFolder(Number(id)),
    ]);

    const filteredPlaceImages = rawPlaceImages?.map((item: any) => {
      const isDefault = item?.public_id?.search("default");
      return {
        id: item?.asset_id,
        imageID:
          isDefault !== -1
            ? "default"
            : item?.public_id?.replace("/static_images/", "")?.slice(-1),
        url: item?.secure_url,
      };
    });

    const filteredPlaceAudios = rawPlaceAudios?.map((item: any) => {
      const isDefault = item?.public_id?.search("default");
      return {
        id: item?.asset_id,
        imageID:
          isDefault !== -1
            ? "default"
            : item?.public_id?.replace("/static_audios/demo", "")?.slice(-1),
        url: item?.secure_url,
      };
    });

    const placeCompleteData = {
      ...placesDescription[Number(id) - 1],
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

  async getPaidPlaceData(req: Request, res: Response): Promise<void> {
    const { userID } = (req as GlobalRequestDTO) || {};

    const { id } = req?.params || {};

    if (!id || !userID) {
      res.status(400).json({
        statusCode: 400,
        message: "Id and userID not found!",
      });

      return;
    }

    const userDetails = await User.findById(userID);

    if (!userDetails) {
      res.status(401).json({
        statusCode: 401,
        message: "Unauthorized access!",
      });

      return;
    }
    const tourDetails = await Tour.findById(id);

    const isCoursePurchased = await PurchasedTour.findOne({
      tourID: tourDetails?.id, // Use the `tourID` from the `Tour` document you retrieved
      userID: userDetails?.id, // Use the `userID` (from request or context)
    });

    if (isCoursePurchased) {
      // The user has purchased the tour
    } else {
      // The user has not purchased the tour
      res.status(401).json({
        statusCode: 401,
        message: "Please pay to listen to the tour.",
      });
    }

    const paidAudiosContent = getSingleResouceFromFolder(1, "static_images");

    res.status(200).json({
      statusCode: 200,
      message: "Content Fetched Successfully",
      data: paidAudiosContent,
    });
    return;
  }

  async getAllImagesNew(req: Request, res: Response) {
    const allResources = [];

    const toursDetails = await Tour.find({}).select(
      "id mappingID"
    );

    for (const folder of toursDetails) {
      const resource = await getPresignedUrlsForFolder(`toursImages/${folder?.mappingID}`);
      allResources.push({ mappingID: folder?.mappingID, data: resource });
    }

    const dataInHashmap: any = {};

    Array.isArray(allResources) &&
      allResources?.forEach((item) => {
        const { data } = item || {};

        const filteredResponse = data?.map((dataObj) => {
          const isDefault = (dataObj as any)?.name.search("default");
          return {
            id: uuidv4(),
            imageID: isDefault !== -1
              ? "default"
              : dataObj?.name?.replace(
                  /\.(jpg|jpeg|png|gif|bmp|webp|avif|svg|tiff|ico)$/gi,
                  ""
                ),
            url: dataObj?.url,
          };
        });

        dataInHashmap[item?.mappingID] = filteredResponse;
      });

    res.status(200).json({
      statusCode: 200,
      message: "All Images fetched successfully",
      newData: { length: Object.keys(dataInHashmap)?.length, data: dataInHashmap },
    });
  }
}
