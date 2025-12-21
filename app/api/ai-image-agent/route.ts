// app/api/ai-image-agent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { aiImageAgent, batchImageAgent, generateImageVariations } from '@/utils/aiImageAgent';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for AI generation

/**
 * POST /api/ai-image-agent
 * 
 * Body options:
 * - mode: 'single' | 'batch' | 'variations'
 * - productName: string
 * - description?: string
 * - category?: string
 * - style?: 'realistic' | 'artistic' | 'minimalist' | 'professional'
 * - existingImageUrl?: string
 * - products?: ImageAgentOptions[] (for batch mode)
 * - variationCount?: number (for variations mode)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { mode = 'single', ...options } = body;

        console.log('🤖 AI Image Agent Request:', { mode, options });

        // حالت تک عکس
        if (mode === 'single') {
            const result = await aiImageAgent(options);

            return NextResponse.json({
                success: result.success,
                data: result,
                message: result.success
                    ? `Image ${result.source === 'ai-generated' ? 'generated' : 'uploaded'} successfully!`
                    : 'Failed to process image',
            });
        }

        // حالت چند عکس همزمان
        if (mode === 'batch') {
            if (!options.products || !Array.isArray(options.products)) {
                return NextResponse.json(
                    { error: 'Products array is required for batch mode' },
                    { status: 400 }
                );
            }

            const results = await batchImageAgent(options.products);
            const successCount = results.filter(r => r.success).length;

            return NextResponse.json({
                success: true,
                data: results,
                message: `Processed ${successCount}/${results.length} images successfully`,
            });
        }

        // حالت تولید تنوع
        if (mode === 'variations') {
            const count = options.variationCount || 3;
            const results = await generateImageVariations(options, count);
            const successCount = results.filter(r => r.success).length;

            return NextResponse.json({
                success: true,
                data: results,
                message: `Generated ${successCount}/${count} variations successfully`,
            });
        }

        return NextResponse.json(
            { error: 'Invalid mode. Use: single, batch, or variations' },
            { status: 400 }
        );

    } catch (error) {
        console.error('❌ API Error:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/ai-image-agent/status
 * بررسی وضعیت سرویس
 */
export async function GET(request: NextRequest) {
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasCloudinary = !!(
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
        status: 'online',
        services: {
            openai: hasOpenAI ? 'configured' : 'missing',
            cloudinary: hasCloudinary ? 'configured' : 'missing',
        },
        ready: hasOpenAI && hasCloudinary,
    });
}
