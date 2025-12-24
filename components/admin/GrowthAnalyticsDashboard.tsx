
import React, { useMemo, useState } from 'react';
import { User, TimelineEvent, Course } from '../../types';
import SimpleBarChart from '../SimpleBarChart';
import {
    UsersIcon, ChartPieIcon, TargetIcon, TrendingUpIcon,
    SitemapIcon, LightBulbIcon, SparklesIcon, BoltIcon,
    RocketLaunchIcon, ArrowUpRightIcon, MagnifyingGlassIcon
} from '../icons';
import GrowthAutomationEngine from './GrowthAutomationEngine';

const InfoCard: React.FC<{ title: string, value: string, subValue: string, icon: any, color: string }> = ({ title, value, subValue, icon: Icon, color }) => (
    <div className="glass-panel p-6 rounded-[2rem] border border-white/5 group hover:border-white/10 transition-all">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-400 border border-${color}-500/20 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest">Growth Metric</span>
        </div>
        <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-1">{title}</h3>
        <p className="text-2xl font-black text-white mb-1">{value}</p>
        <p className={`text-[10px] font-bold text-${color}-500`}>{subValue}</p>
    </div>
);

interface GrowthAnalyticsDashboardProps {
    allUsers: User[];
    allInsights: TimelineEvent[];
}

const GrowthAnalyticsDashboard: React.FC<GrowthAnalyticsDashboardProps> = ({ allUsers, allInsights }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const stats = useMemo(() => {
        const totalPurchases = allInsights.filter(e => e.type === 'palm_planted').length;
        const conversionRate = allUsers.length > 0 ? (allUsers.filter(u => u.timeline?.some(e => e.type === 'palm_planted')).length / allUsers.length) * 100 : 0;
        const avgEngagement = allUsers.length > 0 ? allInsights.length / allUsers.length : 0;

        return {
            totalPurchases,
            conversionRate: conversionRate.toFixed(1) + '%',
            avgEngagement: avgEngagement.toFixed(1),
            retentionRate: '68%' // Mocked for now
        };
    }, [allUsers, allInsights]);

    const engagementData = useMemo(() => [
        { label: 'کاشت نخل', value: allInsights.filter(e => e.type === 'palm_planted').length },
        { label: 'تامل و آگاهی', value: allInsights.filter(e => e.type === 'reflection').length },
        { label: 'خلاقیت دیجیتال', value: allInsights.filter(e => e.type === 'creative_act').length },
        { label: 'مشارکت کانون', value: allInsights.filter(e => e.type === 'community_contribution').length },
    ], [allInsights]);

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* 1. Opportunity Radar (AI Section) */}
            <section className="glass-panel p-8 rounded-[3rem] border border-indigo-500/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="text-right flex-grow">
                        <div className="flex items-center gap-2 mb-3">
                            <SparklesIcon className="w-6 h-6 text-indigo-400" />
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">رادار فرصت‌های رشد هوش مصنوعی</h2>
                        </div>
                        <p className="text-stone-400 font-medium max-w-2xl leading-relaxed">
                            هوش مصنوعی در حال تحلیل الگوهای رفتاری کاربران است. ما ۳ سگمنت با پتانسیل بالا برای تبدیل شدن به «یاوران همراه» را شناسایی کردیم که نیاز به یک پیشنهاد شخصی‌سازی شده دارند.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <div className="bg-indigo-500/10 border border-indigo-500/30 px-4 py-2 rounded-2xl text-xs font-bold text-indigo-300">
                                سگمنت: فعالان آکادمی (۴۵ نفر)
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-2xl text-xs font-bold text-emerald-300">
                                سگمنت: مخاطبان اینستاگرام (۱۲۸ نفر)
                            </div>
                        </div>
                    </div>

                    <button className="h-16 px-10 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                        <RocketLaunchIcon className="w-6 h-6" />
                        اجرای کمپین خودکار
                    </button>
                </div>
            </section>

            {/* 2. Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <InfoCard title="نرخ تبدیل محصول" value={stats.conversionRate} subValue="+2.1% از ماه قبل" icon={TargetIcon} color="emerald" />
                <InfoCard title="میانگین تعامل" value={stats.avgEngagement} subValue="۴ اکشن در هفته" icon={TrendingUpIcon} color="amber" />
                <InfoCard title="نرخ بازگشت (D30)" value={stats.retentionRate} subValue="بالاتر از میانگین صنعت" icon={UsersIcon} color="blue" />
                <InfoCard title="سرعت رشد (Velocity)" value="1.5x" subValue="شتاب صعودی" icon={BoltIcon} color="rose" />
            </div>

            {/* 3. Deep Analytics and Automation */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Engagement Distribution */}
                <div className="lg:col-span-3 glass-panel p-8 rounded-[3rem] border border-white/5 relative group">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-stone-700 to-transparent"></div>
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <ChartPieIcon className="w-5 h-5 text-emerald-400" />
                            توزیع تعاملات (Engagement Map)
                        </h3>
                        <button className="text-[10px] font-black text-stone-500 hover:text-stone-300 flex items-center gap-1 transition-colors">
                            DOWNLOAD CSV <ArrowUpRightIcon className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="px-4">
                        <SimpleBarChart data={engagementData} />
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-black text-stone-600 uppercase block mb-1">Peak Activity Time</span>
                            <span className="text-sm font-bold text-stone-300">21:00 - 23:00 (دوشنبه‌ها)</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-black text-stone-600 uppercase block mb-1">Most Viral Action</span>
                            <span className="text-sm font-bold text-stone-300">اشتراک سند میراث</span>
                        </div>
                    </div>
                </div>

                {/* Automation Engine */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2 px-2">
                        <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <BoltIcon className="w-5 h-5 text-amber-500" />
                            موتور خودکارسازی
                        </h3>
                    </div>

                    <div className="h-full">
                        <GrowthAutomationEngine />
                    </div>
                </div>
            </div>

            {/* 4. Cohort Analysis Placeholder */}
            <section className="glass-panel p-10 rounded-[3rem] border border-dashed border-white/10 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="w-20 h-20 bg-stone-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                    <SitemapIcon className="w-10 h-10 text-stone-600" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">تحلیل کوهورت (Cohort Analysis)</h3>
                <p className="text-stone-500 font-medium max-w-lg mx-auto mb-8">
                    مشاهده روند حفظ کاربر و وفاداری در طول زمان بر اساس تاریخ عضویت. این بخش برای درک واقعی "ارزش بلندمدت" (LTV) حیاتی است.
                </p>
                <button className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black text-white transition-all uppercase tracking-widest">
                    فعال‌سازی ماژول تحلیل پیشرفته
                </button>
            </section>
        </div>
    );
};

export default GrowthAnalyticsDashboard;
