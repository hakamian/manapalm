import React from 'react';
import TeamView from './TeamView';
import { View } from '../types';
import { useAppDispatch } from '../AppContext';

const AboutView: React.FC = () => {
    const dispatch = useAppDispatch();
    const onNavigate = (view: View) => dispatch({ type: 'SET_VIEW', payload: view });
    const onStartPlantingFlow = () => dispatch({ type: 'START_PLANTING_FLOW' });

    return (
        <div className="bg-gray-900 text-white pt-22 pb-24">
            {/* Hero Section */}
            <div className="relative pb-20 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/palm-grove-sun/1920/1080')" }}>
                <div className="absolute inset-0 bg-black bg-opacity-70"></div>
                <div className="relative container mx-auto px-6 text-center">
                    <h1 className="text-5xl font-bold mb-4">داستان ما: ریشه‌ها در خاک، نگاه به آینده</h1>
                    <p className="text-xl max-w-3xl mx-auto mb-12">
                        ما باور داریم که هر دانه می‌تواند جنگلی را بسازد و هر انسان می‌تواند معنایی عمیق در زندگی خود و دیگران بکارد.
                    </p>
                    <img 
                        src="https://picsum.photos/seed/thriving-grove/1200/500" 
                        alt="A thriving palm grove under a hopeful sky"
                        className="rounded-lg shadow-2xl w-full max-w-5xl mx-auto object-cover h-auto"
                    />
                </div>
            </div>

            <div className="container mx-auto px-6 py-16">
                {/* Mission and Vision */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                    <div>
                        <h2 className="text-4xl font-bold text-green-400 mb-4">رسالت ما</h2>
                        <p className="text-lg text-gray-300 leading-relaxed">
                            رسالت ما در «نخلستان معنا» توانمندسازی جوامع محلی از طریق کشاورزی پایدار و ایجاد کسب‌وکارهای اجتماعی است. ما با کاشت هر نخل، نه تنها به مقابله با بیابان‌zwnj;زایی و احیای محیط زیست کمک میzwnj;کنیم، بلکه فرصتzwnj;های شغلی معنادار ایجاد کرده و به اقتصاد منطقه جانی دوباره میzwnj;بخشیم. ما به دنبال ساختن پلی هستیم میان سنتzwnj;های غنی کشاورزی و نوآوریzwnj;های امروزی تا آیندهzwnj;ای سبزتر و پربارتر برای نسلzwnj;های بعد بسازیم.
                        </p>
                    </div>
                    <div className="flex justify-center">
                         <img src="https://picsum.photos/seed/community-hands/500/500" alt="Our Mission" className="rounded-lg shadow-2xl object-cover w-full h-80" />
                    </div>
                </div>

                {/* Values Section */}
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold mb-10">ارزش‌های ما</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                            <h3 className="text-2xl font-semibold text-green-400 mb-3">معنا و هدف</h3>
                            <p className="text-gray-400">هر نخل نمادی از یک نیت، یک خاطره یا یک هدف است. ما به قدرت داستان‌ها و معنابخشی به زندگی ایمان داریم.</p>
                        </div>
                        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                            <h3 className="text-2xl font-semibold text-green-400 mb-3">پایداری و مسئولیت</h3>
                            <p className="text-gray-400">ما به حفظ محیط زیست و توسعه پایدار متعهد هستیم و در تمام فرآیندها، ردپای مثبتی از خود به جا می‌گذاریم.</p>
                        </div>
                        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                            <h3 className="text-2xl font-semibold text-green-400 mb-3">مشارکت و جامعه</h3>
                            <p className="text-gray-400">ما یک خانواده‌ایم؛ از کشاورزان و کارکنان تا شما که با ما همراه هستید. رشد ما در گرو رشد جامعه است.</p>
                        </div>
                    </div>
                </div>

                {/* Impact Section */}
                 <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-10">تأثیر ما تا امروز</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <p className="text-4xl font-bold text-green-400">۱۵۰۰+</p>
                            <p className="text-gray-400 mt-2">نخل کاشته شده</p>
                        </div>
                         <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <p className="text-4xl font-bold text-green-400">۵۰+</p>
                            <p className="text-gray-400 mt-2">خانواده بهره‌مند</p>
                        </div>
                         <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <p className="text-4xl font-bold text-green-400">۱۰ هکتار</p>
                            <p className="text-gray-400 mt-2">زمین احیا شده</p>
                        </div>
                         <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <p className="text-4xl font-bold text-green-400">۵</p>
                            <p className="text-gray-400 mt-2">محصول جدید</p>
                        </div>
                    </div>
                     <div className="mt-12">
                        <button onClick={onStartPlantingFlow} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-110 shadow-[0_5px_15px_rgba(74,222,128,0.4)]">
                            شما هم در این تاثیر سهیم شوید
                        </button>
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <TeamView />
        </div>
    );
};

export default React.memo(AboutView);