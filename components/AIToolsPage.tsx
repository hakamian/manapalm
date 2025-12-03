


import React, { useState, useMemo } from 'react';
import { AITool, User, CREATIVE_ACT_STORAGE_LIMIT, Page, View } from '../types.ts';
import Chatbot from './tools/Chatbot.tsx';
import ContentGenerator from './tools/ContentGenerator.tsx';
import ImageGenerator from './tools/ImageGenerator.tsx';
import VideoGenerator from './tools/VideoGenerator.tsx';
import LiveChat from './tools/LiveChat.tsx';
import TranscribeTool from './tools/TranscribeTool.tsx';
import ImageEditTool from './tools/ImageEditTool.tsx';
import TextToSpeechTool from './tools/TextToSpeechTool.tsx';
import CodeArchitectTool from './tools/CodeArchitectTool.tsx';
import DeepThinkingTool from './tools/DeepThinkingTool.tsx';
import { VideoCameraIcon, SparklesIcon, PlusCircleIcon, ArrowRightIcon, ChatBubbleBottomCenterTextIcon, ArrowLeftIcon, LockClosedIcon } from './icons.tsx';
import PurchaseStorageModal from './PurchaseStorageModal.tsx';
import { useAppDispatch } from '../AppContext.tsx';

const DummyTool: React.FC<{ title: string }> = ({ title }) => (
    <div className="w-full h-full min-h-96 bg-stone-100 dark:bg-stone-800/50 rounded-2xl flex items-center justify-center border border-stone-200 dark:border-stone-700">
        <h2 className="text-2xl text-stone-400 dark:text-stone-500 font-bold">{title}</h2>
    </div>
);

const ToolCard: React.FC<{
  tool: { id: string; name: string; icon: string | React.FC<any>; description: string; loginRequired: boolean; };
  onClick: () => void;
  disabled: boolean;
}> = ({ tool, onClick, disabled }) => {
  const IconComponent = tool.icon;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group w-full h-full text-right flex flex-col p-6 rounded-2xl transition-all duration-300 ${
        disabled
          ? 'bg-stone-100 dark:bg-stone-800/30 opacity-60 cursor-not-allowed'
          : 'bg-white dark:bg-stone-800/50 hover:bg-amber-50 dark:hover:bg-stone-700/50 hover:shadow-lg hover:-translate-y-1'
      } border border-stone-200/80 dark:border-stone-700/50`}
    >
      <div className="flex-shrink-0">
        {typeof IconComponent === 'string' ? (
            <span className="text-3xl w-10 h-10 mb-3 inline-block">{IconComponent}</span>
        ) : (
            <IconComponent className="w-10 h-10 text-amber-500 mb-3" />
        )}
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-lg text-stone-800 dark:text-stone-100">{tool.name}</h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{tool.description}</p>
      </div>
      {disabled && <p className="text-xs font-semibold text-red-500 mt-2 pt-2 border-t border-red-200 dark:border-red-800/50">برای استفاده از این ابزار وارد شوید</p>}
    </button>
  );
};

interface AIToolsPageProps {
    user: User | null;
    onUpdateProfile: (updatedUser: Partial<User>) => void;
    onPurchaseStorage: () => void;
}

const AIToolsPage: React.FC<AIToolsPageProps> = ({ user, onUpdateProfile, onPurchaseStorage }) => {
    const dispatch = useAppDispatch();
    const handleSetPage = (page: Page) => dispatch({ type: 'SET_VIEW', payload: page as View });
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0B0F17] text-white pt-22 pb-24 flex items-center justify-center">
                <div className="max-w-lg mx-auto px-6 text-center animate-fade-in-up">
                    <div className="bg-gray-900/80 p-8 rounded-2xl border border-purple-500/30 shadow-2xl backdrop-blur-md">
                        <SparklesIcon className="w-16 h-16 mx-auto text-purple-400 mb-6 animate-pulse" />
                        <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">خلوت آفرینش</h1>
                        <p className="text-gray-300 mb-8 leading-relaxed">
                            برای دسترسی به ابزارهای هوش مصنوعی و خلق میراث دیجیتال خود، لطفاً وارد حساب کاربری شوید. این فضا برای اعضای خانواده نخلستان معنا طراحی شده است.
                        </p>
                        <button 
                            onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                        >
                            <LockClosedIcon className="w-5 h-5" />
                            ورود / عضویت
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const creativeActsCount = useMemo(() => {
        if (!user) return 0;
        return user.timeline?.filter(e => e.type === 'creative_act').length || 0;
    }, [user]);

    const creativeCapacity = user?.creativeStorageCapacity || CREATIVE_ACT_STORAGE_LIMIT;
    const storageUsagePercentage = (creativeActsCount / creativeCapacity) * 100;

    const handleConfirmPurchase = () => {
        onPurchaseStorage();
        setIsPurchaseModalOpen(false);
    };

    const tools: { id: string; name: string; icon: string | React.FC<any>; description: string; loginRequired: boolean }[] = [
        { id: 'imageGen', name: 'استودیو تصویر نمادین', icon: '🎨', description: 'ایده‌های خود را به تصاویر هنری تبدیل کنید.', loginRequired: true },
        { id: 'contentGen', name: 'دستیار نویسنده معنا', icon: ChatBubbleBottomCenterTextIcon, description: 'بر اساس سفر شما، محتوای الهام‌بخش خلق کنید.', loginRequired: true },
        { id: 'chatbot', name: 'چت‌بات (Flash)', icon: '💬', description: 'دستیار هوشمند برای پاسخ به سوالات شما.', loginRequired: false },
        { id: 'videoGen', name: 'تولید ویدیو (Veo)', icon: '🎬', description: 'از متن یا تصویر، ویدیوهای کوتاه بسازید.', loginRequired: true },
        { id: 'imageEdit', name: 'ویرایش تصویر (Flash Image)', icon: '✂️', description: 'تصاویر خود را با هوش مصنوعی ویرایش کنید.', loginRequired: true },
        { id: 'videoAnalyze', name: 'تحلیل ویدیو (Pro)', icon: '📊', description: 'محتوای ویدیوهای خود را تحلیل کنید.', loginRequired: true },
        { id: 'liveChat', name: 'گفتگوی زنده (Live API)', icon: '🎤', description: 'مکالمه صوتی بی‌درنگ با هوش مصنوعی.', loginRequired: true },
        { id: 'search', name: 'جستجوی وب', icon: '🌐', description: 'دریافت پاسخ‌های به‌روز از سطح وب.', loginRequired: false },
        { id: 'maps', name: 'جستجوی نقشه', icon: '🗺️', description: 'اطلاعات مکانی را جستجو کنید.', loginRequired: false },
        { id: 'transcribe', name: 'رونویسی صدا (Flash)', icon: '✍️', description: 'فایل‌های صوتی را به متن تبدیل کنید.', loginRequired: true },
        { id: 'thinking', name: 'تفکر عمیق (Pro)', icon: '🧠', description: 'برای مسائل پیچیده، از مدل کمک بگیرید.', loginRequired: true },
    ];

    const renderActiveTool = () => {
        switch (activeTool) {
            case 'chatbot':
                return <Chatbot />;
            case 'imageGen':
                return <ImageGenerator user={user!} onUpdateProfile={onUpdateProfile} creativeActsCount={creativeActsCount} creativeStorageCapacity={creativeCapacity} onOpenPurchaseModal={() => setIsPurchaseModalOpen(true)} />;
            case 'contentGen':
                return <ContentGenerator user={user!} onUpdateProfile={onUpdateProfile} />;
            case 'videoGen':
                return <VideoGenerator user={user!} onUpdateProfile={onUpdateProfile} creativeActsCount={creativeActsCount} creativeStorageCapacity={creativeCapacity} onOpenPurchaseModal={() => setIsPurchaseModalOpen(true)} />;
            case 'liveChat':
                return <LiveChat />;
            case 'transcribe':
                return <TranscribeTool user={user!} />;
            case 'imageEdit':
                return <ImageEditTool />;
            case 'tts':
                return <TextToSpeechTool />;
            case 'codeGen':
                 return <CodeArchitectTool />;
            case 'thinking':
                return <DeepThinkingTool />;
            default:
                const selectedTool = tools.find(t => t.id === activeTool);
                return <DummyTool title={selectedTool?.name || 'ابزار هوش مصنوعی'} />;
        }
    };

    if (activeTool) {
        return (
            <div className="animate-fade-in">
                 <button 
                    onClick={() => setActiveTool(null)}
                    className="mb-6 font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2 hover:underline"
                >
                    <ArrowRightIcon className="w-5 h-5" />
                    بازگشت به همه ابزارها
                </button>
                {renderActiveTool()}
            </div>
        );
    }

    return (
        <>
            <div className="space-y-8 animate-fade-in-up">
                 <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-amber-900 dark:text-amber-200 mb-3">آزمایشگاه معنا</h1>
                    <p className="text-lg text-stone-600 dark:text-stone-300 max-w-3xl mx-auto">
                        اینجا فضای خلاقیت شماست. با کمک هوش مصنوعی، ایده‌های خود را بپرورانید، محتوای منحصر به فرد خلق کنید و کسب‌وکار خود را رشد دهید.
                    </p>
                </div>

                <div 
                    className="bg-gradient-to-br from-amber-400 to-orange-500 dark:from-amber-600 dark:to-orange-700 text-white rounded-3xl p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl shadow-amber-500/30"
                >
                    <div className="text-center md:text-right">
                        <h2 className="text-2xl md:text-3xl font-bold">معمار میراث دیجیتال شما</h2>
                        <p className="mt-2 max-w-xl text-amber-50">
                            پلتفرم نخلستان معنا توسط گروه ماناپالم طراحی شده است. شما هم می‌توانید وب‌سایت شخصی یا کسب‌وکار خود را با تخصص تیم ما طراحی کرده و ۹۰٪ هزینه آن را به یک حرکت اجتماعی تبدیل نمایید.
                        </p>
                    </div>
                    <button 
                        onClick={() => handleSetPage(View['digital-heritage-architect'])}
                        className="bg-white text-amber-800 font-bold px-8 py-3 rounded-xl hover:bg-amber-100 transition-all transform hover:scale-105 shadow-lg flex-shrink-0 flex items-center gap-2"
                    >
                        <span>اطلاعات بیشتر</span>
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                </div>

                {user && (
                    <div className="max-w-md mx-auto p-4 bg-stone-100 dark:bg-stone-800 rounded-lg">
                        <h3 className="text-sm font-bold flex items-center gap-1.5"><SparklesIcon className="w-4 h-4 text-amber-500"/> گالری خلاقیت شما</h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 mb-2">ظرفیت ذخیره آثار هنری شما در گاهشمار.</p>
                         <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${storageUsagePercentage}%` }}></div>
                        </div>
                        <p className="text-xs text-center mt-1 font-semibold">{creativeActsCount} / {creativeCapacity} اثر ذخیره شده</p>
                        <button onClick={() => setIsPurchaseModalOpen(true)} className="w-full mt-2 text-xs flex items-center justify-center gap-1 font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors">
                            <PlusCircleIcon className="w-4 h-4" />
                            افزایش ظرفیت
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.map(tool => (
                        <ToolCard
                            key={tool.id}
                            tool={tool}
                            onClick={() => setActiveTool(tool.id)}
                            disabled={tool.loginRequired && !user}
                        />
                    ))}
                </div>
            </div>
            {user && (
                <PurchaseStorageModal
                    isOpen={isPurchaseModalOpen}
                    onClose={() => setIsPurchaseModalOpen(false)}
                    userPoints={user.points}
                    onConfirm={handleConfirmPurchase}
                />
            )}
        </>
    );
};

export default AIToolsPage;

