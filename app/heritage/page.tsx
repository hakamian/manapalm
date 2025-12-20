import React from 'react';
import HallOfHeritageView from '../../components/HallOfHeritageView';

export const metadata = {
    title: 'تالار میراث نخلستان معنا | میراثی ماندگار بکارید',
    description: 'در تالار میراث نخلستان معنا، داستان خود را با کاشت نخلی ماندگار ثبت کنید. هر نخل نمادی از یک نیت و شروعی برای احیای زمین است.',
};

export default function HeritagePage() {
    return (
        <main className="min-h-screen">
            <HallOfHeritageView />
        </main>
    );
}
