
import React from 'react';
import { BookOpenIcon, ChatBubbleBottomCenterTextIcon } from '../icons';
import { coActiveFramework, powerfulQuestions } from '../../utils/coachingData';
import { CategoryAccordion, QuestionsAccordion } from './LearnComponents';

const LearnTab: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto animate-fade-in grid md:grid-cols-3 gap-8">
            {/* Knowledge Base Column */}
            <div className="md:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold text-gray-200 mb-4 flex items-center gap-2">
                    <BookOpenIcon className="w-6 h-6 text-blue-400"/>
                    چارچوب کوچینگ کواکتیو
                </h2>
                {coActiveFramework.map((category, index) => (
                    <CategoryAccordion
                        key={category.category}
                        category={category.category}
                        icon={category.icon}
                        description={category.description}
                        skills={category.skills}
                        startOpen={index === 0}
                    />
                ))}
            </div>
            
            {/* Questions Bank Column */}
            <div>
                <div className="sticky top-24">
                    <h2 className="text-xl font-bold text-gray-200 mb-4 flex items-center gap-2">
                        <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-green-400"/>
                        بانک سوالات قدرتمند
                    </h2>
                    <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-lg">
                        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                            در لحظاتی که نمی‌دانید چه بپرسید، از این جعبه ابزار استفاده کنید. به یاد داشته باشید: سوالات کوتاه و باز، قدرتمندترین هستند.
                        </p>
                        {powerfulQuestions.map((cat, idx) => (
                            <QuestionsAccordion key={idx} category={cat.category} questions={cat.questions} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearnTab;
