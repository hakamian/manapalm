
import React from 'react';
import { CommunityPost, User, MIN_POINTS_FOR_MESSAGING } from '../../types';
import { HeartIcon, EnvelopeIcon, LockClosedIcon, UserPlusIcon } from '../icons';

interface PostCardProps {
    post: CommunityPost;
    currentUser: User | null;
    onToggleFollow: (targetUserId: string) => void;
    onStartConversation: (targetUserId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onToggleFollow, onStartConversation }) => {
    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 3600;
        if (interval > 24) return new Date(date).toLocaleDateString('fa-IR');
        if (interval > 1) return Math.floor(interval) + " ساعت پیش";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " دقیقه پیش";
        return "لحظاتی پیش";
    };

    const isFollowing = currentUser?.following?.includes(post.authorId);
    const isOwnPost = currentUser?.id === post.authorId;
    const canSendMessage = currentUser && currentUser.points >= MIN_POINTS_FOR_MESSAGING;

    return (
        <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                    <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full object-cover" />
                    <div className="mr-3">
                        <p className="font-semibold text-white">{post.authorName}</p>
                        <p className="text-xs text-gray-500">{timeSince(post.timestamp)}</p>
                    </div>
                </div>
                {!isOwnPost && currentUser && (
                    <div className="flex items-center space-x-reverse space-x-2">
                         <button 
                            onClick={() => canSendMessage && onStartConversation(post.authorId)} 
                            disabled={!canSendMessage}
                            className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                            title={!canSendMessage ? `برای ارسال پیام به ${MIN_POINTS_FOR_MESSAGING} امتیاز برکت نیاز دارید` : "ارسال پیام"}
                         >
                            {canSendMessage ? <EnvelopeIcon className="w-5 h-5"/> : <LockClosedIcon className="w-5 h-5"/>}
                        </button>
                        <button onClick={() => onToggleFollow(post.authorId)} className={`text-sm py-1 px-3 rounded-full transition-colors flex items-center ${isFollowing ? 'bg-gray-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                           <UserPlusIcon className="w-4 h-4 ml-1"/> {isFollowing ? 'دنبال شده' : 'دنبال کردن'}
                        </button>
                    </div>
                )}
            </div>
            <p className="text-gray-300 whitespace-pre-wrap">{post.text}</p>
            <div className="mt-4 pt-3 border-t border-gray-700">
                <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition-colors">
                    <HeartIcon className="w-5 h-5" />
                    <span>{post.likes}</span>
                </button>
            </div>
        </div>
    );
};

export default PostCard;
