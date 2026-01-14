import { v2 as cloudinary } from "cloudinary";
import { APIErrors } from "./apiErrors.js";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getImageUrlCloudinary(id: string) {
  try {
    const imageURL = cloudinary.url(`static_images/${id}/default`);
    return { imageName: `${id}`, imageURL };
  } catch (error) {
    console.log(
      "Error came while fetching image url from Cloudinary. Error: ",
      JSON.stringify(error)
    );
    throw new APIErrors({ statusCode: 500, message: "Internal Server Error" });
  }
}

async function getListOfImagesFromCloudinary(id: string) {
  let listImages;
  try {
    listImages = await cloudinary.api.resources({
      type: "upload",
      prefix: `static_images/${id}/`,
      resource_type: "image",
    });
    const imagesURLs = listImages?.resources?.map(
      (item: { [key: string]: any }) => {
        const lastSlashIndex = item?.public_id?.lastIndexOf("/");
        const itemName =
          lastSlashIndex === -1
            ? item?.public_id
            : item?.public_id.substring(lastSlashIndex + 1);
        return { imageName: itemName, url: item?.url };
      }
    );
    return imagesURLs;
  } catch (error) {
    console.log(
      "Error came while fetching image list from Cloudinary. Error: ",
      JSON.stringify(error)
    );
    throw new APIErrors({ statusCode: 500, message: "Internal Server Error" });
  }
}

async function getAudioList(id: string) {
  try {
    const audioList = await cloudinary.api.resources({
      type: "upload",
      prefix: `static_audio/${id}/`,
      resource_type: "raw",
    });
    const audioURLs = audioList?.resources?.map(
      (item: { [key: string]: any }) => {
        const lastSlashIndex = item?.public_id?.lastIndexOf("/");
        const itemName =
          lastSlashIndex === -1
            ? item?.public_id
            : item?.public_id.substring(lastSlashIndex + 1);
        return { itemName, url: item?.url };
      }
    );
    return audioURLs;
  } catch (error) {
    console.log(
      "Error came while fetching image list from Cloudinary. Error: ",
      JSON.stringify(error)
    );
    throw new APIErrors({ statusCode: 500, message: "Internal Server Error" });
  }
}

const getSingleResouceFromFolder = async (
  folder: number,
  mainFolder = "static_audios",
  fileName = "default"
) => {
  const publicId = `${mainFolder}/${folder}/${fileName}`;

  // Generate the signed URL
  const signedUrl = cloudinary.url(publicId, {
    secure: true,
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + 5, // Expires in 50 seconds
  });

  return signedUrl;
};

const getResourcesFromFolder = async (
  folder: number,
  mainFolder = "static_audios",
) => {
  try {
    const response = await cloudinary.api.resources({
      type: "upload",
      prefix: `${mainFolder}/${folder}/`,
      max_results: 100, // Adjust this if needed
    });

    return response.resources;
  } catch (error) {
    console.error(`Error fetching resources from folder: ${folder}`, error);
    return [];
  }
};

export {
  getImageUrlCloudinary,
  getListOfImagesFromCloudinary,
  getAudioList,
  getResourcesFromFolder,
  getSingleResouceFromFolder,
};
