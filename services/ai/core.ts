
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
    } catch(e) {}

    // 2. Try process.env (Node/Webpack/Vercel)
    if (!key) {
        try {
            // @ts-ignore
            if (typeof process !== 'undefined' && process.env) {
                // @ts-ignore
                key = process.env.GEMINI_API_KEY || process.env.API_KEY;
            }
        } catch(e) {}
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

export async function callProxy(action: 'generateContent' | 'generateImages' | 'generateVideos' | 'getVideosOperation', model: string | undefined, data: any) {
    try {
        // 1. Try connecting to the Proxy Server (Preferred for Security)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout

        const response = await fetch('/api/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, model, data }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
            throw new Error(`Proxy unavailable or error: ${response.status}`);
        }

        return await response.json();
    } catch (proxyError: any) {
        console.warn("Backend Proxy failed/unavailable, switching to Client-Side Fallback (Dev Only).", proxyError.name === 'AbortError' ? 'Request Timed Out' : proxyError.message);

        // 2. Fallback to Direct Client-Side Call (Only for Local Development / Demo)
        const apiKey = getGeminiApiKey();
        
        if (!apiKey) {
            console.error("API Key missing. Ensure VITE_GEMINI_API_KEY is set in .env file.");
            throw new Error("خطا: کلید API یافت نشد. لطفا تنظیمات برنامه را بررسی کنید.");
        }

        const ai = new GoogleGenAI({ apiKey });

        try {
            if (action === 'generateContent') {
                const response = await ai.models.generateContent({
                    model: model!,
                    contents: data.contents,
                    config: data.config
                });
                return {
                    text: response.text,
                    candidates: response.candidates,
                    functionCalls: response.functionCalls
                };
            } else if (action === 'generateImages') {
                const response = await ai.models.generateImages({
                    model: model!,
                    prompt: data.prompt,
                    config: data.config
                });
                if (response.generatedImages) {
                    return {
                        images: response.generatedImages.map((img: any) => img.image.imageBytes)
                    };
                }
            } else if (action === 'generateVideos') {
                const operation = await ai.models.generateVideos({
                    model: model!,
                    prompt: data.prompt,
                    image: data.image,
                    config: data.config
                });
                return { operation };
            } else if (action === 'getVideosOperation') {
                 const operation = await ai.operations.getVideosOperation({
                    name: data.operationName
                });
                return { operation };
            }
        } catch (clientError: any) {
            console.error("Client-side AI Error:", clientError);
            throw clientError;
        }
    }
}
