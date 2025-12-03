import React, { useState } from 'react';
import { User, TimelineEvent, CommunityProject, MentorshipRequest, ProjectUpdate } from '../types.ts';
// FIX: Corrected import paths for admin components.
import UserManagement from './UserManagement.tsx';
import ExecutiveDashboard from './ExecutiveDashboard.tsx';
import MentorshipDashboard from './MentorshipDashboard.tsx';
import AIInsightsDashboard from './AIInsightsDashboard.tsx';
import AdminAICoach from './AdminAICoach.tsx';
// import GrowthAnalyticsDashboard from './GrowthAnalyticsDashboard.tsx';
import WebProjectsDashboard from './WebProjectsDashboard.tsx';
import { ChartPieIcon, UsersIcon, ShieldCheckIcon, SparklesIcon, BrainCircuitIcon, SitemapIcon } from './icons.tsx';

// FIX: Added a placeholder as the component file is empty.
const GrowthAnalyticsDashboard: React.FC<any> = () => <div>Growth Analytics Dashboard (Placeholder)</div>;

interface AdminPanelPageProps {
    user: User;
    allUsers: User[];
    allInsights: TimelineEvent[];
    allProjects: CommunityProject[];
    mentorshipRequests: MentorshipRequest[];
    onUpdateInsightStatus: (insightId: string, status: 'approved' | 'rejected') => void;
    onAddProjectUpdate: (projectId: string, update: Omit<ProjectUpdate, 'date'>) => void;
    onAdminUpdateUser: (userId: string, updatedData: Partial<User>) => void;
    onRespondToRequest: (requestId: string, response: 'accepted' | 'rejected') => void;
    onAdminGrantPoints: (userId: string, points: number, reason: string) => void;
}

type AdminTab = 'executive' | 'operations' | 'growth';
type OperationsSubTab = 'users' | 'mentorship' | 'ai-insights' | 'ai-coach' | 'web-projects';

const AdminPanelPage: React.FC<AdminPanelPageProps> = (props) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('operations');
    const [activeSubTab, setActiveSubTab] = useState<OperationsSubTab>('web-projects');

    const renderMainContent = () => {
        switch (activeTab) {
            case 'executive':
                return <ExecutiveDashboard allUsers={props.allUsers} allProjects={props.allProjects} allInsights={props.allInsights} mentorshipRequests={props.mentorshipRequests} setActiveTab={setActiveTab} setActiveSubTab={setActiveSubTab} />;
            case 'operations':
                return (
                    <div className="flex flex-col md:flex-row gap-8">
                        <aside className="md:w-1/4">
                             <nav className="space-y-2">
                                <SubTabButton title="جلسه هیئت مدیره" icon={BrainCircuitIcon} isActive={activeSubTab === 'ai-coach'} onClick={() => setActiveSubTab('ai-coach')} />
                                <SubTabButton title="پروژه‌های وب" icon={SitemapIcon} isActive={activeSubTab === 'web-projects'} onClick={() => setActiveSubTab('web-projects')} />
                                <SubTabButton title="مدیریت کاربران" icon={UsersIcon} isActive={activeSubTab === 'users'} onClick={() => setActiveSubTab('users')} />
                                <SubTabButton title="مربی‌گری" icon={ShieldCheckIcon} isActive={activeSubTab === 'mentorship'} onClick={() => setActiveSubTab('mentorship')} />
                                <SubTabButton title="تحلیل تاملات" icon={SparklesIcon} isActive={activeSubTab === 'ai-insights'} onClick={() => setActiveSubTab('ai-insights')} />
                            </nav>
                        </aside>
                        <main className="flex-1">
                            {renderSubTabContent()}
                        </main>
                    </div>
                );
            case 'growth':
                 return <GrowthAnalyticsDashboard allUsers={props.allUsers} allInsights={props.allInsights} />;
            default:
                return null;
        }
    };
    
    const renderSubTabContent = () => {
        switch (activeSubTab) {
            case 'users':
                return <UserManagement allUsers={props.allUsers} onAdminUpdateUser={props.onAdminUpdateUser} onAdminGrantPoints={props.onAdminGrantPoints} />;
            case 'mentorship':
                return <MentorshipDashboard allUsers={props.allUsers} mentorshipRequests={props.mentorshipRequests} />;
            case 'ai-insights':
                return <AIInsightsDashboard allInsights={props.allInsights} allProjects={props.allProjects} onUpdateInsightStatus={props.onUpdateInsightStatus} onAddProjectUpdate={props.onAddProjectUpdate} />;
            case 'ai-coach':
                 return <AdminAICoach 
                    allUsers={props.allUsers}
                    allInsights={props.allInsights}
                    allProjects={props.allProjects}
                    mentorshipRequests={props.mentorshipRequests}
                    onAddProjectUpdate={props.onAddProjectUpdate}
                    onUpdateInsightStatus={props.onUpdateInsightStatus}
                    onRespondToRequest={props.onRespondToRequest}
                    onGrantPoints={props.onAdminGrantPoints}
                />;
            case 'web-projects':
                return <WebProjectsDashboard allUsers={props.allUsers} onAdminUpdateUser={props.onAdminUpdateUser} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold">مرکز فرماندهی استراتژیک</h1>
                <p className="text-stone-500 dark:text-stone-400">نمای کلی مدیریت پلتفرم نخلستان معنا</p>
            </div>
            <div className="flex justify-center border-b border-stone-200 dark:border-stone-700">
                <TabButton title="نبض جنبش" icon={ChartPieIcon} isActive={activeTab === 'executive'} onClick={() => setActiveTab('executive')} />
                <TabButton title="عملیات" icon={UsersIcon} isActive={activeTab === 'operations'} onClick={() => setActiveTab('operations')} />
                <TabButton title="رشد و تحلیل" icon={SparklesIcon} isActive={activeTab === 'growth'} onClick={() => setActiveTab('growth')} />
            </div>
            <div>
                {renderMainContent()}
            </div>
        </div>
    );
};

const TabButton: React.FC<{ title: string; icon: React.FC<any>; isActive: boolean; onClick: () => void }> = ({ title, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 font-semibold transition-colors ${isActive ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100'}`}
    >
        <Icon className="w-5 h-5" />
        {title}
    </button>
);

const SubTabButton: React.FC<{ title: string; icon: React.FC<any>; isActive: boolean; onClick: () => void }> = ({ title, icon: Icon, isActive, onClick }) => (
     <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-right rounded-lg transition-colors ${isActive ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200' : 'hover:bg-stone-100 dark:hover:bg-stone-700'}`}
    >
        <Icon className="w-5 h-5" />
        {title}
    </button>
);


export default AdminPanelPage;