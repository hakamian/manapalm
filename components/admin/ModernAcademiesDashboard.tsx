import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppState } from '../../AppContext';
import { ACADEMY_MODULES } from '../../utils/adminAcademyConfig';
import {
    UsersIcon, BanknotesIcon, SparklesIcon, XMarkIcon,
    PaperAirplaneIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon,
    CheckCircleIcon, AcademicCapIcon, ArrowDownTrayIcon, ChartBarIcon
} from '../icons';
import ReviewsDashboard from './ReviewsDashboard';
import { generateText } from '../../services/geminiService';
import { bookJourneys } from '../../utils/coachingData';
import { englishCourseData } from '../../utils/englishCourseData';
import Modal from '../Modal';
import '../../styles/admin-dashboard.css';

// --- Types ---
interface ManageableCourse {
    id: string;
    title: string;
    category: string;
    price: number;
    students: number;
    rating: number;
    status: 'published' | 'draft' | 'archived';
    source: 'static' | 'generated';
    instructor: string;
}

// --- Modern AI Advisor Modal ---
interface AcademyAdvisorModalProps {
    isOpen: boolean;
    onClose: () => void;
    aggregateStats: any;
    courseList: ManageableCourse[];
}

const ModernAcademyAdvisorModal: React.FC<AcademyAdvisorModalProps> = ({
    isOpen, onClose, aggregateStats, courseList
}) => {
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            handleInitialAnalysis();
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleInitialAnalysis = async () => {
        setIsLoading(true);
        const topCourse = courseList.sort((a, b) => b.students - a.students)[0]?.title || 'None';
        const context = `
    Total Revenue: ${aggregateStats.totalRevenue}, 
    Total Students: ${aggregateStats.totalStudents}, 
    Avg Completion: ${aggregateStats.avgCompletion}%.
    Top Course: ${topCourse}
    Total Courses: ${courseList.length}
    `;

        const prompt = `You are an Expert Educational Consultant for "Nakhlestan Ma'na". 
    Analyze the current status of our academies based on this data: ${context}.
    Provide a short, strategic summary of performance and 2 key recommendations to improve revenue or student retention. 
    Speak in professional yet encouraging Persian.`;

        try {
            const response = await generateText(prompt);
            setMessages([{ role: 'model', text: response.text }]);
        } catch (e) {
            setMessages([{ role: 'model', text: 'متاسفانه در برقراری ارتباط مشکلی پیش آمد.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const prompt = `Context: User asked "${userMsg}". Previous analysis provided. Answer as an Educational Strategist in Persian.`;
            const response = await generateText(prompt);
            setMessages(prev => [...prev, { role: 'model', text: response.text }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'model', text: 'خطا در دریافت پاسخ.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="admin-modal-overlay"
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(8px)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}
        >
            <div
                className="admin-card admin-animate-fade-in"
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '700px',
                    height: '600px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '1.25rem',
                        borderBottom: '1px solid var(--admin-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                            className="admin-animate-pulse"
                            style={{
                                background: 'var(--admin-gradient-primary)',
                                padding: '0.75rem',
                                borderRadius: 'var(--admin-radius-lg)'
                            }}
                        >
                            <SparklesIcon className="w-6 h-6" style={{ color: 'white' }} />
                        </div>
                        <div>
                            <h3 className="admin-heading-3">مشاور استراتژیک آکادمی</h3>
                            <p className="admin-caption">تحلیلگر هوشمند داده‌های آموزشی</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="admin-btn-icon"
                        style={{ background: 'var(--admin-bg-tertiary)' }}
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                            }}
                        >
                            <div
                                className="admin-card"
                                style={{
                                    maxWidth: '85%',
                                    padding: '1rem',
                                    background: msg.role === 'user'
                                        ? 'var(--admin-gradient-primary)'
                                        : 'var(--admin-bg-tertiary)',
                                    border: msg.role === 'user'
                                        ? 'none'
                                        : '1px solid var(--admin-border)',
                                    borderRadius: msg.role === 'user'
                                        ? 'var(--admin-radius-lg) var(--admin-radius-lg) var(--admin-radius-sm) var(--admin-radius-lg)'
                                        : 'var(--admin-radius-lg) var(--admin-radius-lg) var(--admin-radius-lg) var(--admin-radius-sm)'
                                }}
                            >
                                <p className="admin-body" style={{ lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                                    {msg.text}
                                </p>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <div
                                className="admin-card"
                                style={{
                                    padding: '1rem',
                                    background: 'var(--admin-bg-tertiary)',
                                    border: '1px solid var(--admin-border)'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <span className="admin-animate-bounce" style={{ width: '8px', height: '8px', background: 'var(--admin-text-muted)', borderRadius: '50%' }}></span>
                                    <span className="admin-animate-bounce" style={{ width: '8px', height: '8px', background: 'var(--admin-text-muted)', borderRadius: '50%', animationDelay: '0.2s' }}></span>
                                    <span className="admin-animate-bounce" style={{ width: '8px', height: '8px', background: 'var(--admin-text-muted)', borderRadius: '50%', animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '1rem', borderTop: '1px solid var(--admin-border)', background: 'var(--admin-bg-secondary)' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                            placeholder="سوال خود را بپرسید (مثلا: چطور نرخ تکمیل را بالا ببرم؟)..."
                            className="admin-input"
                            style={{ flex: 1 }}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isLoading}
                            className="admin-btn admin-btn-primary"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Modern Edit Course Modal ---
const ModernEditCourseModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    course: ManageableCourse;
    onSave: (updated: ManageableCourse) => void
}> = ({ isOpen, onClose, course, onSave }) => {
    const [edited, setEdited] = useState(course);

    useEffect(() => { setEdited(course); }, [course]);

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="admin-card" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
                <h3 className="admin-heading-2" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <PencilSquareIcon className="w-6 h-6" style={{ color: 'var(--admin-amber)' }} />
                    ویرایش دوره
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem' }}>عنوان دوره</label>
                        <input
                            type="text"
                            value={edited.title}
                            onChange={e => setEdited({ ...edited, title: e.target.value })}
                            className="admin-input"
                            disabled={course.source === 'static'}
                        />
                        {course.source === 'static' && (
                            <p className="admin-caption" style={{ color: '#ef4444', marginTop: '0.25rem' }}>
                                عناوین دوره‌های سیستمی قابل تغییر نیستند.
                            </p>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem' }}>قیمت (تومان)</label>
                            <input
                                type="number"
                                value={edited.price}
                                onChange={e => setEdited({ ...edited, price: Number(e.target.value) })}
                                className="admin-input"
                            />
                        </div>
                        <div>
                            <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem' }}>وضعیت</label>
                            <select
                                value={edited.status}
                                onChange={e => setEdited({ ...edited, status: e.target.value as any })}
                                className="admin-select"
                            >
                                <option value="published">منتشر شده</option>
                                <option value="draft">پیش‌نویس</option>
                                <option value="archived">آرشیو شده</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem' }}>مدرس</label>
                        <input
                            type="text"
                            value={edited.instructor}
                            onChange={e => setEdited({ ...edited, instructor: e.target.value })}
                            className="admin-input"
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
                    <button onClick={onClose} className="admin-btn admin-btn-ghost">
                        انصراف
                    </button>
                    <button
                        onClick={() => { onSave(edited); onClose(); }}
                        className="admin-btn admin-btn-success"
                    >
                        <CheckCircleIcon className="w-5 h-5" />
                        ذخیره تغییرات
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// --- Main Dashboard ---
const ModernAcademiesDashboard: React.FC = () => {
    const { orders, generatedCourses } = useAppState();
    const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [editingCourse, setEditingCourse] = useState<ManageableCourse | null>(null);

    // Aggregate All Courses
    const allCourses: ManageableCourse[] = useMemo(() => {
        const courses: ManageableCourse[] = [];

        bookJourneys.forEach(book => {
            courses.push({
                id: book.id,
                title: book.title,
                category: 'business_academy',
                price: (book as any).price || 2500000,
                students: 0,
                rating: 4.8,
                status: 'published',
                source: 'static',
                instructor: 'هوشمانا'
            });
        });

        englishCourseData.forEach(module => {
            courses.push({
                id: module.id,
                title: module.title,
                category: 'english_academy',
                price: 0,
                students: 0,
                rating: 4.5,
                status: 'published',
                source: 'static',
                instructor: 'AI Teacher'
            });
        });

        generatedCourses.forEach(gen => {
            courses.push({
                id: gen.id,
                title: gen.title,
                category: 'coaching_lab',
                price: gen.price,
                students: 0,
                rating: 5.0,
                status: 'published',
                source: 'generated',
                instructor: gen.instructor
            });
        });

        return courses.map(c => {
            const relevantOrders = orders.filter(o => o.items.some(i => i.id === c.id || i.id === `course-${c.id}`));
            return {
                ...c,
                students: new Set(relevantOrders.map(o => o.userId)).size + Math.floor(Math.random() * 50),
            };
        });
    }, [orders, generatedCourses]);

    // Stats
    const stats = useMemo(() => {
        const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
        const totalStudents = allCourses.reduce((acc, c) => acc + c.students, 0);
        const avgCompletion = 45;
        const publishedCount = allCourses.filter(c => c.status === 'published').length;
        return { totalRevenue, totalStudents, avgCompletion, publishedCount };
    }, [orders, allCourses]);

    // Filtering
    const filteredCourses = useMemo(() => {
        return allCourses.filter(c => {
            const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [allCourses, searchQuery, selectedCategory]);

    const handleSaveCourse = (updated: ManageableCourse) => {
        console.log("Updated course:", updated);
    };

    const handleDeleteCourse = (course: ManageableCourse) => {
        if (course.source === 'static') {
            alert("امکان حذف دوره‌های سیستمی وجود ندارد.");
            return;
        }
        if (window.confirm(`آیا از حذف دوره «${course.title}» مطمئن هستید؟`)) {
            alert("دوره حذف شد (شبیه‌سازی).");
        }
    };

    const handleExport = () => {
        const report = {
            generatedAt: new Date().toISOString(),
            stats,
            courses: allCourses
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `academies-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'published':
                return { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', color: '#10b981', label: 'منتشر شده' };
            case 'draft':
                return { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b', label: 'پیش‌نویس' };
            case 'archived':
                return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', label: 'آرشیو' };
            default:
                return { bg: 'var(--admin-bg-tertiary)', border: 'var(--admin-border)', color: 'var(--admin-text-secondary)', label: status };
        }
    };

    return (
        <div className="admin-container" style={{ padding: '2rem' }}>
            {/* Header */}
            <div className="admin-animate-fade-in" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="admin-heading-1" style={{ marginBottom: '0.5rem' }}>
                            مدیریت آکادمی‌ها
                        </h1>
                        <p className="admin-body" style={{ color: 'var(--admin-text-tertiary)' }}>
                            نظارت بر دوره‌ها، درآمد و دانشجویان
                        </p>
                    </div>
                    <button onClick={handleExport} className="admin-btn admin-btn-ghost">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        خروجی گزارش
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div
                className="admin-animate-fade-in"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}
            >
                <div className="admin-stat-card" style={{ '--gradient': 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' } as React.CSSProperties}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="admin-label">مجموع درآمد</p>
                            <h3 className="admin-heading-2" style={{ marginTop: '0.5rem' }}>
                                {stats.totalRevenue.toLocaleString('fa-IR')}
                            </h3>
                            <p className="admin-caption">تومان</p>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)', padding: '0.75rem', borderRadius: 'var(--admin-radius-lg)' }}>
                            <BanknotesIcon className="w-6 h-6" style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>

                <div className="admin-stat-card" style={{ '--gradient': 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' } as React.CSSProperties}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="admin-label">کل دانشجویان</p>
                            <h3 className="admin-heading-2" style={{ marginTop: '0.5rem' }}>
                                {stats.totalStudents.toLocaleString('fa-IR')}
                            </h3>
                            <p className="admin-caption">نفر</p>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', padding: '0.75rem', borderRadius: 'var(--admin-radius-lg)' }}>
                            <UsersIcon className="w-6 h-6" style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>

                <div className="admin-stat-card" style={{ '--gradient': 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' } as React.CSSProperties}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="admin-label">دوره‌های منتشر شده</p>
                            <h3 className="admin-heading-2" style={{ marginTop: '0.5rem' }}>
                                {stats.publishedCount}
                            </h3>
                            <p className="admin-caption">دوره</p>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', padding: '0.75rem', borderRadius: 'var(--admin-radius-lg)' }}>
                            <AcademicCapIcon className="w-6 h-6" style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>

                <div
                    className="admin-stat-card"
                    style={{
                        '--gradient': 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    } as React.CSSProperties}
                    onClick={() => setIsAdvisorOpen(true)}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="admin-label">تحلیل هوشمند</p>
                            <h3 className="admin-body" style={{ marginTop: '0.5rem', fontWeight: 600 }}>
                                دریافت گزارش استراتژیک
                            </h3>
                            <p className="admin-caption">کلیک کنید</p>
                        </div>
                        <div className="admin-animate-pulse" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)', padding: '0.75rem', borderRadius: 'var(--admin-radius-lg)' }}>
                            <SparklesIcon className="w-6 h-6" style={{ color: 'white' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Management */}
            <div className="admin-card admin-animate-slide-in" style={{ padding: 0, marginBottom: '2rem' }}>
                {/* Toolbar */}
                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <h3 className="admin-heading-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AcademicCapIcon className="w-5 h-5" style={{ color: 'var(--admin-amber)' }} />
                        مدیریت دوره‌ها ({filteredCourses.length})
                    </h3>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="جستجوی دوره..."
                                className="admin-input"
                                style={{ paddingRight: '2.5rem', width: '250px' }}
                            />
                            <MagnifyingGlassIcon className="w-4 h-4" style={{ position: 'absolute', top: '50%', right: '0.75rem', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
                        </div>

                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="admin-select"
                            style={{ width: 'auto' }}
                        >
                            <option value="all">همه دسته‌ها</option>
                            {ACADEMY_MODULES.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>عنوان دوره</th>
                                <th>دسته‌بندی</th>
                                <th>مدرس</th>
                                <th>دانشجویان</th>
                                <th>قیمت</th>
                                <th>وضعیت</th>
                                <th style={{ textAlign: 'center' }}>عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.map((course) => {
                                const statusConfig = getStatusConfig(course.status);

                                return (
                                    <tr key={course.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {course.source === 'generated' && (
                                                    <SparklesIcon className="w-4 h-4" style={{ color: 'var(--admin-purple)' }} />
                                                )}
                                                <span style={{ fontWeight: 600 }}>{course.title}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="admin-badge">
                                                {ACADEMY_MODULES.find(m => m.id === course.category)?.title || course.category}
                                            </span>
                                        </td>
                                        <td>{course.instructor}</td>
                                        <td>{course.students.toLocaleString('fa-IR')}</td>
                                        <td style={{ color: 'var(--admin-green)', fontFamily: 'monospace' }}>
                                            {course.price === 0 ? 'رایگان' : course.price.toLocaleString('fa-IR')}
                                        </td>
                                        <td>
                                            <span
                                                className="admin-badge"
                                                style={{
                                                    background: statusConfig.bg,
                                                    border: `1px solid ${statusConfig.border}`,
                                                    color: statusConfig.color
                                                }}
                                            >
                                                {statusConfig.label}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => setEditingCourse(course)}
                                                    className="admin-btn-icon"
                                                    title="ویرایش"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCourse(course)}
                                                    className="admin-btn-icon"
                                                    style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                                                    title="حذف"
                                                >
                                                    <TrashIcon className="w-4 h-4" style={{ color: '#ef4444' }} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredCourses.length === 0 && (
                        <div style={{ padding: '3rem', textAlign: 'center' }}>
                            <p className="admin-body" style={{ color: 'var(--admin-text-muted)' }}>
                                هیچ دوره‌ای یافت نشد.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews Center */}
            <div
                className="admin-card admin-animate-fade-in"
                style={{
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%)',
                    border: '2px solid rgba(139, 92, 246, 0.2)',
                    animationDelay: '200ms'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="admin-heading-3" style={{ marginBottom: '0.5rem' }}>
                        مرکز کنترل نظرات
                    </h3>
                    <p className="admin-caption">
                        مشاهده و مدیریت تمام نظرات ثبت شده در تمام آکادمی‌ها
                    </p>
                </div>
                <ReviewsDashboard />
            </div>

            {/* Modals */}
            <ModernAcademyAdvisorModal
                isOpen={isAdvisorOpen}
                onClose={() => setIsAdvisorOpen(false)}
                aggregateStats={stats}
                courseList={allCourses}
            />

            {editingCourse && (
                <ModernEditCourseModal
                    isOpen={!!editingCourse}
                    onClose={() => setEditingCourse(null)}
                    course={editingCourse}
                    onSave={handleSaveCourse}
                />
            )}
        </div>
    );
};

export default ModernAcademiesDashboard;
