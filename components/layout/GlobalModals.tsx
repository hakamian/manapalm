
import React from 'react';
import { useAppState, useAppDispatch } from '../../AppContext';
import { View } from '../../types';

// Import Modals
import AuthModal from '../AuthModal';
import ShoppingCart from '../ShoppingCart';
import OrderSuccessModal from '../OrderSuccessModal';
import WelcomeModal from '../WelcomeModal';
import PointsAwardedToast from '../PointsAwardedToast';
import PalmSelectionModal from '../PalmSelectionModal';
import DeedPersonalizationModal from '../DeedPersonalizationModal';
import CompanionUnlockModal from '../CompanionUnlockModal';
import CompanionTrialModal from '../CompanionTrialModal';
import ReflectionAnalysisUnlockModal from '../ReflectionAnalysisUnlockModal';
import AmbassadorUnlockModal from '../AmbassadorUnlockModal';
import SocialPostGeneratorModal from '../SocialPostGeneratorModal';
import MeaningPalmActivationModal from '../MeaningPalmActivationModal';
import FutureVisionModal from '../FutureVisionModal';
import VoiceOfPalmModal from '../VoiceOfPalmModal';

interface GlobalModalsProps {
    onLoginSuccess: (user: { phone?: string; email?: string; fullName?: string }) => void;
}

const GlobalModals: React.FC<GlobalModalsProps> = ({ onLoginSuccess }) => {
    const { 
        isAuthModalOpen, 
        isCartOpen, 
        isOrderSuccessModalOpen, 
        lastOrderDeeds, 
        lastOrderPointsEarned,
        isWelcomeModalOpen, 
        user, 
        pointsToast, 
        isPalmSelectionModalOpen, 
        palmTypes,
        isDeedPersonalizationModalOpen, 
        selectedPalmForPersonalization,
        isCompanionUnlockModalOpen,
        isCompanionTrialModalOpen,
        isReflectionAnalysisUnlockModalOpen,
        isAmbassadorUnlockModalOpen,
        isSocialPostGeneratorModalOpen,
        socialPostGeneratorData,
        isMeaningPalmActivationModalOpen,
        isFutureVisionModalOpen,
        futureVisionDeed,
        isVoiceOfPalmModalOpen,
        voiceOfPalmDeed
    } = useAppState();

    const dispatch = useAppDispatch();

    return (
        <>
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: false })}
                onLoginSuccess={onLoginSuccess}
            />
            <ShoppingCart />
            <OrderSuccessModal
                isOpen={isOrderSuccessModalOpen}
                onClose={() => dispatch({ type: 'CLOSE_DEED_MODALS' })}
                deeds={lastOrderDeeds}
                pointsEarned={lastOrderPointsEarned}
                onViewDeeds={() => {
                    dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: 'timeline' });
                    dispatch({ type: 'CLOSE_DEED_MODALS' });
                }}
            />
             <WelcomeModal
                isOpen={isWelcomeModalOpen}
                onClose={() => dispatch({ type: 'SET_WELCOME_MODAL', payload: false })}
                onGoToProfile={() => {
                    dispatch({ type: 'SET_WELCOME_MODAL', payload: false });
                    dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: 'profile' });
                }}
                userName={user?.fullName}
            />
            {pointsToast && (
                <PointsAwardedToast
                    points={pointsToast.points}
                    action={pointsToast.action}
                    onClose={() => dispatch({ type: 'HIDE_POINTS_TOAST' })}
                />
            )}
             <PalmSelectionModal
                isOpen={isPalmSelectionModalOpen}
                onClose={() => dispatch({ type: 'CLOSE_DEED_MODALS' })}
                palmTypes={palmTypes}
                onSelectPalm={(palm) => dispatch({ type: 'SELECT_PALM_FOR_DEED', payload: palm })}
                user={user}
            />
            <DeedPersonalizationModal
                isOpen={isDeedPersonalizationModalOpen}
                onClose={() => dispatch({ type: 'CLOSE_DEED_MODALS' })}
                palm={selectedPalmForPersonalization}
                user={user}
                onConfirm={(palm, quantity, deedDetails, selectedPlan) => dispatch({ type: 'PERSONALIZE_DEED_AND_ADD_TO_CART', payload: { palm, quantity, deedDetails, selectedPlan } })}
            />
            <CompanionUnlockModal
                isOpen={isCompanionUnlockModalOpen}
                onClose={() => dispatch({ type: 'SHOW_COMPANION_UNLOCK_MODAL', payload: false })}
                onUnlock={() => dispatch({ type: 'START_COMPANION_PURCHASE' })}
            />
            <CompanionTrialModal
                isOpen={isCompanionTrialModalOpen}
                onClose={() => dispatch({ type: 'SHOW_COMPANION_TRIAL_MODAL', payload: false })}
                onStart={() => {
                    dispatch({ type: 'SHOW_COMPANION_TRIAL_MODAL', payload: false });
                    dispatch({ type: 'SET_VIEW', payload: View.MeaningCompanion });
                }}
            />
            <ReflectionAnalysisUnlockModal
                isOpen={isReflectionAnalysisUnlockModalOpen}
                onClose={() => dispatch({ type: 'SHOW_REFLECTION_UNLOCK_MODAL', payload: false })}
                onUnlock={() => dispatch({ type: 'START_REFLECTION_PURCHASE' })}
            />
            <AmbassadorUnlockModal
                isOpen={isAmbassadorUnlockModalOpen}
                onClose={() => dispatch({ type: 'SHOW_AMBASSADOR_UNLOCK_MODAL', payload: false })}
                onUnlock={() => dispatch({ type: 'START_AMBASSADOR_PURCHASE' })}
            />
            <SocialPostGeneratorModal
                isOpen={isSocialPostGeneratorModalOpen}
                onClose={() => dispatch({ type: 'SHOW_SOCIAL_POST_GENERATOR_MODAL', payload: { isOpen: false, deed: null } })}
                deed={socialPostGeneratorData.deed}
            />
            <MeaningPalmActivationModal
                isOpen={isMeaningPalmActivationModalOpen}
                onClose={() => dispatch({ type: 'TOGGLE_MEANING_PALM_ACTIVATION_MODAL', payload: false })}
                user={user}
            />
             {futureVisionDeed && (
                <FutureVisionModal
                    isOpen={isFutureVisionModalOpen}
                    onClose={() => dispatch({ type: 'CLOSE_FUTURE_VISION_MODAL' })}
                    deed={futureVisionDeed}
                />
            )}
            {voiceOfPalmDeed && (
                <VoiceOfPalmModal
                    isOpen={isVoiceOfPalmModalOpen}
                    onClose={() => dispatch({ type: 'CLOSE_VOICE_OF_PALM_MODAL' })}
                    deed={voiceOfPalmDeed}
                />
            )}
        </>
    );
};

export default GlobalModals;
