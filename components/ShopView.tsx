'use client';

import React from 'react';

import { useAppState, useAppDispatch } from '../AppContext';

import ProductCard from './ProductCard';

import { Product } from '../types';

import InfographicOverlay from './ui/InfographicOverlay';

const ShopView: React.FC = () => {
    const { products } = useAppState();
    const dispatch = useAppDispatch();

    const handleAddToCart = (product: Product) => {
        dispatch({ type: 'ADD_TO_CART', payload: { product, quantity: 1 } });
        dispatch({ type: 'TOGGLE_CART', payload: true });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        فروشگاه نخلستان
                    </h1>
                    <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">

                        انتخاب کنید، بکارید و جاودانه شوید.

                    </p>

                </div>



                {/* Cycle of Impact Infographic */}
                <div className="mb-16 max-w-md mx-auto">
                    <InfographicOverlay
                        imageSrc="https://res.cloudinary.com/dk2x11rvs/image/upload/v1768908658/Gemini_Generated_Image_mpvjtqmpvjtqmpvj_vup9c0.png"
                        alt="The Cycle of Impact - anatomy of a meaningful palm"
                        hotspots={[
                            { id: 'i1', x: 50, y: 85, title: 'ریشه: نیت و معنا', description: 'خرید شما با نیت شخصی آغاز می‌شود و معنا می‌آفریند.', align: 'center' },
                            { id: 'i2', x: 65, y: 75, title: 'ریشه: مهار فرسایش خاک', description: 'ریشه‌های نخل از بیابان‌زایی و فرسایش خاک جلوگیری می‌کنند.', align: 'left' },
                            { id: 'i3', x: 50, y: 55, title: 'تنه: کاشت درخت نخل', description: 'هر خرید منجر به کاشت یک نخل واقعی در مناطق محروم می‌شود.', align: 'center' },
                            { id: 'i4', x: 35, y: 45, title: 'برگ: کمک به محیط زیست', description: 'نخل‌های شما دی‌اکسید کربن را جذب و اکسیژن تولید می‌کنند.', align: 'right' },
                            { id: 'i5', x: 65, y: 25, title: 'ثمر: سلامت و تغذیه', description: 'محصول نخل‌های شما به تامین سلامت و معیشت جامعه کمک می‌کند.', align: 'left' },
                            { id: 'i6', x: 50, y: 10, title: 'هاله: میراث جاودان', description: 'نام و اثر شما برای نسل‌های آینده ماندگار می‌شود.', align: 'center' },
                        ]}
                    />
                </div>



                <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">

                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={handleAddToCart}
                        />
                    ))}
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