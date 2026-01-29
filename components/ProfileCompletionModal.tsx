import React, { useEffect, useState } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { MapPinIcon, LockClosedIcon, XMarkIcon } from './icons';

const ProfileCompletionModal: React.FC = () => {
    const { user, isAuthModalOpen } = useAppState();
    const dispatch = useAppDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        // Trigger logic:
        // 1. User must be logged in
        // 2. Auth modal must be closed
        // 3. Check for specific missing fields
        // 4. Do not show if user explicitly dismissed it recently (sessionStorage?) -> User requirement: "Skip" button.

        if (user && !isAuthModalOpen) {
            const hasAddress = user.addresses && user.addresses.length > 0;
            // Best effort check for password existence. 
            // Since we can't request 'has_password' from Supabase easily, we rely on a metadata flag 'password_set'
            // or we show it for everyone who hasn't dismissed it.
            // For now, let's assume we show it if 'metadata.password_set' is falsy.
            // If they registered via password, we should have set this flag.

            // NOTE: For existing users who logged in with OTP but have no password set in metadata,
            // we show the prompt. 
            const hasPasswordSet = (user as any).password_set === true;

            // If user has both, close.
            if (hasAddress && hasPasswordSet) {
                setIsOpen(false);
                return;
            }

            // Check session storage for skip
            const skipped = sessionStorage.getItem('profile_completion_skipped_v1');
            if (skipped === 'true') {
                return;
            }

            // Show modal
            const timer = setTimeout(() => setIsOpen(true), 1500); // Small delay after login
            return () => clearTimeout(timer);
        } else {
            setIsOpen(false);
        }
    }, [user, isAuthModalOpen]);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
        } else {
            const timer = setTimeout(() => setShouldRender(false), 300); // Wait for fade out
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleSkip = () => {
        setIsOpen(false);
        sessionStorage.setItem('profile_completion_skipped_v1', 'true');
    };

    const navigateTo = (tab: string) => {
        setIsOpen(false);
        dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: tab });
    };

    if (!shouldRender || !user) return null;

    const hasAddress = user.addresses && user.addresses.length > 0;
    const hasPasswordSet = (user as any).password_set === true;

    // Double check to prevent flash if data updates while open
    if (hasAddress && hasPasswordSet && isOpen) {
        // Effect will close it, but we can early return null here if we want instant hide
    }

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={handleSkip}
            ></div>

            {/* Modal Content */}
            <div className={`relative w-full max-w-lg bg-gray-900 border border-white/10 p-6 rounded-2xl shadow-xl transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold leading-6 text-white text-right">
                        تکمیل اطلاعات حساب کاربری
                    </h3>
                    <button onClick={handleSkip} className="text-gray-400 hover:text-white transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <p className="text-gray-300 mb-8 leading-relaxed text-right">
                    کاربر گرامی، برای استفاده از تمام امکانات نخلستان (خرید و امنیت)، لطفاً موارد زیر را تکمیل کنید.
                </p>

                <div className="space-y-4">
                    {/* Link for Address */}
                    {!hasAddress && (
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group" dir="rtl">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    <MapPinIcon className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <h4 className="font-bold text-white mb-1">ثبت آدرس ارسالی</h4>
                                    <p className="text-xs text-gray-400">برای خرید از بازارچه الزامی است</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigateTo('addresses')}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap"
                            >
                                ثبت آدرس
                            </button>
                        </div>
                    )}

                    {/* Link for Password */}
                    {!hasPasswordSet && (
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group" dir="rtl">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                    <LockClosedIcon className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <h4 className="font-bold text-white mb-1">تعیین رمز عبور</h4>
                                    <p className="text-xs text-gray-400">برای ورود بدون نیاز به موبایل</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigateTo('security')}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap"
                            >
                                تعیین رمز
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                    <button
                        onClick={handleSkip}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        بعداً انجام می‌دهم
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileCompletionModal;