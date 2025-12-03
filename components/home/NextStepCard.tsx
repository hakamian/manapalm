
import React from 'react';
import { User, Page, View } from '../../types';
import { UserPlusIcon, AwardIcon } from '../icons';

interface NextStepCardProps {
    user: User;
    setPage: (page: Page) => void;
}

const NextStepCard: React.FC<NextStepCardProps> = ({ user, setPage }) => {
    let mission: { icon: React.FC<any>, title: string, description: string, buttonText: string, page: Page, color: string };

    if (!user.profileCompletion.additional) {
        mission = { icon: UserPlusIcon, title: "قدم اول: تکمیل پروفایل", description: "نام خانوادگی و ایمیل خود را وارد کنید تا هویت خود را کامل کرده و ۱۰۰ امتیاز هدیه بگیرید.", buttonText: "تکمیل پروفایل", page: View.UserProfile, color: 'amber' };
    } else {
        mission = { icon: AwardIcon, title: "یک قدم تا جایزه!", description: "اطلاعات تکمیلی را وارد کنید تا پروفایل خود را حرفه‌ای‌تر کرده و ۱۵۰ امتیاز جایزه بگیرید.", buttonText: "تکمیل اطلاعات", page: View.UserProfile, color: 'amber' };
    }
    
    const { icon: Icon, title, description, buttonText, page, color } = mission;

    return (
        <div className={`p-8 rounded-2xl shadow-lg border-2 border-${color}-300/50 dark:border-${color}-700/50 bg-gradient-to-br from-white to-${color}-50 dark:from-stone-800/50 dark:to-stone-900/10`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/30`}>
                    <Icon className={`w-10 h-10 text-${color}-500 dark:text-${color}-400`} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">{title}</h3>
                    <p className="text-sm text-stone-600 dark:text-stone-400">قدم بعدی شما در این سفر</p>
                </div>
            </div>
            <p className="text-stone-600 dark:text-stone-300 mt-4 mb-6">{description}</p>
            <button onClick={() => setPage(page)} className={`bg-${color}-500 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-${color}-600 transition-colors shadow`}>
                {buttonText}
            </button>
        </div>
    );
};

export default NextStepCard;
