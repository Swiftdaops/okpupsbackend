import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024, files: 6 },
  fileFilter(req, file, cb) {
    if (!file.mimetype?.startsWith('image/')) return cb(new Error('Only images are allowed'));
    return cb(null, true);
  }
});
