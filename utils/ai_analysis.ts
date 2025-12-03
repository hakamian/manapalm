
import { GoogleGenAI, Type } from '@google/genai';
import { AdminReport, TimelineEvent, KeyTheme, ActionableDraft } from '../types.ts';

const generateAdminInsightsSystemInstruction = `You are a sophisticated AI analyst for a social enterprise platform called "Nakhlestan Ma'na". Your task is to analyze a collection of user-submitted anonymous reflections (insights) and generate a concise, actionable admin report in JSON format. The report should identify key themes, gauge community sentiment, and suggest concrete actions.

Analyze the provided array of insight objects. Each insight has a 'title', 'description', and 'userReflection.notes'. Focus on the 'userReflection.notes' field.

Your JSON output MUST match this schema:
{
  "sentiment": {
    "score": number (0.0-1.0, where 1 is very positive),
    "label": string ("بسیار مثبت", "مثبت", "خنثی", "منفی", "بسیار منفی"),
    "trend": string ("rising", "stable", "falling", based on a mock analysis of recent vs. older insights)
  },
  "keyThemes": [
    {
      "theme": string (a short, descriptive theme title in Persian, e.g., "قدردانی از خانواده"),
      "summary": string (a one-sentence summary of the theme in Persian),
      "insightIds": string[] (IDs of insights related to this theme),
      "count": number (number of insights in this theme)
    }
  ],
  "actionableSuggestions": [
    {
      "suggestion": string (a concrete, actionable suggestion for the admin in Persian, e.g., "ایجاد یک کمپین حول قدردانی"),
      "reasoning": string (a brief explanation of why this suggestion is relevant, based on the themes, in Persian)
    }
  ]
}

- Identify 3-5 key themes.
- For sentiment, provide an overall score. The trend can be a simulated value.
- Suggestions should be creative and directly linked to the identified themes.
- ALL text content MUST be in Persian.
`;

export const generateAdminInsights = async (
    allInsights: TimelineEvent[]
): Promise<AdminReport | null> => {
    if (allInsights.length === 0) return null;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const insightsForAnalysis = allInsights
            .filter(i => i.isSharedAnonymously && i.userReflection?.notes)
            .map(i => ({ id: i.id, notes: i.userReflection!.notes }));

        if (insightsForAnalysis.length === 0) return null;
        
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Analyze these user insights:\n${JSON.stringify(insightsForAnalysis)}`,
            config: {
                systemInstruction: generateAdminInsightsSystemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sentiment: {
                            type: Type.OBJECT,
                            properties: {
                                score: { type: Type.NUMBER },
                                label: { type: Type.STRING },
                                trend: { type: Type.STRING, enum: ['rising', 'stable', 'falling'] },
                            },
                            required: ['score', 'label', 'trend'],
                        },
                        keyThemes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    theme: { type: Type.STRING },
                                    summary: { type: Type.STRING },
                                    insightIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    count: { type: Type.INTEGER },
                                },
                                required: ['theme', 'summary', 'insightIds', 'count'],
                            },
                        },
                        actionableSuggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    suggestion: { type: Type.STRING },
                                    reasoning: { type: Type.STRING },
                                },
                                required: ['suggestion', 'reasoning'],
                            },
                        },
                    },
                    required: ['sentiment', 'keyThemes', 'actionableSuggestions'],
                }
            }
        });

        const jsonString = response.text;
        const result: AdminReport = JSON.parse(jsonString);
        return result;

    } catch (error) {
        console.error("Error generating admin insights:", error);
        return null;
    }
};

const generateDraftUpdateSystemInstruction = `You are "My Ma'na," an AI communications assistant for the "Nakhlestan Ma'na" platform. Your task is to draft a project update or community announcement based on a key theme identified from user reflections. The draft should be empathetic, inspiring, and aligned with the platform's values.

You will be given a theme object containing the theme title and a summary.

Your response MUST be a JSON object with this exact schema:
{
  "type": "projectUpdate",
  "title": "...",
  "description": "..."
}

- The 'title' should be a compelling, positive headline in Persian.
- The 'description' should be a well-written, multi-paragraph announcement body in Persian. It should:
    1. Acknowledge the community's feelings/thoughts related to the theme.
    2. Connect the theme to one of the platform's projects or values.
    3. End with an inspiring call to action or a reflective question.
- ALL text content MUST be in Persian.
`;

export const generateDraftUpdate = async (
    theme: KeyTheme
): Promise<ActionableDraft | null> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Draft an announcement for this theme:\n${JSON.stringify(theme)}`,
            config: {
                systemInstruction: generateDraftUpdateSystemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['projectUpdate'] },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                    },
                    required: ['type', 'title', 'description'],
                }
            }
        });

        const jsonString = response.text;
        const result: ActionableDraft = JSON.parse(jsonString);
        return result;

    } catch (error) {
        console.error("Error generating draft update:", error);
        return null;
    }
};