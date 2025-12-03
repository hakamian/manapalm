
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAIBlob, Session, Chat } from "@google/genai";
import { useAppDispatch, useAppState } from '../AppContext';
import { View, COMPANION_TRIAL_SECONDS, ChatMessage } from '../types';
import { ArrowLeftIcon, MicrophoneIcon, SparklesIcon, ClockIcon, PaperAirplaneIcon, ChatBubbleOvalLeftEllipsisIcon, DoubleCheckIcon, StopIcon, BrainCircuitIcon, CheckCircleIcon, PaperClipIcon, XMarkIcon, SpeakerWaveIcon } from './icons';
import { getFallbackMessage } from '../services/geminiService';
import LiveSessionAccessModal from './LiveSessionAccessModal';
import AIContentRenderer from './AIContentRenderer';

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

// --- Organic "Liquid Soul" Visualizer ---
const LiquidOrbVisualizer: React.FC<{ volume: number, state: 'idle' | 'listening' | 'thinking' | 'speaking' }> = ({ volume, state }) => {
    // Map state to colors
    const colors = {
        idle: 'from-blue-500/40 to-purple-600/40',
        listening: 'from-green-400/60 to-emerald-600/60',
        thinking: 'from-amber-400/60 to-orange-600/60',
        speaking: 'from-indigo-400/60 to-purple-600/60'
    };

    // Calculate dynamic scale based on volume
    const baseScale = 1;
    const dynamicScale = state === 'speaking' || state === 'listening' 
        ? baseScale + (volume / 255) * 1.5 
        : baseScale;

    return (
        <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Outer Glow */}
            <div 
                className={`absolute inset-0 rounded-full blur-3xl bg-gradient-to-tr ${colors[state]} transition-all duration-1000 opacity-40`}
                style={{ transform: `scale(${dynamicScale * 1.2})` }}
            ></div>

            {/* Core Orb */}
            <div 
                className={`relative w-48 h-48 rounded-full bg-gradient-to-tr ${colors[state]} blur-md transition-all duration-150 shadow-[0_0_60px_rgba(255,255,255,0.1)]`}
                style={{ 
                    transform: `scale(${dynamicScale})`,
                    animation: state === 'thinking' ? 'spin-slow 3s linear infinite' : 'breathe 4s ease-in-out infinite'
                }}
            >
                {/* Inner Texture/Movement */}
                <div className="absolute inset-0 rounded-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse-slow"></div>
            </div>

            {/* Status Indicator Icon */}
            <div className="absolute z-10 text-white/80 drop-shadow-lg">
                {state === 'thinking' && <SparklesIcon className="w-12 h-12 animate-spin" />}
                {state === 'listening' && <MicrophoneIcon className="w-12 h-12 animate-pulse" />}
                {state === 'speaking' && <SpeakerWaveIcon className="w-12 h-12" />}
                {state === 'idle' && <div className="w-4 h-4 bg-white/50 rounded-full animate-ping"></div>}
            </div>

            <style>{`
                @keyframes breathe {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

const MeaningCompanionView: React.FC = () => {
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

    // Text Chat State
    const [textMessages, setTextMessages] = useState<ChatMessage[]>([]);
    const [textInput, setTextInput] = useState('');
    const [isTextLoading, setIsTextLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
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
            }, 50);
        } else {
             if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
             setVolumeLevel(0);
        }
        return () => { if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current); };
    }, [isSessionActive, chatMode]);

    const getBackgroundStyle = () => {
        if (chatMode !== 'voice' || !isSessionActive) return {};
        // Subtle dynamic background shift based on volume
        const baseColor = [15, 23, 42]; // slate-900
        const activeColor = [20, 83, 45]; // green-900 (subtle)
        
        const intensity = Math.min(volumeLevel / 100, 1);
        
        const r = Math.round(baseColor[0] + (activeColor[0] - baseColor[0]) * intensity);
        const g = Math.round(baseColor[1] + (activeColor[1] - baseColor[1]) * intensity);
        const b = Math.round(baseColor[2] + (activeColor[2] - baseColor[2]) * intensity);

        return {
            backgroundColor: `rgb(${r}, ${g}, ${b})`,
            transition: 'background-color 0.1s ease-out'
        };
    };

    const systemInstruction = `
    ROLE: You are 'Rahnavard' (رهنورد), a warm, curious, and knowledgeable fellow traveler (همسفر) on the journey of meaning. 
    
    **STYLE GUIDE (CRITICAL):**
    1.  **Multi-Colored Formatting:** Use **Bold** for key phrases (renders Amber). Use > Blockquotes for deep insights (renders Purple). Use Lists for steps. 
    2.  **Tone:** Friendly, informal (Mahavare), and deep.
    3.  **Structure:** Keep paragraphs short.
    
    **SUGGESTION PROTOCOL:**
    At the very end of EVERY response, you MUST provide 2-3 short, relevant options for the user to reply with.
    Format: [OPTIONS: Option 1 | Option 2 | Option 3]
    `;

    useEffect(() => {
        const newAccessInfo = getAccessInfo();
        setAccessInfo(newAccessInfo);
        if (sessionState === 'idle') { setTimeLeft(newAccessInfo.timeLeft); }
    }, [user, getAccessInfo, sessionState]);

    useEffect(() => {
        if (!isUserScrolledUp.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [transcriptHistory, currentUserTranscript, currentAiTranscript, textMessages, suggestions]);

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

                            // Update status to Speaking (AI is talking)
                            setConnectionStatus('speaking');
                            
                            // But... if AI is speaking, we want the orb to ripple (State: Speaking)
                            // If user is speaking, we want the orb to bounce (State: Listening)
                            // If AI is processing, we want the orb to spin (State: Thinking)

                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContext.currentTime);
                            try {
                                const audioBuffer = await decodeAudioData(decode(base64Audio), outputContext, 24000, 1);
                                if ((outputContext.state as string) === 'closed') return;
                                const source = outputContext.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(outputContext.destination);
                                source.addEventListener('ended', () => {
                                    audioSourcesRef.current.delete(source);
                                    if(audioSourcesRef.current.size === 0) {
                                         setConnectionStatus('connected'); // Idle/Connected
                                    }
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
                            setConnectionStatus('listening'); // User is speaking
                            currentUserTranscriptRef.current += message.serverContent.inputTranscription.text;
                            setCurrentUserTranscript(currentUserTranscriptRef.current);
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentAiTranscriptRef.current += message.serverContent.outputTranscription.text;
                            setCurrentAiTranscript(currentAiTranscriptRef.current);
                        }
                        if(message.serverContent?.turnComplete) {
                            // If turn complete, usually AI is about to think or has finished listening
                            // We set to 'thinking' momentarily or handle via audio buffering
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
            let cleanText = response.text || '';
            
            const optionsMatch = cleanText.match(/\[OPTIONS:(.*?)\]/);
            if (optionsMatch) {
                const opts = optionsMatch[1].split('|').map(s => s.trim());
                setSuggestions(opts);
                cleanText = cleanText.replace(/\[OPTIONS:.*?\]/, '').trim();
            } else {
                 setSuggestions(["شروع کنیم!", "چطور می‌تونی کمکم کنی؟", "یک سوال از من بپرس"]);
            }
            
            setTextMessages([{ role: 'model', text: cleanText }]);
            setSessionState('active');
            sessionStartTimeRef.current = Date.now();
        } catch (e) {
            console.error(e);
            setError(getFallbackMessage('chat'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendTextMessage = async (text?: string) => {
        const msgToSend = text || textInput;
        if (!msgToSend.trim() || isTextLoading || !textChatRef.current) return;
        
        const userMessage: ChatMessage = { role: 'user', text: msgToSend.trim() };
        setTextMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
        setTextInput('');
        setSuggestions([]); // Clear suggestions while loading
        setIsTextLoading(true);

        try {
            const stream = await textChatRef.current.sendMessageStream({ message: userMessage.text });
            let modelResponse = '';
            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setTextMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'model', text: modelResponse.replace(/\[OPTIONS:.*?\]/, '') };
                    return newMessages;
                });
            }
            
            const optionsMatch = modelResponse.match(/\[OPTIONS:(.*?)\]/);
            if (optionsMatch) {
                const opts = optionsMatch[1].split('|').map(s => s.trim());
                setSuggestions(opts);
            } else {
                setSuggestions([]);
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

    if (!user) return null;

    // --- Render ---
    if (isLoading) {
        return (
            <div className="flex flex-col h-screen bg-[#0f172a] items-center justify-center text-white">
                <SparklesIcon className="w-16 h-16 text-yellow-300 animate-pulse mb-4" />
                <p className="text-xl font-bold animate-pulse">{loadingMessage}</p>
            </div>
        );
    }

    if (chatMode === 'choice') {
        return (
            <div className="flex flex-col h-screen bg-[#0f172a] items-center justify-center text-white p-6">
                <h2 className="text-3xl font-bold mb-8">انتخاب شیوه گفتگو</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
                    <button onClick={startVoiceSession} className="p-10 bg-[#1e293b] hover:bg-[#334155] rounded-3xl border border-gray-700 hover:border-green-500 transition-all flex flex-col items-center gap-6 shadow-xl hover:shadow-2xl group">
                        <div className="bg-green-600 p-6 rounded-full group-hover:scale-110 transition-transform shadow-lg">
                            <MicrophoneIcon className="w-12 h-12 text-white" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold">گفتگوی زنده (صوتی)</h3>
                            <p className="text-gray-400 mt-2">مکالمه طبیعی، بدون نیاز به تایپ</p>
                        </div>
                    </button>
                    <button onClick={startTextSession} className="p-10 bg-[#1e293b] hover:bg-[#334155] rounded-3xl border border-gray-700 hover:border-blue-500 transition-all flex flex-col items-center gap-6 shadow-xl hover:shadow-2xl group">
                        <div className="bg-blue-600 p-6 rounded-full group-hover:scale-110 transition-transform shadow-lg">
                            <ChatBubbleOvalLeftEllipsisIcon className="w-12 h-12 text-white" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold">گفتگوی متنی</h3>
                            <p className="text-gray-400 mt-2">چت هوشمند با قابلیت‌های پیشرفته</p>
                        </div>
                    </button>
                </div>
                <button onClick={() => dispatch({ type: 'SET_VIEW', payload: View.UserProfile })} className="mt-12 text-gray-500 hover:text-white flex items-center gap-2">
                    <ArrowLeftIcon className="w-4 h-4"/> بازگشت
                </button>
            </div>
        );
    }

    if (timeLeft <= 0 && !isSessionActive) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                <ClockIcon className="w-24 h-24 text-yellow-400 mb-6" />
                <h1 className="text-3xl font-bold mb-4 text-white">زمان شما به پایان رسید</h1>
                <p className="max-w-md text-gray-300 leading-relaxed">گفتگوی شما ذخیره شد. امیدواریم این جلسه برایتان مفید بوده باشد.</p>
                <button onClick={() => dispatch({ type: 'SET_VIEW', payload: View.UserProfile })} className="mt-8 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full">
                    بازگشت به پروفایل
                </button>
            </div>
        );
    }
    
    // --- Voice Mode UI (Immersive Liquid Soul) ---
    if (chatMode === 'voice') {
        // Determine orb state based on connection status
        // 'listening' = user speaking -> orb expands/reacts to volume
        // 'speaking' = AI speaking -> orb ripples
        // 'connected' = idle -> orb breathes
        // 'connecting' = loading
        
        let orbState: 'idle' | 'listening' | 'thinking' | 'speaking' = 'idle';
        if (connectionStatus === 'listening') orbState = 'listening';
        else if (connectionStatus === 'speaking') orbState = 'speaking';
        else if (connectionStatus === 'connected') orbState = 'idle'; // or thinking if waiting for response?
        
        // If we want a "thinking" state, we can try to infer it. 
        // Usually after 'listening' stops (turnComplete), AI thinks before 'speaking'.
        // We can set a transient state, but for simplicity, let's map:
        // connected -> idle
        
        return (
            <div className="flex flex-col h-screen bg-[#0f172a] text-white overflow-hidden relative font-sans transition-colors duration-1000" style={getBackgroundStyle()}>
                {/* Background Ambient */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>

                {/* Header */}
                <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
                    <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        <BrainCircuitIcon className="w-5 h-5 text-green-400" />
                        <span className="text-sm font-bold">همراه معنا</span>
                        {timeLeft > 0 && (
                            <span className={`text-xs font-mono ml-2 ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-gray-400'}`}>
                                {formatTime(timeLeft)}
                            </span>
                        )}
                    </div>
                    <button onClick={() => { handleStopSession(); dispatch({ type: 'SET_VIEW', payload: View.UserProfile }); }} className="p-3 bg-black/20 hover:bg-white/10 rounded-full backdrop-blur-md transition-colors">
                        <XMarkIcon className="w-6 h-6 text-white"/>
                    </button>
                </header>

                {/* Main Visualizer Area */}
                <main className="flex-grow flex flex-col items-center justify-center relative z-10">
                    
                    <LiquidOrbVisualizer volume={volumeLevel} state={orbState} />

                    {/* Live Captions (Floating) */}
                    <div className="absolute bottom-32 left-0 right-0 px-6 text-center pointer-events-none">
                        <div className="max-w-2xl mx-auto">
                            {currentUserTranscript && (
                                <p className="text-lg md:text-xl text-white/90 font-medium animate-fade-in-up drop-shadow-md mb-2">
                                    {currentUserTranscript}
                                </p>
                            )}
                            {currentAiTranscript && (
                                <p className="text-lg md:text-xl text-amber-300/90 font-medium animate-fade-in-up drop-shadow-md">
                                    {currentAiTranscript}
                                </p>
                            )}
                        </div>
                    </div>
                </main>

                {/* Footer Controls */}
                <footer className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-center gap-8 z-20 bg-gradient-to-t from-[#0f172a] to-transparent pb-12">
                    <button className="p-4 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all backdrop-blur-md border border-white/5">
                         <PaperClipIcon className="w-6 h-6" />
                    </button>

                    <button 
                        onClick={handleStopSession}
                        className="w-20 h-20 rounded-full bg-red-500/90 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-500/40 transition-transform hover:scale-105 active:scale-95 border-4 border-[#0f172a]"
                    >
                        <StopIcon className="w-8 h-8" />
                    </button>

                    <button 
                        onClick={() => { stopAudioPlayback(); setChatMode('text'); }} 
                        className="p-4 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all backdrop-blur-md border border-white/5"
                    >
                        <PaperAirplaneIcon className="w-6 h-6" />
                    </button>
                </footer>

                <LiveSessionAccessModal
                    isOpen={isAccessModalOpen}
                    onClose={handleStopSession}
                    onExtendWithPoints={handleExtendSession}
                    featureName="همراه معنا"
                />
            </div>
        );
    }

    // --- Text Mode (Retained for completeness, slightly updated style) ---
    return (
        <div className="flex flex-col h-screen bg-[#0f172a] text-white relative font-sans">
             {/* Header */}
             <header className="flex-shrink-0 bg-[#1e293b] border-b border-gray-800 p-4 flex justify-between items-center z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <BrainCircuitIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold">همراه معنا (متنی)</h1>
                        <p className="text-xs text-gray-400">{formatTime(timeLeft)}</p>
                    </div>
                </div>
                <button onClick={() => { handleStopSession(); dispatch({ type: 'SET_VIEW', payload: View.UserProfile }); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><XMarkIcon className="w-6 h-6"/></button>
            </header>

            {/* Chat Area */}
            <main className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0E1621]">
                {textMessages.map((msg, i) => {
                    const isMe = msg.role === 'user';
                    return (
                        <div key={i} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? 'bg-[#3b82f6] text-white rounded-br-sm' : 'bg-[#1e293b] text-gray-200 rounded-bl-sm border border-gray-700'}`}>
                                {!isMe ? <AIContentRenderer content={msg.text} /> : msg.text}
                            </div>
                        </div>
                    );
                })}
                {isTextLoading && (
                     <div className="flex justify-start">
                        <div className="bg-[#1e293b] p-4 rounded-2xl rounded-bl-sm border border-gray-700 flex gap-1">
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Footer */}
            <footer className="p-4 bg-[#1e293b] border-t border-gray-800 z-20">
                {/* Line-by-line Suggestions */}
                {suggestions.length > 0 && !isTextLoading && (
                    <div className="flex flex-col gap-2 mb-3">
                        {suggestions.map((s, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => handleSendTextMessage(s)}
                                className="w-full text-right px-4 py-3 bg-[#2b5278]/20 hover:bg-[#2b5278]/40 border border-[#2b5278]/40 text-blue-200 text-sm rounded-xl transition-all active:scale-[0.99]"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
                
                <div className="flex items-end gap-2 bg-[#0f172a] rounded-2xl border border-gray-700 p-2">
                    <textarea 
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendTextMessage()}
                        placeholder="پیام خود را بنویسید..."
                        className="flex-grow bg-transparent text-white max-h-32 min-h-[44px] py-3 px-2 focus:outline-none resize-none text-sm custom-scrollbar"
                        rows={1}
                        disabled={isTextLoading}
                    />
                    <button 
                        onClick={() => handleSendTextMessage()}
                        disabled={!textInput.trim() || isTextLoading}
                        className={`p-3 rounded-full transition-all ${textInput.trim() ? 'bg-blue-600 text-white hover:scale-105' : 'bg-gray-800 text-gray-500'}`}
                    >
                        <PaperAirplaneIcon className="w-5 h-5 dir-ltr" />
                    </button>
                </div>
            </footer>
            
            <LiveSessionAccessModal
                isOpen={isAccessModalOpen}
                onClose={handleStopSession}
                onExtendWithPoints={handleExtendSession}
                featureName="همراه معنا"
            />
        </div>
    );
};

export default MeaningCompanionView;
