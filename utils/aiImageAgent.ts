// utils/aiImageAgent.ts
import { v2 as cloudinary } from 'cloudinary';
import OpenAI from 'openai';

// تنظیمات Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// تنظیمات OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface ImageAgentOptions {
    productName: string;
    description?: string;
    category?: string;
    style?: 'realistic' | 'artistic' | 'minimalist' | 'professional';
    existingImageUrl?: string;
    folder?: string;
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
 * اگر عکس موجود باشد از آن استفاده می‌کند
 * اگر نباشد با DALL-E تولید می‌کند
 */
export async function aiImageAgent(
    options: ImageAgentOptions
): Promise<ImageAgentResult> {
    try {
        // مرحله 1: بررسی عکس موجود
        if (options.existingImageUrl) {
            console.log('📸 Using existing image...');
            return await uploadExistingImage(options);
        }

        // مرحله 2: تولید عکس با AI
        console.log('🎨 Generating image with AI...');
        return await generateAndUploadImage(options);
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
 * آپلود عکس موجود به Cloudinary
 */
async function uploadExistingImage(
    options: ImageAgentOptions
): Promise<ImageAgentResult> {
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

/**
 * تولید عکس با DALL-E و آپلود به Cloudinary
 */
async function generateAndUploadImage(
    options: ImageAgentOptions
): Promise<ImageAgentResult> {
    try {
        // مرحله 1: ساخت پرامپت هوشمند
        const prompt = buildImagePrompt(options);
        console.log('🎯 Prompt:', prompt);

        // مرحله 2: تولید عکس با DALL-E
        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            quality: 'hd',
            style: options.style === 'artistic' ? 'vivid' : 'natural',
        });

        const imageUrl = response.data[0].url;
        if (!imageUrl) {
            throw new Error('No image URL returned from DALL-E');
        }

        console.log('✅ Image generated:', imageUrl);

        // مرحله 3: آپلود به Cloudinary
        const result = await cloudinary.uploader.upload(imageUrl, {
            folder: `manapalm/${options.folder || 'products'}/ai-generated`,
            transformation: [
                { width: 1200, height: 1200, crop: 'limit' },
                { quality: 'auto:best' },
                { fetch_format: 'auto' },
            ],
            public_id: `ai_${sanitizeFileName(options.productName)}_${Date.now()}`,
        });

        console.log('☁️ Uploaded to Cloudinary:', result.secure_url);

        return {
            success: true,
            cloudinaryUrl: result.secure_url,
            publicId: result.public_id,
            source: 'ai-generated',
            prompt: prompt,
        };
    } catch (error) {
        throw new Error(`Failed to generate/upload image: ${error}`);
    }
}

/**
 * ساخت پرامپت هوشمند برای DALL-E
 */
function buildImagePrompt(options: ImageAgentOptions): string {
    const { productName, description, category, style = 'professional' } = options;

    // استایل‌های مختلف
    const styleGuides = {
        realistic:
            'photorealistic, high quality product photography, studio lighting, white background',
        artistic:
            'artistic illustration, vibrant colors, creative design, modern aesthetic',
        minimalist:
            'minimalist design, clean and simple, elegant, white background, professional',
        professional:
            'professional product photography, e-commerce style, clean background, high resolution',
    };

    // ساخت پرامپت نهایی
    let prompt = `A ${styleGuides[style]} image of ${productName}`;

    if (description) {
        prompt += `, ${description}`;
    }

    if (category) {
        prompt += `, suitable for ${category} category`;
    }

    // اضافه کردن جزئیات کیفیت
    prompt += ', high quality, detailed, professional lighting, sharp focus';

    return prompt;
}

/**
 * پاک‌سازی نام فایل
 */
function sanitizeFileName(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

/**
 * 🔄 Batch Image Agent
 * برای تولید چندین عکس به صورت همزمان
 */
export async function batchImageAgent(
    products: ImageAgentOptions[]
): Promise<ImageAgentResult[]> {
    console.log(`🚀 Starting batch generation for ${products.length} products...`);

    const results = await Promise.allSettled(
        products.map((product) => aiImageAgent(product))
    );

    return results.map((result, index) => {
        if (result.status === 'fulfilled') {
            return result.value;
        } else {
            console.error(`Failed for product ${index}:`, result.reason);
            return {
                success: false,
                cloudinaryUrl: '',
                publicId: '',
                source: 'existing' as const,
                error: result.reason.message,
            };
        }
    });
}

/**
 * 🎨 تولید تنوع عکس (Variations)
 * برای یک محصول چند عکس مختلف تولید می‌کند
 */
export async function generateImageVariations(
    options: ImageAgentOptions,
    count: number = 3
): Promise<ImageAgentResult[]> {
    const styles: Array<'realistic' | 'artistic' | 'minimalist' | 'professional'> = [
        'realistic',
        'artistic',
        'minimalist',
        'professional',
    ];

    const variations = Array.from({ length: count }, (_, i) => ({
        ...options,
        style: styles[i % styles.length],
        folder: `${options.folder || 'products'}/variations`,
    }));

    return batchImageAgent(variations);
}
