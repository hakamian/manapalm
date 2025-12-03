
// Fix: Created the full content for MessagesPage.tsx.
import React, { useState, useMemo } from 'react';
import { User, Conversation, DirectMessage, View } from '../types.ts';
import { PaperAirplaneIcon } from './icons.tsx';
import { INITIAL_CONVERSATIONS } from '../utils/dummyData.ts';

interface MessagesPageProps {
    currentUser: User;
    allUsers: User[];
}

const MessagesPage: React.FC<MessagesPageProps> = ({ currentUser, allUsers }) => {
    // For the purpose of this mock, we'll manage conversations in local state.
    const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(conversations[0]?.id || null);
    const [newMessage, setNewMessage] = useState('');

    const activeConversation = useMemo(() => {
        return conversations.find(c => c.id === activeConversationId);
    }, [conversations, activeConversationId]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !activeConversation) return;

        // FIX: Add missing 'timestamp' and 'status' properties to match DirectMessage type.
        const message: DirectMessage = {
            id: `msg_${Date.now()}`,
            senderId: currentUser.id,
            text: newMessage,
            timestamp: new Date().toISOString(),
            status: 'sent',
        };

        setConversations(prev =>
            prev.map(c =>
                c.id === activeConversationId ? { ...c, messages: [...c.messages, message] } : c
            )
        );
        setNewMessage('');
    };

    return (
        <div className="flex h-[calc(100vh-12rem)] bg-white dark:bg-stone-800/50 rounded-2xl shadow-lg border border-stone-200/80 dark:border-stone-700 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-1/3 border-r dark:border-stone-700 flex flex-col">
                <div className="p-4 border-b dark:border-stone-700">
                    <h1 className="font-bold text-xl">پیام‌ها</h1>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {conversations.map(conv => {
                        const otherParticipantId = conv.participantIds.find(id => id !== currentUser.id);
                        const otherParticipant = allUsers.find(u => u.id === otherParticipantId);
                        const lastMessage = conv.messages[conv.messages.length - 1];

                        return (
                            <button
                                key={conv.id}
                                onClick={() => setActiveConversationId(conv.id)}
                                className={`w-full text-right flex items-center gap-3 p-3 transition-colors ${activeConversationId === conv.id ? 'bg-amber-50 dark:bg-amber-900/30' : 'hover:bg-stone-50 dark:hover:bg-stone-700/50'}`}
                            >
                                <img src={otherParticipant?.profileImageUrl || `https://ui-avatars.com/api/?name=${otherParticipant?.name}`} alt={otherParticipant?.name} className="w-12 h-12 rounded-full" />
                                <div className="flex-grow overflow-hidden">
                                    <p className="font-semibold">{otherParticipant?.name}</p>
                                    <p className="text-sm text-stone-500 truncate">{lastMessage?.text}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col">
                {activeConversation ? (
                    <>
                        <div className="p-4 border-b dark:border-stone-700">
                            <h2 className="font-bold">{allUsers.find(u => u.id === activeConversation.participantIds.find(id => id !== currentUser.id))?.name}</h2>
                        </div>
                        <div className="flex-grow p-4 overflow-y-auto space-y-4">
                            {activeConversation.messages.map(msg => (
                                <div key={msg.id} className={`flex items-start gap-3 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-3 rounded-xl ${msg.senderId === currentUser.id ? 'bg-amber-500 text-white' : 'bg-stone-200 dark:bg-stone-700'}`}>
                                        <p>{msg.text}</p>
                                        {/* FIX: Use 'timestamp' instead of 'date'. */}
                                        <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t dark:border-stone-700">
                             <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="پیام خود را بنویسید..."
                                    className="flex-1 bg-stone-100 dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg p-3 text-sm"
                                />
                                <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="bg-amber-500 text-white rounded-lg p-3 disabled:bg-amber-300">
                                    <PaperAirplaneIcon className="w-6 h-6"/>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-stone-500">
                        <p>یک گفتگو را برای شروع انتخاب کنید.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MessagesPage;
