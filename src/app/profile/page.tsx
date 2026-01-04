'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../../../AppContext';
import { View } from '../../../types';
import LoadingSpinner from '../../../components/LoadingSpinner';

/**
 * Bridge component for the /profile route.
 * Redirects to the main page while setting the application view to UserProfile.
 */
export default function ProfileBridge() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Option A: Navigate to Home and trigger the state change
        // This is safer during the migration to keep state unified.
        dispatch({ type: 'SET_PROFILE_TAB_AND_NAVIGATE', payload: 'profile' });
        router.push('/?view=profile');
    }, [dispatch, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="text-center">
                <LoadingSpinner />
                <p className="mt-4 text-white font-medium">در حال انتقال به پروفایل...</p>
            </div>
        </div>
    );
}
