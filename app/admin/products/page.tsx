'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/AppContext';
import DataTable from '@/components/admin-v2/ui/DataTable';
import {
    CubeIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';

export default function ProductsPage() {
    const { products = [] } = useAppState();
    const router = useRouter();

    const columns = [
        {
            key: 'image_url',
            title: 'تصویر',
            className: 'w-16',
            render: (value: string, product: any) => (
                <div className="w-12 h-12 bg-stone-800 rounded-lg overflow-hidden flex items-center justify-center">
                    {value || product.imageUrl ? (
                        <img src={value || product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                        <CubeIcon className="w-6 h-6 text-stone-600" />
                    )}
                </div>
            ),
        },
        {
            key: 'name',
            title: 'نام محصول',
            sortable: true,
            render: (value: string) => <span className="font-medium text-white">{value}</span>,
        },
        {
            key: 'category',
            title: 'دسته‌بندی',
            sortable: true,
            render: (value: string) => (
                <span className="text-xs px-2 py-1 bg-white/5 rounded-lg text-stone-400">
                    {value || 'بدون دسته'}
                </span>
            ),
        },
        {
            key: 'price',
            title: 'قیمت',
            sortable: true,
            render: (value: number) => (
                <span className="font-medium">{(value || 0).toLocaleString('fa-IR')} تومان</span>
            ),
        },
        {
            key: 'stock',
            title: 'موجودی',
            sortable: true,
            render: (value: number) => {
                const stock = value ?? 0;
                return (
                    <span className={`font-medium ${stock > 10 ? 'text-emerald-500' : stock > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                        {stock > 0 ? stock : 'ناموجود'}
                    </span>
                );
            },
        },
        {
            key: 'is_active',
            title: 'وضعیت',
            render: (value: boolean, product: any) => {
                const isActive = value ?? product.isActive ?? true;
                return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${isActive ? 'text-emerald-500 bg-emerald-500/10' : 'text-stone-500 bg-stone-500/10'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-stone-500'}`}></span>
                        {isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                );
            },
        },
        {
            key: 'actions',
            title: 'عملیات',
            render: (_: any, product: any) => (
                <div className="flex items-center gap-2">
                    <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <PencilIcon className="w-4 h-4" />
                    </Link>
                </div>
            ),
        },
    ];

    // Stats
    const activeProducts = products.filter(p => p.isActive !== false).length;
    const outOfStock = products.filter(p => (p.stock ?? 0) === 0).length;
    const categories = [...new Set(products.map(p => p.category))].length;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">مدیریت محصولات</h1>
                    <p className="text-stone-500 text-sm mt-1">افزودن، ویرایش و مدیریت محصولات فروشگاه</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    افزودن محصول
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-stone-500 text-xs">کل محصولات</p>
                    <p className="text-xl font-bold text-white mt-1">{products.length}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-emerald-500 text-xs">فعال</p>
                    <p className="text-xl font-bold text-emerald-400 mt-1">{activeProducts}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-500 text-xs">ناموجود</p>
                    <p className="text-xl font-bold text-red-400 mt-1">{outOfStock}</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                    <p className="text-purple-500 text-xs">دسته‌بندی‌ها</p>
                    <p className="text-xl font-bold text-purple-400 mt-1">{categories}</p>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                <DataTable
                    data={products}
                    columns={columns}
                    searchPlaceholder="جستجو در محصولات..."
                    pageSize={10}
                    onRowClick={(product) => router.push(`/admin/products/${product.id}/edit`)}
                    emptyMessage="محصولی ثبت نشده است"
                    emptyIcon={CubeIcon}
                />
            </div>
        </div>
    );
}
