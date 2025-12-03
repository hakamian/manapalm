
import React, { useState } from 'react';
import { User } from '../types';
import Modal from './Modal';
import { SparklesIcon, StarIcon, CheckCircleIcon, ArrowLeftIcon, CalendarDaysIcon, MicrophoneIcon, UserCircleIcon } from './icons';

interface MentorshipBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

type Step = 'intro' | 'assessment' | 'schedule' | 'success';

const MentorshipBookingModal: React.FC<MentorshipBookingModalProps> = ({ isOpen, onClose, user }) => {
    const [step, setStep] = useState<Step>('intro');
    const [goal, setGoal] = useState('');
    const [commitment, setCommitment] = useState(5); // 1-10 scale
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    // Mock slots - in a real app, fetch from API
    const availableSlots = [
        { id: 'slot1', day: 'شنبه', time: '۱۶:۰۰ - ۱۶:۳۰', status: 'available' },
        { id: 'slot2', day: 'دوشنبه', time: '۱۷:۳۰ - ۱۸:۰۰', status: 'available' },
        { id: 'slot3', day: 'چهارشنبه', time: '۱۵:۰۰ - ۱۵:۳۰', status: 'limited' },
    ];

    const handleNext = () => {
        if (step === 'intro') setStep('assessment');
        else if (step === 'assessment') setStep('schedule');
        else if (step === 'schedule') setStep('success');
    };

    const handleBack = () => {
        if (step === 'assessment') setStep('intro');
        else if (step === 'schedule') setStep('assessment');
    };

    const renderContent = () => {
        switch (step) {
            case 'intro':
                return (
                    <div className="text-center space-y-6">
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-pink-600 rounded-full animate-pulse blur-lg opacity-50"></div>
                            <img src="https://picsum.photos/seed/sayitenglish-profile/200/200" alt="Say It English" className="relative z-10 w-full h-full rounded-full object-cover border-4 border-gray-800" />
                            <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-gray-800 flex items-center gap-1">
                                <CheckCircleIcon className="w-3 h-3" />
                                <span>Native</span>
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-pink-200">
                                درخواست عضویت در حلقه خصوصی
                            </h2>
                            <p className="text-sm text-gray-400 mt-2">
                                تجربه مکالمه با استانداردهای واقعی آمریکا
                            </p>
                        </div>

                        <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600 text-right text-sm space-y-3">
                            <p className="flex items-center gap-2 text-gray-200">
                                <StarIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                <span>این یک کلاس معمولی نیست؛ یک <strong>جلسه کوچینگ زبانی</strong> است.</span>
                            </p>
                            <p className="flex items-center gap-2 text-gray-200">
                                <MicrophoneIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                <span>مناسب کسانی که می‌خواهند <strong>بدون لهجه و ترس</strong> صحبت کنند.</span>
                            </p>
                            <p className="flex items-center gap-2 text-gray-200">
                                <UserCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                                <span>ظرفیت پذیرش در هر ماه: <strong>فقط ۵ نفر</strong></span>
                            </p>
                        </div>

                        <button onClick={handleNext} className="w-full bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                            <span>بررسی شرایط من</span>
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                    </div>
                );

            case 'assessment':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white">ارزیابی اولیه</h3>
                            <p className="text-xs text-gray-400 mt-1">برای تضمین کیفیت، باید مطمئن شویم این دوره برای شما مناسب است.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">بزرگترین هدف زبانی شما چیست؟</label>
                                <textarea 
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 outline-none text-white"
                                    rows={3}
                                    placeholder="مثلاً: می‌خواهم در جلسات کاری با اعتماد به نفس صحبت کنم..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">میزان تعهد شما (۱ تا ۱۰)</label>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="10" 
                                    value={commitment} 
                                    onChange={(e) => setCommitment(Number(e.target.value))}
                                    className="w-full accent-amber-500" 
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>تفریحی</span>
                                    <span className="text-amber-400 font-bold">{commitment}</span>
                                    <span>جدی و مصمم</span>
                                </div>
                            </div>
                            
                            {!user.englishAcademyLevel && (
                                <div className="bg-yellow-900/20 border border-yellow-600/30 p-3 rounded-lg flex gap-3 items-start">
                                    <div className="bg-yellow-600/20 p-1 rounded">⚠️</div>
                                    <p className="text-xs text-yellow-200">
                                        توصیه می‌کنیم قبل از درخواست، <button className="underline font-bold">آزمون تعیین سطح هوشمند</button> را در آکادمی انجام دهید.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button onClick={handleBack} className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">بازگشت</button>
                            <button 
                                onClick={handleNext} 
                                disabled={!goal.trim() || commitment < 7}
                                className="flex-grow bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                {commitment < 7 ? 'تعهد باید بالا باشد' : 'مشاهده زمان‌های خالی'}
                            </button>
                        </div>
                    </div>
                );

            case 'schedule':
                return (
                    <div className="space-y-6">
                         <div className="text-center">
                            <h3 className="text-xl font-bold text-white">زمان‌های در دسترس (این هفته)</h3>
                            <p className="text-xs text-gray-400 mt-1">زمان مصاحبه ورودی خود را انتخاب کنید.</p>
                        </div>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {availableSlots.map(slot => (
                                <button
                                    key={slot.id}
                                    onClick={() => setSelectedSlot(slot.id)}
                                    className={`w-full flex justify-between items-center p-4 rounded-xl border-2 transition-all ${
                                        selectedSlot === slot.id 
                                        ? 'border-amber-500 bg-amber-900/20' 
                                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <CalendarDaysIcon className={`w-5 h-5 ${selectedSlot === slot.id ? 'text-amber-400' : 'text-gray-500'}`} />
                                        <span className="font-bold text-white">{slot.day}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-300 dir-ltr">{slot.time}</span>
                                        {slot.status === 'limited' && <span className="text-[10px] bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full">فقط ۱ جا</span>}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3 pt-4">
                             <button onClick={handleBack} className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">بازگشت</button>
                            <button 
                                onClick={handleNext}
                                disabled={!selectedSlot}
                                className="flex-grow bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2"
                            >
                                ثبت نهایی درخواست
                            </button>
                        </div>
                    </div>
                );
            
            case 'success':
                return (
                     <div className="text-center space-y-6 py-4">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                            <CheckCircleIcon className="w-12 h-12 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">درخواست شما دریافت شد!</h3>
                            <p className="text-gray-300 mt-3 leading-relaxed">
                                اطلاعات شما برای تیم بررسی ارسال شد. <br/>
                                در صورت تایید، <strong>لینک پرداخت و ورود به جلسه</strong> از طریق پیامک برای شما ارسال خواهد شد.
                            </p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-sm text-gray-400">
                            <p>زمان انتخابی شما برای مصاحبه رزرو شده است.</p>
                        </div>
                        <button onClick={onClose} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors">
                            بازگشت به آکادمی
                        </button>
                    </div>
                );
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="w-[90vw] max-w-md p-2">
                {renderContent()}
            </div>
        </Modal>
    );
};

export default MentorshipBookingModal;
