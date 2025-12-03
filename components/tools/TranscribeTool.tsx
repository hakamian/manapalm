
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { User } from '../../types.ts';
import { ArrowUpTrayIcon, PencilSquareIcon, SparklesIcon, ArrowDownTrayIcon, BanknotesIcon } from '../icons.tsx';
import { getFallbackMessage } from '../../services/geminiService.ts';
import { useAppDispatch, useAppState } from '../../AppContext.tsx';

const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
const PREMIUM_COST = 500;

const TranscribeTool: React.FC<{ user: User }> = ({ user }) => {
    const dispatch = useAppDispatch();
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [transcription, setTranscription] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLargeFile, setIsLargeFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Client-side size validation
            if (file.size > MAX_FILE_SIZE) {
                setError(`حجم فایل نباید بیشتر از ۲۰۰ مگابایت باشد.`);
                setAudioFile(null);
                setIsLargeFile(false);
                return;
            }

            // Check if premium needed
            setIsLargeFile(file.size > LARGE_FILE_THRESHOLD);

            setAudioFile(file);
            setTranscription(null);
            setError(null);
        }
    };

    const handleTranscribe = async () => {
        if (!audioFile) {
            setError('لطفا ابتدا یک فایل صوتی را انتخاب کنید.');
            return;
        }

        // Premium Check
        if (isLargeFile) {
            if (user.manaPoints < PREMIUM_COST) {
                setError(`برای پردازش فایل‌های حجیم (بیش از ۵۰ مگابایت) به ${PREMIUM_COST} امتیاز معنا نیاز دارید.`);
                return;
            }
            // Deduct points
            dispatch({ type: 'SPEND_MANA_POINTS', payload: { points: PREMIUM_COST, action: 'رونویسی فایل صوتی حجیم' } });
        }

        setIsLoading(true);
        setError(null);
        setTranscription(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            // 1. Upload the file using Files API
            setLoadingMessage('در حال آپلود فایل به سرور امن...');
            const uploadResult = await ai.files.upload({
                file: audioFile,
                config: { 
                    displayName: audioFile.name,
                    mimeType: audioFile.type 
                }
            });

            let file = uploadResult.file;
            
            // 2. Wait for processing
            setLoadingMessage('در حال پردازش فایل صوتی...');
            let attempts = 0;
            while (file.state === 'PROCESSING' && attempts < 60) { // Increased attempts for larger files
                await new Promise(resolve => setTimeout(resolve, 2000));
                file = await ai.files.get({ name: file.name });
                attempts++;
            }

            if (file.state === 'FAILED') {
                throw new Error("پردازش فایل توسط سرور با خطا مواجه شد.");
            }

            // 3. Generate content using the file URI
            setLoadingMessage('در حال رونویسی متن (ممکن است کمی طول بکشد)...');
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ 
                    role: 'user', 
                    parts: [
                        { fileData: { fileUri: file.uri, mimeType: file.mimeType } },
                        { text: "Please transcribe this audio to Persian text accurately. Provide ONLY the transcribed text without any introduction or explanation." }
                    ] 
                }],
            });
            
            setTranscription(response.text || "متنی یافت نشد.");

        } catch (err: any) {
            console.error("Transcription failed:", err);
            let errorMessage = getFallbackMessage('generic');
            if (err instanceof Error) {
                if (err.message.includes("quota") || err.message.includes("RESOURCE_EXHAUSTED")) {
                    errorMessage = "سهمیه شما برای استفاده از این قابلیت به پایان رسیده است.";
                } else if (err.message.includes("Rpc failed")) {
                    errorMessage = "خطا در ارسال فایل. لطفاً از فایل کوچک‌تری استفاده کنید یا دوباره تلاش کنید.";
                } else {
                    errorMessage = `خطا در رونویسی: ${err.message}`;
                }
            }
            setError(errorMessage);
            
            // Optional: Refund points if failed immediately (logic omitted for simplicity)
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    return (
        <div className="w-full h-full bg-white dark:bg-stone-800/50 rounded-2xl shadow-lg flex flex-col border border-stone-200/80 dark:border-stone-700">
            <div className="p-4 border-b border-stone-200 dark:border-stone-700">
                <h3 className="font-bold text-xl text-stone-800 dark:text-stone-100">رونویسی صدا (Flash)</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">تبدیل فایل‌های صوتی به متن. (زیر ۵۰ مگابایت رایگان)</p>
            </div>
            
            <div className="flex-1 p-4 md:p-6 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-grow w-full">
                        <label 
                            htmlFor="audio-upload" 
                            className={`w-full flex items-center justify-center px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isLargeFile ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-500' : 'bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700/50'}`}
                        >
                            <div className="text-center">
                                <ArrowDownTrayIcon className={`w-8 h-8 mx-auto mb-2 ${isLargeFile ? 'text-amber-500' : 'text-stone-400'}`} />
                                <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                                    {audioFile ? <span className="font-semibold">{audioFile.name}</span> : "برای آپلود فایل صوتی کلیک کنید"}
                                </p>
                                <div className="text-xs text-stone-400 mt-1 flex flex-col gap-1">
                                    <span>MP3, WAV, OGG (تا ۲۰۰ مگابایت)</span>
                                    {isLargeFile && <span className="text-amber-600 dark:text-amber-400 font-bold">فایل حجیم شناسایی شد (هزینه: ۵۰۰ امتیاز)</span>}
                                </div>
                            </div>
                            <input id="audio-upload" type="file" className="hidden" accept="audio/*" ref={fileInputRef} onChange={handleFileChange} />
                        </label>
                    </div>
                    <button 
                        onClick={handleTranscribe}
                        disabled={isLoading || !audioFile}
                        className={`w-full sm:w-auto font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-full ${isLargeFile ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
                    >
                        {isLoading ? (
                             <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>در حال پردازش...</span>
                             </>
                        ) : isLargeFile ? (
                            <>
                                <BanknotesIcon className="w-5 h-5" />
                                <span>پرداخت و رونویسی</span>
                            </>
                        ) : (
                            <>
                                <PencilSquareIcon className="w-5 h-5" />
                                <span>شروع رونویسی</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="flex-grow flex flex-col">
                    <label className="font-semibold block mb-2 text-stone-700 dark:text-stone-300">نتیجه:</label>
                    <div className="flex-grow bg-stone-50 dark:bg-stone-800 rounded-lg p-4 min-h-[200px] border border-stone-200 dark:border-stone-700 relative">
                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-stone-500 bg-stone-50/90 dark:bg-stone-800/90 z-10 rounded-lg">
                                <div className="animate-pulse">
                                    <SparklesIcon className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                                    <p className="font-semibold text-sm">{loadingMessage}</p>
                                </div>
                            </div>
                        )}
                        {error && <p className="text-red-500 text-sm text-center mt-10">{error}</p>}
                        {transcription ? (
                            <textarea
                                readOnly
                                value={transcription}
                                className="w-full h-full bg-transparent resize-none text-stone-700 dark:text-stone-200 leading-relaxed border-none focus:ring-0 p-0 text-sm"
                                style={{ minHeight: '180px' }}
                            />
                        ) : (
                            !isLoading && !error && (
                                <div className="flex items-center justify-center h-full text-center text-stone-400 dark:text-stone-500">
                                    <p>متن رونویسی شده اینجا نمایش داده می‌شود.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TranscribeTool;
