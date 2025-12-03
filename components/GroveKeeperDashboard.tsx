import React, { useState, useMemo } from 'react';
import { User, Order, Deed, DeedUpdate } from '../types';
import { SproutIcon, CameraIcon, CheckCircleIcon } from './icons';
import { useAppDispatch } from '../AppContext';

const fileToDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

const fileToRawBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // remove the Data URI part
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });

interface GroveKeeperDashboardProps {
    currentUser: User;
    allOrders: Order[];
    onConfirmPlanting: (deedId: string, photoBase64: string) => void;
}

const PlantingRequestCard: React.FC<{ deed: Deed; onConfirm: (deedId: string, photoBase64: string) => void }> = ({ deed, onConfirm }) => {
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const handleConfirm = async () => {
        if (!photoFile) {
            alert("لطفاً یک عکس از نخل کاشته شده آپلود کنید.");
            return;
        }
        setIsConfirming(true);
        try {
            const base64 = await fileToRawBase64(photoFile);
            onConfirm(deed.id, base64);
        } catch (error) {
            console.error("Error converting file to base64", error);
            alert("خطا در پردازش تصویر. لطفا دوباره تلاش کنید.");
            setIsConfirming(false);
        }
    };

    return (
        <div className="bg-gray-700 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-white">نخل <span className="text-green-300">{deed.palmType}</span></p>
                    <p className="text-sm text-gray-400">به نام: {deed.name}</p>
                </div>
                <span className="text-xs text-gray-500">{new Date(deed.date).toLocaleDateString('fa-IR')}</span>
            </div>
            {deed.message && <p className="text-sm italic text-gray-300 border-r-2 border-green-500 pr-2">"{deed.message}"</p>}
            <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">عکس نخل کاشته شده:</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)}
                    className="text-xs w-full bg-gray-600 border border-gray-500 rounded-md file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
                />
            </div>
            <button
                onClick={handleConfirm}
                disabled={!photoFile || isConfirming}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-2 rounded-md transition-colors"
            >
                <CheckCircleIcon className="w-5 h-5" />
                {isConfirming ? 'در حال ثبت...' : 'تایید کاشت و ثبت خاطره'}
            </button>
        </div>
    );
};

const PlantedDeedCard: React.FC<{ deed: Deed; onAddUpdate: (deedId: string, update: DeedUpdate) => void; }> = ({ deed, onAddUpdate }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [report, setReport] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!photoFile || !report.trim()) return;
        setIsSubmitting(true);
        try {
            const photoUrl = await fileToDataURL(photoFile);
            const newUpdate: DeedUpdate = {
                date: new Date().toISOString(),
                photoUrl,
                report,
            };
            onAddUpdate(deed.id, newUpdate);
            // Reset form
            setIsUpdating(false);
            setReport('');
            setPhotoFile(null);
        } catch (error) {
            console.error("Error submitting update:", error);
            alert('خطا در ثبت گزارش.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-700/50 p-3 rounded-lg">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    {deed.plantedPhotoUrl ? (
                        <img src={deed.plantedPhotoUrl} alt={`Planted ${deed.palmType}`} className="w-12 h-12 rounded-md object-cover" />
                    ) : (
                        <div className="w-12 h-12 bg-gray-600 rounded-md flex items-center justify-center">
                            <SproutIcon className="w-6 h-6 text-gray-400" />
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-white">{deed.palmType}</p>
                        <p className="text-sm text-gray-400">برای: {deed.name}</p>
                    </div>
                </div>
                <button onClick={() => setIsUpdating(!isUpdating)} className="text-xs py-1 px-3 bg-blue-600 hover:bg-blue-700 rounded-md">
                    {isUpdating ? 'بستن' : 'افزودن گزارش'}
                </button>
            </div>
            {isUpdating && (
                <form onSubmit={handleSubmitUpdate} className="mt-3 pt-3 border-t border-gray-600 space-y-2">
                    <div>
                        <label className="text-xs font-semibold text-gray-300 block mb-1">گزارش وضعیت رشد:</label>
                        <textarea value={report} onChange={e => setReport(e.target.value)} rows={2} required className="w-full bg-gray-600 text-sm p-2 rounded-md" />
                    </div>
                    <div>
                         <label className="text-xs font-semibold text-gray-300 block mb-1">عکس جدید نخل:</label>
                         <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)} required className="text-xs w-full bg-gray-600 border border-gray-500 rounded-md file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700" />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full text-sm py-2 bg-green-600 hover:bg-green-700 rounded-md disabled:bg-gray-500">
                        {isSubmitting ? 'در حال ثبت...' : 'ثبت گزارش رشد'}
                    </button>
                </form>
            )}
        </div>
    );
};

const GroveKeeperDashboard: React.FC<GroveKeeperDashboardProps> = ({ currentUser, allOrders, onConfirmPlanting }) => {
    const dispatch = useAppDispatch();
    
    const assignedDeeds = useMemo(() => {
        return allOrders.flatMap(order => order.deeds || []).filter(deed => deed.groveKeeperId === currentUser.id);
    }, [allOrders, currentUser.id]);

    const pendingDeeds = assignedDeeds.filter(deed => !deed.isPlanted);
    const plantedDeeds = assignedDeeds.filter(deed => deed.isPlanted);
    
    const handleAddUpdate = (deedId: string, update: DeedUpdate) => {
        dispatch({ type: 'ADD_DEED_UPDATE', payload: { deedId, update } });
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold">پنل نگهبان نخلستان</h2>
                <p className="text-gray-400 mt-2">خوش آمدید، {currentUser.fullName}. شما یک بخش مهم از این جنبش هستید.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* New Planting Requests */}
                <div>
                    <h3 className="text-xl font-bold mb-4">درخواست‌های کاشت جدید ({pendingDeeds.length})</h3>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 max-h-[60vh] overflow-y-auto space-y-4">
                        {pendingDeeds.length > 0 ? (
                            pendingDeeds.map(deed => <PlantingRequestCard key={deed.id} deed={deed} onConfirm={onConfirmPlanting} />)
                        ) : (
                            <p className="text-center text-gray-500 py-10">درخواست جدیدی برای کاشت وجود ندارد.</p>
                        )}
                    </div>
                </div>

                {/* Planting History */}
                <div>
                    <h3 className="text-xl font-bold mb-4">تاریخچه کاشت ({plantedDeeds.length})</h3>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 max-h-[60vh] overflow-y-auto space-y-3">
                         {plantedDeeds.length > 0 ? (
                            plantedDeeds.map(deed => (
                                <PlantedDeedCard key={deed.id} deed={deed} onAddUpdate={handleAddUpdate} />
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-10">هنوز نخلی کاشته نشده است.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroveKeeperDashboard;