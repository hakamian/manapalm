
import { callProxy, getFallbackMessage } from './core';
import { 
    ChatMessage, User, PersonalizedEnglishScenario, ProcessStep, VocabularyItem, 
    ArticleDraft, Deed, AdvisorType, LMSModule, LMSLesson, TargetLanguage 
} from '../../types';
import { Modality } from '@google/genai';

// --- ROBUST JSON EXTRACTOR ---
const cleanJsonString = (text: string): string => {
    if (!text) return "[]";
    const jsonArrayPattern = /\[.*\]/s;
    const match = text.match(jsonArrayPattern);
    if (match && match[0]) {
        return match[0];
    }
    let clean = text.trim();
    clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
    clean = clean.replace(/\s*```$/, '');
    return clean;
};

// --- HIGH QUALITY FALLBACK QUESTIONS ---
const getFallbackQuestions = (lang: string) => {
    if (lang === 'German') {
        return [
            { text: "Wählen Sie den richtigen Satz:", options: ["Ich gehe in die Schule.", "Ich gehen in die Schule.", "Ich gehe zu Schule.", "Ich bin gehen Schule."] },
            { text: "Welches Wort ist ein Nomen?", options: ["Laufen", "Blau", "Katze", "Schnell"] },
            { text: "Vervollständigen Sie: Ich ___ gestern im Kino.", options: ["bin", "war", "habe", "hatte"] },
            { text: "Was ist das Gegenteil von 'Groß'?", options: ["Klein", "Lang", "Breit", "Hoch"] },
            { text: "Er ___ einen Apfel.", options: ["isst", "essen", "esst", "ist"] }
        ];
    } else if (lang === 'French') {
        return [
            { text: "Choisissez la phrase correcte :", options: ["Je vais à l'école.", "Je aller à l'école.", "Je vais l'école.", "Moi aller école."] },
            { text: "Quel mot est un nom ?", options: ["Manger", "Bleu", "Chat", "Vite"] },
            { text: "Complétez : J'___ faim.", options: ["ai", "suis", "as", "es"] },
            { text: "Quel est le contraire de 'Grand' ?", options: ["Petit", "Large", "Haut", "Gros"] },
            { text: "Où ___ tu hier ?", options: ["étais", "es", "as", "été"] }
        ];
    }
    return [
        { text: "Select the correct sentence:", options: ["He go to school.", "He goes to school.", "He going to school.", "He gone to school."] },
        { text: "Which word is a noun?", options: ["Run", "Blue", "Cat", "Quickly"] },
        { text: "Complete: I ___ been waiting for you.", options: ["has", "have", "was", "did"] },
        { text: "Choose the synonym for 'Happy':", options: ["Sad", "Joyful", "Angry", "Tired"] },
        { text: "Where ___ you yesterday?", options: ["was", "were", "are", "is"] }
    ];
};

export const generatePlacementQuestions = async (language: TargetLanguage): Promise<{ text: string, options: string[] }[]> => {
    const fallback = getFallbackQuestions(language);
    const prompt = `Generate 5 multiple-choice questions to test ${language} proficiency (A1-B1).
    Strictly return ONLY a JSON array. No intro, no markdown.
    Structure: [{"text": "Question?", "options": ["A", "B", "C", "D"]}]`;
    
    try {
        const apiCall = callProxy('generateContent', 'gemini-2.5-flash', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { 
                responseMimeType: 'application/json',
                temperature: 0.2
            }
        });

        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("AI_TIMEOUT")), 60000) // Increased from 15s to 60s
        );

        const result: any = await Promise.race([apiCall, timeout]);
        const cleanedText = cleanJsonString(result.text || '[]');
        const questions = JSON.parse(cleanedText);
        
        if (Array.isArray(questions) && questions.length >= 3 && questions[0].options && questions[0].options.length > 1) {
             return questions;
        }
        throw new Error("Invalid JSON structure");

    } catch (e) {
        console.warn(`Placement Test Generation Failed (${e}). Switching to Fallback Mode.`);
        return fallback;
    }
};

export const generateText = async (
    prompt: string, 
    useCache: boolean = false, 
    isCreative: boolean = false, 
    isLongForm: boolean = false,
    systemInstruction?: string
): Promise<{ text: string }> => {
    try {
        const modelName = 'gemini-2.5-flash';
        const result = await callProxy('generateContent', modelName, {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction: systemInstruction,
                temperature: isCreative ? 0.9 : 0.7,
            }
        });
        return { text: result.text || '' };
    } catch (error) {
        console.error("generateText error:", error);
        throw new Error(getFallbackMessage('chat'));
    }
};

export const sendChatMessage = async (
    history: ChatMessage[], 
    newMessage: string, 
    systemInstruction?: string,
    model: string = 'gemini-3-pro-preview'
): Promise<{ text: string }> => {
    try {
        const contents = [
            ...history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            })),
            {
                role: 'user',
                parts: [{ text: newMessage }]
            }
        ];

        const result = await callProxy('generateContent', model, {
            contents: contents,
            config: { systemInstruction }
        });

        return { text: result.text || '' };
    } catch (error) {
        console.error("Chat error:", error);
        throw new Error(getFallbackMessage('chat'));
    }
};

export const getAIAssistedText = async (options: {
    mode: 'generate' | 'improve';
    type: string;
    text: string;
    context?: any;
}): Promise<string> => {
    const { mode, type, text, context } = options;
    let prompt = '';
    
    if (type === 'deed_message') {
        if (mode === 'improve') {
             prompt = `Rewrite the following text into a single, very short (max 10-12 words), poetic sentence in Persian suitable for a palm planting deed. Intention: "${context}". Input: "${text}". It must be ready to print without editing. Do not use quotes.`;
        } else {
             prompt = `Write a single, very short, poetic, and beautiful sentence (maximum 10-12 words) in Persian suitable for a commemorative deed for a palm tree planted with the intention of: "${context}". It must be a complete, meaningful sentence ready to be printed on a certificate without any editing. Do not use quotes.`;
        }
    } else if (mode === 'improve') {
        prompt = `Improve the following text for a ${type}. Context: ${JSON.stringify(context)}. Text: "${text}". Respond in Persian.`;
    } else {
        prompt = `Generate text for a ${type}. Context: ${JSON.stringify(context)}. Prompt: "${text}". Respond in Persian.`;
    }

    const response = await generateText(prompt);
    return response.text.trim();
};

export const generateWebPrototype = async (userPrompt: string): Promise<string> => {
    const systemInstruction = `You are an expert Frontend Developer. Generate a clean, single-file HTML/CSS/JS prototype using Tailwind CSS. Return ONLY the code, no explanation.`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: `Create a web prototype for: ${userPrompt}` }] }],
            config: { systemInstruction, temperature: 0.2 }
        });
        let code = result.text || '';
        code = code.replace(/^```html/, '').replace(/^```/, '').replace(/```$/, '');
        return code.trim();
    } catch (error) {
        throw new Error("خطا در تولید کد. لطفاً دوباره تلاش کنید.");
    }
};

export const askTheGrove = async (question: string, stats: any): Promise<string> => {
    const prompt = `Answer the user's question about the 'Nakhlestan Ma'na' project based on these stats: ${JSON.stringify(stats)}. Question: "${question}". Respond in Persian.`;
    const response = await generateText(prompt);
    return response.text;
};

export const getDailyReflectionPrompt = async (goal: string): Promise<string> => {
    const prompt = `Generate a daily reflection question for a user whose goal is: "${goal}". Respond in Persian.`;
    const response = await generateText(prompt);
    return response.text;
};

export const getJournalReflection = async (entry: string): Promise<string> => {
    const prompt = `Provide a short, insightful reflection on this journal entry: "${entry}". Respond in Persian.`;
    const response = await generateText(prompt);
    return response.text;
};

export const generatePersonalizedEnglishScenarios = async (user: User): Promise<PersonalizedEnglishScenario[]> => {
     const prompt = `Generate 3 personalized English learning role-play scenarios...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(result.text || '[]');
    } catch (e) {
         console.error("Error generating scenarios:", e);
         return [
             { id: 'default_1', title: 'Daily Conversation', description: 'Practice casual talk about your day.', icon: 'UsersIcon' },
             { id: 'default_2', title: 'Job Interview', description: 'Simulate a professional interview.', icon: 'BriefcaseIcon' },
             { id: 'default_3', title: 'Travel', description: 'Role-play travel situations like airport or hotel.', icon: 'CompassIcon' },
         ];
    }
};

export const generateBusinessProcess = async (promptText: string): Promise<{ steps: ProcessStep[] }> => {
     const prompt = `Create a detailed SOP (Standard Operating Procedure) for: "${promptText}". Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(result.text || '{}');
    } catch (e) {
         throw new Error(getFallbackMessage('contentCreation'));
    }
};

export const getVocabularyList = async (topic: string, level: string): Promise<{ vocabulary: VocabularyItem[] }> => {
     const prompt = `Generate a vocabulary list for topic "${topic}" at level "${level}". Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(result.text || '{}');
    } catch (e) {
         throw new Error(getFallbackMessage('contentCreation'));
    }
};

export const generateMenteeBriefing = async (mentee: User): Promise<string> => {
     const prompt = `Generate a briefing for a mentor about this mentee: ${JSON.stringify(mentee)}. Highlight key activities...`;
    const response = await generateText(prompt);
    return response.text;
};

export const generateExecutionPlan = async (decision: { title: string; description: string }): Promise<string> => {
     const prompt = `Generate a detailed execution plan for this decision: ${JSON.stringify(decision)}...`;
    const response = await generateText(prompt);
    return response.text;
};

export const generateOperationalPlans = async (decision: string): Promise<{ plans: { title: string; description: string; priority: number }[] }> => {
     const prompt = `Generate 2 operational plans for this decision... Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(result.text || '{}');
    } catch (e) {
         throw new Error(getFallbackMessage('contentCreation'));
    }
};

export const getAdvisorChatResponse = async (query: string, advisor: AdvisorType, history: ChatMessage[]): Promise<{ text: string }> => {
    const systemInstruction = `Act as a ${advisor} advisor.`;
    return await sendChatMessage(history, query, systemInstruction);
};

export const generateCampaignIdea = async (data: any): Promise<any> => {
     const prompt = `Generate a new campaign idea... Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(result.text || '{}');
    } catch (e) {
         throw new Error(getFallbackMessage('contentCreation'));
    }
};

export const generateArticleDraft = async (topic: string): Promise<ArticleDraft> => {
     const prompt = `Write a blog post draft about '${topic}'... Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(result.text || '{}');
    } catch (e) {
         throw new Error(getFallbackMessage('contentCreation'));
    }
};

export const generateDailyChallenge = async (user: User): Promise<any> => {
    const isNewUser = !user.discReport && !user.enneagramReport && (!user.timeline || user.timeline.length < 2);
    let prompt;
    if (isNewUser) {
        prompt = `Analyze this user profile: ${JSON.stringify(user)}. Generate a simple 'Discovery' challenge... Return JSON...`;
    } else {
        prompt = `Analyze this user profile: ${JSON.stringify(user)}. Generate a personalized daily challenge... Return JSON...`;
    }

    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(result.text || '{}');
    } catch (e) {
         throw new Error(getFallbackMessage('contentCreation'));
    }
};

export const generatePalmVoice = async (deed: Deed, context: { season: string; weather: string }): Promise<{ message: string; mood: string }> => {
    const prompt = `You are the spirit of a Date Palm tree... Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(result.text || '{}');
    } catch (e) {
        throw new Error(getFallbackMessage('contentCreation'));
    }
};

export const generateSpeech = async (text: string): Promise<string> => {
    try {
        const result = await callProxy('generateContent', 'gemini-2.5-flash-preview-tts', {
            contents: [{ role: 'user', parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, 
                    },
                },
            },
        });
        
        const base64Audio = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data returned from TTS model.");
        }
        return base64Audio;

    } catch (error) {
        console.error("generateSpeech error:", error);
        throw new Error("خطا در تولید صدا.");
    }
};

export const generateSyllabus = async (language: TargetLanguage, level: string, goal: string, interest: string): Promise<LMSModule[]> => {
    const prompt = `Create a personalized language learning syllabus (Roadmap) for a user learning ${language}.
    User Level: ${level}
    User Goal: ${goal}
    User Interest: ${interest}
    Methodology: Task-Based Language Teaching (TBLT) and Dogme ELT.
    
    Output: A JSON array of 3 'LMSModule' objects.
    Each module has 'id', 'title', 'description', and 'lessons' array.
    Each lesson has 'id', 'title', 'duration', 'type' ('video', 'practice', 'quiz'), 'xp'.
    
    Return ONLY valid JSON. No markdown.`;

    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        const cleanedText = cleanJsonString(result.text || '[]');
        return JSON.parse(cleanedText);
    } catch (e) {
        console.error("Failed to generate syllabus:", e);
        return [];
    }
};

export const generateLessonContent = async (lessonTitle: string, language: TargetLanguage, level: string): Promise<string> => {
    const prompt = `You are an expert ${language} teacher.
    Create content for a lesson titled: "${lessonTitle}".
    Target Level: ${level}.
    Structure in Markdown.`;

    try {
        const result = await callProxy('generateContent', 'gemini-2.5-flash', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        return result.text || '';
    } catch (e) {
        console.error("Failed to generate lesson content:", e);
        return "خطا در بارگذاری محتوای درس. لطفا دوباره تلاش کنید.";
    }
};
