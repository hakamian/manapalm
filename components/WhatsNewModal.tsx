
import React, { useState, useEffect } from 'react';
import { getLatestRelease } from '../utils/releaseNotes';
import Modal from './Modal';
import { SparklesIcon, CheckCircleIcon, RocketLaunchIcon } from './icons';

interface WhatsNewModalProps {
    // No props needed, it manages its own visibility based on local storage
}

const WhatsNewModal: React.FC<WhatsNewModalProps> = () => {
    const [isOpen, setIsOpen] = useState(false);
    const latest = getLatestRelease();

    useEffect(() => {
        const lastSeenVersion = localStorage.getItem('last_seen_version');
        if (lastSeenVersion !== latest.version && latest.isMajor) {
            // Delay slightly for better UX
            const timer = setTimeout(() => setIsOpen(true), 2000);
            return () => clearTimeout(timer);
        }
    }, [latest.version, latest.isMajor]);

    const handleClose = () => {
        localStorage.setItem('last_seen_version', latest.version);
        setIsOpen(false);
    };

    if (!latest) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="max-w-lg w-full bg-stone-900 text-white rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-purple-200 mb-4 border border-white/20">
                            <RocketLaunchIcon className="w-4 h-4" />
                            نسخه جدید {latest.version}
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{latest.title}</h2>
                        <p className="text-purple-200 text-sm">{latest.description}</p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {latest.features.map((feature, idx) => (
                        <div key={idx}>
                            <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-3">
                                {React.createElement(feature.icon, { className: "w-5 h-5 text-amber-400" })}
                                {feature.category}
                            </h3>
                            <ul className="space-y-2">
                                {feature.items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-stone-300">
                                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-stone-800 bg-stone-900">
                    <button 
                        onClick={handleClose}
                        className="w-full bg-white text-stone-900 font-bold py-3 rounded-xl hover:bg-stone-200 transition-colors"
                    >
                        متوجه شدم، بزن بریم!
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default WhatsNewModal;
