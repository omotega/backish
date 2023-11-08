import { v2 as cloudinary } from "cloudinary";
import config from "../config/env";

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
  secure: true,
});

const uploadImage = async (imagePath: string) => {
  // Use the uploaded file's name as the asset's public ID and
  // allow overwriting the asset with new versions

  try {
    // Upload the image
    const result = await cloudinary.uploader.upload(imagePath, {
      timeout: 120000,
      resource_type: "auto",
    });
    const response = {
      url: result.url,
      publicId: result.public_id,
      size: result.bytes,
    };
    return response;
  } catch (error) {
    console.error(error);
  }
};

export default {
  uploadImage,
};
