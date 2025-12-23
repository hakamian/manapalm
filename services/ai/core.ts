import { GoogleGenAI } from "@google/genai";
import { supabase } from "../supabaseClient";

export const getGeminiApiKey = (): string => {
    // Return the shared local key for local dev, or environment key if available
    return 'AIzaSyAm0R_nTy51zh09seInVwYE0IY8He29VYY';
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

export const DEFAULT_FREE_MODEL = 'mistralai/devstral-2512:free';

export async function callProxy(
    action: 'generateContent' | 'generateImages' | 'generateVideos' | 'getVideosOperation',
    model: string | undefined,
    data: any,
    provider?: 'google' | 'openrouter' | 'openai'
) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);

        // Get Current Session for Auth
        if (!supabase) throw new Error("Supabase client not initialized.");
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (session) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
            headers['x-user-id'] = session.user.id;
        }

        const response = await fetch('/api/proxy', {
            method: 'POST',
            headers,
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

        const resData = await response.json();

        // Handle Premium Billing & Logging
        if (resData.tier === 'premium') {
            console.log(`🚀 Premium Resource Used: ${resData.provider}. Credits: ${resData.remainingSeconds}s remaining.`);
            import('../dbAdapter').then(({ dbAdapter }) => {
                dbAdapter.spendAICredits(10); // Deduct 10s per premium turn
            });
        } else if (resData.remainingSeconds !== undefined) {
            console.log(`☁️ Free Resource Used: ${resData.provider}.`);
        }

        return resData;
    } catch (proxyError: any) {
        console.warn("Backend Proxy failed:", proxyError.message);
        throw proxyError;
    }
}
