'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Article } from '../types';
import { mockArticles } from '../utils/articlesData';

const categories: ('همه' | Article['category'])[] = ['همه', 'معنا', 'کشاورزی پایدار', 'کسب و کار اجتماعی', 'هوش مصنوعی', 'سبک زندگی', 'داستان جامعه'];

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
            <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                <span>نویسنده: {article.author}</span>
                <span>{article.date}</span>
            </div>
            <Link
                href={`/articles/${article.id}`}
                className="block text-center bg-gray-700 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
                ادامه مطلب
            </Link>
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
            <Link
                href={`/articles/${article.id}`}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md transition-colors self-start"
            >
                ادامه مطلب
            </Link>
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