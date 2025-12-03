
import { User, DailyChestReward } from "../types";

// ... (Existing LEVELS and POINT_ALLOCATIONS remain the same) ...

export const BARKAT_LEVELS = [
    { 
        name: 'جوانه', 
        points: 0, 
        manaThreshold: 0,
        description: "آغاز سفر: پتانسیل نهفته" 
    },
    { 
        name: 'نهال', 
        points: 2500, 
        manaThreshold: 200, 
        description: "ریشه‌دوانی: شروع مشارکت و یادگیری" 
    },
    { 
        name: 'درخت جوان', 
        points: 10000, 
        manaThreshold: 1500, 
        description: "قد کشیدن: تعهد جدی به رشد و معنا" 
    },
    { 
        name: 'درخت تنومند', 
        points: 50000, 
        manaThreshold: 8000, 
        description: "سایه‌گستری: تاثیرگذاری عمیق بر جامعه" 
    },
    { 
        name: 'استاد کهنسال', 
        points: 200000, 
        manaThreshold: 30000, 
        description: "جاودانگی: تبدیل شدن به راهنما و اسطوره" 
    },
];

export const GROWTH_LEVELS = [
    { name: 'مسافر معنا', points: 0 },
    { name: 'باغبان معنا', points: 10000 },
    { name: 'نگهبان نخلستان', points: 25000 },
    { name: 'استاد کهنسال', points: 50000 },
];

export const POINT_ALLOCATIONS = [
  {
    category: 'فعالیت‌های پایه',
    items: [
      { action: 'ثبت‌نام در سایت', points: 100, type: 'barkat', notes: 'یک بار در ابتدا' },
      { action: 'ورود روزانه به سایت', points: 10, type: 'barkat', notes: 'روزی یک بار' },
      { action: 'تکمیل اطلاعات اولیه پروفایل', points: 50, type: 'barkat', notes: 'یک بار' },
      { action: 'تکمیل اطلاعات تکمیلی پروفایل', points: 50, type: 'barkat', notes: 'یک بار' },
      { action: 'تکمیل اطلاعات شخصی', points: 100, type: 'barkat', notes: 'یک بار' },
      { action: 'تکمیل اطلاعات هویتی', points: 100, type: 'barkat', notes: 'یک بار' },
      { action: 'تکمیل تور راهنما', points: 100, type: 'barkat', notes: 'یک بار' },
    ],
  },
  {
    category: 'مشارکت در جامعه و معنا',
    items: [
      { action: 'ثبت نظر تایید شده در مقالات', points: 20, type: 'barkat' },
      { action: 'دریافت لایک برای نظر', points: 5, type: 'barkat', notes: 'به ازای هر لایک' },
      { action: 'انتشار پست در کانون جامعه', points: 100, type: 'mana' },
      { action: 'ثبت اولین یادداشت در خلوت روزانه', points: 100, type: 'barkat' },
      { action: 'ثبت یادداشت روزانه (پس از اولین بار)', points: 50, type: 'mana', notes: 'روزی یک بار' },
      { action: 'اشتراک‌گذاری عمومی سند نخل', points: 200, type: 'mana', notes: 'برای هر سند' },
      { action: 'نوشتن خاطره برای نخل', points: 250, type: 'mana' },
      { action: 'اهدای امتیاز برکت به دیگران', points: '۱۰٪ امتیاز اهدا شده', type: 'mana', notes: 'مثال: اهدای ۱۰۰۰ امتیاز برکت = ۱۰۰ امتیاز معنا' },
    ],
  },
  {
    category: 'خرید و آموزش',
    items: [
      { action: 'خرید از فروشگاه (محصولات فیزیکی)', points: '۲ به ازای هر ۱۰۰۰ تومان', type: 'barkat' },
      { action: 'کاشت نخل', points: '۵ به ازای هر ۱۰۰۰ تومان', type: 'barkat', notes: 'امتیاز ویژه (۵ برابر) برای کاشت نخل' },
      { action: 'خرید دوره آموزشی', points: '۳ به ازای هر ۱۰۰۰ تومان', type: 'barkat' },
      { action: 'به پایان رساندن یک دوره', points: 500, type: 'mana', notes: 'برای هر دوره' },
      { action: 'به پایان رساندن دوره "کوچینگ معنا"', points: 10000, type: 'mana', notes: 'جایزه ویژه' },
      { action: 'ثبت نظر و امتیاز برای یک دوره خریداری شده', points: 100, type: 'barkat' },
    ],
  },
    {
    category: 'فعالیت‌های هم‌آفرینی',
    items: [
      { action: 'معرفی کاربر جدید (که خرید کند)', points: 1000, type: 'barkat' },
      { action: 'ارائه یک دوره یا محصول برای فروش در سایت', points: 5000, type: 'barkat', notes: 'پس از تایید' },
      { action: 'تعهد امتیاز به پروژه‌های هم‌آفرینی', points: '۲۰٪ امتیاز تعهد شده', type: 'mana', notes: 'به ازای هر ۱۰۰۰ امتیاز تعهد شده ۲۰۰ امتیاز معنا' },
      { action: 'تایید کاشت نخل توسط نخلدار', points: 500, type: 'barkat', notes: 'برای هر تایید کاشت' },
      { action: 'پاداش نخلداری', points: 100, type: 'mana', notes: 'برای هر تایید کاشت' },
    ],
  },
] as const;

// ... (Existing helper functions getLevelForPoints, getGrowthLevel, getNextLevelInfo, getInstallmentOptions, canPurchaseMeaningPalm) ...
export const getLevelForPoints = (barkatPoints: number, manaPoints: number = 0) => {
    let currentLevel = BARKAT_LEVELS[0];
    for (let i = 0; i < BARKAT_LEVELS.length; i++) {
        const level = BARKAT_LEVELS[i];
        if (barkatPoints >= level.points && manaPoints >= level.manaThreshold) {
            currentLevel = level;
        } else {
            break;
        }
    }
    return currentLevel;
};

export const getGrowthLevel = (manaPoints: number) => {
    let currentGrowthLevel = GROWTH_LEVELS[0];
    for (const level of GROWTH_LEVELS) {
        if (manaPoints >= level.points) {
            currentGrowthLevel = level;
        } else {
            break;
        }
    }
    const highestLevel = GROWTH_LEVELS[GROWTH_LEVELS.length - 1];
    if (manaPoints >= highestLevel.points) {
        const pointsBeyond = manaPoints - highestLevel.points;
        const endlessLevelInterval = 25000;
        const year = Math.floor(pointsBeyond / endlessLevelInterval) + 1;
        return { ...currentGrowthLevel, name: `${currentGrowthLevel.name} (سال ${year})` };
    }
    return currentGrowthLevel;
};

export const getNextLevelInfo = (barkatPoints: number, manaPoints: number = 0) => {
    const currentLevel = getLevelForPoints(barkatPoints, manaPoints);
    const currentLevelIndex = BARKAT_LEVELS.findIndex(level => level.name === currentLevel.name);
    if (currentLevelIndex < BARKAT_LEVELS.length - 1) {
        return BARKAT_LEVELS[currentLevelIndex + 1];
    }
    return null;
};

export const getInstallmentOptions = (points: number | undefined) => {
    const userPoints = points || 0;
    const options = [
        { installments: 4, requiredPoints: 0, requiredLevel: 'جوانه' },
        { installments: 6, requiredPoints: 2500, requiredLevel: 'نهال' },
        { installments: 12, requiredPoints: 10000, requiredLevel: 'در مسیر درخت جوان' },
        { installments: 24, requiredPoints: 50000, requiredLevel: 'درخت جوان' },
    ];
    return options.map(opt => ({
        ...opt,
        isUnlocked: userPoints >= opt.requiredPoints,
        pointsNeeded: Math.max(0, opt.requiredPoints - userPoints),
    }));
};

export const canPurchaseMeaningPalm = (user: User | null): boolean => {
    if (!user) return false;
    if (user.hasUnlockedMeaningPalm) return true;
    const hasEnoughPoints = user.points >= 10000;
    const completedTests = [
        user.discReport,
        user.enneagramReport,
        user.strengthsReport,
        user.ikigaiReport,
    ].filter(Boolean).length;
    const hasCompletedTests = completedTests >= 2;
    const hasPlantedForOthers = user.timeline?.some(
        event => event.type === 'palm_planted' && 
                 event.details.name && 
                 user.fullName && 
                 event.details.name !== user.fullName
    ) || false;
    const journalEntryCount = user.timeline?.filter(
        event => event.type === 'reflection'
    ).length || 0;
    const hasEnoughEntries = journalEntryCount >= 10;
    const compassChatDuration = user.compassChatDuration || 0;
    const hasSufficientChat = compassChatDuration >= 600;
    return hasEnoughPoints && hasCompletedTests && hasPlantedForOthers && hasEnoughEntries && hasSufficientChat;
};

// --- New Feature: Daily Mystery Chest ---

export const calculateDailyChestReward = (currentStreak: number): DailyChestReward => {
    const rand = Math.random();
    const streakBonus = Math.min(currentStreak * 0.1, 2.0); // Max 2x bonus at 20 days streak

    // Probability Distribution:
    // 60% Common (Barkat Points)
    // 30% Uncommon (Mana Points)
    // 10% Epic (Special Items or High Points)

    if (rand < 0.60) {
        // Common
        const basePoints = Math.floor(Math.random() * 50) + 50; // 50-100 points
        const finalPoints = Math.floor(basePoints * (1 + streakBonus));
        return {
            type: 'barkat',
            amount: finalPoints,
            message: 'برکت امروز شما',
            bonusMultiplier: 1 + streakBonus
        };
    } else if (rand < 0.90) {
        // Uncommon
        const basePoints = Math.floor(Math.random() * 20) + 10; // 10-30 mana
        const finalPoints = Math.floor(basePoints * (1 + streakBonus));
        return {
            type: 'mana',
            amount: finalPoints,
            message: 'نور آگاهی امروز',
            bonusMultiplier: 1 + streakBonus
        };
    } else {
        // Epic
        const rewardType = Math.random() > 0.5 ? 'barkat' : 'mana';
        const basePoints = rewardType === 'barkat' ? 500 : 100;
        return {
            type: rewardType,
            amount: basePoints,
            message: 'گنجینه حماسی!',
            item: 'کارت تخفیف ویژه', // Example placeholder
            bonusMultiplier: 1 // No streak bonus on flat epic rewards usually, or keep it simple
        };
    }
};
