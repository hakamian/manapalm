
import { GoogleGenAI } from "@google/genai";

export const getFallbackMessage = (type: string): string => {
    switch (type) {
        case 'chat': return "متاسفانه در حال حاضر قادر به پاسخگویی نیستم. لطفاً بعداً تلاش کنید.";
        case 'connection': return "خطا در برقراری ارتباط. لطفاً اتصال اینترنت خود را بررسی کنید.";
        case 'contentCreation': return "خطا در تولید محتوا. لطفاً دوباره تلاش کنید.";
        case 'analysis': return "خطا در تحلیل داده‌ها. لطفاً ورودی‌ها را بررسی کنید.";
        default: return "یک خطای ناشناخته رخ داده است.";
    }
};

export async function callProxy(action: 'generateContent' | 'generateImages', model: string, data: any) {
    try {
        // 1. Try connecting to the Proxy Server (Preferred for Security)
        // Add a timeout to prevent hanging if proxy is unresponsive
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // Increased to 120s for complex tasks

        const response = await fetch('/api/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, model, data }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        // Check content type to ensure we didn't get a HTML error page
        const contentType = response.headers.get("content-type");
        if (!response.ok || !contentType || !contentType.includes("application/json")) {
            // If proxy is missing or returns error, throw to fall back to client-side
            throw new Error(`Proxy unavailable or error: ${response.status}`);
        }

        return await response.json();
    } catch (proxyError: any) {
        console.warn("Backend Proxy failed/unavailable, switching to Client-Side Fallback (Dev Only).", proxyError.name === 'AbortError' ? 'Request Timed Out' : proxyError.message);

        // 2. Fallback to Direct Client-Side Call (Only for Local Development / Demo)
        let apiKey = '';
        
        // Try getting key from process.env (safely for different environments)
        try {
             // @ts-ignore
             if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
                 // @ts-ignore
                 apiKey = process.env.API_KEY;
             }
        } catch(e) { /* ignore */ }

        // Try getting key from Vite env if process.env didn't work
        if (!apiKey) {
            try {
                apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
            } catch(e) { /* ignore */ }
        }
        
        if (!apiKey) {
            console.error("API Key missing. Ensure process.env.API_KEY or VITE_GEMINI_API_KEY is set.");
            throw new Error("خطا: کلید API یافت نشد. لطفاً تنظیمات را بررسی کنید.");
        }

        const ai = new GoogleGenAI({ apiKey });

        try {
            if (action === 'generateContent') {
                const response = await ai.models.generateContent({
                    model: model,
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
                    model: model,
                    prompt: data.prompt,
                    config: data.config
                });
                
                if (response.generatedImages) {
                    return {
                        images: response.generatedImages.map((img: any) => img.image.imageBytes)
                    };
                }
            }
        } catch (clientError: any) {
            console.error("Client-side AI Error:", clientError);
            if (clientError.message?.includes('429') || clientError.message?.includes('quota')) {
                throw new Error("سهمیه درخواست‌های رایگان تمام شده است.");
            }
            throw clientError;
        }
    }
}
