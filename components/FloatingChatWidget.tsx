import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { ChatMessage } from '../types.ts';
// FIX: Corrected icon name to match export.
import { XIcon, ChatBubbleOvalLeftEllipsisIcon, PaperAirplaneIcon } from './icons.tsx';

const FloatingChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isInitialized && !isOpen) { // Initialize on first open
            initializeChat();
        }
    };
    
    const initializeChat = () => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const chatSession = ai.chats.create({ model: 'gemini-2.5-flash' });
            setChat(chatSession);
            setMessages([{ role: 'model', text: 'سلام! من دستیار هوشمند شما هستم. چطور می‌توانم کمکتان کنم؟' }]);
            setIsInitialized(true);
        } catch (error) {
            console.error("Error initializing AI:", error);
            setMessages([{ role: 'model', text: 'خطا در راه‌اندازی سرویس هوش مصنوعی.' }]);
        }
    }

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading || !chat) return;

        const userMessage: ChatMessage = { role: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        setMessages(prev => [...prev, { role: 'model', text: '' }]);

        try {
            const stream = await chat.sendMessageStream({ message: userMessage.text });

            let modelResponse = '';
            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'model', text: modelResponse };
                    return newMessages;
                });
            }

        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: ChatMessage = { role: 'model', text: 'متاسفانه خطایی در ارتباط با سرور رخ داد.' };
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = errorMessage;
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    
    return (
        <>
            <style>{`
                @keyframes subtle-glow {
                    0%, 100% {
                        box-shadow: 0 0 15px 3px rgba(245, 158, 11, 0.4);
                    }
                    50% {
                        box-shadow: 0 0 25px 8px rgba(245, 158, 11, 0.6);
                    }
                }
                .animate-subtle-