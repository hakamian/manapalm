import React, { useMemo } from 'react';
import { CommunityProject, User, ProvinceData } from '../types.ts';
import { PROVINCE_DATA as provinceNames } from '../utils/dummyData.ts';
import IranMap from './IranMap.tsx';
import { MapIcon, LeafIcon, BuildingOfficeIcon } from './icons.tsx';

interface ImpactMapPageProps {
    allProjects: CommunityProject[];
    currentUser: User | null;
}

const ImpactMapPage: React.FC<ImpactMapPageProps> = ({ allProjects, currentUser }) => {
    
    const provinceData: ProvinceData[] = useMemo(() => {
        const dataMap: { [key: string]: { palms: number, jobs: number } } = {};

        allProjects.forEach(project => {
            if (!dataMap[project.provinceId]) {
                dataMap[project.provinceId] = { palms: 0, jobs: 0 };
            }
            dataMap[project.provinceId].palms += project.current;
            dataMap[project.provinceId].jobs += project.jobsCreated;
        });

        return Object.keys(dataMap).map(provinceId => ({
            id: provinceId,
            name: provinceNames[provinceId]?.name || provinceId,
            palms: dataMap[provinceId].palms,
            jobs: dataMap[provinceId].jobs,
        }));
    }, [allProjects]);

    const totalPalms = provinceData.reduce((sum, p) => sum + p.palms, 0);
    const totalJobs = provinceData.reduce((sum, p) => sum + p.jobs, 0);

    const userContributedProvinces = useMemo(() => {
        if (!currentUser?.contributions) return 0;
        const provinceIds = new Set(currentUser.contributions.map(c => c.provinceId));
        return provinceIds.size;
    }, [currentUser]);

    return (
        <div className="space-y-12 animate-fade-in-up">
            <section className="text-center container mx-auto px-4">
                <MapIcon className="w-20 h-20 text-amber-500 mx-auto mb-4" />
                <h1 className="text-4xl md:text-5xl font-extrabold text-amber-900 dark:text-amber-200 mb-4 leading-tight">
                    نقشه تاثیر جمعی ما
                </h1>
                <p className="text-lg md:text-xl text-stone-700 dark:text-stone-300 max-w-3xl mx-auto">
                    اینجا می‌توانید نتیجه واقعی مشارکت خود و دیگر اعضای جامعه را ببینید. هر نقطه سبز، نماد یک امید و یک فرصت جدید است.
                </p>
            </section>
            
            <section className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-stone-800/50 p-6 rounded-2xl flex items-center gap-4 border border-stone-200/50 dark:border-stone-700">
                        <LeafIcon className="w-12 h-12 text-green-500" />
                        <div>
                            <p className="text-3xl font-bold">{totalPalms.toLocaleString('fa-IR')}</p>
                            <p className="text-sm text-stone-500 dark:text-stone-400">مجموع نخل‌های کاشته شده</p>
                        </div>
                    </div>
                     <div className="bg-white dark:bg-stone-800/50 p-6 rounded-2xl flex items-center gap-4 border border-stone-200/50 dark:border-stone-700">
                        <BuildingOfficeIcon className="w-12 h-12 text-sky-500" />
                        <div>
                            <p className="text-3xl font-bold">{totalJobs.toLocaleString('fa-IR')}</p>
                            <p className="text-sm text-stone-500 dark:text-stone-400">مجموع شغل‌های ایجاد شده</p>
                        </div>
                    </div>
                </div>
                {userContributedProvinces > 0 && (
                     <p className="text-center mt-6 font-semibold text-amber-700 dark:text-amber-300">
                        شما در سرسبزی و آبادانی {userContributedProvinces.toLocaleString('fa-IR')} استان سهیم بوده‌اید. سپاسگزاریم!
                    </p>
                )}
            </section>

            <section className="container mx-auto px-4 max-w-5xl">
                <div className="bg-white dark:bg-stone-800/50 p-4 sm:p-6 rounded-2xl shadow-xl border border-stone-200/50 dark:border-stone-700">
                    <IranMap provinceData={provinceData} />
                </div>
                 <p className="text-center text-xs text-stone-500 dark:text-stone-400 mt-4">
                    ماوس را روی استان‌های هایلایت شده نگه دارید تا آمار را ببینید.
                </p>
            </section>
        </div>
    );
};

export default ImpactMapPage;