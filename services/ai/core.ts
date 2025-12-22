
import { GoogleGenAI } from "@google/genai";

export const getGeminiApiKey = (): string => {
    let key = '';

    // 1. Try import.meta.env (Vite Standard)
    try {
        // @ts-ignore
        if (import.meta && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
            // @ts-ignore
            key = import.meta.env.VITE_GEMINI_API_KEY;
        }
    } catch (e) { }

    // 2. Try process.env (Node/Webpack/Vercel)
    if (!key) {
        try {
            // @ts-ignore
            if (typeof process !== 'undefined' && process.env) {
                // @ts-ignore
                key = process.env.GEMINI_API_KEY || process.env.API_KEY;
            }
        } catch (e) { }
    }

    return key || '';
};

export const getFallbackMessage = (type: string): string => {
    switch (type) {
        case 'chat': return "متاسفانه در حال حاضر قادر به پاسخگویی نیستم. لطفاً بعداً تلاش کنید.";
        case 'connection': return "خطا در برقراری ارتباط. لطفاً اتصال اینترنت خود را بررسی کنید.";
        case 'contentCreation': return "خطا در تولید محتوا. لطفاً دوباره تلاش کنید.";
        case 'analysis': return "خطا در تحلیل داده‌ها. لطفاً ورودی‌ها را بررسی کنید.";
        default: return "یک خطای ناشناخته رخ داده است.";
    }
};


// Using OpenRouter free tier as default (valid API key confirmed)
// Falls back to Gemini if OpenRouter has issues
// Using OpenRouter Free Tier to bypass Google Direct regional/quota limits (Limit: 0 error)
// Using Mistral Devstral - TESTED with good Persian support
export const DEFAULT_FREE_MODEL = 'mistralai/devstral-2512:free';

export async function callProxy(
    action: 'generateContent' | 'generateImages' | 'generateVideos' | 'getVideosOperation',
    model: string | undefined,
    data: any,
    provider?: 'google' | 'openrouter'
) {
    try {
        // 1. Try connecting to the Proxy Server (Preferred for Security)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout

        const response = await fetch('/api/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action,
                model: model || DEFAULT_FREE_MODEL,
                data,
                provider
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
            const errorText = await response.text();
            throw new Error(`Proxy unavailable or error: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (proxyError: any) {
        // Warning: Proxy failed
        console.warn("Backend Proxy failed:", proxyError.message);

        if (model && model.includes('/')) {
            // console.warn(`Proxy failed for OpenRouter model (${model}). Swapping to Google Gemini fallback (Client-Side).`);
            // We cannot use the OpenRouter model ID with Google SDK.
            // Swap to a safe default Gemini model for the fallback.
            // gemini-2.0-flash-exp is the current free experimental model
            // model = 'gemini-2.0-flash-exp';

            // CRITICAL: Google Direct is failing (Quota 0/Leaked). 
            // We must NOT fallback to it if OpenRouter fails.
            // Throw the original proxy error so we can debug OpenRouter.
            throw new Error(`خطا در ارتباط با OpenRouter (Proxy): ${proxyError.message}`);
        }

        console.warn("Attempting Client-Side Fallback (Gemini Only)...");

        // 2. Fallback to Direct Client-Side Call (Gemini Only)
        const apiKey = getGeminiApiKey();

        if (!apiKey) {
            console.error("API Key missing.");
            throw new Error("خطا: ارتباط با سرور هوش مصنوعی برقرار نشد. (کلید یافت نشد)");
        }

        const ai = new GoogleGenAI({ apiKey });

        try {
            if (action === 'generateContent') {
                const response = await ai.models.generateContent({
                    model: model || 'gemini-2.0-flash-exp',
                    contents: data.contents,
                    config: data.config
                });
                return {
                    text: response.text,
                    candidates: response.candidates,
                    functionCalls: response.functionCalls
                };
            }
            throw new Error(`Fallback not fully implemented for action: ${action}`);
        } catch (clientError: any) {
            console.error("Client-side AI Error:", clientError);
            throw clientError;
        }
    }
}
