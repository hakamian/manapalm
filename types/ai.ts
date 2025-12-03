
import React from 'react';
import { View } from './ui';

export type AIModel = 'gemini-2.5-flash' | 'gemini-3-pro-preview' | 'imagen-4.0-generate-001' | 'veo-3.1-fast-generate-preview' | 'gemini-2.5-flash-preview-tts' | 'gemini-2.5-flash-native-audio-preview-09-2025' | 'gpt-4o' | 'gpt-4o-mini' | 'claude-3-5-sonnet';

export type AIProvider = 'google' | 'openai' | 'anthropic';

export interface AIConfig {
    activeProvider: AIProvider;
    activeTextModel: AIModel;
    activeImageModel: string;
    fallbackEnabled: boolean;
    safetyThreshold: string;
    systemStatus: 'online' | 'maintenance';
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    timestamp?: string;
}

export interface PersonalizedEnglishScenario {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export interface ProcessStep {
    title: string;
    responsible: string;
    description: string;
}

export interface VocabularyItem {
    word: string;
    translation: string;
    definition: string;
    example: string;
}

export interface ArticleDraft {
    title: string;
    summary: string;
    content: string;
}

export interface Advice {
    text: string;
}

export interface ProactiveReport {
    reportId: string;
    generatedAt: string;
    content: string;
    metrics: any;
}

export interface MorningBriefing {
    summary: string;
    priorities: {
        title: string;
        status: 'critical' | 'warning' | 'opportunity';
        description: string;
        recommendedAction: string;
    }[];
}

export interface IndividualOpinion {
    advisorId: AdvisorType;
    views: string[];
}

export interface Suggestion {
    title: string;
    description: string;
    action: string;
}

export type AdvisorType = 'strategy' | 'data' | 'community' | 'growth' | 'financial' | 'coaching' | 'ux' | 'systems_architect' | 'spiritual_guide' | 'agricultural' | 'legal' | 'content' | 'foresight' | 'ai' | 'seo' | 'education' | 'social_media_expert';

export interface AITool {
    id: string;
    name: string;
    icon: string | React.FC<any>;
    description: string;
    loginRequired: boolean;
}

export interface ConversationTurn {
    role: 'user' | 'ai';
    text: string;
    feedback?: string;
}

export interface EnglishScenario {
    title: string;
    instruction: string;
}

export interface AgentActionLog {
    id: string;
    action: string;
    details: string;
    timestamp: string;
}
