
import React from 'react';
import { User } from '../../types';
import Chatbot from '../tools/Chatbot';
import ImageGenerator from '../tools/ImageGenerator';
import ContentGenerator from '../tools/ContentGenerator';
import VideoGenerator from '../tools/VideoGenerator';
import LiveChat from '../tools/LiveChat';
import TranscribeTool from '../tools/TranscribeTool';
import ImageEditTool from '../tools/ImageEditTool';
import TextToSpeechTool from '../tools/TextToSpeechTool';
import CodeArchitectTool from '../tools/CodeArchitectTool';
import DeepThinkingTool from '../tools/DeepThinkingTool';
import KnowledgeRefinerTool from '../tools/KnowledgeRefinerTool';
import YouTubeContentTool from '../tools/YouTubeContentTool';
import VideoCourseTool from '../tools/VideoCourseTool';
import CourseCreatorTool from '../tools/CourseCreatorTool'; // Updated import
import ConsultantCourseTool from '../tools/ConsultantCourseTool';
import ArticleAlchemistTool from '../tools/ArticleAlchemistTool';
import OmniConverterTool from '../tools/OmniConverterTool';
import PodcastProducerTool from '../tools/PodcastProducerTool';
import PresentationArchitectTool from '../tools/PresentationArchitectTool';
import SocialMediaManagerTool from '../tools/SocialMediaManagerTool';

interface ActiveToolRendererProps {
    activeToolId: string | null;
    user: User | null;
    onUpdateProfile: (user: Partial<User>) => void;
    onOpenStorageModal: () => void;
}

const ActiveToolRenderer: React.FC<ActiveToolRendererProps> = ({ activeToolId, user, onUpdateProfile, onOpenStorageModal }) => {
    if (!user) return null;

    switch (activeToolId) {
        case 'socialMediaArchitect':
            return <SocialMediaManagerTool />;
        case 'presentationArchitect':
            return <PresentationArchitectTool />;
        case 'podcastProducer':
            return <PodcastProducerTool />;
        case 'omniConverter':
            return <OmniConverterTool />;
        case 'articleAlchemist':
            return <ArticleAlchemistTool />;
        case 'consultantCourse':
            return <ConsultantCourseTool />;
        case 'omniCourseArchitect':
            return <CourseCreatorTool />; // Updated to use the new powerful tool
        case 'videoCourseBuilder':
            return <VideoCourseTool />;
        case 'youtubeContent':
            return <YouTubeContentTool />;
        case 'knowledgeRefiner':
            return <KnowledgeRefinerTool />;
        case 'chatbot': 
            return <Chatbot />;
        case 'imageGen': 
            return <ImageGenerator 
                user={user} 
                onUpdateProfile={onUpdateProfile}
                creativeActsCount={user.timeline?.filter(e => e.type === 'creative_act').length || 0}
                creativeStorageCapacity={user.creativeStorageCapacity || 0}
                onOpenPurchaseModal={onOpenStorageModal}
            />;
        case 'contentGen': 
            return <ContentGenerator 
                user={user} 
                onUpdateProfile={onUpdateProfile}
            />;
        case 'videoGen':
            return <VideoGenerator 
                user={user} 
                onUpdateProfile={onUpdateProfile}
                creativeActsCount={user.timeline?.filter(e => e.type === 'creative_act').length || 0}
                creativeStorageCapacity={user.creativeStorageCapacity || 0}
                onOpenPurchaseModal={onOpenStorageModal}
            />;
        case 'liveChat':
            return <LiveChat />;
        case 'transcribe':
            return <TranscribeTool user={user} />;
        case 'imageEdit':
            return <ImageEditTool />;
        case 'tts':
            return <TextToSpeechTool />;
        case 'codeGen':
             return <CodeArchitectTool />;
        case 'thinking':
            return <DeepThinkingTool />;
        default: return null;
    }
};

export default ActiveToolRenderer;
