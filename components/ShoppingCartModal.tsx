'use client';

import React from 'react';
import { useAppState, useAppDispatch } from '../AppContext';
import { useCart } from '../contexts/CartContext';
import { View } from '../types';
import Modal from './Modal';

export default function ShoppingCartModal() {
  const { isCartOpen, cartItems, toggleCart, removeFromCart } = useCart().state ? { ...useCart().state, ...useCart() } : ({} as any);
  // Fallback to AppContext if CartContext not available (should not happen)
  const appState = useAppState();
  const appDispatch = useAppDispatch();

  const activeCartItems = cartItems || appState.cartItems;
  const activeIsCartOpen = isCartOpen !== undefined ? isCartOpen : appState.isCartOpen;

  if (!activeIsCartOpen) return null;

  const totalPrice = activeCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Modal
      isOpen={activeIsCartOpen}
      onClose={() => toggleCart ? toggleCart(false) : appDispatch({ type: 'TOGGLE_CART', payload: false })}
      title="سبد خرید"
    >
      {activeCartItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          سبد خرید شما خالی است
        </div>
      ) : (
        <div className="space-y-4">
          {activeCartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
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
                onClick={() => removeFromCart ? removeFromCart(item.id) : appDispatch({ type: 'REMOVE_FROM_CART', payload: item.id })}
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
                if (toggleCart) toggleCart(false);
                else appDispatch({ type: 'TOGGLE_CART', payload: false });
                
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