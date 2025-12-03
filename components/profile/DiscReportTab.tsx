
import React from 'react';
import { User, View } from '../../types';
import { BrainCircuitIcon } from '../icons';
import { useAppDispatch } from '../../AppContext';

interface DiscReportTabProps {
    user: User;
    onNavigate: (view: View) => void;
}

const DiscReportTab: React.FC<DiscReportTabProps> = ({ user, onNavigate }) => {
    if (!user.discReport) {
        return (
            <div className="bg-gray-800 p-8 rounded-lg text-center">
                <BrainCircuitIcon className="w-16 h-16 mx-auto text-gray-500 mb-4"/>
                <h3 className="text-xl font-semibold">آینه رفتارشناسی شما هنوز فعال نشده است.</h3>
                <p className="text-gray-400 mt-2">با انجام آزمون DISC، سبک رفتاری خود را بشناسید و گزارش شخصی‌سازی شده دریافت کنید.</p>
                <button onClick={() => onNavigate(View.DISC_TEST)} className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md">شروع آزمون</button>
            </div>
        );
    }
    const report = user.discReport;
    return (
        <div className="bg-gray-800 p-6 sm:p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-4">گزارش آینه رفتارشناسی (DISC)</h2>
            <h3 className="text-3xl font-bold text-center mb-6 text-green-300">{report.styleName}</h3>
            <p className="text-lg text-gray-300 leading-relaxed italic text-center mb-6">"{report.analysis}"</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                <div><h4 className="text-xl font-semibold mb-3 text-green-400">نقاط قوت:</h4><ul className="list-disc list-inside space-y-2">{report.strengths.map((s,i) => <li key={i}>{s}</li>)}</ul></div>
                <div><h4 className="text-xl font-semibold mb-3 text-yellow-400">زمینه‌های رشد:</h4><ul className="list-disc list-inside space-y-2">{report.growthAreas.map((g,i) => <li key={i}>{g}</li>)}</ul></div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-700"><h4 className="text-xl font-semibold mb-3 text-blue-400">ماموریت پیشنهادی:</h4><div className="bg-gray-700/50 p-4 rounded-lg"><h5 className="font-bold">{report.suggestedMission.title}</h5><p className="text-sm text-gray-300 mt-1">{report.suggestedMission.description}</p></div></div>
        </div>
    );
};

export default DiscReportTab;
