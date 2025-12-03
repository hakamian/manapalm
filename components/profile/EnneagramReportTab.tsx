
import React from 'react';
import { User, View } from '../../types';
import { CompassIcon } from '../icons';

interface EnneagramReportTabProps {
    user: User;
    onNavigate: (view: View) => void;
}

const EnneagramReportTab: React.FC<EnneagramReportTabProps> = ({ user, onNavigate }) => {
    if (!user.enneagramReport) {
        return (
            <div className="bg-gray-800 p-8 rounded-lg text-center">
                <CompassIcon className="w-16 h-16 mx-auto text-gray-500 mb-4"/>
                <h3 className="text-xl font-semibold">نقشه روان شما هنوز ترسیم نشده است.</h3>
                <p className="text-gray-400 mt-2">با انجام آزمون انیاگرام، انگیزه‌ها و ترس‌های بنیادین خود را کشف کنید.</p>
                <button onClick={() => onNavigate(View.ENNEAGRAM_TEST)} className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md">شروع آزمون</button>
            </div>
        );
    }
    const report = user.enneagramReport;
    return (
        <div className="bg-gray-800 p-6 sm:p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-4">گزارش نقشه روان (Enneagram)</h2>
            <h3 className="text-3xl font-bold text-center mb-2 text-green-300">تیپ {report.typeNumber} بال {report.wing}: {report.typeName}</h3>
            <p className="text-lg text-gray-300 leading-relaxed italic text-center mb-6">"{report.analysis}"</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 text-center">
                <div className="bg-gray-700/50 p-4 rounded-lg"><h4 className="text-xl font-semibold mb-2 text-green-400">انگیزه اصلی</h4><p>{report.coreMotivation}</p></div>
                <div className="bg-gray-700/50 p-4 rounded-lg"><h4 className="text-xl font-semibold mb-2 text-red-400">ترس بنیادین</h4><p>{report.coreFear}</p></div>
                <div className="bg-gray-700/50 p-4 rounded-lg"><h4 className="text-xl font-semibold mb-2 text-blue-400">مسیر رشد (یکپارچگی)</h4><p>{report.growthPath}</p></div>
                <div className="bg-gray-700/50 p-4 rounded-lg"><h4 className="text-xl font-semibold mb-2 text-yellow-400">مسیر استرس (فروپاشی)</h4><p>{report.stressPath}</p></div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-700"><h4 className="text-xl font-semibold mb-3 text-indigo-400">ماموریت پیشنهادی:</h4><div className="bg-gray-700/50 p-4 rounded-lg"><h5 className="font-bold">{report.suggestedMission.title}</h5><p className="text-sm text-gray-300 mt-1">{report.suggestedMission.description}</p></div></div>
        </div>
    );
};

export default EnneagramReportTab;
