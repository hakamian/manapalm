
import React, { useState, useMemo } from 'react';
import { useAppState, useAppDispatch } from '../../AppContext';
import { Review } from '../../types';
import { CheckCircleIcon, XMarkIcon, TrashIcon, QuoteIcon, StarIcon, FunnelIcon, ChartBarIcon, UserCircleIcon } from '../icons';
import { ACADEMY_MODULES } from '../../utils/adminAcademyConfig';

const ReviewsDashboard: React.FC = () => {
    const { reviews } = useAppState();
    const dispatch = useAppDispatch();
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [filterAcademy, setFilterAcademy] = useState<string>('all');

    const filteredReviews = useMemo(() => {
        return reviews.filter(review => {
            const statusMatch = filterStatus === 'all' || review.status === filterStatus || (!review.status && filterStatus === 'approved'); // Default legacy reviews to approved
            
            let academyMatch = true;
            if (filterAcademy !== 'all') {
                const config = ACADEMY_MODULES.find(m => m.id === filterAcademy);
                academyMatch = config ? config.courseIds.includes(review.courseId) : false;
            }
            
            return statusMatch && academyMatch;
        });
    }, [reviews, filterStatus, filterAcademy]);

    const handleUpdateStatus = (reviewId: string, status: 'approved' | 'rejected') => {
        dispatch({ type: 'UPDATE_REVIEW_STATUS', payload: { reviewId, status } });
    };

    const handleDelete = (reviewId: string) => {
        if (window.confirm('آیا از حذف این نظر مطمئن هستید؟ این عملیات غیرقابل بازگشت است.')) {
            dispatch({ type: 'DELETE_REVIEW', payload: { reviewId } });
        }
    };
    
    // Calculate Stats
    const stats = useMemo(() => {
        const total = reviews.length;
        const pending = reviews.filter(r => r.status === 'pending').length;
        const approved = reviews.filter(r => r.status === 'approved' || !r.status).length;
        const rejected = reviews.filter(r => r.status === 'rejected').length;
        const avgRating = total > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : '0.0';
        return { total, pending, approved, rejected, avgRating };
    }, [reviews]);

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">کل نظرات</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-yellow-700/50">
                    <p className="text-xs text-gray-400 mb-1">در انتظار بررسی</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                </div>
                 <div className="bg-gray-800 p-4 rounded-xl border border-green-700/50">
                    <p className="text-xs text-gray-400 mb-1">تایید شده</p>
                    <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
                </div>
                 <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">میانگین امتیاز</p>
                    <div className="flex items-center gap-1">
                         <p className="text-2xl font-bold text-white">{stats.avgRating}</p>
                         <StarIcon className="w-5 h-5 text-yellow-400 fill-current"/>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-white font-bold">
                    <QuoteIcon className="w-6 h-6 text-blue-400" />
                    <h3>مدیریت سوشیال پروف</h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <select 
                            value={filterAcademy} 
                            onChange={(e) => setFilterAcademy(e.target.value)}
                            className="w-full sm:w-48 bg-gray-700 text-white text-sm rounded-lg p-2.5 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
                        >
                            <option value="all">همه بخش‌ها</option>
                            {ACADEMY_MODULES.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                        </select>
                        <FunnelIcon className="absolute left-2 top-3 w-4 h-4 text-gray-400 pointer-events-none"/>
                    </div>
                    <div className="relative">
                         <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="w-full sm:w-40 bg-gray-700 text-white text-sm rounded-lg p-2.5 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
                        >
                            <option value="all">همه وضعیت‌ها</option>
                            <option value="pending">در انتظار (Pending)</option>
                            <option value="approved">تایید شده (Approved)</option>
                            <option value="rejected">رد شده (Rejected)</option>
                        </select>
                        <ChartBarIcon className="absolute left-2 top-3 w-4 h-4 text-gray-400 pointer-events-none"/>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                    {filteredReviews.length > 0 ? (
                        <div className="divide-y divide-gray-700">
                            {filteredReviews.map(review => (
                                <div key={review.id} className="p-5 hover:bg-gray-800/50 transition-colors flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            {review.userAvatar ? (
                                                 <img src={review.userAvatar} alt={review.userName} className="w-10 h-10 rounded-full object-cover border border-gray-600" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                                                    <UserCircleIcon className="w-6 h-6"/>
                                                </div>
                                            )}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-white text-sm">{review.userName}</p>
                                                    {review.isVerifiedBuyer && (
                                                        <span className="text-[10px] bg-green-900/40 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30">خریدار</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                     <div className="flex text-yellow-400 text-xs">
                                                        {[...Array(5)].map((_, i) => (
                                                            <StarIcon key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-600'}`} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-gray-500">• {new Date(review.date).toLocaleDateString('fa-IR')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                                                review.status === 'pending' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-700/50' :
                                                review.status === 'approved' ? 'bg-green-900/20 text-green-400 border-green-700/50' :
                                                'bg-red-900/20 text-red-400 border-red-700/50'
                                            }`}>
                                                {review.status === 'pending' ? 'در انتظار بررسی' : review.status === 'approved' ? 'تایید شده' : 'رد شده'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-800/80 p-3 rounded-lg border border-gray-700/50 relative">
                                        <QuoteIcon className="w-4 h-4 text-gray-600 absolute top-2 right-2 opacity-50"/>
                                        <p className="text-gray-300 text-sm leading-relaxed pl-2 pr-6">
                                            {review.text}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-xs text-gray-500">مربوط به: <span className="text-gray-400">{review.courseId}</span></p>
                                        <div className="flex gap-2">
                                            {review.status !== 'approved' && (
                                                <button onClick={() => handleUpdateStatus(review.id, 'approved')} className="flex items-center gap-1 px-3 py-1.5 bg-green-600/10 text-green-400 border border-green-600/30 rounded-lg hover:bg-green-600 hover:text-white transition-all text-xs font-medium">
                                                    <CheckCircleIcon className="w-4 h-4" /> تایید
                                                </button>
                                            )}
                                            {review.status !== 'rejected' && (
                                                <button onClick={() => handleUpdateStatus(review.id, 'rejected')} className="flex items-center gap-1 px-3 py-1.5 bg-orange-600/10 text-orange-400 border border-orange-600/30 rounded-lg hover:bg-orange-600 hover:text-white transition-all text-xs font-medium">
                                                    <XMarkIcon className="w-4 h-4" /> رد
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(review.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-600/10 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600 hover:text-white transition-all text-xs font-medium">
                                                <TrashIcon className="w-4 h-4" /> حذف
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <QuoteIcon className="w-16 h-16 mb-4 opacity-20" />
                            <p>هیچ نظری با فیلترهای فعلی یافت نشد.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewsDashboard;
