
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { detectFraudPatterns } from '../../services/geminiService';
import { dbAdapter } from '../../services/dbAdapter';
import { ShieldExclamationIcon, ExclamationTriangleIcon, CheckCircleIcon, EyeSlashIcon, SparklesIcon, CpuChipIcon } from '../icons';

interface SecurityDashboardProps {
    users: User[];
    // Mock data for logs/transactions as they aren't fully in the main type yet
    logs: any[]; 
    transactions: any[];
}

const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ users, logs, transactions }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [anomalies, setAnomalies] = useState<{ userId: string; userName: string; riskLevel: 'high' | 'medium' | 'low'; reason: string; suggestedAction: string }[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [systemHealth, setSystemHealth] = useState<{ status: string; scalabilityScore: number; issues: string[] } | null>(null);

    // Mock data generator for demo purposes if real data is sparse
    const getMockDataForAI = () => {
        // Creating a mix of normal and suspicious patterns
        const suspiciousLogs = [
            { userId: 'user_gen_5', action: 'referral_signup', timestamp: new Date().toISOString(), ip: '192.168.1.5' },
            { userId: 'user_gen_5', action: 'referral_signup', timestamp: new Date(Date.now() - 1000).toISOString(), ip: '192.168.1.5' }, // Very fast
            { userId: 'user_gen_5', action: 'referral_signup', timestamp: new Date(Date.now() - 2000).toISOString(), ip: '192.168.1.5' },
            { userId: 'user_gen_2', action: 'point_gain', amount: 5000, reason: 'manual_adjustment', timestamp: new Date().toISOString() }, // High manual gain
        ];
        return {
            logs: [...logs, ...suspiciousLogs],
            transactions: transactions
        };
    };

    useEffect(() => {
        const checkHealth = async () => {
            const health = await dbAdapter.getSystemHealth();
            setSystemHealth(health);
        };
        checkHealth();
    }, []);

    const handleScan = async () => {
        setIsScanning(true);
        setError(null);
        setAnomalies(null);

        try {
            // In a real app, fetch real logs. Here we inject mock data for the AI to find something.
            const dataToAnalyze = getMockDataForAI();
            const result = await detectFraudPatterns(dataToAnalyze);
            setAnomalies(result.anomalies);
        } catch (err) {
            console.error(err);
            setError("خطا در تحلیل امنیتی. لطفاً دوباره تلاش کنید.");
        } finally {
            setIsScanning(false);
        }
    };

    const getRiskStyles = (level: string) => {
        switch (level) {
            case 'high': return 'bg-red-900/30 border-red-500/50 text-red-200';
            case 'medium': return 'bg-yellow-900/30 border-yellow-500/50 text-yellow-200';
            case 'low': return 'bg-blue-900/30 border-blue-500/50 text-blue-200';
            default: return 'bg-gray-800 border-gray-700 text-gray-300';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* System Infrastructure Health Check */}
            {systemHealth && (
                <div className={`p-6 rounded-2xl border ${systemHealth.status === 'Healthy' ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/50'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <CpuChipIcon className={`w-8 h-8 ${systemHealth.status === 'Healthy' ? 'text-green-400' : 'text-red-400'}`} />
                            <div>
                                <h3 className="text-xl font-bold text-white">وضعیت زیرساخت فنی</h3>
                                <p className="text-sm opacity-80">امتیاز مقیاس‌پذیری: <span className="font-mono font-bold text-lg">{systemHealth.scalabilityScore}/100</span></p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${systemHealth.status === 'Healthy' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                            {systemHealth.status === 'Healthy' ? 'آماده' : 'نیازمند ارتقا'}
                        </span>
                    </div>
                    
                    {systemHealth.issues.length > 0 && (
                        <div className="bg-black/30 rounded-lg p-4 space-y-2">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">گزارش مهندس ارشد:</p>
                            {systemHealth.issues.map((issue, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm">
                                    <span className="text-red-400 mt-1">⚠</span>
                                    <span className="text-gray-300">{issue}</span>
                                </div>
                            ))}
                            <div className="mt-4 pt-2 border-t border-gray-700 text-xs text-blue-300">
                                پیشنهاد: اتصال به Supabase برای دیتابیس و استفاده از Redis برای کشینگ جهت پشتیبانی از ۱ میلیارد کاربر.
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gray-700/50 rounded-full">
                        <ShieldExclamationIcon className="w-10 h-10 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">مرکز امنیت و ریسک</h2>
                        <p className="text-gray-400 mt-1">پایش هوشمند فعالیت‌های مشکوک و سلامت سیستم امتیازدهی</p>
                    </div>
                </div>
                <button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-red-900/20 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isScanning ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            در حال اسکن...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5" />
                            اسکن هوشمند تخلفات
                        </>
                    )}
                </button>
            </div>

            {error && <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-300 rounded-xl text-center">{error}</div>}

            {anomalies && (
                <div className="grid gap-4">
                    {anomalies.length === 0 ? (
                        <div className="p-8 text-center bg-green-900/10 border border-green-500/30 rounded-2xl">
                            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-green-400">وضعیت امن است</h3>
                            <p className="text-green-200/70 mt-2">هیچ الگوی مشکوکی در فعالیت‌های اخیر یافت نشد.</p>
                        </div>
                    ) : (
                        anomalies.map((item, idx) => (
                            <div key={idx} className={`p-6 rounded-xl border ${getRiskStyles(item.riskLevel)} flex flex-col md:flex-row gap-6 items-start md:items-center transition-all hover:scale-[1.01]`}>
                                <div className="flex-shrink-0">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-black/20`}>
                                        <ExclamationTriangleIcon className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-bold text-lg">{item.userName}</h4>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase border ${item.riskLevel === 'high' ? 'border-red-400 text-red-400' : item.riskLevel === 'medium' ? 'border-yellow-400 text-yellow-400' : 'border-blue-400 text-blue-400'}`}>
                                            ریسک {item.riskLevel === 'high' ? 'بالا' : item.riskLevel === 'medium' ? 'متوسط' : 'پایین'}
                                        </span>
                                    </div>
                                    <p className="text-sm opacity-90 mb-2">{item.reason}</p>
                                    <div className="text-xs font-mono opacity-70 bg-black/20 px-2 py-1 rounded w-fit">ID: {item.userId}</div>
                                </div>
                                <div className="flex-shrink-0 flex flex-col gap-2 w-full md:w-auto">
                                    <div className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1 text-left md:text-right">اقدام پیشنهادی:</div>
                                    <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors shadow-sm">
                                        {item.suggestedAction}
                                    </button>
                                    <button className="bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                        <EyeSlashIcon className="w-4 h-4" />
                                        نادیده گرفتن
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {!anomalies && !isScanning && !error && (
                <div className="text-center py-12 opacity-50">
                    <ShieldExclamationIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">برای شروع تحلیل، دکمه اسکن را فشار دهید.</p>
                </div>
            )}
        </div>
    );
};

export default SecurityDashboard;
