
import React, { useState, useEffect } from 'react';
import { View, Order } from '../../../types';
import { useAppState, useAppDispatch } from '../../../AppContext';
import { XMarkIcon, ShoppingCartIcon, SproutIcon, TrophyIcon, SparklesIcon, MinusIcon, PlusIcon, CloudIcon, HeartIcon } from '../../../components/icons';

const ShoppingCart: React.FC = () => {
  const { isCartOpen, cartItems, user } = useAppState();
  const dispatch = useAppDispatch();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isCartOpen) {
      setError('');
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

    if (!user.address || user.address.length < 5) {
      setError('لطفاً جهت ارسال سفارش، آدرس خود را در پروفایل تکمیل کنید.');
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
      totalAmount: total,
      createdAt: new Date().toISOString(),
      status: 'pending',
      statusHistory: [{ status: 'pending', date: new Date().toISOString() }],
      deeds: newDeeds,
    };

    dispatch({ type: 'PLACE_ORDER', payload: newOrder });
  };

  const handleContinueShopping = () => {
    handleClose();
    dispatch({ type: 'SET_VIEW', payload: View.Shop });
  };

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
                                  <SparklesIcon className="w-3 h-3" />
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
                          <div className="flex items-center mt-2">
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
                        </div>
                        <button onClick={() => handleRemoveItem(item.id)} className="text-gray-500 hover:text-red-400 flex-shrink-0" aria-label={`حذف ${item.name}`}>
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <footer className="p-0 bg-gray-900 space-y-0">
                {/* Impact Dashboard */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-t border-gray-700 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-500/20 p-2 rounded-full animate-pulse-slow">
                        <SproutIcon className="w-5 h-5 text-green-400" />
                      </div>
                      <h4 className="text-gray-200 font-bold">اثرگذاری این خرید</h4>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full border border-gray-700">Level 1: Seedling</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>تا کاشت نخل بعدی</span>
                      <span>{(palmCount * 25)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-400 h-2.5 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min((palmCount * 25), 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Impact Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-gray-800/50 rounded-lg p-2 text-center border border-gray-700 hover:border-green-500/30 transition-colors group">
                      <div className="w-8 h-8 mx-auto flex items-center justify-center bg-blue-500/10 rounded-full mb-1 group-hover:bg-blue-500/20 transition-colors">
                        <CloudIcon className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="block text-xs text-gray-400">هوای پاک</span>
                      <span className="block text-sm font-bold text-gray-200">{(palmCount * 12).toLocaleString('fa-IR')} kg</span>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2 text-center border border-gray-700 hover:border-yellow-500/30 transition-colors group">
                      <div className="w-8 h-8 mx-auto flex items-center justify-center bg-yellow-500/10 rounded-full mb-1 group-hover:bg-yellow-500/20 transition-colors">
                        <TrophyIcon className="w-5 h-5 text-yellow-400" />
                      </div>
                      <span className="block text-xs text-gray-400">امتیاز معنا</span>
                      <span className="block text-sm font-bold text-gray-200">{totalPoints.toLocaleString('fa-IR')}</span>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2 text-center border border-gray-700 hover:border-orange-500/30 transition-colors group">
                      <div className="w-8 h-8 mx-auto flex items-center justify-center bg-orange-500/10 rounded-full mb-1 group-hover:bg-orange-500/20 transition-colors">
                        <HeartIcon className="w-5 h-5 text-orange-400" />
                      </div>
                      <span className="block text-xs text-gray-400">حمایت</span>
                      <span className="block text-sm font-bold text-gray-200">{(subtotal * 0.05).toLocaleString('fa-IR')} T</span>
                    </div>
                  </div>

                  {/* Totals & Action */}
                  <div className="space-y-3 pt-4 border-t border-gray-700/50">
                    <div className="flex justify-between items-center text-gray-300 text-sm">
                      <span>جمع کل خرید:</span>
                      <span>{formatPrice(subtotal)} تومان</span>
                    </div>
                    <div className="flex justify-between items-center text-green-400 text-sm">
                      <span>سرمایه‌گذاری اجتماعی (۹۰٪):</span>
                      <span>{formatPrice(subtotal * 0.9)} تومان</span>
                    </div>

                    {user ? (
                      <>
                        {error && (
                          <div className={`text-sm p-4 rounded-lg flex flex-col gap-3 animate-shake ${error.includes('آدرس') ? 'bg-amber-900/40 border border-amber-500/50' : 'bg-red-900/50 border border-red-500/50'}`} role="alert">
                            <div className="flex items-start gap-2">
                              {error.includes('آدرس') ? <span className="text-xl">📍</span> : <span className="text-xl">⚠️</span>}
                              <p className={`leading-relaxed ${error.includes('آدرس') ? 'text-amber-100' : 'text-red-200'}`}>{error}</p>
                            </div>

                            {error.includes('آدرس') && (
                              <button
                                onClick={() => {
                                  handleClose();
                                  dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: 'profile' });
                                }}
                                className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-2 px-4 rounded-md self-end transition-colors flex items-center gap-2 shadow-lg"
                              >
                                <span>ثبت آدرس در پروفایل</span>
                                <span className="text-lg">👈</span>
                              </button>
                            )}
                          </div>
                        )}
                        <button
                          onClick={handleCheckout}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-green-500/20 active:scale-95 flex items-center justify-center gap-2 group"
                        >
                          <span>تکمیل خرید و کاشت</span>
                          <SproutIcon className="w-5 h-5 group-hover:animate-bounce" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center bg-gray-800 p-3 rounded-xl border border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">برای ثبت سفارش، لطفاً وارد شوید.</p>
                        <button onClick={() => { handleClose(); dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true }); }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition-colors text-sm">
                          ورود | ثبت نام
                        </button>
                      </div>
                    )}
                  </div>
                </div>
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
        .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
};

export default ShoppingCart;
