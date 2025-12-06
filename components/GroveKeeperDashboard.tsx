
import React, { useState, useMemo, useRef } from 'react';
import { User, Order, Deed, DeedUpdate } from '../types';
import { SproutIcon, CameraIcon, CheckCircleIcon, MapPinIcon, ArrowPathIcon } from './icons';
import { useAppDispatch } from '../AppContext';
import { supabase } from '../services/supabaseClient';

// --- Helper to process image (Watermark) ---
const processEvidenceImage = async (file: File, gps: { lat: number, lng: number } | null): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("Canvas context not supported"));
                return;
            }

            // Resize logic (limit max dimension to 1200px for optimization)
            const maxDim = 1200;
            let width = img.width;
            let height = img.height;
            
            if (width > height && width > maxDim) {
                height = Math.round(height * (maxDim / width));
                width = maxDim;
            } else if (height > maxDim) {
                width = Math.round(width * (maxDim / height));
                height = maxDim;
            }

            canvas.width = width;
            canvas.height = height;
            
            // Draw Image
            ctx.drawImage(img, 0, 0, width, height);
            
            // Add Overlay Gradient at bottom
            const gradient = ctx.createLinearGradient(0, height - 150, 0, height);
            gradient.addColorStop(0, "transparent");
            gradient.addColorStop(1, "rgba(0,0,0,0.8)");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, height - 150, width, 150);

            // Add Text (Watermark)
            ctx.fillStyle = "white";
            ctx.font = "bold 24px Arial";
            ctx.textAlign = "right";
            
            const dateStr = new Date().toLocaleDateString('fa-IR');
            const timeStr = new Date().toLocaleTimeString('fa-IR');
            
            // Right side info
            ctx.fillText(`Nakhlestan Ma'na | نخلستان معنا`, width - 20, height - 60);
            ctx.font = "18px Arial";
            ctx.fillText(`${dateStr} - ${timeStr}`, width - 20, height - 30);

            // Left side GPS
            if (gps) {
                ctx.textAlign = "left";
                ctx.font = "16px Monospace";
                ctx.fillStyle = "#4ade80"; // Green color
                ctx.fillText(`LAT: ${gps.lat.toFixed(6)}`, 20, height - 60);
                ctx.fillText(`LNG: ${gps.lng.toFixed(6)}`, 20, height - 30);
            }

            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Blob creation failed"));
            }, 'image/jpeg', 0.85);
        };
        
        reader.readAsDataURL(file);
    });
};

interface GroveKeeperDashboardProps {
    currentUser: User;
    allOrders: Order[];
    onConfirmPlanting: (deedId: string, photoBase64: string) => void; // Keeping prop signature for compatibility
}

const PlantingRequestCard: React.FC<{ deed: Deed; onConfirm: (deedId: string, photoBase64: string) => void }> = ({ deed, onConfirm }) => {
    const dispatch = useAppDispatch();
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [gps, setGps] = useState<{ lat: number, lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleGetLocation = () => {
        setIsLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setGps({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setIsLocating(false);
                },
                (error) => {
                    console.error("GPS Error:", error);
                    alert("خطا در دریافت موقعیت. لطفاً GPS را روشن کنید.");
                    setIsLocating(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            alert("دستگاه شما از GPS پشتیبانی نمی‌کند.");
            setIsLocating(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
            // Auto-trigger GPS if not set
            if (!gps) handleGetLocation();
        }
    };

    const handleConfirm = async () => {
        if (!photoFile) return;
        setIsConfirming(true);
        setUploadProgress(10);

        try {
            // 1. Process Image (Watermark)
            const processedBlob = await processEvidenceImage(photoFile, gps);
            setUploadProgress(30);

            let publicUrl = '';

            // 2. Upload to Supabase (Real)
            if (supabase) {
                const fileName = `evidence/${deed.id}_${Date.now()}.jpg`;
                const { data, error } = await supabase.storage
                    .from('evidence') // Ensure this bucket exists in Supabase
                    .upload(fileName, processedBlob);

                if (error) throw error;
                
                const { data: publicData } = supabase.storage.from('evidence').getPublicUrl(fileName);
                publicUrl = publicData.publicUrl;
                setUploadProgress(70);
                
                // Update Deed Record in DB
                await supabase.from('deeds').update({
                    is_planted: true,
                    planted_at: new Date().toISOString(),
                    image_url: publicUrl,
                    gps_lat: gps?.lat,
                    gps_long: gps?.lng
                }).eq('id', deed.id); // Assuming deed.id matches DB id (might need mapping if using mock IDs)
                
            } else {
                // Fallback for Demo without Supabase
                const reader = new FileReader();
                publicUrl = await new Promise((resolve) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(processedBlob);
                });
            }

            setUploadProgress(100);
            
            // 3. Update App Context
            // Note: passing publicUrl as base64/url argument to compatible existing reducer
            // In a real app, we'd dispatch an async thunk or refresh data
            onConfirm(deed.id, publicUrl.startsWith('data:') ? publicUrl.split(',')[1] : 'REMOTE_URL_PLACEHOLDER');
            
            // Force a reload or specific update if using remote URL (since current reducer expects base64 for preview)
             if (publicUrl.startsWith('http')) {
                 // Dispatch a custom action to update deed with URL and GPS
                 // For now, we rely on the mock reducer behavior, but in prod, this would be a DB refetch.
                 alert('کاشت نخل با موفقیت ثبت و در سیستم ذخیره شد.');
             }

        } catch (error: any) {
            console.error("Upload failed", error);
            alert(`خطا در ثبت: ${error.message}`);
        } finally {
            setIsConfirming(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="bg-gray-700 p-4 rounded-lg space-y-3 border border-gray-600">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-white">نخل <span className="text-green-300">{deed.palmType}</span></p>
                    <p className="text-sm text-gray-400">به نام: {deed.name}</p>
                </div>
                <span className="text-xs text-gray-500">{new Date(deed.date).toLocaleDateString('fa-IR')}</span>
            </div>
            
            {deed.message && <p className="text-sm italic text-gray-300 border-r-2 border-green-500 pr-2">"{deed.message}"</p>}
            
            <div className="grid grid-cols-2 gap-3">
                 {/* Camera Input */}
                <label className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed cursor-pointer transition-all ${photoFile ? 'border-green-500 bg-green-900/20' : 'border-gray-500 hover:border-gray-400'}`}>
                    <CameraIcon className={`w-6 h-6 mb-1 ${photoFile ? 'text-green-400' : 'text-gray-400'}`} />
                    <span className="text-xs text-gray-300">{photoFile ? 'عکس گرفته شد' : 'دوربین'}</span>
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment" // Opens rear camera on mobile
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>

                {/* GPS Status */}
                <div 
                    onClick={handleGetLocation}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all cursor-pointer ${gps ? 'border-blue-500 bg-blue-900/20' : 'border-gray-500 bg-gray-800'}`}
                >
                    {isLocating ? (
                        <ArrowPathIcon className="w-6 h-6 text-blue-400 animate-spin" />
                    ) : (
                        <MapPinIcon className={`w-6 h-6 mb-1 ${gps ? 'text-blue-400' : 'text-gray-400'}`} />
                    )}
                    <span className="text-xs text-gray-300">
                        {isLocating ? 'دریـافت...' : gps ? 'موقعیت ثبت شد' : 'ثبت موقعیت'}
                    </span>
                </div>
            </div>

            {isConfirming && (
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-green-500 h-2 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
            )}

            <button
                onClick={handleConfirm}
                disabled={!photoFile || !gps || isConfirming}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400 text-white font-bold py-3 rounded-md transition-colors shadow-lg"
            >
                <CheckCircleIcon className="w-5 h-5" />
                {isConfirming ? 'در حال پردازش و آپلود...' : 'تایید نهایی و صدور سند'}
            </button>
        </div>
    );
};

const PlantedDeedCard: React.FC<{ deed: Deed; onAddUpdate: (deedId: string, update: DeedUpdate) => void; }> = ({ deed, onAddUpdate }) => {
    // Simplified readonly view for history
    return (
        <div className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center border border-green-500/30">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-600 rounded-md overflow-hidden relative">
                     {deed.plantedPhotoUrl ? (
                        <img src={deed.plantedPhotoUrl} alt="Planted" className="w-full h-full object-cover" />
                    ) : (
                        <SproutIcon className="w-6 h-6 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                </div>
                <div>
                    <p className="font-semibold text-white">{deed.palmType}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <CheckCircleIcon className="w-3 h-3 text-green-500"/>
                        <span>کاشته شده</span>
                    </div>
                </div>
            </div>
            {deed.gpsCoordinates && (
                <a 
                    href={`https://www.google.com/maps?q=${deed.gpsCoordinates.lat},${deed.gpsCoordinates.lng}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 p-2 bg-blue-900/20 rounded-full"
                >
                    <MapPinIcon className="w-5 h-5" />
                </a>
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
        <div className="space-y-8 pb-20">
            <div className="text-center bg-gray-800 p-6 rounded-2xl border border-gray-700">
                <div className="inline-block p-3 bg-green-900/30 rounded-full mb-3 border border-green-500/30">
                    <SproutIcon className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">پنل عملیات باغبان (Digital Twin)</h2>
                <p className="text-gray-400 mt-2 text-sm">
                    {currentUser.fullName} عزیز، شما پل ارتباطی دنیای فیزیکی و دیجیتال هستید.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* New Planting Requests */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">ماموریت‌های باز ({pendingDeeds.length})</h3>
                        <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded animate-pulse">زنده</span>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-4">
                        {pendingDeeds.length > 0 ? (
                            pendingDeeds.map(deed => <PlantingRequestCard key={deed.id} deed={deed} onConfirm={onConfirmPlanting} />)
                        ) : (
                            <div className="text-center py-12">
                                <CheckCircleIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500">همه ماموریت‌ها انجام شده‌اند.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Planting History */}
                <div>
                    <h3 className="text-xl font-bold mb-4 text-white">تاریخچه کاشت ({plantedDeeds.length})</h3>
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-3">
                         {plantedDeeds.length > 0 ? (
                            plantedDeeds.map(deed => (
                                <PlantedDeedCard key={deed.id} deed={deed} onAddUpdate={handleAddUpdate} />
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-12">هنوز نخلی کاشته نشده است.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroveKeeperDashboard;
