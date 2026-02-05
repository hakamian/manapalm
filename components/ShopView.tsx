'use client';

import React from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import ProductCard from './ProductCard';
import { Product } from '../types';
import InfographicOverlay from './ui/InfographicOverlay';
import { BreadcrumbSchema } from './seo/SchemaMarkup';

const ShopView: React.FC = () => {
    const { products, palmTypes } = useAppState();
    const dispatch = useAppDispatch();

    const organicProducts = products.filter(p => p.category === 'محصولات ارگانیک');
    const heritageProducts = products.filter(p => p.category === 'نخل میراث');

    const handleAddToCart = (product: Product) => {
        if (product.category === 'نخل میراث' || product.type === 'heritage') {
            const palmType = palmTypes.find(pt => pt.id === product.id) || {
                id: product.id,
                name: product.name,
                description: product.description || '',
                price: product.price,
                points: product.points || 0,
                image: product.image,
                tags: []
            } as any;
            dispatch({ type: 'SELECT_PALM_FOR_DEED', payload: palmType });
        } else {
            dispatch({ type: 'ADD_TO_CART', payload: { product, quantity: 1 } });
            dispatch({ type: 'TOGGLE_CART', payload: true });
        }
    };

    // SEO: Product List Schema (JSON-LD)
    const productSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": products.map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Product",
                "name": product.name,
                "description": product.description,
                "image": product.image || (product as any).imageUrl,
                "offers": {
                    "@type": "Offer",
                    "price": product.price,
                    "priceCurrency": "IRR",
                    "availability": "https://schema.org/InStock"
                }
            }
        }))
    };

    return (
        <div className="min-h-screen bg-[#020617] py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorative Glows */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px]"></div>
            </div>

            <BreadcrumbSchema
                items={[
                    { name: 'خانه', item: '/' },
                    { name: 'فروشگاه', item: '/shop' }
                ]}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight">
                        فروشگاه <span className="text-emerald-400">نخلستان</span>
                    </h1>
                    <p className="max-w-2xl mt-5 mx-auto text-xl text-gray-400 font-light leading-relaxed">
                        محصولاتی با طعم اصالت و بوی معنا. از خرید خرما ارگانیک تا کاشت نخلی جاودان به نام شما.
                    </p>
                </div>

                {/* Section 1: Organic Products (SEO Target) */}
                <div id="organic" className="mb-24">
                    <div className="flex items-center gap-4 mb-10 border-r-4 border-emerald-500 pr-6">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white">محصولات ارگانیک ماناپالم</h2>
                            <p className="text-gray-500 mt-1">خرید مستقیم از نخلستان‌های تحت پوشش مسئولیت اجتماعی</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-8 lg:grid-cols-4">
                        {organicProducts.length > 0 ? (
                            organicProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500 italic">در حال تامین محصولات ارگانیک فصل...</p>
                        )}
                    </div>
                </div>

                {/* Impact Infographic */}
                <div className="mb-24 p-8 md:p-16 rounded-[3rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="text-right">
                            <span className="text-emerald-400 font-bold tracking-widest uppercase text-sm mb-4 block">چرخه برکت</span>
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight">با هر سفارش، شما بخشی از این <span className="text-emerald-400">تغییر</span> هستید</h2>
                            <ul className="space-y-6 text-right">
                                {[
                                    { t: 'تضمین اصالت', d: 'تمام محصولات ۱۰۰٪ ارگانیک و دارای تاییدیه سلامت هستند.' },
                                    { t: 'پایداری معیشت', d: 'سود حاصل مستقیماً به کشاورزان و توسعه روستاها می‌رسد.' },
                                    { t: 'توسعه معنا', d: 'بخشی از درآمد صرف پروژه‌های کاشت نخل معنا می‌شود.' }
                                ].map((item, idx) => (
                                    <li key={idx} className="flex gap-4 items-start flex-row-reverse">
                                        <div className="flex-grow">
                                            <h4 className="text-white font-bold mb-1">{item.t}</h4>
                                            <p className="text-gray-400 text-sm leading-relaxed">{item.d}</p>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex flex-shrink-0 items-center justify-center text-emerald-400 mt-1">
                                            ✓
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="max-w-md mx-auto w-full">
                            <InfographicOverlay
                                imageSrc="https://res.cloudinary.com/dk2x11rvs/image/upload/v1768908658/Gemini_Generated_Image_mpvjtqmpvjtqmpvj_vup9c0.png"
                                alt="The Cycle of Impact - anatomy of a meaningful palm"
                                hotspots={[
                                    { id: 'i1', x: 50, y: 85, title: 'ریشه: نیت و معنا', description: 'خرید شما با نیت شخصی آغاز می‌شود.', align: 'center' },
                                    { id: 'i3', x: 50, y: 55, title: 'تنه: کاشت درخت نخل', description: 'هر خرید منجر به کاشت نخل واقعی می‌شود.', align: 'center' },
                                    { id: 'i5', x: 65, y: 25, title: 'ثمر: سلامت و تغذیه', description: 'محصول نخل‌ها به معیشت جامعه کمک می‌کند.', align: 'left' },
                                    { id: 'i6', x: 50, y: 10, title: 'هاله: میراث جاودان', description: 'نام شما برای نسل‌ها ماندگار می‌شود.', align: 'center' },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Heritage Palms */}
                <div id="heritage" className="mb-24">
                    <div className="flex items-center gap-4 mb-10 border-r-4 border-amber-500 pr-6">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white">نخل‌های میراث</h2>
                            <p className="text-gray-500 mt-1">جاودانگی نام شما در دل کویر</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-8 lg:grid-cols-4">
                        {heritageProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                </div>

                {products.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">محصولی یافت نشد. لطفاً بعداً دوباره سر بزنید.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopView;