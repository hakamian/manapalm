import { convertContent } from '@/services/geminiService';
import { SparklesIcon, DocumentTextIcon, ArrowPathIcon } from '../../../components/icons';

const KnowledgeRefiner: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [isRefining, setIsRefining] = useState(false);
    const [refinedOutput, setRefinedOutput] = useState<string | null>(null);

    const handleRefine = () => {
        setIsRefining(true);
        // Simulate AI Processing (RAG Placeholder)
        setTimeout(() => {
            setRefinedOutput(`
### 🧠 دانش استخراج شده:
**موضوع:** ${inputText.slice(0, 20)}...
**خلاصه:** این متن ورودی شامل نکات کلیدی درباره موضوع مورد نظر است که با ساختاردهی مجدد قابل استفاده در سیستم مدیریت دانش می‌باشد.
**تگ‌ها:** #هوش_مصنوعی #مدیریت_دانش #توسعه_فردی
            `);
            setIsRefining(false);
        }, 2000);
    };

    return (
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-900/30 rounded-lg text-indigo-400">
                    <DocumentTextIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">پالایشگر دانش (RAG)</h2>
                    <p className="text-gray-400 text-sm">تبدیل داده‌های پراکنده به دانش ساختارمند</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-4">
                    <label className="block text-gray-300 font-medium">متن خام یا یادداشت‌ها</label>
                    <textarea
                        className="w-full h-64 bg-gray-800 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none transition-all placeholder-gray-500"
                        placeholder="متن، مقاله یا یادداشت‌های خود را اینجا وارد کنید..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                    <button
                        onClick={handleRefine}
                        disabled={!inputText.trim() || isRefining}
                        className={`w-full py-3 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${inputText.trim() && !isRefining
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/20'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {isRefining ? (
                            <>
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                در حال پردازش...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                پالایش و ساختاردهی
                            </>
                        )}
                    </button>
                </div>

                {/* Output Section */}
                <div className="bg-gray-950 rounded-xl border border-gray-800 p-6 relative min-h-[300px]">
                    <h3 className="text-gray-400 font-medium mb-4 flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4 text-indigo-400" />
                        خروجی هوشمند
                    </h3>

                    {refinedOutput ? (
                        <div className="prose prose-invert max-w-none animate-fade-in">
                            <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">
                                {refinedOutput}
                            </div>
                            <div className="mt-6 flex gap-3">
                                <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm transition-colors border border-gray-700">
                                    کپی در کلیپ‌بورد
                                </button>
                                <button className="flex-1 bg-green-900/30 hover:bg-green-900/50 text-green-400 py-2 rounded-lg text-sm transition-colors border border-green-900/50">
                                    ذخیره در پایگاه دانش
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                            <DocumentTextIcon className="w-16 h-16 opacity-20 mb-3" />
                            <p>منتظر ورودی شما هستم...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KnowledgeRefiner;
