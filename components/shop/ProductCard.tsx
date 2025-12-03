






import React, { useMemo, useState } from 'react';
import { Product, User } from '../../types';
import { HeartIcon, EyeIcon, FireIcon, SparklesIcon, ArrowDownTrayIcon, BanknotesIcon, UsersIcon } from '../icons';
import InstallmentInfo from '../InstallmentInfo';
import CrowdfundModal from '../CrowdfundModal';

interface ProductCardProps {
    product: Product;
    isWishlisted: boolean;
    onViewDetails: (product: Product) => void;
    onAddToCart: (product: Product) => void;
    onToggleWishlist: (productId: string) => void;
    user: User | null;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isWishlisted, onViewDetails, onAddToCart, onToggleWishlist, user }) => {
    const [isCrowdfundModalOpen, setIsCrowdfundModalOpen] = useState(false);
    const isLowStock = product.stock > 0 && product.stock < 5;
    const isOutOfStock = product.stock === 0;
    const isPopular = product.popularity >= 90;
    const isDigital = product.type === 'digital';
    const isExpensive = product.price >= 5000000; // Threshold for showing installment badge

    const hasBonus = useMemo(() => 
        user?.values && product.tags?.some(tag => user.values?.includes(tag)),
        [user, product]
    );

    const bonusPoints = hasBonus && product.points ? Math.round(product.points * 0.5) : 0;

    return (
        <>
            <div className={`group bg-gray-800 rounded-lg overflow-hidden shadow-lg transform relative border border-gray-700 transition-all duration-300 hover:-translate-y-2 ${isDigital ? 'hover:border-blue-500' : 'hover:border-green-500'}`}>
                {isDigital && (
                    <div className="absolute top-3 left-3 flex items-center bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-lg">
                        <ArrowDownTrayIcon className="w-4 h-4 ml-1" />
                        <span>دانلود آنی</span>
                    </div>
                )}
                {!isDigital && isLowStock && product.type !== 'upgrade' && (
                    <div className="absolute top-3 left-3 flex items-center bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-lg">
                        <FireIcon className="w-4 h-4 ml-1" />
                        <span>تعداد محدود</span>
                    </div>
                )}
                {!isDigital && !isLowStock && isPopular && product.type !== 'upgrade' && (
                    <div className="absolute top-3 left-3 flex items-center bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-lg">
                        <FireIcon className="w-4 h-4 ml-1" />
                        <span>پرفروش</span>
                    </div>
                )}
                {/* Installment Badge for High Ticket Items */}
                {!isDigital && isExpensive && (
                    <div className="absolute top-3 right-12 flex items-center bg-green-900/80 text-green-300 border border-green-500/50 text-xs font-bold px-2 py-1 rounded-full z-10 shadow-lg backdrop-blur-sm">
                        <BanknotesIcon className="w-3 h-3 ml-1" />
                        <span>خرید اقساطی</span>
                    </div>
                )}

                <div className="relative overflow-hidden">
                    <img src={product.image} alt={product.name} className={`w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105 ${isOutOfStock && !isDigital ? 'filter grayscale' : ''}`} />
                    {isOutOfStock && !isDigital && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white text-lg font-bold bg-red-600 px-4 py-2 rounded-md transform -rotate-12 shadow-lg">فروخته شد</span>
                        </div>
                    )}
                </div>
                <button 
                    onClick={() => onToggleWishlist(product.id)}
                    className={`absolute top-3 right-3 p-2 bg-black bg-opacity-50 rounded-full transition-all z-10 ${isWishlisted ? 'text-red-500' : 'text-white hover:text-red-400'} opacity-0 group-hover:opacity-100 duration-300`}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <HeartIcon filled={isWishlisted} className="w-6 h-6" />
                </button>
                <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                <div className="flex justify-between items-center mt-1">
                    <p className="text-gray-400 text-sm">{product.category}</p>
                    {isDigital && product.fileType && (
                        <span className="text-[10px] bg-gray-700 px-2 py-0.5 rounded text-gray-300">{product.fileType}</span>
                    )}
                </div>
                
                    {product.points && product.points > 0 && (
                        <div className="text-sm text-yellow-300 my-2 font-bold">
                            +{product.points.toLocaleString('fa-IR')} امتیاز
                        </div>
                    )}
                    {hasBonus && bonusPoints > 0 && (
                        <div className="my-2 p-2 bg-yellow-900/40 border border-yellow-700/50 rounded-md text-center">
                            <p className="text-sm font-bold text-yellow-300 flex items-center justify-center gap-1">
                                <SparklesIcon className="w-4 h-4" />
                                <span>امتیاز ویژه برای شما!</span>
                            </p>
                            <p className="text-xs text-yellow-200">چون ارزش‌های شما با این محصول همسوست.</p>
                            <p className="text-base font-bold text-yellow-300 mt-1">
                            +{bonusPoints.toLocaleString('fa-IR')} امتیاز بیشتر
                            </p>
                        </div>
                    )}
                <div className="flex-grow mt-4 space-y-1">
                    <div>
                        {isDigital ? (
                            <p className="text-xs font-semibold text-blue-300">ارزش افزوده دیجیتال</p>
                        ) : (
                            <p className="text-xs font-semibold text-green-300">سرمایه‌گذاری اجتماعی</p>
                        )}
                        <span className={`text-xl font-bold ${isDigital ? 'text-blue-300' : 'text-green-300'}`}>{(product.price * (isDigital ? 1 : 0.9)).toLocaleString('fa-IR')}</span>
                        <span className={`font-semibold ${isDigital ? 'text-blue-300' : 'text-green-300'}`}> تومان</span>
                    </div>
                    {!isDigital && (
                        <p className="text-xs text-gray-500">
                            (از هزینه کل: {product.price.toLocaleString('fa-IR')} تومان)
                        </p>
                    )}
                    {(product.category === 'نخل میراث' || isExpensive) && <InstallmentInfo user={user} price={product.price} />}
                    
                    {/* Crowdfunding option for expensive items */}
                    {isExpensive && (
                        <button 
                            onClick={() => setIsCrowdfundModalOpen(true)}
                            className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 w-full justify-center bg-purple-900/20 py-1 rounded border border-purple-500/30"
                        >
                            <UsersIcon className="w-3 h-3" /> خرید گروهی (هدیه)
                        </button>
                    )}
                </div>
                <div className="flex justify-end items-center mt-4">
                    <div className="flex items-center space-x-1 space-x-reverse flex-shrink-0">
                        <button onClick={() => onViewDetails(product)} className="p-2 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white transition-colors" aria-label="مشاهده جزئیات"><EyeIcon className="w-5 h-5" /></button>
                        <button onClick={() => onAddToCart(product)} className={`py-2 px-3 text-sm rounded-md font-semibold transition-colors ${!isOutOfStock || isDigital ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`} disabled={isOutOfStock && !isDigital}>
                            {product.category === 'نخل میراث' ? 'انتخاب نیت' : isDigital ? 'خرید و دانلود' : 'افزودن'}
                        </button>
                    </div>
                </div>
                </div>
            </div>

            <CrowdfundModal 
                isOpen={isCrowdfundModalOpen}
                onClose={() => setIsCrowdfundModalOpen(false)}
                product={product}
            />
        </>
    );
};

export default ProductCard;
