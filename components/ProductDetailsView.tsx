'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState, useAppDispatch } from '../AppContext';
import { Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { ShoppingCartIcon, ArrowRightIcon, SparklesIcon, CheckCircleIcon, ShareIcon } from './icons';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface ProductDetailsViewProps {
    productId: string;
}

export default function ProductDetailsView({ productId }: ProductDetailsViewProps) {
    const { products, palmTypes } = useAppState();
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (products.length > 0) {
            const found = products.find(p => p.id === productId);
            if (found) {
                setProduct(found);
            }
            setLoading(false);
        }
    }, [products, productId]);

    const handleAddToCart = () => {
        if (!product) return;

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

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('لینک کپی شد');
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-[#020617] pt-32 px-4 text-center">
                <h1 className="text-2xl text-white font-bold mb-4">محصول مورد نظر یافت نشد</h1>
                <button
                    onClick={() => router.push('/shop')}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2 mx-auto"
                >
                    <ArrowRightIcon className="w-4 h-4" />
                    بازگشت به فروشگاه
                </button>
            </div>
        );
    }

    const imageSrc = product.image || (product as any).imageUrl;

    return (
        <div className="min-h-screen bg-[#020617] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Breadcrumb & Back */}
                <div className="flex items-center gap-4 mb-8 text-sm text-gray-400">
                    <button onClick={() => router.back()} className="hover:text-white transition-colors flex items-center gap-1">
                        <ArrowRightIcon className="w-4 h-4 ml-1" />
                        بازگشت
                    </button>
                    <span>/</span>
                    <button onClick={() => router.push('/shop')} className="hover:text-white transition-colors">فروشگاه</button>
                    <span>/</span>
                    <span className="text-emerald-400">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Image Section */}
                    <div className="space-y-6">
                        <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-gray-900 group">
                            {imageSrc && (
                                <Image
                                    src={imageSrc}
                                    alt={product.name}
                                    fill
                                    priority
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            )}
                            <div className="absolute top-4 right-4">
                                <span className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium border border-white/10">
                                    {product.category}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col">
                        <div className="mb-8">
                            <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">{product.name}</h1>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-4xl font-bold text-emerald-400">
                                    {product.price === 0 ? 'رایگان' : formatPrice(product.price)}
                                    <span className="text-lg text-emerald-500/70 font-normal mr-2">تومان</span>
                                </span>
                                {product.points ? (
                                    <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-lg text-sm border border-amber-500/20">
                                        +{formatPrice(product.points)} امتیاز
                                    </span>
                                ) : null}
                            </div>
                            <p className="text-gray-400 text-lg leading-relaxed mb-6">
                                {product.description}
                            </p>
                        </div>

                        {/* Botanical/Extra Info */}
                        {product.botanicalInfo && (
                            <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
                                <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                                    <SparklesIcon className="w-5 h-5" />
                                    اطلاعات تکمیلی
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-gray-400">نام علمی</span>
                                        <span className="text-white italic dir-ltr">{product.botanicalInfo.scientificName}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-gray-400">منشا</span>
                                        <span className="text-white">{product.botanicalInfo.origin}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Cultural Significance */}
                        {product.culturalSignificance && (
                            <div className="bg-gradient-to-r from-emerald-900/20 to-transparent rounded-2xl p-6 mb-8 border-r-4 border-emerald-500">
                                <h4 className="text-white font-bold mb-2">ریشه در فرهنگ</h4>
                                <p className="text-sm text-gray-300 leading-relaxed italic">
                                    "{product.culturalSignificance}"
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 flex items-center justify-center gap-3 text-lg"
                            >
                                <ShoppingCartIcon className="w-6 h-6" />
                                {product.category === 'نخل میراث' ? 'انتخاب و کاشت نخل' : 'افزودن به سبد خرید'}
                            </button>
                            <button
                                onClick={handleShare}
                                className="bg-white/5 hover:bg-white/10 text-white p-4 rounded-2xl border border-white/10 transition-colors"
                                title="اشتراک گذاری"
                            >
                                <ShareIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5 opacity-70">
                            <div className="text-center">
                                <div className="bg-white/5 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <SparklesIcon className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span className="text-xs text-gray-400 block">اصالت تضمینی</span>
                            </div>
                            <div className="text-center">
                                <div className="bg-white/5 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span className="text-xs text-gray-400 block">تاثیر مستقیم</span>
                            </div>
                            <div className="text-center">
                                <div className="bg-white/5 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <div className="w-5 h-5 border-2 border-emerald-400 rounded-full"></div>
                                </div>
                                <span className="text-xs text-gray-400 block">پشتیبانی کامل</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
