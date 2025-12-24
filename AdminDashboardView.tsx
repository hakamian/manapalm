
import React, { useState, useMemo, useEffect } from 'react';
import { User, Order, CommunityPost, Campaign, PalmType, CartItem, CommunityProject, ProjectUpdate } from './types';
import { useAppState, useAppDispatch } from './AppContext';
import { useAdminActions } from './hooks/useAdminActions';
import {
    PresentationChartLineIcon, UsersIcon, TrophyIcon, HeartIcon,
    ChartBarIcon, UserGroupIcon, CpuChipIcon, MegaphoneIcon,
    CogIcon, PencilSquareIcon, SunIcon, ShieldExclamationIcon,
    BoltIcon, CalculatorIcon, SparklesIcon, XMarkIcon,
    Bars3Icon, MagnifyingGlassIcon, BellIcon, ArrowUpRightIcon
} from './components/icons';

// Lazy loaded modules (existing ones)
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
import AutoCEOView from './src/features/admin/AutoCEOView';

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
    const { grantBonus, updateInsightStatus, respondToMentorshipRequest } = useAdminActions();

    const [activeTab, setActiveTab] = useState('pulse');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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
            .filter(Boolean) as any[];
    }, [orders, users]);

    const platformData = useMemo(() => ({
        totalUsers: users.length,
        totalPalms: orders.reduce((acc, order) => acc + (order.deeds?.length || 0), 0),
        totalRevenue: orders.reduce((acc, order) => acc + order.total, 0),
        recentPostsCount: posts.length,
    }), [users, orders, posts]);

    const navigation = [
        {
            group: 'مانیتورینگ', items: [
                { id: 'pulse', label: 'پالس سیستم', icon: PresentationChartLineIcon },
                { id: 'economy', label: 'اقتصاد واحد', icon: CalculatorIcon },
                { id: 'growth', label: 'تحلیل رشد', icon: ChartBarIcon },
                { id: 'security', label: 'امنیت و ریسک', icon: ShieldExclamationIcon },
            ]
        },
        {
            group: 'عملیات', items: [
                { id: 'management', label: 'مدیریت کاربران/سفارشات', icon: UsersIcon },
                { id: 'community', label: 'هاب جامعه', icon: HeartIcon },
                { id: 'gamification', label: 'گیمیفیکیشن', icon: TrophyIcon },
                { id: 'campaigns', label: 'کمپین‌ها', icon: MegaphoneIcon },
            ]
        },
        {
            group: 'هوش مصنوعی', items: [
                { id: 'auto_ceo', label: 'مدیر عامل هوشمند', icon: BoltIcon },
                { id: 'ai_think_tank', label: 'اتاق فکر استراتژیک', icon: UserGroupIcon },
                { id: 'ai_reports', label: 'گزارش‌های AI', icon: SparklesIcon },
                { id: 'content_factory', label: 'کارخانه محتوا', icon: PencilSquareIcon },
            ]
        },
        {
            group: 'سیستم', items: [
                { id: 'api_management', label: 'مدیریت API', icon: CpuChipIcon },
                { id: 'settings', label: 'تنظیمات کلان', icon: CogIcon },
            ]
        }
    ];

    return (
        <div className="flex h-screen bg-[#050505] text-stone-300 overflow-hidden">
            {/* --- Sidebar Navigation --- */}
            <aside className={`relative z-50 flex flex-col transition-all duration-500 ease-in-out border-l border-white/5 bg-black/40 backdrop-blur-3xl ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-white/5">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                        <BoltIcon className="w-6 h-6 text-black" />
                    </div>
                    {isSidebarOpen && (
                        <div className="mr-3 animate-fade-in">
                            <h2 className="text-white font-black tracking-tight">MANAPALM</h2>
                            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Command Tower</p>
                        </div>
                    )}
                </div>

                {/* Nav Items */}
                <div className="flex-grow overflow-y-auto py-6 px-3 space-y-8 custom-scrollbar">
                    {navigation.map((group, idx) => (
                        <div key={idx} className="space-y-1">
                            {isSidebarOpen && (
                                <p className="px-4 text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] mb-2">{group.group}</p>
                            )}
                            {group.items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center p-3 rounded-2xl transition-all group ${activeTab === item.id
                                            ? 'bg-green-500/10 text-white shadow-[inset_0_0_20px_rgba(34,197,94,0.05)] border border-green-500/20'
                                            : 'hover:bg-white/5 text-stone-500 hover:text-stone-300 border border-transparent'
                                        }`}
                                >
                                    <item.icon className={`w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-green-400' : ''}`} />
                                    {isSidebarOpen && (
                                        <span className="mr-3 text-sm font-bold tracking-tight animate-fade-in">{item.label}</span>
                                    )}
                                    {activeTab === item.id && isSidebarOpen && (
                                        <div className="mr-auto w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Sidebar Footer - Realtime Health */}
                {isSidebarOpen && (
                    <div className="p-4 border-t border-white/5 bg-white/5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-stone-500 mb-3">
                            <span>سلامت سیستم</span>
                            <span className="text-green-500">99.9% ONLINE</span>
                        </div>
                        <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full w-[99.9%] shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        </div>
                    </div>
                )}
            </aside>

            {/* --- Main Workspace --- */}
            <main className="flex-grow flex flex-col relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] to-[#050505]">
                <div className="noise-overlay"></div>

                {/* Top Header / Search */}
                <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-black/20 backdrop-blur-md z-40">
                    <div className="flex items-center gap-4 flex-grow max-w-2xl">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                            <Bars3Icon className="w-6 h-6" />
                        </button>
                        <div className="relative flex-grow">
                            <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                            <input
                                type="text"
                                placeholder="جستجوی هوشمند در کل پلتفرم..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pr-11 pl-4 text-sm focus:outline-none focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mr-8">
                        <button className="relative p-2.5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5">
                            <BellIcon className="w-5 h-5" />
                            <span className="absolute top-2.5 left-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#050505]"></span>
                        </button>
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-stone-800 to-stone-700 p-[1px]">
                            <div className="w-full h-full bg-[#050505] rounded-[15px] flex items-center justify-center font-bold text-xs text-stone-400">ADM</div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-grow overflow-y-auto p-8 custom-scrollbar relative">
                    {/* View Switching Logic */}
                    <div className="max-w-[1600px] mx-auto animate-in">
                        {activeTab === 'pulse' && (
                            <ExecutiveDashboard
                                allUsers={users}
                                allProjects={allProjects}
                                allInsights={allInsights}
                                mentorshipRequests={mentorshipRequests}
                                setActiveTab={(tab: any) => setActiveTab(tab)}
                                setActiveSubTab={() => { }} // Not used in this layout
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
                                onAddProjectUpdate={() => { }}
                                onUpdateInsightStatus={updateInsightStatus}
                                onRespondToRequest={respondToMentorshipRequest}
                                onGrantPoints={grantBonus}
                            />
                        )}
                        {activeTab === 'ai_reports' && (
                            <AIInsightsDashboard
                                allInsights={allInsights}
                                allProjects={allProjects || []}
                                onUpdateInsightStatus={updateInsightStatus}
                                onAddProjectUpdate={() => { }}
                            />
                        )}
                        {activeTab === 'personal_journey' && <PersonalJourneyDashboard />}
                        {activeTab === 'management' && <ManagementDashboard users={users} orders={orders} coCreationOrders={coCreationOrders} />}
                        {activeTab === 'security' && <SecurityDashboard users={users} logs={[]} transactions={orders} />}
                        {activeTab === 'api_management' && <ApiManagementDashboard />}
                        {activeTab === 'settings' && <SettingsDashboard />}
                        {activeTab === 'auto_ceo' && <AutoCEOView />}
                    </div>
                </div>

                {/* Persistent AI Intelligence Overlay (Bottom Right) */}
                <div className="fixed bottom-8 left-8 z-[100]">
                    <div className="glass-panel p-4 rounded-3xl border border-green-500/30 flex items-center gap-4 animate-bounce-slow shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                            <SparklesIcon className="w-7 h-7 text-black" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">AI Intelligence</p>
                            <p className="text-white text-sm font-bold">۳ فرصت رشد جدید شناسایی شد.</p>
                        </div>
                        <button onClick={() => setActiveTab('ai_reports')} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white">
                            <ArrowUpRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardView;
