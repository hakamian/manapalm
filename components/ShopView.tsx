




import React, { useState, useEffect, useMemo } from 'react';
import { HeartIcon, ShareIcon, EyeIcon, XMarkIcon, SparklesIcon, FireIcon, Squares2x2Icon, Bars3Icon, CloudIcon, LockClosedIcon, CheckCircleIcon, MagnifyingGlassIcon, GiftIcon, ArrowLeftIcon } from './icons';
import { Product, User, View } from '../types';
import { useAppState, useAppDispatch } from '../AppContext';
import { getPersonalizedProductRecommendations, getAIAssistedText } from '../services/geminiService';
import { canPurchaseMeaningPalm } from '../services/gamificationService';
import InstallmentInfo from './InstallmentInfo';
import ProductDetailModal from './ProductDetailModal';
import ProductCard from './shop/ProductCard';
import CountdownTimer from './CountdownTimer';

const categories = ['همه', 'نخل میراث', 'محصولات دیجیتال', 'محصولات خرما', 'صنایع دستی', 'ارتقا'];
const MAX_PRICE = 40000000;

const RecSkeletonCard = () => (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg p-4 animate-pulse w-64 flex-shrink-0">
        <div className="bg-gray-700 h-40 rounded-md"></div>
        <div className="mt-4">
            <div className="bg-gray-700 h-4 w-3/4 rounded"></div>
            <div className="bg-gray-700 h-3 w-1/2 rounded mt-2"></div>
        </div>
    </div>
);

const ShopView: React.FC = () => {
  const { user, wishlist, products } = useAppState();
  const dispatch = useAppDispatch();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [generatingDescriptionId, setGeneratingDescriptionId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('همه');
  const [selectedIntention, setSelectedIntention] = useState('all');
  const [priceRange, setPriceRange] = useState(MAX_PRICE);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');
  const [dateFilter, setDateFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [personalizedRecs, setPersonalizedRecs] = useState<Product[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  // Scarcity Timer Target (Tomorrow midnight)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 0);
  const specialOfferDate = tomorrow.toISOString();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (user && products.length > 0) {
        setIsLoadingRecs(true);
        try {
          const recs = await getPersonalizedProductRecommendations(user, products);
          setPersonalizedRecs(recs);
        } catch (error) {
          console.error("Failed to fetch recommendations:", error);
          setPersonalizedRecs([]);
        } finally {
          setIsLoadingRecs(false);
        }
      }
    };
    fetchRecommendations();
  }, [user, products]);

  const onAddToCart = (product: Product, quantity: number = 1, deedDetails?: any, paymentPlan?: any) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity, deedDetails, paymentPlan } });
  };

  const handleAddToCart = (product: Product) => {
    if (product.category === 'نخل میراث') {
        dispatch({ type: 'SELECT_PALM_FOR_DEED', payload: product as any });
    } else {
        onAddToCart(product);
    }
  };


  useEffect(() => {
    let tempProducts = [...products];
    if (selectedCategory !== 'همه') tempProducts = tempProducts.filter(p => p.category === selectedCategory);
    if (selectedCategory === 'نخل میراث' && selectedIntention !== 'all') tempProducts = tempProducts.filter(p => p.id.includes(`p_heritage_${selectedIntention}`));
    if (inStockOnly) tempProducts = tempProducts.filter(p => p.stock > 0);
    if (wishlistOnly) tempProducts = tempProducts.filter(p => wishlist.includes(p.id));
    if (dateFilter !== 'all') {
        const daysToSubtract = dateFilter === '7days' ? 7 : 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(new Date().getDate() - daysToSubtract);
        tempProducts = tempProducts.filter(p => new Date(p.dateAdded) >= cutoffDate);
    }
    if (searchQuery) {
        tempProducts = tempProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    tempProducts = tempProducts.filter(p => p.price <= priceRange);
    tempProducts.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'newest': return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        default: return b.popularity - a.popularity;
      }
    });
    setFilteredProducts(tempProducts);
  }, [products, selectedCategory, priceRange, inStockOnly, sortBy, wishlist, wishlistOnly, dateFilter, selectedIntention, searchQuery]);
  
  const handleGenerateDescription = async (productId: string) => {
    if (!selectedProduct || selectedProduct.id !== productId) return;

    setGeneratingDescriptionId(productId);
    try {
        const newDesc = await getAIAssistedText({
            mode: 'improve',
            type: 'product_description',
            text: selectedProduct.description,
            context: selectedProduct.name,
        });
        setSelectedProduct(prev => prev ? { ...prev, description: newDesc } : null);
    } catch (e) {
        console.error("Failed to generate description:", e);
    } finally {
        setGeneratingDescriptionId(null);
    }
  };

  return (
    <div className="pt-22 pb-24 min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-12">
        
        {/* Special Offer Banner with Timer */}
        <div className="mb-8 bg-gradient-to-r from-red-900/80 to-orange-900/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between border border-red-500/30 shadow-lg relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="flex items-center gap-4 relative z-10 mb-3 md:mb-0">
                <div className="bg-red-500/20 p-3 rounded-full animate-pulse">
                    <FireIcon className="w-8 h-8 text-red-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">پیشنهاد ویژه محدود!</h3>
                    <p className="text-sm text-red-200">امتیاز دوبرابر برای تمام محصولات دیجیتال</p>
                </div>
            </div>
            <div className="relative z-10">
                <CountdownTimer targetDate={specialOfferDate} label="فرصت باقی‌مانده" size="md" />
            </div>
        </div>

        <h1 className="text-4xl font-bold mb-4 text-center">فروشگاه نخلستان معنا</h1>
        <p className="text-lg text-gray-400 mb-10 text-center max-w-3xl mx-auto">
            محصولات ما، از دل نخلستان و با دستان هنرمندان محلی، داستانی از برکت و اصالت را برای شما به ارمغان می‌آورند.
        </p>

        {/* Gift Concierge Banner */}
        <div className="mb-10 bg-gradient-to-r from-pink-900/40 to-purple-900/40 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between border border-pink-500/30 shadow-lg">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="bg-pink-500/20 p-3 rounded-full">
                    <GiftIcon className="w-8 h-8 text-pink-300" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-pink-200">نمی‌دانید چه هدیه‌ای بخرید؟</h3>
                    <p className="text-sm text-gray-300 mt-1">از مشاور هوشمند ما بپرسید تا بهترین نخل را با یک متن زیبا به شما پیشنهاد دهد.</p>
                </div>
            </div>
            <button 
                onClick={() => dispatch({ type: 'SET_VIEW', payload: View.GiftConcierge })}
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-full shadow-md flex items-center gap-2 transition-all transform hover:scale-105"
            >
                <SparklesIcon className="w-5 h-5"/>
                مشاوره هوشمند هدیه
            </button>
        </div>

        {/* Monthly Subscription Card */}
        <section className="mb-16 bg-gradient-to-br from-gray-800 via-gray-800 to-green-900/40 p-8 rounded-2xl border-2 border-green-700/60 shadow-lg text-center">
            <h2 className="text-3xl font-bold mb-4 text-green-300">اشتراک ماهانه معنا</h2>
            <p className="text-gray-300 max-w-xl mx-auto mb-6">
                با حمایت ماهانه، به صورت مستمر در این جنبش سهیم باشید. هر ماه در کاشت یک نخل عمومی مشارکت کنید، امتیاز معنا دریافت کنید و نشان ویژه «حامی ماهانه» را در پروفایل خود داشته باشید.
            </p>
            {user?.isMonthlySubscriber ? (
                <div className="flex items-center justify-center gap-2 text-lg font-semibold text-white bg-green-900/50 py-3 px-6 rounded-full border border-green-600">
                    <CheckCircleIcon className="w-6 h-6 text-green-400" />
                    <span>شما حامی ماهانه هستید. از همراهی شما سپاسگزاریم!</span>
                </div>
            ) : (
                <button 
                    onClick={() => {
                        if (user) {
                            dispatch({ type: 'SUBSCRIBE_MONTHLY' });
                        } else {
                            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
                        }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-md"
                >
                    عضویت و حمایت ماهانه
                </button>
            )}
        </section>

        {(isLoadingRecs || personalizedRecs.length > 0) && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <SparklesIcon className="w-7 h-7 text-yellow-300" />
              پیشنهادهای هوشمند برای شما
            </h2>
            <div className="flex overflow-x-auto space-x-reverse space-x-6 pb-4 -mx-6 px-6 custom-scrollbar">
              {isLoadingRecs ? (
                [...Array(4)].map((_, i) => <RecSkeletonCard key={i} />)
              ) : (
                personalizedRecs.map(product => (
                  <div key={product.id} className="w-64 flex-shrink-0">
                    <ProductCard 
                      product={product} 
                      isWishlisted={wishlist.includes(product.id)} 
                      onViewDetails={setSelectedProduct} 
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={(productId) => dispatch({ type: 'TOGGLE_WISHLIST', payload: productId })}
                      user={user}
                    />
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-grow max-w-md">
                 <input
                    type="text"
                    placeholder="جستجو..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${selectedCategory === cat ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
                if (product.id === 'p_heritage_meaning' && !canPurchaseMeaningPalm(user)) {
                    return (
                        <div key={product.id} className="group bg-gray-800 rounded-lg overflow-hidden shadow-lg transform relative border border-gray-700">
                            <div className="relative overflow-hidden grayscale">
                                <img src={product.image} alt={product.name} className="w-full h-56 object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <LockClosedIcon className="w-16 h-16 text-white/70" />
                                </div>
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="text-lg font-semibold text-gray-400">{product.name}</h3>
                                <p className="text-gray-500 text-sm mt-1">{product.category}</p>
                                {/* Disabled points and price */}
                                {product.points && product.points > 0 && (
                                    <div className="text-sm text-yellow-300/50 my-2">
                                        +{product.points.toLocaleString('fa-IR')} امتیاز
                                    </div>
                                )}
                                <div className="flex-grow mt-4 space-y-1 opacity-50">
                                    <div>
                                        <p className="text-xs font-semibold text-green-300">سرمایه‌گذاری اجتماعی</p>
                                        <span className="text-xl font-bold text-green-300">{(product.price * 0.9).toLocaleString('fa-IR')}</span>
                                        <span className="font-semibold text-green-300"> تومان</span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        (از هزینه کل: {product.price.toLocaleString('fa-IR')} تومان)
                                    </p>
                                </div>
                                <p className="text-sm text-amber-300/70 my-2">یک دستاورد ارزشمند در انتظار شماست.</p>
                                <div className="flex justify-end items-center mt-2">
                                    <button onClick={() => dispatch({ type: 'TOGGLE_MEANING_PALM_ACTIVATION_MODAL', payload: true })} className="py-2 px-3 text-sm rounded-md font-semibold transition-colors bg-amber-600 hover:bg-amber-700 text-white">
                                        مشاهده مسیر فعال‌سازی
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                }
                return (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        isWishlisted={wishlist.includes(product.id)} 
                        onViewDetails={setSelectedProduct} 
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={(productId) => dispatch({ type: 'TOGGLE_WISHLIST', payload: productId })}
                        user={user}
                    />
                )
            })}
        </div>

        {selectedProduct && 
            <ProductDetailModal 
                product={selectedProduct} 
                user={user}
                allProducts={products}
                onClose={() => setSelectedProduct(null)} 
                onAddToCart={handleAddToCart}
                onGenerateDescription={handleGenerateDescription}
                isGenerating={generatingDescriptionId === selectedProduct.id}
                onSelectSimilar={setSelectedProduct}
            />
        }
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
      `}</style>
    </div>
  );
};

export default ShopView;
