import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

const hasCloudinaryCredentials = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const isCloudinaryConfigured = () => hasCloudinaryCredentials;

export const uploadToCloudinary = async (fileBuffer, folder = 'uploads', resourceType = 'raw') => {
  return new Promise((resolve, reject) => {
    // Validate inputs
    if (!fileBuffer) {
      return reject(new Error('File buffer is required'));
    }

    

    // Ensure we have a proper Buffer
    let buffer = fileBuffer;
    if (!(fileBuffer instanceof Buffer) && fileBuffer instanceof Uint8Array) {
      buffer = Buffer.from(fileBuffer);
    } else if (!Buffer.isBuffer(fileBuffer)) {
      return reject(new Error('Invalid buffer format'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
        use_filename: false,
        unique_filename: true,
        timeout: 60000,
        chunk_size: 6000000 // 6MB chunks for large files
      },
      (error, result) => {
        if (error) {
          console.error('[ERROR] Cloudinary upload error:', error);
          reject(error);
        } else {
          
            public_id: result.public_id,
            secure_url: result.secure_url,
            size: result.bytes
          });
          resolve(result);
        }
      }
    );

    // Handle stream errors
    uploadStream.on('error', (err) => {
      console.error('[ERROR] Upload stream error:', err);
      reject(err);
    });

    try {
      // Convert buffer to stream and pipe to Cloudinary
      const readableStream = Readable.from(buffer);
      
      readableStream.on('error', (err) => {
        console.error('[ERROR] Read stream error:', err);
        reject(err);
      });

      readableStream.pipe(uploadStream);
    } catch (error) {
      console.error('[ERROR] Stream conversion error:', error);
      reject(error);
    }
  });
};

export const deleteFromCloudinary = async (publicId, resourceType = 'raw') => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required for deletion');
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });

    
    return result;
  } catch (error) {
    console.error('[ERROR] Cloudinary delete error:', error);
    throw error;
  }
};

export default cloudinary;