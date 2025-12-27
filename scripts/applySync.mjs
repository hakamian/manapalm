
import fs from 'fs';
import path from 'fs';

const inventory = JSON.parse(fs.readFileSync('d:/manapalm-atg/manapalm/cloudinary_inventory.json', 'utf8'));
let dummyData = fs.readFileSync('d:/manapalm-atg/manapalm/utils/dummyData.ts', 'utf8');

const mapping = {};
inventory.forEach(item => {
    // Exact match for the end of the URL or the public ID
    mapping[item.public_id] = item.secure_url;
    // Also map by filename only
    const filename = item.public_id.split('/').pop();
    mapping[filename] = item.secure_url;
});

// Regex to find Cloudinary URLs in dummyData
const cloudinaryUrlRegex = /https:\/\/res\.cloudinary\.com\/[^'"]+/g;

const updatedDummyData = dummyData.replace(cloudinaryUrlRegex, (match) => {
    // Extract public ID from the match
    // match looks like https://res.cloudinary.com/dk2x11rvs/image/upload/v123/path/to/id.ext
    const parts = match.split('/upload/');
    if (parts.length < 2) return match;

    let path = parts[1];
    // remove version prefix if present
    if (path.startsWith('v')) {
        path = path.substring(path.indexOf('/') + 1);
    }
    // remove extension
    const idWithoutExt = path.replace(/\.[^/.]+$/, "");

    // Check if we have a better URL in inventory (likely with correct version)
    if (mapping[idWithoutExt]) {
        return mapping[idWithoutExt];
    }

    // Try by filename only
    const filename = idWithoutExt.split('/').pop();
    if (mapping[filename]) {
        return mapping[filename];
    }

    return match;
});

if (dummyData !== updatedDummyData) {
    fs.writeFileSync('d:/manapalm-atg/manapalm/utils/dummyData.ts', updatedDummyData);
    console.log('Successfully updated dummyData.ts with Cloudinary inventory URLs.');
} else {
    console.log('No updates needed for dummyData.ts.');
}
