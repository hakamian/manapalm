
import React, { useState, useEffect, useMemo } from 'react';
import { View, Order } from '../types';
import { useAppState, useAppDispatch } from '../AppContext';
import { XMarkIcon, ShoppingCartIcon, SproutIcon, TrophyIcon, SparklesIcon, MinusIcon, PlusIcon, GiftIcon, CheckCircleIcon, HeartIcon, ArrowDownTrayIcon } from './icons';

const CartSidebar: React.FC = () => {
  const { isCartOpen, cartItems, user, products } = useAppState();
  const dispatch = useAppDispatch();
  const [error, setError] = useState('');
  
  // State for One-Click Upsell animation
  const [upsellState, setUpsellState] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    if (!isCartOpen) {
      setError('');
      setUpsellState('idle');
    }
  }, [isCartOpen]);

  const handleClose = () => dispatch({ type: 'TOGGLE_CART', payload: false });

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setError('');
    if (newQuantity < 1) {
      handleRemoveItem(id);
      return;
    }
    
    const itemToUpdate = cartItems.find(i => i.id === id);
    if (!itemToUpdate) return;

    const newQuantityClamped = Math.min(newQuantity, itemToUpdate.stock);
    const newCartItems = cartItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantityClamped } : item
    );
    dispatch({ type: 'SET_CART_ITEMS', payload: newCartItems });
  };

  const handleRemoveItem = (id: string) => {
    setError('');
    const newCartItems = cartItems.filter(item => item.id !== id);
    dispatch({ type: 'SET_CART_ITEMS', payload: newCartItems });
  };

  const handleSaveForLater = (id: string, productId: string) => {
      dispatch({ type: 'TOGGLE_WISHLIST', payload: productId });
      handleRemoveItem(id);
  };

  const handleCheckout = () => {
    setError('');
    const outOfStockItems = cartItems.filter(item => item.stock === 0);
    if (outOfStockItems.length > 0) {
        setError(`متاسفانه محصول(های) "${outOfStockItems.map(i => i.name).join('، ')}" تمام شده است.`);
        return;
    }

    if (!user) {
        dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
        return;
    }

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newDeeds = cartItems.filter(item => item.type === 'heritage' && item.deedDetails).map(item => ({
        id: `deed-${Date.now()}-${item.id.slice(11, 15)}`,
        productId: item.productId,
        intention: item.deedDetails!.intention,
        name: item.deedDetails!.name,
        date: new Date().toISOString(),
        palmType: item.name,
        message: item.deedDetails!.message,
        fromName: item.deedDetails!.fromName,
        groveKeeperId: item.deedDetails!.groveKeeperId,
    }));

    const newOrder: Order = {
        id: `order-${Date.now()}`,
        userId: user.id,
        date: new Date().toISOString(),
        items: cartItems,
        total: total,
        status: 'ثبت شده',
        statusHistory: [{ status: 'ثبت شده', date: new Date().toISOString() }],
        deeds: newDeeds,
    };
    
    dispatch({ type: 'PLACE_ORDER', payload: newOrder });
  };

  const handleContinueShopping = () => {
    handleClose();
    dispatch({ type: 'SET_VIEW', payload: View.Shop });
  };

  // --- Smart Upsell Logic ---
  const upsellItem = useMemo(() => {
      const hasHeritagePalm = cartItems.some(item => item.type === 'heritage');
      const hasAmbassadorPack = cartItems.some(item => item.productId === 'p_ambassador_pack');
      
      if (hasHeritagePalm && !hasAmbassadorPack) {
          return products.find(p => p.id === 'p_ambassador_pack');
      }
      return null;
  }, [cartItems, products]);

  const handleAddUpsell = () => {
      if (upsellItem) {
          setUpsellState('loading');
          
          // Simulate network/process delay for better UX feel
          setTimeout(() => {
              dispatch({ 
                  type: 'ADD_TO_CART', 
                  payload: { product: upsellItem, quantity: 1 } 
              });
              setUpsellState('success');
              
              // Reset state after showing success
              setTimeout(() => {
                  setUpsellState('idle');
              }, 2000);
          }, 600);
      }
  };
  // ---------------------------

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.paymentPlan && item.paymentPlan.installments > 1 ? item.price / item.paymentPlan.installments : item.price;
    return sum + price * item.quantity;
  }, 0);

  const totalPoints = cartItems.reduce((sum, item) => sum + (item.points || 0) * item.quantity, 0);
  const palmCount = cartItems.filter(item => item.id.startsWith('p_heritage_')).reduce((sum, item) => sum + item.quantity, 0);
  const hasInstallmentItem = cartItems.some(item => item.paymentPlan && item.paymentPlan.installments > 1);

  const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(Math.ceil(price));

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-60 z-50 transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={handleClose}
      ></div>

      <aside
        className={`fixed top-0 left-0 h-full w-full max-w-md bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className="flex flex-col h-full bg-gray-800">
          <header className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
            <h2 id="cart-title" className="text-xl font-bold">سبد خرید شما</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-white" aria-label="بستن سبد خرید">
              <XMarkIcon />
            </button>
          </header>

          {cartItems.length > 0 ? (
            <>
              <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                <ul className="space-y-4">
                  {cartItems.map(item => {
                    const isIndividuallyPersonalizedHeritage = item.type === 'heritage' && item.id !== 'p_heritage_campaign_100';
                    const isService = item.type === 'service';
                    const isFixedQuantity = isIndividuallyPersonalizedHeritage || isService;
                    const priceToShow = item.paymentPlan && item.paymentPlan.installments > 1 ? item.price / item.paymentPlan.installments : item.price;

                    return (
                      <li key={item.id} className="flex items-start space-x-reverse space-x-4 bg-gray-700/50 p-3 rounded-lg animate-fade-in transition-all duration-300">
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                        <div className="flex-grow">
                            <h3 className="font-semibold text-white">{item.name}</h3>
                          {item.deedDetails && (
                            <p className="text-xs text-gray-400 mt-1">به نام: {item.deedDetails.name}</p>
                          )}
                          {item.webDevDetails && (
                             <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                                <p>پروژه: <span className="font-semibold text-gray-300">{item.webDevDetails.projectName}</span></p>
                                <p className="italic text-stone-500">{item.webDevDetails.vision.substring(0, 30)}...</p>
                             </div>
                          )}
                          {item.coCreationDetails && (
                             <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                                <p>بسته: <span className="font-semibold text-gray-300">{item.coCreationDetails.packageName}</span></p>
                                <p>نام سایت: <span className="font-semibold text-gray-300">{item.coCreationDetails.siteName}</span></p>
                             </div>
                          )}
                           {(item.points && item.points > 0) && (
                                <div className="text-xs text-yellow-300 mt-1">
                                    <p>+{(item.points - (item.bonusPoints || 0)).toLocaleString('fa-IR')} امتیاز برکت</p>
                                    {(item.bonusPoints || 0) > 0 && (
                                        <p className="font-bold flex items-center gap-1">
                                            <SparklesIcon className="w-3 h-3"/>
                                            امتیاز ویژه: +{item.bonusPoints?.toLocaleString('fa-IR')}
                                        </p>
                                    )}
                                </div>
                            )}
                          <div className="my-1">
                               <p className="text-sm font-bold text-green-300">سرمایه‌گذاری اجتماعی: {formatPrice(priceToShow * 0.9 * item.quantity)} تومان</p>
                               {item.paymentPlan && item.paymentPlan.installments > 1 ? (
                                   <>
                                       <p className="text-xs text-yellow-300 -mt-1">پرداخت اولیه ({item.paymentPlan.installments} قسط)</p>
                                       <p className="text-xs text-gray-500">(هزینه کل: {formatPrice(item.price * item.quantity)})</p>
                                   </>
                               ) : (
                                   <p className="text-xs text-gray-500">(هزینه کل: {formatPrice(priceToShow * item.quantity)})</p>
                               )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center">
                                {isFixedQuantity ? (
                                    <span className="text-sm text-gray-300 px-2 py-1 bg-gray-600 rounded-md">تعداد: ۱</span>
                                ) : (
                                    <div className="flex items-center border border-gray-600 rounded-lg">
                                        <button
                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                            className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-gray-700 rounded-r-lg transition-colors"
                                            aria-label="کاهش تعداد"
                                        >
                                            <MinusIcon className="w-4 h-4" />
                                        </button>
                                        <span className="w-10 text-center font-bold" aria-live="polite">{item.quantity.toLocaleString('fa-IR')}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                            disabled={item.quantity >= item.stock}
                                            className="w-8 h-8 flex items-center justify-center text-green-400 hover:bg-gray-700 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            aria-label="افزایش تعداد"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => handleSaveForLater(item.id, item.productId)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mr-auto ml-2" title="ذخیره برای بعد">
                                <HeartIcon className="w-4 h-4" />
                                <span>ذخیره</span>
                            </button>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveItem(item.id)} className="text-gray-500 hover:text-red-400 flex-shrink-0 self-start pt-1" aria-label={`حذف ${item.name}`}>
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Smart Upsell Recommendation */}
                {upsellItem && (
                     <div className="mt-6 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 p-4 rounded-xl border border-indigo-500/30 animate-fade-in">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
                                <GiftIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm font-bold text-indigo-200">پیشنهاد مکمل: {upsellItem.name}</p>
                                <p className="text-xs text-indigo-300/80 mt-1 line-clamp-2">{upsellItem.description.substring(0, 60)}...</p>
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-sm font-bold text-white">{formatPrice(upsellItem.price)} تومان</span>
                                    
                                    <button 
                                        onClick={handleAddUpsell}
                                        disabled={upsellState !== 'idle'}
                                        className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-all flex items-center gap-1 ${
                                            upsellState === 'success' ? 'bg-green-600 text-white' : 
                                            upsellState === 'loading' ? 'bg-indigo-500/50 text-indigo-200 cursor-wait' :
                                            'bg-indigo-600 hover:bg-indigo-500 text-white'
                                        }`}
                                    >
                                        {upsellState === 'loading' ? (
                                             <span className="w-3 h-3 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></span>
                                        ) : upsellState === 'success' ? (
                                            <>
                                                <CheckCircleIcon className="w-3 h-3" /> افزوده شد
                                            </>
                                        ) : (
                                            <>
                                                <PlusIcon className="w-3 h-3" /> افزودن
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                     </div>
                )}

              </div>

              <footer className="p-4 border-t border-gray-700 bg-gray-900 space-y-4">
                {palmCount > 0 && (
                  <div className="bg-green-900/40 border border-green-700 text-green-200 p-3 rounded-md text-center">
                    <p className="flex items-center justify-center">
                        <SproutIcon className="w-6 h-6 ml-2" />
                        <span>با این خرید شما در کاشت <strong className="font-bold">{palmCount.toLocaleString('fa-IR')} نخل</strong> سهیم خواهید بود.</span>
                    </p>
                  </div>
                )}
                <div className="flex justify-between items-center text-gray-300">
                    <span className="flex items-center"><TrophyIcon className="w-5 h-5 ml-2 text-yellow-400" /> امتیاز دریافتی:</span>
                    <span className="font-bold text-lg text-yellow-300">{formatPrice(totalPoints)}</span>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-green-300">
                        <span className="font-semibold">جمع سرمایه‌گذاری اجتماعی:</span>
                        <span className="font-bold text-lg">{formatPrice(subtotal * 0.9)} تومان</span>
                    </div>
                    <div className="flex justify-between items-center text-white font-bold text-lg border-t border-gray-700 pt-2">
                      <span className="text-lg">{hasInstallmentItem ? 'مبلغ پرداخت اولیه:' : 'جمع کل قابل پرداخت:'}</span>
                      <span className="text-xl font-bold">{formatPrice(subtotal)} تومان</span>
                    </div>
                </div>
                {user ? (
                  <>
                      {error && (
                          <div className="bg-red-900/50 text-red-300 text-sm p-3 rounded-md" role="alert">
                              {error}
                          </div>
                      )}
                      <button 
                        onClick={handleCheckout} 
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition-colors flex items-center justify-center"
                      >
                        تکمیل خرید و پرداخت
                      </button>
                  </>
                ) : (
                  <div className="text-center bg-gray-700 p-3 rounded-md">
                      <p className="text-sm text-gray-300 mb-2">برای تکمیل خرید، لطفاً وارد حساب کاربری خود شوید.</p>
                      <button onClick={() => { handleClose(); dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true }); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md transition-colors">
                          ورود | ثبت نام
                      </button>
                  </div>
                )}
              </footer>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
              <ShoppingCartIcon className="w-24 h-24 text-gray-700 mb-6" />
              <h3 className="text-xl font-semibold text-white mb-2">سبد خرید شما خالی است</h3>
              <p className="text-gray-400 mb-6">به نظر می‌رسد هنوز محصولی انتخاب نکرده‌اید.</p>
              <button
                onClick={handleContinueShopping}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition-colors"
              >
                ادامه خرید
              </button>
            </div>
          )}
        </div>
      </aside>
       <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1f2937; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
};

export default CartSidebar;
