
import React, { useEffect } from 'react';
import { useAppDispatch } from '../AppContext';
import { View } from '../types';

// This component acts as a redirector or alias to UserProfileView
// to ensure file existence and valid export.
const ProfilePage: React.FC = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Redirect to the canonical UserProfile view
        dispatch({ type: 'SET_VIEW', payload: View.UserProfile });
    }, [dispatch]);

    return null;
};

export default ProfilePage;
