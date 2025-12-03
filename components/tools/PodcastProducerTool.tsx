
import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenAI, Modality } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
    SpeakerWaveIcon, SparklesIcon, DocumentTextIcon, ArrowDownTrayIcon, 
    MicrophoneIcon, ArrowPathIcon, LinkIcon, PhotoIcon, ArrowUpTrayIcon,
    UserCircleIcon, UsersIcon, PlayIcon, StopIcon, CheckCircleIcon, PencilSquareIcon, CheckIcon
} from '../icons';
import HighTechLoader from '../HighTechLoader';
import AIContentRenderer from '../AIContentRenderer';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const LANGUAGES = [
    { id: 'Persian', label: 'فارسی (Persian)' },
    { id: 'English', label: 'English' },
    { id: 'Arabic', label: 'العربية (Arabic)' },
    { id: 'Turkish', label: 'Türkçe (Turkish)' },
];

const HOST_GENDERS = [
    { id: 'male', label: 'مرد (تک میزبان)', icon: '👨' },
    { id: 'female', label: 'زن (تک میزبان)', icon: '👩' },
    { id: 'duo', label: 'میزگرد (دو نفره)', icon: '👫' }, 
];

const HOST_PERSONAS = [
    { id: 'storyteller', label: 'قصه‌گو و گرم', desc: 'آرام، صمیمی و روایی' },
    { id: 'energetic', label: 'پرانرژی و سریع', desc: 'مناسب اخبار و تکنولوژی' },
    { id: 'investigative', label: 'کارآگاه و جدی', desc: 'مناسب جنایی و تحلیل عمیق' },
    { id: 'friendly', label: 'دوستانه و طنز', desc: 'گفتگوی خودمانی' },
];

type InputType = 'text' | 'url' | 'file' | 'image';

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

// --- Audio Helper Functions ---
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

const PodcastProducerTool: React.FC = () => {
    const [inputType, setInputType] = useState<InputType>('text');
    const [inputValue, setInputValue] = useState('');
    const [file, setFile] = useState<File | null>(null);
    
    // Config Settings
    const [targetLanguage, setTargetLanguage] = useState('Persian');
    const [selectedGender, setSelectedGender] = useState('duo');
    const [selectedPersona, setSelectedPersona] = useState('storyteller');
    
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);
    
    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    
    // Audio State
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 20 * 1024 * 1024) {
                setError('حجم فایل باید کمتر از ۲۰ مگابایت باشد.');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const extractTextFromPDF = async (file: File): Promise<string> => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            const maxPages = Math.min(pdf.numPages, 30); 
            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = (textContent.items as any[]).map((item: any) => item.str || '').join(' ');
                fullText += pageText + '\n\n';
            }
            return fullText;
        } catch (err: any) {
            throw new Error(`خطا در خواندن فایل PDF: ${err.message}`);
        }
    };

    const handleGenerate = async () => {
        if ((inputType === 'text' || inputType === 'url') && !inputValue.trim()) {
            setError('لطفاً متن یا لینک ورودی را وارد کنید.');
            return;
        }
        if ((inputType === 'file' || inputType === 'image') && !file) {
            setError('لطفاً یک فایل انتخاب کنید.');
            return;
        }

        setIsLoading(true);
        setIsFinishing(false);
        setError(null);
        setResult('');
        setAudioBuffer(null); 
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let parts: any[] = [];
            let tools: any[] = [];

            // 1. Prepare Input Data
            if (inputType === 'text') {
                parts = [{ text: `SOURCE TEXT:\n"""${inputValue}"""` }];
            } 
            else if (inputType === 'url') {
                tools = [{ googleSearch: {} }];
                parts = [{ text: `Research this URL and create a podcast script about it: ${inputValue}` }];
            } 
            else if (inputType === 'file' && file?.type === 'application/pdf') {
                const pdfText = await extractTextFromPDF(file);
                parts = [{ text: `SOURCE PDF CONTENT:\n"""${pdfText}"""` }];
            }
            else if (inputType === 'image' && file) {
                const base64 = await fileToBase64(file);
                parts = [
                    { inlineData: { mimeType: file.type, data: base64 } },
                    { text: "Analyze this image and create a podcast script describing and discussing it." }
                ];
            }

            // 2. Construct System Prompt (AUDIO DRAMATIST V5.0)
            const personaData = HOST_PERSONAS.find(p => p.id === selectedPersona);
            const genderMode = selectedGender === 'duo' ? 'DIALOGUE' : 'MONOLOGUE';
            const hostName = selectedGender === 'female' ? 'سارا' : 'علی';

            const systemInstruction = `
# SYSTEM ROLE: MASTER AUDIO DRAMATIST (V5.0)

**MISSION:**
Transform raw source material into a captivating, high-quality **Podcast Script** designed for the ear.

**CONFIGURATION:**
- **Output Language:** ${targetLanguage} (Must be natural, flowing, and culturally appropriate).
- **Format Mode:** ${genderMode}
- **Tone/Vibe:** ${personaData?.label} (${personaData?.desc}).

### 🗣️ GENERATION RULES

**IF MODE = "DIALOGUE" (Duo):**
*   **Characters:** 
    *   Speaker 1: **Joe** (Energetic Host).
    *   Speaker 2: **Jane** (The Expert/Analyst).
*   **Structure:** Use specific speaker labels exactly as "Joe:" and "Jane:".
*   **Dynamic:** Interruptions, "Hmm...", "Exactly!".

**IF MODE = "MONOLOGUE" (Solo):**
*   **Character:** ${hostName} (The Storyteller).
*   **Structure:** No speaker labels needed.
*   **Style:** Direct address to the listener.

**AUDIO CUES:**
*   Insert [SFX: ...] for sound effects.
*   Insert [Music: ...] for mood shifts.
*   Insert [Tone: ...] for voice direction.

**LANGUAGE RULES (${targetLanguage}):**
*   Use **Colloquial/Spoken** language (e.g., in Persian use "می‌تونی" instead of "می‌توانی").
*   Avoid "Bookish" words.

---

**OUTPUT FORMAT:**
Return ONLY the script content.
`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: [{ role: 'user', parts }],
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.7,
                    tools: tools
                }
            });

            setIsFinishing(true);
            
            setTimeout(() => {
                setResult(response.text || 'پاسخی دریافت نشد.');
                setIsLoading(false);
                setIsFinishing(false);
            }, 1500);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "خطایی رخ داد. لطفاً دوباره تلاش کنید.");
            setIsLoading(false);
            setIsFinishing(false);
        }
    };

    const handleGenerateAudio = async () => {
        if (!result) return;
        setIsGeneratingAudio(true);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let speechConfig: any = {};

            // Clean text logic depends on mode
            let cleanText = result
                .replace(/\[.*?\]/g, '') // Remove [SFX], [Music]
                .replace(/\(.*?\)/g, '') // Remove (Parentheses)
                .replace(/\*\*.*?\*\*/g, '') // Remove **Bold Headers**
                .replace(/##/g, '');

            if (selectedGender === 'duo') {
                // Multi-Speaker Logic
                // Ensure labels match what the model expects or map them
                // Gemini TTS supports multiSpeakerVoiceConfig
                speechConfig = {
                    multiSpeakerVoiceConfig: {
                        speakerVoiceConfigs: [
                            {
                                speaker: 'Joe',
                                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } // Male/Deep
                            },
                            {
                                speaker: 'Jane',
                                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } // Female/Soft
                            }
                        ]
                    }
                };
                // For multi-speaker, we keep the labels "Joe:" and "Jane:" in the text so the model knows when to switch.
                // We might need to ensure the LLM output uses exactly these names.
                // The system instruction enforced "Joe:" and "Jane:".
            } else {
                // Single Speaker Logic
                cleanText = cleanText
                    .replace(/Host:|ميزبان:|میزبان:|Host A:|Host B:|کارشناس:|Joe:|Jane:/g, ''); // Remove speaker labels for solo

                let voiceName = 'Kore'; 
                if (selectedGender === 'male') voiceName = 'Puck'; // Male
                if (selectedGender === 'female') voiceName = 'Aoede'; // Female
                
                speechConfig = {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName },
                    },
                };
            }
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: [{ role: 'user', parts: [{ text: cleanText.substring(0, 3000) }] }], // Limit length
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: speechConfig,
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) throw new Error("No audio generated.");

            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }

            const buffer = await decodeAudioData(
                decode(base64Audio),
                audioContextRef.current,
                24000,
                1
            );
            
            setAudioBuffer(buffer);

        } catch (err: any) {
            console.error("Audio generation failed:", err);
            alert("خطا در تولید صدا. ممکن است متن طولانی باشد یا سرویس در دسترس نباشد.");
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    const handlePlayAudio = () => {
        if (!audioBuffer || !audioContextRef.current) return;

        if (isPlaying) {
            sourceNodeRef.current?.stop();
            setIsPlaying(false);
            return;
        }

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
        sourceNodeRef.current = source;
        setIsPlaying(true);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <div className="w-full h-full bg-stone-900 text-white rounded-2xl shadow-lg flex flex-col border border-stone-700 overflow-hidden relative">
            
            <HighTechLoader 
                isVisible={isLoading}
                isFinishing={isFinishing}
                messages={[
                    "اتصال به استودیو ضبط مجازی...",
                    "تحلیل احساسی و استخراج خط روایی...",
                    `انتخاب بازیگران صوتی: ${selectedGender === 'duo' ? 'میزگرد دو نفره' : 'تک نفره'}...`,
                    "نگارش دیالوگ‌ها با لحن محاوره‌ای...",
                    "افزودن نشانه‌های صوتی و کارگردانی..."
                ]}
            />

            <div className="p-4 border-b border-stone-700 bg-stone-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-pink-900/30 rounded-lg text-pink-500">
                        <SpeakerWaveIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">استودیو پادکست (Audio Dramatist)</h3>
                        <p className="text-xs text-stone-400">تولید اسکریپت حرفه‌ای و فایل صوتی</p>
                    </div>
                </div>
                
                {/* Language Settings */}
                <div className="flex items-center gap-2 bg-stone-900 p-1.5 rounded-lg border border-stone-700">
                     <span className="text-[10px] text-stone-400 px-1">زبان خروجی:</span>
                    <select 
                        value={targetLanguage} 
                        onChange={(e) => setTargetLanguage(e.target.value)}
                        className="bg-stone-800 border border-stone-600 text-xs rounded px-2 py-1 focus:ring-1 focus:ring-pink-500 outline-none text-pink-300"
                    >
                        {LANGUAGES.map(lang => (
                            <option key={lang.id} value={lang.id}>{lang.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Input Side */}
                <div className="w-full lg:w-1/3 bg-stone-900 p-6 border-b lg:border-b-0 lg:border-l border-stone-800 overflow-y-auto custom-scrollbar flex flex-col">
                    
                    {/* Input Tabs */}
                    <div className="grid grid-cols-4 gap-1 bg-stone-800 p-1 rounded-lg mb-6">
                         <button onClick={() => { setInputType('text'); setFile(null); setInputValue(''); }} className={`py-2 rounded-md flex justify-center transition-all ${inputType === 'text' ? 'bg-pink-600 text-white shadow' : 'text-stone-400 hover:text-white'}`} title="متن">
                            <DocumentTextIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => { setInputType('url'); setFile(null); setInputValue(''); }} className={`py-2 rounded-md flex justify-center transition-all ${inputType === 'url' ? 'bg-pink-600 text-white shadow' : 'text-stone-400 hover:text-white'}`} title="لینک">
                            <LinkIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => { setInputType('file'); setFile(null); setInputValue(''); }} className={`py-2 rounded-md flex justify-center transition-all ${inputType === 'file' ? 'bg-pink-600 text-white shadow' : 'text-stone-400 hover:text-white'}`} title="PDF">
                            <ArrowUpTrayIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => { setInputType('image'); setFile(null); setInputValue(''); }} className={`py-2 rounded-md flex justify-center transition-all ${inputType === 'image' ? 'bg-pink-600 text-white shadow' : 'text-stone-400 hover:text-white'}`} title="تصویر">
                            <PhotoIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mb-6">
                        {/* Host Settings */}
                        <div className="space-y-4 mb-6 bg-stone-800/50 p-3 rounded-xl border border-stone-700">
                            <div>
                                <label className="block text-xs font-semibold text-stone-400 mb-2">قالب اجرا:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {HOST_GENDERS.map(g => (
                                        <button
                                            key={g.id}
                                            onClick={() => setSelectedGender(g.id)}
                                            className={`text-xs py-1.5 rounded-md border transition-all ${selectedGender === g.id ? 'bg-pink-900/40 border-pink-500 text-white' : 'border-stone-600 text-stone-400 hover:bg-stone-700'}`}
                                        >
                                            <span className="mr-1">{g.icon}</span> {g.label.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-stone-400 mb-2">لحن و اتمسفر:</label>
                                <select 
                                    value={selectedPersona}
                                    onChange={(e) => setSelectedPersona(e.target.value)}
                                    className="w-full bg-stone-900 border border-stone-600 text-xs rounded-lg p-2 text-white focus:ring-1 focus:ring-pink-500 outline-none"
                                >
                                    {HOST_PERSONAS.map(p => (
                                        <option key={p.id} value={p.id}>{p.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Input Field */}
                        <label className="block text-sm font-semibold text-stone-300 mb-2">
                            {inputType === 'url' ? 'لینک مطلب:' : 
                             inputType === 'image' ? 'آپلود تصویر برای تحلیل:' : 
                             inputType === 'file' ? 'آپلود فایل متنی (PDF):' : 
                             'متن یا ایده خام:'}
                        </label>

                        {(inputType === 'text' || inputType === 'url') ? (
                            <textarea 
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                placeholder={inputType === 'url' ? "https://..." : "متن خود را اینجا وارد کنید..."}
                                className={`w-full bg-stone-800/50 border border-stone-700 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none resize-none custom-scrollbar ${inputType === 'url' ? 'h-24 dir-ltr' : 'h-40'}`}
                            />
                        ) : (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-stone-600 border-dashed rounded-xl cursor-pointer bg-stone-800/50 hover:bg-stone-800 hover:border-pink-500 transition-all group"
                            >
                                <ArrowUpTrayIcon className="w-8 h-8 text-stone-500 mb-2 group-hover:text-pink-400" />
                                <p className="text-xs text-stone-400">
                                    {file ? file.name : (inputType === 'image' ? 'آپلود تصویر (JPG/PNG)' : 'آپلود PDF')}
                                </p>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    ref={fileInputRef}
                                    accept={inputType === 'image' ? 'image/*' : 'application/pdf'}
                                    onChange={handleFileChange} 
                                />
                            </div>
                        )}
                    </div>

                    {error && <p className="text-red-400 text-xs text-center mb-2">{error}</p>}

                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading || ((inputType === 'text' || inputType === 'url') ? !inputValue : !file)}
                        className="w-full mt-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>در حال کارگردانی...</span>
                            </>
                        ) : (
                            <>
                                <DocumentTextIcon className="w-5 h-5" />
                                تولید اسکریپت
                            </>
                        )}
                    </button>
                </div>

                {/* Output Side */}
                <div className="w-full lg:w-2/3 bg-stone-800/30 p-6 overflow-y-auto custom-scrollbar relative">
                    {result ? (
                        <div className="max-w-3xl mx-auto animate-fade-in">
                            <div className="flex flex-col gap-4 mb-6 sticky top-0 bg-stone-900/95 backdrop-blur-md p-3 rounded-lg border border-stone-700 z-10">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <SpeakerWaveIcon className="w-5 h-5 text-green-400"/>
                                        اسکریپت نهایی
                                    </h2>
                                    
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => setIsEditing(!isEditing)}
                                            className={`text-xs px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors ${isEditing ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                        >
                                            {isEditing ? <CheckIcon className="w-4 h-4"/> : <PencilSquareIcon className="w-4 h-4"/>}
                                            {isEditing ? 'ذخیره' : 'ویرایش'}
                                        </button>

                                        <button 
                                            onClick={handleGenerateAudio} 
                                            disabled={isGeneratingAudio || isEditing}
                                            className="text-xs bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors text-white disabled:opacity-50"
                                        >
                                            {isGeneratingAudio ? (
                                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            ) : (
                                                <MicrophoneIcon className="w-4 h-4" />
                                            )}
                                            {audioBuffer ? 'تولید مجدد' : 'تولید فایل صوتی (دمو)'}
                                        </button>
                                        
                                        {audioBuffer && (
                                            <button 
                                                onClick={handlePlayAudio} 
                                                className={`text-xs px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors text-white ${isPlaying ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}
                                            >
                                                {isPlaying ? <StopIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                                                {isPlaying ? 'توقف' : 'پخش'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Export Actions */}
                                <div className="flex gap-2 justify-end pt-2 border-t border-stone-700/50">
                                    <button onClick={handleCopy} className="text-xs bg-stone-700 hover:bg-stone-600 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors text-white">
                                        {copySuccess ? <CheckCircleIcon className="w-4 h-4 text-green-400" /> : <DocumentTextIcon className="w-4 h-4" />}
                                        {copySuccess ? 'کپی شد' : 'کپی متن'}
                                    </button>
                                </div>
                            </div>

                            {isEditing ? (
                                <textarea 
                                    value={result} 
                                    onChange={(e) => setResult(e.target.value)}
                                    className="w-full h-[500px] bg-stone-800 p-4 rounded-xl text-stone-200 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                            ) : (
                                <div className="prose prose-invert prose-lg max-w-none text-stone-200 leading-relaxed dir-auto">
                                    <AIContentRenderer content={result} />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-stone-500 opacity-60 text-center p-8">
                            <div className="w-24 h-24 bg-stone-800 rounded-full flex items-center justify-center mb-4">
                                <MicrophoneIcon className="w-12 h-12 text-stone-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">استودیو آماده است</h3>
                            <p className="text-sm max-w-md">
                                ورودی خود را انتخاب کنید (متن، لینک، تصویر) تا هوش مصنوعی آن را به یک اپیزود شنیدنی تبدیل کند.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PodcastProducerTool;
