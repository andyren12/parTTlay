// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// AWS S3 Client Setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Endpoint: Generate Presigned URL
app.post("/api/getPresignedUrl", async (req, res) => {
  const { fileName, fileType, oldUrl } = req.body;

  // Delete old image if oldUrl is provided
  if (oldUrl) {
    try {
      const url = new URL(oldUrl);
      const key = decodeURIComponent(url.pathname).slice(1); // remove leading '/'

      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      });

      await s3.send(deleteCommand);
      console.log(`Deleted old profile picture: ${key}`);
    } catch (err) {
      console.warn("Failed to delete old image (may not exist):", err.message);
    }
  }

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `profilePics/${fileName}`,
    ContentType: fileType,
  });

  try {
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // 60 seconds
    res.json({ url: signedUrl });
  } catch (err) {
    console.error("Failed to generate presigned URL:", err);
    res.status(500).json({ error: "Could not generate presigned URL" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
