import React, { useState } from 'react';
import { View } from '../types';
import { useAppDispatch } from '../AppContext';
import { XIcon, InstagramIcon, LinkedInIcon, TelegramIcon, YouTubeIcon, WhatsAppIcon, BaleIcon, EitaaIcon } from './icons';

const Footer: React.FC = () => {
    const dispatch = useAppDispatch();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, view: View) => {
        e.preventDefault();
        dispatch({ type: 'SET_VIEW', payload: view });
    }

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            setMessage('لطفاً یک ایمیل معتبر وارد کنید.');
            return;
        }
        try {
            const subscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
            if (subscriptions.includes(email)) {
                setMessage('شما قبلاً مشترک شده‌اید!');
            } else {
                const updatedSubscriptions = [...subscriptions, email];
                localStorage.setItem('newsletter_subscriptions', JSON.stringify(updatedSubscriptions));
                setMessage('با تشکر! شما با موفقیت مشترک شدید.');
                setEmail('');
            }
        } catch (error) {
            console.error("Failed to subscribe:", error);
            setMessage('خطایی رخ داد. لطفاً دوباره تلاش کنید.');
        }
        setTimeout(() => setMessage(''), 4000);
    };


    return (
        <footer className="bg-gray-800 text-gray-300 border-t border-gray-700">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Column 1: About */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-xl font-bold text-white mb-4">نخلستان معنا</h3>
                        <p className="max-w-md">
                            یک کسب و کار اجتماعی که با کاشت درختان نخل، به دنبال ایجاد معنای پایدار، اشتغال‌زایی در مناطق محروم، و احیای محیط زیست است. هر نخل، داستانی از امید و رشد را روایت می‌کند.
                        </p>
                    </div>

                    {/* Column 2: Newsletter */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-1">
                         <h3 className="text-lg font-semibold text-white mb-4">خبرنامه</h3>
                         <p className="mb-4 text-sm">برای دریافت آخرین اخبار و پیشنهادها، در خبرنامه ما عضو شوید.</p>
                         <form onSubmit={handleSubscribe}>
                             <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ایمیل شما"
                                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                             />
                             <button type="submit" className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                                 عضویت
                             </button>
                             {message && <p className="text-sm mt-2 text-green-300">{message}</p>}
                         </form>
                    </div>

                    {/* Column 3: Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">دسترسی سریع</h3>
                        <ul className="space-y-2">
                            <li><a href="#" onClick={(e) => handleNav(e, View.About)} className="hover:text-green-400 transition-colors">درباره ما</a></li>
                            <li><a href="#" onClick={(e) => handleNav(e, View.HallOfHeritage)} className="hover:text-green-400 transition-colors">میراث نخل</a></li>
                            <li><a href="#" onClick={(e) => handleNav(e, View.Shop)} className="hover:text-green-400 transition-colors">فروشگاه</a></li>
                            <li><a href="#" onClick={(e) => handleNav(e, View.Articles)} className="hover:text-green-400 transition-colors">مقالات</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Contact */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">تماس با ما</h3>
                        <ul className="space-y-2">
                           <li><a href="mailto:info@nakhlestanmana.com" className="hover:text-green-400 transition-colors">info@nakhlestanmana.com</a></li>
                           <li><p>آدرس: ایران، استان بوشهر</p></li>
                        </ul>
                         <div className="flex flex-wrap gap-4 mt-6">
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
                </div>

                <div className="mt-12 border-t border-gray-700 pt-6 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} نخلستان معنا. تمام حقوق محفوظ است.</p>
                </div>
            </div>
        </footer>
    );
};

export default React.memo(Footer);
