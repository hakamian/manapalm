
import React, { useState } from 'react';
import { User } from '../../types';
import { WhatsAppIcon, TelegramIcon, XIcon, EnvelopeIcon } from '../icons';

interface ReferralTabProps {
    user: User;
}

const ReferralTab: React.FC<ReferralTabProps> = ({ user }) => {
    const [referralCopySuccess, setReferralCopySuccess] = useState('');
    const referralLink = `https://nakhlestanmana.com/ref/${user.id}`;
    const referredUsersCount = Math.floor((user.referralPointsEarned || 0) / 500);

    const handleCopyReferral = () => {
        navigator.clipboard.writeText(referralLink).then(() => {
            setReferralCopySuccess('لینک با موفقیت کپی شد!');
            setTimeout(() => setReferralCopySuccess(''), 2000);
        });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">معرفی دوستان</h2>
            <div className="bg-gray-800 p-8 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">دوستان خود را به نخلستان معنا دعوت کنید!</h3>
                    <p className="text-gray-300">با هر دوستی که از طریق لینک شما ثبت‌نام کرده و اولین خرید خود را انجام دهد، <strong className="text-yellow-300">۵۰۰ امتیاز برکت</strong> به شما هدیه داده می‌شود.</p>
                    <div className="flex items-center gap-2">
                        <div className="p-3 bg-gray-700 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-300">{(user.referralPointsEarned || 0).toLocaleString('fa-IR')}</p>
                            <p className="text-xs text-gray-400">امتیاز کسب شده</p>
                        </div>
                        <div className="p-3 bg-gray-700 rounded-lg">
                            <p className="text-2xl font-bold text-green-300">{referredUsersCount}</p>
                            <p className="text-xs text-gray-400">معرفی موفق</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-700/50 p-6 rounded-lg">
                    <label className="block text-sm font-medium text-gray-300 mb-2">لینک دعوت اختصاصی شما:</label>
                    <div className="flex items-center gap-2">
                        <input type="text" readOnly value={referralLink} className="w-full bg-gray-600 border border-gray-500 rounded-md p-2 text-sm dir-ltr" />
                        <button onClick={handleCopyReferral} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md text-sm whitespace-nowrap">
                            {referralCopySuccess ? 'کپی شد!' : 'کپی'}
                        </button>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent('به نخلستان معنا بپیوند: ' + referralLink)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-600 rounded-full hover:bg-green-600"><WhatsAppIcon /></a>
                        <a href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('به نخلستان معنا بپیوند')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-600 rounded-full hover:bg-blue-500"><TelegramIcon /></a>
                        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('به نخلستان معنا بپیوند')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-600 rounded-full hover:bg-gray-400"><XIcon /></a>
                        <a href={`mailto:?subject=دعوت به نخلستان معنا&body=${encodeURIComponent('از طریق این لینک به نخلستان معنا بپیوند: ' + referralLink)}`} className="p-2 bg-gray-600 rounded-full hover:bg-red-500"><EnvelopeIcon /></a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferralTab;
