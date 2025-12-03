import React from 'react';
import { useAppDispatch } from '../AppContext';
import { View } from '../types';

const HeritageView: React.FC = () => {
    const dispatch = useAppDispatch();
    return (
        <div className="pt-22 pb-24 min-h-screen bg-gray-900 text-white flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold">بخش میراث</h1>
                <p className="text-lg text-gray-400 mt-4">این بخش در حال توسعه است.</p>
                <button onClick={() => dispatch({ type: 'SET_VIEW', payload: View.HallOfHeritage })} className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    رفتن به تالار میراث
                </button>
            </div>
        </div>
    );
};

export default HeritageView;