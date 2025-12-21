import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    return NextResponse.json({
        message: 'API Test Route Works!',
        env: {
            hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
            hasGeminiKey: !!process.env.GEMINI_API_KEY,
            openRouterKeyPrefix: process.env.OPENROUTER_API_KEY?.substring(0, 10) + '...',
        }
    });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Simple OpenRouter test
        const openRouterKey = process.env.OPENROUTER_API_KEY;

        if (!openRouterKey) {
            return NextResponse.json({ error: 'OpenRouter API Key not found' }, { status: 500 });
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openRouterKey}`,
                "HTTP-Referer": "https://manapalm.com",
                "X-Title": "Nakhlestan Mana",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-exp:free",
                "messages": [{ role: "user", content: "سلام" }],
            })
        });

        const data = await response.json();

        return NextResponse.json({
            status: response.status,
            data: data
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
