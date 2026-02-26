import React from 'react';
import type { Metadata } from 'next';
import ServicesAgencyView from '../../components/services/ServicesAgencyView';

export const metadata: Metadata = {
    title: 'خدمات دیجیتال و شریک استراتژیک | آژانس نخلستان معنا',
    description: 'با طراحی سایت، اپلیکیشن، و راهکارهای هوش مصنوعی توسط معماران نخلستان معنا، علاوه بر رشد کسب‌وکار خود، در پروژه ملی احیای نخلستان شریک شوید.',
    keywords: ['طراحی سایت', 'طراحی اپلیکیشن', 'هوش مصنوعی سازمانی', 'مسئولیت اجتماعی', 'خدمات وب', 'آژانس خلاقیت', 'حمایت بانوان کارآفرین', 'تسهیلات دهه هشتادی', 'زرین پال'],
    openGraph: {
        title: 'نخلستان معنا | بال پرواز دیجیتال شما',
        description: 'جایی که تکنولوژی با دغدغه‌های انسانی و محیط‌زیستی پیوند می‌خورد.',
    }
};

export default function ServicesPage() {
    return <ServicesAgencyView />;
}
