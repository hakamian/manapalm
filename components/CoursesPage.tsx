import React, { useState } from 'react';
// FIX: Changed BarChartIcon to ChartBarIcon as it's the correct name in icons.tsx.
import { ChevronDownIcon, ClockIcon, ChartBarIcon, UsersIcon } from './icons';

// --- Mock Data ---
const mockCourses = [
  {
    id: 'c1',
    title: 'کوچینگ معنا: سفر قهرمانی خود را آغاز کنید',
    shortDescription: 'یک دوره جامع برای کشف معنای شخصی و حرفه‌ای در زندگی با رویکردی عملی.',
    longDescription: 'در این دوره، شما با استفاده از ابزارهای کوچینگ و هوش مصنوعی، نقشه راه شخصی خود را برای رسیدن به اهداف معنادار ترسیم خواهید کرد. ما به شما کمک می‌کنیم تا ارزش‌های اصلی خود را شناسایی کرده و زندگی‌ای هماهنگ با آن‌ها بسازید.',
    instructor: { name: 'دکتر علی حسینی', bio: 'کوچ حرفه‌ای با ۱۰ سال سابقه در توانمندسازی فردی و سازمانی.' },
    syllabus: ['مقدمه: معنا چیست؟', 'ابزارشناسی: چرخ زندگی و تحلیل SWOT', 'هدف‌گذاری مبتنی بر ارزش', 'ساخت عادت‌های پایدار', 'استفاده از AI برای رشد فردی'],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Placeholder video
  },
  {
    id: 'c2',
    title: 'راه اندازی کسب و کار با هوش مصنوعی',
    shortDescription: 'از ایده تا اجرا؛ کسب‌وکار خود را با قدرت ابزارهای هوش مصنوعی نسل جدید بسازید.',
    longDescription: 'این دوره یک راهنمای قدم به قدم برای کارآفرینان است. شما یاد می‌گیرید چگونه ایده‌های خود را اعتبارسنجی کنید، طرح تجاری بنویسید، محصولات اولیه بسازید و بازاریابی کنید، همه اینها با کمک هوش مصنوعی.',
    instructor: { name: 'مهندس سارا محمدی', bio: 'کارآفرین سریالی و متخصص استراتژی‌های کسب‌وکار دیجیتال.' },
    syllabus: ['ایده‌پردازی و تحقیقات بازار با AI', 'ساخت MVP بدون کدنویسی', 'بازاریابی محتوا با ابزارهای AI', 'اتوماسیون فرآیندهای فروش', 'تحلیل داده‌ها و تصمیم‌گیری'],
    videoUrl: 'https://www.youtube.com/embed/s_L-Vd_agqg' // Placeholder video
  },
    {
    id: 'c3',
    title: 'مهندسی پرامپت برای متخصصان',
    shortDescription: 'یاد بگیرید چگونه با مدل‌های زبانی بزرگ به طور موثر ارتباط برقرار کرده و بهترین نتایج را بگیرید.',
    longDescription: 'این دوره عمیق به شما هنر و علم نوشتن پرامپت‌های موثر را آموزش می‌دهد. از تکنیک‌های پایه‌ای تا روش‌های پیشرفته مانند Chain-of-Thought و Tree-of-Thought، شما به یک متخصص در تعامل با هوش مصنوعی تبدیل خواهید شد.',
    instructor: { name: 'تیم نخلستان معنا', bio: 'متخصصان هوش مصنوعی با تجربه در پیاده‌سازی مدل‌های Gemini.' },
    syllabus: ['مبانی مدل‌های زبانی بزرگ', 'تکنیک Zero-shot و Few-shot', 'پرامپت نویسی برای وظایف خلاقانه', 'پرامپت نویسی برای تحلیل و استدلال', 'عیب‌یابی و بهینه‌سازی پرامپت‌ها'],
    videoUrl: 'https://www.youtube.com/embed/6_p_p_n5I24' // Placeholder video
  },
];

// --- Helper Components ---
const CourseDetail: React.FC<{ course: typeof mockCourses[0] }> = ({ course }) => (
    <div className="p-6 bg-gray-800 border-t border-gray-700 animate-fade-in">
        <p className="text-gray-300 leading-relaxed mb-6">{course.longDescription}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
                <h4 className="text-xl font-semibold text-green-400 mb-3">سرفصل‌های دوره</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                    {course.syllabus.map(item => <li key={item}>{item}</li>)}
                </ul>
            </div>
            <div>
                <h4 className="text-xl font-semibold text-green-400 mb-3">درباره مدرس</h4>
                <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="font-bold text-white">{course.instructor.name}</p>
                    <p className="text-sm text-gray-400">{course.instructor.bio}</p>
                </div>

                <div className="mt-6">
                    <h4 className="text-xl font-semibold text-green-400 mb-3">پیش‌نمایش دوره</h4>
                    <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
                         <iframe 
                            src={course.videoUrl} 
                            title={`Preview for ${course.title}`}
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition-colors">
            ثبت نام در دوره
        </button>
    </div>
);


// --- Main View Component ---
const CoursesView: React.FC = () => {
    const [courses] = useState(mockCourses);
    const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

    const handleToggleCourse = (courseId: string) => {
        setExpandedCourseId(prevId => (prevId === courseId ? null : courseId));
    };

    return (
         <div className="min-h-screen bg-gray-900 text-white">
             <style>
                {`
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
             </style>
            <div className="container mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold mb-2 text-center">دوره‌های آموزشی</h1>
                <p className="text-lg text-gray-400 mb-10 text-center max-w-3xl mx-auto">
                    با دوره‌های تخصصی ما، دانش خود را در زمینه کوچینگ، کسب‌وکار و هوش مصنوعی به سطح بالاتری ببرید.
                </p>
                
                <div className="max-w-4xl mx-auto space-y-4">
                    {courses.map(course => (
                        <div key={course.id} className="bg-gray-800 rounded-lg overflow-hidden transition-shadow shadow-md hover:shadow-xl">
                            <button 
                                onClick={() => handleToggleCourse(course.id)} 
                                className="w-full text-right p-6 flex justify-between items-center hover:bg-gray-700 transition-colors"
                                aria-expanded={expandedCourseId === course.id}
                                aria-controls={`course-content-${course.id}`}
                            >
                                <div>
                                    <h3 className="text-xl font-semibold text-white">{course.title}</h3>
                                    <p className="text-gray-400 mt-1">{course.shortDescription}</p>
                                </div>
                                <span className={`transform transition-transform duration-300 ${expandedCourseId === course.id ? 'rotate-180' : ''}`}>
                                    <ChevronDownIcon />
                                </span>
                            </button>
                            {expandedCourseId === course.id && (
                               <section id={`course-content-${course.id}`}>
                                  <CourseDetail course={course} />
                               </section>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CoursesView;
