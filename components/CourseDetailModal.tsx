


import React, { useState } from 'react';
import { Course, CartItem, View } from '../types.ts';
import Modal from './Modal.tsx';
// FIX: Changed BarChartIcon to ChartBarIcon as it's the correct name in icons.tsx.
// FIX: Refactored to use useAppDispatch from ../AppContext
import { useAppDispatch } from '../AppContext.tsx';
import { ClockIcon, ChartBarIcon, UsersIcon, ShoppingCartIcon, StarIcon, HandshakeIcon, AcademicCapIcon } from './icons.tsx';
import CourseReviews, { AddReviewForm } from './CourseReviews.tsx';

interface CourseDetailModalProps {
    course: Course;
    onClose: () => void;
}

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({ course, onClose }) => {
    // FIX: Refactored to use useAppDispatch from ../AppContext
    const dispatch = useAppDispatch();
    const pointsReward = Math.floor(course.price / 1000);
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

    const onAddToCart = () => {
        const cartItem: CartItem = {
            id: course.id,
            // FIX: The 'productId' property was missing and is required by the 'CartItem' type.
            productId: course.id,
            name: course.title,
            price: course.price,
            quantity: 1,
            image: course.imageUrl,
            stock: 999, // Assuming courses are always available
            type: 'course',
            popularity: 100,
            dateAdded: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_TO_CART', payload: { product: cartItem, quantity: 1 } });
        dispatch({ type: 'TOGGLE_CART', payload: true });
        onClose();
    };

    const handleOpenInstallmentModal = () => {
        // Since we can't open a new modal from here without context changes,
        // we add to cart with a default installment plan as a functional replacement.
        const cartItem: CartItem = {
            id: course.id,
            // FIX: The 'productId' property was missing and is required by the 'CartItem' type.
            productId: course.id,
            name: course.title,
            price: course.price,
            quantity: 1,
            image: course.imageUrl,
            stock: 999,
            type: 'course',
            paymentPlan: { installments: 4 }, // Default to 4 installments
            popularity: 100,
            dateAdded: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_TO_CART', payload: { product: cartItem, quantity: 1, paymentPlan: { installments: 4 } } });
        dispatch({ type: 'TOGGLE_CART', payload: true });
        onClose();
    };


    return (
        <>
            <Modal isOpen={!!course} onClose={onClose}>
                <div className="w-[90vw] max-w-3xl bg-white dark:bg-stone-900 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <div className="relative">
                        <img src={course.imageUrl} alt={course.title} className="w-full h-64 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 w-full p-6">
                             <div className="flex flex-wrap gap-2 mb-2">
                                {course.tags.map(tag => (
                                    <span key={tag} className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-white border border-white/10">{tag}</span>
                                ))}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-1">{course.title}</h2>
                            <p className="font-medium text-amber-300">مدرس: {course.instructor}</p>
                        </div>
                    </div>
                    
                    <div className="p-6 md:p-8">
                        {/* Stats Bar */}
                        <div className="flex flex-wrap gap-6 mb-8 p-4 bg-stone-800 rounded-xl border border-stone-700">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><ClockIcon className="w-5 h-5" /></div>
                                <div><p className="text-xs text-stone-400">مدت دوره</p><p className="font-bold text-stone-200">{course.duration}</p></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><ChartBarIcon className="w-5 h-5" /></div>
                                <div><p className="text-xs text-stone-400">سطح</p><p className="font-bold text-stone-200">{course.level}</p></div>
                            </div>
                             <div className="flex items-center gap-2">
                                <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><UsersIcon className="w-5 h-5" /></div>
                                <div><p className="text-xs text-stone-400">دانشجویان</p><p className="font-bold text-stone-200">۱۲۳ نفر</p></div>
                            </div>
                        </div>

                        <div className="prose prose-invert prose-stone max-w-none mb-8">
                             <h3 className="text-xl font-bold text-white mb-2">درباره این دوره</h3>
                            <p className="text-stone-300 leading-relaxed whitespace-pre-wrap">{course.longDescription}</p>
                        </div>

                         {/* Syllabus if available */}
                         {course.syllabus && (
                             <div className="mb-8">
                                 <h3 className="text-xl font-bold text-white mb-4">سرفصل‌ها</h3>
                                 <div className="space-y-2">
                                     {course.syllabus.map((item, idx) => (
                                         <div key={idx} className="flex items-center gap-3 p-3 bg-stone-800/50 rounded-lg border border-stone-700/50">
                                             <span className="w-6 h-6 flex items-center justify-center bg-stone-700 rounded-full text-xs font-bold text-stone-400">{idx + 1}</span>
                                             <span className="text-stone-300">{item}</span>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         )}

                        {/* Purchase Box */}
                        <div className="mt-6 p-6 bg-gradient-to-br from-stone-800 to-stone-800/50 rounded-2xl border border-amber-500/20 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                             
                             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                                 <div className="text-center md:text-right space-y-2">
                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                        <HandshakeIcon className="w-6 h-6 text-green-500" />
                                        <span className="font-bold text-green-400">تاثیر اجتماعی خرید شما</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                         <span className="text-3xl font-black text-white">{(course.price * 0.9).toLocaleString('fa-IR')}</span>
                                         <span className="text-sm text-stone-400">تومان سرمایه‌گذاری</span>
                                    </div>
                                    <p className="text-xs text-stone-500">
                                        (قیمت کل: {course.price.toLocaleString('fa-IR')} تومان)
                                    </p>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-900/30 border border-yellow-700/30 rounded-full text-yellow-400 text-xs font-semibold mt-2">
                                        <StarIcon className="w-3 h-3" />
                                        <span>{pointsReward.toLocaleString('fa-IR')} امتیاز هدیه</span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-3 w-full md:w-auto min-w-[200px]">
                                    <button onClick={onAddToCart} className="w-full bg-amber-500 text-black font-bold px-6 py-3.5 rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transform hover:scale-105">
                                        <ShoppingCartIcon className="w-5 h-5" />
                                        ثبت نام در دوره
                                    </button>
                                     <button 
                                        onClick={() => handleOpenInstallmentModal()}
                                        className="w-full text-sm font-semibold text-stone-400 hover:text-white bg-stone-700/50 px-4 py-2.5 rounded-xl hover:bg-stone-700 transition-colors"
                                    >
                                        پرداخت قسطی
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Reviews Section */}
                        <CourseReviews 
                            courseId={course.id} 
                            onAddReviewClick={() => setIsReviewFormOpen(true)}
                        />
                    </div>
                </div>
            </Modal>

            <AddReviewForm 
                isOpen={isReviewFormOpen}
                onClose={() => setIsReviewFormOpen(false)}
                courseId={course.id}
            />
        </>
    );
};

export default CourseDetailModal;
