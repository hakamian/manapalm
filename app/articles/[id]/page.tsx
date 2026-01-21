import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { mockArticles } from '../../../utils/articlesData';
import { BreadcrumbSchema, ArticleSchema } from '../../../components/seo/SchemaMarkup';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const article = mockArticles.find(a => a.id === id);

    if (!article) return { title: 'مقاله یافت نشد' };

    return {
        title: `${article.title} | نخلستان معنا`,
        description: article.excerpt,
        alternates: {
            canonical: `https://manapalm.com/articles/${article.id}`,
        },
        openGraph: {
            title: article.title,
            description: article.excerpt,
            images: [article.image],
            type: 'article',
            publishedTime: article.date,
            authors: [article.author],
        },
    };
}

export default async function ArticlePage({ params }: PageProps) {
    const { id } = await params;
    const article = mockArticles.find(a => a.id === id);

    if (!article) {
        notFound();
    }

    const relatedArticles = mockArticles
        .filter(a => a.id !== article.id)
        .slice(0, 3);

    return (
        <article className="min-h-screen bg-gray-900 text-white pt-32 pb-24">
            <BreadcrumbSchema
                items={[
                    { name: 'خانه', item: '/' },
                    { name: 'مقالات', item: '/articles' },
                    { name: article.title, item: `/articles/${article.id}` }
                ]}
            />
            <ArticleSchema
                title={article.title}
                description={article.excerpt}
                image={article.image}
                author={article.author}
                datePublished={article.date}
                url={`https://manapalm.com/articles/${article.id}`}
            />

            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <Link
                    href="/articles"
                    className="inline-flex items-center text-emerald-400 hover:text-emerald-300 mb-8 transition-colors group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform rotate-180" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    بازگشت به مقالات
                </Link>

                {/* Hero Image */}
                <div className="relative w-full h-[400px] rounded-3xl overflow-hidden mb-12 shadow-2xl border border-white/10">
                    <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8 text-right">
                        <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">
                            {article.category}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black leading-tight text-white drop-shadow-lg">
                            {article.title}
                        </h1>
                    </div>
                </div>

                {/* Article Info */}
                <div className="flex items-center gap-4 mb-12 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500">
                        <Image
                            src={article.authorImage}
                            alt={article.author}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="text-right">
                        <p className="text-white font-bold">{article.author}</p>
                        <p className="text-gray-400 text-sm">{article.date}</p>
                    </div>
                    <div className="mr-auto hidden sm:block">
                        <div className="flex items-center gap-2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            <span>{article.likes} پسند</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="prose prose-invert prose-emerald max-w-none prose-headings:font-black prose-p:leading-relaxed prose-p:text-gray-300 prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline mb-20 whitespace-pre-wrap text-right">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            a: ({ node, ...props }) => {
                                const isInternal = props.href?.startsWith('/');
                                if (isInternal) {
                                    return <Link href={props.href as string} {...props as any} className="text-emerald-400 hover:text-emerald-300 font-bold decoration-2 underline-offset-4" />;
                                }
                                return <a {...props} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-bold underline" />;
                            }
                        }}
                    >
                        {article.content}
                    </ReactMarkdown>
                </div>

                {/* Related Articles */}
                <div className="border-t border-white/10 pt-16 mb-20 text-right">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                        مقالات مرتبط
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedArticles.map(rel => (
                            <Link key={rel.id} href={`/articles/${rel.id}`} className="group block">
                                <div className="relative h-48 rounded-2xl overflow-hidden mb-4 border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                                    <Image src={rel.image} alt={rel.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                    <span className="absolute bottom-3 right-3 text-[10px] bg-black/50 backdrop-blur-md px-2 py-1 rounded text-emerald-400 font-bold">
                                        {rel.category}
                                    </span>
                                </div>
                                <h3 className="font-bold text-sm leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2">
                                    {rel.title}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="mt-20 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/20 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl -z-10"></div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-6 text-white">شما هم می‌توانید در این مسیر سهمی داشته باشید</h3>
                    <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                        هر نخل که کاشته می‌شود، داستانی جدید از امید، اشتغال و معنا را در خاک جنوب آغاز می‌کند. امروز نخل خود را بکارید.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-emerald-900/40 hover:scale-105 active:scale-95 text-lg"
                    >
                        ورود به فروشگاه و کاشت نخل
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 rotate-180" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>
            </div>
        </article>
    );
}
