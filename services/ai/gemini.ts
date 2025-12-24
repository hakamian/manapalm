
import { supabase } from '../infrastructure/supabase';
import { dbAdapter } from '../application/database';
import { callProxy, getFallbackMessage } from './core';

/**
 * Gemini Service for AI-powered features
 * Uses callProxy to communicate with the backend
 */
export const geminiService = {
    generateGeneralResponse: async (prompt: string, userContext: any = {}) => {
        try {
            const data = await callProxy('generateContent', undefined, {
                prompt: `User Context: ${JSON.stringify(userContext)}\n\nPrompt: ${prompt}`,
                systemInstructions: "پاسخ‌های شما باید کوتاه، حکیمانه و به زبان فارسی باشد."
            }, 'openrouter');
            return data.content;
        } catch (error) {
            return getFallbackMessage('chat');
        }
    },
    // ... (rest of the functions follow the same pattern, 
    // I will include them all to ensure full functionality)
    analyzeReflection: async (text: string) => {
        try {
            const data = await callProxy('generateContent', 'google/gemini-2.0-flash-exp:free', {
                prompt: `تحلیل کن: ${text}`,
                systemInstructions: "شما یک تحلیلگر معنایی هستید. احساس شعف، معنا و هدف را در این متن تحلیل کنید. خروجی فقط JSON باشد."
            });
            return data.content;
        } catch (error) {
            return JSON.stringify({ error: "تحلیل فعلاً در دسترس نیست." });
        }
    },
    generateImageFromText: async (prompt: string) => {
        try {
            const data = await callProxy('generateImages', 'google/imagen-3', { prompt });
            return data.imageUrl;
        } catch (error) {
            return null;
        }
    }
};
