import { uploadImagesToCloudinary } from './upload.controller.js';
import { Admin } from '../models/Admin.model.js';

export async function uploadAdminAvatar(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const urls = await uploadImagesToCloudinary([req.file]);
    const url = urls[0];
    await Admin.findByIdAndUpdate(req.admin._id, { avatarUrl: url });
    return res.json({ avatarUrl: url });
  } catch (err) {
    return next(err);
  }
}
