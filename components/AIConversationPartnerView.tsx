
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAIBlob, Session, Chat } from "@google/genai";
import { useAppDispatch, useAppState } from '../AppContext';
import { View, COMPANION_TRIAL_SECONDS, ChatMessage } from '../types';
import { ArrowLeftIcon, MicrophoneIcon, SparklesIcon, ClockIcon, PaperAirplaneIcon, ChatBubbleOvalLeftEllipsisIcon, DoubleCheckIcon, StopIcon, BrainCircuitIcon } from './icons';
import { getFallbackMessage } from '../services/geminiService';
import LiveSessionAccessModal from './LiveSessionAccessModal';

// --- Audio Helper Functions ---
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

// --- Advanced Audio Visualizer with AnalyserNode ---
const AdvancedAudioVisualizer: React.FC<{ analyser: AnalyserNode | null, isUserSpeaking: boolean }> = ({ analyser, isUserSpeaking }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        let animationId: number;
        const bufferLength = analyser ? analyser.frequencyBinCount : 0;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationId = requestAnimationFrame(draw);
            
            if (analyser) {
                analyser.getByteFrequencyData(dataArray);
            } else {
                 // Default idle wave
                 for(let i=0; i<bufferLength; i++) dataArray[i] = 0;
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 50;
            
            // Draw circular visualizer
            ctx.beginPath();
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = dataArray[i] / 2;
                const angle = (i * 2 * Math.PI) / bufferLength;
                const x = centerX + (radius + barHeight) * Math.cos(angle);
                const y = centerY + (radius + barHeight) * Math.sin(angle);
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.strokeStyle = isUserSpeaking ? '#FACC15' : '#4ADE80'; // Yellow/Amber for user, Green for AI
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Inner glow
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius - 5 + (analyser ? dataArray[0]/10 : 0), 0, 2 * Math.PI);
            ctx.fillStyle = isUserSpeaking ? 'rgba(250, 204, 21, 0.2)' : 'rgba(74, 222, 128, 0.2)';
            ctx.fill();
        };
        
        draw();
        return () => cancelAnimationFrame(animationId);
    }, [analyser, isUserSpeaking]);

    return <canvas ref={canvasRef} width={300} height={300} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-70" />;
};

const AIConversationPartnerView: React.FC = () => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    
    const [chatMode, setChatMode] = useState<'choice' | 'voice' | 'text'>('choice');
    
    // Common state for both modes
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("در حال اتصال...");
    const [error, setError] = useState<string | null>(null);
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
    const timerRef = useRef<number | null>(null);

    // Voice Chat State
    const [sessionPromise, setSessionPromise] = useState<Promise<Session> | null>(null);
    const [sessionState, setSessionState] = useState<'idle' | 'loading' | 'active' | 'paused'>('idle');
    const [transcriptHistory, setTranscriptHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
    const currentUserTranscriptRef = useRef('');
    const currentAiTranscriptRef = useRef('');
    const [currentUserTranscript, setCurrentUserTranscript] = useState('');
    const [currentAiTranscript, setCurrentAiTranscript] = useState('');
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'speaking' | 'listening'>('idle');
    
    // Helper ref to track user scroll
    const isUserScrolledUp = useRef(false);
    const voiceContainerRef = useRef<HTMLDivElement>(null);

    // Text Chat State
    const [textMessages, setTextMessages] = useState<ChatMessage[]>([]);
    const [textInput, setTextInput] = useState('');
    const [isTextLoading, setIsTextLoading] = useState(false);
    const textChatRef = useRef<Chat | null>(null);
    
    // Refs for audio resources
    const streamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const connectionTimeoutRef = useRef<number | null>(null);
    
    const [volumeLevel, setVolumeLevel] = useState(0); // For background color shift
    const volumeIntervalRef = useRef<number | null>(null);

    const sessionStateRef = useRef(sessionState);
    useEffect(() => { sessionStateRef.current = sessionState; }, [sessionState]);

    const isSessionActive = sessionState === 'active';

    const getAccessInfo = useCallback(() => {
        if (!user) return { type: 'none' as const, timeLeft: 0 };
        const liveAccess = user.hoshmanaLiveAccess;
        if (liveAccess && new Date(liveAccess.expiresAt) > new Date() && liveAccess.remainingSeconds > 0) {
            return { type: 'weekly' as const, timeLeft: liveAccess.remainingSeconds };
        }
        const trialTimeLeft = COMPANION_TRIAL_SECONDS - (user.companionTrialSecondsUsed || 0);
        if (!user.hasUnlockedCompanion && trialTimeLeft > 0) {
            return { type: 'trial' as const, timeLeft: trialTimeLeft };
        }
        return { type: 'none' as const, timeLeft: 0 };
    }, [user]);

    const [accessInfo, setAccessInfo] = useState(getAccessInfo());
    const [timeLeft, setTimeLeft] = useState(accessInfo.timeLeft);
    const sessionStartTimeRef = useRef<number>(0);

    // Monitor volume for background color shift
    useEffect(() => {
        if (isSessionActive && chatMode === 'voice') {
            volumeIntervalRef.current = window.setInterval(() => {
                if (analyserRef.current) {
                    const array = new Uint8Array(analyserRef.current.frequencyBinCount);
                    analyserRef.current.getByteFrequencyData(array);
                    let values = 0;
                    const length = array.length;
                    for (let i = 0; i < length; i++) values += array[i];
                    const average = values / length;
                    setVolumeLevel(average);
                }
            }, 100);
        } else {
             if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
             setVolumeLevel(0);
        }
        return () => { if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current); };
    }, [isSessionActive, chatMode]);

    // Calculate background style based on volume
    const getBackgroundStyle = () => {
        if (chatMode !== 'voice' || !isSessionActive) return {};
        
        // Base dark gray
        const baseR = 17;
        const baseG = 24;
        const baseB = 39;
        
        const intensity = Math.min(volumeLevel * 2, 80); 
        
        // Shift towards green/amber based on speaker? Let's just lighten it.
        const r = Math.min(255, baseR + intensity);
        const g = Math.min(255, baseG + intensity);
        const b = Math.min(255, baseB + intensity);
        
        return {
            backgroundColor: `rgb(${r}, ${g}, ${b})`,
            transition: 'background-color 0.1s ease-out'
        };
    };

    // Cycling loading messages
    useEffect(() => {
        if (isLoading && connectionStatus === 'connecting') {
            const messages = [
                "در حال آماده‌سازی دستیار صوتی...",
                "برقراری ارتباط امن...",
                "بررسی میکروفون...",
                "اتصال به سرور هوشمانا...",
                "تقریباً آماده است..."
            ];
            let index = 0;
            const interval = setInterval(() => {
                index++;
                if (index < messages.length) {
                    setLoadingMessage(messages[index]);
                } else {
                    clearInterval(interval);
                }
            }, 2500);
            return () => clearInterval(interval);
        }
    }, [isLoading, connectionStatus]);

    const systemInstruction = `You are 'Rahnavard' (رهنورد), a warm, curious, and knowledgeable fellow traveler (همسفر) on the journey of meaning. Your personality is friendly and informal, not like a formal coach. Your purpose is to help users explore their own sense of meaning, purpose, self-discovery, and personal development through reflective, Socratic dialogue. Speak in a simple, friendly, and non-formal tone. Pay close attention to the user's words to guide them with deep, open-ended questions. If the user asks questions outside of these topics (e.g., general knowledge, technical support), you must gently guide them back by saying: 'رسالت من در اینجا، همراهی شما در سفر معناست. برای سوالات دیگر، می‌توانی از دستیار هوشمند در صفحات اصلی سایت استفاده کنی.'. If the conversation revolves around self-understanding, suggest one of the platform's self-discovery tools. For behavioral styles, suggest the 'آینه رفتارشناسی' (DISC test). For deeper motivations, suggest 'نقشه روان انیاگرام' (Enneagram test). If they talk about skills or what they're good at, suggest 'چشمه استعدادها' (Strengths test). If they talk about purpose or what to do with their life, suggest the 'قطب‌نمای ایکیگای' (Ikigai compass). Always respond in warm, thoughtful, and casual Persian.`;


    useEffect(() => {
        const newAccessInfo = getAccessInfo();
        setAccessInfo(newAccessInfo);
        if (sessionState === 'idle') { setTimeLeft(newAccessInfo.timeLeft); }
    }, [user, getAccessInfo, sessionState]);

    useEffect(() => {
        if (!isUserScrolledUp.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [transcriptHistory, currentUserTranscript, currentAiTranscript, textMessages]);

    // --- Audio Cleanup ---
    const stopAudioPlayback = () => { audioSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} }); audioSourcesRef.current.clear(); nextStartTimeRef.current = 0; };
    const stopRecording = () => { if (scriptProcessorRef.current && mediaStreamSourceRef.current) { try { mediaStreamSourceRef.current.disconnect(); scriptProcessorRef.current.disconnect(); scriptProcessorRef.current.onaudioprocess = null; } catch (e) { console.error("Error stopping recording:", e); } } streamRef.current?.getTracks().forEach(t => t.stop()); };
    const cleanup = () => { 
        stopAudioPlayback(); 
        stopRecording(); 
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') inputAudioContextRef.current.close().catch(console.error); 
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') outputAudioContextRef.current.close().catch(console.error); 
        inputAudioContextRef.current = null; 
        outputAudioContextRef.current = null; 
        scriptProcessorRef.current = null; 
        mediaStreamSourceRef.current = null; 
        streamRef.current = null; 
        analyserRef.current = null;
        if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
        }
    };

    // --- Progress Saving ---
    const saveSessionProgress = useCallback(() => {
        if (!user || sessionStartTimeRef.current === 0) return;
        const elapsedSeconds = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
        if (elapsedSeconds <= 1) return;

        if (accessInfo.type === 'weekly' && user.hoshmanaLiveAccess) {
            const newRemaining = Math.max(0, user.hoshmanaLiveAccess.remainingSeconds - elapsedSeconds);
            dispatch({ type: 'UPDATE_USER', payload: { hoshmanaLiveAccess: { ...user.hoshmanaLiveAccess, remainingSeconds: newRemaining } } });
        } else if (accessInfo.type === 'trial') {
            const newTotalUsed = Math.min(COMPANION_TRIAL_SECONDS, (user.companionTrialSecondsUsed || 0) + elapsedSeconds);
            dispatch({ type: 'UPDATE_USER', payload: { companionTrialSecondsUsed: newTotalUsed } });
        }
        sessionStartTimeRef.current = 0;
    }, [user, dispatch, accessInfo.type]);

    // --- Stop Session and Cleanup ---
    const handleStopSession = useCallback(() => {
        if (chatMode === 'voice' && sessionPromise) sessionPromise.then(s => s.close());
        cleanup();
        saveSessionProgress();
        
        sessionStartTimeRef.current = 0;
        setSessionState('idle');
        setConnectionStatus('idle');
        setIsLoading(false);
        setIsAccessModalOpen(false);
        
        // Go back to profile on stop
        dispatch({ type: 'SET_VIEW', payload: View.UserProfile });

    }, [chatMode, sessionPromise, saveSessionProgress, user, dispatch]);

    // --- Unmount Cleanup ---
    useEffect(() => () => cleanup(), []);

    // --- Timer Logic ---
    useEffect(() => {
        const isActive = (chatMode === 'voice' && sessionState === 'active') || (chatMode === 'text' && !isTextLoading);
        if (isActive && timeLeft < Infinity && timeLeft > 0) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft(prev => {
                    const newTime = prev - 1;
                    if (newTime <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        setSessionState('paused'); // General pause state
                        setIsAccessModalOpen(true);
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [sessionState, isTextLoading, timeLeft, chatMode]);

    // --- Voice Chat Logic ---
    const startVoiceSession = async () => {
        if (timeLeft <= 0) { setIsAccessModalOpen(true); return; }
        setChatMode('voice');
        setSessionState('loading'); 
        setConnectionStatus('connecting');
        setIsLoading(true); 
        setError(null); 
        setLoadingMessage("در حال اتصال...");
        setTranscriptHistory([]);
        
        connectionTimeoutRef.current = window.setTimeout(() => {
            if (sessionState === 'loading' || connectionStatus === 'connecting') {
                cleanup();
                setIsLoading(false);
                setSessionState('idle');
                setConnectionStatus('idle');
                setError("اتصال برقرار نشد. لطفاً VPN یا اتصال اینترنت خود را بررسی کنید.");
            }
        }, 15000); 

        try {
            if (!inputAudioContextRef.current || (inputAudioContextRef.current.state as string) === 'closed') {
                 inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            }
            if (!outputAudioContextRef.current || (outputAudioContextRef.current.state as string) === 'closed') {
                 outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            if (inputAudioContextRef.current.state === 'suspended') await inputAudioContextRef.current.resume();
            if (outputAudioContextRef.current.state === 'suspended') await outputAudioContextRef.current.resume();
            
            analyserRef.current = inputAudioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;

        } catch (e) {
            console.warn("Audio context initialization failed:", e);
            setError("خطا در راه‌اندازی سیستم صوتی.");
            setIsLoading(false);
            if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
            return;
        }

        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const newSessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        if (connectionTimeoutRef.current) {
                            clearTimeout(connectionTimeoutRef.current);
                        }
                        if (!inputAudioContextRef.current || (inputAudioContextRef.current.state as string) === 'closed' || !streamRef.current) return;
                        setSessionState('active');
                        setConnectionStatus('connected');
                        setIsLoading(false); 
                        sessionStartTimeRef.current = Date.now();
                        
                        mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                        
                        if (analyserRef.current) {
                             mediaStreamSourceRef.current.connect(analyserRef.current);
                        }

                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmBlob: GenAIBlob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            newSessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
                        };
                        
                        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                             if (!outputAudioContextRef.current) return;
                            const outputContext = outputAudioContextRef.current;
                            if (outputContext.state === 'suspended') await outputContext.resume();
                            if ((outputContext.state as string) === 'closed') return;

                            setConnectionStatus('speaking');

                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContext.currentTime);
                            try {
                                const audioBuffer = await decodeAudioData(decode(base64Audio), outputContext, 24000, 1);
                                if ((outputContext.state as string) === 'closed') return;
                                const source = outputContext.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(outputContext.destination);
                                source.addEventListener('ended', () => {
                                    audioSourcesRef.current.delete(source);
                                    if(audioSourcesRef.current.size === 0) setConnectionStatus('connected');
                                });
                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                audioSourcesRef.current.add(source);
                            } catch(e) { console.error("Audio decode error", e); }
                        }
                        
                        if (message.serverContent?.interrupted) {
                            stopAudioPlayback();
                            setConnectionStatus('connected');
                        }

                        if (message.serverContent?.inputTranscription) {
                            setConnectionStatus('listening');
                            currentUserTranscriptRef.current += message.serverContent.inputTranscription.text;
                            setCurrentUserTranscript(currentUserTranscriptRef.current);
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentAiTranscriptRef.current += message.serverContent.outputTranscription.text;
                            setCurrentAiTranscript(currentAiTranscriptRef.current);
                        }
                        if(message.serverContent?.turnComplete) {
                            setConnectionStatus('connected');
                            if (currentUserTranscriptRef.current.trim() || currentAiTranscriptRef.current.trim()) {
                                setTranscriptHistory(prev => [
                                     ...prev, 
                                     { role: 'user', text: currentUserTranscriptRef.current }, 
                                     { role: 'ai', text: currentAiTranscriptRef.current }
                                 ]);
                                currentUserTranscriptRef.current = '';
                                currentAiTranscriptRef.current = '';
                                setCurrentUserTranscript('');
                                setCurrentAiTranscript('');
                            }
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setError(getFallbackMessage('connection'));
                        handleStopSession();
                    },
                    onclose: () => {
                        handleStopSession();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: systemInstruction,
                },
            });
            setSessionPromise(newSessionPromise);
        } catch (err) {
            console.error('Failed to start session:', err);
            setError("امکان دسترسی به میکروفون وجود ندارد. لطفاً مجوزهای مرورگر را بررسی کنید.");
            setIsLoading(false);
            setChatMode('choice');
        }
    };
    
    // --- Text Chat Logic ---
    const startTextSession = async () => {
        if (isSessionActive || isLoading) return;
        if (timeLeft <= 0) { setIsAccessModalOpen(true); return; }
        setChatMode('text');
        setIsLoading(true);
        setError(null);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            textChatRef.current = ai.chats.create({
                model: 'gemini-3-pro-preview',
                config: { systemInstruction },
            });
            
            const response = await textChatRef.current.sendMessage({ message: "سلام، لطفا خودت را معرفی کن." });
            setTextMessages([{ role: 'model', text: response.text }]);
            
            setSessionState('active');
            sessionStartTimeRef.current = Date.now();
        } catch (e) {
            console.error(e);
            setError(getFallbackMessage('chat'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendTextMessage = async () => {
        if (!textInput.trim() || isTextLoading || !textChatRef.current) return;
        const userMessage: ChatMessage = { role: 'user', text: textInput.trim() };
        setTextMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
        setTextInput('');
        setIsTextLoading(true);

        try {
            const stream = await textChatRef.current.sendMessageStream({ message: userMessage.text });
            let modelResponse = '';
            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setTextMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'model', text: modelResponse };
                    return newMessages;
                });
            }
        } catch (e) { 
            console.error(e); 
            setError(getFallbackMessage('chat')); 
            setTextMessages(prev => prev.slice(0, -2));
        } finally { 
            setIsTextLoading(false); 
        }
    };

    const handleExtendSession = () => {
        if (!user) return;
        const extensionCost = 200; // Mana points
        if (user.manaPoints >= extensionCost) {
            dispatch({ type: 'SPEND_MANA_POINTS', payload: { points: extensionCost, action: 'تمدید جلسه همراه معنا' } });
            setTimeLeft(prev => prev + 300); // Add 5 minutes
            setSessionState('active');
            setIsAccessModalOpen(false);
            sessionStartTimeRef.current = Date.now(); // Restart timer
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transcriptHistory, currentUserTranscript, currentAiTranscript, isTextLoading, transcriptHistory]);
    
    if (!user) return null;

    // --- Render ---
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                     <SparklesIcon className="w-16 h-16 text-yellow-300 animate-pulse mb-4" />
                     <p className="text-gray-300 text-lg font-medium animate-pulse">{loadingMessage}</p>
                </div>
            );
        }

        if (chatMode === 'choice') {
            return (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                    <h2 className="text-2xl font-bold mb-6 text-white">چطور می‌خواهید گفتگو کنید؟</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md">
                        <button onClick={startVoiceSession} className="p-8 bg-[#242F3D] hover:bg-[#2b5278] rounded-2xl transition-colors flex flex-col items-center gap-4 group border border-gray-700">
                            <div className="bg-[#2b5278] p-4 rounded-full group-hover:scale-110 transition-transform">
                                <MicrophoneIcon className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-lg font-semibold text-white">گفتگو با صدا (زنده)</span>
                        </button>
                        <button onClick={startTextSession} className="p-8 bg-[#242F3D] hover:bg-[#2b5278] rounded-2xl transition-colors flex flex-col items-center gap-4 group border border-gray-700">
                            <div className="bg-[#2b5278] p-4 rounded-full group-hover:scale-110 transition-transform">
                                <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-lg font-semibold text-white">گفتگو با پیام</span>
                        </button>
                    </div>
                </div>
            );
        }

        if (timeLeft <= 0 && !isSessionActive) {
            return (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                    <ClockIcon className="w-20 h-20 text-yellow-400 mb-6" />
                    <h1 className="text-3xl font-bold mb-4 text-white">زمان شما به پایان رسید</h1>
                    <p className="max-w-md text-gray-300 leading-relaxed">گفتگوی شما ذخیره شد. برای مشاهده تحلیل و قدم بعدی، به داشبورد خود بازگردید.</p>
                </div>
            );
        }
        
        // Chat Interface (Shared style for Voice/Text)
        return (
            <>
                <main className="flex-grow bg-[#0E1621] p-2 md:p-4 overflow-y-auto relative custom-scrollbar">
                     <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                     <div className="max-w-3xl mx-auto space-y-2 pb-4 relative z-10">
                        {chatMode === 'voice' && transcriptHistory.map((item, index) => (
                            <React.Fragment key={index}>
                                {item.text.trim() && (
                                    <div className={`flex w-full ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div 
                                            className={`max-w-[85%] px-4 py-2 text-sm leading-relaxed shadow-sm relative break-words
                                            ${item.role === 'user' 
                                                ? 'bg-[#2b5278] text-white rounded-2xl rounded-br-sm' 
                                                : 'bg-[#182533] text-white rounded-2xl rounded-bl-sm'
                                            }`}
                                        >
                                            {item.text}
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}

                        {chatMode === 'text' && textMessages.map((msg, index) => {
                            const isMe = msg.role === 'user';
                            return (
                                <div key={index} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div 
                                        className={`max-w-[85%] px-4 py-2 text-sm leading-relaxed shadow-sm relative break-words
                                        ${isMe 
                                            ? 'bg-[#2b5278] text-white rounded-2xl rounded-br-sm' 
                                            : 'bg-[#182533] text-white rounded-2xl rounded-bl-sm'
                                        }`}
                                    >
                                        {msg.text}
                                        {isMe && (
                                            <div className="flex justify-end mt-1">
                                                 <DoubleCheckIcon className="w-3 h-3 text-blue-300" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Live Transcripts for Voice Mode */}
                        {chatMode === 'voice' && (
                            <>
                                {currentUserTranscript && (
                                    <div className="flex justify-end">
                                        <div className="max-w-[85%] px-4 py-2 text-sm leading-relaxed bg-[#2b5278]/70 text-white rounded-2xl rounded-br-sm italic animate-pulse">
                                            {currentUserTranscript}
                                        </div>
                                    </div>
                                )}
                                {currentAiTranscript && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[85%] px-4 py-2 text-sm leading-relaxed bg-[#182533]/70 text-white rounded-2xl rounded-bl-sm italic animate-pulse">
                                            {currentAiTranscript}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                         
                        {isTextLoading && (
                             <div className="flex justify-start">
                                <div className="px-4 py-3 bg-[#182533] rounded-2xl rounded-bl-sm">
                                    <div className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </main>

                <footer className="p-3 bg-[#17212B] border-t border-black/20 flex-shrink-0 z-20">
                    {chatMode === 'text' ? (
                         <div className="max-w-3xl mx-auto flex items-end gap-2">
                            <textarea
                                value={textInput}
                                onChange={e => setTextInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && !e.shiftKey && handleSendTextMessage()}
                                placeholder="پیام خود را بنویسید..."
                                rows={1}
                                className="flex-grow bg-[#0E1621] text-white rounded-2xl py-3 px-4 focus:outline-none placeholder-gray-500 resize-none text-sm custom-scrollbar max-h-24 border border-transparent focus:border-[#2b5278]"
                                disabled={isTextLoading}
                            />
                            <button 
                                onClick={handleSendTextMessage} 
                                disabled={isTextLoading || !textInput.trim()} 
                                className={`p-3 rounded-full transition-all transform ${textInput.trim() ? 'bg-[#2b5278] text-white scale-100' : 'text-gray-500 bg-transparent scale-90'}`}
                            >
                                <PaperAirplaneIcon className="w-5 h-5 dir-ltr" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-2">
                             {/* Advanced Visualizer */}
                            <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                                 <AdvancedAudioVisualizer analyser={analyserRef.current} isUserSpeaking={connectionStatus === 'listening'} />
                                 <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 relative z-10 bg-[#2b5278]`}>
                                    <MicrophoneIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <button onClick={handleStopSession} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full text-sm shadow-lg transition-transform active:scale-95 flex items-center gap-2">
                                <StopIcon className="w-5 h-5" />
                                پایان گفتگو
                            </button>
                        </div>
                    )}
                </footer>
            </>
        );
    };

    const scenarioTitle = "همراه معنا";

    return (
        <div className="flex flex-col h-screen bg-[#0E1621] text-white pt-20 md:pt-0 transition-colors duration-500" style={getBackgroundStyle()}>
             <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2b2b2b; border-radius: 10px; }
                 @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
                .animate-fade-in { animation: fade-in 0.5s ease-in-out; }
            `}</style>
            
            {/* Centered Outer Container Frame for Desktop */}
            <div className="flex-grow flex items-center justify-center w-full md:p-6">
                 <div className="w-full md:max-w-4xl h-full md:h-[90vh] bg-[#17212B]/80 md:backdrop-blur-xl rounded-none md:rounded-3xl shadow-2xl border-0 md:border border-white/10 flex flex-col overflow-hidden relative">
                    
                    {/* Header */}
                    <header className="flex-shrink-0 bg-[#17212B] border-b border-black/20 shadow-md z-30">
                        <div className="px-4 py-3 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                                        <BrainCircuitIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#17212B] rounded-full"></span>
                                </div>
                                <div>
                                    <h1 className="text-base font-bold text-white">{scenarioTitle}</h1>
                                    <p className="text-xs text-blue-300">AI Life Coach</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {(isSessionActive || (timeLeft > 0 && timeLeft < accessInfo.timeLeft)) && (
                                    <div className={`px-3 py-1 rounded-full bg-[#0E1621] border border-gray-700 flex items-center gap-2 font-mono font-bold text-sm ${timeLeft < 60 && timeLeft > 0 ? 'text-red-400 animate-pulse border-red-900' : 'text-blue-300'}`}>
                                        <ClockIcon className="w-4 h-4" />
                                        <span>{formatTime(timeLeft)}</span>
                                    </div>
                                )}
                                <button onClick={() => { handleStopSession(); dispatch({ type: 'SET_VIEW', payload: View.UserProfile }); }} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                                    <ArrowLeftIcon className="w-6 h-6"/>
                                </button>
                            </div>
                        </div>
                    </header>
                    
                    <div className="relative flex-grow flex flex-col overflow-hidden w-full">
                        {/* Ambient Background for Voice Mode */}
                        {chatMode === 'voice' && isSessionActive && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                                 <div className="w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
                            </div>
                        )}
                         {/* Error Banner */}
                        {error && (
                            <div className="absolute top-4 left-4 right-4 z-50 bg-red-900/90 text-white px-4 py-3 rounded-lg text-center shadow-lg border border-red-700 animate-fade-in">
                                <p>{error}</p>
                                <button onClick={() => setError('')} className="text-xs text-red-200 hover:text-white mt-1 underline">بستن</button>
                            </div>
                        )}
                        {renderContent()}
                    </div>
                    
                     <LiveSessionAccessModal
                        isOpen={isAccessModalOpen}
                        onClose={handleStopSession}
                        onExtendWithPoints={handleExtendSession}
                        featureName="همراه معنا"
                    />
                 </div>
            </div>
        </div>
    );
};

export default AIConversationPartnerView;
