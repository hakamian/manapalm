
import React, { useState, useMemo } from 'react';
import { User, Order, PointLog } from '../../types';
import GrantPointsModal from '../GrantPointsModal';
import PotentialScoreGauge from '../PotentialScoreGauge';
import { timeAgo } from '../../utils/time';
import Modal from '../Modal';
import { 
    UserCircleIcon, ShoppingCartIcon, AcademicCapIcon, ClockIcon, 
    EnvelopeIcon, ShieldExclamationIcon, CheckCircleIcon, XMarkIcon 
} from '../icons';
import { useAppState } from '../../AppContext';

interface UserManagementProps {
    allUsers: User[];
    onAdminUpdateUser: (userId: string, updatedData: Partial<User>) => void;
    onAdminGrantPoints: (userId: string, points: number, reason: string) => void;
}

// --- 360 DEGREE PROFILE MODAL ---
const UserDetailModal: React.FC<{ user: User; orders: Order[]; onClose: () => void }> = ({ user, orders, onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'purchases' | 'courses' | 'logs'>('overview');

    // Calculate Course Progress
    const courseProgress = useMemo(() => {
        const progress = user.englishAcademyProgress || {};
        const totalLessons = 20; // Mock total
        const completed = Object.values(progress).filter(Boolean).length;
        return Math.round((completed / totalLessons) * 100);
    }, [user]);

    const userOrders = orders.filter(o => o.userId === user.id);
    const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);

    return (
        <Modal isOpen={true} onClose={onClose}>
            <div className="w-[90vw] max-w-4xl bg-stone-900 text-white rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 bg-gray-800 border-b border-gray-700 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <img src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} className="w-16 h-16 rounded-full border-2 border-amber-500" />
                        <div>
                            <h2 className="text-2xl font-bold text-white">{user.fullName}</h2>
                            <div className="flex gap-2 mt-1">
                                <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded border border-blue-500/30">{user.level}</span>
                                {user.isGuardian && <span className="text-xs bg-amber-900/50 text-amber-300 px-2 py-1 rounded border border-amber-500/30">نگهبان</span>}
                                {user.isGroveKeeper && <span className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded border border-green-500/30">نخل‌دار</span>}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700 bg-gray-800/50">
                    <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 text-sm font-bold ${activeTab === 'overview' ? 'text-white border-b-2 border-amber-500' : 'text-gray-400'}`}>نمای کلی</button>
                    <button onClick={() => setActiveTab('purchases')} className={`px-6 py-3 text-sm font-bold ${activeTab === 'purchases' ? 'text-white border-b-2 border-amber-500' : 'text-gray-400'}`}>سوابق خرید</button>
                    <button onClick={() => setActiveTab('courses')} className={`px-6 py-3 text-sm font-bold ${activeTab === 'courses' ? 'text-white border-b-2 border-amber-500' : 'text-gray-400'}`}>آموزش</button>
                    <button onClick={() => setActiveTab('logs')} className={`px-6 py-3 text-sm font-bold ${activeTab === 'logs' ? 'text-white border-b-2 border-amber-500' : 'text-gray-400'}`}>لاگ فعالیت</button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                <h3 className="font-bold text-gray-300 mb-4 border-b border-gray-600 pb-2">اطلاعات هویتی (KYC)</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">شماره تماس:</span> <span>{user.phone}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">ایمیل:</span> <span>{user.email || '-'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">کد ملی:</span> <span>{user.nationalId || 'ثبت نشده'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">تاریخ عضویت:</span> <span>{new Date(user.joinDate).toLocaleDateString('fa-IR')}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">آخرین ورود:</span> <span className="text-green-400">آنلاین (همین الان)</span></div>
                                </div>
                            </div>
                             <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                <h3 className="font-bold text-gray-300 mb-4 border-b border-gray-600 pb-2">خلاصه وضعیت</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">ارزش طول عمر (CLV):</span> <span className="text-green-400 font-bold">{totalSpent.toLocaleString('fa-IR')} تومان</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">تعداد سفارش:</span> <span>{userOrders.length}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">امتیاز کل:</span> <span className="text-amber-400">{user.points.toLocaleString('fa-IR')}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">تعداد نخل کاشته شده:</span> <span>{user.timeline?.filter(e => e.type === 'palm_planted').length || 0}</span></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'purchases' && (
                         <div className="space-y-4">
                            {userOrders.length > 0 ? userOrders.map(order => (
                                <div key={order.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-white">سفارش #{order.id.slice(-6)}</p>
                                        <p className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString('fa-IR')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-400">{order.total.toLocaleString('fa-IR')} تومان</p>
                                        <span className="text-xs bg-gray-700 px-2 py-1 rounded">{order.status}</span>
                                    </div>
                                </div>
                            )) : <p className="text-center text-gray-500">هیچ سفارشی یافت نشد.</p>}
                         </div>
                    )}

                    {activeTab === 'courses' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                <div className="flex justify-between mb-2">
                                    <h4 className="font-bold">آکادمی زبان انگلیسی</h4>
                                    <span className="text-sm text-blue-400">{courseProgress}% تکمیل</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${courseProgress}%` }}></div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">سطح فعلی: {user.languageConfig?.level || 'تعیین نشده'}</p>
                            </div>
                            {/* Add other courses similarly */}
                        </div>
                    )}

                    {activeTab === 'logs' && (
                        <div className="space-y-2 text-sm">
                            {user.timeline?.slice(0, 20).map((event, idx) => (
                                <div key={idx} className="flex gap-3 items-start p-3 hover:bg-gray-800 rounded-lg">
                                    <div className="min-w-[80px] text-gray-500 text-xs">{new Date(event.date).toLocaleDateString('fa-IR')}</div>
                                    <div>
                                        <p className="text-white font-semibold">{event.title}</p>
                                        <p className="text-gray-400 text-xs">{event.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-end gap-3">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm">
                        <EnvelopeIcon className="w-4 h-4" /> ارسال پیام
                    </button>
                    <button className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/50 rounded-lg flex items-center gap-2 text-sm">
                        <ShieldExclamationIcon className="w-4 h-4" /> مسدودسازی
                    </button>
                </div>
            </div>
        </Modal>
    );
};


const UserManagement: React.FC<UserManagementProps> = ({ allUsers, onAdminUpdateUser, onAdminGrantPoints }) => {
    const { orders } = useAppState();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const usersWithPotential = useMemo(() => {
        return allUsers.map(user => {
            const pointsScore = Math.min(user.points / 5000, 1) * 40;
            const activityCount = user.timeline?.length || 0;
            const activityScore = Math.min(activityCount / 20, 1) * 30;
            const lastEventDate = user.timeline && user.timeline.length > 0
                ? new Date(Math.max(...user.timeline.map(e => new Date(e.date).getTime())))
                : new Date(user.joinDate);
            const daysSinceLastActivity = (new Date().getTime() - lastEventDate.getTime()) / (1000 * 3600 * 24);
            const recencyScore = Math.max(0, 30 - daysSinceLastActivity);
            const potential = Math.round(pointsScore + activityScore + recencyScore);

            let rationale = '';
            if (potential > 75) rationale = 'پتانسیل بالا: کاربر بسیار فعال و در مسیر طلایی است.';
            else if (potential > 40) rationale = 'نیاز به توجه: فعالیت خوبی دارد اما اخیراً کمی غیرفعال شده است.';
            else rationale = 'ریسک بالا: کاربر برای مدتی غیرفعال بوده است.';
            
            return { ...user, potential, rationale };
        }).filter(u => u.fullName?.includes(searchTerm) || u.phone.includes(searchTerm));
    }, [allUsers, searchTerm]);

    return (
        <div className="bg-white dark:bg-stone-800/50 p-4 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">مدیریت کاربران ({allUsers.length})</h2>
                <input 
                    type="text" 
                    placeholder="جستجو..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm border border-gray-600 focus:border-amber-500 outline-none"
                />
            </div>
            
            <div className="max-h-[70vh] overflow-y-auto">
                <table className="w-full text-sm text-right">
                    <thead className="text-xs text-stone-700 uppercase bg-stone-50 dark:bg-stone-700 dark:text-stone-400 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">نام</th>
                            <th scope="col" className="px-6 py-3">امتیاز</th>
                            <th scope="col" className="px-6 py-3 text-center">پتانسیل</th>
                            <th scope="col" className="px-6 py-3">آخرین فعالیت</th>
                            <th scope="col" className="px-6 py-3">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersWithPotential.map(user => {
                            const lastEvent = user.timeline && user.timeline.length > 1 ? user.timeline.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
                            return (
                                <tr key={user.id} className="bg-white border-b dark:bg-stone-800 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700/50 cursor-pointer" onClick={() => setSelectedUser(user)}>
                                    <td className="px-6 py-4 font-medium text-stone-900 whitespace-nowrap dark:text-white flex items-center gap-2">
                                        <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-8 h-8 rounded-full" alt="" />
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4">{user.points.toLocaleString('fa-IR')}</td>
                                    <td className="px-6 py-4">
                                        <PotentialScoreGauge score={user.potential} rationale={user.rationale} />
                                    </td>
                                    <td className="px-6 py-4 text-stone-500 dark:text-stone-400">{lastEvent ? timeAgo(lastEvent.date) : timeAgo(user.joinDate)}</td>
                                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                        <button 
                                            onClick={() => { setSelectedUser(user); setIsGrantModalOpen(true); }} 
                                            className="font-medium text-amber-600 dark:text-amber-500 hover:underline mr-2"
                                        >
                                            امتیاز
                                        </button>
                                        <button onClick={() => setSelectedUser(user)} className="font-medium text-blue-500 hover:underline">
                                            پروفایل ۳۶۰
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {selectedUser && !isGrantModalOpen && (
                <UserDetailModal user={selectedUser} orders={orders} onClose={() => setSelectedUser(null)} />
            )}

            <GrantPointsModal 
                isOpen={isGrantModalOpen}
                onClose={() => { setIsGrantModalOpen(false); setSelectedUser(null); }}
                user={selectedUser}
                onGrant={onAdminGrantPoints}
            />
        </div>
    );
};

export default UserManagement;
