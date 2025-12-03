


import React, { useState, useEffect, useRef } from 'react';
import { Conversation, View } from '../types';
import { useAppState, useAppDispatch } from '../AppContext';
import { PaperAirplaneIcon, EnvelopeIcon } from './icons';

const DirectMessagesView: React.FC = () => {
    const { user: currentUser, allUsers } = useAppState();
    const dispatch = useAppDispatch();
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
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

    useEffect(() => {
        if (sortedConversations.length > 0 && !selectedConversationId) {
            setSelectedConversationId(sortedConversations[0].id);
        }
    }, [currentUser?.conversations, selectedConversationId, sortedConversations]);
    
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

    return (
        <div className="pt-24 min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-8">پیام‌های مستقیم</h1>
                <div className="flex h-[calc(100vh-200px)] bg-gray-800 rounded-lg border border-gray-700">
                    <aside className="w-1/3 border-l border-gray-700 overflow-y-auto">
                        <div className="p-4 font-bold border-b border-gray-700">گفتگوها</div>
                        {sortedConversations.map(convo => {
                            const otherUser = getOtherParticipant(convo);
                            const lastMessage = convo.messages[convo.messages.length - 1];
                            return (
                                <div key={convo.id} onClick={() => setSelectedConversationId(convo.id)} className={`p-4 flex items-center cursor-pointer border-b border-gray-700/50 ${selectedConversationId === convo.id ? 'bg-green-900/40' : 'hover:bg-gray-700/50'}`}>
                                    <div className="relative"><img src={otherUser.avatar} alt={otherUser.name} className="w-12 h-12 rounded-full object-cover" />{convo.unreadCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{convo.unreadCount}</span>}</div>
                                    <div className="mr-3 flex-grow overflow-hidden"><p className="font-semibold text-white">{otherUser.name}</p><p className="text-sm text-gray-400 truncate">{lastMessage?.text || 'شروع گفتگو...'}</p></div>
                                </div>
                            );
                        })}
                    </aside>
                    <main className="w-2/3 flex flex-col">
                        {selectedConversation ? (
                            <>
                                <header className="p-4 border-b border-gray-700 flex items-center"><img src={getOtherParticipant(selectedConversation).avatar} alt={getOtherParticipant(selectedConversation).name} className="w-10 h-10 rounded-full object-cover" /><p className="font-bold mr-3">{getOtherParticipant(selectedConversation).name}</p></header>
                                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                                    {selectedConversation.messages.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}><div className={`p-3 rounded-lg max-w-lg ${msg.senderId === currentUser.id ? 'bg-green-800' : 'bg-gray-700'}`}><p className="whitespace-pre-wrap">{msg.text}</p></div></div>
                                    ))}
                                    <div ref={messagesEndRef}></div>
                                </div>
                                <div className="p-4 border-t border-gray-700">
                                    <div className="flex items-center space-x-2 space-x-reverse bg-gray-700 rounded-lg pr-3">
                                        <input type="text" value={messageText} onChange={e => setMessageText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="پیام خود را بنویسید..." className="flex-grow bg-transparent border-none focus:ring-0 text-white"/>
                                        <button onClick={handleSendMessage} disabled={!messageText.trim()} className="p-3 text-white disabled:text-gray-500"><PaperAirplaneIcon className="w-6 h-6" /></button>
                                    </div>
                                </div>
                            </>
                        ) : (<div className="flex flex-col items-center justify-center h-full text-gray-500"><EnvelopeIcon className="w-24 h-24" /><p className="mt-4">یک گفتگو را برای مشاهده انتخاب کنید.</p></div>)}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DirectMessagesView;
