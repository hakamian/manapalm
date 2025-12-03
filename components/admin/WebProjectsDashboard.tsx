
import React, { useState, useMemo } from 'react';
import { User, WebDevProject } from '../../types.ts';
import Modal from '../Modal.tsx';
import { SitemapIcon } from '../icons.tsx';

interface WebProjectsDashboardProps {
    allUsers: User[];
    onAdminUpdateUser: (userId: string, updatedData: Partial<User>) => void;
}

const ProjectDetailModal: React.FC<{ project: WebDevProject, user: User, onClose: () => void }> = ({ project, user, onClose }) => {
    return (
        <Modal isOpen={true} onClose={onClose}>
            <div className="p-4 w-full max-w-2xl text-sm">
                <h3 className="text-lg font-bold">جزئیات پروژه برای {user.name}</h3>
                <div className="mt-4 grid grid-cols-2 gap-4 bg-stone-50 dark:bg-stone-700/50 p-4 rounded-lg">
                    <p><strong>بسته:</strong> {project.packageName}</p>
                    <p><strong>وضعیت:</strong> {project.status}</p>
                    <p><strong>نام پروژه:</strong> {project.initialRequest?.projectName}</p>
                    <p><strong>تماس:</strong> {project.initialRequest?.contactInfo}</p>
                    <p><strong>لحن برند:</strong> {project.initialRequest?.brandTone}</p>
                    <p><strong>مخاطبان:</strong> {project.initialRequest?.targetAudience}</p>
                    <p className="col-span-2"><strong>صفحات:</strong> {project.initialRequest?.requiredPages.join(', ')}</p>
                    <p className="col-span-2"><strong>رنگ‌ها:</strong> {project.initialRequest?.brandColors.join(', ')}</p>
                    <p className="col-span-2"><strong>محتوای اولیه:</strong> {project.initialRequest?.pageContent || 'ارائه نشده'}</p>
                </div>
            </div>
        </Modal>
    );
};

const WebProjectsDashboard: React.FC<WebProjectsDashboardProps> = ({ allUsers, onAdminUpdateUser }) => {
    const [selectedProject, setSelectedProject] = useState<{ project: WebDevProject, user: User } | null>(null);
    
    const webProjects = useMemo(() => {
        return allUsers
            .filter(user => user.webDevProject && user.webDevProject.status !== 'none')
            .map(user => ({ user, project: user.webDevProject! }));
    }, [allUsers]);

    const handleStatusChange = (userId: string, project: WebDevProject, newStatus: WebDevProject['status']) => {
        const updatedProject = { ...project, status: newStatus };
        onAdminUpdateUser(userId, { webDevProject: updatedProject });
    };

    return (
        <div className="bg-white dark:bg-stone-800/50 p-4 rounded-2xl shadow-lg border border-stone-200/50 dark:border-stone-700/50">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <SitemapIcon className="w-6 h-6" />
                پروژه‌های «معمار میراث دیجیتال» ({webProjects.length})
            </h2>
            <div className="max-h-[70vh] overflow-y-auto">
                <table className="w-full text-sm text-right">
                    <thead className="text-xs text-stone-700 uppercase bg-stone-50 dark:bg-stone-700 dark:text-stone-400 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">نام مشتری</th>
                            <th scope="col" className="px-6 py-3">بسته</th>
                            <th scope="col" className="px-6 py-3">وضعیت</th>
                            <th scope="col" className="px-6 py-3">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {webProjects.map(({ user, project }) => (
                            <tr key={user.id} className="bg-white border-b dark:bg-stone-800 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700/50">
                                <td className="px-6 py-4 font-medium">{user.name}</td>
                                <td className="px-6 py-4">{project.packageName}</td>
                                <td className="px-6 py-4">
                                     <select 
                                        value={project.status} 
                                        onChange={(e) => handleStatusChange(user.id, project, e.target.value as WebDevProject['status'])}
                                        className="bg-transparent border-0 rounded-md p-1"
                                    >
                                        <option value="requested">درخواست شده</option>
                                        <option value="discovery_chat">گفتگوی کشف</option>
                                        <option value="generating_prototype">ساخت پیش‌نمونه</option>
                                        <option value="prototype_ready">پیش‌نمونه آماده</option>
                                        <option value="payment">در انتظار پرداخت</option>
                                        <option value="launching">در حال توسعه</option>
                                        <option value="live">فعال</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => setSelectedProject({ user, project })} className="font-medium text-amber-600 dark:text-amber-500 hover:underline">مشاهده جزئیات</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selectedProject && (
                <ProjectDetailModal 
                    user={selectedProject.user}
                    project={selectedProject.project}
                    onClose={() => setSelectedProject(null)}
                />
            )}
        </div>
    );
};

export default WebProjectsDashboard;
