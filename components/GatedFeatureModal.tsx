
import React from 'react';
import { Page, User, View } from '../types.ts';
import Modal from './Modal.tsx';
import { ShieldKeyholeIcon, CompassIcon, PlusIcon, SparklesIcon } from './icons.tsx';

interface GatedFeatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    featureName: string;
    pointsRequirement: number;
    onNavigate: (page: Page) => void;
}

const ActionCard: React.FC<{ icon: React.FC<any>, title: string, description: string, onClick: () => void }> = ({ icon: Icon, title, description, onClick }) => (
    <div className="text-right p-3 bg-stone-100 dark:bg-stone-700/50 rounded-lg flex items-center gap-3">
        <Icon className="w-8 h-8 text-amber-500 flex-shrink-0" />
        <div className="flex-grow">
            <h4 className="font-bold">{title}</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">{description}</p>
        </div>
        <button onClick={onClick} className="bg-white dark:bg-stone-600 px-3 py-1 rounded-md text-sm font-semibold hover:bg-stone-200 dark:hover:bg-stone-500">برو</button>
    </div>
);

const GatedFeatureModal: React.FC<GatedFeatureModalProps> = ({ isOpen, onClose, currentUser, featureName, pointsRequirement, onNavigate }) => {
    
    const progress = Math.min((currentUser.points / pointsRequirement) * 100, 100);

    const handleNavigation = (page: Page) => {
        onNavigate(page);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 text-center max-w-md">
                <ShieldKeyholeIcon className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">قفل «{featureName}» را باز کنید</h2>
                <p className="my-4 text-stone-600 dark:text-stone-300">
                    برای دسترسی به این قابلیت ویژه، به <span className="font-bold">{pointsRequirement.toLocaleString('fa-IR')}</span> امتیاز نیاز دارید. شما در مسیر درستی هستید!
                </p>
                
                <div className="my-6">
                    <div className="flex justify-between text-sm font-semibold mb-1">
                        <span>امتیاز شما</span>
                        <span>{currentUser.points.toLocaleString('fa-IR')} / {pointsRequirement.toLocaleString('fa-IR')}</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-3">
                        <div 
                            className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="font-bold text-lg">راه‌های سریع برای کسب امتیاز:</h4>
                    <ActionCard 
                        icon={PlusIcon} 
                        title="کاشتن یک میراث جدید" 
                        description="با ثبت یک خاطره یا تصمیم، امتیاز کسب کنید."
                        onClick={() => handleNavigation(View.HallOfHeritage)}
                    />
                    <ActionCard 
                        icon={CompassIcon} 
                        title="ادامه سفر قهرمانی" 
                        description="با تکمیل مراحل مسیر خود, به هدف نزدیک‌تر شوید."
                        onClick={() => handleNavigation(View.PathOfMeaning)}
                    />
                    <ActionCard 
                        icon={SparklesIcon} 
                        title="خلق یک اثر هنری" 
                        description="از آزمایشگاه معنا استفاده کنید و امتیاز خلاقیت بگیرید."
                        onClick={() => handleNavigation(View['ai-tools'])}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default GatedFeatureModal;
