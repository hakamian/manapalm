import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import {
    ShoppingCartIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    PhotoIcon,
    CheckCircleIcon,
    XMarkIcon
} from '../icons';
import '../../styles/admin-dashboard.css';

interface ModernShopManagementProps {
    products: Product[];
    onUpdateProduct?: (productId: string, data: Partial<Product>) => void;
    onDeleteProduct?: (productId: string) => void;
    onCreateProduct?: (product: Partial<Product>) => void;
}

type ViewMode = 'grid' | 'list';
type FilterCategory = 'all' | string;

const ModernShopManagement: React.FC<ModernShopManagementProps> = ({
    products = [],
    onUpdateProduct,
    onDeleteProduct,
    onCreateProduct
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return ['all', ...Array.from(cats)];
    }, [products]);

    // Filtered products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch =
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = filterCategory === 'all' || product.category === filterCategory;

            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, filterCategory]);

    // Statistics
    const stats = useMemo(() => {
        const total = products.length;
        const inStock = products.filter(p => (p.stock || 0) > 0).length;
        const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < 10).length;
        const outOfStock = products.filter(p => (p.stock || 0) === 0).length;

        return { total, inStock, lowStock, outOfStock };
    }, [products]);

    const handleToggleProduct = (productId: string) => {
        const newSelected = new Set(selectedProducts);
        if (newSelected.has(productId)) {
            newSelected.delete(productId);
        } else {
            newSelected.add(productId);
        }
        setSelectedProducts(newSelected);
    };

    const handleExportProducts = () => {
        const csv = [
            ['نام', 'دسته‌بندی', 'قیمت', 'موجودی', 'امتیاز'].join(','),
            ...filteredProducts.map(p =>
                [p.name, p.category, p.price, p.stock || 0, p.points || 0].join(',')
            )
        ].join('\n');

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const formatPrice = (price: number) => {
        return price.toLocaleString('fa-IR') + ' تومان';
    };

    // ... inside ModernShopManagement
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editForm, setEditForm] = useState<Partial<Product>>({});

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setEditForm({ ...product });
    };

    const handleSaveEdit = () => {
        if (editingProduct && onUpdateProduct) {
            onUpdateProduct(editingProduct.id, editForm);
        }
        setEditingProduct(null);
        // Show success/toast (omitted for brevity)
    };

    return (
        <div className="admin-container" style={{ padding: '2rem' }}>
            {/* ... Existing header and stats ... */}
            <div className="admin-animate-fade-in" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h1 className="admin-heading-1" style={{ marginBottom: '0.5rem' }}>
                            مدیریت محصولات
                        </h1>
                        {/* ... */}
                    </div>
                    {/* ... */}
                </div>
                {/* ... Stats ... */}
            </div>

            {/* ... Filters ... */}

            {/* Products Grid */}
            <div
                className="admin-animate-fade-in"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.5rem'
                }}
            >
                {filteredProducts.map((product) => (
                    <div key={product.id} className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                        {/* Image Area */}
                        <div style={{
                            height: '200px',
                            background: product.image ? `url(${product.image}) center/cover` : 'var(--admin-bg-tertiary)',
                            position: 'relative'
                        }}>
                            {/* ... badges ... */}
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            {/* ... info ... */}
                            <h3 className="admin-heading-3">{product.name}</h3>
                            {/* ... price/stock ... */}

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <button
                                    onClick={() => handleEditClick(product)}
                                    className="admin-btn admin-btn-primary"
                                    style={{ flex: 1, padding: '0.5rem' }}
                                >
                                    <PencilIcon className="w-4 h-4" />
                                    ویرایش
                                </button>
                                {/* ... delete ... */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* EDIT MODAL */}
            {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                            <h2 className="text-xl font-bold text-white">ویرایش محصول: {editingProduct.name}</h2>
                            <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Image Input Section */}
                            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 border-dashed">
                                <label className="block text-sm font-medium text-gray-300 mb-2">لینک تصویر (Image URL)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={editForm.image || ''}
                                        onChange={e => setEditForm({ ...editForm, image: e.target.value })}
                                        className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 outline-none dir-ltr"
                                        placeholder="https://..."
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">لینک کپی شده از استودیو هوش مصنوعی را اینجا قرار دهید.</p>

                                {editForm.image && (
                                    <div className="mt-4 relative h-40 rounded-lg overflow-hidden border border-gray-700">
                                        <img src={editForm.image} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">نام محصول</label>
                                    <input
                                        type="text"
                                        value={editForm.name || ''}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">دسته‌بندی</label>
                                    <input
                                        type="text"
                                        value={editForm.category || ''}
                                        onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">قیمت (تومان)</label>
                                    <input
                                        type="number"
                                        value={editForm.price || 0}
                                        onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white dir-ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">موجودی</label>
                                    <input
                                        type="number"
                                        value={editForm.stock || 0}
                                        onChange={e => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white dir-ltr"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">توضیحات</label>
                                <textarea
                                    rows={4}
                                    value={editForm.description || ''}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-700 bg-gray-800 sticky bottom-0 flex justify-end gap-3 z-10">
                            <button
                                onClick={() => setEditingProduct(null)}
                                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                            >
                                انصراف
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg shadow-green-900/40 transition-all transform active:scale-95"
                            >
                                ذخیره تغییرات
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModernShopManagement;
