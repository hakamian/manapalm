import React, { useState } from 'react';
import { User, UserAddress } from '../../types';
import { MapPinIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XMarkIcon } from '../icons';

interface AddressesTabProps {
    user: User;
    onUpdate: (updatedUser: Partial<User>) => void;
}

const AddressesTab: React.FC<AddressesTabProps> = ({ user, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<UserAddress>>({
        province: '',
        city: '',
        fullAddress: '',
        postalCode: '',
        recipientName: user.fullName || user.name || '',
        phone: user.phone || '',
        title: 'خانه', // 🏠 Default title set to Home
        isDefault: false
    });

    const IRAN_PROVINCES = {
        'تهران': ['تهران', 'ری', 'شمیرانات', 'اسلامشهر', 'بومهن'],
        'اصفهان': ['اصفهان', 'کاشان', 'نجف‌آباد', 'خمینی‌شهر'],
        'خراسان رضوی': ['مشهد', 'نیشابور', 'سبزوار', 'تربت حیدریه'],
        'فارس': ['شیراز', 'مرودشت', 'جهرم', 'فسا'],
        'آذربایجان شرقی': ['تبریز', 'مراغه', 'مرند', 'میانه'],
        'مازندران': ['ساری', 'بابل', 'آمل', 'قائم‌شهر'],
        'البرز': ['کرج', 'فردیس', 'کمال‌شهر'],
        'گیلان': ['رشت', 'بندر انزلی', 'لاهیجان'],
        'خورستان': ['اهواز', 'دزفول', 'آبادان', 'خرمشهر']
    };

    const addresses = user.addresses || [];

    const handleEdit = (address: UserAddress) => {
        setFormData(address);
        setEditingId(address.id);
        setIsEditing(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('آیا از حذف این آدرس اطمینان دارید؟')) {
            const newAddresses = addresses.filter(a => a.id !== id);
            onUpdate({ addresses: newAddresses });
        }
    };

    const handleAddNew = () => {
        setFormData({
            province: '',
            city: '',
            fullAddress: '',
            postalCode: '',
            recipientName: user.fullName || user.name || '',
            phone: user.phone || '',
            title: 'خانه', // 🏠 Set to Home by default
            isDefault: addresses.length === 0
        });
        setEditingId(null);
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!formData.fullAddress || !formData.recipientName || !formData.province || !formData.city) {
            return alert('لطفا تمام فیلدهای اجباری (استان، شهر، آدرس و نام گیرنده) را پر کنید.');
        }

        let newAddresses = [...addresses];

        if (editingId) {
            newAddresses = newAddresses.map(a => a.id === editingId ? { ...a, ...formData } as UserAddress : a);
        } else {
            const newAddress: UserAddress = {
                ...formData as UserAddress,
                id: Date.now().toString(),
            };
            newAddresses.push(newAddress);
        }

        if (formData.isDefault) {
            newAddresses = newAddresses.map(a => ({
                ...a,
                isDefault: a.id === (editingId || newAddresses[newAddresses.length - 1].id)
            }));
        }

        onUpdate({ addresses: newAddresses });
        setIsEditing(false);
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <MapPinIcon className="w-6 h-6 text-green-400" />
                    مدیریت آدرس‌ها
                </h2>
                {!isEditing && (
                    <button
                        onClick={handleAddNew}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        افزودن آدرس جدید
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-gray-700/50 p-6 rounded-lg animate-fade-in text-right" dir="rtl">
                    <h3 className="text-lg font-semibold mb-4 text-green-300">
                        {editingId ? 'ویرایش آدرس' : 'افزودن آدرس جدید'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">عنوان آدرس</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:border-green-500"
                                placeholder="مثال: خانه، محل کار"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">نام گیرنده</label>
                            <input
                                type="text"
                                value={formData.recipientName}
                                onChange={e => setFormData({ ...formData, recipientName: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:border-green-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">استان</label>
                            <select
                                value={formData.province}
                                onChange={e => setFormData({ ...formData, province: e.target.value, city: '' })}
                                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:border-green-500"
                            >
                                <option value="">انتخاب استان</option>
                                {Object.keys(IRAN_PROVINCES).map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">شهر</label>
                            <select
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:border-green-500"
                                disabled={!formData.province}
                            >
                                <option value="">انتخاب شهر</option>
                                {formData.province && IRAN_PROVINCES[formData.province as keyof typeof IRAN_PROVINCES].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm text-gray-400">آدرس پستی کامل</label>
                            <textarea
                                value={formData.fullAddress}
                                onChange={e => setFormData({ ...formData, fullAddress: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:border-green-500 min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">کد پستی</label>
                            <input
                                type="text"
                                value={formData.postalCode}
                                onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:border-green-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">شماره تماس اضطراری</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:border-green-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isDefault ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                            {formData.isDefault && <CheckCircleIcon className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-sm text-gray-300">تنظیم به عنوان آدرس پیش‌فرض</span>
                    </div>

                    <div className="flex justify-start gap-3 flex-row-reverse">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                            انصراف
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-900/20 transition-all hover:scale-105"
                        >
                            ثبت آدرس
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {addresses.length > 0 ? (
                        addresses.map(address => (
                            <div key={address.id} className="bg-gray-700/30 p-5 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors relative group">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-bold text-lg text-white">{address.title}</h4>
                                            {address.isDefault && (
                                                <span className="text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded border border-green-800/50">پیش‌فرض</span>
                                            )}
                                        </div>
                                        <p className="text-gray-300 leading-relaxed text-sm">
                                            {address.province}، {address.city}، {address.fullAddress}
                                        </p>
                                        <div className="flex gap-6 text-sm text-gray-400 pt-2">
                                            <span className="flex items-center gap-1">
                                                <MapPinIcon className="w-3 h-3" />
                                                کد پستی: {address.postalCode}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="opacity-70">گیرنده:</span> {address.recipientName}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="opacity-70">تماس:</span> {address.phone}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 left-4 md:static md:opacity-100">
                                        <button
                                            onClick={() => handleEdit(address)}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded bg-gray-700 md:bg-transparent"
                                            title="ویرایش"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(address.id)}
                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded bg-gray-700 md:bg-transparent"
                                            title="حذف"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                <MapPinIcon className="w-8 h-8 text-gray-500" />
                            </div>
                            <p className="text-gray-400 mb-2">هنوز آدرسی ثبت نکرده‌اید.</p>
                            <p className="text-sm text-gray-500 mb-6">برای ارسال سفارشات، لطفا آدرس خود را ثبت کنید.</p>
                            <button
                                onClick={handleAddNew}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                ثبت اولین آدرس
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AddressesTab;
