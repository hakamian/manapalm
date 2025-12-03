
import React, { useMemo } from 'react';
import { Product, User } from '../types';
import { XMarkIcon, SparklesIcon, ArrowDownTrayIcon, LeafIcon, QuoteIcon, HandshakeIcon, BanknotesIcon } from './icons';
import InstallmentInfo from './InstallmentInfo';

interface ProductDetailModalProps {
    product: Product;
    user: User | null;
    allProducts: Product[];
    onClose: () => void;
    onAddToCart: (product: Product) => void;
    onGenerateDescription: (productId: string) => void;
    isGenerating: boolean;
    onSelectSimilar: (product: Product) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, user, allProducts, onClose, onAddToCart, onGenerateDescription, isGenerating, onSelectSimilar }) => {
    const similarProducts = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    const hasBonus = useMemo(() => 
        user?.values && product.tags?.some(tag => user.values?.includes(tag)),
        [user, product]
    );

    const bonusPoints = hasBonus && product.points ? Math.round(product.points * 0.5) : 0;
    
    // Financial Quantification (Value Proposition)
    const socialInvestment = product.price * 0.9; // 90% goes to cause
    const platformFee = product.price * 0.1;
    const jobsCreatedHours = (socialInvestment / 50000).toFixed(1); // Mock calculation: 50k per hour

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 transition-opacity" onClick={onClose}>
            <div className="bg-stone-900 text-white rounded-2xl shadow-2xl w-full max-w-4xl relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale overflow-hidden flex flex-col max-h-[90vh] border border-stone-700" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-white z-20" aria-label="Close modal">
                    <XMarkIcon />
                </button>
                
                <div className="overflow-y-auto p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Image Section */}
                        <div className="relative h-64 md:h-full min-h-[300px]">
                             <img src={product.image.replace('/400/400', '/600/600')} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent md:bg-gradient-to-r"></div>
                             <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-10">
                                <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                                    <SparklesIcon className="w-3 h-3" />
                                    <span>میراث ماندگار</span>
                                </div>
                             </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-6 md:p-8 flex flex-col">
                            <h2 className="text-3xl font-bold mb-2 text-white font-serif">{product.name}</h2>
                            <p className="text-stone-400 text-sm mb-6">{product.category}</p>

                            {/* Value Proposition Block (Quantified) */}
                            <div className="bg-gradient-to-br from-green-900/30 to-stone-800 rounded-xl p-5 border border-green-800/50 mb-6">
                                <h3 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2">
                                    <HandshakeIcon className="w-4 h-4"/>
                                    شفافیت ارزش (ROI اجتماعی)
                                </h3>
                                {/* Visual Breakdown Bar */}
                                <div className="w-full h-4 bg-stone-700 rounded-full overflow-hidden mb-3 flex">
                                    <div className="h-full bg-green-500" style={{ width: '90%' }} title="تاثیر مستقیم اجتماعی (۹۰٪)"></div>
                                    <div className="h-full bg-stone-500" style={{ width: '10%' }} title="توسعه پلتفرم (۱۰٪)"></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-stone-400 flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> سرمایه‌گذاری اجتماعی</p>
                                        <p className="text-lg font-bold text-white mt-1">{socialInvestment.toLocaleString('fa-IR')} <span className="text-xs font-normal text-stone-500">تومان</span></p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-stone-400">معادل اشتغال‌زایی</p>
                                        <p className="text-lg font-bold text-white mt-1">~{jobsCreatedHours} <span className="text-xs font-normal text-stone-500">ساعت</span></p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="prose prose-invert prose-sm text-stone-300 mb-6">
                                <p>{product.description}</p>
                            </div>

                            {product.points && product.points > 0 && (
                                <div className="flex items-center gap-2 text-sm text-amber-300 bg-amber-900/20 px-3 py-2 rounded-lg w-fit mb-6">
                                    <SparklesIcon className="w-4 h-4" />
                                    <span>پاداش معنوی: +{product.points.toLocaleString('fa-IR')} امتیاز</span>
                                </div>
                            )}

                            <div className="mt-auto space-y-3">
                                <div className="flex justify-between items-end mb-2">
                                     <span className="text-sm text-stone-400">هزینه کل</span>
                                     <span className="text-2xl font-bold text-white">{product.price.toLocaleString('fa-IR')} <span className="text-base font-normal">تومان</span></span>
                                </div>
                                
                                <button onClick={() => onAddToCart(product)} className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 ${product.stock > 0 ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`} disabled={product.stock === 0}>
                                    {product.stock > 0 ? (
                                        <>
                                            <LeafIcon className="w-5 h-5" />
                                            <span>{product.category === 'نخل میراث' ? 'شروع آیین کاشت' : 'افزودن به سبد'}</span>
                                        </>
                                    ) : 'فعلاً موجود نیست'}
                                </button>
                                {product.category === 'نخل میراث' && <InstallmentInfo user={user} price={product.price} />}
                            </div>
                        </div>
                    </div>

                    {/* Additional Info / Ritual Context */}
                    {(product.botanicalInfo || product.culturalSignificance) && (
                        <div className="bg-stone-950 p-6 md:p-8 border-t border-stone-800">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {product.botanicalInfo && (
                                    <div>
                                        <h3 className="text-lg font-bold text-stone-300 mb-3 flex items-center gap-2">
                                            <LeafIcon className="w-5 h-5 text-green-500" />
                                            شناسنامه گیاه
                                        </h3>
                                        <ul className="space-y-2 text-sm text-stone-400">
                                            <li><span className="text-stone-500">نام علمی:</span> {product.botanicalInfo.scientificName}</li>
                                            <li><span className="text-stone-500">خاستگاه:</span> {product.botanicalInfo.origin}</li>
                                            <li><span className="text-stone-500">ویژگی:</span> {product.botanicalInfo.fruitCharacteristics}</li>
                                        </ul>
                                    </div>
                                )}
                                {product.culturalSignificance && (
                                    <div>
                                        <h3 className="text-lg font-bold text-stone-300 mb-3 flex items-center gap-2">
                                            <QuoteIcon className="w-5 h-5 text-amber-500" />
                                            روح و معنا
                                        </h3>
                                        <p className="text-sm text-stone-400 leading-relaxed italic border-r-2 border-stone-700 pr-4">
                                            "{product.culturalSignificance}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
