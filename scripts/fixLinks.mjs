
import fs from 'fs';

const inventory = JSON.parse(fs.readFileSync('d:/manapalm-atg/manapalm/cloudinary_inventory.json', 'utf8'));
let dummyData = fs.readFileSync('d:/manapalm-atg/manapalm/utils/dummyData.ts', 'utf8');

// Map by various keys to maximize matches
const mapping = {};
inventory.forEach(item => {
    const id = item.public_id;
    const filename = id.split('/').pop();

    mapping[id.toLowerCase()] = item.secure_url;
    mapping[filename.toLowerCase()] = item.secure_url;
});

// Find all strings that look like Cloudinary URLs
const cloudinaryUrlRegex = /https:\/\/res\.cloudinary\.com\/dk2x11rvs\/image\/upload\/[^'"]+/g;

const updatedDummyData = dummyData.replace(cloudinaryUrlRegex, (url) => {
    // Extract ID
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]{3,4})?$/i);
    if (!match) return url;

    const id = match[1];
    const filename = id.split('/').pop();

    const bestMatch = mapping[id.toLowerCase()] || mapping[filename.toLowerCase()];
    if (bestMatch) {
        return bestMatch;
    }

    return url;
});

if (dummyData !== updatedDummyData) {
    fs.writeFileSync('d:/manapalm-atg/manapalm/utils/dummyData.ts', updatedDummyData);
    console.log('DummyData updated with exact Cloudinary inventory URLs.');
} else {
    console.log('No matches found to update.');
}
