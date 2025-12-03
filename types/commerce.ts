
import { Deed } from './content';
import { WebDevProject } from './education';

export type OrderStatus = 'ثبت شده' | 'در حال پردازش' | 'ارسال شده' | 'تحویل داده شده' | 'لغو شده';

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    popularity: number;
    dateAdded: string;
    stock: number;
    description: string;
    type: 'physical' | 'digital' | 'service' | 'upgrade' | 'heritage' | 'course';
    points?: number;
    tags?: string[];
    culturalSignificance?: string;
    botanicalInfo?: {
        scientificName: string;
        origin: string;
        fruitCharacteristics: string;
    };
    downloadUrl?: string;
    fileType?: string;
    unlocksFeatureId?: string;
}

export interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    stock: number;
    type: 'heritage' | 'digital' | 'service' | 'course' | 'upgrade';
    points?: number;
    bonusPoints?: number;
    item?: any;
    popularity?: number;
    dateAdded: string;
    deedDetails?: {
        name: string;
        intention: string;
        message: string;
        fromName?: string;
        groveKeeperId?: string;
    };
    webDevDetails?: WebDevProject['initialRequest'];
    coCreationDetails?: {
        packageName: string;
        siteName: string;
        style: string;
        colors: string;
        features: string[];
        tagline: string;
    };
    paymentPlan?: {
        installments: number;
    };
    fileType?: string;
}

export interface Order {
    id: string;
    userId: string;
    date: string;
    items: CartItem[];
    total: number;
    status: string;
    statusHistory: { status: string; date: string }[];
    deeds?: Deed[];
}

export interface PalmType {
    id: string;
    name: string;
    price: number;
    points: number;
    description: string;
    tags: string[];
}

export interface HeritageItem {
    id: string;
    icon: string;
    title: string;
    description: string;
    color: string;
    price: number;
    name: string;
    points: number;
    isCommunity?: boolean;
    plantingDetails?: {
        recipient: string;
        message: string;
        isAnonymous: boolean;
        pointsApplied: number;
    };
}

export interface Coupon {
    id: string;
    title: string;
    value: number;
    code: string;
}

export interface Campaign {
    id: string;
    title: string;
    description: string;
    goal: number;
    current: number;
    unit: string;
    ctaText?: string;
    rewardPoints?: number;
}

export interface MicrofinanceProject {
    id: string;
    title: string;
    borrowerName: string;
    location: string;
    description: string;
    category: 'entrepreneurship' | 'expansion';
    amountRequested: number;
    amountFunded: number;
    repaymentPeriod: number;
    riskScore?: 'low' | 'medium' | 'high';
    riskReasoning?: string;
    impact: string;
    imageUrl: string;
    status: 'funding' | 'active' | 'completed';
    backersCount: number;
    updates?: { date: string; title: string; description: string }[];
}
