
import React, { useState } from 'react';
import { User, ProjectProposal } from '../types';
import { SparklesIcon, HeartIcon, TrophyIcon, CheckCircleIcon } from './icons';
import { analyzeProjectProposal, getAIAssistedText } from '../services/geminiService';
import { useAppDispatch } from '../AppContext';

interface CoCreationViewProps {
    user: User | null;
    proposals: ProjectProposal[];
}

const ProposalCard: React.FC<{
    proposal: ProjectProposal;
    onAnalyze: (proposalId: string) => void;
    isLoadingAnalysis: boolean;
}> = ({ proposal, onAnalyze, isLoadingAnalysis }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col">
            <div className="flex items-center mb-4">
                <img src={proposal.proposerAvatar} alt={proposal.proposerName} className="w-10 h-10 rounded-full object-cover" />
                <div className="mr-3">
                    <p className="font-semibold text-white">{proposal.proposerName}</p>
                    <p className="text-xs text-gray-400">{new Date(proposal.dateSubmitted).toLocaleDateString('fa-IR')}</p>
                </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-green-300 flex-grow">{proposal.title}</h3>
            <p className="text-sm text-gray-300 mb-4 flex-grow">{proposal.description}</p>
            
            <div className="flex justify-between items-center text-sm mb-4">
                <div className="flex items-center gap-1 text-yellow-400">
                    <TrophyIcon className="w-5 h-5" />
                    <span>{proposal.pledgedPoints.toLocaleString('fa-IR')}</span>
                </div>
                <div className="flex items-center gap-1 text-red-400">
                    <HeartIcon className="w-5 h-5" />
                    <span>{proposal.votes.toLocaleString('fa-IR')}</span>
                </div>
            </div>

            {proposal.aiAnalysis ? (
                <div className="bg-gray-700/50 p-3 rounded-md text-xs space-y-2">
                    <h4 className="font-bold text-white mb-1">تحلیل AI:</h4>
                    <p><strong className="text-green-400">نقاط قوت:</strong> {proposal.aiAnalysis.pros.join('، ')}</p>
                    <p><strong className="text-red-400">چالش‌ها:</strong> {proposal.aiAnalysis.cons.join('، ')}</p>
                    <p><strong className="text-blue-400">تاثیر بالقوه:</strong> {proposal.aiAnalysis.potentialImpact}</p>
                </div>
            ) : (
                <button
                    onClick={() => onAnalyze(proposal.id)}
                    disabled={isLoadingAnalysis}
                    className="w-full flex items-center justify-center gap-2 text-sm py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:bg-gray-600"
                >
                    <SparklesIcon className="w-4 h-4" />
                    {isLoadingAnalysis ? 'در حال تحلیل...' : 'تحلیل با هوش مصنوعی'}
                </button>
            )}
        </div>
    );
};


const CoCreationView: React.FC<CoCreationViewProps> = ({ user, proposals }) => {
    const dispatch = useAppDispatch();
    const [loadingAnalysisId, setLoadingAnalysisId] = useState<string | null>(null);
    const [newProposalTitle, setNewProposalTitle] = useState('');
    const [newProposalDescription, setNewProposalDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [isAIAssistLoading, setIsAIAssistLoading] = useState(false);

    const handleAnalyze = async (proposalId: string) => {
        const proposal = proposals.find(p => p.id === proposalId);
        if (!proposal) return;

        setLoadingAnalysisId(proposalId);
        try {
            const analysis = await analyzeProjectProposal({ title: proposal.title, description: proposal.description });
            dispatch({ type: 'UPDATE_PROPOSAL', payload: { id: proposalId, aiAnalysis: analysis } });
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingAnalysisId(null);
        }
    };
    
    const handleDescriptionAIAssist = async (mode: 'generate' | 'improve') => {
        setIsAIAssistLoading(true);
        try {
            const response = await getAIAssistedText({
                mode,
                type: 'proposal_description',
                text: mode === 'generate' ? newProposalTitle : newProposalDescription,
                context: newProposalTitle
            });
            setNewProposalDescription(response);
        } catch (e) {
            console.error(e);
        } finally {
            setIsAIAssistLoading(false);
        }
    };
    
    const handleSubmitProposal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newProposalTitle.trim() || !newProposalDescription.trim()) return;

        setIsSubmitting(true);
        const newProposal: ProjectProposal = {
            id: `prop-${Date.now()}`,
            proposerId: user.id,
            proposerName: user.fullName || user.name,
            proposerAvatar: user.avatar || `https://i.pravatar.cc/150?u=${user.id}`,
            title: newProposalTitle,
            description: newProposalDescription,
            dateSubmitted: new Date().toISOString(),
            status: 'در حال بررسی',
            votes: 0,
            pledgedPoints: 0,
        };

        setTimeout(() => {
            dispatch({ type: 'ADD_PROPOSAL', payload: newProposal });
            setIsSubmitting(false);
            setSubmitSuccess(true);
            setNewProposalTitle('');
            setNewProposalDescription('');
            setTimeout(() => setSubmitSuccess(false), 3000);
        }, 1000);
    };

    return (
        <div className="pt-22 pb-24 min-h-screen bg-gray-900 text-white">
            {/* Hero Section */}
            <div className="relative pb-20 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/cocreation-bg/1920/1080')" }}>
                <div className="absolute inset-0 bg-black bg-opacity-70"></div>
                <div className="relative container mx-auto px-6 text-center z-10">
                    <h1 className="text-5xl font-bold mb-4">استودیوی هم‌آفرینی معنا</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        اینجا فضایی برای همکاری و خلق ارزش‌های جدید است. ایده شما، با حمایت جامعه، می‌تواند به یک پروژه واقعی تبدیل شود.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-16">
                <section className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold">ایده خود را مطرح کنید</h2>
                        <p className="text-lg text-gray-400 mt-4 max-w-3xl mx-auto">
                            آیا ایده‌ای برای یک پروژه اجتماعی یا یک محصول جدید دارید؟ آن را با جامعه به اشتراک بگذارید و از حمایت دیگران برخوردار شوید.
                        </p>
                    </div>
                    {user ? (
                        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg border border-gray-700">
                            {submitSuccess ? (
                                <div className="text-center">
                                    <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold">پیشنهاد شما ثبت شد!</h3>
                                    <p className="text-gray-300 mt-2">پس از بررسی اولیه، در لیست پیشنهادهای جامعه نمایش داده خواهد شد. از مشارکت شما سپاسگزاریم.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitProposal} className="space-y-6">
                                    <div>
                                        <label htmlFor="proposalTitle" className="block text-sm font-medium text-gray-300 mb-2">عنوان پیشنهاد</label>
                                        <input type="text" id="proposalTitle" value={newProposalTitle} onChange={e => setNewProposalTitle(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label htmlFor="proposalDescription" className="block text-sm font-medium text-gray-300">توضیحات کامل</label>
                                             <div className="flex items-center gap-2">
                                                <button type="button" onClick={() => handleDescriptionAIAssist('generate')} disabled={isAIAssistLoading || !newProposalTitle.trim()} className="flex items-center gap-1 text-xs py-1 px-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white disabled:bg-gray-500 disabled:cursor-not-allowed">
                                                    <SparklesIcon className="w-4 h-4"/> تولید از عنوان
                                                </button>
                                                <button type="button" onClick={() => handleDescriptionAIAssist('improve')} disabled={isAIAssistLoading || !newProposalDescription.trim()} className="flex items-center gap-1 text-xs py-1 px-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white disabled:bg-gray-500 disabled:cursor-not-allowed">
                                                    <SparklesIcon className="w-4 h-4"/> بهبود متن
                                                </button>
                                            </div>
                                        </div>
                                        <textarea id="proposalDescription" value={newProposalDescription} onChange={e => setNewProposalDescription(e.target.value)} rows={5} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500"></textarea>
                                    </div>
                                    <div>
                                        <button type="submit" disabled={isSubmitting || isAIAssistLoading} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-3 rounded-md transition-colors flex items-center justify-center">
                                            {isSubmitting ? 'در حال ثبت...' : 'ثبت پیشنهاد'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    ) : (
                        <div className="text-center bg-gray-800 p-8 rounded-lg max-w-2xl mx-auto border-2 border-dashed border-gray-600">
                            <h3 className="text-xl font-semibold">برای ارائه پیشنهاد، ابتدا وارد شوید.</h3>
                            <p className="text-gray-400 my-2">با ورود به حساب کاربری خود، می‌توانید ایده‌هایتان را با جامعه به اشتراک بگذارید.</p>
                            <button onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true })} className="mt-2 text-sm py-2 px-5 bg-green-600 hover:bg-green-700 rounded-md transition-colors">
                                ورود / ثبت‌نام
                            </button>
                        </div>
                    )}
                </section>


                {/* Proposals Section */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold">پیشنهادهای جامعه</h2>
                        <p className="text-lg text-gray-400 mt-4 max-w-3xl mx-auto">
                            ایده‌های اعضای جامعه را ببینید، با امتیاز خود از آن‌ها حمایت کنید و در شکل‌دهی به آینده نخلستان معنا سهیم باشید.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {proposals.map(proposal => (
                            <ProposalCard 
                                key={proposal.id}
                                proposal={proposal}
                                onAnalyze={handleAnalyze}
                                isLoadingAnalysis={loadingAnalysisId === proposal.id}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CoCreationView;
