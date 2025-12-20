'use client';

import React, { useEffect } from 'react';
import UserProfileView from '../../components/UserProfileView';
import { useAppState, useAppDispatch } from '../../AppContext';
import { View } from '../../types';

export default function ProfilePage() {
    const { user, isAuthModalOpen } = useAppState();
    const dispatch = useAppDispatch();

    useEffect(() => {
        // If not logged in and modal not already open, prompt for login
        // In a real app, middleware might redirect to /login
        // But here we use a modal-based Auth.
        if (!user && !isAuthModalOpen) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });
        }
    }, [user, isAuthModalOpen, dispatch]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">لطفاً برای مشاهده پروفایل وارد شوید</h1>
                    <p className="text-gray-400">شما در حال هدایت به پنجره ورود هستید...</p>
                    <button
                        onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })}
                        className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                    >
                        ورود / ثبت‌نام
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen">
            <UserProfileView />
        </main>
    );
}
