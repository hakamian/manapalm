
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary from the existing credentials
cloudinary.config({
    cloud_name: 'dk2x11rvs',
    api_key: '564926637515816',
    api_secret: 'tU-uWx4BYS1kbZ_tBI_3hdLHKCY'
});

async function sync() {
    console.log('Fetching all resources from Cloudinary...');

    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: '', // All
            max_results: 500
        });

        const resources = result.resources.map(r => ({
            public_id: r.public_id,
            secure_url: r.secure_url,
            format: r.format,
            version: r.version
        }));

        console.log(`Found ${resources.length} resources.`);

        fs.writeFileSync('cloudinary_inventory.json', JSON.stringify(resources, null, 2));
        console.log('Inventory saved to cloudinary_inventory.json');

        // Optional: Analyze directories
        const directories = new Set();
        resources.forEach(r => {
            const parts = r.public_id.split('/');
            if (parts.length > 1) {
                directories.add(parts.slice(0, -1).join('/'));
            }
        });
        console.log('Folders found:', Array.from(directories));

    } catch (error) {
        console.error('Error fetching resources:', error);
    }
}

sync();
