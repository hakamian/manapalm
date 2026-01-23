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
type AuthStep = 'phone_entry' | 'otp_verify' | 'password_entry' | 'set_password';

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
  onComplete: () => void;
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
            setTimeout(() => onComplete(), 100);
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
      setTimeout(() => onComplete(), 150);
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
      setTimeout(() => onComplete(), 150);
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  }, [onChange, onComplete]);

  return (
    <div className="flex flex-row-reverse justify-center gap-2 sm:gap-3" dir="ltr" onPaste={handlePaste}>
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

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState<AuthMode>('otp'); // 'otp' is default for ease
  const [step, setStep] = useState<AuthStep>('phone_entry');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);

  // Reset state when modal opens
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

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setError('خطای اتصال به سرویس احراز هویت (Supabase Client Init Failed)');
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
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
        setTimer(120); // 2 minutes
      } else {
        setError(res.error || 'خطا در ارسال پیامک');
      }
    } catch (err) {
      setError('خطای ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = useCallback(async () => {
    if (otp.length !== OTP_LENGTH) {
      setError('لطفا کد ۵ رقمی را کامل وارد کنید');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await verifyOTP(phone, otp);
      if (res.success) {
        setLoading(false);
        setStep('phone_entry');
        onLoginSuccess({ phone, fullName: res.fullName });
        onClose();
      } else {
        setError('کد وارد شده اشتباه است');
      }
    } catch (err) {
      setError('خطای سیستمی');
    } finally {
      setLoading(false);
    }
  }, [otp, phone, onLoginSuccess, onClose]);

  const handlePasswordLogin = async () => {
    if (!supabase) {
      setError('خطای اتصال به سرور (Supabase unavailable)');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${phone}@manapalm.local`,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        onLoginSuccess({
          phone,
          email: data.user.email,
          fullName: data.user.user_metadata?.full_name
        });
        onClose();
      }
    } catch (err: any) {
      setError('شماره یا رمز عبور اشتباه است');
    } finally {
      setLoading(false);
    }
  };

  // Render Helpers
  const renderLogo = () => (
    <div className="auth-logo-frame mb-6">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeOpacity="0.5" />
        <path d="M12 18V12L15 9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12C9 12 10.5 14 12 14C13.5 14 15 12 15 12" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 6V8" strokeLinecap="round" />
      </svg>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
      <div className="auth-container">
        <div className="auth-login-box">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {renderLogo()}

          <h2 className="text-xl font-bold text-center text-white mb-1">خوش آمدید</h2>
          <p className="text-xs text-center text-gray-400 mb-8">به نخلستان معنا بپیوندید</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-xs p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          {step === 'phone_entry' && (
            <div className="space-y-4 w-full animate-fade-in-up">
              <div>
                <input
                  type="tel"
                  placeholder="شماره موبایل (۰۹...)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="auth-input text-center tracking-widest"
                  maxLength={11}
                />
              </div>

              {mode === 'password' && (
                <div>
                  <input
                    type="password"
                    placeholder="رمز عبور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input text-center"
                  />
                </div>
              )}

              <button
                onClick={mode === 'otp' ? handleSendOTP : handlePasswordLogin}
                disabled={loading}
                className="auth-button"
              >
                {loading ? (
                  <span className="animate-pulse">لطفا صبر کنید...</span>
                ) : (
                  mode === 'otp' ? 'دریافت کد تایید' : 'ورود'
                )}
              </button>

              <div className="auth-divider">یا</div>

              <button onClick={handleGoogleLogin} className="auth-google-btn">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                ورود با گوگل
              </button>

              <div className="text-center mt-4">
                <button
                  onClick={() => setMode(mode === 'otp' ? 'password' : 'otp')}
                  className="text-xs text-white/60 hover:text-white transition-colors border-b border-transparent hover:border-white/40 pb-0.5"
                >
                  {mode === 'otp'
                    ? 'ورود با رمز عبور'
                    : 'ورود با پیامک (فراموشی رمز)'}
                </button>
              </div>
            </div>
          )}

          {step === 'otp_verify' && (
            <div className="space-y-6 w-full animate-fade-in-up">
              <div className="text-center text-white/80 text-sm mb-2">
                کد ارسال شده به {' '}<span className="text-emerald-400 font-mono dir-ltr">{phone}</span>{' '} را وارد کنید
              </div>

              {/* Modern OTP Input with square boxes */}
              <OTPInput
                value={otp}
                onChange={setOtp}
                onComplete={handleVerifyOTP}
                disabled={loading}
              />

              {/* Timer and resend */}
              <div className="flex justify-between items-center text-xs text-gray-400 px-1">
                <span className="flex items-center gap-1">
                  {timer > 0 && (
                    <>
                      <svg className="w-4 h-4 text-emerald-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                    </>
                  )}
                </span>
                {timer === 0 && (
                  <button onClick={handleSendOTP} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    ارسال مجدد کد
                  </button>
                )}
              </div>

              {/* Hint for Web OTP */}
              <p className="text-center text-white/40 text-[10px]">
                💡 در موبایل، کد به‌صورت خودکار از پیامک خوانده می‌شود
              </p>

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== OTP_LENGTH}
                className={`auth-button mt-4 ${otp.length !== OTP_LENGTH ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    در حال بررسی...
                  </span>
                ) : 'تایید و ورود'}
              </button>

              <button
                onClick={() => { setStep('phone_entry'); setOtp(''); }}
                className="w-full text-center text-xs text-gray-500 hover:text-gray-300"
              >
                ← اصلاح شماره موبایل
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
