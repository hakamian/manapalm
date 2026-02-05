'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { sendOTP, verifyOTP } from '../services/otp';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (user: { phone?: string; email?: string; fullName?: string }) => void;
}

type AuthMode = 'otp' | 'password';
type AuthStep = 'phone_entry' | 'otp_verify' | 'password_entry' | 'set_password' | 'register_password';

const OTP_LENGTH = 5;

// Modern OTP Input Component with square boxes - RTL compatible
function OTPInput({
    value,
    onChange,
    onComplete,
    disabled = false
}: {
    value: string;
    onChange: (val: string) => void;
    onComplete: (code?: string) => void;
    disabled?: boolean;
}) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));

    // Sync external value to internal state
    useEffect(() => {
        const digits = value.split('').slice(0, OTP_LENGTH);
        const padded = [...digits, ...Array(OTP_LENGTH - digits.length).fill('')];
        setOtpDigits(padded);
    }, [value]);

    // Web OTP API - Auto-read SMS on mobile
    useEffect(() => {
        if ('OTPCredential' in window) {
            const ac = new AbortController();

            navigator.credentials.get({
                // @ts-ignore - OTP is valid but not in TS types
                otp: { transport: ['sms'] },
                signal: ac.signal
            }).then((otp: any) => {
                if (otp?.code) {
                    const code = otp.code.replace(/\D/g, '').slice(0, OTP_LENGTH);
                    onChange(code);
                    if (code.length === OTP_LENGTH) {
                        setTimeout(() => onComplete(code), 100);
                    }
                }
            }).catch(() => {
                // User declined or API not available
            });

            return () => ac.abort();
        }
    }, [onChange, onComplete]);

    // Focus first input on mount (rightmost in RTL visual, but index 0 in logical order)
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = useCallback((index: number, digit: string) => {
        // Only allow single digit
        const cleanDigit = digit.replace(/\D/g, '').slice(-1);

        const newDigits = [...otpDigits];
        newDigits[index] = cleanDigit;
        setOtpDigits(newDigits);

        const newValue = newDigits.join('');
        onChange(newValue);

        // Move to next input (visually left in RTL, but index + 1)
        if (cleanDigit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when last digit is entered
        if (cleanDigit && index === OTP_LENGTH - 1 && newValue.length === OTP_LENGTH) {
            setTimeout(() => onComplete(newValue), 150);
        }
    }, [otpDigits, onChange, onComplete]);

    const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (!otpDigits[index] && index > 0) {
                // Move to previous input (visually right in RTL)
                inputRefs.current[index - 1]?.focus();
                const newDigits = [...otpDigits];
                newDigits[index - 1] = '';
                setOtpDigits(newDigits);
                onChange(newDigits.join(''));
            }
        } else if (e.key === 'ArrowRight' && index > 0) {
            // In RTL, ArrowRight goes to previous logical index (visually right)
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowLeft' && index < OTP_LENGTH - 1) {
            // In RTL, ArrowLeft goes to next logical index (visually left)
            inputRefs.current[index + 1]?.focus();
        }
    }, [otpDigits, onChange]);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        onChange(pastedData);

        if (pastedData.length === OTP_LENGTH) {
            inputRefs.current[OTP_LENGTH - 1]?.focus();
            setTimeout(() => onComplete(pastedData), 150);
        } else {
            inputRefs.current[pastedData.length]?.focus();
        }
    }, [onChange, onComplete]);

    return (
        <div className="flex flex-row justify-center gap-2 sm:gap-3" dir="ltr" onPaste={handlePaste}>
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    dir="ltr"
                    value={otpDigits[index] || ''}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={disabled}
                    className={`
            w-12 h-14 sm:w-14 sm:h-16
            text-center text-2xl sm:text-3xl font-bold
            bg-white/5 border-2 rounded-xl
            text-white font-mono
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
            ${otpDigits[index] ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/20'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/40'}
          `}
                    style={{
                        caretColor: 'transparent',
                    }}
                />
            ))}
        </div>
    );
}

import {
    XMarkIcon, GoogleIcon, PhoneIcon, LockClosedIcon,
    SparklesIcon, UserPlusIcon, HeartIcon, ChartBarIcon,
    EyeIcon, EyeSlashIcon
} from './icons';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [mode, setMode] = useState<AuthMode>('otp');
    const [step, setStep] = useState<AuthStep>('phone_entry');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setStep('phone_entry');
            setError('');
            setLoading(false);
            setPhone('');
            setOtp('');
            setPassword('');
        }
    }, [isOpen]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleGoogleLogin = async () => {
        if (!supabase) return;
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/` },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'خطا در ورود با گوگل');
        }
    };

    const handleSendOTP = async () => {
        if (phone.length < 10) {
            setError('شماره موبایل نامعتبر است');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await sendOTP(phone);
            if (res.success) {
                setStep('otp_verify');
                setTimer(120);
            } else {
                setError(res.error || 'خطا در ارسال پیامک');
            }
        } catch (err) {
            setError('خطای ارتباط با سرور');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = useCallback(async (code?: string) => {
        const otpToVerify = typeof code === 'string' ? code : otp;

        if (otpToVerify.length !== OTP_LENGTH) {
            setError('لطفا کد ۵ رقمی را کامل وارد کنید');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await verifyOTP(phone, otpToVerify);
            if (res.success) {
                // 🔐 SECURITY UPGRADE: Estalish Real Session if token provided
                if (res.session && supabase) {
                    console.log("🔐 [Auth] Establishing session with magic token...");
                    const { error: sessionError } = await supabase.auth.verifyOtp({
                        email: res.session.email,
                        token: res.session.token,
                        type: 'email'
                    });

                    if (sessionError) {
                        console.error("❌ Link verification failed:", sessionError);
                        // Fallback: Proceed anyway (might be mock mode), but warn
                    } else {
                        console.log("✅ [Auth] Real Session Established!");
                    }
                }

                onLoginSuccess({ phone, fullName: res.fullName });
                onClose();
            } else {
                setError('کد وارد شده اشتباه است');
            }
        } catch (err) {
            setError('خطای سیستمی');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [otp, phone, onLoginSuccess, onClose]);

    const handleRegister = async () => {
        if (phone.length < 10) {
            setError('شماره موبایل نامعتبر است');
            return;
        }
        if (password.length < 6) {
            setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'register_without_otp',
                    mobile: phone,
                    password: password
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                if (response.status === 409) {
                    // User exists
                    setError('این شماره قبلاً ثبت شده است. لطفاً وارد شوید.');
                } else {
                    throw new Error(data.message || 'خطا در ثبت نام');
                }
                setLoading(false);
                return;
            }

            // Auto Login
            await handlePasswordLogin();

        } catch (err: any) {
            setError(err.message || 'خطای سیستمی');
            setLoading(false);
        }
    };

    const handlePasswordLogin = async () => {
        if (!supabase) return;
        setLoading(true);
        setError('');
        try {
            // Normalize phone for email
            const cleanPhone = phone.replace(/\D/g, '');
            let localPhone = cleanPhone;
            if (cleanPhone.startsWith('98')) {
                localPhone = '0' + cleanPhone.substring(2);
            } else if (cleanPhone.startsWith('9') && cleanPhone.length === 10) {
                localPhone = '0' + cleanPhone;
            }
            const normalizedEmail = `${localPhone}@manapalm.local`;

            console.log(`🔐 [Auth] Attempting password login with email: ${normalizedEmail}`);

            const { data, error } = await supabase.auth.signInWithPassword({
                email: normalizedEmail,
                password: password,
            });
            if (error) throw error;
            if (data.user) {
                onLoginSuccess({ phone, email: data.user.email, fullName: data.user.user_metadata?.full_name });
                onClose();
            }
        } catch (err: any) {
            console.error('Password login error:', err);
            setError('شماره یا رمز عبور اشتباه است');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in transition-all duration-500">
            <div className="auth-container max-w-4xl w-full flex flex-row-reverse shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 overflow-hidden rounded-[2.5rem]">

                {/* Visual Narrative Side (Desktop Only) */}
                <div className="auth-visual-side hidden md:flex flex-col justify-end p-12 relative overflow-hidden flex-1 bg-[#020617]">
                    {/* Background Image / Overlay */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <img
                            src="https://res.cloudinary.com/dk2x11rvs/image/upload/v1769335277/Gemini_Generated_Image_3d_palm_oasis_v2_f8z8z8.jpg"
                            className="w-full h-full object-cover opacity-60 scale-105 animate-pulse-soft"
                            alt="Mana Palm Oasis"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"></div>
                    </div>

                    <div className="relative z-10 space-y-8 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md px-4 py-2 rounded-full border border-emerald-500/30">
                            <SparklesIcon className="w-5 h-5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold text-sm">جامعه ۱۲۰۰+ نفری</span>
                        </div>

                        <div>
                            <h2 className="text-4xl font-black text-white leading-tight mb-4">
                                میراث معنوی خود را <br />
                                <span className="text-emerald-400 italic">آغاز کنید...</span>
                            </h2>
                            <p className="text-gray-400 leading-relaxed text-lg font-light max-w-sm">
                                با ورود به نخلستان معنا، شما به جنبش بزرگ احیای زمین و جستجوی عمق در زندگی می‌پیوندید.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-white font-bold text-2xl tracking-tighter">۱۲۸۰+</span>
                                <span className="text-gray-500 text-xs uppercase tracking-widest">نخل کاشته شده</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-white font-bold text-2xl tracking-tighter">۳۵۰۰+</span>
                                <span className="text-gray-500 text-xs uppercase tracking-widest">ساعت تامل</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Login Form Side */}
                <div className="auth-login-box flex-1 bg-white/5 md:bg-transparent backdrop-blur-2xl md:backdrop-blur-none p-8 md:p-12 relative flex flex-col justify-center max-w-[440px] mx-auto min-h-[580px]">
                    <button
                        onClick={onClose}
                        className="absolute top-8 left-8 text-white/30 hover:text-white transition-colors p-2 bg-white/10 hover:bg-white/20 rounded-full z-[100] group"
                        title="بستن"
                    >
                        <XMarkIcon className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-300" />
                    </button>

                    <div className="mb-10 text-center md:text-right">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 border border-emerald-500/20">
                            <img src="https://res.cloudinary.com/dk2x11rvs/image/upload/v1765131783/manapal-logo-3d_zpdvkd.png" className="w-10 h-10" alt="Logo" />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2">خوش برگشتید</h1>
                        <p className="text-gray-400 text-sm">برای ادامه مسیر معنا، وارد حساب کاربری خود شوید</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-4 rounded-2xl mb-8 flex items-center gap-3 animate-shake">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            {error}
                        </div>
                    )}

                    {(step === 'phone_entry' || step === 'register_password') && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors">
                                    <PhoneIcon className="w-5 h-5" />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="شماره موبایل (۰۹...)"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:bg-white/10 py-4 pl-12 pr-6 rounded-2xl text-white text-lg tracking-[0.2em] outline-none transition-all placeholder:tracking-normal placeholder:text-gray-600"
                                    maxLength={11}
                                    autoFocus
                                />
                            </div>

                            {mode === 'password' && (
                                <div className="space-y-4 animate-fade-in-down">
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors">
                                            <LockClosedIcon className="w-5 h-5" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="رمز عبور"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:bg-white/10 py-4 pl-12 pr-12 rounded-2xl text-white outline-none transition-all placeholder:text-gray-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 px-1">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                    className="sr-only"
                                                />
                                                <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${rememberMe ? 'bg-emerald-500 border-emerald-500' : 'bg-white/5 border-white/20 group-hover:border-white/40'}`}>
                                                    {rememberMe && (
                                                        <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">مرا به خاطر بسپار</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={mode === 'otp' ? handleSendOTP : (step === 'register_password' ? handleRegister : handlePasswordLogin)}
                                disabled={loading}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>
                                            {mode === 'otp' ? 'دریافت کد تایید' :
                                                step === 'register_password' ? 'ثبت نام و ورود آنی' : 'ورود به نخلستان'}
                                        </span>
                                    </>
                                )}
                            </button>

                            {mode === 'password' && (
                                <div className="text-center">
                                    <button
                                        onClick={() => {
                                            if (step === 'register_password') {
                                                setStep('phone_entry'); // Back to login
                                            } else {
                                                setStep('register_password'); // Go to register
                                            }
                                        }}
                                        className="text-xs text-emerald-400 hover:text-white transition-colors border-b border-emerald-500/30 pb-0.5"
                                    >
                                        {step === 'register_password'
                                            ? 'حساب دارید؟ ورود به سیستم'
                                            : 'هنوز ثبت‌نام نکرده‌اید؟ ساخت حساب کاربری (بدون پیامک)'}
                                    </button>
                                </div>
                            )}

                            <div className="relative flex items-center justify-center py-2">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                                <span className="relative px-4 bg-transparent text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-none">یا ورود با</span>
                            </div>

                            <button
                                onClick={handleGoogleLogin}
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                                <span>حساب گوگل</span>
                            </button>

                            <div className="text-center pt-4">
                                <button
                                    onClick={() => {
                                        setMode(mode === 'otp' ? 'password' : 'otp');
                                        setStep('phone_entry'); // Reset step when switching major modes
                                    }}
                                    className="text-xs text-gray-500 hover:text-emerald-400 transition-colors font-medium border-b border-transparent hover:border-emerald-500/50 pb-1"
                                >
                                    {mode === 'otp' ? 'ورود با رمز عبور' : 'ورود با پیامک (فراموشی رمز)'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'otp_verify' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="text-center space-y-2">
                                <h2 className="text-white font-bold text-xl">تایید شماره موبایل</h2>
                                <p className="text-gray-500 text-sm">کد ۵ رقمی به شماره <span className="text-emerald-400 dir-ltr font-mono">{phone}</span> پیامک شد</p>
                            </div>

                            <OTPInput
                                value={otp}
                                onChange={setOtp}
                                onComplete={handleVerifyOTP}
                                disabled={loading}
                            />

                            <div className="flex justify-between items-center px-2">
                                <div className="text-xs text-gray-500 font-mono">
                                    {timer > 0 ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                                        </div>
                                    ) : (
                                        <button onClick={handleSendOTP} className="text-emerald-400 hover:text-white transition-colors">ارسال دوباره کد</button>
                                    )}
                                </div>
                                <button
                                    onClick={() => { setStep('phone_entry'); setOtp(''); }}
                                    className="text-xs text-gray-600 hover:text-white underline underline-offset-4"
                                >
                                    تغییر شماره
                                </button>
                            </div>

                            <button
                                onClick={() => handleVerifyOTP()}
                                disabled={loading || otp.length !== OTP_LENGTH}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3 mt-4"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> : 'تایید و ورود'}
                            </button>
                        </div>
                    )}

                    <div className="mt-auto pt-8 text-center">
                        <p className="text-[10px] text-gray-600 leading-relaxed">
                            با ورود به نخلستان، شما <span className="text-gray-400">قوانین و مقررات</span> و <br />
                            <span className="text-gray-400">حریم خصوصی</span> سایت ما را می‌پذیرید.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
