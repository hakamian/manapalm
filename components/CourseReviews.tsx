
import React, { useState } from 'react';
import { useAppDispatch, useAppState } from '../AppContext';
import { Review, Course } from '../types';
import { StarIcon, UserCircleIcon, CheckCircleIcon, PlusIcon, HeartIcon, QuoteIcon } from './icons';
import { getPastDate } from '../utils/dummyData';

interface CourseReviewsProps {
    courseId: string;
    onAddReviewClick: () => void; // Callback to open modal or form
}

const CourseReviews: React.FC<CourseReviewsProps> = ({ courseId, onAddReviewClick }) => {
    const { reviews, user } = useAppState();
    const dispatch = useAppDispatch();
    
    // Filter reviews for this course
    const courseReviews = reviews.filter(r => r.courseId === courseId);
    
    // Calculate Stats
    const totalReviews = courseReviews.length;
    const averageRating = totalReviews > 0 
        ? (courseReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) 
        : '0.0';
    
    const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
        stars,
        count: courseReviews.filter(r => r.rating === stars).length,
        percent: totalReviews > 0 ? (courseReviews.filter(r => r.rating === stars).length / totalReviews) * 100 : 0
    }));

    const handleLike = (reviewId: string) => {
        dispatch({ type: 'LIKE_REVIEW', payload: { reviewId } });
    };

    return (
        <div className="mt-12 border-t border-gray-700 pt-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <QuoteIcon className="w-8 h-8 text-amber-400" />
                <h3 className="text-2xl font-bold text-white">بازتاب تجربه دانشجویان</h3>
            </div>

            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                {/* Average Rating */}
                <div className="bg-gray-800/50 p-6 rounded-2xl text-center border border-gray-700 flex flex-col justify-center items-center">
                    <div className="text-5xl font-black text-white mb-2">{averageRating}</div>
                    <div className="flex text-yellow-400 mb-2">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className={`w-6 h-6 ${i < Math.round(Number(averageRating)) ? 'fill-current' : 'text-gray-600'}`} />
                        ))}
                    </div>
                    <p className="text-sm text-gray-400">از مجموع {totalReviews.toLocaleString('fa-IR')} دیدگاه</p>
                </div>

                {/* Rating Bars */}
                <div className="md:col-span-2 bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex flex-col justify-center">
                    <div className="space-y-2">
                        {ratingCounts.map((item) => (
                            <div key={item.stars} className="flex items-center gap-3">
                                <div className="w-12 text-sm text-gray-400 flex items-center gap-1">
                                    {item.stars} <StarIcon className="w-3 h-3" />
                                </div>
                                <div className="flex-grow bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className="bg-yellow-400 h-full rounded-full" 
                                        style={{ width: `${item.percent}%` }}
                                    ></div>
                                </div>
                                <div className="w-8 text-xs text-gray-500 text-left">{item.count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Review List */}
            <div className="space-y-6">
                {courseReviews.length > 0 ? (
                    courseReviews.map(review => (
                        <div key={review.id} className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <img src={review.userAvatar} alt={review.userName} className="w-12 h-12 rounded-full object-cover border-2 border-gray-600" />
                                    <div>
                                        <p className="font-bold text-white flex items-center gap-2">
                                            {review.userName}
                                            {review.isVerifiedBuyer && (
                                                <span className="text-[10px] bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full border border-green-700/50 flex items-center gap-0.5">
                                                    <CheckCircleIcon className="w-3 h-3" /> خریدار
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString('fa-IR')}</p>
                                    </div>
                                </div>
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-600'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-300 leading-relaxed mb-4 text-sm">
                                {review.text}
                            </p>
                            <div className="flex items-center gap-4 pt-4 border-t border-gray-700/50">
                                <button 
                                    onClick={() => handleLike(review.id)}
                                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors"
                                >
                                    <HeartIcon className="w-4 h-4" />
                                    <span>مفید بود ({review.helpfulCount})</span>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-dashed border-gray-700">
                        <p className="text-gray-400">هنوز دیدگاهی ثبت نشده است. شما اولین نفر باشید!</p>
                    </div>
                )}
            </div>
            
            {/* Add Review CTA */}
            <div className="mt-8 text-center">
                <button 
                    onClick={onAddReviewClick}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
                >
                    <PlusIcon className="w-5 h-5" />
                    ثبت تجربه من (+۵۰ امتیاز)
                </button>
                <p className="text-xs text-gray-500 mt-2">نظرات شما به دیگران کمک می‌کند تا مسیر درست را انتخاب کنند.</p>
            </div>
        </div>
    );
};

interface AddReviewFormProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
}

export const AddReviewForm: React.FC<AddReviewFormProps> = ({ isOpen, onClose, courseId }) => {
    const { user } = useAppState();
    const dispatch = useAppDispatch();
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        
        setIsSubmitting(true);
        
        // Mock API Call delay
        setTimeout(() => {
            const newReview: Review = {
                id: `rev_${Date.now()}`,
                courseId: courseId,
                userId: user?.id || 'guest',
                userName: user?.fullName || 'کاربر مهمان',
                userAvatar: user?.avatar || 'https://i.pravatar.cc/150?u=guest',
                rating: rating,
                text: text,
                date: new Date().toISOString(),
                helpfulCount: 0,
                isVerifiedBuyer: true // Assume true for demo if they can access course
            };
            
            dispatch({ type: 'ADD_REVIEW', payload: { review: newReview } });
            setIsSubmitting(false);
            setText('');
            setRating(5);
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 w-full max-w-lg rounded-2xl p-6 border border-gray-700 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-6 text-center">ثبت تجربه دوره</h3>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-6 flex justify-center">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <StarIcon 
                                        className={`w-10 h-10 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">داستان تحول شما چیست؟</label>
                        <textarea 
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                            placeholder="از تجربه خود در این دوره بنویسید. چه چیزی یاد گرفتید؟ چه تغییری کردید؟"
                        />
                    </div>
                    
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors">
                            انصراف
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting || !text.trim()} 
                            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'در حال ثبت...' : 'ثبت دیدگاه'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseReviews;
