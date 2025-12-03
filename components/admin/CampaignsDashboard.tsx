
import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../AppContext';
import { Campaign } from '../../types';
import { generateCampaignIdea } from '../../services/geminiService';
import { SparklesIcon } from '../icons';

interface CampaignsDashboardProps {
    campaign: Campaign;
    platformData: any;
}

const CampaignsDashboard: React.FC<CampaignsDashboardProps> = ({ campaign, platformData }) => {
    const dispatch = useAppDispatch();
    const [editableCampaign, setEditableCampaign] = useState<Campaign>(campaign);
    const [suggestedCampaign, setSuggestedCampaign] = useState<Campaign | null>(null);
    const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => setEditableCampaign(campaign), [campaign]);

    const handleGenerateCampaign = async () => {
        setIsGeneratingCampaign(true);
        setSuggestedCampaign(null);
        setError(null);
        try {
            const result = await generateCampaignIdea(platformData);
            setSuggestedCampaign({ ...result, id: `suggested-${Date.now()}`, current: 0 });
        } catch (e) {
            console.error(e);
            setError("خطا در تولید ایده کمپین. لطفا دوباره تلاش کنید.");
        } finally {
            setIsGeneratingCampaign(false);
        }
    };

    const pastCampaigns = [
        { id: 'past1', title: 'کمپین روز پدر', goal: 50, current: 62, unit: 'نخل', status: 'موفق' },
        { id: 'past2', title: 'کمپین بهاره', goal: 200, current: 150, unit: 'نخل', status: 'پایان یافته' }
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI Campaign Generator */}
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><SparklesIcon className="text-blue-400"/> مولد کمپین هوشمند</h3>
                    <p className="text-sm text-gray-400 mb-4">از هوش مصنوعی بخواهید با تحلیل داده‌های سایت، یک ایده کمپین جدید و خلاقانه برای شما طراحی کند.</p>
                    <button onClick={handleGenerateCampaign} disabled={isGeneratingCampaign} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md disabled:bg-gray-600">
                        {isGeneratingCampaign ? 'در حال ایده‌پردازی...' : 'ایده کمپین جدید بساز'}
                    </button>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    {suggestedCampaign && (
                        <div className="mt-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                            <h4 className="font-bold text-lg text-green-300">{suggestedCampaign.title}</h4>
                            <p className="text-sm text-gray-300 my-2">{suggestedCampaign.description}</p>
                            <div className="text-xs space-y-1">
                                <p><strong>هدف:</strong> {suggestedCampaign.goal.toLocaleString('fa-IR')} {suggestedCampaign.unit}</p>
                                <p><strong>پاداش:</strong> {suggestedCampaign.rewardPoints?.toLocaleString('fa-IR')} امتیاز</p>
                            </div>
                            <button onClick={() => setEditableCampaign(suggestedCampaign)} className="mt-3 text-xs bg-green-700 hover:bg-green-600 py-1 px-3 rounded-md">فعالسازی این کمپین</button>
                        </div>
                    )}
                </div>

                {/* Current Campaign */}
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold mb-4">مدیریت کمپین فعلی</h3>
                    <div className="space-y-3">
                        <div><label className="text-sm">عنوان</label><input type="text" value={editableCampaign.title} onChange={e => setEditableCampaign(p => ({...p, title: e.target.value}))} className="w-full bg-gray-700 p-2 rounded-md mt-1" /></div>
                        <div><label className="text-sm">توضیحات</label><textarea value={editableCampaign.description} onChange={e => setEditableCampaign(p => ({...p, description: e.target.value}))} rows={2} className="w-full bg-gray-700 p-2 rounded-md mt-1" /></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-sm">هدف</label><input type="number" value={editableCampaign.goal} onChange={e => setEditableCampaign(p => ({...p, goal: Number(e.target.value)}))} className="w-full bg-gray-700 p-2 rounded-md mt-1" /></div>
                            <div><label className="text-sm">پیشرفت فعلی</label><input type="number" value={editableCampaign.current} onChange={e => setEditableCampaign(p => ({...p, current: Number(e.target.value)}))} className="w-full bg-gray-700 p-2 rounded-md mt-1" /></div>
                        </div>
                    </div>
                    <button onClick={() => dispatch({ type: 'UPDATE_CAMPAIGN', payload: editableCampaign })} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md">ذخیره تغییرات کمپین</button>
                </div>
            </div>

            {/* Past Campaigns */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold mb-4">تاریخچه کمپین‌ها</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {pastCampaigns.map(c => (
                        <div key={c.id} className="bg-gray-700/50 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold">{c.title}</h4>
                                    <p className="text-xs text-gray-400">نتیجه: {c.current.toLocaleString('fa-IR')} / {c.goal.toLocaleString('fa-IR')}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${c.status === 'موفق' ? 'bg-green-800 text-green-200' : 'bg-gray-600'}`}>{c.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CampaignsDashboard;
