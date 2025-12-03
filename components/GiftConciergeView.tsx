
import React, { useState, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View, Product } from '../types';
import { SparklesIcon, GiftIcon, ArrowLeftIcon, HeartIcon, UserCircleIcon, CalendarDaysIcon, PencilSquareIcon, CheckCircleIcon } from './icons';
import { getGiftRecommendation } from '../services/geminiService';
import ProductCard from './shop/ProductCard';

const GiftConciergeView: React.FC = () => {
    const { products, wishlist, user } = useAppState();
    const dispatch = useAppDispatch();
    
    const [relation, setRelation] = useState('');
    const [occasion, setOccasion] = useState('');
    const [description, setDescription] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ recommendedProduct: Product | undefined, reasoning: string, suggestedMessage: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Filter only Palm Heritage products for recommendations
    const palmProducts = products.filter(p => p.category === 'نخل میراث');

    const handleGetSuggestion = async () => {
        if (!relation || !occasion || !description) {
            setError('لطفاً تمام فیلدها را پر کنید.');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const recommendation = await getGiftRecommendation(
                { relation, occasion, description },
                palmProducts.map(p => ({ id: p.id, name: p.name, description: p.description, tags: p.tags }))
            );

            const product = products.find(p => p.id === recommendation.recommendedProductId);
            
            if (product) {
                setResult({
                    recommendedProduct: product,
                    reasoning: recommendation.reasoning,
                    suggestedMessage: recommendation.suggestedMessage
                });
            } else {
                setError('محصول پیشنهادی یافت نشد.');
            }
        } catch (err) {
            console.error(err);
            setError('خطا در دریافت پیشنهاد. لطفاً دوباره تلاش کنید.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (result && result.recommendedProduct) {
            const deedDetails = {
                intention: result.recommendedProduct.name,
                name: 'گیرنده هدیه', // Placeholder, user can edit in cart
                message: result.suggestedMessage,
                fromName: user?.fullName || '',
            };
            
            // We use SELECT_PALM_FOR_DEED logic but adapt it since we already have the message
            // Or we can add directly to cart. Let's use the standard add to cart for simplicity
            // but pass deedDetails.
            dispatch({ 
                type: 'ADD_TO_CART', 
                payload: { 
                    product: result.recommendedProduct, 
                    quantity: 1, 
                    deedDetails: deedDetails 
                } 
            });
            dispatch({ type: 'TOGGLE_CART', payload: true });
        }
    };

    return (
        <div className="bg-gray-900 text-white pt-22 pb-24 min-h-screen">
            <div className="container mx-auto px-6 max-w-4xl">
                <button onClick={() => dispatch({ type: 'SET_VIEW', payload: View.Shop })} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8">
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>بازگشت به فروشگاه</span>
                </button>

                <header className="text-center mb-12">
                    <div className="inline-block p-4 bg-gray-800 rounded-full mb-4 border-2 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                        <GiftIcon className="w-12 h-12 text-amber-400" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">مشاور هوشمند هدیه</h1>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                        نمی‌دانید کدام نخل برای عزیزتان مناسب‌تر است؟ به من بگویید برای چه کسی و چه مناسبتی هدیه می‌خواهید، تا بهترین گزینه را همراه با یک متن تقدیمی زیبا به شما پیشنهاد دهم.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Form Section */}
                    <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <SparklesIcon className="w-6 h-6 text-blue-400" />
                            مشخصات هدیه
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    <UserCircleIcon className="w-4 h-4"/> نسبت با شما
                                </label>
                                <input 
                                    type="text" 
                                    value={relation} 
                                    onChange={e => setRelation(e.target.value)} 
                                    placeholder="مثلاً: مادر، بهترین دوست، همکار" 
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    <CalendarDaysIcon className="w-4 h-4"/> مناسبت
                                </label>
                                <input 
                                    type="text" 
                                    value={occasion} 
                                    onChange={e => setOccasion(e.target.value)} 
                                    placeholder="مثلاً: تولد، تشکر، یادبود، شروع کار جدید" 
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    <HeartIcon className="w-4 h-4"/> ویژگی‌های شخصیتی / علایق
                                </label>
                                <textarea 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)} 
                                    rows={4}
                                    placeholder="مثلاً: عاشق طبیعت است، به شعر علاقه دارد، فردی بسیار مهربان و حامی است..." 
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                                />
                            </div>
                            
                            <button 
                                onClick={handleGetSuggestion} 
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        در حال تفکر...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-5 h-5" />
                                        دریافت پیشنهاد هوشمند
                                    </>
                                )}
                            </button>
                            {error && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg">{error}</p>}
                        </div>
                    </div>

                    {/* Result Section */}
                    <div className="space-y-6">
                        {!result && !isLoading && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-700 rounded-2xl">
                                <GiftIcon className="w-16 h-16 text-gray-600 mb-4" />
                                <p className="text-gray-400">منتظر دریافت اطلاعات برای پیشنهاد بهترین هدیه...</p>
                            </div>
                        )}
                        
                        {result && result.recommendedProduct && (
                            <div className="animate-fade-in space-y-6">
                                <div className="bg-green-900/30 border border-green-700/50 p-6 rounded-2xl">
                                    <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                                        <SparklesIcon className="w-5 h-5"/> چرا این نخل؟
                                    </h3>
                                    <p className="text-gray-200 text-sm leading-relaxed italic">"{result.reasoning}"</p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4">پیشنهاد ما برای شما:</h3>
                                    <ProductCard 
                                        product={result.recommendedProduct} 
                                        isWishlisted={wishlist.includes(result.recommendedProduct.id)} 
                                        onViewDetails={() => {}} // No details needed here really
                                        onAddToCart={handleAddToCart}
                                        onToggleWishlist={(productId) => dispatch({ type: 'TOGGLE_WISHLIST', payload: productId })}
                                        user={user}
                                    />
                                </div>

                                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                        <PencilSquareIcon className="w-5 h-5 text-amber-400"/> پیام پیشنهادی برای کارت هدیه
                                    </h3>
                                    <blockquote className="text-gray-300 italic border-r-4 border-amber-500 pr-4 py-2 bg-gray-700/30 rounded-r-md">
                                        "{result.suggestedMessage}"
                                    </blockquote>
                                    <button 
                                        onClick={() => {navigator.clipboard.writeText(result.suggestedMessage); alert('متن کپی شد!')}}
                                        className="mt-4 text-xs text-gray-400 hover:text-white flex items-center gap-1"
                                    >
                                        <CheckCircleIcon className="w-4 h-4" /> کپی متن
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GiftConciergeView;