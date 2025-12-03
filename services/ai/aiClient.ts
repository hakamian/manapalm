
import { GoogleGenAI } from "@google/genai";

// Adapter Pattern: Define a common interface for AI operations
export interface AIClientInterface {
  generateText(prompt: string, systemInstruction?: string): Promise<string>;
  generateImage(prompt: string, aspectRatio?: string): Promise<string>;
  generateVideo(prompt: string, image?: string): Promise<string>;
  generateSpeech(text: string): Promise<string>;
}

export class GeminiClient implements AIClientInterface {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction }
    });
    return response.text || '';
  }

  async generateImage(prompt: string, aspectRatio: string = '1:1'): Promise<string> {
    const response = await this.ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt,
      config: { numberOfImages: 1, aspectRatio, outputMimeType: 'image/jpeg' }
    });
    if (response.generatedImages && response.generatedImages.length > 0) {
       return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    }
    throw new Error("Image generation failed");
  }

  async generateVideo(prompt: string, imageBase64?: string): Promise<string> {
    // Placeholder for video generation logic using Veo model via proxy or direct SDK
    // For now, using a mock implementation structure as full video gen involves polling
    throw new Error("Video generation requires complex polling implemented in specific hook");
  }

  async generateSpeech(text: string): Promise<string> {
    const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ role: 'user', parts: [{ text }] }],
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
        }
    });
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) throw new Error("TTS failed");
    return audioData;
  }
}

// Singleton instance holder
class AIClientFactory {
    private static instance: AIClientInterface;

    static getInstance(): AIClientInterface {
        if (!this.instance) {
            // In a real app, you might switch this based on feature flags
            const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY; // Fallback for local dev if proxy fails
            this.instance = new GeminiClient(apiKey || '');
        }
        return this.instance;
    }
}

export const aiClient = AIClientFactory.getInstance();
