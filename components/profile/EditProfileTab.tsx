
import React, { useState, useRef } from 'react';
import { User, PointLog } from '../../types';
import { UserCircleIcon, CameraIcon, SparklesIcon, MapPinIcon } from '../icons';
import ToggleSwitch from '../ToggleSwitch';
import { getAIAssistedText } from '../../services/geminiService';
import { getLevelForPoints } from '../../services/gamificationService';
import { useAppDispatch } from '../../AppContext';

interface EditProfileTabProps {
    user: User;
    onUpdate: (updatedUser: Partial<User>) => void;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

const EditProfileTab: React.FC<EditProfileTabProps> = ({ user, onUpdate }) => {
    const dispatch = useAppDispatch();
    const nameParts = user.fullName?.split(' ') || ['', ''];
    
    const [firstName, setFirstName] = useState(user.firstName || nameParts[0] || '');
    const [lastName, setLastName] = useState(user.lastName || nameParts.slice(1).join(' ') || '');
    const [email, setEmail] = useState(user.email || '');
    const [description, setDescription] = useState(user.description || '');
    const [avatar, setAvatar] = useState(user.avatar || '');
    const [maritalStatus, setMaritalStatus] = useState(user.maritalStatus || 'مجرد');
    const [childrenCount, setChildrenCount] = useState(user.childrenCount ?? '');
    const [birthYear, setBirthYear] = useState(user.birthYear ?? '');
    const [address, setAddress] = useState(user.address || '');
    const [nationalId, setNationalId] = useState(user.nationalId || '');
    const [fatherName, setFatherName] = useState(user.fatherName || '');
    const [motherName, setMotherName] = useState(user.motherName || '');
    const [occupation, setOccupation] = useState(user.occupation || '');
    const [isGroveKeeper, setIsGroveKeeper] = useState(user.isGroveKeeper || false);
    const [groveDescription, setGroveDescription] = useState(user.groveDescription || '');
    const [isCoach, setIsCoach] = useState(user.isCoach || false);

    const [isSaving, setIsSaving] = useState(false);
    const [isBioAIAssistLoading, setIsBioAIAssistLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        if ((!user.address || !user.nationalId || !user.fatherName || !user.motherName || !user.occupation) && address && nationalId && fatherName && motherName && occupation) {
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
            address,
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
        }, 1000);
    };

    return (
        <form onSubmit={handleProfileSave} className="bg-gray-800 p-6 sm:p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-4">ویرایش پروفایل</h2>

            {successMessage && <div className="mb-4 p-3 bg-green-900/50 text-green-300 rounded-md">{successMessage}</div>}
            {error && <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-md">{error}</div>}

            {/* Main Info */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-green-400">اطلاعات اصلی</h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                        {avatar ? <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover" /> : <UserCircleIcon className="w-24 h-24 text-gray-500" />}
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 left-0 bg-gray-900/70 p-1 rounded-full text-white hover:bg-gray-900">
                            <CameraIcon className="w-5 h-5" />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                    </div>
                    <div className="flex-grow w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">نام</label>
                                <input type="text" id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2" />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">نام خانوادگی</label>
                                <input type="text" id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">ایمیل</label>
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2" />
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300">درباره من (بیوگرافی)</label>
                        <button 
                            type="button" 
                            onClick={() => handleBioAIAssist(description ? 'improve' : 'generate')} 
                            disabled={isBioAIAssistLoading} 
                            className="flex items-center gap-1 text-xs py-1 px-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white disabled:bg-gray-500" title="کمک گرفتن از هوش مصنوعی">
                            <SparklesIcon className="w-4 h-4"/>
                            <span>{description ? 'بهبود با AI' : 'کمک از AI'}</span>
                        </button>
                    </div>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2" />
                </div>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-green-400">اطلاعات شخصی</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-300 mb-2">وضعیت تاهل</label>
                            <select id="maritalStatus" value={maritalStatus} onChange={e => setMaritalStatus(e.target.value as 'مجرد' | 'متاهل')} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2">
                                <option value="مجرد">مجرد</option>
                                <option value="متاهل">متاهل</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="childrenCount" className="block text-sm font-medium text-gray-300 mb-2">تعداد فرزندان</label>
                            <input type="number" id="childrenCount" value={childrenCount} onChange={e => setChildrenCount(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2" />
                        </div>
                        <div>
                            <label htmlFor="birthYear" className="block text-sm font-medium text-gray-300 mb-2">سال تولد</label>
                            <input type="number" id="birthYear" value={birthYear} onChange={e => setBirthYear(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2" />
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-green-400">اطلاعات هویتی</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="nationalId" className="block text-sm font-medium text-gray-300 mb-2">کد ملی</label>
                            <input type="text" id="nationalId" value={nationalId} onChange={e => setNationalId(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2" />
                        </div>
                        <div>
                            <label htmlFor="fatherName" className="block text-sm font-medium text-gray-300 mb-2">نام پدر</label>
                            <input type="text" id="fatherName" value={fatherName} onChange={e => setFatherName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2" />
                        </div>
                            <div>
                            <label htmlFor="motherName" className="block text-sm font-medium text-gray-300 mb-2">نام مادر</label>
                            <input type="text" id="motherName" value={motherName} onChange={e => setMotherName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2" />
                        </div>
                            <div>
                            <label htmlFor="occupation" className="block text-sm font-medium text-gray-300 mb-2">شغل</label>
                            <input type="text" id="occupation" value={occupation} onChange={e => setOccupation(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-green-400">نقش‌های اجتماعی</h3>
                <div className="space-y-4 bg-gray-700/50 p-4 rounded-md">
                    <ToggleSwitch checked={isCoach} onChange={setIsCoach}>
                        من یک کوچ هستم
                    </ToggleSwitch>
                    {isCoach && (
                        <p className="text-xs text-gray-400 mt-1">با فعال‌سازی این گزینه، به امکانات ویژه کوچینگ در آزمایشگاه معنا دسترسی خواهید داشت.</p>
                    )}
                    <div className="border-t border-gray-600 my-3"></div>
                    <ToggleSwitch checked={isGroveKeeper} onChange={setIsGroveKeeper}>
                        من یک نخلدار هستم
                    </ToggleSwitch>
                    {isGroveKeeper && (
                        <div>
                            <label htmlFor="groveDescription" className="block text-sm font-medium text-gray-300 mb-2">توضیحات نخلستان</label>
                            <textarea 
                                id="groveDescription" 
                                value={groveDescription} 
                                onChange={e => setGroveDescription(e.target.value)} 
                                rows={3} 
                                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                                placeholder="در مورد نخلستان خود بنویسید (مکان، نوع نخل‌ها، داستان آن و ...)"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-300">آدرس</label>
                    <button type="button" onClick={() => alert('انتخاب از روی نقشه به زودی اضافه خواهد شد!')} className="flex items-center text-xs text-green-400 hover:text-green-300">
                        <MapPinIcon className="w-4 h-4 ml-1" />
                        انتخاب از روی نقشه
                    </button>
                    </div>
                    <textarea id="address" value={address} onChange={e => setAddress(e.target.value)} rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2" />
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-700 text-left">
                <button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-2 px-6 rounded-md transition-colors">
                    {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
            </div>
        </form>
    );
};

export default EditProfileTab;
