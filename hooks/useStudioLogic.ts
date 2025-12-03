
import { useState, useMemo } from 'react';
import { CREATION_TOOLS, CreationToolConfig, ToolCategory } from '../utils/aiStudioConfig';
import { User } from '../types';

export const useStudioLogic = (user: User | null, searchQuery: string) => {
    const [activeToolId, setActiveToolId] = useState<string | null>(null);
    const [demoTool, setDemoTool] = useState<CreationToolConfig | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    const filteredTools = useMemo(() => {
        return CREATION_TOOLS.filter(tool => 
            tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            tool.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const groupedTools = useMemo(() => {
        const groups: Record<string, CreationToolConfig[]> = {};
        filteredTools.forEach(tool => {
            if (!groups[tool.category]) groups[tool.category] = [];
            groups[tool.category].push(tool);
        });
        return groups;
    }, [filteredTools]);

    const handleToolSelect = (tool: CreationToolConfig) => {
        // NOTE: ToolCard calculates the dynamic cost and passes it back in the tool object.
        // However, if we select from elsewhere, we rely on the passed object having the updated cost,
        // or we need to recalculate it here. Since ToolCard does it, 'tool' usually has the right unlockCost if clicked there.
        // If clicked from search or sidebar, we might need context.
        // For now, assuming ToolCard flow is primary.

        if (!user) {
            setDemoTool(tool);
            return;
        }
        setActiveToolId(tool.id);
    };

    return {
        activeToolId,
        setActiveToolId,
        demoTool,
        setDemoTool,
        isSidebarOpen,
        setIsSidebarOpen,
        groupedTools,
        handleToolSelect
    };
};
