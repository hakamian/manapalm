
import React from 'react';
import OmniConverter from './OmniConverter';
import { SparklesIcon, CpuChipIcon } from '../../components/icons';

const AIStudioView: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-950 text-white pt-24 pb-24">
            <div className="container mx-auto px-6">
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-purple-900/30 rounded-full mb-4 ring-1 ring-purple-500/50">
                        <CpuChipIcon className="w-8 h-8 text-purple-400" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                        استودیو خلق هوشمند
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        ابزارهای هوش مصنوعی برای تبدیل ایده‌های شما به میراث دیجیتال. افکار خود را به محتوای اثرگذار تبدیل کنید.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Omni Converter Tool */}
                    <OmniConverter />

                    {/* Placeholder for Knowledge Refiner */}
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center opacity-75 hover:opacity-100 transition-opacity cursor-not-allowed">
                        <h3 className="text-2xl font-bold text-gray-500 mb-2">Knowledge Refiner (بزودی)</h3>
                        <p className="text-gray-600">
                            سیستم RAG برای سازماندهی دانش شخصی شما و تبدیل آن به «مغز دوم».
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIStudioView;
