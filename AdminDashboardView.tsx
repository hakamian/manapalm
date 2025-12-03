
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Order, CommunityPost, OrderStatus, CartItem, Campaign, PalmType, ChatMessage, ProactiveReport, AdvisorType, IndividualOpinion, Suggestion, ArticleDraft, CommunityProject, ProjectUpdate } from './types';
import { useAppState, useAppDispatch } from './AppContext';
import { 
    getBoardMeetingAdvice, 
    analyzeCommunitySentimentAndTopics, 
    generateSegmentActionPlan, 
    generateText, 
    generateExecutionPlan, 
    generateOpportunityRadarInsights, 
    synthesizeDecisionFromOpinions, 
    generateOperationalPlans, 
    getAdvisorChatResponse, 
    generateProactiveWeeklyReport,
    getStrategicAdvice,
    generateCampaignIdea,
    generateArticleDraft
} from './services/geminiService';
import { POINT_ALLOCATIONS, BARKAT_LEVELS } from './services/gamificationService';
import { 
    PresentationChartLineIcon, BanknotesIcon, UsersIcon, BoxIcon, SproutIcon, ArrowUpIcon, ArrowDownIcon, 
    SparklesIcon, LightBulbIcon, ChatBubbleLeftRightIcon, ChartBarIcon, UserGroupIcon, CpuChipIcon, TrophyIcon, HeartIcon,
    TrashIcon, PencilIcon, ArrowPathIcon, ArrowTrendingUpIcon, FunnelIcon, MegaphoneIcon, BullseyeIcon, UserFrownIcon,
    ChevronDownIcon, RadarIcon, CogIcon, SaplingIcon, TreeIcon, MatureTreeIcon, PencilSquareIcon, PaperAirplaneIcon,
    SunIcon, CheckCircleIcon, XMarkIcon, CalculatorIcon, ShieldExclamationIcon
} from './components/icons';
import BarChartDisplay from './components/BarChartDisplay';
import ActionableDraftCard from './components/ActionableDraftCard';
import SimpleBarChart from './components/SimpleBarChart';
import SentimentTrend from './components/SentimentTrend';
import AIInsightsDashboard from './components/admin/AIInsightsDashboard';
import AdminAICoach from './components/admin/AdminAICoach';
import ExecutiveDashboard from './components/admin/ExecutiveDashboard';
import CommunityDashboard from './components/admin/CommunityDashboard';
import GrowthAnalyticsDashboard from './components/admin/GrowthAnalyticsDashboard';
import GamificationDashboard from './components/admin/GamificationDashboard';
import CampaignsDashboard from './components/admin/CampaignsDashboard';
import ContentFactoryDashboard from './components/admin/ContentFactoryDashboard';
import PersonalJourneyDashboard from './components/admin/PersonalJourneyDashboard';
import ManagementDashboard from './components/admin/ManagementDashboard';
import ApiManagementDashboard from './components/admin/ApiManagementDashboard';
import SettingsDashboard from './components/admin/SettingsDashboard';
import UnitEconomicsDashboard from './components/admin/UnitEconomicsDashboard';
import SecurityDashboard from './components/admin/SecurityDashboard';
import { timeAgo } from './utils/time';

interface AdminDashboardViewProps {
    users: User[];
    orders: Order[];
    posts: CommunityPost[];
    campaign: Campaign;
    palmTypes: PalmType[];
    allProjects?: CommunityProject[];
    onAddProjectUpdate?: (projectId: string, update: { title: string, description: string }) => void;
}

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ users, orders, posts, campaign, palmTypes, allProjects = [], onAddProjectUpdate }) => {
    const { mentorshipRequests } = useAppState();
    const [activeTab, setActiveTab] = useState('pulse');
    const [activeSubTab, setActiveSubTab] = useState<string>('users');

    const allInsights = useMemo(() => users.flatMap(u => u.timeline || []), [users]);

    const coCreationOrders = useMemo(() => {
        return orders
            .map(order => {
                const coCreationItem = order.items.find(item => item.coCreationDetails);
                if (!coCreationItem) return null;
                const user = users.find(u => u.id === order.userId);
                return {
                    orderId: order.id,
                    orderDate: order.date,
                    user: user ? { name: user.fullName, phone: user.phone } : { name: 'کاربر حذف شده', phone: '' },
                    details: coCreationItem.coCreationDetails!,
                };
            })
            .filter(Boolean) as { orderId: string; orderDate: string; user: { name: string | undefined; phone: string; }; details: NonNullable<CartItem['coCreationDetails']>; }[];
    }, [orders, users]);

    const platformData = useMemo(() => ({
        totalUsers: users.length, 
        totalPalms: orders.reduce((acc, order) => acc + (order.deeds?.length || 0), 0), 
        totalRevenue: orders.reduce((acc, order) => acc + order.total, 0),
        recentPosts: posts.slice(0, 5).map(p => p.text),
        recentUserGoals: users.slice(0, 5).map(u => u.meaningGoal || '').filter(Boolean),
    }), [users, orders, posts]);

    // Helper functions (placeholders for potential dispatch actions)
    const handleGrantPoints = (userId: string, points: number, reason: string) => {
        console.log(`Granting ${points} to ${userId} for ${reason}`);
    };

    const handleUpdateInsightStatus = (insightId: string, status: 'approved' | 'rejected') => {
        console.log(`Updating insight ${insightId} to ${status}`);
    };

    const handleRespondToRequest = (requestId: string, response: 'accepted' | 'rejected') => {
        console.log(`Responding to request ${requestId} with ${response}`);
    };

    const handleAddProjectUpdateWrapper = (projectId: string, update: Omit<ProjectUpdate, 'date'>) => {
         if (onAddProjectUpdate) {
             onAddProjectUpdate(projectId, update);
         }
    };

    const tabs = [ 
        { id: 'pulse', label: 'داشبورد پالس', icon: <PresentationChartLineIcon className="w-5 h-5" /> }, 
        { id: 'economy', label: 'اقتصاد واحد', icon: <CalculatorIcon className="w-5 h-5" /> },
        { id: 'community', label: 'هاب جامعه و معنا', icon: <HeartIcon className="w-5 h-5" /> }, 
        { id: 'growth', label: 'موتور رشد', icon: <ChartBarIcon className="w-5 h-5" /> }, 
        { id: 'gamification', label: 'کنترل گیمیفیکیشن', icon: <TrophyIcon className="w-5 h-5" /> }, 
        { id: 'campaigns', label: 'کمپین‌ها', icon: <MegaphoneIcon className="w-5 h-5" /> }, 
        { id: 'content_factory', label: 'کارخانه محتوا', icon: <PencilSquareIcon className="w-5 h-5" /> }, 
        { id: 'ai_think_tank', label: 'اتاق فکر استراتژیک', icon: <UserGroupIcon className="w-5 h-5" /> }, 
        { id: 'personal_journey', label: 'سفر شخصی', icon: <SunIcon className="w-5 h-5" /> }, 
        { id: 'management', label: 'مدیریت', icon: <UsersIcon className="w-5 h-5" /> }, 
        { id: 'security', label: 'امنیت و ریسک', icon: <ShieldExclamationIcon className="w-5 h-5" /> },
        { id: 'api_management', label: 'مدیریت API', icon: <CpuChipIcon className="w-5 h-5" /> }, 
        { id: 'ai_reports', label: 'گزارش‌های هوشمند', icon: <SparklesIcon className="w-5 h-5" /> }, 
        { id: 'settings', label: 'تنظیمات', icon: <CogIcon className="w-5 h-5" /> } 
    ];
    
    return (
        <div className="bg-gray-900 text-white">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="pt-22 pb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-extrabold text-white tracking-tight">داشبورد ادمین</h1>
                            <p className="mt-1 text-lg text-gray-400">مرکز کنترل و تحلیل داده‌های نخلستان معنا</p>
                        </div>
                    </div>
                </div>

                <nav aria-label="Tabs" className="mb-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`group p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                                    activeTab === tab.id
                                        ? 'bg-green-800/50 border-green-600 text-white shadow-lg shadow-green-900/50'
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700/50 hover:border-gray-600'
                                }`}
                            >
                                {React.cloneElement(tab.icon, { className: 'w-7 h-7 mb-2 transition-transform duration-200 group-hover:scale-110' })}
                                <span className="text-xs font-semibold leading-tight">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </nav>

                <main className="py-8">
                    {activeTab === 'pulse' && (
                        <ExecutiveDashboard 
                            allUsers={users} 
                            allProjects={allProjects} 
                            allInsights={allInsights} 
                            mentorshipRequests={mentorshipRequests} 
                            setActiveTab={(tab: any) => setActiveTab(tab)} 
                            setActiveSubTab={(subTab: any) => setActiveSubTab(subTab)} 
                        />
                    )}
                    {activeTab === 'economy' && <UnitEconomicsDashboard />}
                    {activeTab === 'community' && <CommunityDashboard posts={posts} />}
                    {activeTab === 'growth' && <GrowthAnalyticsDashboard allUsers={users} allInsights={allInsights} />}
                    {activeTab === 'gamification' && <GamificationDashboard allUsers={users} />}
                    {activeTab === 'campaigns' && <CampaignsDashboard campaign={campaign} platformData={platformData} />}
                    {activeTab === 'content_factory' && <ContentFactoryDashboard posts={posts} />}
                    {activeTab === 'ai_think_tank' && (
                        <AdminAICoach 
                            allUsers={users} 
                            allInsights={allInsights} 
                            allProjects={allProjects} 
                            mentorshipRequests={mentorshipRequests} 
                            onAddProjectUpdate={handleAddProjectUpdateWrapper} 
                            onUpdateInsightStatus={handleUpdateInsightStatus} 
                            onRespondToRequest={handleRespondToRequest} 
                            onGrantPoints={handleGrantPoints} 
                        />
                    )}
                    {activeTab === 'ai_reports' && (
                        <AIInsightsDashboard 
                            allInsights={allInsights} 
                            allProjects={allProjects || []} 
                            onUpdateInsightStatus={handleUpdateInsightStatus} 
                            onAddProjectUpdate={handleAddProjectUpdateWrapper} 
                        />
                    )}
                    {activeTab === 'personal_journey' && <PersonalJourneyDashboard />}
                    {activeTab === 'management' && <ManagementDashboard users={users} orders={orders} coCreationOrders={coCreationOrders} />}
                    {activeTab === 'security' && <SecurityDashboard users={users} logs={[]} transactions={orders} />}
                    {activeTab === 'api_management' && <ApiManagementDashboard />}
                    {activeTab === 'settings' && <SettingsDashboard />}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardView;
