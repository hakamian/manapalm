'use client';

import React from 'react';
import { View } from '../types';
import { useAppDispatch } from '../AppContext';
import { CheckCircleIcon, ShieldCheckIcon, TruckIcon, CreditCardIcon } from './icons';

const TermsView: React.FC = () => {
    const dispatch = useAppDispatch();

    return (
        <div className="bg-gray-900 text-gray-300 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-gray-800 py-16 text-center border-b border-gray-700">
                <div className="container mx-auto px-6">
                    <h1 className="text-4xl font-bold text-white mb-4">قوانین و مقررات</h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        لطفاً قبل از خرید، قوانین و مقررات نخلستان معنا را به دقت مطالعه فرمایید. استفاده شما از خدمات ما به منزله پذیرش این قوانین است.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 max-w-4xl">

                {/* Section 1: Introduction */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <ShieldCheckIcon className="w-6 h-6 text-green-500" />
                        ۱. تعاریف و کلیات
                    </h2>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
                        <p>
                            به نخلستان معنا خوش آمدید. ما متعهد به ارائه خدمات شفاف و صادقانه هستیم. در این متن، «ما» به معنای تیم نخلستان معنا و «شما» به معنای کاربر یا خریدار عزیز است.
                        </p>
                        <p>
                            هدف ما ترویج فرهنگ درختکاری و ایجاد ارزش افزوده اجتماعی از طریق فروش محصولات ارگانیک و صنایع دستی است.
                        </p>
                    </div>
                </section>

                {/* Section 2: Products & Services */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <CheckCircleIcon className="w-6 h-6 text-blue-500" />
                        ۲. شرایط محصولات و خدمات
                    </h2>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>نخل‌های شناسنامه‌دار:</strong> خرید نخل به معنای حمایت از کاشت و نگهداری آن است. مالکیت معنوی به نام خریدار ثبت می‌شود اما مالکیت فیزیکی زمین متعلق به نخلستان است.</li>
                            <li><strong>محصولات فیزیکی (خرما و صنایع دستی):</strong> تمامی محصولات با ضمانت کیفیت ارسال می‌شوند. تصاویر محصولات تطابق حداکثری با کالای ارسالی دارند.</li>
                            <li><strong>محصولات دیجیتال و آموزشی:</strong> دسترسی به این محصولات بلافاصله پس از پرداخت فعال می‌شود.</li>
                        </ul>
                    </div>
                </section>

                {/* Section 3: Delivery & Returns */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <TruckIcon className="w-6 h-6 text-orange-500" />
                        ۳. رویه ارسال و مرجوعی
                    </h2>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
                        <h3 className="font-bold text-white">رویه ارسال:</h3>
                        <p>
                            سفارشات فیزیکی معمولاً طی ۳ تا ۷ روز کاری پردازش و ارسال می‌شوند. ارسال به سراسر ایران از طریق پست پیشتاز یا تیپاکس انجام می‌گردد.
                        </p>

                        <h3 className="font-bold text-white mt-4">شرایط مرجوعی (ضمانت بازگشت وجه):</h3>
                        <p>
                            رضایت شما اولویت ماست. در صورتی که محصول دریافتی دارای هرگونه نقص فیزیکی باشد یا با توضیحات سایت مغایرت داشته باشد:
                        </p>
                        <ul className="list-disc list-inside bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                            <li>تا <strong>۷ روز</strong> پس از دریافت کالا فرصت دارید موضوع را به پشتیبانی اطلاع دهید.</li>
                            <li>هزینه بازگشت کالای معیوب بر عهده نخلستان معنا خواهد بود.</li>
                            <li>وجه پرداختی پس از دریافت و بررسی کالا، ظرف ۴۸ ساعت به حساب شما بازگردانده می‌شود.</li>
                            <li>محصولات مواد غذایی (مانند خرما) در صورت باز شدن بسته‌بندی تنها در صورت فساد یا خرابی قابل بازگشت هستند.</li>
                        </ul>
                    </div>
                </section>

                {/* Section 4: Payments & Privacy */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <CreditCardIcon className="w-6 h-6 text-purple-500" />
                        ۴. حریم خصوصی و پرداخت
                    </h2>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
                        <p>
                            ما متعهد به حفظ حریم خصوصی اطلاعات شما هستیم. اطلاعات تماس و آدرس شما تنها برای پردازش سفارش استفاده می‌شود و در اختیار شخص ثالث قرار نمی‌گیرد.
                        </p>
                        <p>
                            تمامی پرداخت‌ها از طریق درگاه‌های امن بانکی (شاپرک) و با رعایت پروتکل‌های امنیتی انجام می‌شود. نخلستان معنا هیچ‌گونه دسترسی به اطلاعات کارت بانکی شما ندارد.
                        </p>
                    </div>
                </section>

                {/* Contact CTA */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-8 rounded-2xl text-center border border-gray-600 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-2">سوالی دارید؟</h3>
                    <p className="mb-6">تیم پشتیبانی ما آماده پاسخگویی به شماست.</p>
                    <button
                        onClick={() => dispatch({ type: 'SET_VIEW', payload: View.Contact })}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded-full transition-colors shadow-lg"
                    >
                        تماس با ما
                    </button>
                </div>

            </div>
        </div>
    );
};

export default TermsView;
