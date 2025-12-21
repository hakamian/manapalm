import { NextRequest, NextResponse } from 'next/server';

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for fetching with retry
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 2): Promise<Response> {
    let lastError: Error | null = null;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            if (i > 0) await delay(1000 * Math.pow(2, i));
            const response = await fetch(url, options);
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
    const allowedOrigins = ['https://manapalm.com', 'http://localhost:3000', 'http://localhost:3001', 'https://nakhlestan-mana.com'];

    const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
    };

    if (origin && allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
    } else {
        headers['Access-Control-Allow-Origin'] = '*';
    }

    return headers;
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

        // Default to OpenRouter free tier
        let targetModel = model || 'google/gemini-2.0-flash-exp:free';

        // Determine provider
        let activeProvider = provider || (targetModel.startsWith('models/') ? 'google' : (targetModel.includes('/') ? 'openrouter' : 'google'));

        let resultText: string | null = null;
        let finalProvider = activeProvider;
        let finalModel = targetModel;

        // Try OpenRouter
        const tryOpenRouter = async (m: string): Promise<string> => {
            const openRouterKey = process.env.OPENROUTER_API_KEY;

            if (!openRouterKey) {
                throw new Error('OpenRouter API Key not found in environment variables');
            }

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

            if (response.status === 429) {
                throw { status: 429, message: 'OpenRouter Rate Limit' };
            }

            const resData = await response.json();

            if (resData.error) {
                throw new Error(resData.error.message || 'OpenRouter Error');
            }

            return resData.choices[0].message.content;
        };

        // Try Gemini via direct API call (not SDK)
        const tryGemini = async (m: string): Promise<string> => {
            const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

            if (!apiKey) {
                throw new Error('Gemini API Key not found in environment variables');
            }

            // Ensure model name is in correct format
            const modelName = m.startsWith('models/') ? m.replace('models/', '') : m;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

            const response = await fetchWithRetry(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: data.contents,
                    generationConfig: {
                        temperature: data.config?.temperature || 0.7,
                    }
                })
            });

            if (response.status === 429) {
                throw { status: 429, message: 'Gemini Rate Limit' };
            }

            const resData = await response.json();

            if (resData.error) {
                throw new Error(resData.error.message || 'Gemini Error');
            }

            return resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        };

        // Execute with fallback
        try {
            if (activeProvider === 'openrouter') {
                resultText = await tryOpenRouter(targetModel);
            } else {
                resultText = await tryGemini(targetModel);
            }
        } catch (err: any) {
            console.warn("Primary provider failed:", err.message);

            if (err.status === 429 || err.message?.includes('429')) {
                console.warn("Rate limited. Attempting fallback...");
                // Swap provider
                if (activeProvider === 'openrouter') {
                    finalProvider = 'google';
                    finalModel = 'gemini-2.0-flash';
                    resultText = await tryGemini(finalModel);
                } else {
                    finalProvider = 'openrouter';
                    finalModel = 'google/gemini-2.0-flash-exp:free';
                    resultText = await tryOpenRouter(finalModel);
                }
            } else {
                // Try the other provider as fallback
                console.warn("Trying alternative provider as fallback...");
                if (activeProvider === 'openrouter') {
                    finalProvider = 'google';
                    finalModel = 'gemini-2.0-flash';
                    resultText = await tryGemini(finalModel);
                } else {
                    finalProvider = 'openrouter';
                    finalModel = 'google/gemini-2.0-flash-exp:free';
                    resultText = await tryOpenRouter(finalModel);
                }
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
            status: 500,
            headers: getCorsHeaders(origin)
        });
    }
}
