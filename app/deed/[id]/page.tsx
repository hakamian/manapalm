
import React from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { dbAdapter } from '@/services/dbAdapter';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

// Since DeedDisplay is a client component (uses Context), we need a wrapper or a partial implementation.
// However, reusing DeedDisplay requires a Provider which might not be present or populated.
// For SEO, we primarily need the server rendered content (Text, Metadata).
// Visuals can be second priority.
// Let's create a Server Side View that includes a simplified display or wraps the client component if possible.
// BUT, DeedDisplay relies on `useAppState`.
// So we will implement a "StaticDeedCard" here for SEO, and optionally hydrate DeedDisplay if we can mock the context.
// Better: Create a visually similar Server Component.

type Props = {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    const deed = await dbAdapter.getDeedById(id);

    if (!deed) {
        return {
            title: 'سند یافت نشد | نخلستان معنا',
        }
    }

    const previousImages = (await parent).openGraph?.images || [];

    return {
        title: `سند کاشت نخل ${deed.name} | نخلستان معنا`,
        description: `این نخل میراث با نیت "${deed.intention}" در نخلستان معنا کاشته شده است. گواهی جاودانگی و اثرگذاری مثبت بر زمین.`,
        openGraph: {
            title: `سند کاشت نخل: ${deed.name}`,
            description: `نیت: ${deed.intention}`,
            images: ['https://res.cloudinary.com/dk2x11rvs/image/upload/v1767202359/Oasis_Dream_s4s29f.png', ...previousImages],
        },
        other: {
            'deed:id': deed.id,
            'deed:type': deed.palmId || 'heritage',
        }
    }
}

export default async function PublicDeedPage({ params }: Props) {
    const { id } = await params;
    const deed = await dbAdapter.getDeedById(id);

    if (!deed) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-stone-900 flex flex-col items-center py-20 px-4">

            {/* Breadcrumb / Back */}
            <div className="w-full max-w-md mb-6 flex justify-between items-center text-stone-400">
                <Link href="/" className="flex items-center gap-2 hover:text-amber-500 transition-colors">
                    <ArrowRightIcon className="w-4 h-4" />
                    <span>بازگشت به خانه</span>
                </Link>
                <div className="text-xs font-mono">ID: {deed.id}</div>
            </div>

            {/* Static SEO Friendly Deed Display */}
            <article className="bg-[#fcfaf5] text-stone-800 rounded-lg shadow-2xl border-4 border-amber-600/20 w-full max-w-md overflow-hidden relative">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

                <div className="relative z-10 p-8 text-center space-y-8 min-h-[600px] flex flex-col justify-center">

                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">گواهی کاشت نخل</p>
                        <h1 className="text-3xl font-bold font-serif text-stone-900 border-b-2 border-amber-500/20 pb-4 inline-block px-4">
                            {deed.name}
                        </h1>
                    </div>

                    <div className="py-6">
                        <div className="w-24 h-24 bg-amber-100 rounded-full mx-auto flex items-center justify-center mb-4 border border-amber-200">
                            <span className="text-4xl">🌴</span>
                        </div>
                        <p className="text-lg font-medium text-stone-600">
                            این نخل با نیت
                        </p>
                        <p className="text-2xl font-bold text-amber-700 mt-2 font-serif">
                            "{deed.intention}"
                        </p>
                    </div>

                    {deed.message && (
                        <blockquote className="italic text-stone-600 bg-white/50 p-4 rounded-lg border border-stone-200 text-sm leading-relaxed">
                            "{deed.message}"
                        </blockquote>
                    )}

                    <div className="mt-auto pt-8 border-t border-stone-200 text-xs text-stone-400 flex justify-between items-center">
                        <span>{new Date(deed.date).toLocaleDateString('fa-IR')}</span>
                        <span className="bg-amber-600 text-white px-2 py-0.5 rounded text-[10px]">Verified</span>
                    </div>

                    <div className="pt-4">
                        <p className="text-[10px] text-stone-400 max-w-[200px] mx-auto opacity-70">
                            این سند به صورت دیجیتال در بلاک‌چین نخلستان معنا ثبت شده است.
                        </p>
                    </div>

                </div>
            </article>

            {/* CTA */}
            <div className="mt-12 text-center space-y-4">
                <h3 className="text-white text-xl font-bold">شما هم میراث خود را بسازید</h3>
                <p className="text-stone-400 text-sm max-w-xs mx-auto">
                    با کاشت یک نخل، نام خود یا عزیزانتان را جاودانه کنید و در آبادانی زمین سهیم شوید.
                </p>
                <Link href="/shop" className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-8 rounded-full shadow-lg shadow-amber-900/40 transition-all hover:scale-105">
                    کاشت نخل جدید
                </Link>
            </div>

        </div>
    );
}
