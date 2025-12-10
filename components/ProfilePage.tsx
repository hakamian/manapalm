
import React, { useEffect } from 'react';
import { useAppDispatch } from '../AppContext';
import { View } from '../types';

const ProfilePage: React.FC = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch({ type: 'SET_VIEW', payload: View.UserProfile });
    }, [dispatch]);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            <p>در حال انتقال به پروفایل...</p>
        </div>
    );
};

export default ProfilePage;
