
import React from 'react';
import OmniConverter from './OmniConverter';
import KnowledgeRefiner from './KnowledgeRefiner';
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
                    {/* Knowledge Refiner Tool */}
                    <KnowledgeRefiner />
                </div>
            </div>
        </div>
    );
};

export default AIStudioView;
