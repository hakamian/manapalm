
import React, { useMemo } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View, Product } from '../types';
import ProductCard from './ProductCard';
import { MagnifyingGlassIcon, DocumentTextIcon, ShoppingCartIcon } from './icons'; // Using local icons map

const SearchResultsView: React.FC = () => {
    const { searchQuery, products, communityPosts, user, wishlist } = useAppState();
    const dispatch = useAppDispatch();

    const onNavigate = (view: View) => dispatch({ type: 'SET_VIEW', payload: view });
    const onToggleWishlist = (productId: string) => dispatch({ type: 'TOGGLE_WISHLIST', payload: productId });
    const onAddToCart = (product: Product) => {
        dispatch({ type: 'ADD_TO_CART', payload: { product, quantity: 1 } });
        dispatch({ type: 'TOGGLE_CART', payload: true });
    };

    const results = useMemo(() => {
        if (!searchQuery || searchQuery.trim() === '') return { products: [], articles: [] };

        const lowerQuery = searchQuery.toLowerCase();

        const filteredProducts = products.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.description?.toLowerCase().includes(lowerQuery)
        );

        const filteredArticles = communityPosts.filter(p =>
            p.text.toLowerCase().includes(lowerQuery) ||
            p.authorName.toLowerCase().includes(lowerQuery)
        );

        return { products: filteredProducts, articles: filteredArticles };
    }, [searchQuery, products, communityPosts]);

    if (!searchQuery) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
                <MagnifyingGlassIcon className="w-24 h-24 text-gray-700 mb-4" />
                <h2 className="text-2xl font-bold text-gray-400">چیزی برای جستجو وارد کنید...</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white pb-20">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <MagnifyingGlassIcon className="w-8 h-8 text-green-400" />
                    نتایج جستجو: <span className="text-green-400">"{searchQuery}"</span>
                </h1>
                <p className="text-gray-400 mb-8">
                    {results.products.length + results.articles.length} نتیجه یافت شد
                </p>

                {/* Products Section */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-2 text-amber-100">
                        <ShoppingCartIcon className="w-6 h-6" />
                        محصولات ({results.products.length})
                    </h2>
                    {results.products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {results.products.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onViewDetails={() => {/* Logic to open details modal - typically handled in Shop logic but for now simple add to cart */ }}
                                    onAddToCart={onAddToCart}
                                    onToggleWishlist={onToggleWishlist}
                                    isWishlisted={wishlist.includes(product.id)}
                                    user={user}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">هیچ محصولی با این عنوان یافت نشد.</p>
                    )}
                </section>

                {/* Articles Section */}
                <section>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-2 text-blue-100">
                        <DocumentTextIcon className="w-6 h-6" />
                        پست‌های اجتماعی ({results.articles.length})
                    </h2>
                    {results.articles.length > 0 ? (
                        <div className="space-y-4">
                            {results.articles.map(post => (
                                <div key={post.id} className="bg-gray-800 p-6 rounded-lg hover:bg-gray-750 transition-colors border border-gray-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        {post.authorAvatar && <img src={post.authorAvatar} alt={post.authorName} className="w-6 h-6 rounded-full" />}
                                        <h3 className="text-md font-bold text-white">{post.authorName}</h3>
                                    </div>
                                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">{post.text}</p>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>{new Date(post.timestamp).toLocaleDateString('fa-IR')}</span>
                                        <span>❤️ {post.likes}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">هیچ پستی یافت نشد.</p>
                    )}
                </section>
            </div>
        </div>
    );
};

export default SearchResultsView;