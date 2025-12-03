
import React, { useState, useEffect } from 'react';
import { User, WebsitePackage, WebDevProject } from '../types.ts';
import Modal from './Modal.tsx';
import { ArrowLeftIcon, ArrowRightIcon, SparklesIcon, CheckIcon, XIcon, ChartBarIcon, BanknotesIcon, TrendingUpIcon, HeartIcon, SitemapIcon } from './icons.tsx';
import { GoogleGenAI, Type } from '@google/genai';

interface WebsiteWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    preSelectedPackage: WebsitePackage | null;
    packages: (WebsitePackage & { description: string; features: string[] })[];
    onComplete: (data: WebDevProject['initialRequest'], selectedPkg: WebsitePackage) => void;
}

type Step = 'input_idea' | 'input_business_metrics' | 'analyzing' | 'value_proposition' | 'package_selection' | 'blueprint';

interface ValuePropositionReport {
    addedValue: string; 
    costReduction: string; 
    emotionalContribution: string; 
    estimatedROI: string; 
    summary: string;
    recommendedPackageId: string;
}

const toEnglishDigits = (str: string) => {
    return str.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()).replace(/\D/g, '');
};

const formatNumber = (str: string) => {
    const englishNumber = toEnglishDigits(str);
    if (!englishNumber) return '';
    return Number(englishNumber).toLocaleString('fa-IR');
};

const WebsiteWizardModal: React.FC<WebsiteWizardModalProps> = ({ isOpen, onClose, user, preSelectedPackage, packages, onComplete }) => {
    const [step, setStep] = useState<Step>('input_idea');
    const [rawIdea, setRawIdea] = useState('');
    const [businessMetrics, setBusinessMetrics] = useState({
        currentRevenue: '',
        customerCount: '',
        goal: 'increase_sales' 
    });

    const [valueReport, setValueReport] = useState<ValuePropositionReport | null>(null);
    const [blueprint, setBlueprint] = useState<{ projectName: string; tagline: string; colors: string[]; structure: string[] } | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<WebsitePackage | null>(preSelectedPackage);
    
    useEffect(() => {
        if (!isOpen) {
            setStep('input_idea');
            setRawIdea('');
            setBusinessMetrics({ currentRevenue: '', customerCount: '', goal: 'increase_sales' });
            setValueReport(null);
            setBlueprint(null);
            setSelectedPackage(preSelectedPackage);
        } else {
            if(preSelectedPackage) setSelectedPackage(preSelectedPackage);
        }
    }, [isOpen, preSelectedPackage]);

    const handleAnalyzeValue = async () => {
        if (!rawIdea.trim()) return;
        setStep('analyzing');
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const cleanRevenue = toEnglishDigits(businessMetrics.currentRevenue);
            const cleanCustomers = toEnglishDigits(businessMetrics.customerCount);

            const prompt = `
            Act as a Value Proposition Expert.
            Analyze this website project idea to quantify its value BEFORE the user buys.
            User Idea: "${rawIdea}"
            Current Business Context: Revenue ~${cleanRevenue || 'N/A'}, Customers ~${cleanCustomers || 'N/A'}, Primary Goal: ${businessMetrics.goal}.

            Task:
            1. Estimate "Added Value" (Revenue gains, new leads) in Tomans (be realistic but optimistic).
            2. Estimate "Cost Reduction" (Time saved, automation) in Tomans.
            3. Define "Emotional Contribution" (Trust, Brand Authority).
            4. Calculate a hypothetical ROI %.
            5. Create a "Digital Soul Blueprint" (Name, Tagline, Colors, Structure).
            6. Recommend one of these package IDs based on needs: 'website_seed' (Simple), 'website_sapling' (Growth), 'website_palm' (Complex/High Value).

            Respond ONLY with this JSON schema:
            {
                "valueReport": {
                    "addedValue": "String (e.g., 'جذب ۲۰ مشتری جدید معادل ۵۰ میلیون تومان ماهانه')",
                    "costReduction": "String (e.g., 'صرفه‌جویی ۴۰ ساعت کار در ماه')",
                    "emotionalContribution": "String (e.g., 'افزایش اعتبار برند و اعتماد مشتری')",
                    "estimatedROI": "String (e.g., '۳۰۰٪ در سال اول')",
                    "summary": "String (A persuasive summary of why this investment makes sense)",
                    "recommendedPackageId": "String (one of the package IDs)"
                },
                "blueprint": {
                    "projectName": "String",
                    "tagline": "String",
                    "colors": ["Hex", "Hex", "Hex"],
                    "structure": ["Page 1", "Page 2", "Page 3", "Page 4"]
                }
            }
            Respond in Persian.
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview', 
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: { responseMimeType: 'application/json' }
            });
            
            const result = JSON.parse(response.text || '{}');
            setValueReport(result.valueReport);
            setBlueprint(result.blueprint);
            
            if (!selectedPackage && result.valueReport.recommendedPackageId) {
                 const recPkg = packages.find(p => p.id === result.valueReport.recommendedPackageId);
                 if (recPkg) setSelectedPackage(recPkg);
            }
            setStep('value_proposition');
            
        } catch (e) {
            console.error("Analysis failed", e);
            setStep('package_selection');
        }
    }
    
    const handleSubmit = () => {
        if (!selectedPackage || !blueprint) return;
        const cleanCustomers = toEnglishDigits(businessMetrics.customerCount);

        const data: WebDevProject['initialRequest'] = {
            projectName: blueprint.projectName,
            contactInfo: user.email || user.phone || '',
            projectType: selectedPackage.name,
            vision: rawIdea + `\n\n[Value Analysis]\nROI: ${valueReport?.estimatedROI}\nAdded Value: ${valueReport?.addedValue}`,
            projectStatus: 'New',
            brandTone: 'AI Generated',
            targetAudience: cleanCustomers ? `Base of ${cleanCustomers}` : 'New Audience',
            brandColors: blueprint.colors,
            requiredPages: blueprint.structure,
            pageContent: blueprint.tagline
        };
        onComplete(data, selectedPackage);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4 sm:p-6 w-full max-w-3xl bg-stone-900 text-white rounded-2xl border border-stone-700 relative overflow-hidden min-h-[500px] flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-purple-500 to-blue-500"></div>
                <button onClick={onClose} className="absolute top-4 left-4 text-stone-400 hover:text-white z-20"><XIcon className="w-6 h-6"/></button>

                {step === 'input_idea' && (
                    <div className="flex-grow flex flex-col justify-center items-center text-center animate-fade-in space-y-6 p-4">
                        <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center border-2 border-stone-600 mb-2">
                            <SparklesIcon className="w-8 h-8 text-amber-400" />
                        </div>
                        <h2 className="text-3xl font-bold">ایده شما چیست؟</h2>
                        <p className="text-stone-300 max-w-md">
                            برای اینکه ارزش واقعی پروژه شما را محاسبه کنیم، ابتدا به ما بگویید چه چیزی در ذهن دارید.
                        </p>
                        <textarea 
                            value={rawIdea} 
                            onChange={e => setRawIdea(e.target.value)}
                            placeholder="مثال: می‌خواهم محصولات چرمی دست‌دوز خودم را بفروشم..."
                            className="w-full max-w-lg bg-stone-800 border border-stone-600 rounded-xl p-4 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none h-32"
                        />
                        <button 
                            onClick={() => setStep('input_business_metrics')}
                            disabled={!rawIdea.trim()}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            مرحله بعد
                            <ArrowLeftIcon className="w-5 h-5"/>
                        </button>
                    </div>
                )}

                {step === 'input_business_metrics' && (
                    <div className="flex-grow flex flex-col justify-center items-center text-center animate-fade-in space-y-6 p-4">
                        <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center border-2 border-stone-600 mb-2">
                            <ChartBarIcon className="w-8 h-8 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold">معیارهای کسب‌وکار</h2>
                        <p className="text-stone-300 max-w-md text-sm">
                            این اطلاعات به هوش مصنوعی کمک می‌کند تا بازگشت سرمایه (ROI) شما را دقیق‌تر تخمین بزند. (اختیاری)
                        </p>
                        
                        <div className="w-full max-w-lg space-y-4 text-right">
                            <div>
                                <label className="text-xs text-stone-400 block mb-1">درآمد فعلی (حدودی - تومان)</label>
                                <input 
                                    type="text" 
                                    value={businessMetrics.currentRevenue} 
                                    onChange={e => setBusinessMetrics({...businessMetrics, currentRevenue: formatNumber(e.target.value)})} 
                                    className="w-full bg-stone-800 border border-stone-600 rounded-lg p-3 text-left dir-ltr" 
                                    placeholder="مثلا: ۵۰,۰۰۰,۰۰۰" 
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-stone-400 block mb-1">تعداد مشتریان فعلی</label>
                                <input 
                                    type="text" 
                                    value={businessMetrics.customerCount} 
                                    onChange={e => setBusinessMetrics({...businessMetrics, customerCount: formatNumber(e.target.value)})} 
                                    className="w-full bg-stone-800 border border-stone-600 rounded-lg p-3 text-left dir-ltr" 
                                    placeholder="مثلا: ۱۰۰" 
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-stone-400 block mb-1">هدف اصلی</label>
                                <select value={businessMetrics.goal} onChange={e => setBusinessMetrics({...businessMetrics, goal: e.target.value})} className="w-full bg-stone-800 border border-stone-600 rounded-lg p-3 text-white">
                                    <option value="increase_sales">افزایش فروش</option>
                                    <option value="brand_awareness">افزایش اعتبار برند</option>
                                    <option value="reduce_costs">کاهش هزینه‌ها (اتوماسیون)</option>
                                </select>
                            </div>
                        </div>

                        <button 
                            onClick={handleAnalyzeValue}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 px-10 rounded-full text-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
                        >
                            <SparklesIcon className="w-5 h-5"/>
                            تحلیل ارزش و پتانسیل
                        </button>
                    </div>
                )}

                {step === 'analyzing' && (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                        <div className="relative w-24 h-24 mb-6">
                            <div className="absolute inset-0 border-4 border-stone-700 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-t-green-500 rounded-full animate-spin"></div>
                            <BanknotesIcon className="absolute inset-0 m-auto w-10 h-10 text-green-400 animate-pulse"/>
                        </div>
                        <h3 className="text-2xl font-bold text-white animate-pulse">در حال محاسبه ارزش پیشنهادی...</h3>
                        <p className="text-stone-400 mt-2">تخمین درآمد، کاهش هزینه‌ها و طراحی ساختار</p>
                    </div>
                )}

                {step === 'value_proposition' && valueReport && (
                    <div className="flex-grow flex flex-col animate-fade-in p-2">
                        <h2 className="text-2xl font-bold text-center mb-6 text-white">گزارش پتانسیل پروژه شما</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-green-900/30 border border-green-600/50 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2 text-green-400">
                                    <TrendingUpIcon className="w-6 h-6" />
                                    <h3 className="font-bold">ارزش افزوده (Added Value)</h3>
                                </div>
                                <p className="text-sm text-green-100">{valueReport.addedValue}</p>
                            </div>
                            <div className="bg-blue-900/30 border border-blue-600/50 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2 text-blue-400">
                                    <ChartBarIcon className="w-6 h-6" />
                                    <h3 className="font-bold">کاهش هزینه (Cost Reduction)</h3>
                                </div>
                                <p className="text-sm text-blue-100">{valueReport.costReduction}</p>
                            </div>
                            <div className="bg-purple-900/30 border border-purple-600/50 p-4 rounded-xl md:col-span-2">
                                <div className="flex items-center gap-2 mb-2 text-purple-400">
                                    <HeartIcon className="w-6 h-6" />
                                    <h3 className="font-bold">ارزش احساسی (Emotional Value)</h3>
                                </div>
                                <p className="text-sm text-purple-100">{valueReport.emotionalContribution}</p>
                            </div>
                        </div>

                        <div className="bg-stone-800 p-4 rounded-xl border border-amber-500/30 text-center mb-6">
                            <p className="text-stone-400 text-sm uppercase tracking-widest mb-1">تخمین بازگشت سرمایه (ROI)</p>
                            <p className="text-4xl font-extrabold text-amber-400">{valueReport.estimatedROI}</p>
                            <p className="text-stone-300 text-sm mt-2 italic">"{valueReport.summary}"</p>
                        </div>

                        <div className="flex justify-end mt-auto">
                             <button 
                                onClick={() => setStep('blueprint')}
                                className="bg-white text-stone-900 font-bold py-3 px-8 rounded-full transition-all hover:bg-gray-200 flex items-center gap-2"
                            >
                                مشاهده طرح پیشنهادی
                                <ArrowLeftIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                )}

                {step === 'blueprint' && blueprint && (
                     <div className="flex-grow flex flex-col animate-fade-in p-2">
                        <h2 className="text-2xl font-bold text-center mb-6">معماری روح دیجیتال</h2>
                        
                        <div className="bg-stone-800 border border-stone-600 rounded-xl p-6 mb-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <SitemapIcon className="w-32 h-32" />
                            </div>
                            
                            <h3 className="text-3xl font-extrabold text-white mb-1">{blueprint.projectName}</h3>
                            <p className="text-amber-400 text-lg italic font-serif mb-6">"{blueprint.tagline}"</p>
                            
                            <div className="mb-4">
                                <p className="text-xs text-stone-500 uppercase mb-2">ساختار صفحات</p>
                                <div className="flex flex-wrap gap-2">
                                    {blueprint.structure.map((page, i) => (
                                        <span key={i} className="bg-stone-700 text-stone-200 px-3 py-1 rounded-md text-sm border border-stone-600">{page}</span>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <p className="text-xs text-stone-500 uppercase mb-2">پالت رنگی</p>
                                <div className="flex gap-3">
                                    {blueprint.colors.map((color, i) => (
                                        <div key={i} className="w-12 h-12 rounded-full border-2 border-white/20 shadow-lg" style={{ backgroundColor: color }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-auto">
                             <button onClick={() => setStep('value_proposition')} className="text-stone-400 hover:text-white text-sm">بازگشت به گزارش ارزش</button>
                             <button 
                                onClick={() => setStep('package_selection')}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg flex items-center gap-2"
                            >
                                انتخاب بسته و سرمایه‌گذاری
                                <ArrowLeftIcon className="w-5 h-5"/>
                            </button>
                        </div>
                     </div>
                )}

                {step === 'package_selection' && (
                     <div className="flex-grow flex flex-col animate-fade-in p-2">
                        <h2 className="text-2xl font-bold text-center mb-6">انتخاب سطح سرمایه‌گذاری</h2>
                        <p className="text-center text-stone-400 mb-6 text-sm">با توجه به تحلیل ارزش، بسته مناسب خود را انتخاب کنید.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 overflow-y-auto max-h-[300px] pr-2">
                            {packages.map(pkg => (
                                <div 
                                    key={pkg.id} 
                                    onClick={() => setSelectedPackage(pkg)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPackage?.id === pkg.id ? 'border-green-500 bg-green-900/20' : 'border-stone-600 bg-stone-800 hover:border-stone-500'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold">{pkg.name}</h3>
                                        {valueReport?.recommendedPackageId === pkg.id && <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded-full font-bold">پیشنهاد هوشمانا</span>}
                                    </div>
                                    <p className="text-xl font-bold text-green-400 mb-2">{pkg.price.toLocaleString('fa-IR')} <span className="text-xs font-normal text-stone-400">تومان</span></p>
                                    <ul className="text-xs text-stone-400 space-y-1 list-disc list-inside">
                                        {pkg.features.slice(0, 3).map((f, i) => <li key={i}>{f}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-4 border-t border-stone-700 flex justify-between items-center">
                             <div className="text-right">
                                 <p className="text-xs text-stone-500">جمع کل:</p>
                                 <p className="text-xl font-bold text-white">{selectedPackage?.price.toLocaleString('fa-IR')} تومان</p>
                             </div>
                             <button 
                                onClick={handleSubmit}
                                disabled={!selectedPackage}
                                className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-10 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <CheckIcon className="w-5 h-5"/>
                                تایید و شروع پروژه
                            </button>
                        </div>
                     </div>
                )}
            </div>
        </Modal>
    );
};

export default WebsiteWizardModal;
