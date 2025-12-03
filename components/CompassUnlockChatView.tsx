import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { User, ChatMessage, View, COMPASS_TRIAL_SECONDS } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAIBlob, Session, Chat } from "@google/genai";
import { PaperAirplaneIcon, ArrowLeftIcon, BrainCircuitIcon, ClockIcon, MicrophoneIcon, ChatBubbleOvalLeftEllipsisIcon, XMarkIcon, StopIcon, SparklesIcon, DoubleCheckIcon, KeyboardIcon } from './icons';
import { getFallbackMessage } from '../services/geminiService';
import LiveSessionAccessModal from './LiveSessionAccessModal';
import AIContentRenderer from './AIContentRenderer';

// --- Audio Helper Functions ---
function encode(bytes: Uint8Array): string { let binary = ''; const len = bytes.byteLength; for (let i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); } return btoa(binary); }
function decode(base64: string): Uint8Array { const binaryString = atob(base64); const len = binaryString.length; const bytes = new Uint8Array(len); for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); } return bytes; }
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> { const dataInt16 = new Int16Array(data.buffer); const frameCount = dataInt16.length / numChannels; const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate); for (let channel = 0; channel < numChannels; channel++) { const channelData = buffer.getChannelData(channel); for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; } } return buffer; }
const formatTime = (seconds: number) => { const minutes = Math.floor(seconds / 60); const remainingSeconds = seconds % 60; return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`; };

// --- Advanced Audio Visualizer ---
const AdvancedAudioVisualizer: React.FC<{ analyser: AnalyserNode | null, isUserSpeaking: boolean }> = ({ analyser, isUserSpeaking }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animationId: number;
        const bufferLength = 64; 
        const dataArray = new Uint8Array(bufferLength);
        const draw = () => {
            animationId = requestAnimationFrame(draw);
            if (analyser) { analyser.getByteFrequencyData(dataArray); } else { for(let i=0; i<bufferLength; i++) dataArray[i] = 0; }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const centerX = canvas.width / 2; const centerY = canvas.height / 2; const radius = 65; 
            const bars = 40; const step = (Math.PI * 2) / bars;
            for (let i = 0; i < bars; i++) {
                const dataIndex = Math.floor((i / bars) * (bufferLength / 2)); 
                const value = analyser ? dataArray[dataIndex] : 0;
                const barHeight = Math.max(4, (value / 255) * 50); 
                const angle = i * step;
                const x1 = centerX + radius * Math.cos(angle);
                const y1 = centerY + radius * Math.sin(angle);
                const x2 = centerX + (radius + barHeight) * Math.cos(angle);
                const y2 = centerY + (radius + barHeight) * Math.sin(angle);
                ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
                ctx.strokeStyle = isUserSpeaking ? '#FACC15' : '#4ADE80'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
            }
        };
        draw();
        return () => cancelAnimationFrame(animationId);
    }, [analyser, isUserSpeaking]);
    return <canvas ref={canvasRef} width={300} height={300} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none" />;
};

const CompassUnlockChatView: React.FC = () => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();

    const [chatMode, setChatMode] = useState<'choice' | 'voice' | 'text'>('choice');
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("در حال برقراری ارتباط...");
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'speaking' | 'listening'>('idle');
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
    const [isTimeUp, setIsTimeUp] = useState(false);
    
    const [history, setHistory] = useState<ChatMessage[]>(user?.meaningCoachHistory || []);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    
    const [currentUserTranscript, setCurrentUserTranscript] = useState('');
    const [currentAiTranscript, setCurrentAiTranscript] = useState('');
    const currentUserTranscriptRef = useRef('');
    const currentAiTranscriptRef = useRef('');
    const [transcriptHistory, setTranscriptHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);

    const [textInput, setTextInput] = useState('');
    const [isTextLoading, setIsTextLoading] = useState(false);
    const textChatRef = useRef<Chat | null>(null);

    const [error, setError] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const voiceContainerRef = useRef<HTMLDivElement>(null);
    const isUserScrolledUp = useRef(false);
    
    // Audio Refs...
    const sessionPromiseRef = useRef<Promise<Session> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const timerRef = useRef<number | null>(null);
    const connectionTimeoutRef = useRef<number | null>(null);
    const sessionStartTimeRef = useRef<number>(0);
    
    const historyRef = useRef(history);
    const isSessionActiveRef = useRef(isSessionActive);
    const [volumeLevel, setVolumeLevel] = useState(0);
    const volumeIntervalRef = useRef<number | null>(null);

    // Access Control
    const getAccessInfo = useCallback(() => {
        if (!user) return { type: 'none' as const, timeLeft: 0 };
        const liveAccess = user.hoshmanaLiveAccess;
        if (liveAccess && new Date(liveAccess.expiresAt) > new Date() && liveAccess.remainingSeconds > 0) {
            return { type: 'weekly' as const, timeLeft: liveAccess.remainingSeconds };
        }
        const usedTrial = user.meaningCompassTrialSecondsUsed || 0;
        const trialTimeLeft = Math.max(0, COMPASS_TRIAL_SECONDS - usedTrial);
        if (trialTimeLeft > 0) {
            return { type: 'trial' as const, timeLeft: trialTimeLeft };
        }
        return { type: 'none' as const, timeLeft: 0 };
    }, [user]);

    const [accessInfo, setAccessInfo] = useState(getAccessInfo());
    const [timeLeft, setTimeLeft] = useState(accessInfo.timeLeft);

    useEffect(() => {
        const newAccess = getAccessInfo();
        if (timeLeft <= 0 && newAccess.timeLeft > 0) {
             setAccessInfo(newAccess);
             setTimeLeft(newAccess.timeLeft);
             setIsAccessModalOpen(false);
             setIsTimeUp(false);
        } else if (!isSessionActive) {
             setAccessInfo(newAccess);
             setTimeLeft(newAccess.timeLeft);
        }
    }, [user, getAccessInfo]);

    useEffect(() => {
        historyRef.current = history;
        isSessionActiveRef.current = isSessionActive;
    }, [history, isSessionActive]);

    useEffect(() => {
        if (!isUserScrolledUp.current && messagesEndRef.current) {
             messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [transcriptHistory, currentUserTranscript, currentAiTranscript, history, suggestions]);

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

    // Audio/Connection Management & Cleanup (keeping original logic structure)
    const stopAudioPlayback = () => { audioSourcesRef.current.forEach(source => { try { source.stop(); } catch(e) {} }); audioSourcesRef.current.clear(); nextStartTimeRef.current = 0; };
    const stopRecording = () => { if (scriptProcessorRef.current && mediaStreamSourceRef.current) { try { mediaStreamSourceRef.current.disconnect(); scriptProcessorRef.current.disconnect(); scriptProcessorRef.current.onaudioprocess = null; } catch (e) { console.error("Error stopping recording:", e); } } streamRef.current?.getTracks().forEach(track => track.stop()); };
    const cleanup = () => { stopAudioPlayback(); stopRecording(); if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') inputAudioContextRef.current.close().catch(console.error); if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') outputAudioContextRef.current.close().catch(console.error); inputAudioContextRef.current = null; outputAudioContextRef.current = null; scriptProcessorRef.current = null; mediaStreamSourceRef.current = null; streamRef.current = null; analyserRef.current = null; if (connectionTimeoutRef.current) { clearTimeout(connectionTimeoutRef.current); connectionTimeoutRef.current = null; } };
    
    const saveProgress = useCallback(() => {
        if (!user || sessionStartTimeRef.current === 0) return;
        const elapsedSeconds = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
        if (elapsedSeconds > 0 || historyRef.current.length > (user.meaningCoachHistory?.length || 0)) {
            let updatedUser: Partial<User> = {};
            if (accessInfo.type === 'weekly' && user.hoshmanaLiveAccess) {
                const newRemaining = Math.max(0, user.hoshmanaLiveAccess.remainingSeconds - elapsedSeconds);
                updatedUser.hoshmanaLiveAccess = { ...user.hoshmanaLiveAccess, remainingSeconds: newRemaining };
            } else {
                 const currentTrialUsed = user.meaningCompassTrialSecondsUsed || 0;
                 updatedUser.meaningCompassTrialSecondsUsed = currentTrialUsed + elapsedSeconds;
            }
             const currentTotal = user.compassChatDuration || 0;
             updatedUser.compassChatDuration = currentTotal + elapsedSeconds;
            updatedUser.meaningCoachHistory = historyRef.current;
            dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        }
        sessionStartTimeRef.current = 0;
    }, [user, dispatch, accessInfo.type]);

    useEffect(() => {
        return () => {
            if (isSessionActiveRef.current) saveProgress();
            sessionPromiseRef.current?.then(s => s.close());
            cleanup();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [saveProgress]);

    const handleStopSession = useCallback((isExpired = false) => {
        sessionPromiseRef.current?.then(s => s.close()).catch(console.error);
        cleanup();
        saveProgress();
        setIsSessionActive(false);
        setConnectionStatus('idle');
        setIsLoading(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (isExpired) { setIsAccessModalOpen(true); }
    }, [saveProgress]);

    useEffect(() => {
        if (isTimeUp && connectionStatus !== 'speaking') {
            handleStopSession(true);
            setIsTimeUp(false);
        }
    }, [isTimeUp, connectionStatus, handleStopSession]);

    // Session Start Logic
    const systemInstruction = `
    ROLE: You are 'Rahnavard' (رهنورد), a professional Meaning Coach at 'Nakhlestan Ma'na'.
    GOAL: Help the user unlock their "Meaning Compass" through deep, reflective conversation.
    LANGUAGE: Persian (Farsi) - **Colloquial & Conversational (Mahavare)**.
    TONE: Warm, Empathetic, Curious, Socratic, and very natural.
    
    OPTIONS:
    At the end of your text responses, provide 2-3 short suggestions for the user in this format: [OPTIONS: Suggestion 1 | Suggestion 2].
    `;

    const startVoiceSession = async () => {
        if (!user || isLoading) return;
        if (timeLeft <= 0) { setIsAccessModalOpen(true); return; }
        setChatMode('voice'); setIsLoading(true); setConnectionStatus('connecting'); setError(''); setLoadingMessage("در حال راه‌اندازی..."); setTranscriptHistory([]); setIsTimeUp(false); isUserScrolledUp.current = false;
        if (!user.hasUnlockedCompass) { dispatch({ type: 'UPDATE_USER', payload: { ...user, hasUnlockedCompass: true } }); }
        
        connectionTimeoutRef.current = window.setTimeout(() => { if (isLoading || connectionStatus === 'connecting') { cleanup(); setIsLoading(false); setIsSessionActive(false); setConnectionStatus('idle'); setError("اتصال برقرار نشد."); } }, 15000);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            await inputAudioContextRef.current.resume(); await outputAudioContextRef.current.resume();
            analyserRef.current = inputAudioContextRef.current.createAnalyser(); analyserRef.current.fftSize = 128; 
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const newSessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: { responseModalities: [Modality.AUDIO], systemInstruction, inputAudioTranscription: {}, outputAudioTranscription: {} },
                callbacks: {
                    onopen: () => {
                        if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
                        if (!inputAudioContextRef.current || !streamRef.current) return;
                        setIsLoading(false); setIsSessionActive(true); setConnectionStatus('connected'); sessionStartTimeRef.current = Date.now();
                        mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                        if (analyserRef.current) mediaStreamSourceRef.current.connect(analyserRef.current);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmBlob: GenAIBlob = { data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)), mimeType: 'audio/pcm;rate=16000' };
                            newSessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
                        };
                        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                             const ctx = outputAudioContextRef.current;
                             setConnectionStatus('speaking');
                             nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                             try {
                                 const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                                 const source = ctx.createBufferSource(); source.buffer = buffer; source.connect(ctx.destination);
                                 source.addEventListener('ended', () => { audioSourcesRef.current.delete(source); if(audioSourcesRef.current.size === 0) { setConnectionStatus('connected'); } });
                                 source.start(nextStartTimeRef.current); nextStartTimeRef.current += buffer.duration; audioSourcesRef.current.add(source);
                             } catch(e) {}
                        }
                        if (message.serverContent?.interrupted) { stopAudioPlayback(); setConnectionStatus('connected'); }
                        if (message.serverContent?.inputTranscription) { setConnectionStatus('listening'); currentUserTranscriptRef.current += message.serverContent.inputTranscription.text; setCurrentUserTranscript(currentUserTranscriptRef.current); }
                        if (message.serverContent?.outputTranscription) { currentAiTranscriptRef.current += message.serverContent.outputTranscription.text; setCurrentAiTranscript(currentAiTranscriptRef.current); }
                        if (message.serverContent?.turnComplete) {
                            setConnectionStatus('connected');
                            if (currentUserTranscriptRef.current.trim() || currentAiTranscriptRef.current.trim()) {
                                const newHistoryEntries: ChatMessage[] = [ { role: 'user', text: currentUserTranscriptRef.current }, { role: 'model', text: currentAiTranscriptRef.current } ];
                                setHistory(prev => [...prev, ...newHistoryEntries]);
                                setTranscriptHistory(prev => [ ...prev, { role: 'user', text: currentUserTranscriptRef.current }, { role: 'ai', text: currentAiTranscriptRef.current } ]);
                            }
                            currentUserTranscriptRef.current = ''; currentAiTranscriptRef.current = ''; setCurrentUserTranscript(''); setCurrentAiTranscript('');
                        }
                    },
                    onerror: (e) => { console.error(e); setError(getFallbackMessage('connection')); handleStopSession(); },
                    onclose: () => { handleStopSession(); },
                },
            });
            sessionPromiseRef.current = newSessionPromise;
        } catch (err) { setError("خطا در دسترسی به میکروفون."); setIsLoading(false); setChatMode('choice'); setConnectionStatus('idle'); cleanup(); }
    };
    
    const startTextSession = async () => {
        if (!user || isLoading) return;
        if (timeLeft <= 0) { setIsAccessModalOpen(true); return; }
        setChatMode('text'); setIsLoading(true); setError(''); setIsTimeUp(false);
        if (!user.hasUnlockedCompass) { dispatch({ type: 'UPDATE_USER', payload: { ...user, hasUnlockedCompass: true } }); }
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            textChatRef.current = ai.chats.create({ model: 'gemini-3-pro-preview', config: { systemInstruction }, history: history });
            if (history.length === 0) {
                 const response = await textChatRef.current.sendMessage({ message: "شروع کن" });
                 const cleanText = (response.text || '').replace(/\[OPTIONS:.*?\]/, '').trim();
                 setHistory([{ role: 'model', text: cleanText }]);
            }
            setIsSessionActive(true); sessionStartTimeRef.current = Date.now();
        } catch (err) { setError(getFallbackMessage('chat')); } finally { setIsLoading(false); }
    };

    const handleSendTextMessage = async (msg: string) => {
        if (!msg.trim() || isTextLoading || !textChatRef.current) return;
        const userMessage: ChatMessage = { role: 'user', text: msg.trim() };
        setHistory(prev => [...prev, userMessage]);
        setSuggestions([]);
        setTextInput('');
        setIsTextLoading(true);
        try {
            const response = await textChatRef.current.sendMessage({ message: userMessage.text });
            let cleanText = response.text || '';
            const optionsMatch = cleanText.match(/\[OPTIONS:(.*?)\]/);
            if (optionsMatch) { setSuggestions(optionsMatch[1].split('|').map(s => s.trim())); cleanText = cleanText.replace(/\[OPTIONS:.*?\]/, '').trim(); } else { setSuggestions([]); }
            const modelMessage: ChatMessage = { role: 'model', text: cleanText };
            setHistory(prev => [...prev, modelMessage]);
        } catch (err) { setError(getFallbackMessage('chat')); } finally { setIsTextLoading(false); }
    };

    // Timer
    useEffect(() => {
        const isActive = isSessionActive || (chatMode === 'text' && !isTextLoading && sessionStartTimeRef.current !== 0);
        if (isActive && timeLeft > 0) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft(prev => {
                    const newTime = prev - 1;
                    if (newTime <= 0) {
                         if (connectionStatus === 'speaking') { setIsTimeUp(true); return 0; } 
                         else { if (timerRef.current) clearInterval(timerRef.current); handleStopSession(true); return 0; }
                    }
                    return newTime;
                });
            }, 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isSessionActive, timeLeft, chatMode, isTextLoading, connectionStatus]);

    const handleExtendSession = () => {
        if (!user || user.manaPoints < 200) return;
        dispatch({ type: 'SPEND_MANA_POINTS', payload: { points: 200, action: 'تمدید جلسه قطب‌نمای معنا' } });
        setTimeLeft(prev => prev + 300); setIsAccessModalOpen(false); setIsTimeUp(false);
        if (chatMode === 'voice' && !isSessionActive) startVoiceSession(); else if (chatMode === 'text' && !isSessionActive) startTextSession(); else setIsSessionActive(true);
        sessionStartTimeRef.current = Date.now();
    };

    if (!user) return null;

    return (
        <div className="flex flex-col h-screen bg-[#0f172a] text-white overflow-hidden relative font-sans items-center justify-center md:p-6">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #2b2b2b; border-radius: 10px; }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
                .animate-fade-in { animation: fade-in 0.5s ease-in-out; }
            `}</style>
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

            <div className="w-full md:max-w-4xl h-full md:h-[90vh] bg-[#1e293b]/80 md:backdrop-blur-xl rounded-none md:rounded-3xl shadow-2xl border-0 md:border border-gray-700/50 flex flex-col overflow-hidden relative">
                {/* Header */}
                <header className="flex-shrink-0 bg-[#1e293b]/90 backdrop-blur-md border-b border-gray-700/50 z-20 shadow-lg">
                    <div className="px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-11 h-11 bg-gradient-to-br from-green-600 to-teal-700 rounded-full flex items-center justify-center border border-gray-600 shadow-inner">
                                    <BrainCircuitIcon className="w-6 h-6 text-white" />
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#1e293b] rounded-full animate-pulse"></span>
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-white">قطب‌نمای معنا</h1>
                                <p className="text-xs text-green-300 opacity-90">گفتگو برای کشف</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {(isSessionActive || timeLeft > 0) && (
                                <div className={`px-3 py-1 rounded-full bg-[#0E1621] border border-gray-700 flex items-center gap-2 font-mono font-bold text-sm ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-blue-300'}`}>
                                    <ClockIcon className="w-4 h-4" /><span>{formatTime(timeLeft)}</span>
                                </div>
                            )}
                            <button onClick={() => { handleStopSession(); dispatch({ type: 'SET_VIEW', payload: View.UserProfile }); }} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                                <ArrowLeftIcon className="w-6 h-6"/>
                            </button>
                        </div>
                    </div>
                </header>

                {chatMode === 'choice' && (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-6 z-10">
                        <h2 className="text-2xl font-bold mb-8 text-white">چطور می‌خواهید شروع کنید؟</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md">
                            <button onClick={startVoiceSession} className="p-8 bg-[#242F3D] hover:bg-[#2b5278] rounded-2xl transition-all flex flex-col items-center gap-4 group border border-gray-700 hover:border-green-500">
                                <div className="bg-[#2b5278] p-4 rounded-full group-hover:scale-110 transition-transform"><MicrophoneIcon className="w-8 h-8 text-white" /></div>
                                <span className="text-lg font-semibold text-white">گفتگو با صدا</span>
                            </button>
                            <button onClick={startTextSession} className="p-8 bg-[#242F3D] hover:bg-[#2b5278] rounded-2xl transition-all flex flex-col items-center gap-4 group border border-gray-700 hover:border-blue-500">
                                <div className="bg-[#2b5278] p-4 rounded-full group-hover:scale-110 transition-transform"><ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8 text-white" /></div>
                                <span className="text-lg font-semibold text-white">گفتگو با پیام</span>
                            </button>
                        </div>
                    </div>
                )}

                {chatMode === 'text' && (
                    <>
                         <main className="flex-grow overflow-y-auto p-2 md:p-4 custom-scrollbar z-10">
                             <div className="space-y-3 pb-4">
                                {history.map((msg, i) => {
                                    const isUser = msg.role === 'user';
                                    return (
                                        <div key={i} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} group`}>
                                             <div 
                                                 className={`relative max-w-[85%] md:max-w-[75%] p-3 md:p-4 rounded-2xl shadow-sm text-sm 
                                                 ${isUser 
                                                     ? 'bg-[#3b82f6] text-white rounded-br-sm' 
                                                     : 'bg-[#1e293b] text-gray-100 rounded-bl-sm border border-gray-700/50'
                                                 }`}
                                             >
                                                 <AIContentRenderer content={msg.text} />
                                                 <div className={`flex items-center justify-end gap-1 mt-1 select-none ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                                                     <span className="text-[10px] opacity-70">{new Date().toLocaleTimeString('fa-IR', {hour:'2-digit', minute:'2-digit'})}</span>
                                                 </div>
                                             </div>
                                        </div>
                                    );
                                })}
                                {isTextLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-[#1e293b] border border-gray-700/50 p-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} style={{height: 1}} />
                             </div>
                         </main>
                         <footer className="flex-shrink-0 p-2 md:p-4 bg-[#1e293b] border-t border-gray-700/50 z-20">
                            <div className="">
                                {suggestions.length > 0 && !isTextLoading && (
                                    <div className="flex flex-col gap-2 px-1 mb-3 animate-fade-in">
                                        {suggestions.map((s, idx) => (
                                            <button key={idx} onClick={() => handleSendTextMessage(s)} className="w-full text-right px-4 py-3 bg-green-900/30 hover:bg-green-900/50 border border-green-500/30 text-green-200 text-sm rounded-xl transition-all">{s}</button>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-end gap-2 bg-[#0f172a] rounded-2xl border border-gray-700 p-2 focus-within:border-green-500/50 transition-colors shadow-inner">
                                    <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendTextMessage(textInput)} placeholder="پیام خود را بنویسید..." rows={1} className="flex-grow bg-transparent text-white max-h-32 min-h-[44px] py-3 px-2 focus:outline-none resize-none text-sm custom-scrollbar placeholder-gray-500" disabled={isTextLoading}/>
                                    <button onClick={() => handleSendTextMessage(textInput)} disabled={!textInput.trim() || isTextLoading} className={`p-2.5 rounded-full transition-all shadow-lg mb-0.5 ${textInput.trim() ? 'bg-green-600 hover:bg-green-500 text-white hover:scale-105' : 'text-gray-500 hover:bg-white/5'}`}>
                                        <PaperAirplaneIcon className="w-5 h-5 dir-ltr" />
                                    </button>
                                </div>
                            </div>
                        </footer>
                    </>
                )}

                {chatMode === 'voice' && (
                    <div className="flex flex-col h-full relative">
                         <div ref={voiceContainerRef} className="flex-grow flex flex-col items-center justify-center relative z-10 space-y-8 overflow-y-auto pb-20 p-4">
                             <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center flex-shrink-0 mt-4">
                                 <AdvancedAudioVisualizer analyser={analyserRef.current} isUserSpeaking={connectionStatus === 'listening'} />
                                 <div className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full flex items-center justify-center transition-all duration-500 relative z-10 ${connectionStatus === 'speaking' ? 'bg-green-900/30 border-4 border-green-500 shadow-[0_0_40px_rgba(74,222,128,0.4)] animate-pulse' : 'bg-[#2b5278] border-4 border-gray-600'}`}>
                                    <MicrophoneIcon className={`w-16 h-16 sm:w-20 sm:h-20 transition-colors ${connectionStatus === 'speaking' ? 'text-green-400' : 'text-white'}`} />
                                </div>
                            </div>
                            <div className="max-w-lg w-full px-6 text-center overflow-hidden min-h-[100px]">
                                {currentAiTranscript ? <p className="text-lg text-white leading-relaxed animate-fade-in-up mb-4">{currentAiTranscript}</p> : transcriptHistory.length > 0 && <p className="text-lg text-stone-300 leading-relaxed opacity-80 animate-fade-in mb-4">"{transcriptHistory[transcriptHistory.length-1].role === 'ai' ? transcriptHistory[transcriptHistory.length-1].text : '...'}"</p>}
                            </div>
                         </div>
                         <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none z-20">
                             <div className="pointer-events-auto">
                                <button onClick={() => handleStopSession()} className="bg-red-600/80 hover:bg-red-600 text-white p-4 rounded-full transition-all hover:scale-105 shadow-lg"><StopIcon className="w-8 h-8" /></button>
                            </div>
                        </div>
                    </div>
                )}
                
                {error && <div className="absolute top-4 left-4 right-4 z-50 bg-red-900/90 text-white px-4 py-3 rounded-lg text-center shadow-lg border border-red-700 animate-fade-in"><p>{error}</p><button onClick={() => setError('')} className="text-xs text-red-200 hover:text-white mt-1 underline">بستن</button></div>}
                
                <LiveSessionAccessModal isOpen={isAccessModalOpen} onClose={() => handleStopSession()} onExtendWithPoints={handleExtendSession} featureName="قطب‌نمای معنا" />
            </div>
        </div>
    );
};

export default CompassUnlockChatView;