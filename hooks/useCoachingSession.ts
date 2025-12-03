
import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, CoachingRole } from '../types';
import { GoogleGenAI, Chat } from '@google/genai';
import { getFallbackMessage } from '../services/geminiService';

export const useCoachingSession = (role: CoachingRole, topic: string, apiKey: string) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const chatSessionRef = useRef<Chat | null>(null);

    const systemInstruction = `
    ROLE: You are 'Rahnavard' (رهنورد), a world-class Business Mentor and Strategist.
    LANGUAGE: Persian (Farsi).
    TOPIC: "${topic}".
    CONTEXT: User is in role: "${role}".
    
    **CORE OBJECTIVE:**
    Provide high-impact, actionable, and deep coaching. Do not just give surface-level advice. Dig deep, challenge assumptions, and build strategies.

    **VISUAL TOOLKIT (IMPORTANT):**
    You have access to a dynamic visual rendering engine. WHEN APPROPRIATE, use these tags on a new line to generate interactive diagrams for the user:
    
    1. **[VISUAL:LEAN_CANVAS]** -> When discussing business models, startups, or product-market fit.
    2. **[VISUAL:SALES_FUNNEL]** -> When discussing marketing, leads, conversion, or sales processes.
    3. **[VISUAL:TRUST_TRIANGLE]** -> When discussing leadership, sales trust, or team dynamics.
    4. **[VISUAL:VALUE_LADDER]** -> When discussing pricing strategy, upsells, or product portfolio.
    5. **[VISUAL:ICEBERG]** -> When discussing mindset, hidden barriers, or root causes.
    6. **[VISUAL:FOUR_CORNERSTONES]** -> When discussing foundations or core principles.

    **FORMATTING RULES:**
    1. **Bold Key Concepts:** Always bold important terms (e.g., **نرخ تبدیل**, **مزیت رقابتی**).
    2. **Structure:** Use paragraphs, bullet points, and numbered lists to make text readable (Telegram style).
    3. **Tone:** Professional yet warm, authoritative but empathetic. Use emojis sparingly to add character.
    4. **Smart Options:** At the end of your response, provide 2-3 short, suggested responses for the user in this format:
       [OPTIONS: Option 1 | Option 2 | Option 3]
    `;

    const initChat = async (initialHistory: ChatMessage[] = []) => {
        setIsThinking(true);
        setMessages(initialHistory);
        try {
            const ai = new GoogleGenAI({ apiKey });
            const chat = ai.chats.create({ 
                model: 'gemini-3-pro-preview', 
                config: { systemInstruction } 
            });
            chatSessionRef.current = chat;
            
            if (initialHistory.length === 0) {
                const response = await chat.sendMessage({ message: "Start the session. Greet the user warmly based on the topic and ask a powerful opening question." });
                const text = response.text || '';
                
                // Parse options
                const optionsMatch = text.match(/\[OPTIONS:(.*?)\]/);
                if (optionsMatch) {
                    const options = optionsMatch[1].split('|').map(s => s.trim());
                    setSuggestions(options);
                }
                
                // Remove options tag from display text
                const cleanText = text.replace(/\[OPTIONS:.*?\]/, '').trim();
                setMessages([{ role: 'model', text: cleanText }]);
            }
        } catch (e) {
            console.error(e);
            setError('خطا در اتصال به هوش مصنوعی.');
        } finally {
            setIsThinking(false);
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || isThinking || !chatSessionRef.current) return;
        
        const userMsg: ChatMessage = { role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setSuggestions([]); // Clear suggestions
        setIsThinking(true);
        
        try {
            const response = await chatSessionRef.current.sendMessage({ message: text });
            const responseText = response.text || '';

            // Parse options
            const optionsMatch = responseText.match(/\[OPTIONS:(.*?)\]/);
            if (optionsMatch) {
                const options = optionsMatch[1].split('|').map(s => s.trim());
                setSuggestions(options);
            } else {
                setSuggestions([]);
            }

            // Remove options tag from display text
            const cleanText = responseText.replace(/\[OPTIONS:.*?\]/, '').trim();

            setMessages(prev => [...prev, { role: 'model', text: cleanText }]);
        } catch (e) {
            setError('خطا در ارسال پیام.');
        } finally {
            setIsThinking(false);
        }
    };

    return {
        messages,
        input,
        setInput,
        isThinking,
        error,
        initChat,
        sendMessage,
        suggestions
    };
};
