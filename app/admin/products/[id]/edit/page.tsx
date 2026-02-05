'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppState, useAppDispatch } from '@/AppContext';
import {
    ArrowRightIcon,
    PhotoIcon,
    CubeIcon,
    TrashIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

const categories = [
    { value: 'heritage', label: 'نخل میراث' },
    { value: 'digital', label: 'محصول دیجیتال' },
    { value: 'organic', label: 'محصولات ارگانیک' },
    { value: 'handicraft', label: 'صنایع دستی' },
    { value: 'service', label: 'خدمات' },
];

const productTypes = [
    { value: 'physical', label: 'فیزیکی' },
    { value: 'digital', label: 'دیجیتال' },
    { value: 'heritage', label: 'میراث' },
    { value: 'service', label: 'خدمات' },
];

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const { products = [] } = useAppState();
    const dispatch = useAppDispatch();

    const productId = params?.id as string;
    const product = useMemo(() => products.find(p => p.id === productId), [products, productId]);

    const [formData, setFormData] = useState({
        name: product?.name || '',
        price: product?.price?.toString() || '',
        category: product?.category || 'heritage',
        type: product?.type || 'heritage',
        description: product?.description || '',
        imageUrl: product?.imageUrl || product?.image_url || '',
        stock: product?.stock?.toString() || '999',
        points: product?.points?.toString() || '100',
        isActive: product?.isActive ?? product?.is_active ?? true,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <XCircleIcon className="w-16 h-16 text-stone-600 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">محصول یافت نشد</h2>
                <p className="text-stone-500 mb-6">محصول مورد نظر وجود ندارد یا حذف شده است.</p>
                <button onClick={() => router.push('/admin/products')} className="text-emerald-500 hover:text-emerald-400">
                    بازگشت به لیست محصولات
                </button>
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const updatedProduct = {
            ...product,
            name: formData.name,
            price: parseInt(formData.price) || 0,
            category: formData.category,
            type: formData.type,
            description: formData.description,
            imageUrl: formData.imageUrl,
            image_url: formData.imageUrl,
            stock: parseInt(formData.stock) || 0,
            points: parseInt(formData.points) || 0,
            isActive: formData.isActive,
            is_active: formData.isActive,
        };

        dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });

        setTimeout(() => {
            router.push('/admin/products');
        }, 500);
    };

    return (
        <div className="space-y-6">
            {/* Back Button & Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                    <ArrowRightIcon className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white">ویرایش محصول</h1>
                    <p className="text-stone-500 text-sm">{product.name}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4">اطلاعات اصلی</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-2">نام محصول *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white 
                                               placeholder:text-stone-600 focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">قیمت (تومان) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white 
                                                   placeholder:text-stone-600 focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">موجودی</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white 
                                                   placeholder:text-stone-600 focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">دسته‌بندی</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white 
                                                   focus:outline-none focus:border-emerald-500/50"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value} className="bg-stone-900">{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">نوع محصول</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white 
                                                   focus:outline-none focus:border-emerald-500/50"
                                    >
                                        {productTypes.map(type => (
                                            <option key={type.value} value={type.value} className="bg-stone-900">{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-2">توضیحات</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white 
                                               placeholder:text-stone-600 focus:outline-none focus:border-emerald-500/50 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4">تصویر محصول</h3>
                        <div>
                            <label className="block text-sm font-medium text-stone-400 mb-2">آدرس تصویر (URL)</label>
                            <input
                                type="url"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white 
                                           placeholder:text-stone-600 focus:outline-none focus:border-emerald-500/50"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Preview */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4">تصویر فعلی</h3>
                        <div className="aspect-square bg-stone-800 rounded-xl overflow-hidden flex items-center justify-center">
                            {formData.imageUrl ? (
                                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <PhotoIcon className="w-12 h-12 text-stone-600" />
                            )}
                        </div>
                    </div>

                    {/* Points & Status */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4">تنظیمات</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-2">امتیاز محصول</label>
                                <input
                                    type="number"
                                    name="points"
                                    value={formData.points}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white 
                                               placeholder:text-stone-600 focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500/20"
                                />
                                <span className="text-stone-400">محصول فعال باشد</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                در حال ذخیره...
                            </>
                        ) : (
                            <>
                                <CubeIcon className="w-5 h-5" />
                                ذخیره تغییرات
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
