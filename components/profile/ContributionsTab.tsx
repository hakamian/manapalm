


import React, { useState } from 'react';
import { User, Contribution } from '../../types';
import { CheckCircleIcon, SparklesIcon } from '../icons';
import { getAIAssistedText } from '../../services/geminiService';
import { useAppState } from '../../AppContext'; // Import useAppState to access proposals

interface ContributionsTabProps {
    user: User;
    onUpdate: (updatedUser: Partial<User>) => void;
}

const ContributionsTab: React.FC<ContributionsTabProps> = ({ user, onUpdate }) => {
    const { proposals } = useAppState(); // Access global proposals state
    const [contributionType, setContributionType] = useState('course');
    const [contributionTitle, setContributionTitle] = useState('');
    const [contributionDescription, setContributionDescription] = useState('');
    const [contributionPrice, setContributionPrice] = useState('');
    const [contributionPercentage, setContributionPercentage] = useState(10);
    const [isSubmittingContribution, setIsSubmittingContribution] = useState(false);
    const [contributionSubmitted, setContributionSubmitted] = useState(false);
    const [isContribAIAssistLoading, setIsContribAIAssistLoading] = useState(false);
    const JOB_HOUR_COST = 50000;

    // Filter user's proposals from Co-Creation view
    const userProposals = proposals.filter(p => p.proposerId === user.id);

    const handleContribAIAssist = async (mode: 'generate' | 'improve') => {
        setIsContribAIAssistLoading(true);
        try {
            const response = await getAIAssistedText({
                mode,
                type: 'contribution_description',
                text: contributionDescription,
                context: contributionTitle,
            });
            setContributionDescription(response);
        } catch (e) {
            console.error(e);
        } finally {
            setIsContribAIAssistLoading(false);
        }
    };

    const handleContributionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingContribution(true);
        const newContribution: Contribution = {
            id: `contrib-${Date.now()}`,
            type: contributionType as any,
            title: contributionTitle,
            dateSubmitted: new Date().toISOString(),
            status: 'در حال بررسی',
            price: contributionType !== 'other' ? Number(contributionPrice) : undefined,
            socialImpactPercentage: contributionType !== 'other' ? contributionPercentage : undefined,
        };

        setTimeout(() => {
            const updatedContributions = [newContribution, ...(user.contributions || [])];
            onUpdate({ contributions: updatedContributions });
            setContributionTitle('');
            setContributionDescription('');
            setContributionPrice('');
            setContributionPercentage(10);
            setContributionSubmitted(true);
            setIsSubmittingContribution(false);
            setTimeout(() => setContributionSubmitted(false), 3000);
        }, 1000);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">هم‌آفرینی و مشارکت</h2>
            
            {/* Section for Co-Creation Proposals (New) */}
            {userProposals.length > 0 && (
                <div className="mb-8 bg-indigo-900/20 p-6 rounded-lg border border-indigo-500/30">
                    <h3 className="text-xl font-semibold mb-4 text-indigo-300">پیشنهادهای هم‌آفرینی شما (از استودیو)</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {userProposals.map(proposal => (
                            <div key={proposal.id} className="bg-gray-800/80 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-white">{proposal.title}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(proposal.dateSubmitted).toLocaleDateString('fa-IR')}</p>
                                    <p className="text-xs text-gray-300 mt-1 line-clamp-1">{proposal.description}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs px-2 py-1 rounded-full ${proposal.status === 'تایید شده' ? 'bg-green-600' : 'bg-yellow-600 text-black'}`}>
                                        {proposal.status}
                                    </span>
                                    <div className="mt-2 text-xs text-gray-400">
                                        {proposal.votes} رای | {proposal.pledgedPoints} امتیاز
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">ثبت مشارکت جدید (محصول/دوره)</h3>
                    {contributionSubmitted ? (
                        <div className="text-center p-8 bg-green-900/50 rounded-lg">
                            <CheckCircleIcon className="w-12 h-12 mx-auto text-green-400 mb-4" />
                            <p className="font-semibold">مشارکت شما با موفقیت ثبت شد!</p>
                            <p className="text-sm text-gray-300">پس از بررسی توسط تیم ما، نتیجه به شما اطلاع داده خواهد شد.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleContributionSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm">نوع مشارکت</label>
                                <select value={contributionType} onChange={e => setContributionType(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md mt-1">
                                    <option value="course">ارائه دوره</option>
                                    <option value="product">ارائه محصول</option>
                                    <option value="other">ایده و پیشنهاد دیگر</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm">عنوان</label>
                                <input type="text" value={contributionTitle} onChange={e => setContributionTitle(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md mt-1" />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-sm">توضیحات</label>
                                    <button 
                                        type="button" 
                                        onClick={() => handleContribAIAssist(contributionDescription ? 'improve' : 'generate')} 
                                        disabled={isContribAIAssistLoading} 
                                        className="flex items-center gap-1 text-xs py-1 px-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white disabled:bg-gray-500" title="کمک گرفتن از هوش مصنوعی">
                                        <SparklesIcon className="w-4 h-4"/>
                                        <span>{contributionDescription ? 'بهبود با AI' : 'کمک از AI'}</span>
                                    </button>
                                </div>
                                <textarea value={contributionDescription} onChange={e => setContributionDescription(e.target.value)} rows={4} required className="w-full bg-gray-700 p-2 rounded-md"></textarea>
                            </div>
                            {contributionType !== 'other' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="price" className="text-sm">قیمت پیشنهادی (تومان)</label>
                                            <input
                                                type="number"
                                                id="price"
                                                value={contributionPrice}
                                                onChange={e => setContributionPrice(e.target.value)}
                                                required
                                                className="w-full bg-gray-700 p-2 rounded-md mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="percentage" className="text-sm">درصد مشارکت ({contributionPercentage}%)</label>
                                            <input
                                                type="range"
                                                id="percentage"
                                                min="5"
                                                max="50"
                                                step="5"
                                                value={contributionPercentage}
                                                onChange={e => setContributionPercentage(Number(e.target.value))}
                                                className="w-full mt-3 accent-green-500"
                                            />
                                        </div>
                                    </div>
                                    {Number(contributionPrice) > 0 && (
                                        <div className="bg-green-900/40 border border-green-700 text-green-200 p-3 rounded-md text-center text-sm">
                                            <p>
                                                با هر فروش، شما <strong className="font-bold">{(Number(contributionPrice) * contributionPercentage / 100).toLocaleString('fa-IR')} تومان</strong> به پروژه‌ها کمک می‌کنید.
                                                <br />
                                                این معادل <strong className="font-bold">{((Number(contributionPrice) * contributionPercentage / 100) / JOB_HOUR_COST).toFixed(2)} ساعت</strong> اشتغال‌زایی است.
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                            <button type="submit" disabled={isSubmittingContribution} className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-md font-semibold disabled:bg-gray-500">
                                {isSubmittingContribution ? 'در حال ارسال...' : 'ثبت'}
                            </button>
                        </form>
                    )}
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">مشارکت‌های مستقیم شما</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                        {(user.contributions || []).length > 0 ? (
                            user.contributions?.map(c => (
                                <div key={c.id} className="bg-gray-700/50 p-3 rounded-md">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{c.title}</p>
                                            <p className="text-xs text-gray-400">{new Date(c.dateSubmitted).toLocaleDateString('fa-IR')}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${c.status === 'تایید شده' ? 'bg-green-600' : c.status === 'رد شده' ? 'bg-red-600' : 'bg-yellow-600 text-black'}`}>{c.status}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-10">هنوز مشارکتی ثبت نکرده‌اید.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContributionsTab;
