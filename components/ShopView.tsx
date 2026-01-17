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



                {/* Anatomy of Meaning Infographic */}

                <div className="mb-16 max-w-4xl mx-auto">

                    <InfographicOverlay

                        imageSrc="https://images.unsplash.com/photo-1597466599360-3b9775841aec?q=80&w=1200&auto=format&fit=crop"

                        alt="Anatomy of a Meaningful Palm"

                        hotspots={[

                            { id: 'a1', x: 50, y: 85, title: 'ریشه‌ها: ارزش‌ها', description: 'تاریخ و اصالت', align: 'center' },

                            { id: 'a2', x: 50, y: 50, title: 'تنه: استقامت', description: 'رشد و پایداری', align: 'center' },

                            { id: 'a3', x: 80, y: 25, title: 'برگ‌ها: بخشش', description: 'سخاوت و سایه‌گستری', align: 'left' },

                            { id: 'a4', x: 20, y: 35, title: 'میوه: اثرگذاری', description: 'خیریه و تاثیر اجتماعی', align: 'right' },

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