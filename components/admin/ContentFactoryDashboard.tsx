import React, { useState, useEffect, useRef } from 'react';
import { CommunityPost, ArticleDraft } from '../../types';
import { analyzeCommunitySentimentAndTopics, generateArticleDraft } from '../../services/geminiService';
import { SparklesIcon, MegaphoneIcon, PencilSquareIcon, PhotoIcon, CloudIcon, BoltIcon, CogIcon, ArrowPathIcon, CheckCircleIcon } from '../icons';
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
    // We use the provided webhook URL as default
    const [webhookUrl, setWebhookUrl] = useState(localStorage.getItem('MAKE_WEBHOOK_URL') || 'https://hook.us2.make.com/74b1csebve245wmmhopb6559gk1q52lg');
    const [showConfig, setShowConfig] = useState(false);
    const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
    const [isWaitingForMake, setIsWaitingForMake] = useState(false);
    const [makeStatus, setMakeStatus] = useState<string>(''); // 'sending', 'processing', 'received'
    
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
                    
                    // Check various potential column names for the image URL
                    // Make.com should update one of these columns
                    const newImage = newData.image || newData.image_url || newData.imageUrl || (newData.details && newData.details.imageUrl);

                    if (newImage) {
                        setArticleImage(newImage);
                        setIsWaitingForMake(false);
                        setMakeStatus('received');
                        // Optional: Show a success toast or sound
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
        setCurrentRecordId(null);
        
        try {
            // 1. Generate Text Draft (Client-side AI for speed)
            const result = await generateArticleDraft(topic);
            setArticleDraft(result);
            
            // 2. Initiate Zero-Click Image Flow (Trigger Make.com)
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
            setError("آدرس Webhook تنظیم نشده است.");
            return;
        }

        setIsWaitingForMake(true);
        setMakeStatus('sending');

        try {
            // A. Create Placeholder Record in Supabase
            // We create the DB record FIRST so we have an ID to send to Make.com
            let recordId = '';
            
            if (supabase) {
                // Get current user ID if possible, else null
                const { data: { user } } = await supabase.auth.getUser();
                
                const { data, error: dbError } = await supabase
                    .from('posts')
                    .insert([
                        { 
                            title: title,
                            content: summary, // Initial content is just summary
                            author_id: user?.id, 
                            status: 'draft',
                            created_at: new Date().toISOString(),
                            // Initialize image as null
                            image: null 
                        }
                    ])
                    .select()
                    .single();
                
                if (dbError) throw dbError;
                recordId = data.id;
                setCurrentRecordId(recordId);
            } else {
                // Fallback for demo mode (if Supabase not connected)
                console.warn("Supabase not connected. Simulating Automation...");
                recordId = `demo-${Date.now()}`;
                setCurrentRecordId(recordId);
                // Simulate delay for demo
                setTimeout(() => {
                    setArticleImage("https://picsum.photos/seed/ai-generated/800/600");
                    setIsWaitingForMake(false);
                    setMakeStatus('received');
                }, 4000);
                return; 
            }

            // B. Trigger Make.com Webhook
            // Payload structure designed for Make.com to parse easily
            const payload = {
                action: "generate_image_and_update",
                prompt: `Editorial illustration for blog post: ${title}. Professional, minimal, high quality.`,
                recordId: recordId, // CRITICAL: Make.com uses this ID to update the row later
                title: title,
                summary: summary
            };

            // Fire and forget (or await response if Make returns status)
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            setMakeStatus('processing');
            // Now we rely on the useEffect hook to catch the Realtime update...

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
                <div className="absolute top-0 right-0 z-50 bg-gray-900 border border-gray-600 p-4 rounded-lg shadow-xl w-96 animate-fade-in-down">
                    <h4 className="text-sm font-bold text-white mb-2">تنظیمات اتوماسیون (Make.com)</h4>
                    <p className="text-xs text-gray-400 mb-2">آدرس Webhook سناریوی خود را وارد کنید:</p>
                    <input 
                        type="text" 
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://hook.us2.make.com/..."
                        className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs text-white mb-2 dir-ltr"
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setShowConfig(false)} className="text-xs text-gray-400 hover:text-white">بستن</button>
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
                            <div key={i} className="bg-gray-700/50 p-3 rounded-md flex justify-between items-center border border-gray-600 group hover:border-gray-500 transition-colors">
                                <span className="text-gray-200 font-medium">{topic}</span>
                                <button 
                                    onClick={() => handleGenerateDraft(topic)} 
                                    disabled={isLoadingDraft} 
                                    className="text-xs bg-green-600 hover:bg-green-500 text-white py-1.5 px-3 rounded-md disabled:opacity-50 transition-colors flex items-center gap-1 shadow-lg"
                                >
                                    {isLoadingDraft && selectedTopic === topic ? (
                                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : <PencilSquareIcon className="w-3 h-3" />}
                                    تولید محتوا
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
                    ۲. کارخانه محتوا (Make.com OS)
                </h3>
                
                {isLoadingDraft ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 text-gray-400">
                         <div className="relative w-16 h-16 mb-4">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-600"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
                            <PencilSquareIcon className="absolute inset-0 m-auto w-6 h-6 text-blue-400" />
                         </div>
                         <p className="font-bold text-white mb-1">ایجنت‌ها مشغول کارند...</p>
                         <p className="text-xs text-gray-500">۱. نگارش متن (Gemini)</p>
                         <p className="text-xs text-gray-500">۲. ارسال دستور به Make.com</p>
                    </div>
                ) : error && selectedTopic ? (
                     <div className="flex-grow flex items-center justify-center text-red-400 p-8 text-center bg-red-900/10 rounded-lg border border-red-900/30">
                        {error}
                    </div>
                ) : articleDraft ? (
                    <div className="flex-grow flex flex-col space-y-4 h-full animate-fade-in">
                        
                        {/* Image Asset Section - REALTIME */}
                        <div className={`p-4 rounded-lg border relative overflow-hidden transition-all duration-500 ${isWaitingForMake ? 'bg-amber-900/10 border-amber-500/50' : 'bg-gray-900/50 border-gray-600'}`}>
                            <div className="flex justify-between items-center mb-3 relative z-10">
                                <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                    <PhotoIcon className="w-4 h-4 text-purple-400"/> 
                                    {isWaitingForMake ? 'در انتظار تصویر (Make.com)...' : 'تصویر شاخص (خودکار)'}
                                </h4>
                                {isWaitingForMake && (
                                     <div className="flex items-center gap-1 text-[10px] text-amber-400 animate-pulse">
                                         <ArrowPathIcon className="w-3 h-3 animate-spin" />
                                         <span>اتصال به سناریو</span>
                                     </div>
                                )}
                            </div>
                            
                            {isWaitingForMake ? (
                                <div className="h-40 flex flex-col items-center justify-center bg-gray-800 rounded-lg border border-gray-700 border-dashed relative overflow-hidden">
                                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer"></div>
                                     <BoltIcon className="w-8 h-8 text-amber-500 animate-pulse mb-2"/>
                                     <span className="text-xs text-amber-200 font-bold">دستور به Make ارسال شد</span>
                                     <span className="text-[10px] text-gray-500 mt-1">منتظر بازگشت Webhook...</span>
                                </div>
                            ) : articleImage ? (
                                <div className="relative group animate-scale-in">
                                    <SmartImage 
                                        src={articleImage} 
                                        alt="AI Generated Article Cover" 
                                        className="w-full h-48 object-cover rounded-lg shadow-lg transition-transform group-hover:scale-[1.02]"
                                        width={600}
                                    />
                                    <div className="absolute top-2 right-2 bg-green-600 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 shadow-lg animate-bounce">
                                        <BoltIcon className="w-3 h-3" />
                                        دریافت شد (Realtime)
                                    </div>
                                    
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg gap-2 backdrop-blur-sm">
                                        <p className="text-xs text-gray-300 px-4 text-center break-all line-clamp-1">{articleImage}</p>
                                        <button onClick={() => navigator.clipboard.writeText(articleImage!)} className="text-xs bg-white text-black px-3 py-1 rounded hover:bg-gray-200 font-bold">کپی لینک</button>
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
                        <button onClick={handleCopy} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2">
                            <CheckCircleIcon className="w-5 h-5" />
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