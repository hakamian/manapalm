
import React, { useState } from 'react';
import { User } from '../../types';
import ToggleSwitch from '../ToggleSwitch';
import { GoogleIcon, CloudIcon } from '../icons';

interface SettingsTabProps {
    user: User;
    onUpdate: (updatedUser: Partial<User>) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ user, onUpdate }) => {
    const [prefs, setPrefs] = useState(user.notificationPreferences || { orders: true, promotions: true, newsletter: true });
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [backupSuccessMessage, setBackupSuccessMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSettingsSave = () => {
         onUpdate({ ...user, notificationPreferences: prefs });
         setSuccessMessage('تنظیمات با موفقیت ذخیره شد.');
         setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleBackup = () => {
        setIsBackingUp(true);
        setBackupSuccessMessage('');
        // Simulate a backup process
        setTimeout(() => {
            const newBackupDate = new Date().toISOString();
            onUpdate({ ...user, googleDriveLastBackup: newBackupDate });
            setIsBackingUp(false);
            setBackupSuccessMessage('پشتیبان‌گیری با موفقیت انجام شد!');
            setTimeout(() => setBackupSuccessMessage(''), 4000);
        }, 2000);
    };

    return (
        <div className="bg-gray-800 p-6 sm:p-8 rounded-lg">
             <h2 className="text-2xl font-bold mb-6">تنظیمات</h2>
             {successMessage && <div className="mb-4 p-3 bg-green-900/50 text-green-300 rounded-md">{successMessage}</div>}
             <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-3">تنظیمات اعلان‌ها</h3>
                    <div className="space-y-4 bg-gray-700/50 p-4 rounded-md">
                        <ToggleSwitch checked={prefs.orders} onChange={c => setPrefs(p => ({...p, orders: c}))}>وضعیت سفارش‌ها</ToggleSwitch>
                        <ToggleSwitch checked={prefs.promotions} onChange={c => setPrefs(p => ({...p, promotions: c}))}>تخفیف‌ها و پیشنهادها</ToggleSwitch>
                        <ToggleSwitch checked={prefs.newsletter} onChange={c => setPrefs(p => ({...p, newsletter: c}))}>خبرنامه</ToggleSwitch>
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold mb-3">کلید API</h3>
                    <div className="bg-gray-700/50 p-4 rounded-md">
                        <p className="text-sm text-gray-300 mb-2">برای استفاده از برخی ابزارهای هوش مصنوعی، نیاز به کلید API شخصی دارید.</p>
                        <div className="flex items-center space-x-reverse space-x-2">
                            <input type="text" value={user.apiKey ? `****************${user.apiKey.slice(-4)}` : ''} readOnly className="flex-grow bg-gray-600 border border-gray-500 rounded-md p-2" placeholder="کلید API ثبت نشده است" />
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
                                {user.apiKey ? 'تغییر' : 'ثبت'}
                            </button>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-3">اتصالات ابری</h3>
                    <div className="bg-gray-700/50 p-4 rounded-md space-y-4">
                        {user.googleDriveEmail ? (
                            <div>
                                <p className="text-sm text-gray-300">متصل به گوگل درایو:</p>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2 font-semibold">
                                        <GoogleIcon className="w-5 h-5" />
                                        <span>{user.googleDriveEmail}</span>
                                    </div>
                                    <button 
                                        onClick={() => onUpdate({ ...user, googleDriveEmail: undefined, googleDriveLastBackup: undefined })}
                                        className="text-xs bg-red-800 hover:bg-red-700 py-1 px-3 rounded-md"
                                    >
                                        قطع اتصال
                                    </button>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-600">
                                    <button
                                        onClick={handleBackup}
                                        disabled={isBackingUp}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                                    >
                                        {isBackingUp ? (
                                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        ) : <CloudIcon className="w-5 h-5" />}
                                        {isBackingUp ? 'در حال ایجاد فایل پشتیبان...' : 'پشتیبان‌گیری در گوگل درایو'}
                                    </button>
                                    {backupSuccessMessage && <p className="text-green-400 text-sm text-center mt-2">{backupSuccessMessage}</p>}
                                    {user.googleDriveLastBackup && (
                                        <p className="text-xs text-gray-400 text-center mt-2">
                                            آخرین پشتیبان‌گیری: {new Date(user.googleDriveLastBackup).toLocaleString('fa-IR')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-gray-300 mb-3">اطلاعات و فایل‌های سایت خود را برای پشتیبان‌گیری به گوگل درایو متصل کنید.</p>
                                <button
                                    onClick={() => onUpdate({ ...user, googleDriveEmail: user.email || 'connected@google.com' })}
                                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md transition-colors"
                                >
                                    <GoogleIcon className="w-5 h-5" />
                                    اتصال به گوگل درایو
                                </button>
                            </div>
                        )}
                    </div>
                </div>
             </div>
             <div className="mt-8 pt-6 border-t border-gray-700 text-left">
                <button onClick={handleSettingsSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition-colors">ذخیره تنظیمات</button>
            </div>
        </div>
    );
};

export default SettingsTab;
