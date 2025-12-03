
import { HeritageItem } from '../types.ts';

export const heritageItems: HeritageItem[] = [
    { id: 'meaning_palm', icon: 'well', title: 'نخل معنا', description: 'نمادی از تعهد شما به یافتن و زندگی کردن بر اساس معنای شخصی‌تان.', color: 'cyan', price: 30000000, name: 'نخل معنا', points: 60000 },
    { id: 'decision', icon: 'decision', title: 'نخل تصمیم', description: 'برای ثبت یک تصمیم مهم و شروع مسیری جدید در زندگی.', color: 'purple', price: 5000000, name: 'نخل تصمیم', points: 10000 },
    { id: 'success', icon: 'success', title: 'نخل موفقیت', description: 'برای جشن گرفتن یک دستاورد بزرگ و به یادماندنی.', color: 'amber', price: 9000000, name: 'نخل موفقیت', points: 18000 },
    { id: 'memory', icon: 'memory', title: 'نخل یادبود', description: 'برای گرامی‌داشت خاطره یک عزیز از دست رفته.', color: 'stone', price: 6000000, name: 'نخل یادبود', points: 12000 },
    { id: 'birth', icon: 'birth', title: 'نخل تولد', description: 'هدیه‌ای ماندگار برای تولد یک نوزاد و آرزوی رشد و بالندگی.', color: 'pink', price: 8000000, name: 'نخل تولد', points: 16000 },
    { id: 'gratitude', icon: 'gratitude', title: 'نخل سپاس', description: 'برای قدردانی از یک فرد تاثیرگذار در زندگی‌تان.', color: 'teal', price: 6500000, name: 'نخل سپاس', points: 13000 },
    { id: 'symbolic_palm', icon: 'palm_planted', title: 'نخل نمادین', description: 'یک نخل کلی به نمایندگی از تمام معانی ارزشمند زندگی شما.', color: 'lime', price: 7000000, name: 'نخل نمادین', points: 14000 },
    { id: 'community', icon: 'community', title: 'نخل همیاری', description: 'مشارکت در پروژه‌های اجتماعی و کاشت نخل برای آبادانی.', color: 'green', price: 200000, isCommunity: true, name: 'نخل همیاری', points: 400 },
    // This is a special item, usually gifted, not for direct purchase from the heritage page.
    { id: 'beginning_palm', icon: 'gratitude', title: 'نخل آغاز', description: 'اولین قدم در این سفر معنادار.', color: 'amber', price: 0, name: 'نخل آغاز', points: 100 },
];

export const heritagePriceMap = new Map<string, number>(
    heritageItems.map(item => [item.id, item.price])
);
