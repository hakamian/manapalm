// Fix: Created the full content for GuardiansGrovePage.tsx.
import React, { useState, useMemo } from 'react';
import { User, MentorshipRequest, Page, View } from '../types.ts';
// FIX: Refactored to use useAppState and useAppDispatch
import { useAppState, useAppDispatch } from '../AppContext.tsx';
import { ShieldCheckIcon, UsersIcon, ClockIcon, EnvelopeIcon } from './icons.tsx';
import CheckInModal from './CheckInModal.tsx';
import MenteeBriefingModal from './MenteeBriefingModal.tsx';

const GuardiansGrovePage: React.FC = () => {
    // FIX: Refactored to use useAppState and useAppDispatch
    const { user: currentUser, allUsers, mentorshipRequests } = useAppState();
    const dispatch = useAppDispatch();
    
    // Mock handlers as reducer actions are not available
    const handleRespondToRequest = (requestId: string, response: 'accepted' | 'rejected') => {
        console.log(`Responding to request ${requestId} with ${response}`);
        // In a real app, this would be: dispatch({ type: 'RESPOND_TO_MENTOR_REQUEST', payload: { requestId, response } });
    };

    const handleSendCheckIn = (menteeId: string, prompt: string) => {
        console.log(`Sending check-in to mentee ${menteeId} with prompt: ${prompt}`);
        // In a real app, this would be: dispatch({ type: 'SEND_CHECK_IN', payload: { menteeId, prompt } });
    };

    const [activeTab, setActiveTab] = useState<'mentees' | 'requests'>('mentees');
    const [selectedMentee, setSelectedMentee] = useState<User | null>(null);
    const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
    const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);

    const myMentees = useMemo(() => {
        return allUsers.filter(u => currentUser?.menteeIds?.includes(u.id));
    }, [allUsers, currentUser]);

    const myRequests = useMemo(() => {
        return mentorshipRequests.filter(r => r.mentorId === currentUser?.id && r.status === 'pending');
    }, [mentorshipRequests, currentUser]);
    
    const handleOpenCheckIn = (mentee: User) => {
        setSelectedMentee(mentee);
        setIsCheckInModalOpen(true);
    };

    const handleOpenBriefing = (mentee: User) => {
        setSelectedMentee(mentee);
        setIsBriefingModalOpen(true);
    };
    
    const handleSendCheckInAction = (prompt: string) => {
        if(selectedMentee) {
            handleSendCheckIn(selectedMentee.id, prompt);
        }
    };

    if (!currentUser) {
        return <div>Loading...</div>
    }

    return (
        <>
            <div className="space-y-12">
                <section className="text-center">
                    <ShieldCheckIcon className="w-20 h-20 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-4xl md:text-5xl font-extrabold text-amber-900 dark:text-amber-200 mb-4">
                        سرای نگهبانان
                    </h1>
                    <p className="text-lg text-stone-700 dark:text-stone-300 max-w-2xl mx-auto">
                        اینجا فضای اختصاصی شما برای راهنمایی رهجویان و تاثیرگذاری عمیق‌تر در جامعه است.
                    </p>
                </section>
                
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-center border-b border-stone-200 dark:border-stone-700 mb-8">
                        <button onClick={() => setActiveTab('mentees')} className={`flex items-center gap-2 px-4 py-2 font-semibold transition-colors ${activeTab === 'mentees' ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500' : 'text-stone-500 hover:text-stone-800'}`}>
                            <UsersIcon className="w-5 h-5" /> رهجویان شما ({myMentees.length})
                        </button>
                        <button onClick={() => setActiveTab('requests')} className={`flex items-center gap-2 px-4 py-2 font-semibold transition-colors ${activeTab === 'requests' ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500' : 'text-stone-500 hover:text-stone-800'}`}>
                            <ClockIcon className="w-5 h-5" /> درخواست‌ها ({myRequests.length})
                        </button>
                    </div>

                    {activeTab === 'mentees' && (
                        <div className="space-y-4">
                            {myMentees.length > 0 ? myMentees.map(mentee => (
                                <div key={mentee.id} className="bg-white dark:bg-stone-800/50 p-4 rounded-lg shadow-sm border dark:border-stone-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img src={mentee.profileImageUrl} alt={mentee.name} className="w-12 h-12 rounded-full" />
                                        <div>
                                            <p className="font-bold">{mentee.name}</p>
                                            <p className="text-sm text-stone-500">{mentee.points} امتیاز</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenBriefing(mentee)} className="text-sm font-semibold bg-stone-100 dark:bg-stone-700 px-3 py-1.5 rounded-md hover:bg-stone-200">خلاصه وضعیت</button>
                                        <button onClick={() => handleOpenCheckIn(mentee)} className="text-sm font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-200 px-3 py-1.5 rounded-md hover:bg-amber-200 flex items-center gap-1">
                                            <EnvelopeIcon className="w-4 h-4" /> ارسال تامل
                                        </button>
                                    </div>
                                </div>
                            )) : <p className="text-center text-stone-500 py-8">هنوز هیچ رهجویی ندارید.</p>}
                        </div>
                    )}
                    
                    {activeTab === 'requests' && (
                        <div className="space-y-4">
                            {myRequests.length > 0 ? myRequests.map(req => (
                                <div key={req.id} className="bg-white dark:bg-stone-800/50 p-4 rounded-lg shadow-sm border dark:border-stone-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <p><span className="font-bold">{req.menteeName}</span> (سطح {req.menteeLevel}) درخواست مربی‌گری ارسال کرده است.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleRespondToRequest(req.id, 'accepted')} className="text-sm font-semibold bg-green-500 text-white px-4 py-1.5 rounded-md hover:bg-green-600">پذیرش</button>
                                        <button onClick={() => handleRespondToRequest(req.id, 'rejected')} className="text-sm font-semibold bg-stone-200 dark:bg-stone-600 px-4 py-1.5 rounded-md hover:bg-stone-300">رد</button>
                                    </div>
                                </div>
                            )) : <p className="text-center text-stone-500 py-8">هیچ درخواست جدیدی وجود ندارد.</p>}
                        </div>
                    )}
                </div>
            </div>
            {selectedMentee && (
                <>
                    <CheckInModal isOpen={isCheckInModalOpen} onClose={() => setIsCheckInModalOpen(false)} onSend={handleSendCheckInAction} menteeName={selectedMentee.name} />
                    <MenteeBriefingModal isOpen={isBriefingModalOpen} onClose={() => setIsBriefingModalOpen(false)} mentee={selectedMentee} />
                </>
            )}
        </>
    );
};

export default GuardiansGrovePage;
