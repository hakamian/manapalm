import React from 'react';
import { ArrowLeftIcon } from './icons';

interface ManaGuideCardProps {
    icon: React.FC<any>;
    title: string;
    description: string;
    cta: {
        text: string;
        action: () => void;
    };
    color: string;
    bgColor?: string;
    borderColor?: string;
    delay?: number;
}

const ManaGuideCard: React.FC<ManaGuideCardProps> = ({
    icon: Icon,
    title,
    description,
    cta,
    color,
    bgColor = "bg-white/5",
    borderColor = "border-white/10",
    delay = 0
}) => {
    return (
        <div
            style={{ transitionDelay: `${delay}ms` }}
            className={`p-8 rounded-2xl shadow-lg flex flex-col text-right transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 border ${borderColor} ${bgColor} animate-fade-in-up backdrop-blur-sm`}
        >
            <div className={`p-4 rounded-full bg-black/20 self-start mb-6 border ${borderColor}`}>
                <Icon className={`w-10 h-10 ${color}`} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-400 font-light leading-relaxed flex-grow">{description}</p>
            <button
                onClick={cta.action}
                className={`mt-6 self-start ${color} font-bold py-2 rounded-lg transition-all hover:scale-105 flex items-center gap-2`}
            >
                <span>{cta.text}</span>
                <ArrowLeftIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default ManaGuideCard;
