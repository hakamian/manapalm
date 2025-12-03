
import React from 'react';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    children?: React.ReactNode;
    className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, children, className = '' }) => (
    <label className={`flex items-center justify-between w-full cursor-pointer ${className}`}>
        {children && <span className="text-gray-300">{children}</span>}
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
            <div className={`block w-12 h-6 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-gray-600'}`}></div>
            <div className={`dot absolute right-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
        </div>
    </label>
);

export default ToggleSwitch;
