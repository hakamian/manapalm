
import React, { Suspense } from 'react';
import { View } from '../../types';
import { useAppState, useAppDispatch } from '../../AppContext';
import LoadingSpinner from '../LoadingSpinner'; // Ensure this component exists

// Lazy load all views to split the bundle
const HomeView = React.lazy(() => import('../HomeView'));
const AboutView = React.lazy(() => import('../AboutView'));
const HallOfHeritageView = React.lazy(() => import('../HallOfHeritageView'));
const ShopView = React.lazy(() => import('../ShopView'));
const CoursesView = React.lazy(() => import('../CoursesView'));
const HerosJourneyView = React.lazy(() => import('../HerosJourneyView'));
const UserProfileView = React.lazy(() => import('../UserProfileView'));
const CorporateView = React.lazy(() => import('../CorporateView'));
const OurGroveView = React.lazy(() => import('../OurGroveView'));
const MeaningCoachingScholarshipView = React.lazy(() => import('../MeaningCoachingScholarshipView'));
const CompassUnlockChatView = React.lazy(() => import('../CompassUnlockChatView'));
const PathOfMeaningView = React.lazy(() => import('../PathOfMeaningView'));
const CommunityHubView = React.lazy(() => import('../CommunityHubView'));
const ArticlesView = React.lazy(() => import('../ArticlesView'));
const AdminDashboardView = React.lazy(() => import('../AdminDashboardView'));
const CoCreationView = React.lazy(() => import('../CoCreationView'));
const DailyOasisView = React.lazy(() => import('../DailyOasisView'));
const DirectMessagesView = React.lazy(() => import('../DirectMessagesView'));
const TransparencyDashboardView = React.lazy(() => import('../TransparencyDashboardView'));
const ContactView = React.lazy(() => import('../ContactView'));
const AICreationStudio = React.lazy(() => import('../AICreationStudio'));
const MeaningCompanionView = React.lazy(() => import('../MeaningCompanionView'));
const EnglishAcademyView = React.lazy(() => import('../EnglishAcademyView'));
const EnglishPlacementTestView = React.lazy(() => import('../EnglishPlacementTestView'));
const AIConversationPartnerView = React.lazy(() => import('../AIConversationPartnerView'));
const VocabularyBuilderView = React.lazy(() => import('../VocabularyBuilderView'));
const BusinessAcademyView = React.lazy(() => import('../BusinessAcademyView'));
const LifeMasteryAcademyView = React.lazy(() => import('../LifeMasteryAcademyView')); // New Import
const BusinessProcessModelerView = React.lazy(() => import('../BusinessProcessModelerView'));
const DISCTestView = React.lazy(() => import('../DISCTestView'));
const EnneagramTestView = React.lazy(() => import('../EnneagramTestView'));
const StrengthsTestView = React.lazy(() => import('../StrengthsTestView'));
const IkigaiTestView = React.lazy(() => import('../IkigaiTestView'));
const HerosJourneyIntroView = React.lazy(() => import('../HerosJourneyIntroView'));
const CoachingLabView = React.lazy(() => import('../CoachingLabView'));
const CoachingSessionView = React.lazy(() => import('../CoachingSessionView'));
const GiftConciergeView = React.lazy(() => import('../GiftConciergeView'));
const LivingHeritagePage = React.lazy(() => import('../LivingHeritagePage'));
const GardenOfHeroesPage = React.lazy(() => import('../GardenOfHeroesPage'));
const DigitalHeritageArchitectPage = React.lazy(() => import('../DigitalHeritageArchitectPage'));
const MeaningCoachPage = React.lazy(() => import('../MeaningCoachPage'));
const CommunityProjectsPage = React.lazy(() => import('../CommunityProjectsPage'));
const MicrofinanceView = React.lazy(() => import('../MicrofinanceView'));
const SmartConsultantView = React.lazy(() => import('../SmartConsultantView'));
const BusinessMentorView = React.lazy(() => import('../BusinessMentorView'));

const MainContent: React.FC = () => {
    const { 
        currentView, 
        user, 
        allUsers, 
        orders, 
        communityPosts, 
        campaign, 
        palmTypes, 
        proposals
    } = useAppState();
    
    const dispatch = useAppDispatch();

    const onAddProjectUpdate = (projectId: string, update: { title: string, description: string }) => {
         console.log('Project Update:', projectId, update);
         // In a real app, dispatch an action here
    };

    // Render logic based on view
    const renderView = () => {
        switch (currentView) {
            case View.Home: return <HomeView />;
            case View.About: return <AboutView />;
            case View.HallOfHeritage: return <HallOfHeritageView />;
            case View.Shop: return <ShopView />;
            case View.Courses: return <CoursesView />;
            case View.HerosJourney: return <HerosJourneyView />;
            case View.UserProfile: return <UserProfileView />;
            case View.Corporate: return <CorporateView />;
            case View.OurGrove: return <OurGroveView />;
            case View.MeaningCoachingScholarship: return <MeaningCoachingScholarshipView />;
            case View.CompassUnlockChat: return <CompassUnlockChatView />;
            case View.PathOfMeaning: return <PathOfMeaningView />;
            case View.CommunityHub: return <CommunityHubView />;
            case View.Articles: return <ArticlesView />;
            case View.AdminDashboard: 
                return <AdminDashboardView 
                    users={allUsers} 
                    orders={orders} 
                    posts={communityPosts} 
                    campaign={campaign} 
                    palmTypes={palmTypes}
                    onAddProjectUpdate={onAddProjectUpdate}
                />;
            case View.CoCreation: return <CoCreationView user={user} proposals={proposals} />;
            case View.DailyOasis: return <DailyOasisView />;
            case View.DIRECT_MESSAGES: return <DirectMessagesView />;
            case View.TransparencyDashboard: return <TransparencyDashboardView />;
            case View.Contact: return <ContactView />;
            case View.AIPortal: 
            case View.AI_CREATION_STUDIO: return <AICreationStudio initialTab="studio" />;
            case View.AI_ACADEMY: return <AICreationStudio initialTab="academy" />;
            case View.MeaningCompanion: return <MeaningCompanionView />;
            case View.ENGLISH_ACADEMY: return <EnglishAcademyView />;
            case View.ENGLISH_PLACEMENT_TEST: return <EnglishPlacementTestView />;
            case View.AI_CONVERSATION_PARTNER: return <AIConversationPartnerView />;
            case View.VOCABULARY_BUILDER: return <VocabularyBuilderView />;
            case View.BUSINESS_ACADEMY: return <BusinessAcademyView />;
            case View.LIFE_MASTERY_ACADEMY: return <LifeMasteryAcademyView user={user} />; // New Route
            case View.BUSINESS_PROCESS_MODELER: return <BusinessProcessModelerView />;
            case View.DISC_TEST: return <DISCTestView />;
            case View.ENNEAGRAM_TEST: return <EnneagramTestView />;
            case View.STRENGTHS_TEST: return <StrengthsTestView />;
            case View.IKIGAI_TEST: return <IkigaiTestView />;
            case View.HEROS_JOURNEY_INTRO: return <HerosJourneyIntroView />;
            case View.COACHING_LAB: return <CoachingLabView />;
            case View.COACHING_SESSION: return <CoachingSessionView />;
            case View.GiftConcierge: return <GiftConciergeView />;
            case View.Microfinance: return <MicrofinanceView />; 
            case View.SMART_CONSULTANT: return <SmartConsultantView />;
            case View.BUSINESS_MENTOR: return <BusinessMentorView />;
            case View['living-heritage']: return <div>Living Heritage View (Data Needed)</div>; 
            case View['digital-heritage-architect']: return <DigitalHeritageArchitectPage />;
            case View['garden-of-heroes']: 
                return <GardenOfHeroesPage allUsers={allUsers} currentUser={user} onLoginClick={() => dispatch({type: 'TOGGLE_AUTH_MODAL', payload: true})} />;
            case View['meaning-coach']: 
                return user ? <MeaningCoachPage user={user} onSaveHistory={()=>{}} onUpdateProfile={(u) => dispatch({type: 'UPDATE_USER', payload: u})}/> : <HomeView />;
            case View['community-projects']: 
                return <CommunityProjectsPage user={user} allCommunityProjects={[]} onContribute={()=>{}} onLoginClick={() => dispatch({type: 'TOGGLE_AUTH_MODAL', payload: true})}/>; 
            default: return <HomeView />;
        }
    };

    return (
        <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center bg-gray-900"><LoadingSpinner /></div>}>
            {renderView()}
        </Suspense>
    );
};

export default MainContent;
