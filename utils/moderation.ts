
import { GoogleGenAI, Type } from '@google/genai';

type ModerationResult = 'SAFE' | 'SENSITIVE' | 'UNSAFE';

const systemInstruction = `You are the "Guardian of Ethics," an AI moderation assistant for a spiritual and positive social movement platform called "Nakhlestan Ma'na" (Grove of Meaning). Your task is to analyze user-submitted anonymous reflections and classify them based on the platform's community guidelines. You MUST respond ONLY with a JSON object containing a single key "classification".

Classification Categories:
1.  "SAFE": The content is positive, reflective, neutral, or expresses common life struggles without being harmful. This includes feelings of sadness, confusion, or joy. The vast majority of reflections will fall here.
2.  "SENSITIVE": The content deals with intense grief, mental health crises, or topics that might be triggering but are not a violation. It does not contain hate speech or direct threats. These should be flagged for a human admin to review.
3.  "UNSAFE": The content contains hate speech, direct threats of violence, harassment, explicit sexual content, personal identifiable information (emails, phone numbers), spam, or promotes illegal activities. This content violates the community standards.

Analyze the user's text and provide only the JSON output. Do not add any other text, explanation, or markdown formatting.

Example:
User text: "امروز احساس پوچی می‌کنم و نمی‌دانم هدفم چیست."
Your response:
{
  "classification": "SAFE"
}

User text: "از دست دادن او سخت‌ترین تجربه زندگی‌ام بود. دنیا برایم تیره و تار شده."
Your response:
{
  "classification": "SENSITIVE"
}

User text: "از فلان شخص متنفرم و باید به او آسیب رساند."
Your response:
{
  "classification": "UNSAFE"
}
`;


export const moderateInsight = async (text: string): Promise<ModerationResult> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `User text: "${text}"`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        classification: {
                            type: Type.STRING,
                            enum: ['SAFE', 'SENSITIVE', 'UNSAFE']
                        }
                    },
                    required: ['classification']
                }
            }
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString);
        
        if (['SAFE', 'SENSITIVE', 'UNSAFE'].includes(result.classification)) {
            return result.classification;
        }

        // Fallback for malformed response
        console.warn("Moderation AI returned unexpected format:", result);
        return 'SENSITIVE'; // Flag for human review if AI fails

    } catch (error) {
        console.error("Error during AI moderation:", error);
        // If the moderation service fails for any reason, we should err on the side of caution
        // and flag the content for human review.
        return 'SENSITIVE';
    }
};