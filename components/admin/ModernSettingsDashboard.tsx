import React, { useState, useEffect } from 'react';
import {
    CogIcon,
    BellIcon,
    ShieldCheckIcon,
    GlobeIcon,
    EnvelopeIcon,
    KeyIcon,
    CheckCircleIcon,
    BanknotesIcon
} from '../icons';
import '../../styles/admin-dashboard.css';
import { useAppState, useAppDispatch } from '../../AppContext';
import { dbAdapter } from '../../services/dbAdapter';

interface SettingSection {
    id: string;
    title: string;
    description: string;
    icon: React.FC<any>;
    gradient: string;
}

const ModernSettingsDashboard: React.FC = () => {
    const { appSettings } = useAppState();
    const dispatch = useAppDispatch();

    const [activeSection, setActiveSection] = useState('general');
    const [settings, setSettings] = useState({
        siteName: 'نخلستان معنا',
        siteDescription: 'پلتفرم جامع رشد شخصی و معنوی',
        usdToTomanRate: 1200000,
        language: 'fa',
        currency: 'IRR',
        timezone: 'Asia/Tehran',
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: true,
        theme: 'dark',
        primaryColor: '#8b5cf6',
        accentColor: '#f59e0b'
    });

    const [isSaving, setIsSaving] = useState(false);

    // Sync from global state on mount
    useEffect(() => {
        if (appSettings) {
            setSettings(prev => ({
                ...prev,
                usdToTomanRate: appSettings.usdToTomanRate || 600000,
                // Add other syncs if needed
            }));
        }
    }, [appSettings]);

    const sections: SettingSection[] = [
        {
            id: 'general',
            title: 'تنظیمات عمومی',
            description: 'اطلاعات پایه و نرخ ارز سایت',
            icon: CogIcon,
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
        },
        {
            id: 'notifications',
            title: 'اعلان‌ها',
            description: 'مدیریت اعلان‌های سیستم',
            icon: BellIcon,
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
        },
        {
            id: 'security',
            title: 'امنیت',
            description: 'تنظیمات امنیتی و احراز هویت',
            icon: ShieldCheckIcon,
            gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)'
        },
        {
            id: 'localization',
            title: 'محلی‌سازی',
            description: 'زبان، ارز و منطقه زمانی',
            icon: GlobeIcon,
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
        }
    ];

    const handleSave = async () => {
        setIsSaving(true);
        console.log('💾 [Admin] Saving modern settings:', settings);

        try {
            const newRate = settings.usdToTomanRate;
            const oldRate = appSettings.usdToTomanRate || 1;

            // 🚀 If rate changed, trigger global price recalculation 
            if (newRate !== oldRate) {
                console.log(`💱 [Admin] Rate changed from ${oldRate} to ${newRate}. Triggering price update...`);
                dispatch({
                    type: 'BULK_UPDATE_PRICES_BY_RATE',
                    payload: { newRate }
                });
                // 💾 Persist to DB for all users
                await dbAdapter.saveAppSettings({ ...appSettings, usdToTomanRate: newRate });
            } else {
                // Otherwise just update settings
                const updatedSettings = { ...appSettings, usdToTomanRate: newRate };
                dispatch({
                    type: 'UPDATE_APP_SETTINGS',
                    payload: updatedSettings
                });
                await dbAdapter.saveAppSettings(updatedSettings);
            }

            // Simulated delay for premium feel
            setTimeout(() => {
                setIsSaving(false);
                alert('تنظیمات با موفقیت ذخیره شد و قیمت‌ها به‌روزرسانی شدند!');
            }, 800);

        } catch (err) {
            console.error("Failed to save settings", err);
            setIsSaving(false);
            alert('خطا در ذخیره تنظیمات');
        }
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString('fa-IR');
    };

    const parseNumber = (str: string): number => {
        const englishStr = str
            .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
            .replace(/,/g, '');
        const num = Number(englishStr);
        return isNaN(num) ? 0 : num;
    };

    const renderGeneralSettings = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="admin-card" style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <BanknotesIcon className="w-8 h-8 text-emerald-400" />
                    <div>
                        <h3 className="admin-heading-3" style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>مدیریت نرخ ارز (دلار به ریال)</h3>
                        <p className="admin-caption">نرخ پایه برای محاسبات قیمتی و تبدیل ارز در کل پلتفرم</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem' }}>نرخ هر دلار (ریال)</label>
                        <input
                            type="text"
                            value={settings.usdToTomanRate.toLocaleString('fa-IR')}
                            onChange={(e) => setSettings({ ...settings, usdToTomanRate: parseNumber(e.target.value) })}
                            className="admin-input"
                            style={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'monospace', textAlign: 'left', direction: 'ltr' }}
                        />
                    </div>
                    <div style={{ paddingBottom: '0.5rem' }}>
                        <span className="text-emerald-400 font-bold">ریال</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button
                        onClick={() => setSettings(s => ({ ...s, usdToTomanRate: s.usdToTomanRate + 100000 }))}
                        className="admin-btn" style={{ padding: '0.25rem 0.75rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '0.8rem' }}
                    >
                        + ۱۰۰,۰۰۰ ریال
                    </button>
                    <button
                        onClick={() => setSettings(s => ({ ...s, usdToTomanRate: Math.max(100000, s.usdToTomanRate - 100000) }))}
                        className="admin-btn" style={{ padding: '0.25rem 0.75rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '0.8rem' }}
                    >
                        - ۱۰۰,۰۰۰ ریال
                    </button>
                </div>
                <p className="admin-caption" style={{ marginTop: '0.75rem', color: 'rgba(255,165,0,0.8)' }}>
                    * تغییر این نرخ مستقیماً بر قیمت ابزارهای هوشمند و دوره‌ها تاثیر می‌گذارد.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                    <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        نام سایت
                    </label>
                    <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        className="admin-input"
                    />
                </div>
            </div>

            <div>
                <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    توضیحات سایت
                </label>
                <textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    className="admin-input"
                    rows={3}
                    style={{ resize: 'vertical' }}
                />
            </div>


            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--admin-bg-tertiary)', borderRadius: 'var(--admin-radius-md)' }}>
                <input
                    type="checkbox"
                    id="maintenance"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                    <label htmlFor="maintenance" className="admin-body" style={{ cursor: 'pointer', fontWeight: 600 }}>
                        حالت تعمیر و نگهداری
                    </label>
                    <p className="admin-caption" style={{ marginTop: '0.25rem' }}>
                        سایت را برای کاربران غیرفعال کنید
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--admin-bg-tertiary)', borderRadius: 'var(--admin-radius-md)' }}>
                <input
                    type="checkbox"
                    id="registration"
                    checked={settings.allowRegistration}
                    onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                    <label htmlFor="registration" className="admin-body" style={{ cursor: 'pointer', fontWeight: 600 }}>
                        امکان ثبت‌نام
                    </label>
                    <p className="admin-caption" style={{ marginTop: '0.25rem' }}>
                        اجازه ثبت‌نام کاربران جدید
                    </p>
                </div>
            </div>
        </div>
    );

    const renderNotificationSettings = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--admin-bg-tertiary)', borderRadius: 'var(--admin-radius-md)' }}>
                <input
                    type="checkbox"
                    id="email-notif"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                    <label htmlFor="email-notif" className="admin-body" style={{ cursor: 'pointer', fontWeight: 600 }}>
                        اعلان‌های ایمیل
                    </label>
                    <p className="admin-caption" style={{ marginTop: '0.25rem' }}>
                        ارسال اعلان‌ها از طریق ایمیل
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--admin-bg-tertiary)', borderRadius: 'var(--admin-radius-md)' }}>
                <input
                    type="checkbox"
                    id="sms-notif"
                    checked={settings.smsNotifications}
                    onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                    <label htmlFor="sms-notif" className="admin-body" style={{ cursor: 'pointer', fontWeight: 600 }}>
                        اعلان‌های پیامکی
                    </label>
                    <p className="admin-caption" style={{ marginTop: '0.25rem' }}>
                        ارسال اعلان‌ها از طریق SMS
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--admin-bg-tertiary)', borderRadius: 'var(--admin-radius-md)' }}>
                <input
                    type="checkbox"
                    id="push-notif"
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                    <label htmlFor="push-notif" className="admin-body" style={{ cursor: 'pointer', fontWeight: 600 }}>
                        اعلان‌های Push
                    </label>
                    <p className="admin-caption" style={{ marginTop: '0.25rem' }}>
                        ارسال اعلان‌های فوری به مرورگر
                    </p>
                </div>
            </div>
        </div>
    );

    const renderSecuritySettings = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--admin-bg-tertiary)', borderRadius: 'var(--admin-radius-md)' }}>
                <input
                    type="checkbox"
                    id="email-verify"
                    checked={settings.requireEmailVerification}
                    onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                    <label htmlFor="email-verify" className="admin-body" style={{ cursor: 'pointer', fontWeight: 600 }}>
                        تایید ایمیل الزامی
                    </label>
                    <p className="admin-caption" style={{ marginTop: '0.25rem' }}>
                        کاربران باید ایمیل خود را تایید کنند
                    </p>
                </div>
            </div>

            <div className="admin-card" style={{ padding: '1.5rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <KeyIcon className="w-6 h-6" style={{ color: 'var(--admin-purple)' }} />
                    <div>
                        <h3 className="admin-heading-3" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
                            تغییر رمز عبور ادمین
                        </h3>
                        <p className="admin-caption">
                            برای امنیت بیشتر، رمز عبور خود را به‌طور منظم تغییر دهید
                        </p>
                    </div>
                </div>
                <button className="admin-btn admin-btn-primary">
                    تغییر رمز عبور
                </button>
            </div>

            <div className="admin-card" style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <ShieldCheckIcon className="w-6 h-6" style={{ color: 'var(--admin-green)' }} />
                    <div>
                        <h3 className="admin-heading-3" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
                            احراز هویت دو مرحله‌ای
                        </h3>
                        <p className="admin-caption">
                            امنیت حساب خود را با فعال‌سازی 2FA افزایش دهید
                        </p>
                    </div>
                </div>
                <button className="admin-btn admin-btn-success">
                    فعال‌سازی 2FA
                </button>
            </div>
        </div>
    );

    const renderLocalizationSettings = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
                <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    زبان پیش‌فرض
                </label>
                <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="admin-select"
                >
                    <option value="fa">فارسی</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                </select>
            </div>

            <div>
                <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    ارز
                </label>
                <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="admin-select"
                >
                    <option value="IRR">ریال ایران (IRR)</option>
                    <option value="USD">دلار آمریکا (USD)</option>
                    <option value="EUR">یورو (EUR)</option>
                </select>
            </div>

            <div>
                <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    منطقه زمانی
                </label>
                <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="admin-select"
                >
                    <option value="Asia/Tehran">تهران (UTC+3:30)</option>
                    <option value="UTC">UTC (UTC+0)</option>
                    <option value="America/New_York">نیویورک (UTC-5)</option>
                </select>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'general':
                return renderGeneralSettings();
            case 'notifications':
                return renderNotificationSettings();
            case 'security':
                return renderSecuritySettings();
            case 'localization':
                return renderLocalizationSettings();
            default:
                return null;
        }
    };

    return (
        <div className="admin-container" style={{ padding: '2rem' }}>
            {/* Header */}
            <div className="admin-animate-fade-in" style={{ marginBottom: '2rem' }}>
                <h1 className="admin-heading-1" style={{ marginBottom: '0.5rem' }}>
                    تنظیمات سیستم
                </h1>
                <p className="admin-body" style={{ color: 'var(--admin-text-tertiary)' }}>
                    پیکربندی و مدیریت تنظیمات پلتفرم
                </p>
            </div>

            {/* Settings Sections Grid */}
            <div
                className="admin-animate-fade-in"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}
            >
                {sections.map((section, index) => (
                    <div
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className="admin-card"
                        style={{
                            padding: '1.5rem',
                            cursor: 'pointer',
                            border: activeSection === section.id ? '2px solid var(--admin-purple)' : '1px solid var(--admin-glass-border)',
                            animationDelay: `${index * 50}ms`
                        }}
                    >
                        <div
                            style={{
                                background: section.gradient,
                                width: '48px',
                                height: '48px',
                                borderRadius: 'var(--admin-radius-lg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}
                        >
                            <section.icon className="w-6 h-6" style={{ color: 'white' }} />
                        </div>
                        <h3 className="admin-heading-3" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                            {section.title}
                        </h3>
                        <p className="admin-caption">
                            {section.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* Settings Content */}
            <div className="admin-card admin-animate-slide-in" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 className="admin-heading-2" style={{ marginBottom: '0.5rem' }}>
                        {sections.find(s => s.id === activeSection)?.title}
                    </h2>
                    <p className="admin-caption">
                        {sections.find(s => s.id === activeSection)?.description}
                    </p>
                </div>

                {renderContent()}

                {/* Save Button */}
                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--admin-border)' }}>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="admin-btn admin-btn-success"
                        style={{ minWidth: '200px', opacity: isSaving ? 0.7 : 1 }}
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <CheckCircleIcon className="w-5 h-5" />
                        )}
                        {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModernSettingsDashboard;
