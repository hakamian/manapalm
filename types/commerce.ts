
import { Deed } from './content';
import { WebDevProject } from './education';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
export type ProductImpactType = 'tree' | 'hour' | 'meal' | 'unit';

export interface ImpactCategory {
    id: string;
    name: string;
    description?: string;
    icon?: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    image: string; // mapped to image_url in DB
    category: 'physical' | 'digital' | 'donation' | 'service' | 'heritage' | 'نخل میراث' | 'محصولات دیجیتال' | 'محصولات خرما' | 'صنایع دستی' | 'ارتقا';

    // Impact fields
    impactCategoryId?: string;
    impactValue?: number;
    impactUnit?: ProductImpactType;

    stock: number;
    isActive: boolean;
    popularity: number; // calculated
    dateAdded: string;

    // Legacy/Frontend fields (keep optional for compat)
    type?: 'physical' | 'digital' | 'service' | 'upgrade' | 'heritage' | 'course';
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
    allowedPaymentPlanIds?: string[];
}

export interface CartItem extends Product {
    quantity: number;
    // Keep legacy cart/customization fields
    deedDetails?: any;
    webDevDetails?: any;
    coCreationDetails?: any;
    paymentPlan?: any; // To be deprecated or mapped to PaymentPlan
}

export interface Order {
    id: string;
    userId: string;
    status: OrderStatus;
    type?: 'standard' | 'installment' | 'crowdfund';
    paymentPlanId?: string;
    totalAmount: number;
    paymentRef?: string;
    createdAt: string;
    items: CartItem[]; // joined view
    statusHistory?: { status: OrderStatus; date: string }[];

    // Legacy mapping (now required for backward compat)
    total: number;
    date?: string; // map to createdAt
    deeds?: Deed[];
}

export interface UserImpactLog {
    id: string;
    userId: string;
    sourceType: 'order' | 'course_completion' | 'daily_quest' | 'direct_action';
    sourceId?: string;
    impactCategoryId?: string;
    impactAmount: number;
    description?: string;
    createdAt: string;
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

export interface PaymentPlan {
    id: string;
    title: string;
    months: number;
    interestRate: number;
    minUserLevel: string;
    isActive: boolean;
}

export interface Crowdfund {
    id: string;
    creatorId: string;
    productId: string;
    targetAmount: number;
    collectedAmount: number;
    expiryDate: string;
    status: 'active' | 'completed' | 'expired';
    contributors?: CrowdfundContributor[];
}

export interface CrowdfundContributor {
    id: string;
    crowdfundId: string;
    contributorName: string;
    amount: number;
    message?: string;
    createdAt: string;
}
