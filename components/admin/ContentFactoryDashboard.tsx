
import React, { useState, useEffect, useRef } from 'react';
import { CommunityPost, ArticleDraft } from '../../types';
import { analyzeCommunitySentimentAndTopics, generateArticleDraft } from '../../services/geminiService';
import { SparklesIcon, MegaphoneIcon, PencilSquareIcon, PhotoIcon, CloudIcon, BoltIcon, CogIcon } from '../icons';
import CloudinaryUploadWidget from '../ui/CloudinaryUploadWidget';
import SmartImage from '../ui/SmartImage';
import { supabase } from '../../services/supabaseClient';

interface ContentFactoryDashboardProps {
    posts: CommunityPost[];
}

const ContentFactoryDashboard: React.FC<ContentFactoryDashboardProps> = ({ posts }) => {
    // --- STATE ---
    const [trendingTopics, setTrendingTopics] = useState<string[] | null>(null);
    const [isLoadingTopics, setIsLoadingTopics] = useState(false);
    
    // Draft & AI State
    const [articleDraft, setArticleDraft] = useState<ArticleDraft | null>(null);
    const [isLoadingDraft, setIsLoadingDraft] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Make.com Integration State
    const [webhookUrl, setWebhookUrl] = useState(localStorage.getItem('MAKE_WEBHOOK_URL') || '');
    const [showConfig, setShowConfig] = useState(false);
    const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
    const [isWaitingForMake, setIsWaitingForMake] = useState(false);
    const [makeStatus, setMakeStatus] = useState<string>(''); // 'sent', 'processing', 'received'
    
    // Image State
    const [articleImage, setArticleImage] = useState<string | null>(null);

    // --- EFFECT: REALTIME LISTENER ---
    useEffect(() => {
        if (!currentRecordId || !supabase) return;

        console.log(`🔌 Listening for Make.com updates on record: ${currentRecordId}`);

        const channel = supabase
            .channel(`public:posts:id=eq.${currentRecordId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'posts',
                    filter: `id=eq.${currentRecordId}`,
                },
                (payload) => {
                    console.log('⚡ Realtime Update Received from Make.com:', payload);
                    const newData = payload.new;
                    
                    // Assuming Make.com updates the 'image_url' or 'details->imageUrl' field
                    // Adjust based on your actual DB schema. Here we assume 'image' column or metadata.
                    const newImage = newData.image || newData.image_url || (newData.details && newData.details.imageUrl);

                    if (newImage) {
                        setArticleImage(newImage);
                        setIsWaitingForMake(false);
                        setMakeStatus('received');
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentRecordId]);

    // --- ACTIONS ---

    const handleSaveWebhook = () => {
        localStorage.setItem('MAKE_WEBHOOK_URL', webhookUrl);
        setShowConfig(false);
    };

    const handleFetchTopics = async () => {
        setIsLoadingTopics(true);
        setError(null);
        setTrendingTopics(null);
        try {
            const result = await analyzeCommunitySentimentAndTopics(posts.slice(0, 30).map(p => p.text));
            setTrendingTopics(result.trendingTopics);
        } catch (e) {
            console.error(e);
            setError("خطا در استخراج موضوعات داغ.");
        } finally {
            setIsLoadingTopics(false);
        }
    };
    
    const handleGenerateDraft = async (topic: string) => {
        setSelectedTopic(topic);
        setIsLoadingDraft(true);
        setError(null);
        setArticleDraft(null);
        setArticleImage(null); 
        setIsWaitingForMake(false);
        setMakeStatus('');
        
        try {
            // 1. Generate Text Draft (Client-side AI for speed)
            const result = await generateArticleDraft(topic);
            setArticleDraft(result);
            
            // 2. Initiate Zero-Click Image Flow
            handleTriggerMakeAutomation(result.title, result.summary);
            
        } catch (e) {
            console.error(e);
            setError(`خطا در تولید پیش‌نویس برای موضوع: ${topic}`);
        } finally {
            setIsLoadingDraft(false);
        }
    };

    const handleTriggerMakeAutomation = async (title: string, summary: string) => {
        if (!webhookUrl) {
            setError("لطفاً ابتدا آدرس Webhook را در تنظیمات (چرخ‌دنده) وارد کنید.");
            return;
        }

        setIsWaitingForMake(true);
        setMakeStatus('sending');

        try {
            // A. Create Placeholder Record in Supabase
            // We need a record ID to send to Make.com so it knows where to write back.
            let recordId = '';
            
            if (supabase) {
                const { data, error: dbError } = await supabase
                    .from('posts')
                    .insert([
                        { 
                            title: title,
                            content: summary, // Storing summary temporarily
                            author_id: (await supabase.auth.getUser()).data.user?.id, // Current User
                            status: 'draft',
                            created_at: new Date().toISOString()
                        }
                    ])
                    .select()
                    .single();
                
                if (dbError) throw dbError;
                recordId = data.id;
                setCurrentRecordId(recordId);
            } else {
                // Fallback for demo without DB connection
                console.warn("Supabase not connected. Simulating ID.");
                recordId = `demo-${Date.now()}`;
                setCurrentRecordId(recordId);
            }

            // B. Trigger Make.com Webhook
            const payload = {
                action: "generate_image",
                prompt: `Editorial illustration for: ${title}. High quality, minimal.`,
                recordId: recordId, // CRITICAL: The ID Make.com needs to update
                title: title
            };

            // Using fetch with 'no-cors' might be needed if Make doesn't return CORS headers, 
            // but standard Webhooks usually respond with 200 OK text/plain.
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            setMakeStatus('processing');
            // Now we wait for the useEffect hook to catch the Realtime update...

        } catch (e: any) {
            console.error("Automation Trigger Failed:", e);
            setError(`خطا در اتصال به اتوماسیون: ${e.message}`);
            setIsWaitingForMake(false);
        }
    };

    const handleCopy = () => {
        if (articleDraft) {
            let fullText = `# ${articleDraft.title}\n\n`;
            if (articleImage) {
                fullText += `![Featured Image](${articleImage})\n\n`;
            }
            fullText += `${articleDraft.summary}\n\n${articleDraft.content}`;
            navigator.clipboard.writeText(fullText);
            alert('متن مقاله (به همراه لینک تصویر) کپی شد!');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in relative">
            
            {/* Config Modal for Webhook */}
            {showConfig && (
                <div className="absolute top-0 right-0 z-50 bg-gray-900 border border-gray-600 p-4 rounded-lg shadow-xl w-96">
                    <h4 className="text-sm font-bold text-white mb-2">تنظیمات اتوماسیون (Make.com)</h4>
                    <input 
                        type="text" 
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://hook.eu1.make.com/..."
                        className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs text-white mb-2"
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setShowConfig(false)} className="text-xs text-gray-400">انصراف</button>
                        <button onClick={handleSaveWebhook} className="text-xs bg-blue-600 text-white px-3 py-1 rounded">ذخیره</button>
                    </div>
                </div>
            )}

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-blue-400"/>
                    ۱. استخراج موضوعات داغ
                </h3>
                <p className="text-sm text-gray-400 mb-4">هوش مصنوعی آخرین پست‌های کانون جامعه را تحلیل کرده و موضوعات اصلی مورد بحث را استخراج می‌کند.</p>
                <button onClick={handleFetchTopics} disabled={isLoadingTopics} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md disabled:bg-gray-600 transition-colors flex justify-center items-center gap-2">
                    {isLoadingTopics ? (
                         <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            در حال تحلیل...
                         </>
                    ) : 'تحلیل و استخراج موضوعات'}
                </button>
                {error && !selectedTopic && <p className="text-red-400 text-sm mt-2">{error}</p>}
                {trendingTopics && (
                    <div className="mt-4 space-y-2">
                        <h4 className="font-semibold text-sm text-gray-300 mb-2">موضوعات یافت شده:</h4>
                        {trendingTopics.map((topic, i) => (
                            <div key={i} className="bg-gray-700/50 p-3 rounded-md flex justify-between items-center border border-gray-600">
                                <span className="text-gray-200 font-medium">{topic}</span>
                                <button 
                                    onClick={() => handleGenerateDraft(topic)} 
                                    disabled={isLoadingDraft} 
                                    className="text-xs bg-green-600 hover:bg-green-500 text-white py-1.5 px-3 rounded-md disabled:opacity-50 transition-colors flex items-center gap-1"
                                >
                                    {isLoadingDraft && selectedTopic === topic ? (
                                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : <PencilSquareIcon className="w-3 h-3" />}
                                    تولید محتوا + تصویر
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col h-full relative">
                 <button 
                    onClick={() => setShowConfig(!showConfig)} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                    title="تنظیمات وب‌هوک"
                >
                    <CogIcon className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MegaphoneIcon className="w-6 h-6 text-yellow-400"/>
                    ۲. کارخانه محتوا (Unified OS)
                </h3>
                
                {isLoadingDraft ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 text-gray-400">
                         <div className="relative w-16 h-16 mb-4">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-600"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
                            <PencilSquareIcon className="absolute inset-0 m-auto w-6 h-6 text-blue-400" />
                         </div>
                         <p className="font-bold text-white mb-1">ایجنت‌ها مشغول کارند...</p>
                         <p className="text-xs">۱. نگارش متن (Gemini)</p>
                         <p className="text-xs">۲. ارسال دستور به Make.com</p>
                    </div>
                ) : error && selectedTopic ? (
                     <div className="flex-grow flex items-center justify-center text-red-400 p-8 text-center bg-red-900/10 rounded-lg border border-red-900/30">
                        {error}
                    </div>
                ) : articleDraft ? (
                    <div className="flex-grow flex flex-col space-y-4 h-full animate-fade-in">
                        
                        {/* Image Asset Section - REALTIME */}
                        <div className={`p-4 rounded-lg border relative overflow-hidden transition-all duration-500 ${isWaitingForMake ? 'bg-amber-900/10 border-amber-500/50' : 'bg-gray-900/50 border-gray-600'}`}>
                            <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2 z-10 relative">
                                <PhotoIcon className="w-4 h-4 text-purple-400"/> 
                                {isWaitingForMake ? 'در انتظار تصویر (Make.com)...' : 'تصویر شاخص (Auto-Generated)'}
                            </h4>
                            
                            {isWaitingForMake ? (
                                <div className="h-40 flex flex-col items-center justify-center bg-gray-800 rounded-lg border border-gray-700 border-dashed relative overflow-hidden">
                                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer"></div>
                                     <BoltIcon className="w-8 h-8 text-amber-500 animate-pulse mb-2"/>
                                     <span className="text-xs text-amber-200 font-bold">دستور ارسال شد... منتظر آپدیت دیتابیس</span>
                                     <span className="text-[10px] text-gray-500 mt-1">Webhook -> Image Gen -> Supabase Realtime</span>
                                </div>
                            ) : articleImage ? (
                                <div className="relative group animate-scale-in">
                                    <SmartImage 
                                        src={articleImage} 
                                        alt="AI Generated Article Cover" 
                                        className="w-full h-48 object-cover rounded-lg shadow-lg"
                                        width={600}
                                    />
                                    <div className="absolute top-2 right-2 bg-green-600 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 shadow-lg animate-bounce">
                                        <BoltIcon className="w-3 h-3" />
                                        دریافت شد (Realtime)
                                    </div>
                                    
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg gap-2">
                                        <p className="text-xs text-gray-300 px-4 text-center break-all">{articleImage}</p>
                                        <button onClick={() => navigator.clipboard.writeText(articleImage!)} className="text-xs bg-white text-black px-3 py-1 rounded hover:bg-gray-200">کپی لینک</button>
                                        <CloudinaryUploadWidget 
                                            onUploadSuccess={(url) => setArticleImage(url)} 
                                            buttonText="تغییر عکس (دستی)"
                                            className="text-xs py-1 px-3 bg-gray-700 hover:bg-gray-600 text-white"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-4 border-2 border-dashed border-gray-600 rounded-lg">
                                    <p className="text-xs text-gray-400 mb-3">تصویر خودکار تولید نشد یا Webhook تنظیم نیست.</p>
                                    <CloudinaryUploadWidget 
                                        onUploadSuccess={(url) => setArticleImage(url)} 
                                        buttonText="آپلود دستی"
                                        className="text-xs py-1.5 px-3 mx-auto"
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">عنوان</label>
                            <input type="text" value={articleDraft.title} className="w-full bg-gray-900 border border-gray-600 p-3 rounded-lg font-bold text-lg text-white" readOnly/>
                        </div>
                        <div className="flex-grow flex flex-col">
                             <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">محتوا (Markdown)</label>
                            <textarea value={articleDraft.content} className="w-full flex-grow bg-gray-900 border border-gray-600 p-3 rounded-lg text-sm text-gray-300 leading-relaxed resize-none font-mono min-h-[150px]" readOnly/>
                        </div>
                        <button onClick={handleCopy} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg">
                            کپی کامل (متن + لینک عکس)
                        </button>
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
                        <p>هنوز پیش‌نویسی تولید نشده است.</p>
                        <p className="text-sm mt-2">یک موضوع را از لیست سمت راست انتخاب کنید.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentFactoryDashboard;
