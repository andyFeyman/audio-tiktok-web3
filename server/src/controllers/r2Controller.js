// server/src/controllers/r2Controller.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// 配置你的 R2（和 S3 兼容）
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const getR2SignedUrl = async (req, res) => {
  const { filename, filetype } = req.body;

  if (!filename || !filetype) {
    return res.status(400).json({ error: 'Missing filename or filetype' });
  }

  const key = `audio/${Date.now()}-${filename}`;

  try {
    const signedUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        ContentType: filetype,
        ACL: 'public-read', // 关键！让上传的文件公开可访问
      }),
      { expiresIn: 3600 } // 1小时有效
    );

    const publicUrl = `https://${process.env.R2_PUBLIC_DOMAIN}/${key}`;

    res.json({ signedUrl, publicUrl });
  } catch (err) {
    console.error('R2 signed URL error:', err);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
};