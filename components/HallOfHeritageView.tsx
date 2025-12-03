import React, { useRef } from 'react';
import { useAppDispatch, useAppState } from '../AppContext';
import { SproutIcon, WandSparklesIcon, ShoppingCartIcon, CheckCircleIcon } from './icons';
import { Deed } from '../types';
import DeedDisplay from './DeedDisplay';

const AnimatedPalmTree = () => (
    <div className="w-32 h-48 mx-auto my-8" aria-hidden="true">
        <svg viewBox="0 0 100 150" className="w-full h-full">
            <style>
                {`
                .palm-trunk { animation: grow-trunk 2s ease-out forwards; transform-origin: bottom center; }
                .palm-leaf { opacity: 0; transform-origin: bottom center; animation: unfurl-leaf 1.5s ease-out forwards; }
                .leaf-1 { animation-delay: 1.5s; } .leaf-2 { animation-delay: 1.7s; } .leaf-3 { animation-delay: 1.9s; }
                .leaf-4 { animation-delay: 1.6s; } .leaf-5 { animation-delay: 1.8s; } .leaf-6 { animation-delay: 2.0s; }
                @keyframes grow-trunk { from { transform: scaleY(0); } to { transform: scaleY(1); } }
                @keyframes unfurl-leaf { from { opacity: 0; transform: rotate(-35deg) scale(0.2); } to { opacity: 1; transform: rotate(0) scale(1); } }
                `}
            </style>
            <path d="M 50 150 C 55 100, 45 50, 50 30 L 50 30 C 55 50, 45 100, 50 150" fill="#a0522d" className="palm-trunk" />
            <g transform="translate(50, 35)">
                <path d="M 0 0 C 20 -20, 40 -10, 50 5" fill="#228B22" className="palm-leaf leaf-1" transform="rotate(-20)" />
                <path d="M 0 0 C 25 -15, 45 -5, 55 10" fill="#2E8B57" className="palm-leaf leaf-2" transform="rotate(10)" />
                <path d="M 0 0 C 20 -10, 35 0, 45 15" fill="#3CB371" className="palm-leaf leaf-3" transform="rotate(40)" />
                <path d="M 0 0 C -20 -20, -40 -10, -50 5" fill="#228B22" className="palm-leaf leaf-4" transform="rotate(20)" />
                <path d="M 0 0 C -25 -15, -45 -5, -55 10" fill="#2E8B57" className="palm-leaf leaf-5" transform="rotate(-10)" />
                <path d="M 0 0 C -20 -10, -35 0, -45 15" fill="#3CB371" className="palm-leaf leaf-6" transform="rotate(-40)" />
            </g>
        </svg>
    </div>
);

const PlantingProgressBar = () => {
    const steps = [
        { name: 'انتخاب نیت', icon: <SproutIcon className="w-6 h-6" /> },
        { name: 'شخصی‌سازی سند', icon: <WandSparklesIcon className="w-6 h-6" /> },
        { name: 'افزودن به سبد', icon: <ShoppingCartIcon /> },
        { name: 'تایید پرداخت', icon: <CheckCircleIcon className="w-6 h-6" /> }
    ];
    return (
        <div className="my-20 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">مراحل کاشت نخل شما</h2>
            <div className="flex items-start justify-between relative px-4 md:px-0">
                <div className="absolute top-6 left-0 w-full h-1 bg-gray-700 -translate-y-1/2"></div>
                {steps.map((step, index) => (
                    <div key={step.name} className="relative z-10 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-green-600 border-4 border-gray-900 flex items-center justify-center font-bold text-white">
                            {step.icon}
                        </div>
                        <p className="mt-3 text-sm font-semibold text-gray-300 w-24 text-center">{step.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


const HallOfHeritageView: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppState();
    const onStartPlantingFlow = () => dispatch({ type: 'START_PLANTING_FLOW' });
    
    const sampleDeed: Deed = user
        ? {
            id: 'نمونه-۱۲۳۴۵',
            // FIX: The 'productId' property was missing and is required by the 'Deed' type.
            productId: 'p_heritage_meaning',
            intention: '[نیت زیبای شما]',
            name: user.fullName || user.name,
            date: new Date().toISOString(),
            palmType: 'معنا',
            message: '[پیام دلخواه شما در اینجا نمایش داده می‌شود]',
          }
        : {
            id: 'نمونه-۱۲۳۴۵',
            // FIX: The 'productId' property was missing and is required by the 'Deed' type.
            productId: 'p_heritage_meaning',
            intention: '[نیت شما]',
            name: '[نام شما]',
            date: new Date().toISOString(),
            palmType: 'معنا',
            message: '[پیام دلخواه شما در اینجا نمایش داده می‌شود]',
          };

    return (
        <div className="bg-gray-900 text-white min-h-screen pt-12 pb-16">
            <style>{`.animate-fade-in-slide { animation: fadeInSlide 1s ease-out forwards; } @keyframes fadeInSlide { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            <div className="container mx-auto px-6 text-center">
                <h1 className="text-5xl font-bold text-green-400 mb-4">میراث خود را بکارید</h1>
                <p className="text-xl max-w-3xl mx-auto text-gray-300 mb-8">هر نخل، یک داستان است. داستانی از یادبود، قدردانی، آرزو، یا یک شروع تازه. با کاشت یک نخل، شما ریشه‌های یک میراث زنده و پایدار را در دل زمین محکم می‌کنید.</p>
                <AnimatedPalmTree />
                
                <div className="my-8 animate-fade-in-slide mx-auto" style={{ animationDelay: '2.5s', opacity: 0, maxWidth: '448px' }}>
                    <DeedDisplay deed={sampleDeed} />
                </div>

                <PlantingProgressBar />

                <div className="mt-20">
                    <h2 className="text-3xl font-bold mb-4">آیا برای ساختن میراث خود آماده‌اید؟</h2>
                    <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">یک تصمیم، یک نیت، و یک نخل. همین حالا اولین قدم را برای ثبت داستان خود در دل طبیعت بردارید.</p>
                    <button onClick={onStartPlantingFlow} className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-full text-xl transition-transform transform hover:scale-105 shadow-lg">
                        {user ? 'اقدام برای مالکیت این سند' : 'اقدام برای کاشت نخل'}
                    </button>
                </div>
                <div className="my-24">
                    <h2 className="text-4xl font-bold text-green-400 mb-12">چرا نخل؟</h2>
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-right">
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg"><h3 className="text-2xl font-semibold text-green-400 mb-3">استقامت و ماندگاری</h3><p className="text-gray-400 leading-relaxed">نخل نماد مقاومت در برابر شرایط سخت و عمر طولانی است. کاشت آن، به معنای ایجاد میراثی پایدار و جاودانه است.</p></div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg"><h3 className="text-2xl font-semibold text-yellow-400 mb-3">برکت و بخشندگی</h3><p className="text-gray-400 leading-relaxed">نخل با ثمره‌ی شیرین و سایه‌ی گسترده‌اش، نماد سخاوت و برکت است. هدیه‌ای که همواره می‌بخشد.</p></div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg"><h3 className="text-2xl font-semibold text-blue-400 mb-3">رشد و سربلندی</h3><p className="text-gray-400 leading-relaxed">نخل همواره رو به آسمان قد می‌کشد و نماد رشد، پیروزی و تعالی روح است. نشانه‌ای از امید به آینده.</p></div>
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg"><h3 className="text-2xl font-semibold text-indigo-400 mb-3">ریشه‌های عمیق</h3><p className="text-gray-400 leading-relaxed">ریشه‌های قدرتمند نخل، نماد ارتباط عمیق با اصل و نسب، خانواده و سرزمین مادری است.</p></div>
                    </div>
                </div>
                <div className="mt-24">
                    <h2 className="text-4xl font-bold text-green-400 mb-10">داستان‌هایی از نخلستان</h2>
                    <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 transform hover:-translate-y-2 transition-transform"><p className="text-gray-300 italic leading-relaxed">"کاشت نخل به یاد پدرم، بهترین راه برای زنده نگه داشتن خاطراتش بود. هر بار که به آن فکر می‌کنم، حس می‌کنم ریشه‌هایش در قلب من هم رشد می‌کنند."</p><p className="mt-4 font-bold text-green-300">- سارا احمدی</p></div>
                         <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 transform hover:-translate-y-2 transition-transform"><p className="text-gray-300 italic leading-relaxed">"برای اولین سالگرد ازدواجمان یک نخل هدیه گرفتیم. حالا این نخل نماد عشق ماست که همراه با ما رشد می‌کند و به ثمر می‌نشیند. بی‌نظیره!"</p><p className="mt-4 font-bold text-green-300">- علی و مریم</p></div>
                         <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 transform hover:-translate-y-2 transition-transform"><p className="text-gray-300 italic leading-relaxed">"به عنوان یک شرکت، برای کارمندان نمونه نخل کاشتیم. این حرکت تأثیر فوق‌العاده‌ای در روحیه تیم داشت و یک هدیه معنادار و ماندگار بود."</p><p className="mt-4 font-bold text-green-300">- مدیرعامل شرکت پیشرو</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HallOfHeritageView;
