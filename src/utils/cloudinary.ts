import { v2 as cloudinary } from 'cloudinary';
import config from '../config/env';

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
      resource_type: 'auto',
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

const uploadLargeFile = async ({
  filePath,
  options = {},
  onProgress,
}: {
  filePath: string;
  options?: any;
  onProgress?: (progress: number) => void;
}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_chunked(filePath, {
      ...options,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    });

    if (onProgress) {
      uploadStream.on('progress', (progress: any) => {
        onProgress(Math.round((progress.loaded / progress.total) * 100));
      });
    }

    uploadStream
      .then((result: any) => {
        resolve({
          url: result.secure_url,
          size: result.bytes,
          public_id: result.public_id,
          format: result.format,
        });
      })
      .catch((error: any) => {
        reject(error);
      });
  });
};

export default {
  uploadImage,
  uploadLargeFile,
};
