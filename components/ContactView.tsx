import React, { useState } from 'react';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, XIcon, InstagramIcon, LinkedInIcon, TelegramIcon, YouTubeIcon, WhatsAppIcon, BaleIcon, EitaaIcon, SparklesIcon, PencilSquareIcon } from './icons';
import MapComponent from './MapComponent';
import { getAIAssistedText } from '../services/geminiService';

const ContactView: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [formErrors, setFormErrors] = useState({ email: '' });
    const [isMessageAIAssistLoading, setIsMessageAIAssistLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'email') {
            validateEmail(value);
        }
    };

    const validateEmail = (email: string) => {
        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            setFormErrors(prev => ({ ...prev, email: 'لطفاً یک ایمیل معتبر وارد کنید.' }));
        } else {
            setFormErrors(prev => ({ ...prev, email: '' }));
        }
    };

    const handleMessageAIAssist = async (mode: 'generate' | 'improve') => {
        setIsMessageAIAssistLoading(true);
        try {
            const response = await getAIAssistedText({
                mode,
                type: 'contact_message',
                text: formData.message,
                context: formData.subject,
            });
            setFormData(prev => ({ ...prev, message: response }));
        } catch (e) {
            console.error(e);
        } finally {
            setIsMessageAIAssistLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formErrors.email) return;

        setIsSubmitting(true);
        setSubmitMessage('');
        
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitMessage('پیام شما با موفقیت ارسال شد. سپاسگزاریم!');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setSubmitMessage(''), 5000);
        }, 1500);
    };

    return (
        <div className="bg-gray-900 text-white pt-22 pb-24">
            {/* Hero Section */}
            <div className="relative pb-20 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/contact-us-bg/1920/1080')" }}>
                <div className="absolute inset-0 bg-black bg-opacity-70"></div>
                <div className="relative container mx-auto px-6 text-center z-10">
                    <h1 className="text-5xl font-bold mb-4">در ارتباط باشید</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        ما همیشه برای شنیدن نظرات، پیشنهادات و سوالات شما آماده‌ایم. از یکی از راه‌های زیر با ما در تماس باشید.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Left Column: Contact Info & Map */}
                    <div className="space-y-10">
                        <div>
                            <h2 className="text-3xl font-bold text-green-400 mb-6">اطلاعات تماس</h2>
                            <div className="space-y-6">
                                <div className="flex items-start space-x-reverse space-x-4">
                                    <div className="bg-gray-800 p-3 rounded-full text-green-400 mt-1"><MapPinIcon /></div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-white">آدرس</h3>
                                        <p className="text-gray-300">ایران، استان بوشهر، شهرستان دشتستان، نخلستان معنا</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-reverse space-x-4">
                                    <div className="bg-gray-800 p-3 rounded-full text-green-400 mt-1"><EnvelopeIcon /></div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-white">ایمیل</h3>
                                        <a href="mailto:info@nakhlestanmana.com" className="text-gray-300 hover:text-green-300 transition-colors">info@nakhlestanmana.com</a>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-reverse space-x-4">
                                    <div className="bg-gray-800 p-3 rounded-full text-green-400 mt-1"><PhoneIcon /></div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-white">تلفن تماس (پشتیبانی)</h3>
                                        <p className="text-gray-300" dir="ltr">۰۹۱۲ ۳۴۵ ۶۷۸۹</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                             <h3 className="text-2xl font-bold text-green-400 mb-4">شبکه‌های اجتماعی</h3>
                             <div className="flex flex-wrap gap-5">
                                <a href="#" className="text-gray-400 hover:text-white" aria-label="X (Twitter)"><XIcon /></a>
                                <a href="#" className="text-gray-400 hover:text-white" aria-label="Instagram"><InstagramIcon /></a>
                                <a href="#" className="text-gray-400 hover:text-white" aria-label="LinkedIn"><LinkedInIcon /></a>
                                <a href="#" className="text-gray-400 hover:text-white" aria-label="YouTube"><YouTubeIcon /></a>
                                <a href="#" className="text-gray-400 hover:text-white" aria-label="Telegram"><TelegramIcon /></a>
                                <a href="#" className="text-gray-400 hover:text-white" aria-label="WhatsApp"><WhatsAppIcon /></a>
                                <a href="#" className="text-gray-400 hover:text-white" aria-label="Bale"><BaleIcon /></a>
                                <a href="#" className="text-gray-400 hover:text-white" aria-label="Eitaa"><EitaaIcon /></a>
                            </div>
                        </div>
                        
                        <div>
                             <h3 className="text-2xl font-bold text-green-400 mb-4">موقعیت ما</h3>
                             <div className="rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700">
                                <MapComponent />
                             </div>
                        </div>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
                        <h2 className="text-3xl font-bold mb-6">برای ما پیام بگذارید</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">نام و نام خانوادگی</label>
                                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                             <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">ایمیل</label>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={`w-full bg-gray-700 border rounded-md p-3 focus:outline-none focus:ring-2 ${formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-green-500'}`} />
                                {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
                            </div>
                             <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">موضوع</label>
                                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-300">پیام شما</label>
                                     <button 
                                        type="button" 
                                        onClick={() => handleMessageAIAssist(formData.message ? 'improve' : 'generate')} 
                                        disabled={isMessageAIAssistLoading} 
                                        className="flex items-center gap-1 text-xs py-1 px-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white disabled:bg-gray-500" title="کمک گرفتن از هوشمانا">
                                        <SparklesIcon className="w-4 h-4"/>
                                        <span>{formData.message ? 'بهبود با هوشمانا' : 'کمک از هوشمانا'}</span>
                                    </button>
                                </div>
                                <textarea id="message" name="message" rows={5} value={formData.message} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500"></textarea>
                            </div>
                            <div>
                                <button type="submit" disabled={isSubmitting || !!formErrors.email} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 rounded-md transition-colors flex items-center justify-center">
                                    {isSubmitting && (
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {isSubmitting ? 'در حال ارسال...' : 'ارسال پیام'}
                                </button>
                            </div>
                             {submitMessage && (
                                <div className="text-center p-3 rounded-md bg-green-900/50 text-green-300">
                                    {submitMessage}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactView;