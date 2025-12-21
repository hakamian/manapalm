import React, { useState } from 'react';
import {
    CogIcon,
    BellIcon,
    ShieldCheckIcon,
    PaintBrushIcon,
    GlobeAltIcon,
    CurrencyDollarIcon,
    EnvelopeIcon,
    KeyIcon,
    CheckCircleIcon
} from '../icons';
import '../../styles/admin-dashboard.css';

interface SettingSection {
    id: string;
    title: string;
    description: string;
    icon: React.FC<any>;
    gradient: string;
}

const ModernSettingsDashboard: React.FC = () => {
    const [activeSection, setActiveSection] = useState('general');
    const [settings, setSettings] = useState({
        siteName: 'نخلستان معنا',
        siteDescription: 'پلتفرم جامع رشد شخصی و معنوی',
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

    const sections: SettingSection[] = [
        {
            id: 'general',
            title: 'تنظیمات عمومی',
            description: 'اطلاعات پایه و تنظیمات سایت',
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
            id: 'appearance',
            title: 'ظاهر',
            description: 'تم و رنگ‌بندی سایت',
            icon: PaintBrushIcon,
            gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
        },
        {
            id: 'localization',
            title: 'محلی‌سازی',
            description: 'زبان، ارز و منطقه زمانی',
            icon: GlobeAltIcon,
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
        },
        {
            id: 'payment',
            title: 'پرداخت',
            description: 'درگاه‌های پرداخت و تنظیمات مالی',
            icon: CurrencyDollarIcon,
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        }
    ];

    const handleSave = () => {
        console.log('Saving settings:', settings);
        // Show success message
        alert('تنظیمات با موفقیت ذخیره شد!');
    };

    const renderGeneralSettings = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                        <EnvelopeIcon className="w-5 h-5" style={{ display: 'inline', marginLeft: '0.5rem' }} />
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

    const renderAppearanceSettings = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
                <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    تم پیش‌فرض
                </label>
                <select
                    value={settings.theme}
                    onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                    className="admin-select"
                >
                    <option value="light">روشن</option>
                    <option value="dark">تیره</option>
                    <option value="auto">خودکار</option>
                </select>
            </div>

            <div>
                <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    رنگ اصلی
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        style={{
                            width: '60px',
                            height: '40px',
                            border: 'none',
                            borderRadius: 'var(--admin-radius-md)',
                            cursor: 'pointer'
                        }}
                    />
                    <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="admin-input"
                        style={{ flex: 1 }}
                    />
                </div>
            </div>

            <div>
                <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    رنگ تاکیدی
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        style={{
                            width: '60px',
                            height: '40px',
                            border: 'none',
                            borderRadius: 'var(--admin-radius-md)',
                            cursor: 'pointer'
                        }}
                    />
                    <input
                        type="text"
                        value={settings.accentColor}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        className="admin-input"
                        style={{ flex: 1 }}
                    />
                </div>
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
            case 'appearance':
                return renderAppearanceSettings();
            case 'localization':
                return renderLocalizationSettings();
            case 'payment':
                return (
                    <div className="admin-card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <CurrencyDollarIcon className="w-12 h-12" style={{ margin: '0 auto 1rem', color: 'var(--admin-text-muted)' }} />
                        <p className="admin-body" style={{ color: 'var(--admin-text-muted)' }}>
                            تنظیمات پرداخت به زودی اضافه می‌شود
                        </p>
                    </div>
                );
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
                        className="admin-btn admin-btn-success"
                        style={{ minWidth: '200px' }}
                    >
                        <CheckCircleIcon className="w-5 h-5" />
                        ذخیره تغییرات
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModernSettingsDashboard;
