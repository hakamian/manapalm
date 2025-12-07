
import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, GoogleIcon, CheckCircleIcon, LockClosedIcon, ChatBubbleBottomCenterTextIcon, EyeIcon, EyeSlashIcon, CogIcon, UserCircleIcon, QuestionMarkCircleIcon } from './icons';
import { useAppDispatch, useAppState } from '../AppContext';
import { supabase, setupSupabaseKeys } from '../services/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { phone?: string; email?: string; fullName?: string }) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { allUsers } = useAppState();
  const dispatch = useAppDispatch();
  
  // 1: Phone Input, 2: OTP Input, 3: Register Name (if new), 4: Success
  const [step, setStep] = useState(1);
  
  // Login Method: 'otp' (SMS) or 'password'
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Registration States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Developer Mode / Config State
  const [showConfig, setShowConfig] = useState(false);
  const [showDevHelp, setShowDevHelp] = useState(false);
  // Default to the correct project URL: sbjrayzghjfsmmuygwbw
  const [configUrl, setConfigUrl] = useState(localStorage.getItem('VITE_SUPABASE_URL') || 'https://sbjrayzghjfsmmuygwbw.supabase.co');
  const [configKey, setConfigKey] = useState(localStorage.getItem('VITE_SUPABASE_ANON_KEY') || '');
  
  const otpInputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      const timer = setTimeout(() => {
        setStep(1); 
        setPhoneNumber(''); 
        setOtp(''); 
        setPassword('');
        setIsValid(true); 
        setError(''); 
        setIsLoading(false); 
        setLoginMethod('otp');
        setFirstName(''); 
        setLastName('');
        setRegPassword('');
        setRegConfirmPassword('');
        // Do not reset showConfig automatically if keys are missing
        if (!supabase) setShowConfig(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (step === 2 && isOpen) {
      otpInputsRef.current[0]?.focus();
    }
  }, [step, isOpen]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPhoneNumber(value);
    setError('');
    if (value.length > 0) {
      setIsValid(/^09[0-9]{9}$/.test(value));
    } else {
      setIsValid(true);
    }
  };

  // --- MOCK LOGIN (BYPASS SERVER) ---
  const handleMockLogin = () => {
      setIsLoading(true);
      setTimeout(() => {
          onLoginSuccess({
              phone: '09120000000',
              fullName: 'کاربر آزمایشی',
              email: 'test@manapalm.com'
          });
          onClose();
          setIsLoading(false);
      }, 800);
  };

  // --- SUBMIT PHONE (Start Login) ---
  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || phoneNumber.length !== 11) {
        setIsValid(false);
        return;
    }
    
    setIsLoading(true);
    setError('');

    try {
        if (loginMethod === 'otp') {
            // A) Send OTP via Supabase
            if (!supabase) throw new Error("SupabaseNotConfigured");
            
            const { error } = await supabase.auth.signInWithOtp({
                phone: '+98' + phoneNumber.substring(1), // Convert 0912... to +98912...
            });

            if (error) throw error;
            
            // Move to OTP step
            setStep(2);
            
        } else {
            // B) Login with Password directly
            if (!supabase) throw new Error("SupabaseNotConfigured");

            const { data, error } = await supabase.auth.signInWithPassword({
                phone: '+98' + phoneNumber.substring(1),
                password: password
            });

            if (error) throw error;

            // Success
            if (data.user) {
                onLoginSuccess({ phone: phoneNumber });
                onClose();
            }
        }
    } catch (err: any) {
        console.error("Login Error:", err);
        if (err.message === "SupabaseNotConfigured") {
            setError('اتصال به سرور برقرار نیست. لطفا تنظیمات را بررسی کنید.');
            setShowConfig(true);
        } else {
            // Handle network errors specifically
            if (err.message === "Failed to fetch" || err.message.includes("network")) {
                setError('خطا در اتصال به سرور (ممکن است نیاز به VPN باشد).');
                // Optional: Automatically show config on network error to allow URL fix
                // setShowConfig(true); 
            } else {
                setError(err.message || 'خطا در برقراری ارتباط. لطفا دوباره تلاش کنید.');
            }

            if (err.message && err.message.includes("Invalid login credentials")) {
                setError("شماره موبایل یا رمز عبور اشتباه است.");
            }
        }
    } finally {
        setIsLoading(false);
    }
  };

  // --- SUBMIT OTP (Verify Code) ---
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsLoading(true);
    setError('');

    try {
        if (!supabase) throw new Error("سرویس در دسترس نیست");

        const { data, error } = await supabase.auth.verifyOtp({
            phone: '+98' + phoneNumber.substring(1),
            token: otp,
            type: 'sms'
        });

        if (error) throw error;

        // Check if user is new or existing based on local state mock or metadata
        const userMetaData = data.user?.user_metadata;
        const hasName = userMetaData?.full_name || userMetaData?.name;
        
        if (hasName) {
             onLoginSuccess({ phone: phoneNumber });
             onClose();
        } else {
             // New user (or user without name), ask for name and password
             setStep(3);
        }

    } catch (err: any) {
        console.error("OTP Verify Error:", err);
        setError('کد وارد شده صحیح نمی‌باشد یا منقضی شده است.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value) {
        const newOtpArr = otp.split('');
        newOtpArr[index] = value;
        const newOtp = newOtpArr.join('').substring(0, 6);
        setOtp(newOtp);

        if (index < 5 && newOtp.length > index) {
            otpInputsRef.current[index + 1]?.focus();
        }
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === 'Backspace') {
          const newOtpArr = otp.split('');
          newOtpArr[index] = '';
          setOtp(newOtpArr.join(''));
          if (!e.currentTarget.value && index > 0) {
            otpInputsRef.current[index - 1]?.focus();
          }
      }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').substring(0, 6);
      if (pastedData) {
          setOtp(pastedData);
          otpInputsRef.current.forEach((input, index) => {
              if (input && pastedData[index]) {
                  input.value = pastedData[index];
              }
          });
          const lastInputIndex = Math.min(pastedData.length, 6) - 1;
          otpInputsRef.current[lastInputIndex]?.focus();
      }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim()) return;

    if (regPassword) {
        if (regPassword.length < 6) {
            setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
            return;
        }
        if (regPassword !== regConfirmPassword) {
            setError('رمز عبور و تکرار آن مطابقت ندارند.');
            return;
        }
    }

    setIsLoading(true);

    try {
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        
        // Update user in Supabase
        if (supabase) {
            const updates: any = {
                data: { full_name: fullName, name: fullName }
            };
            if (regPassword) {
                updates.password = regPassword;
            }
            
            const { error } = await supabase.auth.updateUser(updates);
            if (error) throw error;
        }

        onLoginSuccess({ phone: phoneNumber, fullName: fullName });
        setStep(4);
    } catch (err: any) {
        console.error("Registration Error:", err);
        setError(err.message || 'خطا در ثبت اطلاعات.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabase) {
        setError('تنظیمات Supabase یافت نشد. لطفاً کلیدها را وارد کنید.');
        setShowConfig(true);
        return;
    }
    setIsLoading(true);
    setError('');
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Use dynamic origin to support localhost and production
                redirectTo: window.location.origin, 
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            }
        });
        if (error) throw error;
    } catch (e: any) {
        console.error("Google Login Error:", e);
        if (e.message?.includes("configuration")) {
             setError("تنظیمات گوگل در Supabase انجام نشده است. (دکمه چرخ‌دنده را بزنید)");
        } else {
             setError(e.message || 'خطا در برقراری ارتباط با گوگل. اتصال اینترنت را بررسی کنید.');
        }
        setIsLoading(false);
    }
  };

  const handleSaveConfig = () => {
      if (configUrl && configKey) {
          setupSupabaseKeys(configUrl, configKey);
          setShowConfig(false);
      }
  };

  const renderConfig = () => {
      const displayUrl = configUrl || 'https://sbjrayzghjfsmmuygwbw.supabase.co';
      const redirectUrl = window.location.origin;

      return (
      <div className="space-y-4 animate-fade-in p-4 bg-gray-900/50 rounded-lg border border-gray-600 mb-4 max-h-[60vh] overflow-y-auto">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <CogIcon className="w-4 h-4"/> تنظیمات اتصال دستی
          </h3>
          <p className="text-xs text-gray-400">
              آدرس صحیح (Project URL) و کلید (Anon Key) را از بخش Settings &rarr; API در پنل Supabase کپی و اینجا وارد کنید.
          </p>
          <div>
              <label className="block text-xs text-gray-400 mb-1">Project URL</label>
              <input 
                  type="text" 
                  value={configUrl} 
                  onChange={e => setConfigUrl(e.target.value)} 
                  className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-xs text-white dir-ltr"
                  placeholder="https://xyz.supabase.co"
              />
          </div>
          <div>
              <label className="block text-xs text-gray-400 mb-1">Anon Key</label>
              <input 
                  type="text" 
                  value={configKey} 
                  onChange={e => setConfigKey(e.target.value)} 
                  className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-xs text-white dir-ltr"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
              />
          </div>

          <button 
             onClick={() => setShowDevHelp(!showDevHelp)}
             className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2"
          >
             <QuestionMarkCircleIcon className="w-4 h-4"/>
             {showDevHelp ? 'مخفی کردن راهنما' : 'راهنمای تنظیم گوگل'}
          </button>

          {showDevHelp && (
              <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-md mt-2 text-[10px] space-y-2 text-blue-100">
                  <p className="font-bold text-yellow-300">مهم: تنظیمات Redirect URL</p>
                  <p>در پنل Supabase بخش Authentication &rarr; URL Configuration، این آدرس را به لیست <strong>Redirect URLs</strong> اضافه کنید:</p>
                  <div className="bg-black/50 p-2 rounded text-green-300 font-mono select-all cursor-pointer break-all" onClick={(e) => navigator.clipboard.writeText(e.currentTarget.innerText)}>
                      {redirectUrl}
                  </div>
                  <p className="text-gray-400 mt-1">این کار برای تایید بازگشت از گوگل به سایت شما ضروری است.</p>
              </div>
          )}

          <div className="flex gap-2 pt-2">
              <button 
                onClick={handleSaveConfig}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded transition-colors"
              >
                  ذخیره و اتصال
              </button>
               <button 
                onClick={() => setShowConfig(false)}
                className="px-3 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 rounded transition-colors"
              >
                  بستن
              </button>
          </div>
      </div>
  )};

  const renderStepOne = () => (
     <form onSubmit={handleSubmitPhone} className="space-y-6">
        {/* Method Toggles */}
        <div className="flex bg-gray-700 p-1 rounded-lg mb-6">
            <button
                type="button"
                onClick={() => { setLoginMethod('otp'); setError(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${loginMethod === 'otp' ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
                پیامک (OTP)
            </button>
            <button
                type="button"
                onClick={() => { setLoginMethod('password'); setError(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${loginMethod === 'password' ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                <LockClosedIcon className="w-4 h-4" />
                رمز عبور
            </button>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2 text-right">شماره موبایل</label>
          <input
            type="tel"
            id="phone"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder="09123456789"
            dir="ltr"
            className={`w-full bg-gray-900 border rounded-md p-3 text-center text-lg tracking-wider ${isValid ? 'border-gray-600 focus:border-amber-500' : 'border-red-500'} focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors`}
          />
          {!isValid && phoneNumber.length > 0 && <p className="text-red-400 text-sm mt-2 text-right">لطفاً یک شماره موبایل معتبر وارد کنید.</p>}
        </div>

        {loginMethod === 'password' && (
            <div className="relative">
                <label htmlFor="pass" className="block text-sm font-medium text-gray-300 mb-2 text-right">رمز عبور</label>
                <input
                    type={showPassword ? "text" : "password"}
                    id="pass"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="رمز عبور خود را وارد کنید"
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-left focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-[38px] left-3 text-gray-500 hover:text-white"
                >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                </button>
                <div className="text-right mt-2">
                     <button type="button" onClick={() => setLoginMethod('otp')} className="text-xs text-amber-500 hover:underline">رمز عبور را فراموش کرده‌اید؟ (ورود با پیامک)</button>
                </div>
            </div>
        )}
        
        <div>
            <button
              type="submit"
              disabled={!isValid || phoneNumber.length !== 11 || isLoading || (loginMethod === 'password' && !password)}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-4 rounded-md transition-all duration-300 text-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></span>
                    درحال بررسی...
                  </>
              ) : (
                  loginMethod === 'otp' ? 'ارسال کد تایید' : 'ورود به حساب'
              )}
            </button>
        </div>
      </form>
  );

  const renderStepTwo = () => (
      <form onSubmit={handleOtpSubmit} className="space-y-6">
        <div>
          <p className="text-center text-gray-300 mb-4 text-sm">
              کد ارسال شده به <span className="font-bold text-white dir-ltr">{phoneNumber}</span> را وارد کنید.
          </p>
          <label htmlFor="otp-0" className="sr-only">کد تایید</label>
          <div className="flex justify-center gap-1 sm:gap-2" dir="ltr">
            {[...Array(6)].map((_, index) => (
                <input
                    key={index}
                    id={`otp-${index}`}
                    ref={el => { otpInputsRef.current[index] = el; }}
                    type="tel"
                    maxLength={1}
                    value={otp[index] || ''}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-10 h-12 sm:w-12 sm:h-14 bg-gray-900 border border-gray-600 rounded-md text-center text-xl sm:text-2xl focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                />
            ))}
          </div>
          {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
        </div>
        
        <div className="flex justify-end items-center text-sm">
            <div>
                <button type="button" onClick={() => setStep(1)} className="text-gray-400 hover:text-white transition-colors">ویرایش شماره</button>
            </div>
        </div>

        <button
          type="submit"
          disabled={otp.length !== 6 || isLoading}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-4 rounded-md transition-all duration-300 text-lg flex items-center justify-center gap-2"
        >
          {isLoading ? (
               <>
                <span className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></span>
                بررسی کد...
              </>
          ) : 'تایید و ادامه'}
        </button>
      </form>
  );

  const renderStepThree = () => (
    <form onSubmit={handleNameSubmit} className="space-y-6">
        <div className="text-center mb-4">
            <p className="text-sm text-gray-400">شما کاربر جدید هستید. برای تکمیل ثبت‌نام، نام خود را وارد کنید.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2 text-right">نام</label>
                <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="مثلا: حسین"
                    className="w-full bg-gray-900 border rounded-md p-3 text-center text-lg border-gray-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    autoFocus
                />
            </div>
            <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2 text-right">نام خانوادگی</label>
                <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="مثلا: رضایی"
                    className="w-full bg-gray-900 border rounded-md p-3 text-center text-lg border-gray-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
            </div>
        </div>

        <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600/50">
             <h4 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                 <LockClosedIcon className="w-4 h-4"/> تنظیم رمز عبور (اختیاری)
             </h4>
             <p className="text-xs text-gray-400 mb-3">با تنظیم رمز، می‌توانید در آینده بدون نیاز به پیامک وارد شوید.</p>
             <div className="space-y-3">
                 <input 
                    type="password"
                    placeholder="رمز عبور (حداقل ۶ کاراکتر)"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:border-amber-500 focus:outline-none text-sm"
                 />
                 <input 
                    type="password"
                    placeholder="تکرار رمز عبور"
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:border-amber-500 focus:outline-none text-sm"
                 />
             </div>
        </div>
        
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
            type="submit"
            disabled={!firstName.trim() || !lastName.trim() || isLoading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-4 rounded-md transition-all duration-300 text-lg"
        >
            {isLoading ? 'در حال ثبت...' : 'ثبت‌نام و ورود'}
        </button>
    </form>
  );

  const renderStepFour = () => (
    <div className="text-center space-y-6 animate-fade-in-up">
        <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto" />
        <div>
            <h3 className="text-xl font-bold">عالی بود، {firstName || 'کاربر عزیز'}!</h3>
            <p className="text-gray-300 mt-2">خوشحالیم که به خانواده نخلستان معنا پیوستید.</p>
        </div>
        {regPassword ? (
             <div className="p-3 bg-green-900/30 rounded-lg border border-green-600/30 text-sm text-green-200">
                رمز عبور شما با موفقیت تنظیم شد. در ورود بعدی می‌توانید از آن استفاده کنید.
             </div>
        ) : (
             <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <h4 className="font-semibold text-green-300 text-sm">پیشنهاد:</h4>
                <p className="text-xs text-gray-300 mt-1">
                    شما رمز عبور تنظیم نکردید. می‌توانید بعداً در بخش «تنظیمات پروفایل» این کار را انجام دهید.
                </p>
            </div>
        )}
        <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: 'profile' });
                onClose();
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-4 rounded-md transition-colors"
            >
              کامل کردن پروفایل
            </button>
            <button
              onClick={onClose}
              className="w-full text-gray-300 hover:text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              شروع گشت و گذار
            </button>
        </div>
    </div>
  );

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex items-end sm:items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className={`bg-gray-800 text-white shadow-2xl w-full sm:max-w-sm sm:w-full relative 
               rounded-t-2xl sm:rounded-lg 
               p-6 pt-10 sm:p-8 sm:pt-10
               transition-transform duration-300 ease-in-out
               transform ${isOpen ? 'translate-y-0' : 'translate-y-full sm:translate-y-0 sm:scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-3 right-1/2 translate-x-1/2 w-12 h-1.5 bg-gray-600 rounded-full sm:hidden" aria-hidden="true"></div>
        
        {/* Settings Button */}
        {!showConfig && (
            <button
              onClick={() => setShowConfig(true)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              title="تنظیمات اتصال"
            >
              <CogIcon className="w-5 h-5"/>
            </button>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-white"
          aria-label="Close authentication modal"
        >
          <XMarkIcon />
        </button>

        <div className="text-center mb-6">
            <h2 id="auth-modal-title" className="text-2xl font-bold mb-2">
                {step === 3 ? 'افتخار آشنایی با چه کسی را داریم؟' : 
                 step === 4 ? 'خوش آمدید!' : 
                 'به نخلستان معنا خوش آمدید'}
            </h2>
            {!showConfig && (
                <p className="text-gray-400 text-sm">
                    {step === 1 ? "برای ادامه، شماره خود را وارد کنید." : 
                     step === 2 ? `کد تایید پیامک شده را وارد کنید.` : 
                     step === 3 ? 'برای شخصی‌سازی تجربه شما، لطفا نام خود را وارد کنید.' :
                     'سفر شما آغاز شد.'}
                </p>
            )}
        </div>
        
        {/* Render Config if requested */}
        {showConfig && renderConfig()}

        {!showConfig && (
            <>
                {step === 1 ? renderStepOne() : step === 2 ? renderStepTwo() : step === 3 ? renderStepThree() : renderStepFour()}
                
                {step === 1 && error && (
                    <div className="mt-3 p-2 bg-red-900/30 border border-red-500/50 rounded-md flex flex-col items-center gap-2">
                        <p className="text-red-400 text-sm text-center">{error}</p>
                        {error.includes('URL') || error.includes('اتصال') ? (
                             <button onClick={() => setShowConfig(true)} className="text-xs text-blue-300 hover:text-white underline">
                                 بررسی تنظیمات اتصال
                             </button>
                        ) : null}
                    </div>
                )}

                {step === 1 && (
                    <>
                        {/* Mock Login Button for Quick Testing */}
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={handleMockLogin}
                                className="w-full bg-stone-700 hover:bg-stone-600 text-white font-bold py-2 px-4 rounded-md text-sm border border-stone-600 flex items-center justify-center gap-2 transition-colors"
                            >
                                <UserCircleIcon className="w-5 h-5 text-gray-400" />
                                ورود آزمایشی (بدون سرور)
                            </button>
                        </div>
                    
                        <div className="relative flex pt-6 items-center">
                            <div className="flex-grow border-t border-gray-600"></div>
                            <span className="flex-shrink mx-4 text-gray-500 text-sm">یا</span>
                            <div className="flex-grow border-t border-gray-600"></div>
                        </div>
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center bg-white hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-md transition-all duration-200 text-base mt-4 border border-gray-300 shadow-sm"
                        >
                            <GoogleIcon className="w-5 h-5 ml-3" />
                            {isLoading ? 'در حال اتصال...' : 'ورود سریع با گوگل'}
                        </button>
                    </>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
