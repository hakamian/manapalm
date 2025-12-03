
import React, { useState } from 'react';
import { User } from '../../types';
import { SparklesIcon, PaperAirplaneIcon } from '../icons';
import { getAIAssistedText } from '../../services/geminiService';

interface PostCreatorProps {
    user: User;
    onPost: (text: string) => void;
}

const PostCreator: React.FC<PostCreatorProps> = ({ user, onPost }) => {
    const [postText, setPostText] = useState('');
    const [isAIAssistLoading, setIsAIAssistLoading] = useState(false);
    const MAX_CHARS = 280;

    const handleAIAssist = async (mode: 'generate' | 'improve') => {
        let promptForGeneration = '';
        if (mode === 'generate') {
            promptForGeneration = window.prompt('درباره چه موضوعی می‌خواهید پست بنویسید؟ (یک عبارت کوتاه)') || '';
            if (!promptForGeneration) return;
        }
    
        setIsAIAssistLoading(true);
        try {
            const response = await getAIAssistedText({
                mode,
                type: 'community_post',
                text: mode === 'generate' ? promptForGeneration : postText,
            });
            setPostText(response);
        } catch(e) {
            console.error(e);
        } finally {
            setIsAIAssistLoading(false);
        }
    }

    const handlePost = () => {
        if (postText.trim()) {
            onPost(postText);
            setPostText('');
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex space-x-reverse space-x-3">
            <img src={user.avatar || 'https://i.pravatar.cc/150?u=anonymous'} alt={user.fullName || 'User'} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
            <div className="flex-grow">
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="postCreator" className="text-sm text-gray-400">چه چیزی در ذهن دارید؟</label>
                     <button 
                        type="button" 
                        onClick={() => handleAIAssist(postText ? 'improve' : 'generate')} 
                        disabled={isAIAssistLoading} 
                        className="flex items-center gap-1 text-xs py-1 px-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white disabled:bg-gray-500"
                        title="کمک گرفتن از هوشمانا"
                     >
                        <SparklesIcon className="w-4 h-4"/>
                        <span>{postText ? 'بهبود با هوشمانا' : 'کمک از هوشمانا'}</span>
                     </button>
                </div>
                <textarea
                    id="postCreator"
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="داستان خود را به اشتراک بگذارید..."
                    rows={3}
                    maxLength={MAX_CHARS}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs ${postText.length > MAX_CHARS - 20 ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {postText.length} / {MAX_CHARS}
                    </span>
                    <button onClick={handlePost} disabled={!postText.trim()} className="flex items-center text-sm py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                        <PaperAirplaneIcon className="w-5 h-5 ml-2" />
                        <span>انتشار</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostCreator;
