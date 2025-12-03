
import React, { useState } from 'react';
import { CommunityPost } from '../../types';
import { analyzeCommunitySentimentAndTopics } from '../../services/geminiService';
import { HeartIcon, SparklesIcon } from '../icons';
import SentimentTrend from '../SentimentTrend';

interface CommunityDashboardProps {
    posts: CommunityPost[];
}

const CommunityDashboard: React.FC<CommunityDashboardProps> = ({ posts }) => {
    const [communityAnalysis, setCommunityAnalysis] = useState<{ 
        sentiment: { 
            score: number; 
            label: string; 
            trend: 'rising' | 'stable' | 'falling'; 
            mood: 'happy' | 'concerned' | 'neutral' | 'needs_motivation' | 'angry';
            summary: string;
        }; 
        trendingTopics: string[] 
    } | null>(null);
    const [isAnalyzingCommunity, setIsAnalyzingCommunity] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyzeCommunity = async () => {
        setIsAnalyzingCommunity(true);
        setError(null);
        try {
            const result = await analyzeCommunitySentimentAndTopics(posts.slice(0, 20).map(p => p.text));
            setCommunityAnalysis(result);
        } catch (err) {
            console.error(err);
            setError('خطا در تحلیل نبض جامعه.');
        } finally {
            setIsAnalyzingCommunity(false);
        }
    };

    const getMoodStyles = (mood: string) => {
        switch (mood) {
            case 'happy': return { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-300', icon: '😄' };
            case 'concerned': return { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-300', icon: '😟' };
            case 'angry': return { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-300', icon: '😠' };
            case 'needs_motivation': return { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-300', icon: '🔋' };
            default: return { bg: 'bg-gray-500/20', border: 'border-gray-500', text: 'text-gray-300', icon: '😐' };
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Community Pulse Widget */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border border-gray-700 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-500/20 rounded-full animate-pulse">
                                <HeartIcon className="w-8 h-8 text-red-500" filled />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">نبض جامعه (Community Pulse)</h3>
                                <p className="text-sm text-gray-400">تحلیل هوشمند حال و هوای فعلی نخلستان</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleAnalyzeCommunity} 
                            disabled={isAnalyzingCommunity} 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl disabled:bg-gray-600 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
                        >
                            {isAnalyzingCommunity ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    در حال گوش دادن...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5" />
                                    گرفتن نبض
                                </>
                            )}
                        </button>
                    </div>

                    {error && <p className="text-red-400 text-center p-4 bg-red-900/20 rounded-lg">{error}</p>}

                    {communityAnalysis ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                            {/* Mood Card */}
                            <div className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center text-center ${getMoodStyles(communityAnalysis.sentiment.mood).bg} ${getMoodStyles(communityAnalysis.sentiment.mood).border}`}>
                                <span className="text-6xl mb-4 filter drop-shadow-lg">{getMoodStyles(communityAnalysis.sentiment.mood).icon}</span>
                                <h4 className={`text-2xl font-bold mb-2 ${getMoodStyles(communityAnalysis.sentiment.mood).text}`}>
                                    {communityAnalysis.sentiment.label}
                                </h4>
                                <p className="text-sm text-gray-300 px-2">{communityAnalysis.sentiment.summary}</p>
                            </div>

                            {/* Stats Card */}
                            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-600 flex flex-col justify-center">
                                <h4 className="text-gray-400 text-sm mb-4 font-bold uppercase tracking-wider">شاخص‌های کلیدی</h4>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>امتیاز احساسی</span>
                                            <span className="font-bold">{communityAnalysis.sentiment.score}/100</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-3">
                                            <div 
                                                className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full transition-all duration-1000" 
                                                style={{ width: `${communityAnalysis.sentiment.score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between bg-gray-700/30 p-3 rounded-lg">
                                        <span className="text-sm text-gray-300">روند تغییرات</span>
                                        <SentimentTrend trend={communityAnalysis.sentiment.trend} />
                                    </div>
                                </div>
                            </div>

                            {/* Topics Card */}
                            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-600">
                                <h4 className="text-gray-400 text-sm mb-4 font-bold uppercase tracking-wider">دغدغه‌های اصلی</h4>
                                <div className="flex flex-wrap gap-2 align-content-start h-full">
                                    {communityAnalysis.trendingTopics.map((topic, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 border border-gray-500 rounded-lg text-sm text-white transition-colors cursor-default">
                                            # {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-dashed border-gray-600">
                            <p className="text-gray-500">برای مشاهده وضعیت روحی جامعه، دکمه «گرفتن نبض» را بزنید.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity Feed */}
             <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                <h3 className="text-xl font-bold mb-6 text-white">آخرین زمزمه‌های کانون</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {posts.slice(0, 10).map(post => (
                        <div key={post.id} className="bg-gray-700/30 p-4 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors">
                            <div className="flex justify-between text-sm text-gray-400 mb-2">
                                <span className="font-semibold text-blue-300">{post.authorName}</span>
                                <span>{new Date(post.timestamp).toLocaleDateString('fa-IR')}</span>
                            </div>
                            <p className="text-gray-200 leading-relaxed">{post.text}</p>
                            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                                <HeartIcon className="w-3 h-3" /> {post.likes} پسند
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CommunityDashboard;
