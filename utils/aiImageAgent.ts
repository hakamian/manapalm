// utils/aiImageAgent.ts
import { v2 as cloudinary } from 'cloudinary';
import OpenAI from 'openai';
import { generateText } from '../services/geminiService';

// تنظیمات Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// تنظیمات OpenAI (فقط اگر کلید وجود داشته باشد فعال می‌شود)
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export interface ImageAgentOptions {
    productName: string;
    description?: string;
    category?: string;
    style?: 'realistic' | 'artistic' | 'minimalist' | 'professional';
    existingImageUrl?: string;
    folder?: string;
    provider?: 'openai' | 'free-pollinations'; // New Provider Option
}

export interface ImageAgentResult {
    success: boolean;
    cloudinaryUrl: string;
    publicId: string;
    source: 'existing' | 'ai-generated';
    prompt?: string;
    error?: string;
}

/**
 * 🤖 AI Image Agent
 * مدیریت هوشمند تصاویر با قابلیت سوییچ بین رایگان و پولی
 */
export async function aiImageAgent(
    options: ImageAgentOptions
): Promise<ImageAgentResult> {
    try {
        // 1. بررسی عکس موجود
        if (options.existingImageUrl) {
            console.log('📸 Using existing image...');
            return await uploadExistingImage(options);
        }

        // 2. انتخاب فلو تولید عکس
        const provider = options.provider || (openai ? 'openai' : 'free-pollinations');
        console.log(`🎨 Generating image with AI (${provider})...`);

        if (provider === 'openai' && openai) {
            return await generateWithDalle(options);
        } else {
            return await generateWithPollinations(options);
        }

    } catch (error) {
        console.error('❌ AI Image Agent Error:', error);
        return {
            success: false,
            cloudinaryUrl: '',
            publicId: '',
            source: 'existing',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * آپلود عکس در Cloudinary
 */
async function uploadToCloudinary(imageUrl: string, publicId: string, folder: string) {
    return await cloudinary.uploader.upload(imageUrl, {
        folder: `manapalm/${folder}`,
        transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto:best' },
            { fetch_format: 'auto' },
        ],
        public_id: publicId,
    });
}

// ... (Helper functions remain the same)
async function uploadExistingImage(options: ImageAgentOptions): Promise<ImageAgentResult> {
    try {
        const result = await cloudinary.uploader.upload(
            options.existingImageUrl!,
            {
                folder: `manapalm/${options.folder || 'products'}`,
                transformation: [
                    { width: 1200, height: 1200, crop: 'limit' },
                    { quality: 'auto:best' },
                    { fetch_format: 'auto' },
                ],
                public_id: sanitizeFileName(options.productName),
            }
        );

        return {
            success: true,
            cloudinaryUrl: result.secure_url,
            publicId: result.public_id,
            source: 'existing',
        };
    } catch (error) {
        throw new Error(`Failed to upload existing image: ${error}`);
    }
}

async function buildImagePrompt(options: ImageAgentOptions): Promise<string> {
    const { productName, description, category, style = 'professional' } = options;

    // Translation Step: Use Gemini to translate Persian inputs to English
    let translatedProduct = productName;
    let translatedDesc = description || '';

    try {
        // Check if input has Persian characters
        const isPersian = /[\u0600-\u06FF]/.test(productName + (description || ''));

        if (isPersian) {
            console.log('🌍 Translating prompt from Persian to English...');
            const translationPrompt = `Translate the following input to English specifically for an AI Image Generator prompt.
            
            RULES:
            1. If the input contains "خرما" (Khorma), translate it as "Date Fruit" or "Fresh Dates".
            2. If the input is about food/agriculture, enhance it with "high quality, delicious".
            3. If the input is NOT food (e.g., "a child painting", "a futuristic city"), translate it LITERALLY and IGNORE food context.
            
            Input:
            Product Name: "${productName}"
            Description: "${description || ''}"
            Category: "${category || ''}"
            
            Output strictly in JSON format: {"productName": "...", "description": "..."}`;

            const result = await generateText(translationPrompt);
            // Simple JSON parsing attempt (Gemini usually returns code blocks or plain JSON)
            const jsonMatch = result.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                translatedProduct = parsed.productName;
                translatedDesc = parsed.description;
            } else {
                // Fallback: simple text usage if JSON fails
                translatedProduct = result.text;
            }
            console.log(`✅ Translated: "${translatedProduct}"`);
        }
    } catch (e) {
        console.warn('Translation failed, using original text:', e);
    }

    const styleGuides = {
        realistic: 'photorealistic, high quality product photography, studio lighting, white background',
        artistic: 'artistic illustration, vibrant colors, creative design, modern aesthetic',
        minimalist: 'minimalist design, clean and simple, elegant, white background, professional',
        professional: 'professional product photography, e-commerce style, clean background, high resolution',
    };

    let prompt = `A ${styleGuides[style]} image of ${translatedProduct}`;
    if (translatedDesc) prompt += `, ${translatedDesc}`;
    if (category) prompt += `, suitable for ${category} category`;
    prompt += ', high quality, detailed, professional lighting, sharp focus';

    return prompt;
}

// Update callers to await buildImagePrompt
async function generateWithDalle(options: ImageAgentOptions): Promise<ImageAgentResult> {
    if (!openai) throw new Error("OpenAI API Key not found");

    const prompt = await buildImagePrompt(options); // Await here
    const response = await openai.images.generate({
        // ... rest matches previous implementation
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard', // 'hd' is more expensive
        style: options.style === 'artistic' ? 'vivid' : 'natural',
    });

    const imageUrl = response.data[0].url;
    if (!imageUrl) throw new Error('No image URL returned from DALL-E');

    const publicId = `ai_dalle_${sanitizeFileName(options.productName)}_${Date.now()}`;
    const result = await uploadToCloudinary(imageUrl, publicId, options.folder || 'products/ai-dalle');

    return {
        success: true,
        cloudinaryUrl: result.secure_url,
        publicId: result.public_id,
        source: 'ai-generated',
        prompt: prompt,
    };
}

async function generateWithPollinations(options: ImageAgentOptions): Promise<ImageAgentResult> {
    const prompt = await buildImagePrompt(options); // Await here
    // Pollinations URL format: https://image.pollinations.ai/prompt/{prompt}
    // We encode the prompt to ensure URL safety
    const encodedPrompt = encodeURIComponent(prompt);
    // ... rest matches previous implementation
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}&nologo=true&model=flux`;

    console.log('🌐 Fetching from Pollinations:', imageUrl);

    // We fetch the image first to ensure it generates before sending URL to Cloudinary
    // Cloudinary sometimes times out on slow generations, so fetching buffer first is safer
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Failed to generate image via Free Provider");

    // Cloudinary can upload efficiently from a remote URL usually, but let's pass the URL directly
    // Pollinations is fast enough.
    const publicId = `ai_free_${sanitizeFileName(options.productName)}_${Date.now()}`;
    const result = await uploadToCloudinary(imageUrl, publicId, options.folder || 'products/ai-free');

    return {
        success: true,
        cloudinaryUrl: result.secure_url,
        publicId: result.public_id,
        source: 'ai-generated',
        prompt: prompt,
    };
}

function sanitizeFileName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

export async function batchImageAgent(products: ImageAgentOptions[]) {
    // ... implemented similarly using aiImageAgent
    return Promise.all(products.map(p => aiImageAgent(p)));
}

export async function generateImageVariations(options: ImageAgentOptions, count: number = 3) {
    // ... implemented similarly
    const variations = Array.from({ length: count }, (_, i) => ({ ...options, style: options.style })); // simplified
    return Promise.all(variations.map(v => aiImageAgent(v)));
}
