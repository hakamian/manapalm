import React from 'react';
import { User, Product } from '../../types';
import { ClockIcon, EyeIcon } from '../icons';
import ProductCard from '../../src/features/shop/components/ProductCard';

interface RecentViewsTabProps {
    user: User;
    products: Product[];
    onNavigate: (view: any) => void;
    onAddToCart: (product: Product) => void;
    onToggleWishlist: (productId: string) => void;
}

const RecentViewsTab: React.FC<RecentViewsTabProps> = ({ user, products, onNavigate, onAddToCart, onToggleWishlist }) => {
    // Fallback to empty array if undefined
    const recentViewIds = user.recentViews || [];

    // Filter products to find the ones in recent views, preserving order (reverse for most recent first)
    // Actually, assume recentViews is stored as [oldest, ..., newest], so reverse it.
    const reversedIds = [...recentViewIds].reverse();

    const recentProducts = reversedIds
        .map(id => products.find(p => p.id === id))
        .filter((p): p is Product => p !== undefined);

    return (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <ClockIcon className="w-6 h-6 text-green-400" />
                    بازدیدهای اخیر
                </h2>
                <span className="text-sm text-gray-400">
                    {recentProducts.length} کالا
                </span>
            </div>

            {recentProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            isWishlisted={false} // Would need wishlist state passed or checked
                            onViewDetails={() => onNavigate('shop')} // Ideally navigate to specific product
                            onAddToCart={onAddToCart}
                            onToggleWishlist={onToggleWishlist}
                            user={user}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <EyeIcon className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400 mb-2">لیست بازدیدهای اخیر شما خالی است.</p>
                    <p className="text-sm text-gray-500">از فروشگاه دیدن کنید تا محصولات اینجا نمایش داده شوند.</p>
                    <button
                        onClick={() => onNavigate('shop')}
                        className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        مشاهده فروشگاه
                    </button>
                </div>
            )}
        </div>
    );
};

export default RecentViewsTab;
