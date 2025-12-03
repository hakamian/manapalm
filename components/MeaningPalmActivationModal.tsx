
import React from 'react';
import { User, View } from '../types';
import { useAppDispatch } from '../AppContext';
import { XMarkIcon, LockClosedIcon, CheckCircleIcon, SparklesIcon, SproutIcon, TreeIcon, BookOpenIcon, UsersIcon, CompassIcon } from './icons';

interface ChecklistItemProps {
  isComplete: boolean;
  title: string;
  description: string;
  cta?: { label: string; action: () => void };
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ isComplete, title, description, cta }) => (
    <div className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${isComplete ? 'bg-green-900/30' : 'bg-gray-700/50'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${isComplete ? 'bg-green-500' : 'bg-gray-600'}`}>
            {isComplete ? <CheckCircleIcon className="w-5 h-5 text-white" /> : <div className="w-2 h-2 bg-gray-400 rounded-full"></div>}
        </div>
        <div className="flex-grow">
            <h4 className={`font-bold ${isComplete ? 'text-green-300' : 'text-white'}`}>{title}</h4>
            <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
        {!isComplete && cta && (
            <button onClick={cta.action} className="text-sm py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md transition-colors flex-shrink-0">
                {cta.label}
            </button>
        )}
    </div>
);


interface MeaningPalmActivationModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

const MeaningPalmActivationModal: React.FC<MeaningPalmActivationModalProps> = ({ isOpen, onClose, user }) => {
    const dispatch = useAppDispatch();
    
    if (!isOpen || !user) return null;

    const handleNavigate = (view: View, tab?: string) => {
        if (tab) {
            dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: tab });
        } else {
            dispatch({ type: 'SET_VIEW', payload: view });
        }
        onClose();
    };

    const handleUnlock = () => {
        dispatch({ type: 'UNLOCK_MEANING_PALM' });
    };

    // --- Calculate progress ---
    const hasEnoughPoints = user.points >= 2000;
    const completedTests = [user.discReport, user.enneagramReport, user.strengthsReport, user.ikigaiReport].filter(Boolean).length;
    const hasCompletedTests = completedTests >= 2;
    const hasPlantedForOthers = user.timeline?.some(e => e.type === 'palm_planted' && e.details.recipient && user.fullName && e.details.recipient !== user.fullName) || false;
    const journalEntryCount = user.timeline?.filter(e => e.type === 'reflection').length || 0;
    const hasEnoughEntries = journalEntryCount >= 10;
    const compassChatDuration = user.compassChatDuration || 0;
    const hasSufficientChat = compassChatDuration >= 600; // 10 minutes

    const allCommitmentMet = hasEnoughPoints && hasCompletedTests && hasPlantedForOthers && hasEnoughEntries && hasSufficientChat;

    const manaCost = 15000;
    const hasEnoughMana = user.manaPoints >= manaCost;

    const checklistItems = [
        {
            isComplete: hasEnoughPoints,
            title: `رسیدن به سطح «درخت جوان» (${user.points.toLocaleString('fa-IR')}/۲,۰۰۰)`,
            description: 'این سطح نشان می‌دهد شما با بخش‌های مختلف پلتفرم آشنا شده‌اید.',
            cta: { label: 'کسب امتیاز', action: () => handleNavigate(View.UserProfile, 'gamification') }
        },
        {
            isComplete: hasCompletedTests,
            title: `تکمیل حداقل دو آزمون خودشناسی (${completedTests}/۲)`,
            description: 'این شرط تضمین می‌کند شما در مسیر خودشناسی قدم برداشته‌اید.',
            cta: { label: 'رفتن به آزمون‌ها', action: () => handleNavigate(View.HerosJourney) }
        },
        {
            isComplete: hasPlantedForOthers,
            title: 'کاشت حداقل یک نخل برای دیگران',
            description: 'این کار، روحیه بخشندگی و توجه به دیگران را در شما نشان می‌دهد.',
            cta: { label: 'کاشت نخل', action: () => { dispatch({ type: 'START_PLANTING_FLOW' }); onClose(); } }
        },
        {
            isComplete: hasEnoughEntries,
            title: `ثبت حداقل ۱۰ تامل (${journalEntryCount}/۱۰)`,
            description: 'این شرط، تعهد شما به تامل درونی و ثبت مستمر افکار را نشان می‌دهد.',
            cta: { label: 'رفتن به خلوت روزانه', action: () => handleNavigate(View.DailyOasis) }
        },
        {
            isComplete: hasSufficientChat,
            title: `گفتگو با قطب‌نمای معنا (${Math.floor(compassChatDuration / 60)}/۱۰ دقیقه)`,
            description: 'این گفتگو به شما کمک می‌کند تا ارزش‌های اصلی خود را برای کاشت این نخل ویژه شفاف کنید.',
            cta: { label: 'شروع گفتگو', action: () => handleNavigate(View.CompassUnlockChat) }
        }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-white" aria-label="Close"><XMarkIcon /></button>
                
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center justify-center gap-2"><LockClosedIcon className="w-7 h-7 text-yellow-300"/> مسیر فعال‌سازی نخل معنا</h2>
                    <p className="text-gray-400 mt-2 max-w-lg mx-auto">«نخل معنا» یک دستاورد است. برای کاشت آن، باید صلاحیت و تعهد خود را به این مسیر نشان دهید.</p>
                </div>
                
                <div className="overflow-y-auto pr-2 space-y-8">
                    {/* Path of Commitment */}
                    <div>
                        <h3 className="text-xl font-bold text-green-400 mb-4">مسیر تعهد</h3>
                        <div className="space-y-3">
                            {checklistItems.map(item => <ChecklistItem key={item.title} {...item} />)}
                        </div>
                         <p className="text-xs text-gray-500 mt-4 text-center">
                            نکته: در موارد خاص، دسترسی به این نخل می‌تواند با تایید ادمین و مشورت هوشمانا برای کاربران متعهد باز شود.
                        </p>
                    </div>

                    {/* Path of Value */}
                    <div>
                        <h3 className="text-xl font-bold text-yellow-400 mb-4">مسیر ارزش (میان‌بُر)</h3>
                        <div className="bg-gray-700/50 p-6 rounded-lg text-center">
                            <p className="text-gray-300 mb-4">با پرداخت <strong className="text-yellow-300">{manaCost.toLocaleString('fa-IR')} امتیاز معنا</strong>، این مسیر را میان‌بر بزنید و نخل معنا را فعال کنید.</p>
                            <p className="text-sm mb-4">موجودی شما: <span className="font-bold text-indigo-300">{user.manaPoints.toLocaleString('fa-IR')}</span> امتیاز معنا</p>
                            <button onClick={handleUnlock} disabled={!hasEnoughMana} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2 mx-auto">
                                <SparklesIcon className="w-5 h-5"/>
                                {hasEnoughMana ? 'فعال‌سازی با امتیاز معنا' : 'امتیاز معنا کافی نیست'}
                            </button>
                            {!hasEnoughMana && (
                                <button 
                                    onClick={() => handleNavigate(View.UserProfile, 'gamification')} 
                                    className="text-sm text-amber-300 hover:text-amber-200 underline mt-4"
                                >
                                    چگونه امتیاز معنا کسب کنم؟
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeaningPalmActivationModal;
