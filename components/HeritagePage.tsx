
import React, { useState, useMemo } from 'react';
import { HeritageItem, CartItem, Course } from '../types.ts';
import { heritageItems } from '../utils/heritage.ts';
import { useAppState, useAppDispatch } from '../AppContext.tsx';
import PlantingRitualModal from './PlantingRitualModal.tsx';
import { iconMap } from './icons.tsx';
import { StarIcon, HandshakeIcon, SparklesIcon, PlusIcon } from './icons.tsx';
import InstallmentModal from './InstallmentModal.tsx';

const HeritageCard: React.FC<{ item: HeritageItem; onSelect: () => void; onInstallmentSelect: () => void; }> = ({ item, onSelect, onInstallmentSelect }) => {
    const { user: currentUser } = useAppState();
    const [isHovered, setIsHovered] = useState(false);
    
    const Icon = iconMap[item.icon as keyof typeof iconMap] || iconMap.default;
    const isCommunity = item.isCommunity;

    const pointsReward = Math.floor(item.price / 1000);

    const userPurchaseCount = useMemo(() => {
        if (!currentUser) return 0;
        return currentUser.timeline?.filter(event => event.type === 'palm_planted' && event.details.id === item.id).length || 0;
    }, [currentUser, item.id]);

    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative bg-white dark:bg-stone-800/50 rounded-2xl shadow-lg border-2 border-transparent overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-${item.color}-300 dark:hover:border-${item.color}-700`}
        >
            <div className={`p-8 bg-${item.color}-50 dark:bg-${item.color}-900/20 flex-grow flex flex-col items-center justify-center text-center transition-all duration-300`}>
                <Icon className={`w-20 h-20 text-${item.color}-500 dark:text-${item.color}-400 mb-4 transition-transform duration-300 group-hover:scale-110`} />
                <h3 className="text-2xl font-bold mb-2 dark:text-white">{item.title}</h3>
                <p className="text-stone-600 dark:text-stone-300 text-sm">{item.description}</p>
            </div>

            {isHovered && userPurchaseCount > 0 && !isCommunity && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-4 animate-fade-in z-10">
                    <p className="text-white text-lg font-bold">شما تاکنون {userPurchaseCount.toLocaleString('fa-IR')} اصله از این میراث کاشته‌اید.</p>
                    <p className="text-amber-200 mt-2 mb-6">آیا داستان دیگری برای ثبت دارید؟</p>
                    <div className="flex flex-col gap-3 w-full max-w-[200px]">
                        <button
                            onClick={(e) => { e.stopPropagation(); onSelect(); }}
                            className={`w-full flex items-center justify-center gap-2 bg-${item.color}-500 text-white font-bold py-2.5 rounded-lg hover:bg-${item.color}-600 transition-colors shadow-lg`}
                        >
                            <PlusIcon className="w-5 h-5" />
                            کاشت دوباره
                        </button>
                        {!item.isCommunity && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onInstallmentSelect(); }}
                                className="w-full bg-white/20 backdrop-blur-sm text-white font-semibold py-2 rounded-lg hover:bg-white/30 transition-colors"
                            >
                                پرداخت قسطی
                            </button>
                        )}
                    </div>
                </div>
            )}
            
            <div className="p-5 bg-stone-50 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 space-y-3">
                <div className="text-center space-y-1">
                    <div>
                        <p className="text-xs font-semibold text-green-800 dark:text-green-300">مبلغ سرمایه‌گذاری اجتماعی شما</p>
                        <span className="text-3xl font-bold text-green-700 dark:text-green-300">{(item.price * 0.9).toLocaleString('fa-IR')}</span>
                        <span className="text-lg font-semibold text-green-700 dark:text-green-300"> تومان</span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                        از هزینه کل: {item.price.toLocaleString('fa-IR')} تومان
                    </p>
                </div>

                <div className="flex justify-center items-center text-sm pt-2 border-t border-dashed dark:border-stone-700/50">
                    <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                        <StarIcon className="w-4 h-4" />
                        <span className="font-semibold">هدیه: {pointsReward.toLocaleString('fa-IR')} امتیاز</span>
                    </div>
                </div>

                <button onClick={onSelect} className={`w-full bg-${item.color}-500 text-white font-bold py-2.5 rounded-lg hover:bg-${item.color}-600 transition-colors`}>
                    {isCommunity ? 'همیاری می‌کنم' : 'این میراث را می‌کارم'}
                </button>
                {!item.isCommunity && (
                    <button onClick={onInstallmentSelect} className="w-full text-center text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors py-1">
                        امکان پرداخت قسطی
                    </button>
                )}
            </div>
             <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

const HeritagePage: React.FC = () => {
    const { user: currentUser } = useAppState();
    const dispatch = useAppDispatch();
    const [selectedItem, setSelectedItem] = useState<HeritageItem | null>(null);
    const [installmentModalItem, setInstallmentModalItem] = useState<HeritageItem | null>(null);

    const handleAddToCart = (item: HeritageItem, type: 'heritage') => {
        const cartItem: CartItem = {
            id: item.id,
            productId: item.id,
            name: item.title,
            price: item.price,
            quantity: 1,
            image: `https://picsum.photos/seed/${item.id}/400/400`,
            stock: 999,
            type: 'heritage',
            popularity: 100,
            dateAdded: new Date().toISOString(),
            deedDetails: item.plantingDetails ? {
                name: item.plantingDetails.recipient,
                intention: item.title,
                message: item.plantingDetails.message
            } : undefined
        };
        dispatch({ type: 'ADD_TO_CART', payload: { product: cartItem, quantity: 1, deedDetails: cartItem.deedDetails } });
    };

    const handleSelect = (item: HeritageItem) => {
        // AUDIT FIX: Allow opening ritual modal even if guest
        if (item.isCommunity) {
             if (!currentUser) {
                dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
                return;
            }
            handleAddToCart(item, 'heritage');
        } else {
            setSelectedItem(item);
        }
    };

    const handleInstallmentSelect = (item: HeritageItem) => {
        if (!currentUser) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
            return;
        }
        setInstallmentModalItem(item);
    };

    const handleRitualComplete = (item: HeritageItem, details: { recipient: string; message: string; isAnonymous: boolean; pointsApplied: number; }) => {
        // AUDIT FIX: Check login at the end of ritual
        if (!currentUser) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
            // Ideally we'd save state here to resume after login, but simple gatekeeping is fine for V1
            return;
        }
        
        const itemWithDetails = { ...item, plantingDetails: details };
        handleAddToCart(itemWithDetails, 'heritage');
        setSelectedItem(null);
    };
    
    const onAddToCartWithInstallments = (item: HeritageItem | Course, months: number) => {
        const cartItem: CartItem = {
            id: `${item.id}-installments-${months}`,
            productId: item.id,
            name: item.title,
            price: item.price,
            quantity: 1,
            image: (item as any).imageUrl || `https://picsum.photos/seed/${item.id}/400/400`,
            stock: 999, // Assuming services are always in stock
            type: 'heritage',
            paymentPlan: { installments: months },
            popularity: 100,
            dateAdded: new Date().toISOString(),
        };

        dispatch({
            type: 'ADD_TO_CART',
            payload: {
                product: cartItem,
                quantity: 1,
                paymentPlan: { installments: months },
            },
        });
    };

    const displayItems = heritageItems.filter(item => item.id !== 'beginning_palm');

    return (
        <>
            <div className="space-y-16 animate-fade-in-up">
                <section className="text-center container mx-auto px-4">
                    <h1 id="heritage-title" className="text-4xl md:text-5xl font-extrabold text-amber-900 dark:text-amber-200 mb-4">
                        میراث خود را بکارید
                    </h1>
                    <p className="text-lg md:text-xl text-stone-700 dark:text-stone-300 max-w-3xl mx-auto">
                        هر لحظه مهمی از زندگی می‌تواند به یک میراث ماندگار تبدیل شود. نیت خود را انتخاب کنید و داستانی را در دل زمین جاودانه سازید.
                    </p>
                </section>
                <section className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayItems.map(item => (
                            <HeritageCard 
                                key={item.id} 
                                item={item} 
                                onSelect={() => handleSelect(item)} 
                                onInstallmentSelect={() => handleInstallmentSelect(item)}
                            />
                        ))}
                    </div>
                </section>
            </div>
            {selectedItem && (
                <PlantingRitualModal
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    user={currentUser}
                    item={selectedItem}
                    onComplete={handleRitualComplete}
                />
            )}
            {installmentModalItem && currentUser && (
                 <InstallmentModal
                    isOpen={!!installmentModalItem}
                    onClose={() => setInstallmentModalItem(null)}
                    item={installmentModalItem}
                    user={currentUser}
                    onAddToCartWithInstallments={onAddToCartWithInstallments}
                />
            )}
        </>
    );
};

export default HeritagePage;
