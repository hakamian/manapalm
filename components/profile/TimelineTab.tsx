
import React, { useState } from 'react';
import { User, TimelineEvent, View, Deed, Order } from '../../types';
import { SproutIcon, ShareIcon, SparklesIcon, PhotoIcon, PencilSquareIcon } from '../icons';
import { getAIAssistedText } from '../../services/geminiService';
import DeedDisplay from '../DeedDisplay';

interface TimelineTabProps {
    user: User;
    onStartPlantingFlow: () => void;
    onNavigate: (view: View) => void;
    onUpdateTimelineEvent: (deedId: string, memory: { text?: string, image?: string }) => void;
    orders: Order[];
    onOpenDeedModal: (deed: Deed) => void;
}

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

const TimelineHeader: React.FC<{ user: User; onStartPlantingFlow: () => void; onNavigate: (view: View) => void; mergedTimeline: any[] }> = ({ user, onStartPlantingFlow, onNavigate, mergedTimeline }) => {
    const sortedTimeline = [...mergedTimeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastEvent = sortedTimeline[0];
    let isActive = false;
    if (lastEvent) {
        const daysSinceLastEvent = (new Date().getTime() - new Date(lastEvent.date).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastEvent <= 7) {
            isActive = true;
        }
    }

    if (isActive) {
        return (
            <div className="bg-gray-800 p-6 rounded-lg border border-green-700/50 mb-8 text-center">
                <SparklesIcon className="w-10 h-10 mx-auto text-green-400 mb-3" />
                <h3 className="text-xl font-bold">در مسیر رشد باقی بمانید!</h3>
                <p className="text-gray-300 mt-2 max-w-xl mx-auto">
                    شما فعالانه در حال ساختن داستان خود هستید. این حرکت را ادامه دهید. شاید اکنون زمان خوبی برای بازنگری در اهداف یا شروع یک چالش جدید باشد.
                </p>
                <div className="mt-4 flex justify-center gap-3">
                    <button onClick={() => onNavigate(View.PathOfMeaning)} className="text-sm py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md">مشاهده مسیر معنا</button>
                    <button onClick={() => onNavigate(View.Courses)} className="text-sm py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md">کاوش در دوره‌ها</button>
                </div>
            </div>
        );
    } else {
        return (
            <div className="bg-gray-800 p-6 rounded-lg border-2 border-dashed border-gray-600 mb-8 text-center">
                <SproutIcon className="w-10 h-10 mx-auto text-yellow-400 mb-3" />
                <h3 className="text-xl font-bold">سفر معنا با قدم‌های کوچک ادامه می‌یابد</h3>
                <p className="text-gray-300 mt-2 max-w-xl mx-auto">
                    {lastEvent ? 'مدتی است که در گاهشمار خود رویدادی ثبت نکرده‌اید.' : 'گاهشمار شما منتظر اولین داستان است.'}
                    آماده برداشتن قدم بعدی هستید؟
                </p>
                <div className="mt-4 flex justify-center gap-3">
                    <button onClick={onStartPlantingFlow} className="text-sm py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md">کاشت یک نخل جدید</button>
                    <button onClick={() => onNavigate(View.DailyOasis)} className="text-sm py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md">ثبت یادداشت روزانه</button>
                </div>
            </div>
        );
    }
};

const TimelineTab: React.FC<TimelineTabProps> = ({ user, onStartPlantingFlow, onNavigate, onUpdateTimelineEvent, orders, onOpenDeedModal }) => {
    const [editingMemoryDeedId, setEditingMemoryDeedId] = useState<string | null>(null);
    const [editingMemoryText, setEditingMemoryText] = useState('');
    const [isAIAssistLoading, setIsAIAssistLoading] = useState(false);

    const sortedTimeline = [...(user.timeline || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 🛡️ DYNAMIC TIMELINE GENERATION
    // Generate events from Orders/Deeds directly, to ensure they show up even if metadata is stale
    const generatedEvents = orders.flatMap(order => {
        const events: any[] = [];

        // 1. Deed Events (Palms)
        if (order.deeds && order.deeds.length > 0) {
            order.deeds.forEach(deed => {
                events.push({
                    type: 'palm_planted',
                    date: order.date || new Date().toISOString(),
                    title: `کاشت نخل: ${deed.intention}`,
                    deedId: deed.id,
                    deedIntention: deed.intention,
                    details: {
                        title: `نخل ${deed.id.substring(0, 8)}`,
                        description: `سفارش ${order.id.substring(0, 8)}`
                    },
                    memoryText: user.timeline?.find(e => e.deedId === deed.id)?.memoryText || '',
                    memoryImage: user.timeline?.find(e => e.deedId === deed.id)?.memoryImage || ''
                });
            });
        }

        // 2. Standard Product Events (Only if no deeds, or as a separate group)
        // If it's a "Standard Purchase" without deeds, we still want it in the timeline
        const standardItems = order.items.filter(i => i.type !== 'heritage');
        if (standardItems.length > 0 && (!order.deeds || order.deeds.length === 0)) {
            events.push({
                type: 'creative_act',
                date: order.date || new Date().toISOString(),
                title: 'خرید از بازارچه نخلستان',
                deedId: `order-${order.id}`,
                details: {
                    title: standardItems.map(i => i.name).join('، '),
                    description: `شماره سفارش: ${order.id.substring(0, 8)}`
                },
                memoryText: '',
                memoryImage: standardItems[0].image
            });
        }

        return events;
    });

    // Merge and deduplicate (prefer user.timeline if it exists, as it might have edited details)
    const existingDeedIds = new Set(user.timeline?.map(e => e.deedId).filter(Boolean));
    const newEvents = generatedEvents.filter(e => !existingDeedIds.has(e.deedId));

    // Final merged list
    const mergedTimeline = [...(user.timeline || []), ...newEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleEditMemory = (deedId: string) => {
        const event = mergedTimeline.find(e => e.deedId === deedId); // Search in MERGED timeline
        setEditingMemoryDeedId(deedId);
        setEditingMemoryText(event?.memoryText || '');
    };

    const handleSaveMemory = (deedId: string, event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const text = editingMemoryText;
        const imageFile = formData.get('memoryImage') as File;

        if (imageFile && imageFile.size > 0) {
            fileToBase64(imageFile).then(base64Image => {
                onUpdateTimelineEvent(deedId, { text, image: base64Image });
            });
        } else {
            onUpdateTimelineEvent(deedId, { text });
        }
        setEditingMemoryDeedId(null);
        setEditingMemoryText('');
    };

    const handleMemoryAIAssist = async (mode: 'generate' | 'improve', deedId: string) => {
        const deed = orders.flatMap(o => o.deeds || []).find(d => d.id === deedId);
        if (!deed) return;

        setIsAIAssistLoading(true);
        try {
            const response = await getAIAssistedText({
                mode,
                type: 'timeline_memory',
                text: editingMemoryText,
                context: deed.intention,
            });
            setEditingMemoryText(response);
        } catch (e) {
            console.error(e);
        } finally {
            setIsAIAssistLoading(false);
        }
    };

    return (
        <div>
            <TimelineHeader user={user} onStartPlantingFlow={onStartPlantingFlow} onNavigate={onNavigate} mergedTimeline={mergedTimeline} />
            <h2 className="text-2xl font-bold mb-6">گاهشمار معنای شما</h2>
            <div className="relative pl-4 border-r-2 border-gray-700">
                {mergedTimeline.map((event, index) => (
                    <div key={index} className="mb-8 pl-8 relative">
                        <div className="absolute -right-[7px] top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-gray-900"></div>
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                    {event.type === 'palm_planted' ? <SproutIcon className="w-6 h-6 text-green-400" /> : <ShareIcon className="w-6 h-6 text-blue-400" />}
                                    <h3 className="font-bold mr-3">{event.type === 'palm_planted' ? `نخل کاشته شد: ${event.deedIntention || event.details.title}` : 'سند به اشتراک گذاشته شد'}</h3>
                                </div>
                                <span className="text-xs text-gray-400">{new Date(event.date).toLocaleDateString('fa-IR')}</span>
                            </div>
                            {event.type === 'palm_planted' && event.deedId && (
                                editingMemoryDeedId === event.deedId ? (
                                    <form onSubmit={(e) => handleSaveMemory(event.deedId!, e)} className="mt-4 space-y-3 bg-gray-700/50 p-3 rounded-md">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-sm font-semibold">ثبت خاطره</label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMemoryAIAssist(editingMemoryText ? 'improve' : 'generate', event.deedId!)}
                                                    disabled={isAIAssistLoading}
                                                    className="flex items-center gap-1 text-xs py-1 px-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white disabled:bg-gray-500" title="کمک گرفتن از هوش مصنوعی">
                                                    <SparklesIcon className="w-4 h-4" />
                                                    <span>{editingMemoryText ? 'بهبود با AI' : 'کمک از AI'}</span>
                                                </button>
                                            </div>
                                            <textarea name="memoryText" value={editingMemoryText} onChange={(e) => setEditingMemoryText(e.target.value)} rows={3} className="w-full bg-gray-800 p-2 rounded-md" placeholder="خاطره خود را بنویسید..."></textarea>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold mb-1 block">افزودن عکس (اختیاری)</label>
                                            <input type="file" name="memoryImage" accept="image/*" className="text-xs" />
                                        </div>
                                        <div className="text-left">
                                            <button type="button" onClick={() => setEditingMemoryDeedId(null)} className="text-xs py-1 px-3 bg-gray-600 rounded-md">انصراف</button>
                                            <button type="submit" className="text-xs py-1 px-3 bg-green-600 rounded-md mr-2">ذخیره</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        {(event.memoryText || event.memoryImage) && (
                                            <div className="mt-3 pt-3 border-t border-gray-700">
                                                {event.memoryImage && <img src={event.memoryImage} alt="Memory" className="rounded-md max-h-48 w-auto mb-2" />}
                                                <p className="text-gray-300 italic">"{event.memoryText}"</p>
                                            </div>
                                        )}
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {(() => {
                                                const deed = orders.flatMap(o => o.deeds || []).find(d => d.id === event.deedId);
                                                if (deed) {
                                                    return (
                                                        <>
                                                            <button onClick={() => onOpenDeedModal(deed)} className="text-xs bg-blue-800 hover:bg-blue-700 py-1 px-3 rounded-md flex items-center gap-1"><PhotoIcon className="w-4 h-4" /> مشاهده سند</button>
                                                            <button onClick={() => handleEditMemory(event.deedId!)} className="text-xs bg-yellow-800 hover:bg-yellow-700 py-1 px-3 rounded-md flex items-center gap-1"><PencilSquareIcon className="w-4 h-4" /> {event.memoryText ? 'ویرایش خاطره' : 'افزودن خاطره'}</button>
                                                        </>
                                                    );
                                                }
                                                // Deed not found in orders - show fallback
                                                return (
                                                    <button onClick={() => handleEditMemory(event.deedId!)} className="text-xs bg-yellow-800 hover:bg-yellow-700 py-1 px-3 rounded-md flex items-center gap-1"><PencilSquareIcon className="w-4 h-4" /> {event.memoryText ? 'ویرایش خاطره' : 'افزودن خاطره'}</button>
                                                );
                                            })()}
                                        </div>
                                    </>
                                )
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimelineTab;
