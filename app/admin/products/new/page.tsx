'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch } from '@/AppContext';
import {
    ArrowRightIcon,
    PhotoIcon,
    CubeIcon,
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

export default function NewProductPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'heritage',
        type: 'heritage',
        description: '',
        imageUrl: '',
        stock: '999',
        points: '100',
        isActive: true,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));

        if (name === 'imageUrl') {
            setPreviewUrl(value);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const newProduct = {
            id: `p_${Date.now()}`,
            name: formData.name,
            price: parseInt(formData.price) || 0,
            category: formData.category,
            type: formData.type,
            description: formData.description,
            imageUrl: formData.imageUrl,
            stock: parseInt(formData.stock) || 0,
            points: parseInt(formData.points) || 0,
            isActive: formData.isActive,
        };

        // In a real app, this would call an API
        dispatch({ type: 'ADD_PRODUCT', payload: newProduct });

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
                    <h1 className="text-xl font-bold text-white">افزودن محصول جدید</h1>
                    <p className="text-stone-500 text-sm">اطلاعات محصول را وارد کنید</p>
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
                                    placeholder="نام محصول را وارد کنید"
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
                                        placeholder="۰"
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
                                        placeholder="۰"
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
                                    placeholder="توضیحات محصول..."
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
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Preview */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <h3 className="text-lg font-semibold text-white mb-4">پیش‌نمایش</h3>
                        <div className="aspect-square bg-stone-800 rounded-xl overflow-hidden flex items-center justify-center">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-stone-600">
                                    <PhotoIcon className="w-12 h-12 mx-auto mb-2" />
                                    <p className="text-sm">آدرس تصویر را وارد کنید</p>
                                </div>
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
                                    placeholder="۰"
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
                                ذخیره محصول
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
