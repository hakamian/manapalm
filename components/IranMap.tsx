import React, { useState } from 'react';
import { ProvinceData } from '../types.ts';

interface IranMapProps {
    provinceData: ProvinceData[];
}

const provincePaths: { [key: string]: string } = {
    'khuzestan': "M183.3 543.3l-12.7 8.5-7.1 23.3-15.4 3.7-25.2 31.4-12.2-1.9-4.7-14-16.1-1.4-9.8-13.5-12.4 1.4-1.9-13.5-2.6-1.9-10.7-33.8 2.6-1.9 14.2-46.7 13.5-2.8 19.3-17.7 21.9-1.4 34 23.1 19.3 2.8 1.9 12.6-3.7 20.3z",
    'kerman': "M460.4 468.9l-49.8-14.9-7.4 8.2-22.1 4.5-5.9 14.9-38.3 5.2-1.4-16.3-14.8-11.1-39-16.3-19.1 14.1-34.6 23-14.8 26-19.1-3-21.3-36.3 3.7-14.1-12.5-35.6-35.3-7.5-33.8 11.8-31.9 5.9-20.7 25-10.4 32.3 8.9 33.1-4.5 35.3-25.2 22.8-11.8 14.1 6.7 19.1 32.3 23 18.4 12.5 15.6 15.6 19.9 2.2 24.3 16.3 7.4 15.6 23 20.7 3.7 4.5 12.5 11.1-5.2 8.2-12.5 7.4-18.4 20.7-3 14.8-11.1 5.9-2.2z",
    // Add other province paths here
};

const IranMap: React.FC<IranMapProps> = ({ provinceData }) => {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ProvinceData } | null>(null);

    const dataMap = provinceData.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
    }, {} as { [key: string]: ProvinceData });

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (tooltip) {
            setTooltip({ ...tooltip, x: e.clientX, y: e.clientY });
        }
    };

    return (
        <div className="relative">
            <svg
                viewBox="0 0 750 700"
                className="w-full h-auto"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setTooltip(null)}
            >
                <g className="stroke-stone-400 dark:stroke-stone-500 stroke-2 fill-stone-200 dark:fill-stone-700/50">
                    {Object.keys(provincePaths).map(provinceId => {
                        const data = dataMap[provinceId];
                        const isActive = !!data;
                        return (
                            <path
                                key={provinceId}
                                d={provincePaths[provinceId]}
                                className={`transition-all duration-200 ${
                                    isActive 
                                        ? 'fill-green-200 dark:fill-green-900/40 hover:fill-green-300 dark:hover:fill-green-800/60 cursor-pointer' 
                                        : ''
                                }`}
                                onMouseEnter={(e) => {
                                    if (data) {
                                        setTooltip({ x: e.clientX, y: e.clientY, data });
                                    }
                                }}
                            />
                        );
                    })}
                </g>
            </svg>
            {tooltip && (
                <div
                    className="absolute bg-stone-800 text-white text-sm rounded-lg p-3 shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full transition-opacity duration-200"
                    style={{ left: tooltip.x, top: tooltip.y, marginTop: '-10px' }}
                >
                    <h4 className="font-bold text-base">{tooltip.data.name}</h4>
                    <p>{tooltip.data.palms.toLocaleString('fa-IR')} نخل کاشته شده</p>
                    <p>{tooltip.data.jobs.toLocaleString('fa-IR')} شغل ایجاد شده</p>
                </div>
            )}
        </div>
    );
};

export default IranMap;