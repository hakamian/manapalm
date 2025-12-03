
import React, { useState } from 'react';
import { CommunityPost, ArticleDraft } from '../../types';
import { analyzeCommunitySentimentAndTopics, generateArticleDraft } from '../../services/geminiService';
import { SparklesIcon, MegaphoneIcon, PencilSquareIcon } from '../icons';

interface ContentFactoryDashboardProps {
    posts: CommunityPost[];
}

const ContentFactoryDashboard: React.FC<ContentFactoryDashboardProps> = ({ posts }) => {
    const [trendingTopics, setTrendingTopics] = useState<string[] | null>(null);
    const [isLoadingTopics, setIsLoadingTopics] = useState(false);
    const [articleDraft, setArticleDraft] = useState<ArticleDraft | null>(null);
    const [isLoadingDraft, setIsLoadingDraft] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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
        try {
            const result = await generateArticleDraft(topic);
            setArticleDraft(result);
        } catch (e) {
            console.error(e);
            setError(`خطا در تولید پیش‌نویس برای موضوع: ${topic}`);
        } finally {
            setIsLoadingDraft(false);
        }
    };

    const handleCopy = () => {
        if (articleDraft) {
            const fullText = `# ${articleDraft.title}\n\n${articleDraft.summary}\n\n${articleDraft.content}`;
            navigator.clipboard.writeText(fullText);
            alert('متن مقاله کپی شد!');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                                    تولید پیش‌نویس
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col h-full">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MegaphoneIcon className="w-6 h-6 text-yellow-400"/>
                    ۲. پیش‌نویس مقاله (SEO)
                </h3>
                
                {isLoadingDraft ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 text-gray-400">
                         <div className="animate-pulse mb-4">
                            <PencilSquareIcon className="w-12 h-12 text-gray-600 mx-auto" />
                         </div>
                         <p>دستیار نویسنده در حال نگارش پیش‌نویس برای «{selectedTopic}»...</p>
                         <p className="text-xs mt-2">رعایت اصول سئو و لحن الهام‌بخش</p>
                    </div>
                ) : error && selectedTopic ? (
                     <div className="flex-grow flex items-center justify-center text-red-400 p-8 text-center bg-red-900/10 rounded-lg border border-red-900/30">
                        {error}
                    </div>
                ) : articleDraft ? (
                    <div className="flex-grow flex flex-col space-y-4 h-full">
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">عنوان پیشنهادی</label>
                            <input type="text" value={articleDraft.title} className="w-full bg-gray-900 border border-gray-600 p-3 rounded-lg font-bold text-lg text-white" readOnly/>
                        </div>
                        <div>
                             <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">خلاصه (Meta Description)</label>
                            <textarea value={articleDraft.summary} className="w-full bg-gray-900 border border-gray-600 p-3 rounded-lg text-sm text-gray-300 resize-none" rows={3} readOnly/>
                        </div>
                        <div className="flex-grow flex flex-col">
                             <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">متن بدنه (Markdown)</label>
                            <textarea value={articleDraft.content} className="w-full flex-grow bg-gray-900 border border-gray-600 p-3 rounded-lg text-sm text-gray-300 leading-relaxed resize-none font-mono" readOnly/>
                        </div>
                        <button onClick={handleCopy} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition-colors">
                            کپی کل متن (Markdown)
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
