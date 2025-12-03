import React, { useState, useMemo } from 'react';
import { Article } from '../types';

// --- Mock Data ---
const mockArticles: Article[] = [
    {
        id: 'a1', title: '۵ روش نوین برای آبیاری نخلستان‌ها', author: 'دکتر علی رضایی', date: '۱۴۰۳/۰۵/۱۰', category: 'کشاورزی پایدار', image: 'https://picsum.photos/seed/irrigation/800/600',
        excerpt: 'با افزایش بحران آب، استفاده از روش‌های نوین آبیاری نه تنها یک انتخاب، بلکه یک ضرورت است. در این مقاله به بررسی ۵ تکنیک پیشرفته می‌پردازیم که می‌تواند مصرف آب را تا ۷۰٪ کاهش دهد.',
        content: 'متن کامل مقاله در اینجا قرار می‌گیرد. یکی از این روش‌ها آبیاری قطره‌ای زیرسطحی است که مستقیماً آب را به ریشه گیاه می‌رساند و از تبخیر جلوگیری می‌کند. روش دیگر استفاده از سنسورهای رطوبت خاک برای بهینه‌سازی زمان آبیاری است. این سنسورها به ما کمک می‌کنند تا فقط در صورت نیاز واقعی گیاه، آبیاری را انجام دهیم.', type: 'official', likes: 125, authorImage: 'https://i.pravatar.cc/150?u=ali-rezaei'
    },
    {
        id: 'a2', title: 'چگونه مدل Gemini به کسب‌وکارهای اجتماعی کمک می‌کند؟', author: 'مهندس سارا محمدی', date: '۱۴۰۳/۰۵/۰۸', category: 'هوش مصنوعی', image: 'https://picsum.photos/seed/gemini-social/800/600',
        excerpt: 'هوش مصنوعی دیگر تنها در انحصار شرکت‌های بزرگ نیست. مدل‌های قدرتمندی مانند Gemini می‌توانند به کسب‌وکارهای اجتماعی در بازاریابی، مدیریت و تحلیل داده‌ها کمک شایانی کنند.',
        content: 'در این مقاله، به بررسی کاربردهای عملی مدل Gemini برای سازمان‌های غیرانتفاعی و کسب‌وکارهای اجتماعی می‌پردازیم. از تولید محتوای جذاب برای کمپین‌های جذب سرمایه گرفته تا تحلیل بازخورد مشتریان برای بهبود خدمات، Gemini می‌تواند به عنوان یک همکار هوشمند و خستگی‌ناپذیر عمل کند. ما موارد مطالعاتی واقعی را بررسی می‌کنیم.', type: 'official', likes: 210, authorImage: 'https://i.pravatar.cc/150?u=sara-mohammadi'
    },
     {
        id: 'cs1', title: 'داستان نخل من: هدیه‌ای برای پدربزرگ', author: 'مریم صالحی', date: '۱۴۰۳/۰۵/۰۷', category: 'داستان جامعه', image: 'https://picsum.photos/seed/grandpa-story/800/600',
        excerpt: 'وقتی به دنبال هدیه‌ای متفاوت برای تولد ۸۰ سالگی پدربزرگم بودم، با نخلستان معنا آشنا شدم. کاشت یک نخل به نام او، بهترین راه برای قدردانی از ریشه‌های محکمی بود که به ما داده است.',
        content: 'متن کامل داستان در اینجا قرار می‌گیرد...', type: 'community', likes: 350, authorImage: 'https://i.pravatar.cc/150?u=maryam-salehi'
    },
    {
        id: 'a3', title: 'داستان نخلستان معنا: از یک ایده تا یک جنبش', author: 'تیم نخلستان معنا', date: '۱۴۰۳/۰۵/۰۵', category: 'کسب و کار اجتماعی', image: 'https://picsum.photos/seed/our-story/800/600',
        excerpt: 'سفری از دل یک نیت خیرخواهانه برای کاشت یک نخل تا ایجاد یک اکوسیستم پایدار که زندگی ده‌ها خانواده را متحول کرده و به محیط زیست جانی دوباره بخشیده است.',
        content: 'متن کامل مقاله در اینجا قرار می‌گیرد...', type: 'official', likes: 180, authorImage: 'https://picsum.photos/seed/nakhlestan-logo/40/40'
    },
    {
        id: 'cs2', title: 'یک نخل برای یک عادت: ۳۰ روز بدون سیگار', author: 'رضا قاسمی', date: '۱۴۰۳/۰۵/۰۳', category: 'داستان جامعه', image: 'https://picsum.photos/seed/habit-story/800/600',
        excerpt: 'تصمیم گرفتم به ازای هر ماه که سیگار را ترک می‌کنم، یک نخل بکارم. امروز اولین ماه تمام شد و اولین نخلم را کاشتم. این نخل نماد اراده و شروع یک زندگی جدید برای من است.',
        content: 'متن کامل داستان در اینجا قرار می‌گیرد...', type: 'community', likes: 421, authorImage: 'https://i.pravatar.cc/150?u=reza-ghasemi'
    },
    {
        id: 'a4', title: 'خرما: فراتر از یک میوه، یک سبک زندگی سالم', author: 'مریم حسینی', date: '۱۴۰۳/۰۵/۰۲', category: 'سبک زندگی', image: 'https://picsum.photos/seed/date-lifestyle/800/600',
        excerpt: 'خرما، این طلای شیرین جنوب، سرشار از مواد مغذی است. بیاموزید چگونه این میوه پرانرژی را در رژیم غذایی روزانه خود بگنجانید.',
        content: 'متن کامل مقاله در اینجا قرار می‌گیرد...', type: 'official', likes: 95, authorImage: 'https://i.pravatar.cc/150?u=maryam-hosseini'
    },
     {
        id: 'a5', title: 'نقش کشاورزی ارگانیک در حفظ تنوع زیستی', author: 'دکتر علی رضایی', date: '۱۴۰۳/۰۴/۲۸', category: 'کشاورزی پایدار', image: 'https://picsum.photos/seed/organic-farming/800/600',
        excerpt: 'کشاورزی ارگانیک تنها به معنای عدم استفاده از سموم شیمیایی نیست، بلکه رویکردی جامع برای احیای خاک، حفظ گونه‌های جانوری و ساختن آینده‌ای سالم‌تر برای سیاره ما است.',
        content: 'متن کامل مقاله در اینجا قرار می‌گیرد...', type: 'official', likes: 140, authorImage: 'https://i.pravatar.cc/150?u=ali-rezaei'
    },
     {
        id: 'a6', title: 'کوچینگ معنا: چگونه هدف واقعی خود را در زندگی پیدا کنیم؟', author: 'مهندس سارا محمدی', date: '۱۴۰۳/۰۴/۲۵', category: 'سبک زندگی', image: 'https://picsum.photos/seed/coaching-meaning/800/600',
        excerpt: 'در دنیای پرشتاب امروز، بسیاری از ما احساس گم‌گشتگی می‌کنیم. کوچینگ معنا به شما کمک می‌کند تا با شناخت ارزش‌های درونی خود، قطب‌نمای زندگی‌تان را پیدا کرده و در مسیر درست حرکت کنید.',
        content: 'متن کامل مقاله در اینجا قرار می‌گیرد...', type: 'official', likes: 195, authorImage: 'https://i.pravatar.cc/150?u=sara-mohammadi'
    }
];

const categories: ('همه' | Article['category'])[] = ['همه', 'کشاورزی پایدار', 'کسب و کار اجتماعی', 'هوش مصنوعی', 'سبک زندگی', 'داستان جامعه'];

const ITEMS_PER_PAGE = 4;

// --- Helper Components ---

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:-translate-y-2 border border-gray-700 hover:border-green-500 group">
        <div className="overflow-hidden">
            <img src={article.image} alt={article.title} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
        <div className="p-6">
            <p className="text-sm text-green-400 mb-2">{article.category}</p>
            <h3 className="text-xl font-bold text-white mb-3 h-16">{article.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4 h-24 overflow-hidden">{article.excerpt}</p>
            <div className="border-t border-gray-700 pt-4 flex justify-between items-center text-xs text-gray-500">
                <span>نویسنده: {article.author}</span>
                <span>{article.date}</span>
            </div>
        </div>
    </div>
);

const FeaturedArticleCard: React.FC<{ article: Article }> = ({ article }) => (
    <div className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden md:flex border border-gray-700 group">
        <div className="md:w-1/2">
             <img src={article.image} alt={article.title} className="w-full h-64 md:h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
            <p className="text-sm text-green-400 mb-2 uppercase font-semibold tracking-wider">مقاله ویژه</p>
            <h2 className="text-3xl font-bold text-white mb-4">{article.title}</h2>
            <p className="text-gray-300 leading-relaxed mb-6">{article.excerpt}</p>
            <div className="text-sm text-gray-500">
                <span>نویسنده: {article.author}</span>
                <span className="mx-2">|</span>
                <span>{article.date}</span>
            </div>
             <button className="mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md transition-colors self-start">
                ادامه مطلب
            </button>
        </div>
    </div>
);


// --- Main View Component ---

const ArticlesView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'همه' | Article['category']>('همه');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredArticles = useMemo(() => {
        return mockArticles
            .filter(article => {
                const categoryMatch = selectedCategory === 'همه' || article.category === selectedCategory;
                if (!categoryMatch) return false;

                const term = searchTerm.toLowerCase().trim();
                if (!term) return true;

                const titleMatch = article.title.toLowerCase().includes(term);
                const excerptMatch = article.excerpt.toLowerCase().includes(term);
                const contentMatch = article.content ? article.content.toLowerCase().includes(term) : false;

                return titleMatch || excerptMatch || contentMatch;
            });
    }, [searchTerm, selectedCategory]);
    
    const featuredArticle = filteredArticles[0];
    const paginatedArticles = filteredArticles.slice(1); // Exclude the featured one
    
    const totalPages = Math.ceil(paginatedArticles.length / ITEMS_PER_PAGE);
    const currentArticles = paginatedArticles.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };


    return (
        <div className="min-h-screen bg-gray-900 text-white pt-22 pb-24">
            {/* Hero Section */}
            <div className="py-16 text-center bg-gray-800/50">
                <h1 className="text-5xl font-bold mb-4">مقالات و دانش</h1>
                <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                    کاوشی عمیق در دنیای کشاورزی پایدار، کسب‌وکارهای اجتماعی، و فناوری‌های نوین برای ساختن آینده‌ای بهتر.
                </p>
            </div>
            
            <div className="container mx-auto px-6 py-12">
                {/* Filters and Search */}
                <div className="mb-10">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="جستجو در مقالات..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setSelectedCategory(cat);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${selectedCategory === cat ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {filteredArticles.length > 0 ? (
                    <>
                        {/* Featured Article */}
                        <div className="mb-12">
                            <FeaturedArticleCard article={featuredArticle} />
                        </div>
                        
                        {/* Articles Grid */}
                        {currentArticles.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {currentArticles.map(article => (
                                    <ArticleCard key={article.id} article={article} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-12 space-x-reverse space-x-4">
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="bg-gray-700 hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors"
                                >
                                    بعدی
                                </button>
                                <span className="text-gray-400">
                                    صفحه {currentPage} از {totalPages}
                                </span>
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className="bg-gray-700 hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors"
                                >
                                    قبلی
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 bg-gray-800 rounded-lg">
                        <h2 className="text-2xl font-bold mb-4">مقاله ای یافت نشد</h2>
                        <p className="text-gray-400">با معیارهای جستجوی شما مقاله‌ای پیدا نکردیم. لطفاً فیلترها را تغییر دهید.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticlesView;