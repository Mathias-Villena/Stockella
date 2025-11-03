const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const publicUrl = (bucket, key) =>
  `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

module.exports = { s3, PutObjectCommand, publicUrl };
