
import React, { useMemo, useState, useEffect } from 'react';
import { useAppState } from '../../AppContext';
import { CalculatorIcon, BanknotesIcon, ChartBarIcon, UsersIcon, TrendingUpIcon, ArrowUpIcon, ArrowDownIcon, CalendarDaysIcon, CheckCircleIcon, XMarkIcon } from '../icons';
import { generateText } from '../../services/geminiService';
import SimpleBarChart from '../SimpleBarChart';

const UnitEconomicsDashboard: React.FC = () => {
    const { allUsers, orders } = useAppState();
    const [cashFlowForecast, setCashFlowForecast] = useState<string | null>(null);
    const [isForecasting, setIsForecasting] = useState(false);
    const [activeTab, setActiveTab] = useState<'metrics' | 'ledger'>('metrics');

    // --- Calculations ---

    const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);
    const totalUsers = allUsers.length;
    const payingUsers = useMemo(() => new Set(orders.map(o => o.userId)).size, [orders]);
    
    // 1. LTV (Lifetime Value)
    const ltv = payingUsers > 0 ? totalRevenue / payingUsers : 0;

    // 2. CAC (Customer Acquisition Cost) - Mock Data
    const marketingSpend = 50000000; // 50M Tomans (Mock)
    const cac = totalUsers > 0 ? marketingSpend / totalUsers : 0;

    const ltvCacRatio = cac > 0 ? (ltv / cac).toFixed(1) : 'N/A';

    // 3. Unit Profitability (Per Palm) - Mock Data
    const palmPrice = 30000000;
    const plantingCost = 12000000;
    const maintenanceCost = 5000000;
    const marketingPerUnit = 3000000;
    const platformFee = 1500000;
    const profit = palmPrice - (plantingCost + maintenanceCost + marketingPerUnit + platformFee);
    const margin = ((profit / palmPrice) * 100).toFixed(1);

    // 4. Cohort Analysis (Mock Data)
    const cohorts = [
        { month: 'فروردین', users: 120, retention: [100, 80, 65, 50] },
        { month: 'اردیبهشت', users: 150, retention: [100, 75, 60, 0] },
        { month: 'خرداد', users: 200, retention: [100, 85, 0, 0] },
        { month: 'تیر', users: 180, retention: [100, 0, 0, 0] },
    ];

    // --- AI Forecast ---
    useEffect(() => {
        const fetchForecast = async () => {
            setIsForecasting(true);
            try {
                const prompt = `
                Analyze the cash flow for a social enterprise planting palms.
                Current Monthly Revenue (last 3 months): [150M, 180M, 210M] Tomans.
                Current Burn Rate: 120M Tomans/month.
                Growth Rate: 15%.
                Provide a brief 3-sentence cash flow forecast for the next quarter in Persian.
                `;
                const response = await generateText(prompt, false, false, false);
                setCashFlowForecast(response.text);
            } catch (e) {
                setCashFlowForecast("خطا در محاسبه پیش‌بینی.");
            } finally {
                setIsForecasting(false);
            }
        };
        fetchForecast();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Tabs */}
            <div className="flex justify-center border-b border-gray-700 mb-6">
                <button onClick={() => setActiveTab('metrics')} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'metrics' ? 'border-amber-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>شاخص‌های کلیدی (Unit Economics)</button>
                <button onClick={() => setActiveTab('ledger')} className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'ledger' ? 'border-green-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>دفتر کل مالی (Financial Ledger)</button>
            </div>

            {activeTab === 'metrics' && (
                <>
                    {/* Top Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><BanknotesIcon className="w-24 h-24 text-green-500"/></div>
                            <h3 className="text-gray-400 font-medium mb-2">ارزش طول عمر مشتری (LTV)</h3>
                            <p className="text-3xl font-bold text-white">{ltv.toLocaleString('fa-IR')} <span className="text-xs font-normal text-gray-500">تومان</span></p>
                            <p className="text-xs text-green-400 mt-2 flex items-center gap-1"><ArrowUpIcon className="w-3 h-3"/> ۱۲٪ رشد</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><UsersIcon className="w-24 h-24 text-red-500"/></div>
                            <h3 className="text-gray-400 font-medium mb-2">هزینه جذب مشتری (CAC)</h3>
                            <p className="text-3xl font-bold text-white">{cac.toLocaleString('fa-IR')} <span className="text-xs font-normal text-gray-500">تومان</span></p>
                            <p className="text-xs text-red-400 mt-2 flex items-center gap-1"><ArrowDownIcon className="w-3 h-3"/> ۵٪ کاهش (بهبود)</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><CalculatorIcon className="w-24 h-24 text-blue-500"/></div>
                            <h3 className="text-gray-400 font-medium mb-2">نسبت LTV / CAC</h3>
                            <p className={`text-4xl font-extrabold ${Number(ltvCacRatio) >= 3 ? 'text-green-400' : 'text-yellow-400'}`}>{ltvCacRatio}x</p>
                            <p className="text-xs text-gray-500 mt-2">هدف: بالای ۳.۰x</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Unit Profitability Waterfall */}
                        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <ChartBarIcon className="w-6 h-6 text-amber-400"/>
                                سودآوری واحد (یک نخل)
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm bg-gray-700/30 p-2 rounded">
                                    <span>قیمت فروش</span>
                                    <span className="font-bold text-green-400">{palmPrice.toLocaleString('fa-IR')}</span>
                                </div>
                                <div className="pl-4 space-y-2 border-l-2 border-gray-600">
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>- کاشت و نهال</span>
                                        <span>{plantingCost.toLocaleString('fa-IR')}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>- نگهداری (۵ ساله)</span>
                                        <span>{maintenanceCost.toLocaleString('fa-IR')}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>- مارکتینگ</span>
                                        <span>{marketingPerUnit.toLocaleString('fa-IR')}</span>
                                    </div>
                                </div>
                                <div className="border-t border-gray-600 pt-3 flex justify-between items-center">
                                    <span className="font-bold text-white">حاشیه سود خالص</span>
                                    <div className="text-right">
                                        <p className="font-bold text-xl text-blue-400">{profit.toLocaleString('fa-IR')}</p>
                                        <p className="text-xs text-gray-500">{margin}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Cash Flow Forecast */}
                        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <TrendingUpIcon className="w-6 h-6 text-purple-400"/>
                                پیش‌بینی جریان نقدینگی (AI)
                            </h3>
                            <div className="flex-grow bg-gray-900/50 rounded-xl p-4 border border-gray-600 relative">
                                {isForecasting ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="animate-pulse text-purple-400">هوش مصنوعی در حال محاسبه...</div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                            {cashFlowForecast}
                                        </p>
                                        <div className="flex items-end gap-2 h-32 mt-4 pt-4 border-t border-gray-700/50">
                                            {[30, 45, 60, 75, 90, 110].map((h, i) => (
                                                <div key={i} className={`flex-1 rounded-t-md ${i > 2 ? 'bg-purple-500/50 border-t-2 border-purple-400 border-dashed' : 'bg-green-500/50'}`} style={{height: `${h}%`}}></div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'ledger' && (
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <BanknotesIcon className="w-6 h-6 text-green-400"/>
                            گزارش فروش و تراکنش‌ها
                        </h3>
                        <div className="text-xs text-gray-400 bg-gray-900 px-3 py-1 rounded-full">۵۰ تراکنش اخیر</div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-900/50 border-b border-gray-700">
                                <tr>
                                    <th className="px-4 py-3">شناسه سفارش</th>
                                    <th className="px-4 py-3">کاربر</th>
                                    <th className="px-4 py-3">آیتم‌ها</th>
                                    <th className="px-4 py-3">مبلغ (تومان)</th>
                                    <th className="px-4 py-3">وضعیت</th>
                                    <th className="px-4 py-3">تاریخ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {orders.length > 0 ? [...orders].reverse().map(order => (
                                    <tr key={order.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="px-4 py-4 font-mono text-xs text-gray-400">#{order.id.slice(-6)}</td>
                                        <td className="px-4 py-4 font-medium text-white">{allUsers.find(u => u.id === order.userId)?.name || 'ناشناس'}</td>
                                        <td className="px-4 py-4 text-gray-300 text-xs">
                                            {order.items.map(i => i.name).join('، ').substring(0, 30)}...
                                        </td>
                                        <td className="px-4 py-4 font-bold text-green-400">{order.total.toLocaleString('fa-IR')}</td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${order.status === 'تحویل داده شده' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                                                {order.status === 'تحویل داده شده' ? <CheckCircleIcon className="w-3 h-3"/> : <span className="w-2 h-2 rounded-full bg-current"></span>}
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-gray-500 text-xs">{new Date(order.date).toLocaleDateString('fa-IR')}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-500">هیچ تراکنشی یافت نشد.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnitEconomicsDashboard;
