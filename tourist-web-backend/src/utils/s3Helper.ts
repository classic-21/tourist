import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

const bucket = process.env.BUCKET_NAME;
const env = process.env.ENV || "dev";

export function getS3ClientInstance() {
  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });
}

export async function getS3PresignedUrl(
  key: string,
  expiry?: number
): Promise<string> {
  const s3Client = getS3ClientInstance();
  const params = {
    Bucket: bucket,
    Key: `${env}/${key}`,
  };

  let signedUrl;

  if (expiry) {
    signedUrl = await getSignedUrl(s3Client, new GetObjectCommand(params), {
      expiresIn: expiry,
    });
  } else {
    signedUrl = await getSignedUrl(s3Client, new GetObjectCommand(params));
  }

  return signedUrl;
}

export const getPresignedUrlsForFolder = async (folderName: string) => {
  const s3Client = getS3ClientInstance();
  try {
    // list objects in the folder
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: folderName.endsWith("/")
        ? `${env}/${folderName}`
        : `${env}/${folderName}/`,
    });

    const response = await s3Client.send(listObjectsCommand);

    if (!response.Contents || response.Contents.length === 0) {
      console.log("No objects found in the folder.");
      return [];
    }

    const presignedUrls = await Promise.all(
      response.Contents.map(async (object) => {
        const url = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: bucket,
            Key: object.Key,
          })
        );

        // Return the object key (image name) and URL
        return {
          name: object.Key?.split("/").pop(), // Extract image name from key
          url,
        };
      })
    );

    return presignedUrls;
  } catch (error) {
    console.error("Error fetching presigned URLs:", error);
    throw error;
  }
};
