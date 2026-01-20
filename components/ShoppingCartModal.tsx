'use client';

import React from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { View } from '../types';
import Modal from './Modal';

export default function ShoppingCartModal() {
  // 1. Use AppContext as the Single Source of Truth to avoid split-brain with CartContext
  const { isCartOpen, cartItems } = useAppState();
  const dispatch = useAppDispatch();

  if (!isCartOpen) return null;

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_CART', payload: false });
  };

  const handleCheckout = () => {
    dispatch({ type: 'TOGGLE_CART', payload: false });
    dispatch({ type: 'SET_VIEW', payload: View.Checkout });
  };

  return (
    <Modal
      isOpen={isCartOpen}
      onClose={handleClose}
      title="سبد خرید"
    >
      {cartItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          سبد خرید شما خالی است
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              {item.image && (
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-600">تعداد: {item.quantity}</p>
              </div>
              <div className="text-left">
                <p className="font-bold text-emerald-600">
                  {(item.price * item.quantity).toLocaleString('fa-IR')} تومان
                </p>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="text-red-500 hover:text-red-700 font-medium text-sm"
              >
                حذف
              </button>
            </div>
          ))}

          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg text-gray-800">جمع کل:</span>
              <span className="font-bold text-xl text-emerald-600">
                {totalPrice.toLocaleString('fa-IR')} تومان
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-bold shadow-md hover:shadow-lg"
            >
              تکمیل خرید
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}