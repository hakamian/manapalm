


import React from 'react';
import { LeafIcon, QrCodeIcon, ShieldCheckIcon } from './icons.tsx';

interface CertificateProps {
    userName: string;
    palmName: string;
    date: string;
    certificateId: string;
}

const Certificate: React.FC<CertificateProps> = ({ userName, palmName, date, certificateId }) => {
    
    return (
        <div className="bg-amber-50 dark:bg-stone-800 p-6 sm:p-8 rounded-lg shadow-lg max-w-md mx-auto border-4 border-amber-300/80 dark:border-amber-800/80 relative">
            <div 
                className="absolute inset-0 bg-repeat opacity-5"
                style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a16207' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}
            ></div>
            <div className="relative z-10">
                <div className="text-center mb-4">
                    <LeafIcon className="w-14 h-14 text-amber-500 dark:text-amber-400 mx-auto" />
                    <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-200 mt-2">شناسنامه نخل</h1>
                    <p className="text-md text-stone-600 dark:text-stone-300">پروژه نخلستان معنا</p>
                </div>
                
                <div className="border-t-2 border-b-2 border-dashed border-amber-400 dark:border-amber-700 py-4 my-4 space-y-3 text-right">
                    <p><span className="font-semibold text-stone-700 dark:text-stone-300">صاحب امتیاز:</span> <span className="font-bold text-amber-800 dark:text-amber-300">{userName}</span></p>
                    <p><span className="font-semibold text-stone-700 dark:text-stone-300">نوع میراث:</span> <span className="font-bold text-amber-800 dark:text-amber-300">{palmName}</span></p>
                    <p><span className="font-semibold text-stone-700 dark:text-stone-300">تاریخ کاشت:</span> <span className="font-bold text-amber-800 dark:text-amber-300">{date}</span></p>
                    <p><span className="font-semibold text-stone-700 dark:text-stone-300">شماره شناسایی نخل:</span> <span className="font-bold text-amber-800 dark:text-amber-300 tracking-wider">{certificateId}</span></p>
                </div>
                
                <div className="flex justify-between items-center mt-6">
                    <div className="text-center">
                        <QrCodeIcon className="w-20 h-20 text-stone-700 dark:text-stone-300" />
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">اطلاعات بیشتر</p>
                    </div>
                    <div className="text-center">
                        <ShieldCheckIcon className="w-20 h-20 text-green-600 dark:text-green-400"/>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">مهر اصالت</p>
                    </div>
                </div>
                
                <p className="text-xs text-stone-500 dark:text-stone-400 text-center mt-6">
                    از شما برای پیوستن به جنبش ما و خلق تأثیری ماندگار سپاسگزاریم.
                </p>
            </div>
        </div>
    );
};

export default Certificate;