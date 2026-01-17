'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartState {
    cartItems: CartItem[];
    isCartOpen: boolean;
}

type CartAction =
    | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number; deedDetails?: any; paymentPlan?: any } }
    | { type: 'REMOVE_FROM_CART'; payload: string }
    | { type: 'SET_CART_ITEMS'; payload: CartItem[] }
    | { type: 'TOGGLE_CART'; payload?: boolean }
    | { type: 'CLEAR_CART' };

const initialState: CartState = {
    cartItems: [],
    isCartOpen: false,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const { product, quantity, deedDetails, paymentPlan } = action.payload;
            const existingItemIndex = state.cartItems.findIndex(item => item.id === product.id);
            let newCartItems;
            if (existingItemIndex > -1) {
                newCartItems = state.cartItems.map((item, index) =>
                    index === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item
                );
            } else {
                newCartItems = [...state.cartItems, { ...product, productId: product.id, quantity, deedDetails, paymentPlan }];
            }
            return { ...state, cartItems: newCartItems, isCartOpen: true };
        }
        case 'REMOVE_FROM_CART':
            return { ...state, cartItems: state.cartItems.filter(item => item.id !== action.payload) };
        case 'SET_CART_ITEMS':
            return { ...state, cartItems: action.payload };
        case 'TOGGLE_CART':
            return { ...state, isCartOpen: action.payload !== undefined ? action.payload : !state.isCartOpen };
        case 'CLEAR_CART':
            return { ...state, cartItems: [], isCartOpen: false };
        default:
            return state;
    }
};

const CartContext = createContext<{
    state: CartState;
    dispatch: React.Dispatch<CartAction>;
    addToCart: (product: Product, quantity: number, deedDetails?: any, paymentPlan?: any) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    toggleCart: (open?: boolean) => void;
} | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('nakhlestan_cart');
        if (savedCart) {
            try {
                dispatch({ type: 'SET_CART_ITEMS', payload: JSON.parse(savedCart) });
            } catch (e) {
                console.error("Failed to parse saved cart", e);
            }
        }
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        localStorage.setItem('nakhlestan_cart', JSON.stringify(state.cartItems));
    }, [state.cartItems]);

    const addToCart = (product: Product, quantity: number, deedDetails?: any, paymentPlan?: any) => {
        dispatch({ type: 'ADD_TO_CART', payload: { product, quantity, deedDetails, paymentPlan } });
    };

    const removeFromCart = (id: string) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const toggleCart = (open?: boolean) => {
        dispatch({ type: 'TOGGLE_CART', payload: open });
    };

    return (
        <CartContext.Provider value={{ state, dispatch, addToCart, removeFromCart, clearCart, toggleCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
