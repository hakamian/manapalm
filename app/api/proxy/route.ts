import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Allowed models whitelist for Gemini
const GEMINI_MODELS = [
    'gemini-2.1-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash-preview-09-2025',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-pro-vision'
];

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for fetching with retry and timeout
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 2): Promise<Response> {
    let lastError: Error | null = null;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            if (i > 0) await delay(1000 * Math.pow(2, i)); // Exponential backoff
            const response = await fetch(url, options);

            // If we get a 429 (Rate Limit), we only retry if we haven't exhausted retries
            if (response.status === 429 && i < maxRetries) {
                console.warn(`Rate limited (429). Retry attempt ${i + 1}...`);
                continue;
            }

            return response;
        } catch (error) {
            lastError = error as Error;
            if (i < maxRetries) continue;
        }
    }
    throw lastError || new Error('Fetch failed after retries');
}

// CORS headers
function getCorsHeaders(origin: string | null) {
    const allowedOrigins = ['https://manapalm.com', 'http://localhost:3000', 'https://nakhlestan-mana.com'];

    if (origin && allowedOrigins.includes(origin)) {
        return {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true',
        };
    }

    return {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

export async function OPTIONS(req: NextRequest) {
    const origin = req.headers.get('origin');
    return NextResponse.json({}, {
        status: 200,
        headers: getCorsHeaders(origin)
    });
}

export async function POST(req: NextRequest) {
    const origin = req.headers.get('origin');

    try {
        const body = await req.json();
        const { action, model, data, provider } = body;
        let targetModel = model || 'google/gemini-2.0-flash-exp:free';

        // Determine initial provider
        let activeProvider = provider || (targetModel.includes('/') ? 'openrouter' : 'google');

        // ---------------------------------------------------------
        // STRATEGY: TRY PRIMARY PROVIDER -> IF 429 -> TRY SECONDARY
        // ---------------------------------------------------------

        let resultText: string | null = null;
        let finalProvider = activeProvider;
        let finalModel = targetModel;

        const tryOpenRouter = async (m: string): Promise<string> => {
            const openRouterKey = process.env.OPENROUTER_API_KEY;
            if (!openRouterKey) throw new Error('OpenRouter Key Missing');

            const response = await fetchWithRetry("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openRouterKey}`,
                    "HTTP-Referer": "https://manapalm.com",
                    "X-Title": "Nakhlestan Mana",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": m,
                    "messages": data.contents.map((c: any) => ({
                        role: c.role === 'model' ? 'assistant' : c.role,
                        content: typeof c.parts[0].text === 'string' ? c.parts[0].text : JSON.stringify(c.parts[0])
                    })),
                    "temperature": data.config?.temperature || 0.7,
                })
            });

            if (response.status === 429) throw { status: 429, message: 'OpenRouter Rate Limit' };
            const resData = await response.json();
            if (resData.error) throw new Error(resData.error.message || 'OpenRouter Error');
            return resData.choices[0].message.content;
        };

        const tryGemini = async (m: string): Promise<string> => {
            const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
            if (!apiKey) throw new Error('Gemini Key Missing');

            const genAI = new GoogleGenerativeAI(apiKey);
            let lastErr: any;
            for (let i = 0; i < 2; i++) {
                try {
                    const modelInstance = genAI.getGenerativeModel({
                        model: m.includes('/') ? 'gemini-1.5-flash' : m
                    });
                    const result = await modelInstance.generateContent({ contents: data.contents });
                    const response = await result.response;
                    return response.text();
                } catch (err) {
                    lastErr = err;
                    if ((err as any).message?.includes('429') && i < 1) {
                        await delay(2000);
                        continue;
                    }
                    throw err;
                }
            }
            throw lastErr;
        };

        // EXECUTION WITH FALLBACK
        try {
            if (activeProvider === 'openrouter') {
                resultText = await tryOpenRouter(targetModel);
            } else {
                resultText = await tryGemini(targetModel);
            }
        } catch (err: any) {
            if (err.status === 429 || err.message?.includes('429')) {
                console.warn("Primary Provider Rate Limited. Attempting Fallback Hopping...");
                // Swap Provider
                if (activeProvider === 'openrouter') {
                    finalProvider = 'google';
                    finalModel = 'gemini-1.5-flash'; // Fallback to a stable direct model
                    resultText = await tryGemini(finalModel);
                } else {
                    finalProvider = 'openrouter';
                    finalModel = 'google/gemini-2.0-flash-exp:free';
                    resultText = await tryOpenRouter(finalModel);
                }
            } else {
                throw err;
            }
        }

        return NextResponse.json({
            text: resultText,
            provider: finalProvider,
            model: finalModel,
            isFallback: finalProvider !== activeProvider
        }, {
            status: 200,
            headers: getCorsHeaders(origin)
        });

    } catch (error: any) {
        console.error('Final Proxy Error:', error);
        return NextResponse.json({
            error: error.message || 'AI Service Exhausted',
            suggestion: 'سیستم در حال حاضر بیش از حد مشغول است. لطفا ۶۰ ثانیه دیگر تلاش کنید.'
        }, {
            status: error.status || 500,
            headers: getCorsHeaders(origin)
        });
    }
}
