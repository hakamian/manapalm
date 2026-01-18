'use client';

import React from 'react';
import { useAppDispatch } from '../AppContext';
import { useCart } from '../contexts/CartContext';
import { View } from '../types';
import Modal from './Modal';

export default function ShoppingCartModal() {
  const { state, toggleCart, removeFromCart } = useCart();
  const { isCartOpen, cartItems } = state;
  const appDispatch = useAppDispatch();

  if (!isCartOpen) return null;

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Modal
      isOpen={isCartOpen}
      onClose={() => toggleCart(false)}
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
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-gray-600">تعداد: {item.quantity}</p>
              </div>
              <div className="text-left">
                <p className="font-bold text-emerald-600">
                  {(item.price * item.quantity).toLocaleString('fa-IR')} تومان
                </p>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                حذف
              </button>
            </div>
          ))}

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg">جمع کل:</span>
              <span className="font-bold text-xl text-emerald-600">
                {totalPrice.toLocaleString('fa-IR')} تومان
              </span>
            </div>

            <button
              onClick={() => {
                toggleCart(false);
                appDispatch({ type: 'SET_VIEW', payload: View.Checkout });
              }}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition"
            >
              تکمیل خرید
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}