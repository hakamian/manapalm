
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CoursePersonalization } from '../types';
import { 
    TrustTriangle, 
    ValueLadder, 
    SalesFunnel, 
    LeanCanvas, 
    IcebergModel, 
    FourCornerstones, 
    ActionEngine 
} from './course-visuals/CourseDiagrams';

interface AIContentRendererProps {
    content: string;
    persona?: CoursePersonalization | null;
    onSpeak?: (text: string) => void;
}

const AIContentRenderer: React.FC<AIContentRendererProps> = ({ content, persona, onSpeak }) => {
    // Split content by visual tags
    // Regex captures the tag so it's included in the array
    const parts = content.split(/(\[VISUAL:[A-Z0-9_]+(?:.*?)\])/g);

    return (
        <div className="ai-content-renderer w-full space-y-4">
            {parts.map((part, index) => {
                // 1. Handle Action Engine
                if (part.startsWith('[VISUAL:ACTION_ENGINE')) {
                     const id = part.replace('[VISUAL:', '').replace(']', '').trim();
                     return <div key={index} className="my-2"><ActionEngine planId={id} /></div>;
                }

                // 2. Handle Static Diagrams
                if (part === '[VISUAL:TRUST_TRIANGLE]') return <TrustTriangle key={index} persona={persona} />;
                if (part === '[VISUAL:FOUR_CORNERSTONES]') return <FourCornerstones key={index} persona={persona} />;
                if (part === '[VISUAL:ICEBERG]') return <IcebergModel key={index} persona={persona} />;
                if (part === '[VISUAL:VALUE_LADDER]') return <ValueLadder key={index} persona={persona} />;
                if (part === '[VISUAL:SALES_FUNNEL]') return <SalesFunnel key={index} persona={persona} />;
                if (part === '[VISUAL:LEAN_CANVAS]') return <LeanCanvas key={index} persona={persona} />;

                // 3. Handle Markdown Text
                if (part.trim() !== '' && !part.startsWith('[VISUAL:')) {
                    return (
                        <div key={index} className="markdown-content text-sm leading-relaxed dir-auto">
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    // Enhanced Typography for Chat Bubbles with Gradients & Colors
                                    h1: ({node, ...props}) => <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 mt-5 mb-3 pb-2 border-b border-white/10" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-lg font-bold text-amber-300 mt-4 mb-2" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-base font-bold text-emerald-300 mt-3 mb-1" {...props} />,
                                    
                                    // Rich Formatting
                                    strong: ({node, ...props}) => <strong className="text-amber-400 font-extrabold" {...props} />, // Changed to Amber-400 for better visibility
                                    em: ({node, ...props}) => <em className="text-pink-300 italic" {...props} />, // Changed to Pink-300
                                    
                                    // Blockquote Styling
                                    blockquote: ({node, ...props}) => (
                                        <blockquote className="border-r-4 border-purple-500 bg-purple-900/20 p-4 rounded-r-xl italic text-purple-100 my-4 text-sm shadow-sm leading-loose" {...props} />
                                    ),
                                    
                                    // Lists
                                    ul: ({node, ...props}) => <ul className="list-disc list-inside my-3 space-y-2 pl-2 marker:text-blue-400 text-gray-200" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal list-inside my-3 space-y-2 pl-2 marker:text-amber-500 text-gray-200" {...props} />,
                                    li: ({node, ...props}) => <li className="text-gray-200" {...props} />,

                                    // Tables (Compact for chat)
                                    table: ({node, ...props}) => <div className="overflow-x-auto my-4 rounded-lg border border-white/10 shadow-lg"><table className="min-w-full divide-y divide-white/10 bg-black/40" {...props} /></div>,
                                    th: ({node, ...props}) => <th className="px-4 py-3 bg-white/10 text-right text-xs font-bold text-amber-300 uppercase tracking-wider" {...props} />,
                                    td: ({node, ...props}) => <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-300 border-t border-white/10" {...props} />,
                                    
                                    // Custom styling for paragraphs
                                    p: ({node, children, ...props}) => {
                                        return <p className="mb-3 last:mb-0 leading-7 text-gray-100" {...props}>{children}</p>;
                                    },
                                    
                                    // Code blocks for emphasis
                                    code: ({node, className, children, ...props}) => {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return !match ? (
                                          <code className="bg-gray-800 text-pink-300 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-700" {...props}>
                                            {children}
                                          </code>
                                        ) : (
                                          <pre className="bg-black/50 p-3 rounded-lg overflow-x-auto text-xs text-gray-300 border border-gray-700 my-2">
                                            <code className={className} {...props}>
                                              {children}
                                            </code>
                                          </pre>
                                        )
                                    }
                                }}
                            >
                                {part}
                            </ReactMarkdown>
                        </div>
                    );
                }
                return null;
            })}
        </div>
    );
};

export default AIContentRenderer;
