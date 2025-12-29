import streamifier from 'streamifier';
import { cloudinary, configureCloudinary } from '../config/cloudinary.js';
import { env } from '../config/env.js';

let cloudinaryReady = false;
function ensureCloudinary() {
  if (cloudinaryReady) return;
  configureCloudinary();
  cloudinaryReady = true;
}

function uploadOne(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.CLOUDINARY_FOLDER,
        resource_type: 'image'
      },
      (err, result) => {
        if (err) return reject(err);
        return resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
}

export async function uploadImagesToCloudinary(files = []) {
  if (!files?.length) return [];
  ensureCloudinary();
  const urls = await Promise.all(files.map(uploadOne));
  return urls;
}
