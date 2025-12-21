
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
export const DEFAULT_FREE_MODEL = 'google/gemini-2.0-flash-exp:free';

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
        console.warn("Backend Proxy failed/unavailable, switching to Client-Side Fallback (Dev Only).", proxyError.name === 'AbortError' ? 'Request Timed Out' : proxyError.message);

        // 2. Fallback to Direct Client-Side Call (Only for Local Development / Demo)
        // Note: OpenRouter doesn't have a direct client SDK here, so we only fallback for Gemini
        const apiKey = getGeminiApiKey();

        if (!apiKey) {
            console.error("API Key missing. Ensure VITE_GEMINI_API_KEY is set in .env file.");
            throw new Error("خطا: ارتباط با سرور هوش مصنوعی برقرار نشد. لطفا تنظیمات اینترنت یا کلیدهای خود را بررسی کنید.");
        }

        const ai = new GoogleGenAI({ apiKey });

        try {
            if (action === 'generateContent') {
                const response = await ai.models.generateContent({
                    model: model?.includes('/') ? 'gemini-1.5-flash' : (model || 'gemini-1.5-flash'), // Map back if needed
                    contents: data.contents,
                    config: data.config
                });
                return {
                    text: response.text,
                    candidates: response.candidates,
                    functionCalls: response.functionCalls
                };
            }
            // Add other fallbacks if needed
            throw new Error(`Fallback not fully implemented for action: ${action}`);
        } catch (clientError: any) {
            console.error("Client-side AI Error:", clientError);
            throw clientError;
        }
    }
}
