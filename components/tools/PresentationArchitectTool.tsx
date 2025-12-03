
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { jsPDF } from "jspdf";
import { 
    PresentationChartLineIcon, SparklesIcon, DocumentTextIcon, 
    ArrowDownTrayIcon, PhotoIcon, VideoCameraIcon, CheckCircleIcon,
    ChartBarIcon
} from '../icons';
import HighTechLoader from '../HighTechLoader';

const MODES = [
    { id: 'slides', label: 'اسلاید دک (Presentation)', icon: PresentationChartLineIcon },
    { id: 'infographic', label: 'اینفوگرافیک (Infographic)', icon: ChartBarIcon },
    { id: 'video_script', label: 'سناریو ویدیو (Video Script)', icon: VideoCameraIcon },
];

interface Slide {
    title: string;
    bullets: string[];
    speakerNotes: string;
    imagePrompt: string;
}

interface InfographicSection {
    title: string;
    points: string[];
    visualSuggestion: string;
}

const PresentationArchitectTool: React.FC = () => {
    const [mode, setMode] = useState<'slides' | 'infographic' | 'video_script'>('slides');
    const [topic, setTopic] = useState('');
    const [audience, setAudience] = useState('');
    
    const [slides, setSlides] = useState<Slide[]>([]);
    const [infographicData, setInfographicData] = useState<InfographicSection[]>([]);
    const [videoScript, setVideoScript] = useState<string>('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    
    // Image Generation State (for Infographics/Slides)
    const [generatingImageIndex, setGeneratingImageIndex] = useState<number | null>(null);
    const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});

    // Ref for capturing content for PDF/Image
    const contentRef = useRef<HTMLDivElement>(null);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError('لطفاً موضوع را وارد کنید.');
            return;
        }

        setIsLoading(true);
        setIsFinishing(false);
        setError(null);
        setSlides([]);
        setInfographicData([]);
        setVideoScript('');
        setGeneratedImages({});

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let prompt = '';
            let schema: any = {};

            if (mode === 'slides') {
                prompt = `
                Create a structured presentation slide deck about: "${topic}".
                Target Audience: "${audience || 'General'}".
                Language: Persian.
                
                For each slide, provide:
                1. Title (Short & Catchy)
                2. Bullet Points (3-5 key points)
                3. Speaker Notes (What to say)
                4. Image Prompt (English description of visual style and subject for AI image generator)
                
                Generate 5-8 slides.
                `;
                // Using JSON mode for structure
            } else if (mode === 'infographic') {
                prompt = `
                Design a comprehensive Infographic structure about: "${topic}".
                Target Audience: "${audience || 'General'}".
                Language: Persian.
                
                Break it down into visual sections. For each section:
                1. Title
                2. Data Points / Key Info (Short text)
                3. Visual Suggestion (English description of icons/charts)
                `;
            } else {
                prompt = `
                Write a compelling Video Script for an explainer video about: "${topic}".
                Target Audience: "${audience || 'General'}".
                Language: Persian.
                
                Format:
                [Scene 1: Visual Description]
                Narrator: ...
                [Scene 2: Visual Description]
                Narrator: ...
                `;
            }

            // We'll use standard generation and parse manually or use JSON mode if schema defined
            // For flexibility, let's use text generation with strict formatting instructions or JSON mode
            
            let systemInstruction = `You are an expert Content Architect. Output valid JSON only.`;
            
            if (mode === 'video_script') {
                systemInstruction = `You are an expert Video Director. Write a script in Persian with English visual cues.`;
                const response = await ai.models.generateContent({
                    model: 'gemini-3-pro-preview',
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    config: { systemInstruction }
                });
                setIsFinishing(true);
                setTimeout(() => {
                    setVideoScript(response.text || '');
                    setIsLoading(false);
                    setIsFinishing(false);
                }, 1000);
                return;
            }

            // JSON Schema for Slides/Infographic
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    responseMimeType: 'application/json',
                    temperature: 0.4
                }
            });

            const jsonText = response.text || '{}';
            const data = JSON.parse(jsonText);

            setIsFinishing(true);
            setTimeout(() => {
                if (mode === 'slides') {
                    // Expecting array or object with slides array
                    const slidesArray = Array.isArray(data) ? data : (data.slides || []);
                    setSlides(slidesArray);
                } else {
                    const infoArray = Array.isArray(data) ? data : (data.sections || []);
                    setInfographicData(infoArray);
                }
                setIsLoading(false);
                setIsFinishing(false);
            }, 1500);

        } catch (err: any) {
            console.error(err);
            setError("خطا در تولید محتوا. لطفاً دوباره تلاش کنید.");
            setIsLoading(false);
            setIsFinishing(false);
        }
    };

    const handleGenerateImage = async (prompt: string, index: number) => {
        setGeneratingImageIndex(index);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: `High quality, professional illustration, flat design or photorealistic depending on context: ${prompt}`,
                config: { numberOfImages: 1, aspectRatio: mode === 'infographic' ? '3:4' : '16:9' }
            });
            
            if (response.generatedImages?.[0]) {
                const base64 = response.generatedImages[0].image.imageBytes;
                setGeneratedImages(prev => ({ ...prev, [index]: `data:image/jpeg;base64,${base64}` }));
            }
        } catch (e) {
            console.error("Image gen failed", e);
            alert("خطا در تولید تصویر.");
        } finally {
            setGeneratingImageIndex(null);
        }
    };

    const handleDownloadPDF = async () => {
        if (!contentRef.current) return;
        setIsExporting(true);

        try {
            const pdf = new jsPDF(mode === 'infographic' ? 'p' : 'l', 'mm', 'a4');
            
            // Select elements based on mode. 
            // For slides, we select individual slide cards.
            // For infographic, we select the whole container.
            
            if (mode === 'slides') {
                const elements = contentRef.current.querySelectorAll('.export-target');
                for (let i = 0; i < elements.length; i++) {
                    const el = elements[i] as HTMLElement;
                    
                    // html2canvas needs to be on window or imported. Assuming script tag in index.html
                    const canvas = await (window as any).html2canvas(el, { 
                        scale: 2, 
                        useCORS: true,
                        backgroundColor: '#1c1917' // match stone-900
                    });
                    const imgData = canvas.toDataURL('image/png');
                    
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                    
                    if (i > 0) pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                }
            } else {
                // Infographic
                 const el = contentRef.current.querySelector('.export-target') as HTMLElement;
                 if (el) {
                    const canvas = await (window as any).html2canvas(el, { scale: 2, useCORS: true });
                    const imgData = canvas.toDataURL('image/png');
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                    
                    // If height is too big for one page, we might need multi-page logic or just fit width (which creates very tall PDF page or squashed)
                    // Simple approach: Set page size to match image ratio roughly or just fit.
                    // Better: Create a PDF with custom page size for infographic
                     const customPdf = new jsPDF('p', 'pt', [imgProps.width, imgProps.height]);
                     customPdf.addImage(imgData, 'PNG', 0, 0, imgProps.width, imgProps.height);
                     customPdf.save(`infographic-${Date.now()}.pdf`);
                     setIsExporting(false);
                     return;
                 }
            }

            pdf.save(`${mode}-${Date.now()}.pdf`);
        } catch (e) {
            console.error("Export failed", e);
            alert("خطا در دانلود PDF.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadImage = async () => {
        if (!contentRef.current) return;
        setIsExporting(true);

        try {
             // For infographic, just capture the single target
            const el = contentRef.current.querySelector('.export-target') as HTMLElement;
            if (el) {
                const canvas = await (window as any).html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#1c1917' });
                const link = document.createElement('a');
                link.download = `infographic-${Date.now()}.png`;
                link.href = canvas.toDataURL();
                link.click();
            }
        } catch (e) {
            console.error("Export failed", e);
            alert("خطا در دانلود تصویر.");
        } finally {
             setIsExporting(false);
        }
    };

    return (
        <div className="w-full h-full bg-stone-900 text-white rounded-2xl shadow-lg flex flex-col border border-stone-700 overflow-hidden relative">
            
            <HighTechLoader 
                isVisible={isLoading}
                isFinishing={isFinishing}
                messages={[
                    "تحلیل موضوع و مخاطب...",
                    "طراحی ساختار بصری و جریان اطلاعات...",
                    "نگارش متن‌های کلیدی و تیترها...",
                    "مهندسی پرامپت برای تصاویر هوشمند...",
                    "تدوین نهایی طرح..."
                ]}
            />

            {isExporting && (
                <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent mb-4 mx-auto"></div>
                        <p className="text-cyan-400 font-bold">در حال آماده‌سازی فایل خروجی...</p>
                    </div>
                </div>
            )}

            <div className="p-4 border-b border-stone-700 bg-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-900/30 rounded-lg text-cyan-400">
                        <PresentationChartLineIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">معمار ارائه (Presentation Architect)</h3>
                        <p className="text-xs text-stone-400">طراحی اسلاید، اینفوگرافیک و ویدیو</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Input Section */}
                <div className="w-full lg:w-1/3 bg-stone-900 p-6 border-b lg:border-b-0 lg:border-l border-stone-800 overflow-y-auto custom-scrollbar flex flex-col">
                    
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {MODES.map(m => (
                            <button 
                                key={m.id}
                                onClick={() => setMode(m.id as any)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${mode === m.id ? 'bg-cyan-900/40 border-cyan-500 text-white' : 'bg-stone-800 border-stone-700 text-stone-400 hover:border-stone-500'}`}
                            >
                                <m.icon className="w-6 h-6" />
                                <span className="text-[10px] font-bold">{m.label.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4 flex-grow">
                        <div>
                            <label className="block text-sm font-semibold text-stone-300 mb-2">موضوع ارائه / محتوا</label>
                            <textarea
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                placeholder="مثلاً: گزارش عملکرد سالانه شرکت، تاریخچه هوش مصنوعی..."
                                className="w-full h-32 bg-stone-800/50 border border-stone-700 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-stone-300 mb-2">مخاطب هدف (اختیاری)</label>
                            <input
                                type="text"
                                value={audience}
                                onChange={e => setAudience(e.target.value)}
                                placeholder="مثلاً: سرمایه‌گذاران، دانشجویان، مشتریان..."
                                className="w-full bg-stone-800/50 border border-stone-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-xs text-center mb-2">{error}</p>}

                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        طراحی ساختار
                    </button>
                </div>

                {/* Output Section */}
                <div className="w-full lg:w-2/3 bg-stone-800/30 p-6 overflow-y-auto custom-scrollbar" ref={contentRef}>
                    
                    {/* Download Toolbar */}
                    {(slides.length > 0 || infographicData.length > 0) && (
                         <div className="flex justify-end gap-3 mb-6 sticky top-0 z-20 bg-stone-900/80 backdrop-blur-md p-3 rounded-xl border border-stone-700">
                             {mode === 'infographic' && (
                                <button onClick={handleDownloadImage} className="flex items-center gap-2 bg-stone-700 hover:bg-stone-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                                    <PhotoIcon className="w-4 h-4" /> دانلود تصویر
                                </button>
                             )}
                             <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm transition-colors shadow-lg">
                                <ArrowDownTrayIcon className="w-4 h-4" /> دانلود PDF
                            </button>
                         </div>
                    )}

                    {mode === 'slides' && slides.length > 0 && (
                        <div className="space-y-8 max-w-3xl mx-auto">
                            {slides.map((slide, index) => (
                                <div key={index} className="bg-stone-800 rounded-2xl border border-stone-700 overflow-hidden shadow-xl export-target">
                                    <div className="p-6 border-b border-stone-700 bg-stone-900/50 flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">اسلاید {index + 1}</span>
                                            <h3 className="text-xl font-bold text-white mt-1">{slide.title}</h3>
                                        </div>
                                    </div>
                                    <div className="p-6 grid md:grid-cols-2 gap-6">
                                        <div>
                                            <ul className="space-y-2 mb-4">
                                                {slide.bullets?.map((b, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-stone-300">
                                                        <span className="text-cyan-500 mt-1">•</span> {b}
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="bg-stone-900/50 p-3 rounded-lg border border-stone-700/50">
                                                <p className="text-xs text-stone-500 font-bold mb-1">یادداشت سخنران:</p>
                                                <p className="text-xs text-stone-400 italic">{slide.speakerNotes}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {generatedImages[index] ? (
                                                <img src={generatedImages[index]} alt="Slide Visual" className="w-full rounded-lg shadow-md" />
                                            ) : (
                                                <div className="w-full aspect-video bg-stone-700/30 rounded-lg border border-stone-600 border-dashed flex flex-col items-center justify-center text-center p-4">
                                                    <PhotoIcon className="w-8 h-8 text-stone-500 mb-2"/>
                                                    <p className="text-xs text-stone-400 mb-2 line-clamp-2">{slide.imagePrompt}</p>
                                                    <button 
                                                        onClick={() => handleGenerateImage(slide.imagePrompt, index)}
                                                        disabled={generatingImageIndex === index}
                                                        className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-md transition-colors"
                                                    >
                                                        {generatingImageIndex === index ? '...' : 'تولید تصویر'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {mode === 'infographic' && infographicData.length > 0 && (
                         <div className="max-w-2xl mx-auto bg-white text-stone-900 rounded-none shadow-2xl overflow-hidden export-target">
                             <div className="bg-cyan-600 p-8 text-center text-white">
                                 <h2 className="text-3xl font-black mb-2">{topic}</h2>
                                 <p className="opacity-80 text-sm">اینفوگرافیک تحلیلی</p>
                             </div>
                             <div className="p-8 space-y-8">
                                 {infographicData.map((section, idx) => (
                                     <div key={idx} className="flex gap-6 items-start">
                                         <div className="flex-shrink-0 w-12 h-12 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xl border-4 border-white shadow-md">
                                             {idx + 1}
                                         </div>
                                         <div className="flex-grow pt-1">
                                             <h3 className="font-bold text-xl text-stone-800 mb-2">{section.title}</h3>
                                             <ul className="space-y-1 mb-3">
                                                 {section.points?.map((p, i) => (
                                                     <li key={i} className="text-stone-600 text-sm">• {p}</li>
                                                 ))}
                                             </ul>
                                             <div className="bg-stone-100 p-3 rounded-lg border border-stone-200 text-xs text-stone-500 flex justify-between items-center" data-html2canvas-ignore="true">
                                                 <span>پیشنهاد بصری: {section.visualSuggestion}</span>
                                                 <button 
                                                    onClick={() => handleGenerateImage(section.visualSuggestion, idx)}
                                                    disabled={generatingImageIndex === idx}
                                                    className="text-cyan-600 hover:text-cyan-800 font-bold"
                                                 >
                                                     {generatingImageIndex === idx ? '...' : 'تولید'}
                                                 </button>
                                             </div>
                                             {generatedImages[idx] && (
                                                 <img src={generatedImages[idx]} alt="Visual" className="mt-2 w-full rounded-lg shadow-sm" />
                                             )}
                                         </div>
                                     </div>
                                 ))}
                             </div>
                             <div className="bg-stone-100 p-4 text-center text-xs text-stone-500">
                                 طراحی شده توسط هوشمانا
                             </div>
                         </div>
                    )}

                    {mode === 'video_script' && videoScript && (
                        <div className="max-w-3xl mx-auto bg-stone-800 p-8 rounded-2xl border border-stone-700">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">سناریو ویدیو</h3>
                                <button onClick={() => navigator.clipboard.writeText(videoScript)} className="text-xs bg-stone-700 hover:bg-stone-600 px-3 py-1.5 rounded-md text-white transition-colors">
                                    کپی متن
                                </button>
                            </div>
                            <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                                {videoScript}
                            </div>
                        </div>
                    )}

                    {!slides.length && !infographicData.length && !videoScript && !isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-stone-500 opacity-60 text-center p-8">
                            <PresentationChartLineIcon className="w-24 h-24 mb-4" />
                            <h3 className="text-xl font-bold mb-2">استودیو خالی است</h3>
                            <p className="text-sm max-w-md">
                                موضوع خود را وارد کنید تا معمار هوشمند، ساختار ارائه شما را طراحی کند.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PresentationArchitectTool;
