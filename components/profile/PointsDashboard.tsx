'use client';

import React from 'react';
import { User } from '../../types';
import { TrophyIcon, StarIcon, HistoryIcon, ArrowUpRightIcon } from '../icons';

interface PointsDashboardProps {
    user: User;
    pointsLedger: any[]; // We'll fetch this from the backend or pass from AppContext
}

const PointsDashboard: React.FC<PointsDashboardProps> = ({ user }) => {
    // Mock ledger for visualization if actual is not provided
    const mockLedger = [
        { id: 1, reason: 'خرید نخل میراث', amount: 500, created_at: '2026-01-20T10:00:00Z' },
        { id: 2, reason: 'ثبت‌نام در سامانه', amount: 100, created_at: '2026-01-15T08:30:00Z' },
        { id: 3, reason: 'هدیه به دوست', amount: 200, created_at: '2026-01-10T15:45:00Z' },
    ];

    const ledger = mockLedger; // In real use, this comes from an API call

    return (
        <div className="space-y-6">
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 p-6 rounded-2xl border border-amber-500/30 flex flex-col items-center justify-center text-center">
                    <TrophyIcon className="w-10 h-10 text-amber-500 mb-2" />
                    <p className="text-gray-400 text-sm">سطح فعلی</p>
                    <h3 className="text-3xl font-bold text-amber-500">{user.level || 'جوانه'}</h3>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 p-6 rounded-2xl border border-green-500/30 flex flex-col items-center justify-center text-center">
                    <StarIcon className="w-10 h-10 text-green-500 mb-2" />
                    <p className="text-gray-400 text-sm">امتیاز برکت</p>
                    <h3 className="text-3xl font-bold text-green-500">{user.points.toLocaleString('fa-IR')}</h3>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 p-6 rounded-2xl border border-blue-500/30 flex flex-col items-center justify-center text-center">
                    <HistoryIcon className="w-10 h-10 text-blue-500 mb-2" />
                    <p className="text-gray-400 text-sm">امتیاز معنا</p>
                    <h3 className="text-3xl font-bold text-blue-500">{(user.manaPoints || 0).toLocaleString('fa-IR')}</h3>
                </div>
            </div>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <HistoryIcon className="w-6 h-6 text-amber-400" />
                        گاه‌نگارِ برکت و معنا (دفتر کل)
                    </h3>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {ledger.length > 0 ? (
                        <table className="w-full text-right">
                            <thead className="bg-gray-900/50 text-gray-400 text-xs">
                                <tr>
                                    <th className="p-4">روایتِ اقدام</th>
                                    <th className="p-4">توشه‌ی رشد</th>
                                    <th className="p-4">تاریخِ ثبت</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-700">
                                {ledger.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="p-4 text-white font-medium">{entry.reason}</td>
                                        <td className={`p-4 font-bold ${entry.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {entry.amount > 0 ? '+' : ''}
                                            {entry.amount.toLocaleString('fa-IR')}
                                        </td>
                                        <td className="p-4 text-gray-400 text-xs text-left">
                                            {new Date(entry.created_at).toLocaleDateString('fa-IR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            <HistoryIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>هنوز اثری از قدم‌های شما در دفتر کل ثبت نشده است.<br />اولین نخل را بکارید تا داستان آغاز شود.</p>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-900/30 text-center">
                    <button className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1 mx-auto">
                        مشاهده تمام سوابق <ArrowUpRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PointsDashboard;
