import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { detectFraudPatterns } from '../../services/geminiService';
import { dbAdapter } from '../../services/dbAdapter';
import {
    ShieldExclamationIcon, ExclamationTriangleIcon, CheckCircleIcon,
    EyeSlashIcon, SparklesIcon, CpuChipIcon, ArrowDownTrayIcon
} from '../icons';
import '../../styles/admin-dashboard.css';

interface SecurityDashboardProps {
    users: User[];
    logs: any[];
    transactions: any[];
}

const ModernSecurityDashboard: React.FC<SecurityDashboardProps> = ({ users, logs, transactions }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [anomalies, setAnomalies] = useState<{ userId: string; userName: string; riskLevel: 'high' | 'medium' | 'low'; reason: string; suggestedAction: string }[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [systemHealth, setSystemHealth] = useState<{ status: string; scalabilityScore: number; issues: string[] } | null>(null);

    // Mock data generator for demo purposes
    const getMockDataForAI = () => {
        const suspiciousLogs = [
            { userId: 'user_gen_5', action: 'referral_signup', timestamp: new Date().toISOString(), ip: '192.168.1.5' },
            { userId: 'user_gen_5', action: 'referral_signup', timestamp: new Date(Date.now() - 1000).toISOString(), ip: '192.168.1.5' },
            { userId: 'user_gen_5', action: 'referral_signup', timestamp: new Date(Date.now() - 2000).toISOString(), ip: '192.168.1.5' },
            { userId: 'user_gen_2', action: 'point_gain', amount: 5000, reason: 'manual_adjustment', timestamp: new Date().toISOString() },
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

    const handleExportReport = () => {
        const report = {
            generatedAt: new Date().toISOString(),
            systemHealth,
            anomalies,
            totalUsers: users.length
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const getRiskConfig = (level: string) => {
        switch (level) {
            case 'high':
                return {
                    bg: 'rgba(239, 68, 68, 0.1)',
                    border: 'rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    label: 'بالا'
                };
            case 'medium':
                return {
                    bg: 'rgba(245, 158, 11, 0.1)',
                    border: 'rgba(245, 158, 11, 0.3)',
                    color: '#f59e0b',
                    label: 'متوسط'
                };
            case 'low':
                return {
                    bg: 'rgba(59, 130, 246, 0.1)',
                    border: 'rgba(59, 130, 246, 0.3)',
                    color: '#3b82f6',
                    label: 'پایین'
                };
            default:
                return {
                    bg: 'var(--admin-bg-tertiary)',
                    border: 'var(--admin-border)',
                    color: 'var(--admin-text-secondary)',
                    label: 'نامشخص'
                };
        }
    };

    return (
        <div className="admin-container" style={{ padding: '2rem' }}>
            {/* Header */}
            <div className="admin-animate-fade-in" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="admin-heading-1" style={{ marginBottom: '0.5rem' }}>
                            مرکز امنیت و ریسک
                        </h1>
                        <p className="admin-body" style={{ color: 'var(--admin-text-tertiary)' }}>
                            پایش هوشمند فعالیت‌های مشکوک و سلامت سیستم
                        </p>
                    </div>
                    <button
                        onClick={handleExportReport}
                        className="admin-btn admin-btn-ghost"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        گزارش امنیتی
                    </button>
                </div>
            </div>

            {/* System Health Monitor */}
            {systemHealth && (
                <div
                    className="admin-card admin-animate-fade-in"
                    style={{
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        background: systemHealth.status === 'Healthy'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                        border: `2px solid ${systemHealth.status === 'Healthy' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div
                                style={{
                                    background: systemHealth.status === 'Healthy'
                                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--admin-radius-lg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <CpuChipIcon className="w-6 h-6" style={{ color: 'white' }} />
                            </div>
                            <div>
                                <h3 className="admin-heading-3" style={{ marginBottom: '0.25rem' }}>
                                    وضعیت زیرساخت فنی
                                </h3>
                                <p className="admin-body" style={{ color: 'var(--admin-text-secondary)' }}>
                                    امتیاز مقیاس‌پذیری:
                                    <span style={{ fontWeight: 700, fontSize: '1.25rem', marginRight: '0.5rem' }}>
                                        {systemHealth.scalabilityScore}/100
                                    </span>
                                </p>
                            </div>
                        </div>
                        <span
                            className="admin-badge"
                            style={{
                                background: systemHealth.status === 'Healthy' ? '#10b981' : '#ef4444',
                                color: 'white',
                                fontWeight: 700
                            }}
                        >
                            {systemHealth.status === 'Healthy' ? 'آماده' : 'نیازمند ارتقا'}
                        </span>
                    </div>

                    {systemHealth.issues.length > 0 && (
                        <div
                            className="admin-card"
                            style={{
                                padding: '1rem',
                                background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <p className="admin-label" style={{ marginBottom: '0.75rem' }}>
                                گزارش مهندس ارشد:
                            </p>
                            {systemHealth.issues.map((issue, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#f59e0b' }}>⚠</span>
                                    <span className="admin-body" style={{ fontSize: '0.875rem' }}>{issue}</span>
                                </div>
                            ))}
                            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--admin-border)' }}>
                                <p className="admin-caption" style={{ color: 'var(--admin-blue)' }}>
                                    پیشنهاد: اتصال به Supabase برای دیتابیس و استفاده از Redis برای کشینگ جهت پشتیبانی از ۱ میلیارد کاربر.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Scan Button */}
            <div
                className="admin-card admin-animate-slide-in"
                style={{
                    padding: '2rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            padding: '1rem',
                            borderRadius: 'var(--admin-radius-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ShieldExclamationIcon className="w-8 h-8" style={{ color: 'white' }} />
                    </div>
                    <div>
                        <h2 className="admin-heading-2" style={{ marginBottom: '0.25rem' }}>
                            اسکن هوشمند تخلفات
                        </h2>
                        <p className="admin-caption">
                            شناسایی الگوهای مشکوک با هوش مصنوعی
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="admin-btn admin-btn-danger"
                    style={{ padding: '1rem 2rem' }}
                >
                    {isScanning ? (
                        <>
                            <span className="admin-animate-pulse">در حال اسکن...</span>
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5" />
                            شروع اسکن
                        </>
                    )}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div
                    className="admin-card admin-animate-fade-in"
                    style={{
                        padding: '1rem',
                        marginBottom: '2rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        textAlign: 'center'
                    }}
                >
                    <p className="admin-body" style={{ color: '#ef4444' }}>{error}</p>
                </div>
            )}

            {/* Anomalies Results */}
            {anomalies && (
                <div className="admin-animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {anomalies.length === 0 ? (
                        <div
                            className="admin-card"
                            style={{
                                padding: '3rem',
                                textAlign: 'center',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '2px solid rgba(16, 185, 129, 0.3)'
                            }}
                        >
                            <CheckCircleIcon className="w-16 h-16" style={{ margin: '0 auto 1rem', color: '#10b981' }} />
                            <h3 className="admin-heading-2" style={{ color: '#10b981', marginBottom: '0.5rem' }}>
                                وضعیت امن است
                            </h3>
                            <p className="admin-body" style={{ color: 'var(--admin-text-secondary)' }}>
                                هیچ الگوی مشکوکی در فعالیت‌های اخیر یافت نشد.
                            </p>
                        </div>
                    ) : (
                        anomalies.map((item, idx) => {
                            const config = getRiskConfig(item.riskLevel);

                            return (
                                <div
                                    key={idx}
                                    className="admin-card"
                                    style={{
                                        padding: '1.5rem',
                                        background: config.bg,
                                        border: `1px solid ${config.border}`,
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '1.5rem',
                                        alignItems: 'start',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateX(-4px)';
                                        e.currentTarget.style.boxShadow = `4px 0 0 ${config.color}`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateX(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <ExclamationTriangleIcon className="w-6 h-6" style={{ color: config.color }} />
                                    </div>

                                    <div style={{ flex: 1, minWidth: '250px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            <h4 className="admin-heading-3" style={{ fontSize: '1.125rem' }}>
                                                {item.userName}
                                            </h4>
                                            <span
                                                className="admin-badge"
                                                style={{
                                                    background: 'transparent',
                                                    border: `1px solid ${config.color}`,
                                                    color: config.color,
                                                    fontSize: '0.75rem',
                                                    textTransform: 'uppercase'
                                                }}
                                            >
                                                ریسک {config.label}
                                            </span>
                                        </div>
                                        <p className="admin-body" style={{ marginBottom: '0.75rem' }}>
                                            {item.reason}
                                        </p>
                                        <code className="admin-caption" style={{
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: 'var(--admin-radius-sm)'
                                        }}>
                                            ID: {item.userId}
                                        </code>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px' }}>
                                        <p className="admin-label" style={{ marginBottom: '0.25rem' }}>
                                            اقدام پیشنهادی:
                                        </p>
                                        <button className="admin-btn admin-btn-danger" style={{ fontSize: '0.875rem' }}>
                                            {item.suggestedAction}
                                        </button>
                                        <button className="admin-btn admin-btn-ghost" style={{ fontSize: '0.875rem' }}>
                                            <EyeSlashIcon className="w-4 h-4" />
                                            نادیده گرفتن
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Initial State */}
            {!anomalies && !isScanning && !error && (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <ShieldExclamationIcon className="w-16 h-16" style={{ margin: '0 auto 1rem', color: 'var(--admin-text-muted)' }} />
                    <p className="admin-body" style={{ color: 'var(--admin-text-muted)' }}>
                        برای شروع تحلیل، دکمه اسکن را فشار دهید.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ModernSecurityDashboard;
