
import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppState } from '../AppContext';
import { View } from '../types';
import { useCoachingSession } from '../hooks/useCoachingSession';
import { 
    ArrowLeftIcon, PaperAirplaneIcon, SparklesIcon, 
    BrainCircuitIcon, MicrophoneIcon, PaperClipIcon, 
    CheckCircleIcon, BriefcaseIcon, SunIcon, UserCircleIcon 
} from './icons';
import AIContentRenderer from './AIContentRenderer';

const CoachingSessionView: React.FC = () => {
    const { coachingSession, user } = useAppState();
    const dispatch = useAppDispatch();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const { 
        messages, 
        input, 
        setInput, 
        isThinking, 
        error, 
        initChat, 
        sendMessage,
        suggestions 
    } = useCoachingSession(
        coachingSession?.role || 'coachee', 
        coachingSession?.topic || 'General',
        process.env.API_KEY!
    );

    useEffect(() => {
        initChat();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking, suggestions]);

    // Header Icon logic based on role
    const getHeaderIcon = () => {
        if (coachingSession?.role === 'business_client') return <BriefcaseIcon className="w-6 h-6 text-blue-300" />;
        return <SunIcon className="w-6 h-6 text-amber-300" />;
    };

    const getHeaderTitle = () => {
         if (coachingSession?.role === 'business_client') return "منتور استراتژیک بیزینس";
         return "مشاور هوشمند زندگی";
    };

    return (
        <div className="flex flex-col h-screen bg-[#0f172a] text-white overflow-hidden relative font-sans items-center justify-center md:p-6">
             {/* Background Pattern (Telegram-like) */}
             <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

             {/* Frame Container */}
             <div className="w-full md:max-w-4xl h-full md:h-[90vh] bg-[#1e293b]/80 md:backdrop-blur-xl rounded-none md:rounded-3xl shadow-2xl border-0 md:border border-gray-700/50 flex flex-col overflow-hidden relative">

                 {/* Header */}
                 <header className="flex-shrink-0 bg-[#1e293b]/90 backdrop-blur-md border-b border-gray-700/50 z-20 shadow-lg">
                    <div className="px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-11 h-11 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center border border-gray-600 shadow-inner">
                                    {getHeaderIcon()}
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1e293b] rounded-full animate-pulse"></span>
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-white">{getHeaderTitle()}</h1>
                                <p className="text-xs text-blue-300 truncate max-w-[150px] sm:max-w-xs opacity-90">
                                    {coachingSession?.topic}
                                </p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => dispatch({ type: 'SET_VIEW', payload: coachingSession?.returnView || View.UserProfile })} 
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ArrowLeftIcon className="w-6 h-6"/>
                        </button>
                    </div>
                </header>
                 
                 {/* Chat Area */}
                 <main className="flex-grow overflow-y-auto p-2 md:p-4 custom-scrollbar z-10">
                    <div className="space-y-3 pb-4">
                        {/* Date Divider Example */}
                        <div className="flex justify-center my-4">
                            <span className="bg-black/20 text-gray-400 text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
                                شروع جلسه هوشمند
                            </span>
                        </div>

                        {messages.map((msg, i) => {
                            const isUser = msg.role === 'user';
                            return (
                                <div key={i} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} group`}>
                                    {!isUser && (
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 ml-2 self-end mb-1 hidden sm:flex items-center justify-center border border-gray-600">
                                             <BrainCircuitIcon className="w-5 h-5 text-gray-400" />
                                        </div>
                                    )}
                                    
                                    <div 
                                        className={`relative max-w-[85%] md:max-w-[75%] p-3 md:p-4 rounded-2xl shadow-sm text-sm 
                                        ${isUser 
                                            ? 'bg-[#2b5278] text-white rounded-br-sm' 
                                            : 'bg-[#1e293b] text-gray-100 rounded-bl-sm border border-gray-700/50'
                                        }`}
                                    >
                                        {/* Render Content with Visuals support */}
                                        {isUser ? (
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                        ) : (
                                            <AIContentRenderer content={msg.text} />
                                        )}
                                        
                                        {/* Metadata / Time */}
                                        <div className={`flex items-center justify-end gap-1 mt-1 select-none ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                                            <span className="text-[10px] opacity-70">
                                                {new Date().toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                            {isUser && <CheckCircleIcon className="w-3 h-3 opacity-80" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {isThinking && (
                            <div className="flex justify-start w-full">
                                 <div className="bg-[#1e293b] border border-gray-700/50 p-3 rounded-2xl rounded-bl-sm flex items-center gap-2 shadow-sm ml-0 sm:ml-10">
                                    <div className="flex space-x-1 space-x-reverse">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    </div>
                                    <span className="text-xs text-gray-400 animate-pulse">در حال تحلیل و ترسیم...</span>
                                </div>
                            </div>
                        )}
                        
                        {error && (
                            <div className="flex justify-center">
                                 <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-xs">
                                    {error}
                                 </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} style={{height: 1}} />
                    </div>
                 </main>

                 {/* Input Footer */}
                 <footer className="flex-shrink-0 p-2 md:p-4 bg-[#1e293b] border-t border-gray-700/50 z-20">
                    <div className="">
                        {/* Suggestions Chips - Vertical Layout */}
                        {suggestions.length > 0 && !isThinking && (
                            <div className="flex flex-col gap-2 px-1 mb-3 animate-fade-in">
                                {suggestions.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => sendMessage(suggestion)}
                                        className="w-full text-right px-4 py-3 bg-[#2b5278]/30 hover:bg-[#2b5278]/50 border border-[#2b5278]/50 text-blue-100 text-sm rounded-xl transition-all active:scale-[0.98] shadow-sm"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex items-end gap-2 bg-[#0f172a] rounded-2xl border border-gray-700 p-2 focus-within:border-blue-500/50 transition-colors shadow-inner">
                            
                            {/* Attach Button (Visual) */}
                            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors flex-shrink-0">
                                <PaperClipIcon className="w-6 h-6 transform -rotate-45" />
                            </button>

                            <textarea 
                                className="flex-grow bg-transparent text-white max-h-32 min-h-[44px] py-3 px-2 focus:outline-none resize-none text-sm custom-scrollbar placeholder-gray-500"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                                placeholder="پیام خود را بنویسید..."
                                rows={1}
                            />
                            
                            {input.trim() ? (
                                 <button 
                                    onClick={() => sendMessage(input)} 
                                    className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all shadow-lg hover:shadow-blue-500/30 transform hover:scale-105 mb-0.5"
                                >
                                    <PaperAirplaneIcon className="w-5 h-5 dir-ltr" />
                                </button>
                            ) : (
                                <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors mb-0.5">
                                    <MicrophoneIcon className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    </div>
                 </footer>
             </div>
        </div>
    );
};

export default CoachingSessionView;
