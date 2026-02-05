'use client';

import React, { useState, useMemo } from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View } from '../types';
import Modal from './Modal';
import { TrashIcon, ShoppingCartIcon, PlusIcon, MinusIcon, ArrowLeftIcon, SparklesIcon, LeafIcon, UsersIcon, CheckCircleIcon } from './icons';
import { useRouter } from 'next/navigation';
import { formatPrice, toFarsiDigits } from '../utils/formatters';

export default function ShoppingCartModal() {
  const { isCartOpen, cartItems } = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);

  // Calculate simulated impact for Step 2
  const impact = useMemo(() => {
    const trees = cartItems.filter(i => i.category === 'نخل میراث').reduce((s, i) => s + i.quantity, 0);
    return {
      trees,
      jobs: trees * 1.5, // 1.5 jobs per tree (simulated)
      co2: trees * 20, // 20kg per tree (simulated)
    };
  }, [cartItems]);

  if (!isCartOpen) return null;

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  const updateQuantity = (id: string, newQty: number) => {
    if (newQty < 1) {
      handleRemove(id);
      return;
    }
    const item = cartItems.find(i => i.id === id);
    if (item) {
      dispatch({ type: 'ADD_TO_CART', payload: { product: item, quantity: newQty - item.quantity } });
    }
  };

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_CART', payload: false });
    // Reset step when closing
    setTimeout(() => setActiveStep(1), 300);
  };

  const proceedToCheckout = () => {
    dispatch({ type: 'TOGGLE_CART', payload: false });
    dispatch({ type: 'SET_VIEW', payload: View.Checkout });
    router.push('/checkout');
  };

  const nextStep = () => setActiveStep(s => Math.min(s + 1, 3));
  const prevStep = () => setActiveStep(s => Math.max(s - 1, 1));

  const steps = [
    { id: 1, label: 'سبد' },
    { id: 2, label: 'برکت' },
    { id: 3, label: 'تایید' }
  ];

  return (
    <Modal
      isOpen={isCartOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-3">
          <span className="text-white">فرآیند تکمیل معنا</span>
        </div>
      }
    >
      <div className="w-[95vw] max-w-md min-h-[500px] flex flex-col">
        {/* Stepper Header */}
        <div className="flex items-center justify-between mb-8 px-4">
          {steps.map((s, idx) => (
            <React.Fragment key={s.id}>
              <div className="relative flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${activeStep >= s.id ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-700 text-gray-500'}`}>
                  {activeStep > s.id ? <CheckCircleIcon className="w-5 h-5" /> : <span className="text-xs font-bold">{s.id}</span>}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${activeStep >= s.id ? 'text-emerald-400' : 'text-gray-600'}`}>{s.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-[2px] mx-2 transition-colors duration-300 ${activeStep > s.id ? 'bg-emerald-500' : 'bg-gray-800'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-inner">
              <ShoppingCartIcon className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">سبد شما خالی است</h3>
            <p className="text-gray-500 text-sm mb-8 text-center px-8">نیت‌های معنادار خود را بکارید تا سفرِ رشد شما آغاز شود.</p>
            <button onClick={handleClose} className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 px-8 py-3 rounded-2xl border border-emerald-500/20 transition-all font-bold">بازگشت به نخلستان</button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Step 1: List View */}
            {activeStep === 1 && (
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-1 animate-fade-in">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-white/5 border border-white/5 rounded-2xl">
                    <img src={item.image} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-sm truncate">{item.name}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 bg-black/40 rounded-lg px-2 py-1 border border-white/5">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-gray-500 hover:text-white"><MinusIcon className="w-3 h-3" /></button>
                          <span className="text-white text-xs font-bold">{toFarsiDigits(item.quantity)}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-gray-500 hover:text-white"><PlusIcon className="w-3 h-3" /></button>
                        </div>
                        <button onClick={() => handleRemove(item.id)} className="text-gray-600 hover:text-red-400 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="text-emerald-400 font-black text-sm">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 2: Impact Report */}
            {activeStep === 2 && (
              <div className="space-y-6 animate-fade-in py-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-white">صدای ریشه‌های شما</h3>
                  <p className="text-gray-500 text-xs">این انتخاب شما، چنین اثری بر جهان خواهد داشت:</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center"><LeafIcon className="w-6 h-6 text-emerald-400" /></div>
                    <div>
                      <div className="text-xl font-black text-white">{toFarsiDigits(impact.trees)} نخل</div>
                      <div className="text-xs text-gray-500">افزایشِ ره‌های سبز زمین</div>
                    </div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center"><UsersIcon className="w-6 h-6 text-blue-400" /></div>
                    <div>
                      <div className="text-xl font-black text-white">{toFarsiDigits(Math.ceil(impact.jobs))} نفر-روز</div>
                      <div className="text-xs text-gray-500">حمایت از معیشتِ باغبانان بومی</div>
                    </div>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center"><SparklesIcon className="w-6 h-6 text-amber-400" /></div>
                    <div>
                      <div className="text-xl font-black text-white">{toFarsiDigits(impact.co2)} کیلوگرم</div>
                      <div className="text-xs text-gray-500">جذب کربن در طول حیات نخل</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Final Summary */}
            {activeStep === 3 && (
              <div className="space-y-6 animate-fade-in py-8 text-center">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-white">آماده‌ی میراث‌سازی؟</h3>
                <div className="bg-gray-800/50 p-6 rounded-3xl border border-white/5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">تعداد آیتم‌ها</span>
                    <span className="text-white font-bold">{toFarsiDigits(cartItems.length)} عدد</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-400">جمع نهایی برکت</span>
                    <span className="text-emerald-400 font-black">{formatPrice(totalPrice)} تومان</span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
              {/* Explicit Logic for Step 3 (Checkout) vs Other Steps */}
              {activeStep === 3 ? (
                <button
                  onClick={proceedToCheckout}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl transition-all font-black text-lg shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
                >
                  <span>تایید و پرداخت نهایی</span>
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl transition-all font-bold flex items-center justify-center gap-2 group"
                >
                  <span>{activeStep === 2 ? 'ادامه به تایید نهایی' : 'مشاهده گزارش اثرگذاری'}</span>
                  <ArrowLeftIcon className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
                </button>
              )}

              {activeStep > 1 && (
                <button onClick={prevStep} className="w-full text-gray-500 py-2 text-sm hover:text-white transition-colors">بازگشت به مرحله قبل</button>
              )}
              {activeStep === 1 && (
                <div className="flex justify-between items-center px-4 py-2">
                  <span className="text-gray-500 text-xs">مجموع سبد:</span>
                  <span className="text-white font-bold">{formatPrice(totalPrice)} تومان</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
