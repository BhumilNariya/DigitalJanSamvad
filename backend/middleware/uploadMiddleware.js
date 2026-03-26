const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Validate that real Cloudinary credentials are set
const hasValidCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME.trim().length > 0 &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY.trim().length > 0 &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_API_SECRET.trim().length > 0;

console.log('[Upload] Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '(not set)',
  configured: !!hasValidCloudinary,
  strategy: hasValidCloudinary ? 'memory→Cloudinary (in controller)' : 'disk (local fallback)',
});

let storage;

if (hasValidCloudinary) {
  // ── Memory storage: buffer is uploaded to Cloudinary inside the controller ──
  // We intentionally avoid multer-storage-cloudinary because it uses
  // file.stream which was removed in multer v2. Instead we buffer the file
  // in memory and call cloudinary.uploader.upload_stream() ourselves.
  storage = multer.memoryStorage();
} else {
  // ── Local disk fallback for development without Cloudinary creds ──────────
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  });
  console.warn('[Upload] No Cloudinary credentials — using local disk storage.');
}

// File type filter — only images
const fileFilter = (_req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG and WebP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

module.exports = { upload, hasValidCloudinary };
