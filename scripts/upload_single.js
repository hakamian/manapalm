import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load secrets
dotenv.config({ path: '.env.local' });

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const filePath = process.argv[2];

if (!filePath) {
    console.error("❌ Please provide a file path.");
    process.exit(1);
}

const fullPath = path.resolve(filePath);

if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${fullPath}`);
    process.exit(1);
}

(async function () {
    try {
        const customPublicId = process.argv[3];
        const publicId = customPublicId
            ? `manapalm/gallery/${customPublicId}`
            : `manapalm/uploads/${path.basename(fullPath, path.extname(fullPath))}`;

        console.log(`📤 Uploading ${path.basename(fullPath)} as ${publicId}...`);

        const result = await cloudinary.uploader.upload(fullPath, {
            resource_type: "auto",
            public_id: publicId,
            overwrite: true
        });
        console.log(`✅ Upload Successful!`);
        console.log(`🔗 URL: ${result.secure_url}`);
    } catch (error) {
        console.error("❌ Upload Failed:", error.message);
    }
})();
