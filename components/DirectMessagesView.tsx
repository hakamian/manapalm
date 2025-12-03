
import React, { useState, useEffect, useRef } from 'react';
import { Conversation, View, DirectMessage } from '../types';
import { useAppState, useAppDispatch } from '../AppContext';
import { PaperAirplaneIcon, EnvelopeIcon, PaperClipIcon, MagnifyingGlassIcon, ChevronLeftIcon, CheckIcon, DoubleCheckIcon, MicrophoneIcon } from './icons';
import { timeAgo } from '../utils/time';

const DirectMessagesView: React.FC = () => {
    const { user: currentUser, allUsers } = useAppState();
    const dispatch = useAppDispatch();
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // In a real app, these would be dispatched actions to a reducer/backend
    const onSendMessage = (conversationId: string, text: string) => console.log({ conversationId, text });
    const onMarkConversationAsRead = (conversationId: string) => console.log({ conversationId });

    const sortedConversations = currentUser ? [...currentUser.conversations].sort((a, b) => {
        const lastMsgA = a.messages[a.messages.length - 1]?.timestamp;
        const lastMsgB = b.messages[b.messages.length - 1]?.timestamp;
        if (!lastMsgA) return 1; if (!lastMsgB) return -1;
        return new Date(lastMsgB).getTime() - new Date(lastMsgA).getTime();
    }) : [];

    const filteredConversations = sortedConversations.filter(c => {
        const otherId = c.participantIds.find(id => id !== currentUser?.id);
        const otherUser = c.participantDetails[otherId!];
        return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    useEffect(() => {
        // Only select first if on desktop and none selected
        if (window.innerWidth >= 768 && sortedConversations.length > 0 && !selectedConversationId) {
            setSelectedConversationId(sortedConversations[0].id);
        }
    }, [sortedConversations, selectedConversationId]);
    
    useEffect(() => {
        if (selectedConversationId) onMarkConversationAsRead(selectedConversationId);
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedConversationId, currentUser?.conversations]);

    const handleSendMessage = () => {
        if (messageText.trim() && selectedConversationId) {
            onSendMessage(selectedConversationId, messageText);
            setMessageText('');
        }
    };
    
    if (!currentUser) return null;

    const selectedConversation = currentUser.conversations.find(c => c.id === selectedConversationId);
    const getOtherParticipant = (convo: Conversation) => convo.participantDetails[convo.participantIds.find(id => id !== currentUser.id)!];

    // Helper to format time for messages
    const formatMessageTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="pt-20 md:pt-24 pb-0 min-h-screen bg-[#0F172A] text-white flex justify-center">
            <div className="w-full max-w-6xl h-[calc(100dvh-100px)] bg-[#1c2732] rounded-xl shadow-2xl overflow-hidden flex border border-gray-800">
                
                {/* Sidebar (Chat List) */}
                <aside className={`w-full md:w-1/3 border-l border-gray-800 flex flex-col bg-[#17212B] ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
                    {/* Sidebar Header */}
                    <div className="p-3 border-b border-gray-800 bg-[#17212B]">
                        <div className="relative">
                             <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="جستجو..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#242F3D] text-white rounded-full py-2 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-[#2b5278] transition-all placeholder-gray-500 text-sm"
                            />
                        </div>
                    </div>
                    
                    {/* Chat List */}
                    <div className="flex-grow overflow-y-auto custom-scrollbar">
                        {filteredConversations.map(convo => {
                            const otherUser = getOtherParticipant(convo);
                            const lastMessage = convo.messages[convo.messages.length - 1];
                            const isSelected = selectedConversationId === convo.id;
                            
                            return (
                                <div 
                                    key={convo.id} 
                                    onClick={() => setSelectedConversationId(convo.id)} 
                                    className={`px-3 py-2 flex items-center gap-3 cursor-pointer transition-colors duration-200 group ${isSelected ? 'bg-[#2b5278]' : 'hover:bg-[#202B36]'}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <img src={otherUser.avatar} alt={otherUser.name} className="w-12 h-12 rounded-full object-cover bg-gray-700" />
                                        {convo.unreadCount > 0 && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#17212B] rounded-full"></span>
                                        )}
                                    </div>
                                    <div className="flex-grow min-w-0 pb-2 border-b border-gray-800/50 group-hover:border-transparent h-full flex flex-col justify-center">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className={`font-semibold text-sm truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>{otherUser.name}</h4>
                                            {lastMessage && (
                                                <span className={`text-xs ${isSelected ? 'text-blue-200' : 'text-gray-500'} flex-shrink-0 ml-1`}>
                                                    {formatMessageTime(lastMessage.timestamp)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className={`text-xs truncate flex-grow ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                                {lastMessage?.senderId === currentUser.id && <span className="text-blue-400">شما: </span>}
                                                {lastMessage?.text || 'شروع گفتگو...'}
                                            </p>
                                            {convo.unreadCount > 0 && (
                                                <div className={`min-w-[1.25rem] h-5 flex items-center justify-center rounded-full text-xs font-bold px-1 ml-1 ${isSelected ? 'bg-white text-[#2b5278]' : 'bg-[#2b5278] text-white'}`}>
                                                    {convo.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {/* Main Chat Area */}
                <main className={`w-full md:w-2/3 flex flex-col bg-[#0E1621] relative ${!selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
                    {/* Background Pattern Overlay (Optional, simulated with opacity) */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                    {selectedConversation ? (
                        <>
                            {/* Header */}
                            <header className="flex items-center px-4 py-2 bg-[#17212B] border-b border-black/20 shadow-sm z-10 cursor-pointer">
                                <button 
                                    onClick={() => setSelectedConversationId(null)} 
                                    className="md:hidden text-gray-400 hover:text-white mr-2 ml-2"
                                >
                                    <ChevronLeftIcon className="w-6 h-6" />
                                </button>
                                <div className="flex items-center gap-3 flex-grow">
                                    <img src={getOtherParticipant(selectedConversation).avatar} alt="User" className="w-10 h-10 rounded-full object-cover bg-gray-700" />
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-white text-sm">{getOtherParticipant(selectedConversation).name}</h3>
                                        <span className="text-xs text-gray-400">آخرین بازدید به تازگی</span>
                                    </div>
                                </div>
                            </header>

                            {/* Messages List */}
                            <div className="flex-grow overflow-y-auto p-2 md:p-4 space-y-2 custom-scrollbar z-0">
                                {selectedConversation.messages.map((msg, index) => {
                                    const isMe = msg.senderId === currentUser.id;
                                    const isRead = msg.status === 'read';
                                    // Group logic (simple check if prev message was same sender)
                                    const prevMsg = selectedConversation.messages[index - 1];
                                    const isSequence = prevMsg && prevMsg.senderId === msg.senderId;

                                    return (
                                        <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${isSequence ? 'mt-0.5' : 'mt-2'}`}>
                                            <div 
                                                className={`max-w-[75%] md:max-w-[65%] px-3 py-2 relative shadow-sm text-sm leading-relaxed break-words
                                                ${isMe 
                                                    ? 'bg-[#2b5278] text-white rounded-l-lg rounded-tr-lg ' + (isSequence ? 'rounded-br-lg' : 'rounded-br-[2px]')
                                                    : 'bg-[#182533] text-white rounded-r-lg rounded-tl-lg ' + (isSequence ? 'rounded-bl-lg' : 'rounded-bl-[2px]')
                                                }`}
                                            >
                                                <span className="block min-w-[60px] pb-1">{msg.text}</span>
                                                <div className={`flex items-center justify-end gap-1 select-none float-right -mb-1 -ml-1 mt-1`}>
                                                    <span className={`text-[10px] ${isMe ? 'text-blue-200' : 'text-gray-500'}`}>
                                                        {formatMessageTime(msg.timestamp)}
                                                    </span>
                                                    {isMe && (
                                                        <span className={isRead ? 'text-blue-300' : 'text-blue-300'}>
                                                            {isRead ? <DoubleCheckIcon className="w-3.5 h-3.5" /> : <CheckIcon className="w-3.5 h-3.5" />}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef}></div>
                            </div>

                            {/* Input Area */}
                            <div className="p-2 md:p-3 bg-[#17212B] border-t border-black/20 z-10">
                                <div className="flex items-end gap-2 max-w-4xl mx-auto">
                                    <button className="p-3 text-gray-400 hover:text-gray-300 transition-colors">
                                        <PaperClipIcon className="w-6 h-6 transform rotate-45" />
                                    </button>
                                    <div className="flex-grow bg-[#17212B] relative">
                                         <textarea
                                            value={messageText}
                                            onChange={e => setMessageText(e.target.value)}
                                            onKeyPress={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                            placeholder="پیام..."
                                            rows={1}
                                            className="w-full bg-[#0E1621] text-white rounded-2xl py-3 px-4 focus:outline-none placeholder-gray-500 resize-none custom-scrollbar max-h-32 block border border-transparent focus:border-[#2b5278]"
                                            style={{ minHeight: '48px' }}
                                        />
                                    </div>
                                    <button 
                                        onClick={handleSendMessage} 
                                        className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 ${messageText.trim() ? 'bg-[#2b5278] text-white hover:bg-[#234565] transform scale-100' : 'text-gray-400 hover:bg-[#202B36]'}`}
                                    >
                                        {messageText.trim() ? <PaperAirplaneIcon className="w-5 h-5 md:w-6 md:h-6 dir-ltr" /> : <MicrophoneIcon className="w-6 h-6" />}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-[#0E1621]">
                            <div className="bg-[#17212B] p-4 rounded-full mb-4">
                                <span className="text-sm bg-gray-800 px-2 py-1 rounded-md">انتخاب کنید</span>
                            </div>
                            <p>یک گفتگو را برای شروع انتخاب کنید.</p>
                        </div>
                    )}
                </main>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2b2b2b; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #404040; }
                .dir-ltr { direction: ltr; }
            `}</style>
        </div>
    );
};

export default DirectMessagesView;
