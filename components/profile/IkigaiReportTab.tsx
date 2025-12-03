
import React from 'react';
import { User, View } from '../../types';
import { FlagIcon } from '../icons';

interface IkigaiReportTabProps {
    user: User;
    onNavigate: (view: View) => void;
}

const IkigaiReportTab: React.FC<IkigaiReportTabProps> = ({ user, onNavigate }) => {
    if (!user.ikigaiReport) {
        return (
            <div className="bg-gray-800 p-8 rounded-lg text-center">
                <FlagIcon className="w-16 h-16 mx-auto text-gray-500 mb-4"/>
                <h3 className="text-xl font-semibold">قطب‌نمای ایکیگای شما هنوز تنظیم نشده است.</h3>
                <p className="text-gray-400 mt-2">با پاسخ به ۴ سوال کلیدی، دلیل زیستن خود را پیدا کنید.</p>
                <button onClick={() => onNavigate(View.IKIGAI_TEST)} className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md">شروع اکتشاف</button>
            </div>
        );
    }
    const report = user.ikigaiReport;
    return (
        <div className="bg-gray-800 p-6 sm:p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-4">گزارش قطب‌نمای ایکیگای</h2>
            <h3 className="text-2xl font-bold text-center mb-6 text-green-300">بیانیه ایکیگای شما:</h3>
            <p className="text-lg text-gray-200 leading-relaxed italic text-center bg-gray-700/50 p-4 rounded-lg mb-6">"{report.statement}"</p>
            <div className="mt-6 pt-6 border-t border-gray-700"><h3 className="text-xl font-semibold mb-3 text-blue-400">تحلیل:</h3><p className="text-gray-300">"{report.analysis}"</p></div>
            <div className="mt-6 pt-6 border-t border-gray-700"><h3 className="text-xl font-semibold mb-3 text-yellow-400">اقدامات عملی پیشنهادی:</h3><div className="space-y-4">
                <div className="bg-gray-700/50 p-3 rounded-lg"><h4 className="font-bold text-lg">پروژه هم‌آفرینی: {report.actionSteps.project.title}</h4><p className="text-sm text-gray-300 mt-1">{report.actionSteps.project.description}</p></div>
                <div className="bg-gray-700/50 p-3 rounded-lg"><h4 className="font-bold text-lg">دوره آموزشی: {report.actionSteps.course.title}</h4><p className="text-sm text-gray-300 mt-1">{report.actionSteps.course.description}</p></div>
                <div className="bg-gray-700/50 p-3 rounded-lg"><h4 className="font-bold text-lg">نیت کاشت نخل: {report.actionSteps.deed.intention}</h4><p className="text-sm text-gray-300 mt-1">{report.actionSteps.deed.description}</p></div>
            </div></div>
        </div>
    );
};

export default IkigaiReportTab;
