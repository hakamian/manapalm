
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../../AppContext';
import { ACADEMY_MODULES, AcademyConfig } from '../../utils/adminAcademyConfig';
import { UsersIcon, BanknotesIcon, StarIcon, ChartBarIcon, ArrowLeftIcon, CogIcon, AcademicCapIcon, ArrowDownIcon, SparklesIcon, XMarkIcon, LightBulbIcon, PaperAirplaneIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, CheckCircleIcon, PlusIcon } from '../icons';
import ReviewsDashboard from './ReviewsDashboard';
import { generateText } from '../../services/geminiService';
import { bookJourneys } from '../../utils/coachingData';
import { englishCourseData } from '../../utils/englishCourseData';
import Modal from '../Modal';

// --- Types & Mappers ---
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

// --- AI Advisor Modal ---
interface AcademyAdvisorModalProps {
    isOpen: boolean;
    onClose: () => void;
    aggregateStats: any;
    courseList: ManageableCourse[];
}

const AcademyAdvisorModal: React.FC<AcademyAdvisorModalProps> = ({ isOpen, onClose, aggregateStats, courseList }) => {
    const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
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
        const topCourse = courseList.sort((a,b) => b.students - a.students)[0]?.title || 'None';
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 w-full max-w-2xl h-[600px] rounded-2xl border border-gray-700 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-full">
                            <SparklesIcon className="w-6 h-6 text-blue-400 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">مشاور استراتژیک آکادمی</h3>
                            <p className="text-xs text-gray-400">تحلیلگر هوشمند داده‌های آموزشی</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none border border-gray-600'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-700 p-3 rounded-xl rounded-bl-none">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-gray-700 bg-gray-900/50 rounded-b-2xl">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                            placeholder="سوال خود را بپرسید (مثلا: چطور نرخ تکمیل را بالا ببرم؟)..."
                            className="flex-grow bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button onClick={handleSendMessage} disabled={!input.trim() || isLoading} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:opacity-50">
                            <PaperAirplaneIcon className="w-6 h-6 dir-ltr" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Edit Course Modal ---
const EditCourseModal: React.FC<{ 
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
            <div className="p-6 w-full max-w-md bg-gray-800 text-white rounded-xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <PencilSquareIcon className="w-6 h-6 text-amber-500"/> ویرایش دوره
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">عنوان دوره</label>
                        <input 
                            type="text" 
                            value={edited.title} 
                            onChange={e => setEdited({...edited, title: e.target.value})}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
                            disabled={course.source === 'static'}
                        />
                        {course.source === 'static' && <span className="text-[10px] text-red-400">عناوین دوره‌های سیستمی قابل تغییر نیستند.</span>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">قیمت (تومان)</label>
                            <input 
                                type="number" 
                                value={edited.price} 
                                onChange={e => setEdited({...edited, price: Number(e.target.value)})}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">وضعیت</label>
                            <select 
                                value={edited.status} 
                                onChange={e => setEdited({...edited, status: e.target.value as any})}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
                            >
                                <option value="published">منتشر شده</option>
                                <option value="draft">پیش‌نویس</option>
                                <option value="archived">آرشیو شده</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">مدرس</label>
                        <input 
                            type="text" 
                            value={edited.instructor} 
                            onChange={e => setEdited({...edited, instructor: e.target.value})}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">انصراف</button>
                    <button 
                        onClick={() => { onSave(edited); onClose(); }} 
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-bold"
                    >
                        ذخیره تغییرات
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const AcademiesDashboard: React.FC = () => {
    const { orders, reviews, generatedCourses } = useAppState();
    const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [editingCourse, setEditingCourse] = useState<ManageableCourse | null>(null);

    // 1. Aggregate All Courses (Static + Generated)
    const allCourses: ManageableCourse[] = useMemo(() => {
        const courses: ManageableCourse[] = [];

        // Business Courses (Static)
        bookJourneys.forEach(book => {
            courses.push({
                id: book.id,
                title: book.title,
                category: 'business_academy',
                price: (book as any).price || 2500000, // Fallback price
                students: 0, // Will calc below
                rating: 4.8, // Mock
                status: 'published',
                source: 'static',
                instructor: 'هوشمانا'
            });
        });

        // English Courses (Static)
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

        // Generated Courses
        generatedCourses.forEach(gen => {
            courses.push({
                id: gen.id,
                title: gen.title,
                category: 'coaching_lab', // Defaulting generated to coaching lab or generic
                price: gen.price,
                students: 0,
                rating: 5.0, // New courses
                status: 'published',
                source: 'generated',
                instructor: gen.instructor
            });
        });

        // Calculate Students & Real Revenue for each
        return courses.map(c => {
            const relevantOrders = orders.filter(o => o.items.some(i => i.productId === c.id || i.id === `course-${c.id}`));
            return {
                ...c,
                students: new Set(relevantOrders.map(o => o.userId)).size + Math.floor(Math.random() * 50), // Add mock students
                // If it's a static course, we might not have orders linking directly by ID in this demo, so we keep mock + real
            };
        });
    }, [orders, generatedCourses]);

    // 2. Aggregate Stats
    const stats = useMemo(() => {
        const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0); // Simplified
        const totalStudents = allCourses.reduce((acc, c) => acc + c.students, 0);
        const avgCompletion = 45; // Mock avg
        return { totalRevenue, totalStudents, avgCompletion };
    }, [orders, allCourses]);

    // 3. Filtering
    const filteredCourses = useMemo(() => {
        return allCourses.filter(c => {
            const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [allCourses, searchQuery, selectedCategory]);

    const handleSaveCourse = (updated: ManageableCourse) => {
        // In a real app, dispatch an action. Here we just alert for static ones or update state for generated.
        if (updated.source === 'static') {
            console.log("Updated static course (mock):", updated);
        } else {
            console.log("Updated generated course:", updated);
            // dispatch update action here
        }
    };

    const handleDeleteCourse = (course: ManageableCourse) => {
        if (course.source === 'static') {
            alert("امکان حذف دوره‌های سیستمی وجود ندارد.");
            return;
        }
        if (window.confirm(`آیا از حذف دوره «${course.title}» مطمئن هستید؟`)) {
            // dispatch delete action
            alert("دوره حذف شد (شبیه‌سازی).");
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-full text-green-400"><BanknotesIcon className="w-6 h-6"/></div>
                    <div>
                        <p className="text-xs text-gray-400">مجموع درآمد آکادمی‌ها</p>
                        <p className="text-xl font-bold text-white">{stats.totalRevenue.toLocaleString('fa-IR')} <span className="text-xs text-gray-500">تومان</span></p>
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-full text-blue-400"><UsersIcon className="w-6 h-6"/></div>
                    <div>
                        <p className="text-xs text-gray-400">کل دانشجویان</p>
                        <p className="text-xl font-bold text-white">{stats.totalStudents.toLocaleString('fa-IR')} <span className="text-xs text-gray-500">نفر</span></p>
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center gap-4 cursor-pointer hover:bg-gray-750 transition-colors" onClick={() => setIsAdvisorOpen(true)}>
                    <div className="p-3 bg-purple-500/10 rounded-full text-purple-400"><SparklesIcon className="w-6 h-6"/></div>
                    <div>
                        <p className="text-xs text-gray-400">تحلیل هوشمند</p>
                        <p className="text-sm font-bold text-white mt-1">دریافت گزارش استراتژیک</p>
                    </div>
                </div>
            </div>

            {/* Course Management Table */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <AcademicCapIcon className="w-6 h-6 text-amber-400" />
                        مدیریت دوره‌ها ({filteredCourses.length})
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="جستجوی دوره..."
                                className="w-full sm:w-64 bg-gray-700 border border-gray-600 rounded-lg py-2 pl-4 pr-10 text-sm text-white focus:border-blue-500 focus:outline-none"
                            />
                            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute top-2.5 right-3" />
                        </div>
                        
                        <select 
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                        >
                            <option value="all">همه دسته‌ها</option>
                            {ACADEMY_MODULES.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm text-gray-300">
                        <thead className="bg-gray-900/50 text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">عنوان دوره</th>
                                <th className="px-6 py-3">دسته‌بندی</th>
                                <th className="px-6 py-3">مدرس</th>
                                <th className="px-6 py-3">دانشجویان</th>
                                <th className="px-6 py-3">قیمت</th>
                                <th className="px-6 py-3">وضعیت</th>
                                <th className="px-6 py-3 text-center">عملیات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredCourses.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-700/30 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                                        {course.source === 'generated' && <SparklesIcon className="w-3 h-3 text-purple-400" title="AI Generated"/>}
                                        {course.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-700 px-2 py-1 rounded text-xs border border-gray-600">
                                            {ACADEMY_MODULES.find(m => m.id === course.category)?.title || course.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{course.instructor}</td>
                                    <td className="px-6 py-4">{course.students.toLocaleString('fa-IR')}</td>
                                    <td className="px-6 py-4 text-green-400 font-mono">{course.price === 0 ? 'رایگان' : course.price.toLocaleString('fa-IR')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            course.status === 'published' ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 
                                            course.status === 'draft' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' : 
                                            'bg-red-900/30 text-red-400 border border-red-500/30'
                                        }`}>
                                            {course.status === 'published' ? 'منتشر شده' : course.status === 'draft' ? 'پیش‌نویس' : 'آرشیو'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditingCourse(course)} className="p-1.5 hover:bg-blue-900/50 rounded text-blue-400 transition-colors" title="ویرایش">
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteCourse(course)} className="p-1.5 hover:bg-red-900/50 rounded text-red-400 transition-colors" title="حذف">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredCourses.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            هیچ دوره‌ای یافت نشد.
                        </div>
                    )}
                </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-1 rounded-xl shadow-lg mt-8">
                <div className="bg-gray-900/90 p-6 rounded-lg border border-gray-700 text-center backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-gray-300 mb-2">مرکز کنترل نظرات</h3>
                    <p className="text-gray-500 text-sm mb-4">مشاهده و مدیریت تمام نظرات ثبت شده در تمام آکادمی‌ها به صورت یکجا.</p>
                    <ReviewsDashboard />
                </div>
            </div>

            <AcademyAdvisorModal 
                isOpen={isAdvisorOpen} 
                onClose={() => setIsAdvisorOpen(false)} 
                aggregateStats={stats}
                courseList={allCourses}
            />

            {editingCourse && (
                <EditCourseModal 
                    isOpen={!!editingCourse}
                    onClose={() => setEditingCourse(null)}
                    course={editingCourse}
                    onSave={handleSaveCourse}
                />
            )}
        </div>
    );
};

export default AcademiesDashboard;
