import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = process.env.S3_BUCKET || "pilateshub-uploads";
const REGION = process.env.S3_REGION || "auto";
const ENDPOINT = process.env.S3_ENDPOINT || ""; // Cloudflare R2 endpoint
const ACCESS_KEY = process.env.S3_ACCESS_KEY || "";
const SECRET_KEY = process.env.S3_SECRET_KEY || "";

let client: S3Client | null = null;

function getClient(): S3Client | null {
  if (!ENDPOINT || !ACCESS_KEY) return null;
  if (!client) {
    client = new S3Client({
      region: REGION,
      endpoint: ENDPOINT,
      credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
    });
  }
  return client;
}

export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string | null> {
  const s3 = getClient();
  if (!s3) return null; // No storage configured

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));

  // Return public URL or generate presigned URL
  if (process.env.S3_PUBLIC_URL) {
    return `${process.env.S3_PUBLIC_URL}/${key}`;
  }
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: 86400 });
}

export function isStorageConfigured(): boolean {
  return !!getClient();
}
