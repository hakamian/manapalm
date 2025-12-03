
import { callProxy, getFallbackMessage } from './core';
import { Deed } from '../../types';

export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    try {
        const validAspectRatio = ["1:1", "3:4", "4:3", "9:16", "16:9"].includes(aspectRatio) ? aspectRatio : "1:1";
        
        // Use Imagen via 'generateImages' action on proxy
        const imagenResult = await callProxy('generateImages', 'imagen-4.0-generate-001', {
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: validAspectRatio === "1:1" ? "1:1" : validAspectRatio === "9:16" ? "9:16" : "16:9" 
            }
        });

        if (imagenResult.images && imagenResult.images.length > 0) {
            return `data:image/jpeg;base64,${imagenResult.images[0]}`;
        }
        
        throw new Error("No image returned");

    } catch (error) {
        console.error("generateImage error:", error);
        throw new Error(getFallbackMessage('contentCreation'));
    }
};

export const generateFutureVision = async (deed: Deed, years: number): Promise<string> => {
    const prompt = `A photorealistic, cinematic image of a Date Palm tree... ${years} years from now... Intention: "${deed.intention}"...`;
    
    try {
        return await generateImage(prompt, "1:1");
    } catch (error) {
        console.error("generateFutureVision error:", error);
        throw new Error(getFallbackMessage('contentCreation'));
    }
};
