
import React from 'react';
import { User, View } from '../../types';
import { TrophyIcon } from '../icons';

interface StrengthsReportTabProps {
    user: User;
    onNavigate: (view: View) => void;
}

const StrengthsReportTab: React.FC<StrengthsReportTabProps> = ({ user, onNavigate }) => {
    if (!user.strengthsReport) {
        return (
            <div className="bg-gray-800 p-8 rounded-lg text-center">
                <TrophyIcon className="w-16 h-16 mx-auto text-gray-500 mb-4"/>
                <h3 className="text-xl font-semibold">چشمه استعدادهای شما هنوز کشف نشده است.</h3>
                <p className="text-gray-400 mt-2">با انجام آزمون، ۵ استعداد برتر خود را بشناسید.</p>
                <button onClick={() => onNavigate(View.STRENGTHS_TEST)} className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md">شروع آزمون</button>
            </div>
        );
    }
    const report = user.strengthsReport;
    return (
        <div className="bg-gray-800 p-6 sm:p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-4">گزارش چشمه استعدادها</h2>
            <h3 className="text-xl font-semibold mb-4 text-green-300">۵ استعداد برتر شما:</h3>
            <div className="space-y-4">
                {report.topStrengths.map((s, i) => <div key={i} className="bg-gray-700/50 p-3 rounded-lg"><h4 className="font-bold text-lg">{s.name}</h4><p className="text-sm text-gray-300 mt-1">{s.description}</p></div>)}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-700"><h3 className="text-xl font-semibold mb-3 text-blue-400">روایت استعداد شما:</h3><p className="italic text-gray-300">"{report.narrative}"</p></div>
            <div className="mt-6 pt-6 border-t border-gray-700"><h3 className="text-xl font-semibold mb-3 text-yellow-400">نقشه راه شما:</h3><p className="text-gray-300 whitespace-pre-wrap">{report.roadmap}</p></div>
        </div>
    );
};

export default StrengthsReportTab;
