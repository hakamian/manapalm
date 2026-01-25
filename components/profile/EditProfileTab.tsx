
import React, { useState, useRef, useMemo } from 'react';
import { User, PointLog } from '../../types';
import { UserCircleIcon, CameraIcon, SparklesIcon, MapPinIcon, LockClosedIcon } from '../icons';
import { supabase } from '../../services/supabaseClient';
import ToggleSwitch from '../ToggleSwitch';
import { getAIAssistedText } from '../../services/geminiService';
import { getLevelForPoints } from '../../services/gamificationService';
import { useAppDispatch } from '../../AppContext';
import AddressesTab from './AddressesTab';

interface EditProfileTabProps {
    user: User;
    onUpdate: (updatedUser: Partial<User>) => void;
    initialSection?: 'basic' | 'detailed' | 'security' | 'addresses';
}

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

const EditProfileTab: React.FC<EditProfileTabProps> = ({ user, onUpdate, initialSection = 'basic' }) => {
    const dispatch = useAppDispatch();
    const nameParts = user.fullName?.split(' ') || ['', ''];

    const [activeSection, setActiveSection] = useState<'basic' | 'detailed' | 'security' | 'addresses'>(initialSection === 'addresses' ? 'addresses' : (initialSection as any));

    const [firstName, setFirstName] = useState(user.firstName || nameParts[0] || '');
    const [lastName, setLastName] = useState(user.lastName || nameParts.slice(1).join(' ') || '');
    const [email, setEmail] = useState(user.email || '');
    const [description, setDescription] = useState(user.description || '');
    const [avatar, setAvatar] = useState(user.avatar || '');
    const [maritalStatus, setMaritalStatus] = useState(user.maritalStatus || 'مجرد');
    const [childrenCount, setChildrenCount] = useState(user.childrenCount ?? '');
    const [birthYear, setBirthYear] = useState(user.birthYear ?? '');
    const [nationalId, setNationalId] = useState(user.nationalId || '');
    const [fatherName, setFatherName] = useState(user.fatherName || '');
    const [motherName, setMotherName] = useState(user.motherName || '');
    const [occupation, setOccupation] = useState(user.occupation || '');
    const [isGroveKeeper, setIsGroveKeeper] = useState(user.isGroveKeeper || false);
    const [groveDescription, setGroveDescription] = useState(user.groveDescription || '');
    const [isCoach, setIsCoach] = useState(user.isCoach || false);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [isBioAIAssistLoading, setIsBioAIAssistLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsSaving(true);

        if (newPassword !== confirmPassword) {
            setError('رمز عبور و تکرار آن مطابقت ندارند.');
            setIsSaving(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
            setIsSaving(false);
            return;
        }

        try {
            const { error } = await supabase!.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setSuccessMessage('رمز عبور با موفقیت بروزرسانی شد.');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message || 'خطا در بروزرسانی رمز عبور');
        } finally {
            setIsSaving(false);
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Calculate completion percentage
    const completionPercentage = useMemo(() => {
        const fields = [
            firstName, lastName, email, description, avatar, // Basic (5)
            maritalStatus, childrenCount, birthYear, // Personal (3)
            nationalId, fatherName, motherName, occupation // Identity (4)
        ];
        const filled = fields.filter(f => f !== '' && f !== undefined && f !== null).length;
        const addressBonus = (user.addresses && user.addresses.length > 0) ? 1 : 0;
        return Math.min(100, Math.round(((filled + addressBonus) / (fields.length + 1)) * 100));
    }, [firstName, lastName, email, description, avatar, maritalStatus, childrenCount, birthYear, nationalId, fatherName, motherName, occupation, user.addresses]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            setAvatar(base64);
        }
    };

    const handleBioAIAssist = async (mode: 'generate' | 'improve') => {
        setIsBioAIAssistLoading(true);
        try {
            const response = await getAIAssistedText({
                mode,
                type: 'user_bio',
                text: description,
                context: `A bio for ${firstName} ${lastName}`,
            });
            setDescription(response);
        } catch (e) {
            console.error(e);
        } finally {
            setIsBioAIAssistLoading(false);
        }
    };

    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("💾 [EditProfile] Save button clicked! Data:", { firstName, lastName, email });
        setError('');
        setSuccessMessage('');
        setIsSaving(true);

        let totalPointsToAdd = 0;
        const newPointsHistory: PointLog[] = [];

        // Point logic
        if ((!user.firstName || !user.email) && firstName && email) {
            if (!user.pointsHistory?.some(h => h.action === 'تکمیل اطلاعات اولیه پروفایل')) {
                totalPointsToAdd += 30;
                newPointsHistory.push({ action: 'تکمیل اطلاعات اولیه پروفایل', points: 30, type: 'barkat', date: new Date().toISOString() });
            }
        }
        if ((!user.description || !user.avatar) && description && avatar) {
            if (!user.pointsHistory?.some(h => h.action === 'تکمیل اطلاعات تکمیلی پروفایل')) {
                totalPointsToAdd += 30;
                newPointsHistory.push({ action: 'تکمیل اطلاعات تکمیلی پروفایل', points: 30, type: 'barkat', date: new Date().toISOString() });
            }
        }
        if ((user.maritalStatus === undefined || user.childrenCount === undefined || user.birthYear === undefined) && maritalStatus && childrenCount !== '' && birthYear !== '') {
            if (!user.pointsHistory?.some(h => h.action === 'تکمیل اطلاعات شخصی')) {
                totalPointsToAdd += 40;
                newPointsHistory.push({ action: 'تکمیل اطلاعات شخصی', points: 40, type: 'barkat', date: new Date().toISOString() });
            }
        }
        if ((!user.nationalId || !user.fatherName || !user.motherName || !user.occupation) && nationalId && fatherName && motherName && occupation) {
            if (!user.pointsHistory?.some(h => h.action === 'تکمیل اطلاعات هویتی')) {
                totalPointsToAdd += 50;
                newPointsHistory.push({ action: 'تکمیل اطلاعات هویتی', points: 50, type: 'barkat', date: new Date().toISOString() });
            }
        }
        if (isGroveKeeper && groveDescription.trim() && !user.isGroveKeeper) {
            totalPointsToAdd += 100;
            newPointsHistory.push({ action: 'ثبت‌نام به عنوان نخلدار', points: 100, type: 'barkat', date: new Date().toISOString() });
        }

        const newTotalPoints = user.points + totalPointsToAdd;
        const newLevel = getLevelForPoints(newTotalPoints, user.manaPoints || 0);
        const fullName = `${firstName.trim()} ${lastName.trim()}`;

        const updatedUser: User = {
            ...user,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            fullName: fullName,
            name: firstName.trim(),
            email,
            description,
            avatar,
            maritalStatus,
            childrenCount: childrenCount !== '' ? Number(childrenCount) : undefined,
            birthYear: birthYear !== '' ? Number(birthYear) : undefined,
            nationalId,
            fatherName,
            motherName,
            occupation,
            isGroveKeeper,
            groveDescription,
            isCoach,
            points: newTotalPoints,
            level: newLevel.name,
            pointsHistory: [...newPointsHistory, ...(user.pointsHistory || [])]
        };

        setTimeout(() => {
            console.log("📤 [EditProfile] Calling onUpdate with finalized data...");
            onUpdate(updatedUser);
            setIsSaving(false);
            setSuccessMessage('اطلاعات با موفقیت ذخیره شد.');
            setTimeout(() => setSuccessMessage(''), 3000);

            if (totalPointsToAdd > 0) {
                const toastAction = newPointsHistory.length > 1
                    ? `تکمیل پروفایل`
                    : newPointsHistory[0].action;
                dispatch({ type: 'SHOW_POINTS_TOAST', payload: { points: totalPointsToAdd, action: toastAction } });
            }
        }, 100);
    };

    return (
        <div className="space-y-6">
            {/* Header & Progress */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
                    <div
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-1000 ease-out"
                        style={{ width: `${completionPercentage}%` }}
                    />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2">
                    <div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            ویرایش پروفایل
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            اطلاعات خود را کامل کنید تا اعتبار بیشتری در نخلستان داشته باشید.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700">
                        <span className="text-sm text-gray-300">تکمیل پروفایل:</span>
                        <span className={`font-bold ${completionPercentage === 100 ? 'text-green-400' : 'text-amber-400'}`}>
                            {completionPercentage}٪
                        </span>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex p-1 bg-gray-900/50 rounded-xl mt-6 border border-gray-700 w-full lg:w-fit mx-auto lg:mx-0 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveSection('basic')}
                        className={`flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeSection === 'basic'
                            ? 'bg-gray-700 text-white shadow-lg'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        اطلاعات پایه
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSection('detailed')}
                        className={`flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeSection === 'detailed'
                            ? 'bg-gray-700 text-white shadow-lg'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        اطلاعات تکمیلی
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSection('addresses')}
                        className={`flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeSection === 'addresses'
                            ? 'bg-gray-700 text-white shadow-lg'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        آدرس‌های من
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSection('security')}
                        className={`flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeSection === 'security'
                            ? 'bg-gray-700 text-white shadow-lg'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        امنیت و رمز عبور
                    </button>
                </div>
            </div>

            {activeSection !== 'addresses' ? (
                <form onSubmit={handleProfileSave} className="animate-in">
                    {successMessage && <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl flex items-center gap-2"><SparklesIcon className="w-5 h-5" />{successMessage}</div>}
                    {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl">{error}</div>}

                    {activeSection === 'basic' && (
                        <div className="space-y-6">
                            {/* Avatar & Main Info */}
                            <div className="glass-card p-6 sm:p-8 rounded-2xl">
                                <div className="flex flex-col sm:flex-row items-start gap-8">
                                    <div className="relative group mx-auto sm:mx-0">
                                        <div className="w-32 h-32 rounded-full ring-4 ring-gray-800 ring-offset-2 ring-offset-green-500/20 overflow-hidden shadow-2xl">
                                            {avatar ? (
                                                <img src={avatar} alt="Avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            ) : (
                                                <UserCircleIcon className="w-full h-full text-gray-600 bg-gray-800 p-2" />
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 bg-green-600 p-2.5 rounded-full text-white hover:bg-green-500 transition-all shadow-lg hover:rotate-12"
                                        >
                                            <CameraIcon className="w-5 h-5" />
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                                    </div>

                                    <div className="flex-grow w-full space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400 font-medium px-1">نام</label>
                                                <input
                                                    type="text"
                                                    value={firstName}
                                                    onChange={e => setFirstName(e.target.value)}
                                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all placeholder-gray-600"
                                                    placeholder="نام خود را وارد کنید"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400 font-medium px-1">نام خانوادگی</label>
                                                <input
                                                    type="text"
                                                    value={lastName}
                                                    onChange={e => setLastName(e.target.value)}
                                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all placeholder-gray-600"
                                                    placeholder="نام خانوادگی..."
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400 font-medium px-1">ایمیل</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all placeholder-gray-600 dir-ltr text-left"
                                                placeholder="example@email.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bio Section */}
                            <div className="glass-card p-6 sm:p-8 rounded-2xl">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">درباره من</h3>
                                        <p className="text-sm text-gray-400">داستان کوتاه زندگی حرفه‌ای و شخصی شما</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleBioAIAssist(description ? 'improve' : 'generate')}
                                        disabled={isBioAIAssistLoading}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg text-white text-sm font-medium transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed group">
                                        <SparklesIcon className={`w-4 h-4 ${isBioAIAssistLoading ? 'animate-spin' : 'group-hover:animate-pulse'}`} />
                                        <span>{isBioAIAssistLoading ? 'در حال نوشتن...' : (description ? 'بهبود با هوش مصنوعی' : 'نوشتن با هوش مصنوعی')}</span>
                                    </button>
                                </div>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none leading-relaxed text-gray-300 placeholder-gray-600"
                                    placeholder="من ..."
                                />
                            </div>
                        </div>
                    )}

                    {activeSection === 'detailed' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Personal Details */}
                                <div className="glass-card p-6 rounded-2xl space-y-5">
                                    <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                                        اطلاعات شخصی
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">سال تولد</label>
                                                <input type="number" value={birthYear} onChange={e => setBirthYear(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 focus:border-green-500 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">وضعیت تاهل</label>
                                                <select value={maritalStatus} onChange={e => setMaritalStatus(e.target.value as any)} className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 focus:border-green-500 outline-none">
                                                    <option value="مجرد">مجرد</option>
                                                    <option value="متاهل">متاهل</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">تعداد فرزندان</label>
                                            <input type="number" value={childrenCount} onChange={e => setChildrenCount(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 focus:border-green-500 outline-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Identity Details */}
                                <div className="glass-card p-6 rounded-2xl space-y-5">
                                    <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                                        اطلاعات هویتی
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400">کد ملی</label>
                                            <input type="text" value={nationalId} onChange={e => setNationalId(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 focus:border-green-500 outline-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">نام پدر</label>
                                                <input type="text" value={fatherName} onChange={e => setFatherName(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 focus:border-green-500 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">شغل</label>
                                                <input type="text" value={occupation} onChange={e => setOccupation(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 focus:border-green-500 outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Social Roles */}
                            <div className="glass-card p-6 rounded-2xl space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2 mb-4">
                                        <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                                        نقش‌های اجتماعی
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className={`p-4 rounded-xl border transition-all ${isCoach ? 'bg-blue-900/20 border-blue-500/50' : 'bg-gray-900/30 border-gray-700'}`}>
                                            <ToggleSwitch checked={isCoach} onChange={setIsCoach}>
                                                <span className={`${isCoach ? 'text-blue-300 font-semibold' : 'text-gray-400'}`}>من یک کوچ هستم</span>
                                            </ToggleSwitch>
                                        </div>
                                        <div className={`p-4 rounded-xl border transition-all ${isGroveKeeper ? 'bg-amber-900/20 border-amber-500/50' : 'bg-gray-900/30 border-gray-700'}`}>
                                            <ToggleSwitch checked={isGroveKeeper} onChange={setIsGroveKeeper}>
                                                <span className={`${isGroveKeeper ? 'text-amber-300 font-semibold' : 'text-gray-400'}`}>من یک نخلدار هستم</span>
                                            </ToggleSwitch>
                                        </div>
                                    </div>

                                    {isGroveKeeper && (
                                        <div className="mt-4 animate-in">
                                            <label className="text-sm text-amber-500/80 mb-2 block">توضیحات نخلستان</label>
                                            <textarea
                                                value={groveDescription}
                                                onChange={e => setGroveDescription(e.target.value)}
                                                rows={3}
                                                className="w-full bg-gray-900/50 border border-amber-900/50 rounded-xl p-3 focus:border-amber-500 outline-none text-amber-100 placeholder-amber-900/50"
                                                placeholder="درباره نخلستان خود بنویسید..."
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'security' && (
                        <div className="glass-card p-6 rounded-2xl space-y-6">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
                                <div className="w-10 h-10 rounded-full bg-amber-900/30 flex items-center justify-center text-amber-500">
                                    <LockClosedIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">تنظیم رمز عبور</h3>
                                    <p className="text-sm text-gray-400">برای ورود بدون پیامک، رمز عبور تنظیم کنید.</p>
                                </div>
                            </div>

                            <div className="max-w-md mx-auto space-y-4">
                                {/* Display Mobile Number */}
                                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400">
                                            <SparklesIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">شماره موبایل (محرمانه)</p>
                                            <p className="text-lg font-mono font-bold text-white tracking-widest dir-ltr">{user.phone || 'ثبت نشده'}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded border border-green-700/50">تایید شده</span>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-gray-700/50">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-300 font-medium">رمز عبور جدید</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 focus:border-amber-500 outline-none text-left dir-ltr"
                                            placeholder="••••••"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-300 font-medium">تکرار رمز عبور</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-3 focus:border-amber-500 outline-none text-left dir-ltr"
                                            placeholder="••••••"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div> {/* Closing the wrapper div added in previous step */}

                                <button
                                    type="button"
                                    onClick={handlePasswordUpdate}
                                    disabled={isSaving || !newPassword || !confirmPassword}
                                    className={`w-full py-3 rounded-xl font-bold transition-all mt-4 ${!newPassword || !confirmPassword
                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20'
                                        }`}
                                >
                                    {isSaving ? 'در حال ثبت...' : 'ثبت رمز عبور جدید'}
                                </button>
                            </div>
                        </div>
                    )}

                    {(activeSection === 'basic' || activeSection === 'detailed') && (
                        <div className="sticky bottom-0 z-10 pt-4 pb-0 bg-transparent">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-3 ${isSaving
                                    ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-900/30'
                                    }`}
                            >
                                {isSaving ? (
                                    <>
                                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                        در حال ذخیره...
                                    </>
                                ) : (
                                    'ذخیره تغییرات'
                                )}
                            </button>
                        </div>
                    )}
                </form>
            ) : (
                <div className="animate-in">
                    <AddressesTab user={user} onUpdate={onUpdate} />
                </div>
            )}
        </div>
    );
};

export default EditProfileTab;
