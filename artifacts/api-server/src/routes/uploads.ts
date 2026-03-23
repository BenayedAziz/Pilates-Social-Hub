import { Router } from "express";
import multer from "multer";
import { uploadFile, isStorageConfigured } from "../lib/storage";
import { authMiddleware } from "../middleware/auth";
import crypto from "crypto";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images are allowed"));
  },
});

// POST /api/uploads/image — upload a single image
router.post("/image", authMiddleware, upload.single("image"), async (req, res) => {
  if (!isStorageConfigured()) {
    return res.status(503).json({ message: "Image storage not configured. Set S3_ENDPOINT and S3_ACCESS_KEY." });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No image file provided" });
  }

  const ext = req.file.originalname.split(".").pop() || "jpg";
  const key = `uploads/${req.user!.userId}/${crypto.randomUUID()}.${ext}`;

  const url = await uploadFile(key, req.file.buffer, req.file.mimetype);
  if (!url) {
    return res.status(500).json({ message: "Failed to upload image" });
  }

  return res.status(201).json({ url, key });
});

export default router;
