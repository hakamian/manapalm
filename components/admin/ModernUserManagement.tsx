import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import {
    UsersIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    CheckCircleIcon,
    XMarkIcon
} from '../icons';
import '../../styles/admin-dashboard.css';

interface ModernUserManagementProps {
    allUsers: User[];
    onAdminUpdateUser: (userId: string, updatedData: Partial<User>) => void;
    onAdminGrantPoints: (userId: string, points: number, reason: string) => void;
}

const ModernUserManagement: React.FC<ModernUserManagementProps> = ({
    allUsers,
    onAdminUpdateUser,
    onAdminGrantPoints
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

    // Filtered and searched users
    const filteredUsers = useMemo(() => {
        return allUsers.filter(user => {
            // Search filter
            const matchesSearch =
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (user.phone && user.phone.includes(searchQuery));

            return matchesSearch;
        });
    }, [allUsers, searchQuery]);

    // Statistics
    const stats = useMemo(() => {
        const total = allUsers.length;
        const admins = allUsers.filter(u => u.isAdmin === true).length;
        const customers = total - admins;

        return { total, admins, customers };
    }, [allUsers]);

    const handleToggleUser = (userId: string) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };

    const handleToggleAll = () => {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const handleExportUsers = () => {
        // Simple CSV export
        const csv = [
            ['نام', 'ایمیل', 'تلفن', 'نقش', 'امتیاز'].join(','),
            ...filteredUsers.map(u =>
                [u.name, u.email || '', u.phone || '', u.isAdmin ? 'ادمین' : 'کاربر', u.points].join(',')
            )
        ].join('\n');

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    return (
        <div className="admin-container" style={{ padding: '2rem' }}>
            {/* Header */}
            <div className="admin-animate-fade-in" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h1 className="admin-heading-1" style={{ marginBottom: '0.5rem' }}>
                            مدیریت کاربران
                        </h1>
                        <p className="admin-body" style={{ color: 'var(--admin-text-tertiary)' }}>
                            مدیریت و نظارت بر کاربران پلتفرم
                        </p>
                    </div>
                    <button className="admin-btn admin-btn-success">
                        <PlusIcon className="w-5 h-5" />
                        افزودن کاربر جدید
                    </button>
                </div>

                {/* Stats Cards */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginTop: '1.5rem'
                    }}
                >
                    <div className="admin-card" style={{ padding: '1rem' }}>
                        <p className="admin-label" style={{ marginBottom: '0.5rem' }}>کل کاربران</p>
                        <h3 className="admin-heading-2" style={{ fontSize: '1.5rem' }}>
                            {stats.total.toLocaleString('fa-IR')}
                        </h3>
                    </div>
                    <div className="admin-card" style={{ padding: '1rem' }}>
                        <p className="admin-label" style={{ marginBottom: '0.5rem' }}>ادمین‌ها</p>
                        <h3 className="admin-heading-2" style={{ fontSize: '1.5rem', color: 'var(--admin-purple)' }}>
                            {stats.admins.toLocaleString('fa-IR')}
                        </h3>
                    </div>
                    <div className="admin-card" style={{ padding: '1rem' }}>
                        <p className="admin-label" style={{ marginBottom: '0.5rem' }}>کاربران عادی</p>
                        <h3 className="admin-heading-2" style={{ fontSize: '1.5rem', color: 'var(--admin-blue)' }}>
                            {stats.customers.toLocaleString('fa-IR')}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="admin-card admin-animate-slide-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <MagnifyingGlassIcon
                            className="w-5 h-5"
                            style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--admin-text-muted)',
                                pointerEvents: 'none'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="جستجو بر اساس نام، ایمیل یا تلفن..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="admin-input"
                            style={{ paddingRight: '3rem' }}
                        />
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExportUsers}
                        className="admin-btn admin-btn-ghost"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        خروجی CSV
                    </button>
                </div>

                {/* Bulk Actions */}
                {selectedUsers.size > 0 && (
                    <div
                        style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            background: 'var(--admin-bg-tertiary)',
                            borderRadius: 'var(--admin-radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}
                    >
                        <span className="admin-caption">
                            {selectedUsers.size.toLocaleString('fa-IR')} کاربر انتخاب شده
                        </span>
                        <button className="admin-btn admin-btn-primary" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>
                            اعمال تغییرات دسته‌جمعی
                        </button>
                        <button
                            onClick={() => setSelectedUsers(new Set())}
                            className="admin-btn admin-btn-ghost"
                            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                        >
                            لغو انتخاب
                        </button>
                    </div>
                )}
            </div>

            {/* Users Table */}
            <div className="admin-table-container admin-animate-fade-in" style={{ animationDelay: '200ms' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                                    onChange={handleToggleAll}
                                    style={{ cursor: 'pointer' }}
                                />
                            </th>
                            <th>کاربر</th>
                            <th>ایمیل</th>
                            <th>تلفن</th>
                            <th>نقش</th>
                            <th>امتیاز</th>
                            <th>تاریخ عضویت</th>
                            <th style={{ textAlign: 'center' }}>عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>
                                    <UsersIcon className="w-12 h-12" style={{ margin: '0 auto 1rem', color: 'var(--admin-text-muted)' }} />
                                    <p className="admin-body" style={{ color: 'var(--admin-text-muted)' }}>
                                        هیچ کاربری یافت نشد
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => {
                                return (
                                    <tr key={user.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.has(user.id)}
                                                onChange={() => handleToggleUser(user.id)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        background: 'var(--admin-gradient-primary)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: 700,
                                                        fontSize: '0.875rem'
                                                    }}
                                                >
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>
                                                    {user.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="admin-caption" style={{ fontFamily: 'monospace' }}>
                                                {user.email || '-'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="admin-caption">
                                                {user.phone || '-'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={user.isAdmin ? 'admin-badge admin-badge-danger' : 'admin-badge admin-badge-info'}>
                                                {user.isAdmin ? 'ادمین' : 'کاربر'}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: 'var(--admin-amber)', fontFamily: 'monospace' }}>
                                                {user.points.toLocaleString('fa-IR')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="admin-caption">
                                                {formatDate(user.joinDate)}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button className="admin-btn-icon">
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                                <button className="admin-btn-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                                    <TrashIcon className="w-4 h-4" style={{ color: '#ef4444' }} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div
                className="admin-card"
                style={{
                    marginTop: '1.5rem',
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <span className="admin-caption">
                    نمایش {filteredUsers.length.toLocaleString('fa-IR')} از {allUsers.length.toLocaleString('fa-IR')} کاربر
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="admin-btn admin-btn-ghost" style={{ padding: '0.5rem 1rem' }}>قبلی</button>
                    <button className="admin-btn admin-btn-primary" style={{ padding: '0.5rem 1rem' }}>1</button>
                    <button className="admin-btn admin-btn-ghost" style={{ padding: '0.5rem 1rem' }}>2</button>
                    <button className="admin-btn admin-btn-ghost" style={{ padding: '0.5rem 1rem' }}>3</button>
                    <button className="admin-btn admin-btn-ghost" style={{ padding: '0.5rem 1rem' }}>بعدی</button>
                </div>
            </div>
        </div>
    );
};

export default ModernUserManagement;
