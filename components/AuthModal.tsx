'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { sendOTP, verifyOTP } from '../services/otp';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { phone?: string; email?: string; fullName?: string }) => void;
}

type AuthMode = 'otp' | 'password';
type AuthStep = 'phone_entry' | 'otp_verify' | 'password_entry' | 'set_password';

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
      // In a real scenario, this calls your backend API
      // For now, we simulate success or use the mock sendOTP
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

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await verifyOTP(phone, otp);
      if (res.success) {
        // If existing user, log them in. If new, ask for password setup (optional) or just log in.
        // For this logic, we assume backend returns a session or we create one.
        // SUCCESS FEEDBACK
        setLoading(false);
        setStep('phone_entry'); // Reset for next time

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
  };

  const handlePasswordLogin = async () => {
    if (!supabase) {
      setError('خطای اتصال به سرور (Supabase unavailable)');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${phone}@manapalm.local`, // Assuming phone-based email mapping for Supabase
        password: password,
      });

      if (error) {
        // Fallback: maybe they used real email? For now, Stick to phone logic.
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
            <div className="space-y-4 w-full animate-fade-in-up">
              <div className="text-center text-white/80 text-sm mb-4">
                کد ارسال شده به {' '}<span className="text-emerald-400 font-mono dir-ltr">{phone}</span>{' '} را وارد کنید
              </div>

              <input
                type="text"
                placeholder="- - - - -"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="auth-input text-center text-2xl tracking-[1rem] font-mono"
                maxLength={5}
              />

              <div className="flex justify-between items-center text-xs text-gray-400 px-1">
                <span>{timer > 0 ? `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : ''}</span>
                {timer === 0 && (
                  <button onClick={handleSendOTP} className="text-emerald-400 hover:text-emerald-300">
                    ارسال مجدد کد
                  </button>
                )}
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={loading}
                className="auth-button mt-6"
              >
                {loading ? 'در حال بررسی...' : 'تایید و ورود'}
              </button>
              <button
                onClick={() => setStep('phone_entry')}
                className="w-full text-center text-xs text-gray-500 hover:text-gray-300 mt-4"
              >
                اصلاح شماره موبایل
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
