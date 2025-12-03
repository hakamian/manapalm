
import React, { useState, useMemo } from 'react';
import { User, View, CommunityEvent, CommunityPost } from '../types';
import { CalendarDaysIcon, BadgeCheckIcon, UsersIcon, GiftIcon, MagnifyingGlassIcon, FunnelIcon, FireIcon, ClockIcon, StarIcon } from './icons';
import { useAppState, useAppDispatch } from '../AppContext';
import PostCard from './community/PostCard';
import PostCreator from './community/PostCreator';
import CommunityStats from './community/CommunityStats';

const EventCard: React.FC<{ event: CommunityEvent }> = ({ event }) => (
    <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 hover:border-green-500 transition-colors">
        <p className="text-sm text-green-400">{new Date(event.date).toLocaleDateString('fa-IR', { month: 'long', day: 'numeric' })}</p>
        <h3 className="font-bold text-white mt-1">{event.title}</h3>
        <p className="text-xs text-gray-400 mt-1">{event.location}</p>
        <p className="text-sm text-gray-300 mt-3">{event.description}</p>
        <div className="text-right mt-4">
            <button className="text-sm py-1 px-3 bg-green-600 hover:bg-green-700 rounded-md transition-colors">اعلام حضور</button>
        </div>
    </div>
);

const GiftPointsCard: React.FC = () => {
    const { user, allUsers } = useAppState();
    const dispatch = useAppDispatch();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [amount, setAmount] = useState<number>(100);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const lowercasedTerm = searchTerm.toLowerCase();
        return allUsers.filter(
            u => u.id !== user?.id &&
            (u.fullName?.toLowerCase().includes(lowercasedTerm) || u.phone.includes(lowercasedTerm))
        ).slice(0, 5);
    }, [searchTerm, allUsers, user]);

    if (!user) return null;

    const handleSelectUser = (userToSelect: User) => {
        setSelectedUser(userToSelect);
        setSearchTerm('');
        setError('');
    };

    const handleGift = () => {
        if (!selectedUser || amount <= 0) return;
        if (amount > user.points) {
            setError('امتیاز شما کافی نیست.');
            return;
        }

        dispatch({ type: 'DONATE_POINTS', payload: { recipientId: selectedUser.id, amount } });
        setSuccess(`${amount.toLocaleString('fa-IR')} امتیاز به ${selectedUser.name} هدیه داده شد!`);
        setSelectedUser(null);
        setAmount(100);
        setTimeout(() => setSuccess(''), 4000);
    };

    const handleCancel = () => {
        setSelectedUser(null);
        setAmount(100);
        setError('');
    };

    return (
        <section>
            <div className="flex items-center mb-6">
                <GiftIcon className="w-7 h-7 text-green-400" />
                <h2 className="text-2xl font-bold mr-3">تقدیر از یک همسفر</h2>
            </div>
            <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                {success && <div className="mb-4 p-3 bg-green-900/50 text-green-300 rounded-md text-center">{success}</div>}
                
                {!selectedUser ? (
                    <div className="relative">
                        <p className="text-sm text-gray-300 mb-2">با هدیه دادن امتیاز، از دیگران قدردانی کنید.</p>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="جستجوی کاربر با نام یا شماره..."
                            className="w-full bg-gray-700 p-2 rounded-md"
                        />
                        {searchResults.length > 0 && (
                            <ul className="absolute top-full right-0 w-full bg-gray-600 border border-gray-500 rounded-md mt-1 z-10 max-h-48 overflow-y-auto">
                                {searchResults.map(u => (
                                    <li key={u.id}>
                                        <button onClick={() => handleSelectUser(u)} className="w-full text-right p-2 hover:bg-gray-500 flex items-center gap-2">
                                            <img src={u.avatar || `https://i.pravatar.cc/150?u=${u.id}`} alt={u.fullName} className="w-8 h-8 rounded-full" />
                                            <span>{u.fullName}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                             <img src={selectedUser.avatar || `https://i.pravatar.cc/150?u=${selectedUser.id}`} alt={selectedUser.fullName} className="w-10 h-10 rounded-full" />
                             <div>
                                <p className="text-sm text-gray-400">هدیه به:</p>
                                <p className="font-bold">{selectedUser.fullName}</p>
                             </div>
                        </div>
                        <div>
                            <label className="text-sm">مقدار امتیاز:</label>
                             <input type="range" min="50" max={user.points} step="50" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full my-2 accent-green-500" />
                            <div className="flex items-center gap-2">
                                <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full bg-gray-700 p-2 rounded-md" />
                                <span className="text-lg font-bold">{amount.toLocaleString('fa-IR')}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">موجودی شما: {user.points.toLocaleString('fa-IR')} امتیاز</p>
                        </div>
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={handleCancel} className="text-sm py-2 px-4 bg-gray-600 rounded-md">انصراف</button>
                            <button onClick={handleGift} className="text-sm py-2 px-4 bg-green-600 rounded-md">هدیه</button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};


const CommunityHubView: React.FC = () => {
    const { user, communityEvents: events, communityPosts: posts, communityStats: stats } = useAppState();
    const dispatch = useAppDispatch();

    const [postSearch, setPostSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'popular'>('newest');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const onLoginClick = () => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: true });

    const onAddNewPost = (text: string) => {
        if (!user) return;
        const newPost: CommunityPost = {
            id: `post-${Date.now()}`,
            authorId: user.id,
            authorName: user.fullName || 'کاربر',
            authorAvatar: user.avatar || '',
            timestamp: new Date().toISOString(),
            text,
            likes: 0,
        };
        dispatch({ type: 'ADD_POST', payload: newPost });
    };

    const onToggleFollow = (targetUserId: string) => {
        if (!user) return;
        const isFollowing = user.following?.includes(targetUserId);
        const newFollowing = isFollowing
            ? user.following.filter(id => id !== targetUserId)
            : [...(user.following || []), targetUserId];
        dispatch({ type: 'UPDATE_USER', payload: { ...user, following: newFollowing } });
    };

    const onStartConversation = (targetUserId: string) => {
        dispatch({ type: 'SET_VIEW', payload: View.DIRECT_MESSAGES });
    };
    
    const filteredPosts = useMemo(() => {
        let filtered = [...posts];
        
        // Search filter
        if (postSearch) {
            const lowerSearch = postSearch.toLowerCase();
            filtered = filtered.filter(p => 
                p.text.toLowerCase().includes(lowerSearch) || 
                p.authorName.toLowerCase().includes(lowerSearch)
            );
        }
        
        // Tag filter (mock implementation, assuming hashtags in text)
        if (selectedTag) {
            filtered = filtered.filter(p => p.text.includes(selectedTag));
        }

        // Sort
        if (sortOrder === 'popular') {
            filtered.sort((a, b) => b.likes - a.likes);
        } else {
            filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
        
        return filtered;
    }, [posts, postSearch, sortOrder, selectedTag]);

    const communitySize = Math.floor(stats.totalPalmsPlanted / 1.2);
    const goal = Math.ceil(stats.totalPalmsPlanted / 1000) * 1000;
    const progress = Math.min((stats.totalPalmsPlanted / goal) * 100, 100);

    return (
        <div className="min-h-screen bg-gray-900 text-white pt-22 pb-24">
            {/* Hero Section */}
            <div className="relative pb-20 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/community-gathering/1920/1080')" }}>
                <div className="absolute inset-0 bg-black bg-opacity-75"></div>
                <div className="relative container mx-auto px-6 text-center z-10">
                    <h1 className="text-5xl font-bold mb-4">کانون نخلستان معنا</h1>
                    <p className="text-xl max-w-3xl mx-auto">
                        اینجا قلب تپنده جنبش ماست. فضایی برای هم‌افزایی، الهام‌بخشی و ساختن آینده‌ای سبزتر با هم.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-16">
                <CommunityStats communitySize={communitySize} totalPalms={stats.totalPalmsPlanted} totalPosts={posts.length + 150} />

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main Content: Wall & Goal */}
                    <main className="lg:col-span-2">
                        {/* Community Goal */}
                        <section className="mb-12 bg-gradient-to-r from-green-900/30 to-gray-800/50 p-6 rounded-lg border border-green-700/50">
                            <div className="flex items-center mb-4">
                                <BadgeCheckIcon className="w-8 h-8 text-yellow-300 ml-3" />
                                <h2 className="text-2xl font-bold">هدف جمعی: رسیدن به {goal.toLocaleString('fa-IR')} نخل</h2>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                                <div className="bg-green-500 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p className="text-sm text-gray-300">با کاشت <span className="font-bold text-white">{(goal - stats.totalPalmsPlanted).toLocaleString('fa-IR')}</span> نخل دیگر، یک دستاورد جدید برای کل جامعه باز می‌کنیم و یک رویداد ویژه برگزار خواهیم کرد!</p>
                        </section>

                        {/* Community Wall */}
                        <section>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <h2 className="text-3xl font-bold">دیوار کانون</h2>
                                
                                {/* Advanced Search & Filters */}
                                <div className="flex flex-wrap gap-3 items-center bg-gray-800 p-2 rounded-lg border border-gray-700 w-full md:w-auto">
                                    <div className="relative flex-grow">
                                        <input 
                                            type="text" 
                                            placeholder="جستجو..." 
                                            value={postSearch}
                                            onChange={(e) => setPostSearch(e.target.value)}
                                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-md px-3 py-1.5 pl-8 focus:ring-1 focus:ring-green-500 outline-none w-full"
                                        />
                                        <MagnifyingGlassIcon className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
                                    </div>
                                    
                                    <div className="flex bg-gray-700 rounded-md p-1">
                                        <button 
                                            onClick={() => setSortOrder('newest')}
                                            className={`p-1.5 rounded ${sortOrder === 'newest' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                                            title="جدیدترین"
                                        >
                                            <ClockIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => setSortOrder('popular')}
                                            className={`p-1.5 rounded ${sortOrder === 'popular' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                                            title="محبوب‌ترین"
                                        >
                                            <FireIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                             {/* New Post Area */}
                            <div className="mb-8">
                                {user ? (
                                    <PostCreator user={user} onPost={onAddNewPost} />
                                ) : (
                                    <div className="bg-gray-800 p-6 rounded-lg border-2 border-dashed border-gray-600 text-center">
                                        <h3 className="text-xl font-semibold">به گفتگو بپیوندید!</h3>
                                        <p className="text-gray-400 my-2">برای اشتراک‌گذاری داستان‌ها و افکار خود، ابتدا وارد شوید.</p>
                                        <button onClick={onLoginClick} className="mt-2 text-sm py-2 px-5 bg-green-600 hover:bg-green-700 rounded-md transition-colors">
                                            ورود / ثبت‌نام
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Posts Feed */}
                            <div className="space-y-6">
                                {filteredPosts.length > 0 ? (
                                    filteredPosts.map(post => (
                                        <PostCard 
                                            key={post.id} 
                                            post={post} 
                                            currentUser={user} 
                                            onToggleFollow={onToggleFollow} 
                                            onStartConversation={onStartConversation} 
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-gray-500 bg-gray-800/50 rounded-lg">
                                        <p>پستی با این مشخصات یافت نشد.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </main>

                    {/* Sidebar: Events & Featured */}
                    <aside className="lg:col-span-1 space-y-12">
                        {user && <GiftPointsCard />}

                        {/* Upcoming Events */}
                        <section>
                            <div className="flex items-center mb-6">
                                <CalendarDaysIcon className="w-7 h-7 text-green-400" />
                                <h2 className="text-2xl font-bold mr-3">رویدادهای پیش رو</h2>
                            </div>
                            <div className="space-y-4">
                                {events.map(event => <EventCard key={event.id} event={event} />)}
                            </div>
                        </section>
                        
                        {/* Featured Members */}
                        <section>
                             <div className="flex items-center mb-6">
                                <UsersIcon className="w-7 h-7 text-green-400" />
                                <h2 className="text-2xl font-bold mr-3">اعضای ویژه</h2>
                             </div>
                             <div className="space-y-3">
                                <p className="text-gray-500">به زودی در این بخش اعضای فعال و تاثیرگذار جامعه معرفی خواهند شد.</p>
                             </div>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default CommunityHubView;
