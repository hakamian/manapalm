import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '../../../utils/supabase/server';
import { Deed } from '../../../types';
import Link from 'next/link';

interface PageProps {
    params: {
        id: string;
    };
}

// 1. Fetch Data Logic (Shared for Metadata and Page)
async function getDeed(id: string): Promise<Deed | null> {
    const supabase = createServerSupabaseClient();

    // Search in orders.items (JSONB)
    // Logic: Find the order that contains an item with this specific ID.
    const { data: order, error } = await supabase
        .from('orders')
        .select('items, user_id, created_at')
        .contains('items', [{ id: id }]) // The array wrapper is crucial for @> operator
        .maybeSingle();

    if (error) {
        console.error("Error fetching deed:", error.message);
        return null;
    }

    if (!order || !order.items) return null;

    // Extract the specific item from the order's items array
    const item = (order.items as any[]).find((i: any) => i.id === id);
    if (!item) return null;

    // Map to Deed type
    return {
        id: item.id,
        productId: item.productId,
        intention: item.deedDetails?.intention || 'یادبود',
        name: item.deedDetails?.targetName || 'بی‌نام',
        date: order.created_at,
        palmType: item.name,
        message: item.deedDetails?.message,
        fromName: item.deedDetails?.fromName,
        isPlanted: true, // Assuming purchased means planted/in-process
    };
}

// 2. Generate SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const deed = await getDeed(params.id);

    if (!deed) {
        return {
            title: 'سند یافت نشد',
            description: 'این سند وجود ندارد یا حذف شده است.',
        };
    }

    const title = `سند درختکاری: ${deed.name} (${deed.intention})`;
    const description = `یک اصله نخل ${deed.palmType} به نیت ${deed.intention} برای ${deed.name} در نخلستان معنا کاشته شد.`;
    const image = `https://manapalm.com/api/og/deed?name=${encodeURIComponent(deed.name)}&type=${encodeURIComponent(deed.palmType)}`; // Future dynamic OG image

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: [image],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: [image],
        },
    };
}

// 3. Render the Page (SSR)
export default async function StoryPage({ params }: PageProps) {
    const deed = await getDeed(params.id);

    if (!deed) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#111827] text-white flex flex-col items-center justify-center p-4">
            {/* Background Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-amber-600/10 blur-[150px] rounded-full"></div>
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-green-600/10 blur-[100px] rounded-full"></div>
            </div>

            <div className="relative z-10 max-w-2xl w-full bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-amber-100 mb-2">سند رسمی نخلستان معنا</h1>
                    <p className="text-gray-400 text-sm">{new Date(deed.date).toLocaleDateString('fa-IR')}</p>
                </div>

                {/* Deed Content */}
                <div className="space-y-6 text-center">
                    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
                        <p className="text-gray-400 text-sm mb-1">این نخل کاشته شد به نیت:</p>
                        <p className="text-2xl font-bold text-amber-400">{deed.intention}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                            <p className="text-gray-400 text-xs mb-1">به نام:</p>
                            <p className="text-lg font-semibold text-white">{deed.name}</p>
                        </div>
                        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                            <p className="text-gray-400 text-xs mb-1">نوع نخل:</p>
                            <p className="text-lg font-semibold text-green-300">{deed.palmType}</p>
                        </div>
                    </div>

                    {deed.message && (
                        <div className="bg-amber-900/20 rounded-xl p-6 border border-amber-700/30 relative">
                            <span className="absolute -top-3 right-6 text-4xl text-amber-600/50">❝</span>
                            <p className="text-amber-100 italic leading-relaxed relative z-10">
                                {deed.message}
                            </p>
                            {deed.fromName && (
                                <p className="text-right text-xs text-amber-400 mt-4">— از طرف: {deed.fromName}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/shop"
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-green-900/20 text-center"
                    >
                        کاشت نخل جدید
                    </Link>
                    <Link
                        href="/"
                        className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-xl transition-all text-center"
                    >
                        بازگشت به سایت
                    </Link>
                </div>
            </div>
        </div>
    );
}
