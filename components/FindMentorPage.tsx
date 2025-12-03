
import React, { useState } from 'react';
import { User, Page, MentorshipRequest } from '../types.ts';
import { getUserLevel } from '../utils/gamification.ts';
import { UsersGroupIcon, StarIcon, LeafIcon } from './icons.tsx';

interface FindMentorPageProps {
    user: User;
    allUsers: User[];
    mentorshipRequests: MentorshipRequest[];
    onRequestMentor: (mentorId: string) => void;
}

const MentorCard: React.FC<{ mentor: User, onRequest: () => void, alreadyRequested: boolean }> = ({ mentor, onRequest, alreadyRequested }) => {
    const level = getUserLevel(mentor.points);
    const palmsPlanted = 50 + Math.floor(mentor.points / 100); // Mock calculation

    return (
        <div className="bg-white dark:bg-stone-800/50 p-6 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50 flex flex-col text-center">
            <img src={mentor.profileImageUrl || `https://ui-avatars.com/api/?name=${mentor.name}&background=a16207&color=fff&size=96`} alt={mentor.name} className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-white dark:ring-stone-800"/>
            <h3 className="text-xl font-bold mt-4">{mentor.name}</h3>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">{level.name}</p>
            <blockquote className="my-4 flex-grow">
                <p className="italic text-stone-600 dark:text-stone-300">"{mentor.mentorBio || 'در مسیر معنا، همراه شما خواهم بود.'}"</p>
            </blockquote>
            <div className="flex justify-center gap-4 text-sm text-stone-500 dark:text-stone-400 border-t border-b dark:border-stone-700 py-2 my-4">
                <span className="flex items-center gap-1"><StarIcon className="w-4 h-4"/> {mentor.points.toLocaleString('fa-IR')} امتیاز</span>
                <span className="flex items-center gap-1"><LeafIcon className="w-4 h-4"/> {palmsPlanted.toLocaleString('fa-IR')} میراث</span>
            </div>
            <button
                onClick={onRequest}
                disabled={alreadyRequested}
                className="w-full bg-amber-500 text-white font-semibold py-2.5 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-stone-300 dark:disabled:bg-stone-600 disabled:cursor-not-allowed"
            >
                {alreadyRequested ? 'درخواست ارسال شد' : 'درخواست مربی‌گری'}
            </button>
        </div>
    );
};


const FindMentorPage: React.FC<FindMentorPageProps> = ({ user, allUsers, mentorshipRequests, onRequestMentor }) => {
    const availableMentors = allUsers.filter(u => u.isGuardian && u.id !== user.id);
    const pendingRequest = mentorshipRequests.find(r => r.menteeId === user.id && r.status === 'pending');

    return (
         <div className="space-y-16 animate-fade-in-up">
            <section className="text-center container mx-auto px-4">
                <UsersGroupIcon className="w-20 h-20 text-amber-500 mx-auto mb-4" />
                <h1 className="text-4xl md:text-5xl font-extrabold text-amber-900 dark:text-amber-200 mb-4 leading-tight">
                    یک راهنما در مسیر خود پیدا کنید
                </h1>
                <p className="text-lg md:text-xl text-stone-700 dark:text-stone-300 max-w-3xl mx-auto">
                   نگهبانان ما، باتجربه‌ترین اعضای این جنبش هستند که آماده‌اند تا دانش و بینش خود را با شما به اشتراک بگذارند. یک مربی انتخاب کنید تا در این سفر تنها نباشید.
                </p>
            </section>

             <section className="container mx-auto px-4 max-w-6xl">
                 {user.mentorId ? (
                     <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                        <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">شما یک مربی راهنما دارید!</h3>
                        <p className="mt-2 text-stone-600 dark:text-stone-300">مربی شما، <span className="font-bold">{user.mentorName}</span>، در این سفر همراه شماست. می‌توانید از طریق پروفایل خود با او در ارتباط باشید.</p>
                    </div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {availableMentors.map(mentor => (
                            <MentorCard 
                                key={mentor.id}
                                mentor={mentor}
                                onRequest={() => onRequestMentor(mentor.id)}
                                alreadyRequested={!!pendingRequest}
                            />
                        ))}
                    </div>
                 )}
            </section>
         </div>
    );
};

export default FindMentorPage;