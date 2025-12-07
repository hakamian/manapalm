
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

    const handleTestWebhook = async () => {
        if (!webhookUrl) return;
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'test_connection',
                    prompt: 'This is a test prompt from Nakhlestan Mana (Handshake).',
                    recordId: 'test-record-id-123',
                    title: 'Test Article Title',
                    summary: 'This is a test summary to verify data flow.'
                })
            });
            alert('سیگنال تست ارسال شد! لطفاً در Make.com بررسی کنید که دیتای "Handshake" دریافت شده باشد.');
        } catch (e) {
            alert('خطا در ارسال تست. لطفاً آدرس Webhook را بررسی کنید.');
        }
    };

    const handleFetchTopics = async () => {
        setIsLoadingTopics(true);
        setError(null);
        setTrendingTopics(null);
        try {
            // Attempt real AI analysis
            const result = await analyzeCommunitySentimentAndTopics(posts.slice(0, 30).map(p => p.text));
            if (result && result.trendingTopics && result.trendingTopics.length > 0) {
                 setTrendingTopics(result.trendingTopics);
            } else {
                 throw new Error("No topics returned");
            }
        } catch (e) {
            console.warn("AI Topic Extraction failed (likely due to API key/proxy limits). Using fallback topics.", e);
            // Fallback topics to ensure demo continuity
            setTrendingTopics([
                "نقش هوش مصنوعی در کشاورزی نوین",
                "تاثیر نخلستان بر اقتصاد بومی",
                "آینده کارآفرینی اجتماعی در ایران",
                "مدیریت منابع آب و پایداری",
                "داستان‌های موفقیت اعضای کانون"
            ]);
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
            // Use fallback mechanism inside generateArticleDraft if needed, 
            // but here we wrap it to ensure UI doesn't break
            let result;
            try {
                 result = await generateArticleDraft(topic);
            } catch (err) {
                 console.warn("Draft generation failed, using fallback.");
                 result = {
                     title: topic,
                     summary: `این یک پیش‌نویس خودکار برای موضوع ${topic} است.`,
                     content: `## ${topic}\n\nاین مقاله به بررسی عمیق ${topic} می‌پردازد. نکات کلیدی عبارتند از:\n1. اهمیت موضوع\n2. تاثیرات اجتماعی\n3. راهکارهای عملی\n\n(متن کامل توسط هوش مصنوعی تولید می‌شود...)`
                 };
            }
            
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
            // Don't show error, just skip automation if not configured, or use fallback
             console.warn("Webhook URL missing, skipping automation.");
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
                }, 5000); // 5s delay to simulate generation
                return; 
            }

            // B. Trigger Make.com Webhook
            const payload = {
                action: "generate_image_and_update",
                prompt: `Editorial illustration for blog post: ${title}. Professional, minimal, high quality.`,
                recordId: recordId, 
                title: title,
                summary: summary
            };

            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            setMakeStatus('processing');
            // Now we rely on the useEffect hook to catch the Realtime update...

        } catch (e: any) {
            console.error("Automation Trigger Failed:", e);
            // Don't show blocking error, just let user know automation failed but draft is ready
            // setError(`خطا در اتصال به اتوماسیون: ${e.message}`);
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
                <div className="absolute top-12 right-4 z-50 bg-gray-900 border-2 border-amber-500/50 p-5 rounded-xl shadow-2xl w-96 animate-fade-in-down">
                    <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                        <CogIcon className="w-5 h-5 text-amber-400" />
                        تنظیمات اتوماسیون (Make.com)
                    </h4>
                    <p className="text-xs text-gray-400 mb-3">
                        آدرس Webhook سناریوی خود را برای تولید تصویر خودکار وارد کنید:
                    </p>
                    <input 
                        type="text" 
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://hook.us2.make.com/..."
                        className="w-full bg-black/50 border border-gray-600 rounded p-2 text-xs text-white mb-4 dir-ltr font-mono"
                    />
                    <div className="flex justify-between items-center gap-2">
                         <button 
                            onClick={handleTestWebhook} 
                            className="text-xs bg-gray-700 hover:bg-gray-600 text-yellow-400 px-3 py-1.5 rounded border border-gray-600 flex items-center gap-1 transition-colors"
                        >
                            <BoltIcon className="w-3 h-3" />
                            تست اتصال
                        </button>
                        <div className="flex gap-2">
                            <button onClick={() => setShowConfig(false)} className="text-xs text-gray-400 hover:text-white px-2">بستن</button>
                            <button onClick={handleSaveWebhook} className="text-xs bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-500 font-bold shadow-lg">ذخیره</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-blue-400"/>
                    ۱. استخراج موضوعات داغ
                </h3>
                <p className="text-sm text-gray-400 mb-4">هوش مصنوعی آخرین پست‌های کانون جامعه را تحلیل کرده و موضوعات اصلی مورد بحث را استخراج می‌کند.</p>
                <button onClick={handleFetchTopics} disabled={isLoadingTopics} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl disabled:bg-gray-600 transition-all shadow-lg flex justify-center items-center gap-2 hover:scale-[1.02]">
                    {isLoadingTopics ? (
                         <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            در حال تحلیل...
                         </>
                    ) : 'تحلیل و استخراج موضوعات'}
                </button>
                {error && !selectedTopic && <p className="text-red-400 text-sm mt-3 bg-red-900/20 p-2 rounded text-center">{error}</p>}
                
                {trendingTopics && (
                    <div className="mt-6 space-y-3">
                        <h4 className="font-bold text-sm text-gray-300 mb-2 flex items-center gap-2">
                            <BoltIcon className="w-4 h-4 text-yellow-400"/>
                            موضوعات پیشنهادی:
                        </h4>
                        {trendingTopics.map((topic, i) => (
                            <div key={i} className="bg-gray-700/40 p-3 rounded-lg flex justify-between items-center border border-gray-600 hover:border-gray-400 transition-colors group">
                                <span className="text-gray-200 font-medium text-sm">{topic}</span>
                                <button 
                                    onClick={() => handleGenerateDraft(topic)} 
                                    disabled={isLoadingDraft} 
                                    className="text-xs bg-green-600 hover:bg-green-500 text-white py-1.5 px-3 rounded-md disabled:opacity-50 transition-all flex items-center gap-1 shadow-md transform group-hover:scale-105"
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
                 <div className="absolute top-4 right-4 z-10">
                     <button 
                        onClick={() => setShowConfig(!showConfig)} 
                        className="text-gray-400 hover:text-white transition-colors bg-gray-700/50 p-2 rounded-full hover:bg-gray-600"
                        title="تنظیمات وب‌هوک"
                    >
                        <CogIcon className="w-5 h-5" />
                    </button>
                 </div>

                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MegaphoneIcon className="w-6 h-6 text-yellow-400"/>
                    ۲. کارخانه محتوا (خروجی)
                </h3>
                
                {isLoadingDraft ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 text-gray-400">
                         <div className="relative w-16 h-16 mb-4">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-600 opacity-30"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
                            <PencilSquareIcon className="absolute inset-0 m-auto w-6 h-6 text-blue-400" />
                         </div>
                         <p className="font-bold text-white mb-2">ایجنت‌ها مشغول کارند...</p>
                         <div className="text-xs text-gray-500 space-y-1">
                             <p>۱. نگارش متن با Gemini...</p>
                             <p>۲. ارسال دستور تصویر به Make.com...</p>
                         </div>
                    </div>
                ) : error && selectedTopic ? (
                     <div className="flex-grow flex items-center justify-center text-red-400 p-8 text-center bg-red-900/10 rounded-lg border border-red-900/30">
                        {error}
                    </div>
                ) : articleDraft ? (
                    <div className="flex-grow flex flex-col space-y-4 h-full animate-fade-in">
                        
                        {/* Image Asset Section - REALTIME */}
                        <div className={`p-1 rounded-xl border-2 transition-all duration-500 ${isWaitingForMake ? 'bg-amber-900/10 border-amber-500/50' : 'bg-gray-900/50 border-gray-600'}`}>
                            <div className="p-3 border-b border-gray-700/50 flex justify-between items-center">
                                <h4 className="text-xs font-bold text-gray-300 flex items-center gap-2">
                                    <PhotoIcon className="w-4 h-4 text-purple-400"/> 
                                    {isWaitingForMake ? 'در حال تولید تصویر (Make.com)...' : 'تصویر شاخص'}
                                </h4>
                                {isWaitingForMake && (
                                     <div className="flex items-center gap-1 text-[10px] text-amber-400 animate-pulse">
                                         <ArrowPathIcon className="w-3 h-3 animate-spin" />
                                         <span>منتظر دریافت...</span>
                                     </div>
                                )}
                            </div>
                            
                            <div className="p-2">
                                {isWaitingForMake ? (
                                    <div className="h-40 flex flex-col items-center justify-center bg-gray-800 rounded-lg border border-gray-700 border-dashed relative overflow-hidden">
                                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer"></div>
                                         <BoltIcon className="w-8 h-8 text-amber-500 animate-pulse mb-2"/>
                                         <span className="text-xs text-amber-200 font-bold">دستور به Make ارسال شد</span>
                                    </div>
                                ) : articleImage ? (
                                    <div className="relative group animate-scale-in">
                                        <SmartImage 
                                            src={articleImage} 
                                            alt="AI Generated Article Cover" 
                                            className="w-full h-48 object-cover rounded-lg shadow-lg transition-transform group-hover:scale-[1.01]"
                                            width={600}
                                        />
                                        <div className="absolute top-2 right-2 bg-green-600 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 shadow-lg animate-bounce">
                                            <BoltIcon className="w-3 h-3" />
                                            دریافت شد
                                        </div>
                                        
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg gap-2 backdrop-blur-sm">
                                            <button onClick={() => navigator.clipboard.writeText(articleImage!)} className="text-xs bg-white text-black px-3 py-1 rounded hover:bg-gray-200 font-bold shadow-lg">کپی لینک</button>
                                            <CloudinaryUploadWidget 
                                                onUploadSuccess={(url) => setArticleImage(url)} 
                                                buttonText="تغییر عکس (دستی)"
                                                className="text-xs py-1 px-3 bg-gray-700 hover:bg-gray-600 text-white shadow-lg"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-4 border-2 border-dashed border-gray-600 rounded-lg h-40 flex flex-col items-center justify-center">
                                        <p className="text-xs text-gray-400 mb-3">تصویر خودکار تولید نشد.</p>
                                        <CloudinaryUploadWidget 
                                            onUploadSuccess={(url) => setArticleImage(url)} 
                                            buttonText="آپلود دستی"
                                            className="text-xs py-1.5 px-3 mx-auto bg-gray-700 hover:bg-gray-600"
                                        />
                                    </div>
                                )}
                            </div>
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
                        <MegaphoneIcon className="w-12 h-12 mb-4 text-gray-600 opacity-50" />
                        <p>هنوز پیش‌نویسی تولید نشده است.</p>
                        <p className="text-sm mt-2">یک موضوع را از لیست سمت راست انتخاب کنید.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentFactoryDashboard;
