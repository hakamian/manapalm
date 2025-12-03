
import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenAI, Modality } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
    ArrowUpTrayIcon, SparklesIcon, DocumentTextIcon, BookOpenIcon, 
    ArrowDownTrayIcon, PhotoIcon, TrashIcon, GlobeIcon, PlusIcon,
    ChatBubbleBottomCenterTextIcon, SpeakerWaveIcon, StopIcon, PlayIcon,
    ArrowLeftIcon, CogIcon, CheckCircleIcon, BanknotesIcon
} from '../icons';
import { useAppDispatch, useAppState } from '../../AppContext';
import HighTechLoader from '../HighTechLoader';
import AIContentRenderer from '../AIContentRenderer';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const LANGUAGES = [
    { id: 'Persian', label: 'فارسی' },
    { id: 'English', label: 'English' },
];

const PODCAST_TONES = [
    { id: 'deep_dive', label: 'میزگرد تخصصی (Deep Dive)' },
    { id: 'summary', label: 'خلاصه خبری (News Brief)' },
    { id: 'storytelling', label: 'داستان‌گویی (Storytelling)' },
    { id: 'simple', label: 'آموزشی ساده (برای مبتدیان)' },
];

const LARGE_FILE_PAGE_LIMIT = 50;
const LARGE_FILE_COST = 500;

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
};

// Audio Helpers
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

// Convert PCM to WAV for download
function pcmToWav(pcmData: Uint8Array, sampleRate: number = 24000, numChannels: number = 1): Blob {
    const buffer = new ArrayBuffer(44 + pcmData.length);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length, true);
    writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate
    view.setUint16(32, numChannels * 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample

    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, pcmData.length, true);

    // Write PCM samples
    const pcmBytes = new Uint8Array(buffer, 44);
    pcmBytes.set(pcmData);

    return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

const KnowledgeRefinerTool: React.FC = () => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    const [mode, setMode] = useState<'upload' | 'chat'>('upload');
    const [files, setFiles] = useState<File[]>([]);
    const [extractedContext, setExtractedContext] = useState<string>('');
    
    // Chat State
    const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
    const [query, setQuery] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Audio Settings
    const [targetLanguage, setTargetLanguage] = useState('Persian');
    const [podcastTone, setPodcastTone] = useState('deep_dive');

    // Audio State
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [audioDownloadUrl, setAudioDownloadUrl] = useState<string | null>(null);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    // Processing State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const validFiles = newFiles.filter((f: any) => f.type === 'application/pdf' || f.type.startsWith('text/'));
            
            if (validFiles.length !== newFiles.length) {
                setError('فقط فایل‌های PDF و متنی مجاز هستند.');
            } else {
                setError(null);
            }
            setFiles(prev => [...prev, ...validFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const extractTextFromPDF = async (file: File): Promise<string> => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            const maxPages = Math.min(pdf.numPages, 300); // Limit increased for Pro models

            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = (textContent.items as any[]).map((item: any) => item.str || '').join(' ');
                fullText += `[Page ${i}] ${pageText}\n\n`;
            }
            return fullText;
        } catch (err: any) {
            console.error("PDF Error:", err);
            throw new Error(`خطا در خواندن فایل ${file.name}`);
        }
    };

    const handleProcessFiles = async () => {
        if (files.length === 0) {
            setError('لطفاً حداقل یک فایل آپلود کنید.');
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            // Check for large files (Premium Gate)
            let requiresPremium = false;
            let premiumReason = "";

            for (const file of files) {
                if (file.type === 'application/pdf') {
                     const arrayBuffer = await file.arrayBuffer();
                     const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                     if (pdf.numPages > LARGE_FILE_PAGE_LIMIT) {
                         requiresPremium = true;
                         premiumReason = `فایل "${file.name}" دارای ${pdf.numPages} صفحه است (بیشتر از ${LARGE_FILE_PAGE_LIMIT} صفحه).`;
                         break;
                     }
                }
            }

            if (requiresPremium) {
                if (!user) {
                     setError("برای پردازش فایل‌های حجیم لطفاً وارد حساب کاربری شوید.");
                     setIsLoading(false);
                     return;
                 }
                 if (user.manaPoints < LARGE_FILE_COST) {
                     setError(`${premiumReason} \nجهت پردازش عمیق اسناد حجیم، به ${LARGE_FILE_COST} امتیاز معنا نیاز دارید.`);
                     setIsLoading(false);
                     return;
                 }
                 
                 // Deduct Points confirmation
                 if (window.confirm(`${premiumReason}\nآیا مایلید ${LARGE_FILE_COST} امتیاز برای پردازش این پایگاه دانش کسر شود؟`)) {
                      dispatch({ type: 'SPEND_MANA_POINTS', payload: { points: LARGE_FILE_COST, action: 'پالایش دانش (اسناد حجیم)' } });
                 } else {
                      setIsLoading(false);
                      return;
                 }
            }

            let combinedText = "";
            
            for (const file of files) {
                if (file.type === 'application/pdf') {
                    const text = await extractTextFromPDF(file);
                    combinedText += `\n--- DOCUMENT: ${file.name} ---\n${text}\n`;
                } else {
                    // Handle text files
                    const text = await file.text();
                    combinedText += `\n--- DOCUMENT: ${file.name} ---\n${text}\n`;
                }
            }
            
            setExtractedContext(combinedText);
            setMode('chat');
            
            const advancedSystemPrompt = `
# Role: Cognitive Architecture & Summarization Orchestrator (Gemini 3 Edition)

**Objective:** Generate a comprehensive, "Level 10 Depth" analysis and summarization of the provided document. You are not just a summarizer; you are a Knowledge Distillation Engine.

**Context Awareness Protocol:**
You are running on a high-capacity model. DO NOT fragment the text into tiny chunks unless physically forced by input limits. Instead, analyze the document as a semantic whole to capture long-range narrative arcs and complex argument structures.

**The Multi-Pass Workflow (Chain of Thought):**
Execute the following steps in sequence.

**Phase 1: The Structural Scan (The Architect)**
1.  Analyze the document's macro-structure (TOC, Chapters, Arguments).
2.  Identify the Author’s Core Thesis and the "Golden Thread" connecting all chapters.

**Phase 2: Deep Extraction (The Analyst)**
*For each major section/chapter, extract:*
1.  **Core Arguments:** The main points being made.
2.  **Evidence/Data:** Specific facts used to support arguments.
3.  **Mental Models:** Frameworks or methodologies introduced.
4.  **Key Terminology:** Definitions of specific jargon.

**Phase 3: Synthesis & Critique (The Judge)**
1.  Connect dots between early and late chapters (Cross-Reference).
2.  Critique the content: Where are the gaps? What is the bias?
3.  **Anti-Hallucination Protocol:** Every major claim in your summary must be implicitly citeable to the text. If the text is ambiguous, state "The text is unclear regarding..."

**Phase 4: Final Output Generation**
Present the final report in the following strict Markdown format (Translate ALL headers and content to fluent Persian/Farsi):

# [عنوان سند/کتاب] - تحلیل عمیق

## ۱. نقشه راه اجرایی (Executive Blueprint)
*   **قلاب اصلی (The One-Line Hook):** این متن درباره چیست؟
*   **تئوری مرکزی (The Core Thesis):** (۲-۳ پاراگراف ترکیب کل اثر).
*   **مخاطب هدف (Target Audience):** چه کسی بیشترین سود را می‌برد؟

## ۲. کتابخانه اصول و مدل‌های ذهنی (Principle Library)
*   *لیستی از ۵ تا ۱۰ قانون یا چارچوب تغییرناپذیر متن.*
*   *فرمت:* **[نام مفهوم]**: تعریف + کاربرد عملی.

## ۳. تحلیل عمیق فصل به فصل (Deep Dive)
*   *فصول را ترکیب کنید، فقط لیست نکنید. گروه‌بندی کنید.*
*   *بر "بینش‌ها" (Insights) تمرکز کنید نه "اطلاعات" (Information).*

## ۴. نقد و بررسی انتقادی (Critical Review & Gap Analysis)
*   نویسنده چه چیزی را جا انداخته است؟
*   کجای منطق ضعیف است؟
*   محدودیت‌های عملی چیست؟

## ۵. چارچوب‌های عملیاتی (Actionable Frameworks)
*   متن را به یک راهنمای قدم‌به‌قدم تبدیل کنید تا خواننده بتواند دانش را فوراً به کار گیرد.

---
**Constraint:** Maintain a professional, analytical, and objective tone.
            `;

            // Initial deep analysis from AI using the new robust prompt
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: [{ 
                    role: 'user', 
                    parts: [{ 
                        text: `${advancedSystemPrompt}\n\n**Input Text:**\n${combinedText.substring(0, 800000)}` 
                    }] 
                }],
            });
            
            setChatHistory([{ role: 'model', text: response.text || 'تحلیل عمیق انجام شد. آماده پاسخگویی به سوالات شما درباره این اسناد هستم.' }]);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "خطایی رخ داد.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!query.trim() || isChatLoading) return;
        
        const userMsg = query;
        setQuery('');
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsChatLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `
            You are an expert research assistant (like NotebookLM) for "Nakhlestan Ma'na".
            Your knowledge is STRICTLY limited to the provided context (User Documents).
            
            Context:
            ${extractedContext.substring(0, 800000)}
            
            Instructions:
            1. Answer the user's question based ONLY on the Context.
            2. If the answer is not in the context, say "در این اسناد اطلاعاتی در این مورد یافت نشد".
            3. Cite sources if possible (e.g., [Page 2]).
            4. Speak in fluent, professional Persian.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: [
                    ...chatHistory.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })),
                    { role: 'user', parts: [{ text: userMsg }] }
                ],
                config: { systemInstruction }
            });

            setChatHistory(prev => [...prev, { role: 'model', text: response.text || '...' }]);

        } catch (e) {
            setChatHistory(prev => [...prev, { role: 'model', text: 'خطا در ارتباط با هوش مصنوعی.' }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleAudioOverview = async () => {
        if (isPlayingAudio) {
            audioSourceRef.current?.stop();
            setIsPlayingAudio(false);
            return;
        }

        setIsGeneratingAudio(true);
        setAudioDownloadUrl(null); // Reset previous download
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // 1. Generate Script (NotebookLM style dialogue)
            const selectedToneLabel = PODCAST_TONES.find(t => t.id === podcastTone)?.label;
            
            const scriptPrompt = `
            Generate a Podcast Script based on the provided documents.
            Target Language: ${targetLanguage}
            Style/Tone: ${selectedToneLabel}
            
            Format: A dialogue between a Host (Kore) and an Expert (Puck).
            
            Content Source:
            ${extractedContext.substring(0, 50000)}
            
            Goal: Explain the key concepts clearly based on the selected tone.
            Output: Just the text of the dialogue, no speaker labels like "Host:". Just pure flow for TTS.
            Limit: 200-300 words.
            `;
            
            const scriptResp = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: [{ role: 'user', parts: [{ text: scriptPrompt }] }]
            });
            const script = scriptResp.text || '';

            // 2. Convert to Speech
            const ttsResp = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: [{ role: 'user', parts: [{ text: script }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
                }
            });

            const base64Audio = ttsResp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) throw new Error("No audio generated");

            // Prepare for Playback
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }

            const bytes = decode(base64Audio);
            const buffer = await decodeAudioData(bytes, audioContextRef.current, 24000, 1);
            
            // Prepare for Download (Convert PCM to WAV)
            const wavBlob = pcmToWav(bytes, 24000, 1);
            const downloadUrl = URL.createObjectURL(wavBlob);
            setAudioDownloadUrl(downloadUrl);

            // Play
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => setIsPlayingAudio(false);
            source.start(0);
            audioSourceRef.current = source;
            setIsPlayingAudio(true);

        } catch (e) {
            console.error(e);
            setError("خطا در تولید پادکست.");
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    const getFormattedChat = () => {
        return chatHistory.map(msg => `[${msg.role === 'user' ? 'کاربر' : 'هوش مصنوعی'}]:\n${msg.text}`).join('\n\n---\n\n');
    };

    const handleCopyChat = () => {
        const text = getFormattedChat();
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleDownloadChatTxt = () => {
        const text = getFormattedChat();
        if (!text) return;
        const element = document.createElement("a");
        const file = new Blob([text], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `research-session-${Date.now()}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleDownloadChatPdf = () => {
        const text = getFormattedChat();
        if (!text) return;
        const printWindow = window.open('', '', 'height=600,width=800');
        if (!printWindow) return;

        const printContent = `
            <html>
            <head>
                <title>گزارش جلسه پژوهشی</title>
                <style>
                    body { font-family: 'Tahoma', sans-serif; direction: rtl; padding: 40px; line-height: 1.8; color: #333; }
                    h1 { color: #000; text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 20px; }
                    .message { margin-bottom: 20px; padding: 15px; border-radius: 8px; }
                    .user { background-color: #f0f9ff; border-right: 4px solid #0284c7; }
                    .ai { background-color: #f8fafc; border-right: 4px solid #475569; }
                    .role { font-weight: bold; margin-bottom: 5px; display: block; color: #555; }
                    pre { white-space: pre-wrap; font-family: inherit; }
                </style>
            </head>
            <body>
                <h1>گزارش جلسه پژوهشی (NotebookLM)</h1>
                ${chatHistory.map(msg => `
                    <div class="message ${msg.role === 'user' ? 'user' : 'ai'}">
                        <span class="role">${msg.role === 'user' ? 'کاربر' : 'هوش مصنوعی'}</span>
                        <div>${msg.text.replace(/\n/g, '<br>')}</div>
                    </div>
                `).join('')}
                <div style="margin-top: 50px; text-align: center; color: #888; font-size: 12px;">
                    تولید شده توسط استودیو هوشمانا
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    return (
        <div className="w-full h-full bg-stone-900 text-white rounded-2xl shadow-lg flex flex-col border border-stone-700 overflow-hidden relative">
            
            <HighTechLoader 
                isVisible={isLoading}
                messages={[
                    "در حال خواندن اسناد شما...",
                    "استخراج بردارها (Vector Embeddings)...",
                    "ساخت پایگاه دانش اختصاصی...",
                    "اجرای معماری شناختی برای تحلیل عمیق...",
                    "تدوین نقشه راه اجرایی و نقد محتوا..."
                ]}
            />

            {/* Header */}
            <div className="p-4 border-b border-stone-700 bg-stone-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <BookOpenIcon className="w-6 h-6 text-amber-400" />
                    <div>
                        <h3 className="font-bold text-lg">مغز پژوهشگر (NotebookLM)</h3>
                        <p className="text-xs text-stone-400">گفتگو با اسناد و تولید پادکست</p>
                    </div>
                </div>
                {mode === 'chat' && (
                     <button 
                        onClick={() => { setMode('upload'); setChatHistory([]); setIsPlayingAudio(false); audioSourceRef.current?.stop(); setAudioDownloadUrl(null); }}
                        className="text-xs text-stone-400 hover:text-white flex items-center gap-1"
                     >
                         <ArrowLeftIcon className="w-4 h-4" /> منابع جدید
                     </button>
                )}
            </div>

            {/* Mode: Upload */}
            {mode === 'upload' && (
                <div className="flex-1 p-8 flex flex-col items-center justify-center">
                     <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center w-full max-w-lg h-64 border-2 border-stone-600 border-dashed rounded-2xl cursor-pointer bg-stone-800/50 hover:bg-stone-800 hover:border-amber-500 transition-all group mb-6"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ArrowUpTrayIcon className="w-16 h-16 text-stone-500 mb-4 group-hover:text-amber-400 transition-colors" />
                            <p className="mb-2 text-lg text-stone-300 font-bold">آپلود اسناد (PDF, TXT)</p>
                            <p className="text-xs text-stone-500">جزوات، مقالات، کتاب‌ها (حداکثر ۳۰۰ صفحه)</p>
                            <p className="text-[10px] text-stone-500 mt-2">بیش از ۵۰ صفحه نیازمند امتیاز ویژه</p>
                        </div>
                        <input 
                            type="file" 
                            className="hidden" 
                            multiple 
                            accept=".pdf,text/plain" 
                            ref={fileInputRef}
                            onChange={handleFileChange} 
                        />
                    </div>

                    {files.length > 0 && (
                        <div className="w-full max-w-lg space-y-2 mb-6">
                             {files.map((f, i) => (
                                 <div key={i} className="flex justify-between items-center bg-stone-800 p-3 rounded-lg border border-stone-700">
                                     <span className="text-sm text-stone-300 flex items-center gap-2">
                                         <DocumentTextIcon className="w-4 h-4 text-amber-500"/> {f.name}
                                     </span>
                                     <button onClick={() => removeFile(i)} className="text-stone-500 hover:text-red-400"><TrashIcon className="w-4 h-4"/></button>
                                 </div>
                             ))}
                        </div>
                    )}
                    
                    {error && <p className="text-red-400 mb-4 whitespace-pre-line text-center">{error}</p>}

                    <button 
                        onClick={handleProcessFiles}
                        disabled={files.length === 0}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-12 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <SparklesIcon className="w-5 h-5"/>
                        ساخت پایگاه دانش
                    </button>
                </div>
            )}

            {/* Mode: Chat / Research */}
            {mode === 'chat' && (
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Left: Audio Overview & Info */}
                    <div className="w-full lg:w-1/3 bg-stone-800/50 border-l border-stone-700 p-6 flex flex-col overflow-y-auto custom-scrollbar">
                         <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                             <GlobeIcon className="w-5 h-5 text-blue-400"/> منابع فعال
                         </h4>
                         <div className="space-y-2 mb-8">
                             {files.map((f, i) => (
                                 <div key={i} className="text-xs text-stone-400 bg-stone-900/50 p-2 rounded border border-stone-700/50 truncate">
                                     {f.name}
                                 </div>
                             ))}
                         </div>

                         <div className="mt-auto bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-5 rounded-2xl border border-indigo-500/30">
                             <div className="text-center mb-4">
                                 <SpeakerWaveIcon className="w-10 h-10 text-indigo-300 mx-auto mb-2" />
                                 <h4 className="font-bold text-white">مرور صوتی (Podcast)</h4>
                             </div>
                             
                             <div className="space-y-3 mb-4">
                                 <div>
                                     <label className="text-xs text-stone-400 block mb-1">زبان خروجی</label>
                                     <select 
                                         value={targetLanguage} 
                                         onChange={(e) => setTargetLanguage(e.target.value)}
                                         className="w-full bg-stone-900 border border-stone-600 text-xs rounded p-1.5 text-white outline-none focus:border-indigo-500"
                                     >
                                         {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                                     </select>
                                 </div>
                                 <div>
                                     <label className="text-xs text-stone-400 block mb-1">لحن و سبک</label>
                                     <select 
                                         value={podcastTone} 
                                         onChange={(e) => setPodcastTone(e.target.value)}
                                         className="w-full bg-stone-900 border border-stone-600 text-xs rounded p-1.5 text-white outline-none focus:border-indigo-500"
                                     >
                                         {PODCAST_TONES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                     </select>
                                 </div>
                             </div>
                             
                             <div className="flex gap-2">
                                 <button 
                                    onClick={handleAudioOverview}
                                    disabled={isGeneratingAudio}
                                    className={`flex-grow py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 transition-all ${isPlayingAudio ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-white text-indigo-900 hover:bg-indigo-50'}`}
                                 >
                                     {isGeneratingAudio ? (
                                         <span className="animate-pulse">در حال تولید...</span>
                                     ) : isPlayingAudio ? (
                                         <><StopIcon className="w-4 h-4"/> توقف</>
                                     ) : (
                                         <><PlayIcon className="w-4 h-4"/> پخش</>
                                     )}
                                 </button>
                                 
                                 {audioDownloadUrl && (
                                     <a 
                                        href={audioDownloadUrl}
                                        download="notebooklm-podcast.wav"
                                        className="p-2 bg-stone-700 hover:bg-stone-600 text-white rounded-lg flex items-center justify-center"
                                        title="دانلود فایل صوتی"
                                     >
                                         <ArrowDownTrayIcon className="w-5 h-5" />
                                     </a>
                                 )}
                             </div>
                         </div>
                    </div>

                    {/* Right: Chat Interface */}
                    <div className="w-full lg:w-2/3 flex flex-col bg-stone-900 relative">
                         {/* Export Toolbar */}
                         <div className="flex items-center justify-end gap-2 p-2 border-b border-stone-800 bg-stone-900/90 backdrop-blur z-10">
                            <button 
                                onClick={handleCopyChat} 
                                className="text-xs bg-stone-800 hover:bg-stone-700 text-stone-300 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
                            >
                                {copySuccess ? <CheckCircleIcon className="w-3 h-3 text-green-400"/> : <DocumentTextIcon className="w-3 h-3"/>}
                                {copySuccess ? 'کپی شد' : 'کپی گفتگو'}
                            </button>
                            <button 
                                onClick={handleDownloadChatTxt} 
                                className="text-xs bg-stone-800 hover:bg-stone-700 text-stone-300 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
                            >
                                <ArrowDownTrayIcon className="w-3 h-3"/> TXT
                            </button>
                            <button 
                                onClick={handleDownloadChatPdf} 
                                className="text-xs bg-amber-900/20 hover:bg-amber-900/40 text-amber-500 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors border border-amber-900/30"
                            >
                                <DocumentTextIcon className="w-3 h-3"/> PDF
                            </button>
                         </div>

                         <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                             {chatHistory.map((msg, idx) => (
                                 <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                     <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-md ${msg.role === 'user' ? 'bg-amber-600 text-white rounded-br-none' : 'bg-stone-800 text-stone-200 border border-stone-700 rounded-bl-none'}`}>
                                         <AIContentRenderer content={msg.text} />
                                     </div>
                                 </div>
                             ))}
                             {isChatLoading && (
                                 <div className="flex justify-start">
                                     <div className="bg-stone-800 p-4 rounded-2xl rounded-bl-none border border-stone-700">
                                         <div className="flex gap-1">
                                             <span className="w-2 h-2 bg-stone-500 rounded-full animate-bounce"></span>
                                             <span className="w-2 h-2 bg-stone-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                             <span className="w-2 h-2 bg-stone-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                         </div>
                                     </div>
                                 </div>
                             )}
                             <div ref={chatEndRef} />
                         </div>

                         <div className="p-4 border-t border-stone-800 bg-stone-900/95 backdrop-blur">
                             <div className="relative">
                                 <input 
                                     type="text"
                                     value={query}
                                     onChange={(e) => setQuery(e.target.value)}
                                     onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                     placeholder="از منابع خود سوال بپرسید..."
                                     className="w-full bg-stone-800 border border-stone-600 text-white rounded-xl py-3 px-4 pr-12 focus:ring-2 focus:ring-amber-500 outline-none"
                                 />
                                 <button 
                                     onClick={handleSendMessage}
                                     disabled={!query.trim() || isChatLoading}
                                     className="absolute left-2 top-1/2 -translate-x-1/2 p-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white transition-colors disabled:bg-stone-700"
                                 >
                                     <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                                 </button>
                             </div>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KnowledgeRefinerTool;