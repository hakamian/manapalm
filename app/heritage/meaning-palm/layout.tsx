import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'نخل معنا | ۳۰ میلیون تومان | نخلستان معنا',
    description: 'نخل معنا - نخل بالغ و ثمرده با گواهی کاشت، موقعیت GPS، و محصول سالانه ۷۰-۱۰۰ کیلو خرما. میراثی ماندگار برای نسل‌ها.',
    openGraph: {
        title: 'نخل معنا | نخل بالغ با گواهی کاشت',
        description: 'نمادی از تعهد شما به یافتن و زندگی کردن بر اساس معنای شخصی‌تان. نخل بالغ ۱۰ ساله با محصول سالانه.',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=1200&auto=format&fit=crop',
                width: 1200,
                height: 630,
                alt: 'نخل معنا - نخل بالغ خرما',
            },
        ],
    },
};

export default function MeaningPalmLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
