import React from 'react';
import { TimelineEvent } from '../types.ts';
import Certificate from './Certificate.tsx';
import { LeafIcon } from './icons.tsx';

interface CertificateWallProps {
    timeline: TimelineEvent[];
    onCertificateClick: (item: TimelineEvent) => void;
}

const CertificateWall: React.FC<CertificateWallProps> = ({ timeline, onCertificateClick }) => {
    const palmEvents = timeline.filter(event => event.type === 'palm_planted');

    if (palmEvents.length === 0) {
        return (
            <div className="text-center p-12 bg-stone-50 dark:bg-stone-800/50 rounded-2xl">
                <LeafIcon className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto" />
                <h3 className="mt-4 text-xl font-bold">دیوار گواهینامه‌های شما خالی است</h3>
                <p className="text-stone-500 dark:text-stone-400 mt-2">با کاشتن اولین میراث، اولین گواهینامه خود را دریافت کنید.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {palmEvents.map(event => (
                <button 
                    key={event.id} 
                    onClick={() => onCertificateClick(event)}
                    className="text-right transition-transform duration-300 hover:scale-105"
                >
                    <Certificate
                        userName={event.details.recipient || event.details.plantedBy}
                        palmName={event.details.title}
                        date={new Date(event.date).toLocaleDateString('fa-IR')}
                        certificateId={event.details.certificateId}
                    />
                </button>
            ))}
        </div>
    );
};

export default CertificateWall;