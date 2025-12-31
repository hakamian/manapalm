/**
 * Cloudinary Image Upload Script - Output to File
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load secrets from .env.local
dotenv.config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// List of images to upload
const imagesToUpload = [
    { localPath: 'public/images/avatar-female.png', cloudinaryPath: 'manapalm/avatars/avatar-female' },
    { localPath: 'public/images/avatar-male.png', cloudinaryPath: 'manapalm/avatars/avatar-male' },
    { localPath: 'public/images/palm-heritage-group.png', cloudinaryPath: 'manapalm/heritage/palm-heritage-group' },
    { localPath: 'public/images/palm-heritage-memorial.png', cloudinaryPath: 'manapalm/heritage/palm-heritage-memorial' },
    { localPath: 'public/images/service-coaching-lab.png', cloudinaryPath: 'manapalm/services/service-coaching-lab' },
    { localPath: 'public/images/service-mana-pack.png', cloudinaryPath: 'manapalm/services/service-mana-pack' },
    { localPath: 'public/images/products/fig-powder.png', cloudinaryPath: 'manapalm/products/fig-powder' },
    { localPath: 'public/images/products/dates-simple.png', cloudinaryPath: 'manapalm/products/dates-simple' },
    { localPath: 'public/images/products/dates-luxury.png', cloudinaryPath: 'manapalm/products/dates-luxury' },
    { localPath: 'public/images/products/date-syrup.png', cloudinaryPath: 'manapalm/products/date-syrup' },
];

async function uploadImages() {
    const output = [];
    const results = [];

    output.push('🚀 Starting Cloudinary upload...\n');

    for (const image of imagesToUpload) {
        const fullPath = path.resolve(image.localPath);

        if (!fs.existsSync(fullPath)) {
            output.push(`❌ File not found: ${fullPath}`);
            results.push({ path: image.localPath, url: null, error: 'File not found' });
            continue;
        }

        try {
            output.push(`📤 Uploading: ${image.localPath}`);
            const result = await cloudinary.uploader.upload(fullPath, {
                public_id: image.cloudinaryPath,
                overwrite: true,
                resource_type: 'image'
            });

            output.push(`✅ Uploaded: ${result.secure_url}\n`);
            results.push({
                path: image.localPath,
                url: result.secure_url,
                publicId: result.public_id
            });
        } catch (error) {
            output.push(`❌ Error uploading ${image.localPath}: ${error.message}\n`);
            results.push({ path: image.localPath, url: null, error: error.message });
        }
    }

    // Generate URL mapping
    output.push('\n🔄 URL MAPPING FOR CODE UPDATE:\n');
    output.push('================================\n');

    results.filter(r => r.url).forEach(r => {
        const oldPath = '/' + r.path.replace('public/', '');
        output.push(`OLD: ${oldPath}`);
        output.push(`NEW: ${r.url}\n`);
    });

    // Write to file
    fs.writeFileSync('upload_results.txt', output.join('\n'), 'utf8');

    // Also write JSON mapping
    const mapping = {};
    results.filter(r => r.url).forEach(r => {
        const oldPath = '/' + r.path.replace('public/', '');
        mapping[oldPath] = r.url;
    });
    fs.writeFileSync('upload_mapping.json', JSON.stringify(mapping, null, 2), 'utf8');

    console.log('Done! Check upload_results.txt and upload_mapping.json');
}

uploadImages().catch(console.error);
