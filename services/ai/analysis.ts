
import { callProxy, getFallbackMessage } from './core';
import { 
    User, HyperPersonalizedReport, JournalAnalysisReport, DISCReport, EnneagramReport, 
    StrengthsReport, IkigaiReport, EnglishLevelReport, MeaningCompassAnalysis, 
    Advice, ProactiveReport, MorningBriefing, Order, CommunityPost, IndividualOpinion, Suggestion, AdvisorType 
} from '../../types';
import { Type } from '@google/genai';

const cleanJsonString = (text: string): string => {
    if (!text) return "{}";
    let clean = text.trim();
    clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
    clean = clean.replace(/\s*```$/, '');
    return clean;
};

export const detectFraudPatterns = async (
    data: { logs: any[]; transactions: any[] }
): Promise<{ anomalies: { userId: string; userName: string; riskLevel: 'high' | 'medium' | 'low'; reason: string; suggestedAction: string }[] }> => {
    const prompt = `
    You are a Security and Fraud Analyst for "Nakhlestan Ma'na". Analyze the provided system logs and transaction data to detect anomalies, fraud patterns, or abuse of the gamification system.
    
    Data: ${JSON.stringify(data)}

    Respond ONLY with a JSON object containing an 'anomalies' array. Each anomaly should have:
    - userId
    - userName (if available)
    - riskLevel ('high', 'medium', 'low')
    - reason (Persian description of why it's suspicious)
    - suggestedAction (Persian suggestion, e.g., "Suspend Account", "Review Manually")
    `;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(cleanJsonString(result.text || '{ "anomalies": [] }'));
    } catch (e) {
        console.error("Fraud detection failed:", e);
        return { anomalies: [] };
    }
};

export const getHyperPersonalizedAnalysis = async (user: User): Promise<HyperPersonalizedReport> => {
    const prompt = `Analyze this user profile: ${JSON.stringify(user)}. Provide a 'coreValue', 'currentFocus', and a 'suggestedMission' (title and description) in JSON format. Respond in Persian values.`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(cleanJsonString(result.text || '{}'));
    } catch (e) {
        throw new Error(getFallbackMessage('analysis'));
    }
};

export const getJournalAnalysis = async (entries: string[], goal: string): Promise<JournalAnalysisReport> => {
    const prompt = `Analyze these journal entries against the goal "${goal}": ${JSON.stringify(entries)}. Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(cleanJsonString(result.text || '{}'));
    } catch (e) {
        throw new Error(getFallbackMessage('analysis'));
    }
};

export const getDISCAnalysis = async (answers: Record<string, string>, user: User): Promise<DISCReport> => {
    const prompt = `Analyze these DISC assessment answers for user ${user.name}: ${JSON.stringify(answers)}. Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(cleanJsonString(result.text || '{}'));
    } catch (e) {
         throw new Error(getFallbackMessage('analysis'));
    }
};

export const getEnneagramAnalysis = async (answers: Record<string, string>, user: User): Promise<EnneagramReport> => {
    const prompt = `Analyze these Enneagram assessment answers: ${JSON.stringify(answers)}. Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(cleanJsonString(result.text || '{}'));
    } catch (e) {
         throw new Error(getFallbackMessage('analysis'));
    }
};

export const getStrengthsAnalysis = async (answers: Record<string, string>, user: User): Promise<StrengthsReport> => {
     const prompt = `Analyze these Strengths assessment answers: ${JSON.stringify(answers)}. Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(cleanJsonString(result.text || '{}'));
    } catch (e) {
         throw new Error(getFallbackMessage('analysis'));
    }
};

export const getIkigaiAnalysis = async (answers: any, user: User): Promise<IkigaiReport> => {
     const prompt = `Analyze these Ikigai assessment answers: ${JSON.stringify(answers)}. Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(cleanJsonString(result.text || '{}'));
    } catch (e) {
         throw new Error(getFallbackMessage('analysis'));
    }
};

export const getEnglishLevel = async (answers: { question: string, answer: string }[]): Promise<EnglishLevelReport> => {
    const prompt = `Analyze these language placement test answers: ${JSON.stringify(answers)}. 
    Determine the CEFR level (A1-C2) based on accuracy.
    Return a JSON object with a single key "level" containing one of: "Beginner" (A1-A2), "Intermediate" (B1-B2), "Advanced" (C1-C2).
    Do not include markdown formatting.`;
    
    try {
        const apiCall = callProxy('generateContent', 'gemini-2.5-flash', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { 
                responseMimeType: 'application/json',
                temperature: 0.1
            }
        });

        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout")), 15000)
        );

        const result: any = await Promise.race([apiCall, timeout]);
        
        const rawText = result.text || '';
        const cleanedText = cleanJsonString(rawText);

        try {
            const parsed = JSON.parse(cleanedText);
            if (parsed.level && ["Beginner", "Intermediate", "Advanced"].includes(parsed.level)) {
                return { level: parsed.level, language: 'English' };
            }
        } catch (parseError) {
             // Fallback parsing
        }
        return { level: "Beginner", language: 'English' };

    } catch (e) {
         console.warn("AI Level Analysis Failed or Timed Out (using fallback):", e);
         return { level: "Beginner", language: 'English' };
    }
};

export const getMeaningCompassAnalysis = async (chatHistory: any[]): Promise<MeaningCompassAnalysis> => {
    const prompt = `Analyze this chat history to identify key themes and a suggested next step. History: ${JSON.stringify(chatHistory)}. Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(cleanJsonString(result.text || '{}'));
    } catch (e) {
         throw new Error(getFallbackMessage('analysis'));
    }
};

export const getBoardMeetingAdvice = async (query: string, advisors: AdvisorType[], platformData: any): Promise<Advice> => {
     const prompt = `Simulate a board meeting with advisors...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(cleanJsonString(result.text || '{}'));
    } catch (e) {
         throw new Error(getFallbackMessage('analysis'));
    }
};

export const analyzeCommunitySentimentAndTopics = async (posts: string[]): Promise<{ sentiment: any; trendingTopics: string[] }> => {
     const prompt = `Analyze these community posts... Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(cleanJsonString(result.text || '{}'));
    } catch (e) {
         throw new Error(getFallbackMessage('analysis'));
    }
};

export const generateSegmentActionPlan = async (advisor: AdvisorType, segmentInfo: any): Promise<{ suggestions: { title: string, description: string, action: string }[] }> => {
     const prompt = `As a ${advisor} advisor, suggest an action plan for this user segment... Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(cleanJsonString(result.text || '{}'));
    } catch (e) {
         throw new Error(getFallbackMessage('analysis'));
    }
};

export const generateOpportunityRadarInsights = async (data: { users: User[], orders: Order[], posts: CommunityPost[] }): Promise<{ opportunity: any, threat: any, trend: any }> => {
     const prompt = `Analyze platform data to identify an opportunity, a threat, and a trend... Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(cleanJsonString(result.text || '{}'));
    } catch (e) {
         throw new Error(getFallbackMessage('analysis'));
    }
};

export const synthesizeDecisionFromOpinions = async (opinions: IndividualOpinion[]): Promise<{ decision: string }> => {
     const prompt = `Synthesize a single strategic decision from these opinions... Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(cleanJsonString(result.text || '{}'));
    } catch (e) {
         throw new Error(getFallbackMessage('analysis'));
    }
};

export const generateProactiveWeeklyReport = async (data: any): Promise<ProactiveReport> => {
     const prompt = `Generate a proactive weekly report... Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(cleanJsonString(result.text || '{}'));
    } catch (e) {
         throw new Error(getFallbackMessage('analysis'));
    }
};

export const getStrategicAdvice = async (query: string, advisor: AdvisorType, data: any): Promise<{ suggestions: Suggestion[] }> => {
     const prompt = `As a ${advisor} advisor, provide strategic advice... Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(cleanJsonString(result.text || '{}'));
    } catch (e) {
         throw new Error(getFallbackMessage('analysis'));
    }
};

export const analyzeProjectProposal = async (proposal: { title: string; description: string }): Promise<{ pros: string[]; cons: string[]; potentialImpact: string }> => {
     const prompt = `Analyze this project proposal... Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(cleanJsonString(result.text || '{}'));
    } catch (e) {
         throw new Error(getFallbackMessage('analysis'));
    }
};

export const getPersonalizedProductRecommendations = async (user: User, products: any[]): Promise<any[]> => {
    return products.slice(0, 4);
};

export const getGiftRecommendation = async (
    input: { relation: string; occasion: string; description: string },
    availableProducts: any[]
): Promise<{ recommendedProductId: string; reasoning: string; suggestedMessage: string }> => {
    const prompt = `... User Request: ${JSON.stringify(input)} ... Products: ${JSON.stringify(availableProducts)} ... Return JSON...`;

    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(cleanJsonString(result.text || '{}'));
    } catch (e) {
        throw new Error(getFallbackMessage('analysis'));
    }
};

export const generateMorningBriefing = async (data: any): Promise<MorningBriefing> => {
    const prompt = `You are the Chief of Staff... Analyze data... Return JSON...`;
    try {
        const result = await callProxy('generateContent', 'gemini-3-pro-preview', {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(cleanJsonString(result.text || '{}'));
    } catch (e) {
        throw new Error(getFallbackMessage('analysis'));
    }
};
