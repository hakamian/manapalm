
// FIX: Import React for creating elements in a .ts file
import React from 'react';
// FIX: Import Deed and DirectMessage types
// FIX: Import Product type to resolve error.
import { User, CommunityProject, TimelineEvent, MentorshipRequest, Conversation, CREATIVE_ACT_STORAGE_LIMIT, View, Order, Notification, CommunityEvent, CommunityPost, ProjectProposal, LiveActivity, Deed, DirectMessage, PalmType, Product, MicrofinanceProject, Review } from '../types.ts';
import { SproutIcon, BookOpenIcon, UserPlusIcon } from '../components/icons';

// Use local assets for a premium look
const MALE_AVATAR = 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1766819371/manapalm/avatars/avatar-male.jpg';
const FEMALE_AVATAR = 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1766819369/manapalm/avatars/avatar-female.jpg';

// --- MOCK DATA GENERATION ---


// FIX: Using a fixed reference date to ensure deterministic output for SSR/Hydration
export const REFERENCE_DATE_STR = '2024-05-20T12:00:00.000Z';

export const getPastDate = (daysAgo: number) => {
    const date = new Date(REFERENCE_DATE_STR);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
};

export const INITIAL_PRODUCTS: Product[] = [

    // --- GATEWAY PRODUCTS ---

    {

        id: 'p_contribution_sapling',

        name: 'سهم در نهال‌کاری (نهال امید)',

        price: 200000,

        category: 'نخل میراث',

        image: 'https://images.unsplash.com/photo-1628126235206-5260b9ea6441?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3', // Young plant, artistic light

        popularity: 98,

        dateAdded: getPastDate(1),

        stock: 9999,

        description: 'یک شروع کوچک برای تاثیری بزرگ. با خرید این محصول، شما در کاشت یک نهال جدید در نخلستان مشارکت می‌کنید و نام خود را به عنوان "حامی رویش" ثبت می‌کنید.',

        type: 'physical',

        isActive: true,

        points: 1000,

        tags: ['community', 'starter']

    },

    {

        id: 'p_digital_art_pack',

        name: 'مجموعه هنری "روح نخلستان"',

        price: 50000,

        category: 'محصولات دیجیتال',

        image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3', // Abstract palm art

        popularity: 85,

        dateAdded: getPastDate(3),

        stock: 9999,

        description: 'مجموعه‌ای از ۵ تصویر پس‌زمینه با کیفیت بالا و تم نخلستان برای موبایل و دسکتاپ. با خرید این محصول، اولین قدم را در حمایت از جنبش برمی‌دارید.',

        type: 'digital',

        isActive: false,

        points: 100,

        tags: ['art', 'digital', 'starter'],

        downloadUrl: 'https://example.com/art-pack.zip',

        fileType: 'ZIP',

    },

    // --- HIGH TICKET ---

    {

        id: 'p_heritage_meaning', name: 'نخل معنا', price: 30000000, category: 'نخل میراث',

        image: 'https://images.unsplash.com/photo-1597466599360-3b9775841aec?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3', // Majestic palm, golden hour, fantasy feel

        popularity: 100, dateAdded: getPastDate(10), stock: 10,

        description: 'کاشت نخلی برای یافتن و بزرگداشت معنای شخصی زندگی. این نخل در قلب نخلستان کاشته می‌شود و نماد تعهد شما به یک زندگی هدفمند است.',

        type: 'physical',

        points: 150000,

        tags: ['growth', 'self-discovery'],

        culturalSignificance: 'نخل در فرهنگ ایرانی نماد جاودانگی، مقاومت و بخشندگی است. کاشت «نخل معنا» یک پیمان شخصی با این ارزش‌های کهن و تعهدی برای به ثمر نشاندن معنای منحصر به فرد زندگی خویش است.',

        botanicalInfo: {

            scientificName: 'Phoenix dactylifera',

            origin: 'خاورمیانه و شمال آفریقا',

            fruitCharacteristics: 'میوه‌ای شیرین و پرانرژی، سرشار از مواد معدنی و ویتامین‌ها که به آن «نان صحرا» نیز می‌گوینند.'

        },

        isActive: true

    },

    {

        id: 'p_heritage_group',

        name: 'نخل گروهی',

        price: 15000000,

        points: 75000,

        category: 'نخل میراث',

        image: 'https://images.unsplash.com/photo-1535202677944-77732a871234?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3', // Grove of palms, community feel

        popularity: 80,

        dateAdded: getPastDate(1),

        stock: 100,

        description: 'برای یک هدف یا پروژه گروهی، با هم یک نخل بکارید و تاثیر جمعی خود را ثبت کنید.',

        type: 'physical',

        isActive: true,

        tags: ['community']

    },

    {

        id: 'p_heritage_iran',

        name: 'نخل ایران',

        price: 9000000,

        points: 45000,

        category: 'نخل میراث',

        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3', // Desert landscape, epic feel

        popularity: 95,

        dateAdded: getPastDate(5),

        stock: 50,

        description: 'برای سربلندی و آبادانی ایران، یک نخل در خاک وطن بکارید و ریشه‌های خود را در این سرزمین محکم‌تر کنید.',

        type: 'physical',

        tags: ['community', 'patriotism'],

        culturalSignificance: 'درخت نخل از دیرباز با تاریخ و تمدن ایران گره خورده و در ادبیات و هنر ما به عنوان نماد پایداری و سربلندی ستایش شده است. این نخل، ادای دینی به این میراث غنی است.',

        botanicalInfo: {

            scientificName: 'Phoenix dactylifera',

            origin: 'فلات ایران',

            fruitCharacteristics: 'ایران یکی از بزرگترین تولیدکنندگان خرما با تنوع بی‌نظیر در جهان است.'

        },

        isActive: true

    },

    {

        id: 'p_heritage_memorial',

        name: 'نخل یادبود',

        price: 8900000,

        category: 'نخل میراث',

        image: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3', // Sunset, peaceful, memory

        popularity: 92,

        dateAdded: getPastDate(15),

        stock: 50,

        description: 'زنده نگه داشتن یاد و خاطره عزیزان با هدیه کردن یک زندگی جدید به طبیعت.',

        type: 'physical',

        isActive: true,

        points: 44500,

        tags: ['legacy', 'family', 'memory']

    },

    {

        id: 'p_heritage_occasion', name: 'نخل مناسبت', price: 8800000, category: 'نخل میراث',

        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3', // Starry night, celebration

        popularity: 90, dateAdded: getPastDate(2), stock: 15,

        description: 'جشن گرفتن یک رویداد خاص مانند سالگرد ازدواج یا فارغ‌التحصیلی.',

        type: 'physical', isActive: true, points: 44000, tags: ['celebration', 'memory']

    },

    {

        id: 'p_heritage_birthday',

        name: 'نخل تولد',

        price: 8600000,

        points: 43000,

        category: 'نخل میراث',

        image: 'https://images.unsplash.com/photo-1496317556649-f930d733eea3?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3', // Sunrise, new beginning

        popularity: 93,

        dateAdded: getPastDate(7),

        stock: 30,

        description: 'کاشت یک درخت به مناسبت تولد، نمادی از رشد و زندگی.',

        type: 'physical',

        isActive: true,

        tags: ['celebration', 'family']

    },

    { id: 'p_heritage_memory', name: 'نخل خاطره', price: 8500000, points: 42500, category: 'نخل میراث', image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3', popularity: 91, dateAdded: getPastDate(18), stock: 25, description: 'ثبت یک خاطره خوش و ماندگار در دل طبیعت.', type: 'physical', isActive: true, tags: ['memory'] },

    { id: 'p_heritage_gift', name: 'نخل هدیه', price: 8500000, category: 'نخل میراث', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3', popularity: 89, dateAdded: getPastDate(40), stock: 4, description: 'یک هدیه متفاوت و ماندگار برای کسانی که دوستشان دارید.', type: 'physical', isActive: true, points: 42500, tags: ['family', 'gratitude'] },

    // --- MANAPALM ORGANIC PRODUCTS ---
    {
        id: 'mp_fig_powder',
        name: 'پودر انجیر ارگانیک ماناپالم',
        price: 1200000,
        category: 'محصولات خرما',
        image: 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1766819383/manapalm/products/fig-powder.jpg',
        popularity: 95,
        dateAdded: getPastDate(2),
        stock: 50,
        description: 'پودر انجیر ۱۰۰٪ ارگانیک ماناپالم، بدون هیچ مواد افزودنی. سرشار از فیبر، آنتی‌اکسیدان و مواد معدنی. مناسب برای صبحانه، اسموتی و دسرها.',
        type: 'physical',
        isActive: true,
        tags: ['organic', 'health'],
        points: 240
    },
    {
        id: 'mp_dates_simple',
        name: 'خرمای مضافتی ماناپالم (۵۰۰ گرم)',
        price: 300000,
        category: 'محصولات خرما',
        image: 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1766819384/manapalm/products/dates-simple.jpg',
        popularity: 92,
        dateAdded: getPastDate(3),
        stock: 100,
        description: 'خرمای مضافتی درجه یک از نخلستان‌های جنوب ایران. بسته‌بندی کرافت اکو-فرندلی با پنجره شفاف. یک انتخاب سالم و خوشمزه برای هر روز.',
        type: 'physical',
        isActive: true,
        tags: ['organic', 'gratitude'],
        points: 300
    },
    {
        id: 'mp_dates_luxury',
        name: 'باکس هدیه خرمای درباری ماناپالم',
        price: 450000,
        category: 'محصولات خرما',
        image: 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1766819385/manapalm/products/dates-luxury.jpg',
        popularity: 88,
        dateAdded: getPastDate(1),
        stock: 25,
        description: 'جعبه هدیه لاکچری خرمای درباری با بسته‌بندی مشکی مات و فویل طلایی. مناسب برای هدیه‌دادن در مناسبت‌های خاص، عید و جشن‌ها. یک هدیه به‌یادماندنی.',
        type: 'physical',
        isActive: true,
        tags: ['gift', 'luxury', 'celebration'],
        points: 900
    },
    {
        id: 'p4',
        name: 'حصیر دست‌بافت جنوبی',
        price: 220000,
        category: 'صنایع دستی',
        image: 'https://images.unsplash.com/photo-1616627561839-074385245cf6?auto=format&fit=crop&w=800&q=80',
        popularity: 70,
        dateAdded: getPastDate(60),
        stock: 0,
        description: 'هنر دست زنان جنوبی در قالب یک حصیر زیبا و کاربردی. بافته شده از برگ درخت نخل، این محصول کاملاً طبیعی و سازگار با محیط زیست بوده و گرما و اصالت را به خانه شما می‌آورد.',
        type: 'physical',
        isActive: false,
        tags: ['community', 'sustainability'],
        points: 440
    },
    {
        id: 'mp_date_syrup',
        name: 'شیره خرما ماناپالم (۵۰۰ml)',
        price: 2000000,
        category: 'محصولات خرما',
        image: 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1766819386/manapalm/products/date-syrup.jpg',
        popularity: 90,
        dateAdded: getPastDate(4),
        stock: 40,
        description: 'شیره خرمای ۱۰۰٪ طبیعی و خالص ماناپالم در بطری شیشه‌ای با درب چوبی. بدون هیچ‌گونه مواد افزودنی. یک شیرین‌کننده سالم و طبیعی جایگزین شکر.',
        type: 'physical',
        isActive: true,
        tags: ['organic', 'health'],
        points: 400
    },
    {
        id: 'p7',
        name: 'سبد حصیری پیک‌نیک',
        price: 350000,
        category: 'صنایع دستی',
        image: 'https://images.unsplash.com/photo-1615486511484-92e172cc416d?auto=format&fit=crop&w=800&q=80',
        popularity: 78,
        dateAdded: getPastDate(80),
        stock: 10,
        description: 'یک سبد جادار و زیبا برای پیک‌نیک‌ها و خریدهای روزانه. این محصول دست‌بافت، علاوه بر زیبایی، دوام بالایی دارد و یک انتخاب پایدار به جای کیسه‌های پلاستیکی است.',
        type: 'physical',
        isActive: false,
        tags: ['community', 'sustainability'],
        points: 700
    },

    // --- SERVICES & UPGRADES ---
    { id: 'upgrade_storage_100', name: 'بسته فضای ذخیره‌سازی +۱۰۰ مگابایت', price: 25000, category: 'ارتقا', image: 'https://images.unsplash.com/photo-1544396821-4dd40b938ad3?q=80&w=800&auto=format&fit=crop', popularity: 100, dateAdded: getPastDate(1), stock: 999, description: 'فضای ذخیره‌سازی خود را برای ثبت خاطرات و تصاویر بیشتر افزایش دهید. این بسته ۱۰۰ مگابایت به ظرفیت حساب شما اضافه می‌کند.', type: 'upgrade', points: 50, tags: ['growth'], isActive: false },
    { id: 'p_reflection_unlock', name: 'نخل تامل', price: 100000, category: 'ارتقا', image: 'https://images.unsplash.com/photo-1499209971185-a6188b871be9?q=80&w=800&auto=format&fit=crop', popularity: 100, dateAdded: getPastDate(1), stock: 999, description: 'با کاشت این نخل، یک بار استفاده از قابلیت «آینه هوشمند تاملات» را برای تحلیل عمیق یادداشت‌های روزانه‌تان دریافت کنید.', type: 'service', points: 200, tags: ['growth', 'self-discovery'], isActive: false },
    { id: 'p_ambassador_pack', name: 'بسته سفیر', price: 50000, category: 'ارتقا', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop', popularity: 100, dateAdded: getPastDate(1), stock: 999, description: 'قابلیت «سفیر قصه‌گو» را فعال کنید تا داستان کاشت نخل خود را با یک تصویر و متن هنری خلق شده توسط AI در شبکه‌های اجتماعی به اشتراک بگذارید.', type: 'service', points: 100, tags: ['community', 'creativity'], isActive: false },
    { id: 'p_coaching_lab_access', name: 'نخل دانش', price: 150000, category: 'ارتقا', image: 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1766819379/manapalm/services/service-coaching-lab.jpg', popularity: 90, dateAdded: getPastDate(1), stock: 999, description: 'با کاشت این نخل ویژه، به مدت یک ماه دسترسی نامحدود به «آزمایشگاه کوچینگ معنا» دریافت کنید و در کنار کمک به اهداف اجتماعی، مهارت‌های کوچینگ خود را تقویت نمایید.', type: 'service', points: 300, tags: ['growth', 'coaching', 'self-discovery'], isActive: false },
    { id: 'p_heritage_language', name: 'نخل زبان هوشمانا (آزمون تعیین سطح)', price: 75000, category: 'ارتقا', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop', popularity: 100, dateAdded: getPastDate(1), stock: 999, description: 'با کاشت این نخل، قفل آزمون تعیین سطح آکادمی زبان هوشمانا را باز کرده و در مسیر رشد زبانی و اجتماعی قدم بگذارید.', type: 'service', points: 150, tags: ['growth', 'self-discovery'], isActive: false },
    { id: 'p_mana_pack', name: 'بسته معنا (۱۰۰۰ امتیاز)', price: 49000, category: 'ارتقا', image: 'https://res.cloudinary.com/dk2x11rvs/image/upload/v1766819381/manapalm/services/service-mana-pack.jpg', popularity: 100, dateAdded: getPastDate(1), stock: 999, description: 'با خرید این بسته، ۱۰۰۰ امتیاز معنا به حساب خود اضافه کنید تا به ابزارهای هوشمند دسترسی پیدا کنید.', type: 'service', points: 0, isActive: false },
    { id: 'p_hoshmana_live_weekly', name: 'بسته هفتگی هوشمانا لایو', price: 150000, category: 'ارتقا', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop', popularity: 100, dateAdded: getPastDate(1), stock: 999, description: 'دسترسی هفتگی (۶۰ دقیقه) به تمام ابزارهای گفتگوی زنده: همراه معنا، مربی معنا و هم‌صحبت انگلیسی.', type: 'service', points: 300, tags: ['growth', 'coaching', 'self-discovery'], isActive: false },
    { id: 'p_unlock_video_gen', name: 'نخل رویا (فعال‌سازی ویدیو)', price: 350000, category: 'ارتقا', image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=800&auto=format&fit=crop', popularity: 100, dateAdded: getPastDate(0), stock: 999, description: 'با کاشت این نخل، موتور «رویاساز متحرک» را فعال کنید تا ایده‌هایتان را به ویدیوهای سینمایی تبدیل نمایید.', type: 'service', points: 700, tags: ['creativity', 'ai'], unlocksFeatureId: 'videoGen', isActive: false },
    { id: 'p_unlock_deep_chat', name: 'نخل خرد (فعال‌سازی حکیم دانا)', price: 200000, category: 'ارتقا', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop', popularity: 100, dateAdded: getPastDate(0), stock: 999, description: 'دسترسی به «حکیم دانا» برای گفتگوهای عمیق فلسفی و تحلیل‌های پیچیده.', type: 'service', points: 400, tags: ['growth', 'ai'], unlocksFeatureId: 'thinking', isActive: false },
    { id: 'p_unlock_image_edit', name: 'نخل نقش', price: 150000, category: 'ارتقا', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop', popularity: 100, dateAdded: getPastDate(0), stock: 999, description: 'ابزار ویرایش جادویی تصاویر را فعال کنید.', type: 'service', points: 300, tags: ['creativity', 'ai'], unlocksFeatureId: 'imageEdit', isActive: false },
    {
        id: 'campaign_website_service',
        name: 'طراحی سایت حرفه‌ای (طرح معنا)',
        price: 0,
        category: 'ارتقا',
        image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop',
        popularity: 100,
        dateAdded: getPastDate(0),
        stock: 9999,
        description: 'درخواست مشاوره و شروع طراحی سایت حرفه‌ای، تحویل تا آخر هفته. بخشی از کمپین کاهش زمان برای تمرکز بر معنا.',
        type: 'service',
        points: 0,
        tags: ['campaign', 'web-design'],
        isActive: false
    },

    // NEW DIGITAL PRODUCTS FOR PASSIVE INCOME
    {
        id: 'd_prompt_pack_1',
        name: '۵۰ پرامپت شفابخش (پک هوش مصنوعی)',
        price: 99000,
        category: 'محصولات دیجیتال',
        image: 'https://images.unsplash.com/photo-1620641788427-3904ae6f90f5?q=80&w=600&auto=format&fit=crop',
        popularity: 150,
        dateAdded: getPastDate(0),
        stock: 9999,
        description: 'مجموعه‌ای از ۵۰ دستور (Prompt) مهندسی شده برای چت‌بات‌های هوش مصنوعی (مانند ChatGPT) که به شما کمک می‌کنند در خودشناسی، نوشتن خاطرات عمیق و آرامش ذهن کمک می‌کنند. بلافاصله پس از خرید دانلود کنید.',
        type: 'digital',
        isActive: false,
        points: 200,
        tags: ['ai', 'self-discovery', 'digital'],
        downloadUrl: 'https://example.com/downloads/prompts-pack.txt',
        fileType: 'TXT'
    },
    {
        id: 'd_wallpaper_collection',
        name: 'مجموعه والپیپر "رویای نخلستان"',
        price: 49000,
        category: 'محصولات دیجیتال',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
        popularity: 120,
        dateAdded: getPastDate(0),
        stock: 9999,
        description: '۱۰ تصویر زمینه با کیفیت 4K برای موبایل و دسکتاپ، خلق شده توسط هوش مصنوعی با الهام از آرامش و زیبایی نخلستان‌های جنوب. فضای دیجیتال خود را با هنر معنوی تزیین کنید.',
        type: 'digital',
        isActive: false,
        points: 100,
        tags: ['art', 'digital', 'beauty'],
        downloadUrl: 'https://example.com/downloads/wallpapers.zip',
        fileType: 'ZIP'
    },
    {
        id: 'd_notion_template',
        name: 'قالب برنامه‌ریزی "سفر قهرمانی" (Notion)',
        price: 149000,
        category: 'محصولات دیجیتال',
        image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=600&auto=format&fit=crop',
        popularity: 110,
        dateAdded: getPastDate(0),
        stock: 9999,
        description: 'یک قالب آماده و حرفه‌ای برای نرم‌افزار Notion که به شما کمک می‌کنند اهداف، عادت‌ها و مسیر رشد شخصی خود را مدیریت کنید. طراحی شده بر اساس اصول کوچینگ کواکتیو.',
        type: 'digital',
        isActive: false,
        points: 300,
        tags: ['productivity', 'digital', 'planning'],
        downloadUrl: 'https://example.com/downloads/hero-journey-template.pdf', // Mock link
        fileType: 'PDF/Link'
    }
];

// ... (Rest of file unchanged)
const firstNames = ["علی", "سارا", "رضا", "مریم", "حسین", "فاطمه", "مهدی", "زهرا", "محمد", "نیلوفر", "امیر", "هستی", "کیان", "یکتا", "آریا", "باران"];
const lastNames = ["احمدی", "رضایی", "محمدی", "حسینی", "کریمی", "صادقی", "مرادی", "جعفری", "قاسمی", "عبداللهی", "نوری", "هاشمی", "اکبری", "سلیمانی"];

const heritageTypes = [
    { id: 'decision', icon: 'decision', title: 'نخل تصمیم', color: 'purple' },
    { id: 'success', icon: 'success', title: 'نخل موفقیت', color: 'amber' },
    { id: 'memory', icon: 'memory', title: 'نخل یادبود', color: 'stone' },
    { id: 'birth', icon: 'birth', title: 'نخل تولد', color: 'pink' },
    { id: 'gratitude', icon: 'gratitude', title: 'نخل سپاس', color: 'teal' },
];

const createRandomUser = (id: number, name: string, points: number, isGuardian = false, hasMentor = false): User => {
    const joinDate = new Date(new Date(REFERENCE_DATE_STR).getTime() - (id + 10) * 20 * 24 * 60 * 60 * 1000).toISOString(); // Spread join dates over ~3 years
    return {
        id: `user_gen_${id}`,
        name,
        fullName: name,
        phone: `0912${String(1000000 + id).padStart(7, '0')}`,
        joinDate,
        points,
        manaPoints: Math.floor(points / 20),
        level: 'جوانه',
        timeline: [{ id: `evt_welcome_${id}`, date: joinDate, type: 'account_created', title: 'به نخلستان معنا پیوست', description: '', details: {} }],
        achievements: [],
        profileCompletion: { initial: true, additional: id % 3 !== 0, extra: id % 2 === 0 },
        isGuardian,
        mentorId: hasMentor ? 'user_gen_2' : undefined,
        mentorName: hasMentor ? 'رضا قاسمی' : undefined,
        creativeStorageCapacity: CREATIVE_ACT_STORAGE_LIMIT,
        purchasedCourseIds: id % 4 === 0 ? ['1'] : [],
        profileImageUrl: id % 2 === 0 ? FEMALE_AVATAR : MALE_AVATAR,
        allowDirectMessages: id % 2 === 0, // Deterministic alternative to random
        contributions: [],
        notifications: [],
        following: [],
        followers: [],
        conversations: [],
        storageUsed: 0,
        storageLimit: 10 * 1024 * 1024,
        hasUnlockedCompanion: false,
        companionTrialSecondsUsed: 0,
        englishAcademyTrialSecondsUsed: 0,
        meaningCompassTrialSecondsUsed: 0,
        reflectionAnalysesRemaining: 0,
        ambassadorPacksRemaining: 0,
        values: ['growth', 'community'],
        unlockedTools: [],
        impactPortfolio: [ // Sample existing loan
            {
                projectId: 'mf_1',
                amountLent: 50000,
                dateLent: getPastDate(30),
                status: 'active'
            }
        ]
    };
};

export const INITIAL_USERS: User[] = [
    createRandomUser(1, 'علی رضایی', 850),
    createRandomUser(2, 'رضا قاسمی', 1250, true), // Guardian
    createRandomUser(3, 'سارا رضایی', 600, false, true), // Has mentor
    createRandomUser(4, 'مریم حسینی', 2100),
    createRandomUser(5, 'محمد اکبری', 4500),
    // Admin User Pre-configuration
    {
        id: 'user_admin_hh',
        name: 'H Hakamian',
        fullName: 'H Hakamian (Admin)',
        email: 'hhakamian@gmail.com',
        phone: '09120000000',
        joinDate: REFERENCE_DATE_STR,
        points: 100000,
        manaPoints: 50000,
        level: 'استاد کهنسال',
        isAdmin: true,
        isGuardian: true,
        timeline: [],
        achievements: ['profile_complete', 'guardian'],
        profileCompletion: { initial: true, additional: true, extra: true },
        creativeStorageCapacity: 1000,
        purchasedCourseIds: ['all'],
        profileImageUrl: 'https://ui-avatars.com/api/?name=H+Hakamian&background=0D8ABC&color=fff',
        allowDirectMessages: true,
        conversations: [],
        notifications: [],
        reflectionAnalysesRemaining: 100,
        ambassadorPacksRemaining: 100,
        unlockedTools: ['imageGen', 'videoGen', 'thinking', 'codeGen']
    },
    // Test User for USER
    {
        id: 'user_test_manapalm',
        name: 'کاربر تست',
        fullName: 'کاربر تست (توسعه)',
        email: 'test@manapalm.com',
        phone: '09222453571',
        joinDate: REFERENCE_DATE_STR,
        points: 5000,
        manaPoints: 2500,
        level: 'همراه',
        isAdmin: true, // Making it admin so the user can test shop changes
        isGuardian: false,
        timeline: [],
        achievements: [],
        profileCompletion: { initial: true, additional: false, extra: false },
        creativeStorageCapacity: 100,
        purchasedCourseIds: [],
        profileImageUrl: 'https://ui-avatars.com/api/?name=Test+User&background=F59E0B&color=fff',
        allowDirectMessages: true,
        conversations: [],
        notifications: [],
        reflectionAnalysesRemaining: 10,
        ambassadorPacksRemaining: 0,
        unlockedTools: ['thinking']
    }
];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [];

export const INITIAL_EVENTS: CommunityEvent[] = [];

export const INITIAL_POSTS: CommunityPost[] = [];

export const INITIAL_DEEDS: Deed[] = [];

export const INITIAL_PROPOSALS: ProjectProposal[] = [];

// NEW: Microfinance Projects
export const INITIAL_MICROFINANCE_PROJECTS: MicrofinanceProject[] = [
    {
        id: 'mf_1',
        title: 'خرید چرخ خیاطی صنعتی',
        borrowerName: 'مریم بانو',
        location: 'روستای نخل‌تقی',
        description: 'مریم سرپرست خانوار است و برای گسترش کارگاه دوزندگی کوچک خود در روستا، نیاز به یک چرخ خیاطی صنعتی دارد. با این دستگاه، او می‌تواند سفارشات بیشتری بگیرد و برای دو نفر دیگر هم شغل ایجاد کند.',
        category: 'entrepreneurship',
        amountRequested: 15000000,
        amountFunded: 8500000,
        repaymentPeriod: 12,
        riskScore: 'low',
        riskReasoning: 'سابقه خوب در بازپرداخت وام‌های قبلی صندوق محلی.',
        impact: 'ایجاد ۲ شغل پایدار و حمایت از یک خانواده',
        imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1632&auto=format&fit=crop',
        status: 'funding',
        backersCount: 34
    },
    {
        id: 'mf_2',
        title: 'توسعه سیستم آبیاری قطره‌ای فاز ۳',
        borrowerName: 'نخلستان معنا',
        location: 'منطقه دشتستان',
        description: 'برای صرفه‌جویی در مصرف آب و افزایش بهره‌وری، قصد داریم ۱۰ هکتار از نخلستان‌های جدید را به سیستم آبیاری هوشمند مجهز کنیم. این سرمایه‌گذاری مستقیماً باعث پایداری محیط زیست و کاهش ۵۰٪ مصرف آب می‌شود.',
        category: 'expansion',
        amountRequested: 120000000,
        amountFunded: 45000000,
        repaymentPeriod: 18,
        riskScore: 'low',
        riskReasoning: 'پروژه داخلی با تضمین بازگشت سرمایه از محل فروش محصول.',
        impact: 'صرفه‌جویی ۱ میلیون لیتر آب در سال',
        imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=1471&auto=format&fit=crop',
        status: 'funding',
        backersCount: 112
    },
    {
        id: 'mf_3',
        title: 'خرید بذر و کود اولیه',
        borrowerName: 'احمد کشاورز',
        location: 'برازجان',
        description: 'احمد کشاورز جوانی است که زمین پدری خود را احیا کرده است. او برای کشت پاییزه نیاز به تامین نقدینگی برای خرید بذر اصلاح شده و کود ارگانیک دارد.',
        category: 'entrepreneurship',
        amountRequested: 5000000,
        amountFunded: 5000000,
        repaymentPeriod: 6,
        riskScore: 'medium',
        riskReasoning: 'اولین وام در پلتفرم، اما دارای ضامن محلی معتبر.',
        impact: 'احیای ۲ هکتار زمین کشاورزی',
        imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1470&auto=format&fit=crop',
        status: 'active',
        backersCount: 25
    }
];

// FIX: Used React.createElement for icons as this is a .ts file, not .tsx
export const INITIAL_LIVE_ACTIVITIES: LiveActivity[] = [
    { id: 'act1', icon: React.createElement(SproutIcon, { className: "w-5 h-5 text-green-300" } as any), text: "سارا احمدی همین حالا یک نخل به یاد پدرش کاشت." },
    { id: 'act2', icon: React.createElement(BookOpenIcon, { className: "w-5 h-5 text-blue-300" } as any), text: "علی رضایی در دوره «کسب‌وکار با AI» ثبت‌نام کرد." },
    { id: 'act3', icon: React.createElement(UserPlusIcon, { className: "w-5 h-5 text-indigo-300" } as any), text: "مریم حسینی به جامعه نخلستان معنا پیوست." },
    { id: 'act4', icon: React.createElement(SproutIcon, { className: "w-5 h-5 text-green-300" } as any), text: "یک شرکت همکار ۱۰ نخل برای کارمندانش کاشت." },
    { id: 'act5', icon: React.createElement(BookOpenIcon, { className: "w-5 h-5 text-blue-300" } as any), text: "رضا قاسمی دوره «کوچینگ معنا» را به پایان رساند." },
];

export const INITIAL_MENTORSHIP_REQUESTS: MentorshipRequest[] = [
    {
        id: 'req_1',
        menteeId: 'user_gen_3',
        menteeName: 'سارا رضایی',
        menteeLevel: 2,
        mentorId: 'user_gen_1',
        status: 'pending',
    }
];

// FIX: Added missing exported member INITIAL_CONVERSATIONS
export const INITIAL_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv1',
        participantIds: ['user_gen_1', 'user_gen_3'],
        participantDetails: {
            'user_gen_1': { name: 'علی رضایی', avatar: MALE_AVATAR },
            'user_gen_3': { name: 'سارا رضایی', avatar: FEMALE_AVATAR },
        },
        messages: [
            { id: 'msg1', senderId: 'user_gen_3', text: 'سلام علی، وقت داری در مورد مسیر معنا صحبت کنیم؟', timestamp: getPastDate(1), status: 'read' },
            { id: 'msg2', senderId: 'user_gen_1', text: 'سلام سارا، حتما. چه چیزی ذهنت رو مشغول کرده؟', timestamp: getPastDate(0), status: 'delivered' },
        ],
        unreadCount: 0,
    }
];

// FIX: Added missing exported member PROVINCE_DATA
export const PROVINCE_DATA: { [key: string]: { name: string } } = {
    'khuzestan': { name: 'خوزستان' },
    'kerman': { name: 'کرمان' },
    'bushehr': { name: 'بوشهر' },
};

export const PALM_TYPES_DATA: PalmType[] = [
    { id: 'p_heritage_meaning', name: 'نخل معنا', price: 30000000, points: 150000, description: 'کاشت نخلی برای یافتن و بزرگداشت معنای شخصی زندگی.', tags: ['growth', 'self-discovery'] },
    { id: 'p_heritage_iran', name: 'نخل ایران', price: 9000000, points: 45000, description: 'برای سربلندی و آبادانی ایران، یک نخل در خاک وطن بکارید.', tags: ['community', 'patriotism'] },
    { id: 'p_heritage_memorial', name: 'نخل یادبود', price: 8900000, points: 44500, description: 'زنده نگه داشتن یاد و خاطره عزیزان با هدیه کردن یک زندگی جدید به طبیعت.', tags: ['legacy', 'family', 'memory'] },
    { id: 'p_heritage_occasion', name: 'نخل مناسبت', price: 8800000, points: 44000, description: 'جشن گرفتن یک رویداد خاص مانند سالگرد ازدواج یا فارغ‌التحصیلی.', tags: ['celebration', 'memory'] },
    { id: 'p_heritage_birthday', name: 'نخل تولد', price: 8600000, points: 43000, description: 'کاشت یک درخت به مناسبت تولد، نمادی از رشد و زندگی.', tags: ['celebration', 'family'] },
    { id: 'p_heritage_gift', name: 'نخل هدیه', price: 8500000, points: 42500, description: 'یک هدیه متفاوت و ماندگار برای کسانی که دوستشان دارید.', tags: ['family', 'gratitude'] },
    { id: 'p_heritage_campaign_100', name: 'نخل کمپین ۱۰۰ میراث', price: 8500000, points: 42500, description: 'با کاشت این نخل، در هدف جمعی ما برای کاشت ۱۰۰ نخل جدید سهیم شوید.', tags: ['community'] },
    // { id: 'p_companion_unlock', name: 'نخل آگاهی', price: 250000, points: 1250, description: 'با کاشت این نخل، قابلیت «همراه معنا» (مربی صوتی هوشمند) را برای خود فعال کنید.', tags: ['growth', 'self-discovery'] },
];

export const INITIAL_REVIEWS: Review[] = [
    {
        id: 'rev_1',
        courseId: '1', // کوچینگ معنا
        userId: 'user_gen_3',
        userName: 'سارا رضایی',
        userAvatar: FEMALE_AVATAR,
        rating: 5,
        text: 'این دوره زندگی من رو تغییر داد. دیدگاهم نسبت به شغلم کاملا عوض شد و حالا با انگیزه بیدار می‌شم.',
        date: getPastDate(5),
        helpfulCount: 12,
        isVerifiedBuyer: true
    },
    {
        id: 'rev_2',
        courseId: '1',
        userId: 'user_gen_5',
        userName: 'محمد اکبری',
        userAvatar: MALE_AVATAR,
        rating: 4,
        text: 'محتوای دوره عالیه، فقط ای کاش تمرینات عملی بیشتری داشت. ولی دکتر حکیمیان واقعا مسلط هستند.',
        date: getPastDate(12),
        helpfulCount: 4,
        isVerifiedBuyer: true
    },
    {
        id: 'rev_3',
        courseId: '2', // کارآفرینی اجتماعی
        userId: 'user_gen_1',
        userName: 'علی رضایی',
        userAvatar: MALE_AVATAR,
        rating: 5,
        text: 'اگر می‌خواید کسب‌وکاری بسازید که هم پولساز باشه و هم حالتون رو خوب کنه، این دوره رو از دست ندید.',
        date: getPastDate(20),
        helpfulCount: 28,
        isVerifiedBuyer: true
    },
    {
        id: 'rev_4',
        courseId: 'income-alchemy', // دوره جدید
        userId: 'user_gen_4',
        userName: 'مریم حسینی',
        userAvatar: FEMALE_AVATAR,
        rating: 5,
        text: 'فکر می‌کردم فروختن یعنی التماس کردن. این دوره به من یاد داد چطور ارزش خلق کنم تا مشتری خودش بیاد. فوق‌العاده بود!',
        date: getPastDate(2),
        helpfulCount: 8,
        isVerifiedBuyer: true
    },
    // --- New Reviews for Social Proof ---
    {
        id: 'rev_sc_1',
        courseId: 'service-smart-consultant',
        userId: 'user_gen_3',
        userName: 'سارا رضایی',
        userAvatar: 'https://i.pravatar.cc/150?u=user3',
        rating: 5,
        text: 'باورم نمیشد یه هوش مصنوعی بتونه اینقدر دقیق احساسات من رو درک کنه و سوالات درستی بپرسه. واقعا آروم شدم.',
        date: getPastDate(1),
        helpfulCount: 5,
        isVerifiedBuyer: true
    },
    {
        id: 'rev_bm_1',
        courseId: 'service-business-mentor',
        userId: 'user_gen_2',
        userName: 'رضا قاسمی',
        userAvatar: 'https://i.pravatar.cc/150?u=user2',
        rating: 5,
        text: 'استراتژی که برای رشد پیج اینستاگرامم داد بی‌نظیر بود. توی یک هفته فروشم ۲۰ درصد رشد کرد.',
        date: getPastDate(3),
        helpfulCount: 9,
        isVerifiedBuyer: true
    },
    {
        id: 'rev_ea_1',
        courseId: 'service-english-academy',
        userId: 'user_gen_1',
        userName: 'علی رضایی',
        userAvatar: 'https://i.pravatar.cc/150?u=user1',
        rating: 5,
        text: 'همیشه از حرف زدن می‌ترسیدم، اما این سیستم که با علایق خودم (برنامه‌نویسی) بهم زبان یاد میده، معجزه کرده.',
        date: getPastDate(10),
        helpfulCount: 15,
        isVerifiedBuyer: true
    },
    {
        id: 'rev_ba_1',
        courseId: 'service-business-academy',
        userId: 'user_gen_5',
        userName: 'محمد اکبری',
        userAvatar: 'https://i.pravatar.cc/150?u=user5',
        rating: 4,
        text: 'سیستم‌سازی کسب‌وکارم با ابزار SOP ساز خیلی راحت شد. حالا خیالم راحته که کارمندها می‌دونن باید چیکار کنن.',
        date: getPastDate(7),
        helpfulCount: 6,
        isVerifiedBuyer: true
    },
    {
        id: 'rev_mas_1',
        courseId: 'service-coaching-lab',
        userId: 'user_gen_4',
        userName: 'مریم حسینی',
        userAvatar: 'https://i.pravatar.cc/150?u=user4',
        rating: 5,
        text: 'این فضا عالیه برای تمرین! واقعاً حس می‌کنی توی یک جلسه واقعی هستی.',
        date: getPastDate(15),
        helpfulCount: 20,
        isVerifiedBuyer: true
    },
    {
        id: 'rev_dig_arch_1',
        courseId: 'service-digital-architect',
        userId: 'user_gen_2',
        userName: 'رضا قاسمی',
        userAvatar: 'https://i.pravatar.cc/150?u=user2',
        rating: 5,
        text: 'طراحی سایت فوق‌العاده بود و اینکه می‌دونم بخشی از هزینه‌ش صرف کاشت نخل شده حس خیلی خوبی بهم میده.',
        date: getPastDate(5),
        helpfulCount: 12,
        isVerifiedBuyer: true
    },
    {
        id: 'rev_book_coactive',
        courseId: 'co-active-mastery',
        userId: 'user_gen_3',
        userName: 'سارا رضایی',
        userAvatar: 'https://i.pravatar.cc/150?u=user3',
        rating: 5,
        text: 'همیشه فکر میکردم کوچینگ یعنی نصیحت کردن. این دوره دید من رو کامل عوض کرد. تمرینات عملیش عالی بود.',
        date: getPastDate(20),
        helpfulCount: 18,
        isVerifiedBuyer: true
    },
    {
        id: 'rev_book_asking',
        courseId: 'master-of-asking',
        userId: 'user_gen_5',
        userName: 'محمد اکبری',
        userAvatar: 'https://i.pravatar.cc/150?u=user5',
        rating: 5,
        text: 'قدرت سوالات باز رو اینجا فهمیدم. الان توی جلسات با کارمندام خیلی بهتر ارتباط برقرار میکنم.',
        date: getPastDate(8),
        helpfulCount: 7,
        isVerifiedBuyer: true
    }
];