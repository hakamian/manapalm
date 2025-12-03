
import React from 'react';
import { View } from './ui';

export interface Course {
    id: string;
    title: string;
    shortDescription: string;
    longDescription: string;
    instructor: string;
    duration: string;
    level: string;
    tags: string[];
    imageUrl: string;
    price: number;
    isRetreat?: boolean;
    modules?: (BusinessModule | LMSModule)[];
    xpReward?: number;
    coverGradient?: string;
    icon?: React.FC<any>;
    targetAudience?: string;
    syllabus?: string[]; 
}

export interface BusinessModule {
    title: string;
    sessions: number;
    summary: string;
    timeEstimate: string;
    status: 'locked' | 'unlocked';
    keyConcepts: string[];
    longContent?: string;
    desc: string;
    quiz?: { question: string; options: string[]; correctAnswer: number }[];
}

export interface LMSModule {
    id: string;
    title: string;
    description: string;
    lessons: LMSLesson[];
    quiz?: { question: string; options: string[]; correctAnswer: number }[];
    summary?: string; 
    keyConcepts?: string[]; 
}

export interface LMSLesson {
    id: string;
    title: string;
    duration: string;
    type: 'video' | 'practice' | 'quiz';
    xp: number;
    videoUrl?: string;
    content?: string;
}

export type TargetLanguage = 'English' | 'German' | 'French';

export interface LanguageConfig {
    targetLanguage?: TargetLanguage;
    level?: string;
    goal?: 'career' | 'travel' | 'connection' | 'academic' | 'migration' | 'coaching' | 'general';
    barrier?: 'fear' | 'vocabulary' | 'grammar' | 'time';
    interest?: string;
    timeCommitment?: string;
    syllabus?: LMSModule[];
}

export interface CoursePersonalization {
    role: string;
    industry: string;
    challenge: string;
    goal: string;
}

export interface WebDevProject {
    status: 'none' | 'requested' | 'discovery_chat' | 'generating_prototype' | 'prototype_ready' | 'launching' | 'live' | 'payment';
    packageName?: string;
    packagePrice?: number;
    initialRequest?: {
        projectName: string;
        contactInfo: string;
        projectType: string;
        vision: string;
        projectStatus: string;
        brandTone: string;
        targetAudience: string;
        brandColors: string[];
        requiredPages: string[];
        pageContent: string;
    };
    discoveryData?: {
        brandTone: string;
        targetAudience: string;
        keyFeatures: string;
    };
    prototype?: {
        colors: {hex: string; name: string}[];
        fonts: {name: string; type: string}[];
        tagline: string;
        layout: string[];
        imageUrl: string;
    };
}

export interface HyperPersonalizedReport {
    coreValue: string;
    currentFocus: string;
    suggestedMission: {
        title: string;
        description: string;
    };
}

export interface JournalAnalysisReport {
    thoughtPatterns: string[];
    recurringEmotions: string[];
    goalConnection: string;
}

export interface DISCReport {
    styleName: string;
    analysis: string;
    strengths: string[];
    growthAreas: string[];
    suggestedMission: {
        title: string;
        description: string;
    };
}

export interface EnneagramReport {
    typeNumber: number;
    wing: number;
    typeName: string;
    analysis: string;
    coreMotivation: string;
    coreFear: string;
    growthPath: string;
    stressPath: string;
    suggestedMission: {
        title: string;
        description: string;
    };
}

export interface StrengthsReport {
    topStrengths: { name: string; description: string }[];
    narrative: string;
    roadmap: string;
}

export interface IkigaiReport {
    statement: string;
    analysis: string;
    actionSteps: {
        project: { title: string; description: string };
        course: { title: string; description: string };
        deed: { intention: string; description: string };
    };
}

export interface EnglishLevelReport {
    level: string;
    language: string;
}

export interface MeaningCompassAnalysis {
    themes: string[];
    suggestion: {
        title: string;
        description: string;
        view: View;
        cta: string;
    };
}

export interface MentorshipRequest {
    id: string;
    menteeId: string;
    menteeName: string;
    menteeLevel: number;
    mentorId: string;
    status: 'pending' | 'accepted' | 'rejected';
}

// --- New Interfaces for Omni-Course Tool ---

export interface ExpertRole {
    roleName: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    responsibilities: string;
    deliverables: string;
    hiringNote: string;
}

export interface KnowledgeBaseData {
    coreConcept: string;
    keyFrameworks: { name: string; explanation: string; action: string }[];
    counterIntuitiveInsights: string[];
    vocabulary: { term: string; definition: string }[];
    keyQuotes: string[];
    sources: { title: string; url: string; reason: string }[];
}

export interface OmniCourseOutput {
    rolesRoster: ExpertRole[];
    knowledgeBase: KnowledgeBaseData;
    courseModules: LMSModule[];
}
