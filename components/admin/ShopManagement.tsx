
import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { useAppState } from '../../AppContext';
import { dbAdapter } from '../../services/dbAdapter';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, CheckCircleIcon, XMarkIcon } from '../icons';
import Modal from '../Modal';
import CloudinaryUploadWidget from '../ui/CloudinaryUploadWidget';

// Shop Management Component - Retry Creation
const ShopManagement: React.FC = () => {
    const { products: initialProducts } = useAppState(); 
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
    const [isCreating, setIsCreating] = useState(false);

    const categories = ['نخل میراث', 'محصولات خرما', 'صنایع دستی', 'محصولات دیجیتال', 'ارتقا'];

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setIsLoading(true);
        const fetchedProducts = await dbAdapter.getAllProducts();
        setProducts(fetchedProducts);
        setIsLoading(false);
    };

    const handleCreateNew = () => {
        setIsCreating(true);
        setEditingProduct({
            name: '',
            price: 0,
            category: 'محصولات خرما',
            type: 'physical',
            stock: 100,
            points: 0,
            description: '',
            image: '',
            tags: []
        });
        setIsEditModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setIsCreating(false);
        setEditingProduct({ ...product });
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('آیا از حذف این محصول مطمئن هستید؟')) {
            try {
                await dbAdapter.deleteProduct(id);
                setProducts(products.filter(p => p.id !== id));
            } catch (error) {
                alert('خطا در حذف محصول.');
            }
        }
    };

    const handleSave = async () => {
        if (!editingProduct.name || !editingProduct.price) {
            alert('نام و قیمت الزامی است.');
            return;
        }

        try {
            if (isCreating) {
                const newProduct = await dbAdapter.createProduct(editingProduct as any);
                if (newProduct) {
                    setProducts([newProduct, ...products]);
                }
            } else if (editingProduct.id) {
                await dbAdapter.updateProduct(editingProduct.id, editingProduct);
                setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...editingProduct } : p));
            }
            setIsEditModalOpen(false);
        } catch (error) {
            console.error(error);
            alert('خطا در ذخیره محصول.');
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <PhotoIcon className="w-6 h-6 text-amber-500" />
                    مدیریت فروشگاه و محصولات
                </h2>
                <button 
                    onClick={handleCreateNew}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" /> افزودن محصول جدید
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-10 text-gray-400">در حال بارگذاری محصولات...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm text-gray-300">
                        <thead className="bg-gray-900/50 text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 rounded-r-lg">تصویر</th>
                                <th className="px-4 py-3">نام محصول</th>
                                <th className="px-4 py-3">دسته‌بندی</th>
                                <th className="px-4 py-3">قیمت (تومان)</th>
                                <th className="px-4 py-3">موجودی</th>
                                <th className="px-4 py-3 text-center rounded-l-lg">عملیات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="px-4 py-2">
                                        <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-md" />
                                    </td>
                                    <td className="px-4 py-2 font-semibold text-white">{product.name}</td>
                                    <td className="px-4 py-2">
                                        <span className="bg-gray-700 px-2 py-1 rounded text-xs">{product.category}</span>
                                    </td>
                                    <td className="px-4 py-2 font-mono text-green-400">{product.price.toLocaleString('fa-IR')}</td>
                                    <td className="px-4 py-2">
                                        <span className={`${product.stock === 0 ? 'text-red-400' : 'text-white'}`}>
                                            {product.stock === 0 ? 'ناموجود' : product.stock}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 flex justify-center gap-2">
                                        <button onClick={() => handleEdit(product)} className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-colors">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit/Create Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <div className="w-[90vw] max-w-2xl bg-gray-800 p-6 rounded-2xl border border-gray-700 overflow-y-auto max-h-[90vh]">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                        <h3 className="text-xl font-bold text-white">
                            {isCreating ? 'افزودن محصول جدید' : 'ویرایش محصول'}
                        </h3>
                        <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">نام محصول</label>
                                <input 
                                    type="text" 
                                    value={editingProduct.name} 
                                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-amber-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">دسته‌بندی</label>
                                <select 
                                    value={editingProduct.category} 
                                    onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-amber-500 outline-none"
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">قیمت (تومان)</label>
                                <input 
                                    type="number" 
                                    value={editingProduct.price} 
                                    onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-amber-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">موجودی انبار</label>
                                <input 
                                    type="number" 
                                    value={editingProduct.stock} 
                                    onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-amber-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">تصویر محصول</label>
                                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center bg-gray-700/30">
                                    {editingProduct.image ? (
                                        <div className="relative group">
                                            <img src={editingProduct.image} alt="Preview" className="w-full h-32 object-cover rounded-md mb-2" />
                                            <button onClick={() => setEditingProduct({...editingProduct, image: ''})} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><XMarkIcon className="w-4 h-4"/></button>
                                        </div>
                                    ) : (
                                        <div className="py-4">
                                            <PhotoIcon className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                                            <p className="text-xs text-gray-400">تصویر را آپلود کنید</p>
                                        </div>
                                    )}
                                    <CloudinaryUploadWidget 
                                        onUploadSuccess={(url) => setEditingProduct({...editingProduct, image: url})}
                                        buttonText={editingProduct.image ? "تغییر تصویر" : "آپلود تصویر"}
                                        className="text-xs w-full justify-center bg-stone-600 hover:bg-stone-500"
                                    />
                                    <div className="mt-2">
                                        <span className="text-xs text-gray-500">یا لینک تصویر:</span>
                                        <input 
                                            type="text" 
                                            value={editingProduct.image} 
                                            onChange={e => setEditingProduct({...editingProduct, image: e.target.value})}
                                            className="w-full bg-gray-700 border border-gray-600 rounded p-1 text-xs text-white mt-1 dir-ltr"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">امتیاز خرید</label>
                                <input 
                                    type="number" 
                                    value={editingProduct.points} 
                                    onChange={e => setEditingProduct({...editingProduct, points: Number(e.target.value)})}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-amber-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">توضیحات</label>
                        <textarea 
                            value={editingProduct.description}
                            onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                            rows={4}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-amber-500 outline-none"
                        />
                    </div>

                    {editingProduct.category === 'محصولات دیجیتال' && (
                        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                            <h4 className="font-bold text-blue-300 text-sm mb-2">تنظیمات فایل دیجیتال</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    type="text" 
                                    placeholder="لینک دانلود فایل"
                                    value={editingProduct.downloadUrl || ''}
                                    onChange={e => setEditingProduct({...editingProduct, downloadUrl: e.target.value})}
                                    className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-xs dir-ltr"
                                />
                                <input 
                                    type="text" 
                                    placeholder="فرمت فایل (ZIP, PDF...)"
                                    value={editingProduct.fileType || ''}
                                    onChange={e => setEditingProduct({...editingProduct, fileType: e.target.value})}
                                    className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white text-xs dir-ltr"
                                />
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-700">
                        <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors">
                            انصراف
                        </button>
                        <button onClick={handleSave} className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold transition-colors flex items-center gap-2">
                            <CheckCircleIcon className="w-5 h-5" />
                            ذخیره محصول
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ShopManagement;
