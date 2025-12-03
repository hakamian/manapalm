import React, { useState } from 'react';
import { User, CommunityProject } from '../types.ts';
import Modal from './Modal.tsx';
import { HandshakeIcon, StarIcon } from './icons.tsx';

interface ContributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: CommunityProject;
    user: User;
    onContribute: (projectId: string, amount: number, type: 'points' | 'purchase') => void;
}

const ContributionModal: React.FC<ContributionModalProps> = ({ isOpen, onClose, project, user, onContribute }) => {
    const [contributionType, setContributionType] = useState<'points' | 'purchase'>('purchase');
    const [pointsAmount, setPointsAmount] = useState(100);
    const [purchaseAmount, setPurchaseAmount] = useState(200000); // price of one community palm

    const pointsPerPalm = 100;
    const palmsFromPoints = Math.floor(pointsAmount / pointsPerPalm);
    const palmsFromPurchase = Math.round(purchaseAmount / 200000);

    const handleContribute = () => {
        if (contributionType === 'points') {
            onContribute(project.id, pointsAmount, 'points');
        } else {
            onContribute(project.id, purchaseAmount, 'purchase');
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4 w-full max-w-lg text-right">
                <h3 className="text-xl font-bold mb-2">مشارکت در پروژه «{project.title}»</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">روش مشارکت خود را انتخاب کنید.</p>

                <div className="w-full bg-stone-100 dark:bg-stone-700/50 p-1 rounded-full flex mb-6">
                    <button onClick={() => setContributionType('purchase')} className={`w-1/2 p-2 rounded-full font-semibold transition-colors ${contributionType === 'purchase' ? 'bg-white dark:bg-stone-800 text-amber-700 dark:text-amber-300 shadow' : 'text-stone-500 dark:text-stone-300'}`}>خرید نخل همیاری</button>
                    <button onClick={() => setContributionType('points')} className={`w-1/2 p-2 rounded-full font-semibold transition-colors ${contributionType === 'points' ? 'bg-white dark:bg-stone-800 text-amber-700 dark:text-amber-300 shadow' : 'text-stone-500 dark:text-stone-300'}`}>اهدای امتیاز</button>
                </div>
                
                {contributionType === 'purchase' ? (
                    <div className="space-y-4">
                        <p className="text-sm text-center">هر نخل همیاری معادل ۲۰۰,۰۰۰ تومان است.</p>
                        <div className="flex items-center justify-center gap-4">
                             <button onClick={() => setPurchaseAmount(p => Math.max(200000, p - 200000))} className="w-10 h-10 border rounded-full font-bold text-lg">-</button>
                             <span className="text-xl font-bold w-40 text-center">{purchaseAmount.toLocaleString('fa-IR')} تومان</span>
                             <button onClick={() => setPurchaseAmount(p => p + 200000)} className="w-10 h-10 border rounded-full font-bold text-lg">+</button>
                        </div>
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="font-semibold text-green-800 dark:text-green-200">معادل {palmsFromPurchase.toLocaleString('fa-IR')} نخل</p>
                        </div>
                    </div>
                ) : (
                     <div className="space-y-4">
                        <p className="text-sm text-center">هر ۱۰۰ امتیاز معادل ۱ نخل همیاری است.</p>
                        <p className="text-xs text-center text-stone-500">موجودی شما: {user.points.toLocaleString('fa-IR')} امتیاز</p>
                        <div className="flex items-center justify-center gap-4">
                             <input
                                type="range"
                                min="100"
                                max={user.points}
                                step="100"
                                value={pointsAmount}
                                onChange={(e) => setPointsAmount(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                        <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <p className="font-semibold text-amber-800 dark:text-amber-300">{pointsAmount.toLocaleString('fa-IR')} امتیاز = {palmsFromPoints.toLocaleString('fa-IR')} نخل</p>
                        </div>
                    </div>
                )}


                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600 rounded-lg transition-colors">
                        انصراف
                    </button>
                    <button 
                        onClick={handleContribute} 
                        className="px-6 py-2 font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors flex items-center gap-2"
                        disabled={(contributionType === 'points' && user.points < 100)}
                    >
                        <HandshakeIcon className="w-5 h-5"/>
                        تایید مشارکت
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ContributionModal;