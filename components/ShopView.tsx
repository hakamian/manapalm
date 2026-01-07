import React from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import ProductCard from './ProductCard';
import { Product } from '../types';

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