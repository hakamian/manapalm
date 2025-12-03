
import React, { useState, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../../AppContext';
import { PalmType, Campaign } from '../../types';
import { SproutIcon, SaplingIcon, TreeIcon, MatureTreeIcon, SparklesIcon, PencilSquareIcon, DocumentTextIcon, BoltIcon, BanknotesIcon } from '../icons';
import ToggleSwitch from '../ToggleSwitch';

const SettingsDashboard: React.FC = () => {
    const { appSettings, palmTypes } = useAppState();
    const dispatch = useAppDispatch();
    
    const [editableAppSettings, setEditableAppSettings] = useState(appSettings);
    const [editablePalmTypes, setEditablePalmTypes] = useState<PalmType[]>(palmTypes);

    useEffect(() => {
        setEditableAppSettings(appSettings);
        setEditablePalmTypes(palmTypes);
    }, [appSettings, palmTypes]);

    // Helper to format number to Persian with commas
    const formatNumber = (num: number | string) => {
        if (num === '' || num === undefined || num === null) return '';
        return Number(num).toLocaleString('fa-IR');
    };

    // Helper to parse Persian/English input with commas back to number
    const parseNumber = (str: string): number => {
        const englishStr = str
            .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
            .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()) // Arabic
            .replace(/,/g, ''); // Remove commas
        const num = Number(englishStr);
        return isNaN(num) ? 0 : num;
    };

    return (
        <div className="space-y-8">
            
            {/* SYSTEM OPERATION MODE */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                    <BoltIcon className="w-6 h-6 text-yellow-400" />
                    حالت عملیاتی سیستم (System Mode)
                </h3>
                <p className="text-sm text-gray-400 mb-6 max-w-2xl">
                    در این بخش می‌توانید نحوه عملکرد هسته مرکزی هوش مصنوعی را تغییر دهید. حالت "ارتقاء" از مدل‌های پیشرفته‌تر و منابع بیشتر استفاده می‌کند.
                </p>

                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-white mb-1">حالت ارتقاء یافته (Upgrade Mode)</h4>
                        <p className="text-xs text-gray-400">
                            فعال‌سازی قابلیت‌های پیشرفته (Reasoning، Long-Context) برای تمام ابزارها.
                        </p>
                    </div>
                    <div className="w-48">
                        <ToggleSwitch 
                            checked={editableAppSettings.enableSystemUpgrade} 
                            onChange={(checked) => {
                                const newSettings = { ...editableAppSettings, enableSystemUpgrade: checked };
                                setEditableAppSettings(newSettings);
                                dispatch({ type: 'UPDATE_APP_SETTINGS', payload: newSettings });
                            }}
                        >
                            {editableAppSettings.enableSystemUpgrade ? 'فعال (پیشرفته)' : 'غیرفعال (استاندارد)'}
                        </ToggleSwitch>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General Settings */}
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold mb-4">تنظیمات عمومی برنامه</h3>
                    <div className="space-y-4 max-w-sm">
                         {/* Currency Rate Setting */}
                        <div>
                            <label className="text-sm text-gray-400 flex items-center gap-2">
                                <BanknotesIcon className="w-4 h-4 text-green-500" />
                                نرخ تبدیل دلار به تومان
                            </label>
                            <input
                                type="text"
                                value={formatNumber(editableAppSettings.usdToTomanRate)}
                                onChange={e => {
                                    const val = parseNumber(e.target.value);
                                    setEditableAppSettings(prev => ({ ...prev, usdToTomanRate: val }));
                                }}
                                className="w-full bg-gray-700 p-2 rounded-md mt-1 text-left dir-ltr border border-gray-600 focus:border-green-500 outline-none"
                                dir="ltr"
                                placeholder="مثلا: ۱۲۰,۰۰۰"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">
                                این نرخ برای محاسبه قیمت پویای ابزارهای دلاری استفاده می‌شود.
                            </p>
                        </div>

                        <div className="border-t border-gray-700 my-4 pt-4">
                            <label className="text-sm text-gray-400">قیمت قطب‌نمای معنا (تومان)</label>
                            <input
                                type="text"
                                value={formatNumber(editableAppSettings.meaningCompassPrice)}
                                onChange={e => {
                                    const val = parseNumber(e.target.value);
                                    setEditableAppSettings(prev => ({ ...prev, meaningCompassPrice: val }));
                                }}
                                className="w-full bg-gray-700 p-2 rounded-md mt-1 text-left dir-ltr"
                                dir="ltr"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={() => dispatch({ type: 'UPDATE_APP_SETTINGS', payload: editableAppSettings })} className="py-2 px-6 bg-green-600 hover:bg-green-700 rounded-md font-semibold transition-colors">
                            ذخیره تنظیمات
                        </button>
                    </div>
                </div>

                {/* AI Tool Configuration (Alchemy Prompt) */}
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <DocumentTextIcon className="w-6 h-6 text-purple-400" />
                        پیکربندی ابزارهای هوشمند (System Prompts)
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">
                        دستورالعمل سیستمی (System Instruction) برای ابزار "مولد دوره آموزشی" (Alchemy Tool). این متن رفتار هوش مصنوعی را تعیین می‌کند.
                    </p>
                    
                    <div className="space-y-2">
                        <label className="text-sm text-gray-300 font-semibold">دستورالعمل کیمیاگری (Alchemy Prompt):</label>
                        <textarea
                            value={editableAppSettings.alchemyPrompt}
                            onChange={e => setEditableAppSettings(prev => ({ ...prev, alchemyPrompt: e.target.value }))}
                            className="w-full h-64 bg-gray-900 border border-gray-600 rounded-md p-3 text-sm text-gray-200 font-mono leading-relaxed focus:ring-2 focus:ring-purple-500 custom-scrollbar"
                            dir="ltr"
                            placeholder="System instruction for course generation..."
                        />
                        <p className="text-xs text-gray-500">
                            نکته: از تگ <span className="font-mono text-yellow-500">{`{{SOURCE_CONTEXT}}`}</span> به عنوان محل قرارگیری محتوای ورودی کاربر استفاده کنید.
                        </p>
                    </div>
                    
                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={() => dispatch({ type: 'UPDATE_APP_SETTINGS', payload: editableAppSettings })} className="py-2 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-semibold shadow-lg transition-colors">
                            بروزرسانی پرامپت
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold mb-4">مدیریت انواع نخل</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                    {editablePalmTypes.map((palm, index) => (
                         <div key={palm.id} className="bg-gray-700/50 p-3 rounded-lg flex items-center gap-4">
                            <div className="w-8 h-8 text-green-300 flex-shrink-0">
                                { { 'p_heritage_meaning': <SproutIcon />, 'p_heritage_iran': <SproutIcon />, 'p_heritage_memorial': <SaplingIcon />, 'p_heritage_occasion': <SaplingIcon />, 'p_heritage_birthday': <TreeIcon />, 'p_heritage_gift': <TreeIcon />, 'p_heritage_campaign_100': <MatureTreeIcon /> }[palm.id] || <SproutIcon/> }
                            </div>
                            <span className="flex-grow font-semibold text-sm">{palm.name}</span>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-400">قیمت:</label>
                                <input 
                                    type="text" 
                                    value={formatNumber(palm.price)} 
                                    onChange={e => { 
                                        const val = parseNumber(e.target.value);
                                        const newPalms = [...editablePalmTypes]; 
                                        newPalms[index].price = val; 
                                        setEditablePalmTypes(newPalms); 
                                    }} 
                                    className="w-28 bg-gray-600 p-1 rounded-md text-sm text-center"
                                    dir="ltr"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-400">امتیاز:</label>
                                <input 
                                    type="text" 
                                    value={formatNumber(palm.points)} 
                                    onChange={e => { 
                                        const val = parseNumber(e.target.value);
                                        const newPalms = [...editablePalmTypes]; 
                                        newPalms[index].points = val; 
                                        setEditablePalmTypes(newPalms); 
                                    }} 
                                    className="w-24 bg-gray-600 p-1 rounded-md text-sm text-center"
                                    dir="ltr"
                                />
                            </div>
                         </div>
                    ))}
                </div>
                <div className="flex justify-end gap-4 mt-6">
                     <button className="flex items-center gap-1 text-sm py-2 px-4 bg-blue-800 hover:bg-blue-700 rounded-md transition-colors">
                        <SparklesIcon className="w-4 h-4" /> مشاوره قیمت‌گذاری
                    </button>
                    <button onClick={() => dispatch({ type: 'UPDATE_PALM_TYPES', payload: editablePalmTypes })} className="py-2 px-6 bg-green-600 hover:bg-green-700 rounded-md font-semibold transition-colors">ذخیره تغییرات نخل‌ها</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsDashboard;
