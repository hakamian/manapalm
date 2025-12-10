
import React, { useMemo, useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { User, TimelineEvent, Course } from '../../types';
import { heritageItems } from '../../utils/heritage';
import SimpleBarChart from '../SimpleBarChart';
import { UsersIcon, ChartPieIcon, TargetIcon, TrendingUpIcon, SitemapIcon, LightBulbIcon } from '../icons';
import GrowthAutomationEngine from './GrowthAutomationEngine';

// Mock data needed for standalone functioning if context missing
const coursesData: Course[] = [
    { id: '1', title: 'دوره جامع کوچینگ معنا', shortDescription: 'سفری عمیق به درون', longDescription: '', instructor: 'دکتر حکیمیان', duration: '۸ هفته', level: 'متوسط', tags: ['کوچینگ'], imageUrl: '', price: 850000 },
    { id: '2', title: 'کارآفرینی اجتماعی', shortDescription: 'کسب‌وکار پایدار', longDescription: '', instructor: 'تیم نخلستان', duration: '۶ هفته', level: 'مقدماتی', tags: ['کارآفرینی'], imageUrl: '', price: 600000 },
];

const ChartContainer: React.FC<{ title: string, children: React.ReactNode, icon: React.FC<any> }> = ({ title, children, icon: Icon }) => (
    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg hover:border-gray-600 transition-colors">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white border-b border-gray-700 pb-4">
            <Icon className="w-6 h-6 text-amber-400" />
            {title}
        </h3>
        {children}
    </div>
);

interface GrowthAnalyticsDashboardProps {
    allUsers: User[];
    allInsights: TimelineEvent[];
}

const GrowthAnalyticsDashboard: React.FC<GrowthAnalyticsDashboardProps> = ({ allUsers, allInsights }) => {
    // Simple implementation for stability
    const engagementData = useMemo(() => [
        { label: 'کاشت نخل', value: allInsights.filter(e => e.type === 'palm_planted').length },
        { label: 'تامل', value: allInsights.filter(e => e.type === 'reflection').length },
        { label: 'خلاقیت', value: allInsights.filter(e => e.type === 'creative_act').length },
    ], [allInsights]);

    return (
        <div className="space-y-8 animate-fade-in">
            <ChartContainer title="توزیع تعاملات" icon={ChartPieIcon}>
                <SimpleBarChart data={engagementData} />
            </ChartContainer>
            
            <GrowthAutomationEngine />
        </div>
    );
};

export default GrowthAnalyticsDashboard;
