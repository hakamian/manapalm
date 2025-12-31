
import React, { Suspense, useEffect, useState } from 'react';
import { View } from '../../types';
import { useAppState, useAppDispatch } from '../../AppContext';
import LoadingSpinner from '../LoadingSpinner'; // Ensure this component exists

// Lazy load all views to split the bundle
const HomeView = React.lazy(() => import('../HomeView'));
const HerosJourneyView = React.lazy(() => import('../HerosJourneyView'));
const CorporateView = React.lazy(() => import('../CorporateView'));
const OurGroveView = React.lazy(() => import('../OurGroveView'));
const MeaningCoachingScholarshipView = React.lazy(() => import('../MeaningCoachingScholarshipView'));
const CompassUnlockChatView = React.lazy(() => import('../CompassUnlockChatView'));
const PathOfMeaningView = React.lazy(() => import('../PathOfMeaningView'));
const CommunityHubView = React.lazy(() => import('../CommunityHubView'));
const AdminDashboardView = React.lazy(() => import('../AdminDashboardView'));
const CoCreationView = React.lazy(() => import('../CoCreationView'));
const DailyOasisView = React.lazy(() => import('../DailyOasisView'));
const DirectMessagesView = React.lazy(() => import('../DirectMessagesView'));
const TransparencyDashboardView = React.lazy(() => import('../TransparencyDashboardView'));
const AIStudioView = React.lazy(() => import('../../src/features/ai-studio/AIStudioView'));
const AutoCEOView = React.lazy(() => import('../../src/features/admin/AutoCEOView'));
const AICreationStudio = React.lazy(() => import('../AICreationStudio'));
const MeaningCompanionView = React.lazy(() => import('../MeaningCompanionView'));
const EnglishAcademyView = React.lazy(() => import('../EnglishAcademyView'));
const EnglishPlacementTestView = React.lazy(() => import('../EnglishPlacementTestView'));
const AIConversationPartnerView = React.lazy(() => import('../AIConversationPartnerView'));
const VocabularyBuilderView = React.lazy(() => import('../VocabularyBuilderView'));
const BusinessAcademyView = React.lazy(() => import('../BusinessAcademyView'));
const LifeMasteryAcademyView = React.lazy(() => import('../LifeMasteryAcademyView'));
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
const PaymentCallbackView = React.lazy(() => import('../PaymentCallbackView'));
const SearchResultsView = React.lazy(() => import('../SearchResultsView'));
const PublicStoryView = React.lazy(() => import('../seo/PublicStoryView')); // New Import
const CampaignLandingView = React.lazy(() => import('../CampaignLandingView'));
const TermsView = React.lazy(() => import('../TermsView'));

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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Check for payment callback in URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const viewParam = urlParams.get('view');
        if (viewParam === 'PAYMENT_CALLBACK') {
            dispatch({ type: 'SET_VIEW', payload: View.PAYMENT_CALLBACK });
        }
        // Handle direct link to story (Programmatic SEO)
        if (viewParam === 'STORY') {
            dispatch({ type: 'SET_VIEW', payload: View.PublicStory });
        }
    }, [dispatch]);

    const onAddProjectUpdate = (projectId: string, update: { title: string, description: string }) => {
        console.log('Project Update:', projectId, update);
    };

    // Render logic based on view
    const renderView = () => {
        switch (currentView) {
            case View.Home: return <HomeView />;
            case View.HerosJourney: return <HerosJourneyView />;
            case View.Corporate: return <CorporateView />;
            case View.OurGrove: return <OurGroveView />;
            case View.MeaningCoachingScholarship: return <MeaningCoachingScholarshipView />;
            case View.CompassUnlockChat: return <CompassUnlockChatView />;
            case View.PathOfMeaning: return <PathOfMeaningView />;
            case View.CommunityHub: return <CommunityHubView />;
            case View.AdminDashboard:
                // SECURITY GUARD: Only render for admins
                console.log('🛡️ Admin Guard Check:', { user, isAdmin: user?.isAdmin });
                if (!user || !user.isAdmin) {
                    // Redirect to home or show denied message
                    // Ideally we should dispatch SET_VIEW to Home, but returning HomeView works for now
                    return <HomeView />;
                }
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
            case View.AIPortal:
            case View.AI_CREATION_STUDIO: return <AIStudioView />;
            case View.AutoCEO:
                // SECURITY GUARD
                if (!user || !user.isAdmin) return <HomeView />;
                return <AutoCEOView />;
            case View.AI_ACADEMY: return <AICreationStudio initialTab="academy" />;
            case View.MeaningCompanion: return <MeaningCompanionView />;
            case View.ENGLISH_ACADEMY: return <EnglishAcademyView />;
            case View.ENGLISH_PLACEMENT_TEST: return <EnglishPlacementTestView />;
            case View.AI_CONVERSATION_PARTNER: return <AIConversationPartnerView />;
            case View.VOCABULARY_BUILDER: return <VocabularyBuilderView />;
            case View.BUSINESS_ACADEMY: return <BusinessAcademyView />;
            case View.LIFE_MASTERY_ACADEMY: return <LifeMasteryAcademyView user={user} />;
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
            case View.PAYMENT_CALLBACK: return <PaymentCallbackView />;
            case View.SearchResults: return <SearchResultsView />;
            case View.PublicStory: return <PublicStoryView />; // New route
            case View.CampaignLanding: return <CampaignLandingView />;
            case View.Terms: return <TermsView />;
            case View['living-heritage']: return <div>Living Heritage View (Data Needed)</div>;
            case View['digital-heritage-architect']: return <DigitalHeritageArchitectPage />;
            case View['garden-of-heroes']:
                return <GardenOfHeroesPage allUsers={allUsers} currentUser={user} onLoginClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })} />;
            case View['meaning-coach']:
                return user ? <MeaningCoachPage user={user} onSaveHistory={() => { }} onUpdateProfile={(u) => dispatch({ type: 'UPDATE_USER', payload: u })} /> : <HomeView />;
            case View['community-projects']:
                return <CommunityProjectsPage user={user} allCommunityProjects={[]} onContribute={() => { }} onLoginClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })} />;
            default: return <HomeView />;
        }
    };

    return (
        <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center bg-gray-900"><LoadingSpinner /></div>}>
            {mounted ? renderView() : <HomeView />}
        </Suspense>
    );
};

export default MainContent;
