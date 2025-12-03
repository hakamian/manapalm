
import React from 'react';
import { ToolCategory, CreationToolConfig } from '../../utils/aiStudioConfig';
import ToolCard from './ToolCard';
import { User } from '../../types';
import { SparklesIcon } from '../icons';

interface ToolGridProps {
    groupedTools: Record<string, CreationToolConfig[]>;
    selectedCategory: ToolCategory;
    user: User | null;
    onToolSelect: (tool: CreationToolConfig) => void;
}

const ToolGrid: React.FC<ToolGridProps> = ({ groupedTools, selectedCategory, user, onToolSelect }) => {
    
    const renderCategorySection = (categoryKey: string, tools: CreationToolConfig[]) => {
        if (tools.length === 0) return null;
        
        // Simple category title mapping
        const titles: Record<string, string> = {
            'visual': 'استودیوی بصری (تصویر و ویدیو)',
            'text': 'کارخانه متن و محتوا',
            'audio': 'استودیوی صدا',
            'strategy': 'اتاق فکر و استراتژی',
            'education': 'ابزارهای آموزشی'
        };

        return (
            <div key={categoryKey} className="mb-10 animate-fade-in">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 px-2 border-r-4 border-purple-500 mr-1">
                    {titles[categoryKey] || categoryKey}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tools.map((tool, index) => (
                        <ToolCard 
                            key={tool.id} 
                            tool={tool} 
                            user={user}
                            onClick={onToolSelect}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="pb-20">
            {selectedCategory === 'all' ? (
                Object.entries(groupedTools).map(([key, tools]) => renderCategorySection(key, tools as CreationToolConfig[]))
            ) : (
                renderCategorySection(selectedCategory, groupedTools[selectedCategory] || [])
            )}
            
            {Object.values(groupedTools).reduce<CreationToolConfig[]>((acc, val) => acc.concat(val as CreationToolConfig[]), []).length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <SparklesIcon className="w-16 h-16 mx-auto mb-4 opacity-20"/>
                    <p>ابزاری با این مشخصات یافت نشد.</p>
                </div>
            )}
        </div>
    );
};

export default ToolGrid;
